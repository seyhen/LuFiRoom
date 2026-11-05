import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, MeshBasicMaterial, type Group, type Mesh, type Sprite } from 'three'
import { TAU, rand, smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
import { dn, mix, paintFlakes, paintWhiteout, rgb, rr, seeded, skyWx, snowFill, snowLine, usePainted, weathered, type RGB, type Wx } from '../paint'
import { Part, SPH, cyl, noRay, rbox, worldUV } from '../parts'
import { LIVE } from '../Static'
import { glowTex } from '../textures'
import { FlashVeil } from '../objects/FlashVeil'
import { ViewFlakes } from '../objects/ViewFlakes'
import { useEvery } from '../life'
import { snowTop } from '../snowTop'
import { gummy } from '../materials'
import { L } from './materials'
import { puddleTex, rainTex, ringTex } from './textures'

// Dehors, derrière la vitrine : le trottoir mouillé (z de -3,32 à -4,0), la bordure, la chaussée (jusqu'à -4,6), et la façade d'en
// face, peinte. Ce qui est derrière le mur glisse vers la droite et monte à l'écran (la caméra regarde d'en haut, depuis la droite) :
// un point à la profondeur d se voit à x + d sur le mur. Tout reste à x < 3,2 − d (sinon il dépasse de la pièce) et la façade sous
// 4,35 − 0,8 d (le haut du mur la cache au-delà).

const FACADE = { x0: -3.1, x1: 1.8, y1: 2.9, z: -4.6 }
const ROAD = { z0: -4.02, z1: -4.6, y: -0.1 }
const LAMP = { x: -0.62, z: -3.72, h: 2.55 }

// le dehors reçoit la neige sur ce qui regarde le ciel
const paving = snowTop(L.paving.clone(), 1, 0.5, 0.8)
const curb = snowTop(L.curb.clone(), 1, 0.5, 0.8)
const iron = snowTop(L.iron.clone(), 0.8)
const puddleOut = gummy(0x46545e, { map: puddleTex, alphaMap: puddleTex, roughness: 0.02, clearcoat: 1, transparent: true, opacity: 0.75, depthWrite: false })
const binRing = gummy(0x3f7a5a, { roughness: 0.4, clearcoat: 0.6 })
const binBag = gummy(0xe8f0f2, { roughness: 0.15, clearcoat: 1, transparent: true, opacity: 0.55, depthWrite: false })
const bollard = snowTop(gummy(0x4a3a30, { roughness: 0.45, clearcoat: 0.6 }), 0.8)
const crossMat = new MeshBasicMaterial({ color: 0x46e08a })
const headMat = new MeshBasicMaterial({ color: 0xffe9b0 })

// Couleurs [jour, nuit] de la rue d'en face.
const P = {
  stone: ['#c8c0b2', '#3a3f58'], stoneDark: ['#a9a194', '#2a2e44'], ledge: ['#ddd6ca', '#4a5070'],
  win: ['#6d7a88', '#1a2036'], winLit: ['#7d8a98', '#ffc477'], shutter: ['#8e969c', '#33384a'], shutterLine: ['#7a8288', '#262a3a'],
  bakery: ['#8a3a3a', '#3a1c26'], bakeryInk: ['#f3e6cc', '#a89a86'], door: ['#3f5a4a', '#18261f'],
  pharma: ['#e9f1ea', '#cfeedd'], pharmaBand: ['#2f8a5a', '#1e6a46'], pharmaInk: ['#ffffff', '#c8ffe0'], walkway: ['#9a9a96', '#2c3044'],
  asphalt: ['#4a5258', '#14181f'], line: ['#e6e6df', '#7a7e88'],
} as const
type K = keyof typeof P

/** La façade d'en face, peinte (1024 × 608 pour 4,9 × 2,9 unités) : une boulangerie au rideau baissé, une porte cochère, la pharmacie. */
function drawFacade(x: CanvasRenderingContext2D, n: number, r: number, w: Wx) {
  const W = 1024, H = 608, U = W / 4.9 // pixels par unité
  const col = (k: K, far = 0.2): RGB => weathered(mix(dn(P[k], n), dn(['#9aa4ae', '#232842'], n), r * 0.18), w, far)
  const X = (wx: number) => (wx - FACADE.x0) * U, Y = (wy: number) => (FACADE.y1 - wy) * U
  const rnd = seeded(8)
  // le mur de pierre de taille et ses joints
  x.fillStyle = rgb(col('stone')); x.fillRect(0, 0, W, H)
  x.strokeStyle = rgb(col('stoneDark'), 0.6); x.lineWidth = 2
  for (let yy = Y(2.9); yy < Y(0); yy += 0.28 * U) { x.beginPath(); x.moveTo(0, yy); x.lineTo(W, yy); x.stroke() }
  // l'étage : trois hautes fenêtres à garde-corps, l'une allumée la nuit, et le bandeau de pierre
  x.fillStyle = rgb(col('ledge')); x.fillRect(0, Y(1.72), W, 0.07 * U)
  snowLine(x, [[0, Y(1.72)], [W, Y(1.72)]], 6, w)
  for (const [cx, lit] of [[-2.35, 0], [-0.95, 1], [0.55, 0]] as const) {
    const wx0 = X(cx - 0.32), wy0 = Y(2.75), ww = 0.64 * U, wh = 0.86 * U
    const glow = lit ? n * (1 - w.s * 0.4) : 0
    x.fillStyle = rgb(mix(col('win'), dn(['#7d8a98', '#ffc477'], 1), glow)); rr(x, wx0, wy0, ww, wh, 6); x.fill()
    if (glow > 0.05) { x.fillStyle = `rgba(255,150,90,${(0.35 * glow).toFixed(2)})`; x.fillRect(wx0 + ww * 0.55, wy0, ww * 0.45, wh) } // le rideau
    x.strokeStyle = rgb(col('ledge')); x.lineWidth = 5; x.strokeRect(wx0, wy0, ww, wh)
    x.lineWidth = 3; x.beginPath(); x.moveTo(wx0 + ww / 2, wy0); x.lineTo(wx0 + ww / 2, wy0 + wh); x.stroke()
    // le garde-corps de fonte
    x.strokeStyle = rgb(mix(col('door'), [20, 20, 30], 0.4)); x.lineWidth = 2.5
    x.strokeRect(wx0 - 6, wy0 + wh - 0.28 * U, ww + 12, 0.28 * U)
    for (let k = 0; k < 9; k++) { const px = wx0 - 6 + (k / 8) * (ww + 12); x.beginPath(); x.moveTo(px, wy0 + wh - 0.28 * U); x.lineTo(px, wy0 + wh); x.stroke() }
    snowLine(x, [[wx0 - 8, wy0 + wh - 0.28 * U], [wx0 + ww + 8, wy0 + wh - 0.28 * U]], 4, w)
  }
  // la boulangerie, fermée : le bandeau, le rideau de fer ondulé baissé
  x.fillStyle = rgb(col('bakery')); x.fillRect(X(-3.0), Y(1.5), X(-1.75) - X(-3.0), 0.26 * U)
  x.fillStyle = rgb(col('bakeryInk')); x.font = `800 ${Math.round(0.115 * U)}px Georgia, serif`; x.textAlign = 'center'
  x.fillText('Boulangerie', X(-2.37), Y(1.31))
  snowLine(x, [[X(-3.0), Y(1.5)], [X(-1.75), Y(1.5)]], 5, w)
  x.fillStyle = rgb(col('shutter')); x.fillRect(X(-3.05), Y(1.22), X(-1.75) - X(-3.05), Y(0.06) - Y(1.22))
  x.strokeStyle = rgb(col('shutterLine')); x.lineWidth = 2
  for (let yy = Y(1.22) + 6; yy < Y(0.06); yy += 9) { x.beginPath(); x.moveTo(X(-3.05), yy); x.lineTo(X(-1.75), yy); x.stroke() }
  // un tag discret sur le rideau
  x.strokeStyle = rgb(mix(col('shutter'), [90, 200, 180], 0.5), 0.8); x.lineWidth = 5; x.lineCap = 'round'
  x.beginPath(); x.moveTo(X(-2.8), Y(0.45)); x.bezierCurveTo(X(-2.6), Y(0.75), X(-2.4), Y(0.2), X(-2.2), Y(0.55)); x.stroke()
  // la porte cochère vert sombre, son imposte, son numéro
  x.fillStyle = rgb(col('stoneDark')); rr(x, X(-1.58), Y(1.62), 0.96 * U, Y(0.04) - Y(1.62), 0.3 * U); x.fill()
  x.fillStyle = rgb(col('door')); rr(x, X(-1.5), Y(1.55), 0.8 * U, Y(0.06) - Y(1.55), 0.26 * U); x.fill()
  x.strokeStyle = rgb(mix(col('door'), [255, 255, 255], 0.15)); x.lineWidth = 3
  x.beginPath(); x.moveTo(X(-1.1), Y(1.3)); x.lineTo(X(-1.1), Y(0.06)); x.stroke()
  for (const px of [-1.4, -0.8]) x.strokeRect(X(px) - 0.12 * U, Y(1.0), 0.24 * U, 0.6 * U)
  x.fillStyle = rgb(dn(['#2a63b8', '#1a3a6a'], n)); rr(x, X(-0.5) - 10, Y(1.2), 24, 18, 4); x.fill()
  x.fillStyle = '#ffffff'; x.font = `800 12px sans-serif`; x.fillText('12', X(-0.5) + 2, Y(1.2) + 14)
  // la pharmacie : sa vitrine éclairée de blanc-vert, son bandeau, ses étagères de flacons
  const pg = n * (1 - w.s * 0.3)
  x.fillStyle = rgb(col('pharmaBand')); x.fillRect(X(-0.45), Y(1.5), X(1.8) - X(-0.45), 0.24 * U)
  x.fillStyle = rgb(col('pharmaInk')); x.font = `900 ${Math.round(0.14 * U)}px sans-serif`
  x.fillText('PHARMACIE', X(0.6), Y(1.32))
  snowLine(x, [[X(-0.45), Y(1.5)], [X(1.8), Y(1.5)]], 5, w)
  x.fillStyle = rgb(mix(col('pharma'), [255, 255, 255], pg * 0.25)); rr(x, X(-0.38), Y(1.2), X(1.75) - X(-0.38), Y(0.12) - Y(1.2), 6); x.fill()
  for (let s = 0; s < 3; s++) {
    const sy = Y(0.35 + s * 0.3)
    x.fillStyle = rgb(mix(col('stoneDark'), [255, 255, 255], 0.3)); x.fillRect(X(-0.3), sy, X(1.7) - X(-0.3), 4)
    for (let k = 0; k < 16; k++) {
      const bx = X(-0.25) + k * 0.12 * U + rnd() * 6, bh = (0.08 + rnd() * 0.1) * U
      x.fillStyle = ['#7fc6e8', '#f4a6c6', '#f6d77a', '#9fe0c4', '#ffffff'][k % 5]
      rr(x, bx, sy - bh, 0.07 * U, bh, 3); x.fill()
    }
  }
  if (pg > 0.05) {
    const hg = x.createRadialGradient(X(0.6), Y(0.7), 10, X(0.6), Y(0.7), 1.2 * U)
    hg.addColorStop(0, `rgba(170,255,210,${(0.28 * pg).toFixed(2)})`); hg.addColorStop(1, 'rgba(170,255,210,0)')
    x.fillStyle = hg; x.fillRect(X(-0.6), Y(1.5), 2.6 * U, 1.5 * U)
  }
  // le trottoir d'en face, au pied de la façade
  x.fillStyle = rgb(col('walkway')); x.fillRect(0, Y(0.08), W, H - Y(0.08))
  snowFill(x, () => x.rect(0, Y(0.08), W, H - Y(0.08)), w)
  // la lumière du réverbère, qui éclaire la façade derrière lui
  const lamp = Math.max(n, r * 0.4) * (1 - w.s * 0.3)
  if (lamp > 0.02) {
    const lg = x.createRadialGradient(X(LAMP.x - 0.6), Y(2.1), 10, X(LAMP.x - 0.6), Y(2.1), 1.6 * U)
    lg.addColorStop(0, `rgba(255,190,110,${(0.32 * lamp).toFixed(2)})`); lg.addColorStop(1, 'rgba(255,190,110,0)')
    x.fillStyle = lg; x.fillRect(0, 0, W, H)
  }
  // le voile de pluie, la brume de neige
  if (r > 0.01) { x.fillStyle = rgb(skyWx(dn(['#aab4bf', '#1b2140'], n), w), 0.18 * r); x.fillRect(0, 0, W, H) }
  paintWhiteout(x, W, H, w, 0.5, 0.3)
  paintFlakes(x, W, H, w, 12)
}

/** La chaussée, peinte : l'asphalte, le passage piéton, et les reflets étirés de la pharmacie et du réverbère quand c'est mouillé. */
function drawRoad(x: CanvasRenderingContext2D, n: number, r: number, w: Wx) {
  const W = 1024, H = 128, U = W / 4.9
  const X = (wx: number) => (wx - FACADE.x0) * U
  x.fillStyle = rgb(weathered(dn(P.asphalt, n), w)); x.fillRect(0, 0, W, H)
  const rnd = seeded(4)
  for (let i = 0; i < 500; i++) { x.fillStyle = rnd() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.12)'; x.fillRect(rnd() * W, rnd() * H, 2, 2) }
  // le passage piéton, devant la porte de la laverie
  x.fillStyle = rgb(dn(P.line, n), 0.85)
  for (let k = 0; k < 6; k++) x.fillRect(X(-0.2) + k * 0.2 * U, 6, 0.11 * U, H - 12)
  // les reflets : de longues traînées verticales (vers nous), d'autant plus nettes que c'est mouillé
  const wet = r * (1 - w.s * 0.7)
  const streak = (wx: number, c: string, a: number, wd: number) => {
    if (a < 0.01) return
    const g = x.createLinearGradient(0, 0, 0, H)
    g.addColorStop(0, `rgba(${c},${a.toFixed(2)})`); g.addColorStop(1, `rgba(${c},0)`)
    x.fillStyle = g
    for (let k = 0; k < 5; k++) x.fillRect(X(wx) - wd / 2 + (rnd() - 0.5) * wd * 0.4, 0, wd * (0.4 + rnd() * 0.6), H)
  }
  streak(0.3, '120,255,170', (0.25 + 0.5 * n) * wet, 26)
  streak(LAMP.x, '255,200,120', (0.15 + 0.55 * n) * wet, 34)
  streak(0.6, '220,255,235', 0.3 * n * wet, 60)
  streak(-0.95, '255,190,120', 0.3 * n * wet, 18)
  snowFill(x, () => x.rect(0, 0, W, H), w, 0.85)
}

/** Les traits de pluie qui tombent devant la façade : deux plans (près, loin), visibles seulement quand il pleut. */
function RainSheet({ p, size, rep, speed, k }: { p: [number, number, number]; size: [number, number]; rep: [number, number]; speed: number; k: number }) {
  const mat = useMemo(() => {
    const t = rainTex.clone()
    t.needsUpdate = true
    t.repeat.set(...rep)
    return new MeshBasicMaterial({ map: t, transparent: true, opacity: 0, depthWrite: false })
  }, [rep[0], rep[1]])
  const ref = useRef<Mesh>(null!)
  useFrame((_, delta) => {
    const wet = mood.rain * (1 - mood.snow)
    ref.current.visible = wet > 0.02
    if (!ref.current.visible) return
    mat.opacity = wet * k
    if (!reduceMotion) {
      mat.map!.offset.y += Math.min(delta, 0.05) * speed * (1 + mood.storm * 0.6)
      mat.map!.offset.x += Math.min(delta, 0.05) * speed * 0.1 * mood.storm
    }
  })
  return (
    <mesh ref={ref} material={mat} position={p} userData={LIVE} visible={false} raycast={noRay}>
      <planeGeometry args={size} />
    </mesh>
  )
}

// les flaques du trottoir, là où la pluie fait des ronds
const PUDDLES: [number, number, number, number][] = [[-1.55, -3.62, 0.34, 0.16], [0.35, -3.78, 0.26, 0.12], [1.55, -3.6, 0.3, 0.14]]

/** Les ronds dans les flaques du trottoir : de petits anneaux qui s'ouvrent et s'effacent, seulement sous la pluie. */
function Ripples() {
  const g = useRef<Group>(null!)
  const rings = useMemo(() => Array.from({ length: 7 }, (_, i) => ({ age: rand(0, 1), life: rand(0.7, 1.1), pud: i % PUDDLES.length, ox: 0, oz: 0 })), [])
  const mats = useMemo(() => rings.map(() => new MeshBasicMaterial({ map: ringTex, transparent: true, opacity: 0, depthWrite: false })), [rings])
  useFrame((_, delta) => {
    const wet = mood.rain * (1 - mood.snow)
    g.current.visible = wet > 0.05 && !reduceMotion
    if (!g.current.visible) return
    rings.forEach((r, i) => {
      r.age += Math.min(delta, 0.05) / r.life
      if (r.age >= 1) {
        r.age = 0
        r.pud = Math.floor(rand(0, PUDDLES.length))
        const [, , rx, rz] = PUDDLES[r.pud]
        const a = rand(0, TAU), k = Math.sqrt(rand(0, 0.6))
        r.ox = Math.cos(a) * rx * k
        r.oz = Math.sin(a) * rz * k
      }
      const m = g.current.children[i] as Mesh, [px, pz] = PUDDLES[r.pud]
      m.position.set(px + r.ox, 0.012, pz + r.oz)
      m.scale.setScalar(0.03 + r.age * 0.12)
      mats[i].opacity = (1 - r.age) * 0.7 * wet
    })
  })
  return (
    <group ref={g} userData={LIVE} visible={false}>
      {mats.map((m, i) => (
        <mesh key={i} material={m} rotation-x={-Math.PI / 2} raycast={noRay}>
          <planeGeometry args={[1, 1]} />
        </mesh>
      ))}
    </group>
  )
}

/**
 * Le réverbère du trottoir : un mât gris, une crosse courbe qui avance au-dessus de la chaussée, une lanterne plate au verre
 * ambré (la lumière de sodium des rues la nuit), son halo. Il s'allume sous la pluie, éclate la nuit.
 */
function StreetLamp() {
  const halo = useRef<Sprite>(null!), pool = useRef<Mesh>(null!)
  useFrame(() => {
    const k = Math.max(smooth(mood.night), mood.rain * 0.35)
    halo.current.material.opacity = 0.08 + k * 0.6
    ;(pool.current.material as MeshBasicMaterial).opacity = k * 0.35
  })
  const { x, z, h } = LAMP
  return (
    <group raycast={noRay}>
      <Part geo={cyl(0.07, 0.09, 0.14, 14)} m={iron} p={[x, 0.07, z]} castShadow={false} />
      <Part geo={cyl(0.035, 0.05, h, 12)} m={iron} p={[x, h / 2, z]} castShadow={false} />
      {/* la crosse : un quart de tore qui tourne vers la chaussée, puis la lanterne */}
      <Part m={iron} p={[x, h, z - 0.25]} rotation={[0, Math.PI / 2, 0]} castShadow={false}>
        <torusGeometry args={[0.25, 0.03, 8, 16, Math.PI / 2]} />
      </Part>
      <Part geo={rbox(0.2, 0.07, 0.36, 0.03)} m={iron} p={[x, h + 0.23, z - 0.42]} castShadow={false} />
      <mesh geometry={rbox(0.15, 0.03, 0.28, 0.012)} material={L.lampGlass} position={[x, h + 0.185, z - 0.42]} raycast={noRay} />
      <sprite ref={halo} scale={1.6} position={[x, h + 0.12, z - 0.38]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0xffc070} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
      {/* la flaque de lumière ambrée sur le trottoir mouillé */}
      <mesh ref={pool} position={[x, 0.008, z - 0.1]} rotation-x={-Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[1.5, 0.8]} />
        <meshBasicMaterial map={glowTex} color={0xffb060} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </mesh>
    </group>
  )
}

/** La croix verte de la pharmacie d'en face, en drapeau sur sa potence : elle luit et se reflète. */
function PharmacyCross() {
  const halo = useRef<Sprite>(null!)
  useFrame(() => {
    const k = Math.max(smooth(mood.night), mood.rain * 0.3)
    halo.current.material.opacity = 0.12 + k * 0.55
    crossMat.color.setHex(0x46e08a).multiplyScalar(0.75 + k * 0.35)
  })
  const at: [number, number, number] = [0.3, 1.82, -4.42]
  return (
    <group position={at} raycast={noRay}>
      <Part geo={rbox(0.03, 0.03, 0.2, 0.01)} m={iron} p={[0, 0.22, -0.08]} castShadow={false} />
      <mesh geometry={rbox(0.05, 0.38, 0.13, 0.025)} material={crossMat} raycast={noRay} />
      <mesh geometry={rbox(0.05, 0.13, 0.38, 0.025)} material={crossMat} raycast={noRay} />
      <sprite ref={halo} scale={1.1} position={[0.05, 0, 0.05]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0x6aff9a} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}

/**
 * Une petite voiture qui passe de loin en loin dans la rue mouillée (une à deux minutes), phares allumés, de la gauche vers la
 * droite : elle entre et sort derrière le mur (là où personne ne la voit apparaître). Rien à dessiner entre deux passages.
 */
function PassingCar() {
  const g = useRef<Group>(null!), st = useRef({ t: -1 })
  const DUR = 4.2, X0 = -3.9, X1 = 1.72, Z = -4.3
  useEvery(55, 110, () => (st.current.t = 0))
  useFrame((_, delta) => {
    const s = st.current
    g.current.visible = s.t >= 0
    if (s.t < 0) return
    s.t += Math.min(delta, 0.05)
    const k = s.t / DUR
    if (k >= 1) { s.t = -1; g.current.visible = false; return }
    g.current.position.set(X0 + (X1 - X0) * k, ROAD.y, Z)
    headMat.color.setHex(0xffe9b0).multiplyScalar(0.8 + smooth(mood.night) * 0.4)
  })
  return (
    <group ref={g} userData={LIVE} visible={false} raycast={noRay}>
      {/* la carrosserie, la cabine, les vitres, les roues ; les phares devant (vers +x), les feux rouges derrière */}
      <mesh geometry={rbox(0.8, 0.2, 0.42, 0.08)} material={L.dispenserBody} position={[0, 0.2, 0]} raycast={noRay} />
      <mesh geometry={rbox(0.48, 0.17, 0.38, 0.07)} material={L.dispenserBody} position={[-0.06, 0.36, 0]} raycast={noRay} />
      <mesh geometry={rbox(0.5, 0.12, 0.39, 0.05)} material={L.frameDark} position={[-0.06, 0.37, 0]} raycast={noRay} />
      {[-0.26, 0.26].flatMap((wx) => [-0.19, 0.19].map((wz) => (
        <mesh key={`${wx}${wz}`} geometry={cyl(0.08, 0.08, 0.06, 14)} material={L.rubber} position={[wx, 0.09, wz]} rotation-x={Math.PI / 2} raycast={noRay} />
      )))}
      {[-0.13, 0.13].map((wz) => (
        <mesh key={wz} geometry={SPH} material={headMat} scale={[0.02, 0.035, 0.05]} position={[0.4, 0.23, wz]} raycast={noRay} />
      ))}
      {[-0.14, 0.14].map((wz) => (
        <mesh key={wz} geometry={SPH} material={L.led} scale={[0.015, 0.025, 0.04]} position={[-0.4, 0.23, wz]} raycast={noRay} />
      ))}
      <sprite scale={[1.4, 0.5, 1]} position={[0.75, 0.22, 0]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0xffe0a0} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.55} />
      </sprite>
      <mesh position={[0.7, 0.012, 0]} rotation-x={-Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[0.9, 0.5]} />
        <meshBasicMaterial map={glowTex} color={0xffd890} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.4} />
      </mesh>
    </group>
  )
}

/**
 * La rue derrière la vitrine, à 2 h du matin : le trottoir de dalles mouillées et ses flaques, la bordure de granit, la chaussée
 * et son passage piéton, la façade d'en face (la boulangerie fermée, la porte cochère, la pharmacie et sa croix verte), le
 * réverbère, une corbeille de rue et deux potelets. Sous la pluie : les traits de pluie, les ronds dans les flaques, les gouttes
 * sur la vitre ; sous la neige, le trottoir et la chaussée blanchissent et les flocons tombent dans la rue.
 */
export function StreetView() {
  const facade = usePainted(1024, 608, drawFacade)
  const road = usePainted(1024, 128, drawRoad)
  return (
    <group>
      {/* le trottoir, la bordure, le caniveau, la chaussée */}
      <Part geo={worldUV(rbox(5.4, 0.08, 0.7, 0.02), 1)} m={paving} p={[-0.45, -0.04, -3.67]} castShadow={false} />
      <Part geo={rbox(5.4, 0.13, 0.12, 0.03)} m={curb} p={[-0.62, -0.045, -4.03]} castShadow={false} />
      <mesh position={[(FACADE.x0 + FACADE.x1) / 2, ROAD.y, (ROAD.z0 + ROAD.z1) / 2]} rotation-x={-Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[FACADE.x1 - FACADE.x0, ROAD.z0 - ROAD.z1]} />
        <meshPhysicalMaterial map={road} roughness={0.15} clearcoat={1} clearcoatRoughness={0.1} />
      </mesh>
      {PUDDLES.map(([px, pz, rx, rz], i) => (
        <mesh key={i} material={puddleOut} position={[px, 0.006, pz]} rotation-x={-Math.PI / 2} raycast={noRay}>
          <planeGeometry args={[rx * 2.2, rz * 2.2]} />
        </mesh>
      ))}
      {/* la façade d'en face */}
      <mesh position={[(FACADE.x0 + FACADE.x1) / 2, FACADE.y1 / 2 - 0.1, FACADE.z]} raycast={noRay}>
        <planeGeometry args={[FACADE.x1 - FACADE.x0, FACADE.y1 + 0.2]} />
        <meshBasicMaterial map={facade} />
      </mesh>
      <PharmacyCross />
      <StreetLamp />
      {/* la corbeille de rue (son cerceau vert, son sac transparent) et deux potelets au bord du trottoir */}
      <group position={[1.08, 0, -3.62]} raycast={noRay}>
        <Part geo={cyl(0.025, 0.03, 0.9, 10)} m={iron} p={[0, 0.45, -0.18]} castShadow={false} />
        <Part m={binRing} p={[0, 0.82, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.16, 0.02, 8, 22]} />
        </Part>
        <Part geo={cyl(0.16, 0.12, 0.42, 18)} m={binBag} p={[0, 0.6, 0]} castShadow={false} />
      </group>
      {[-1.95, -0.1].map((bx) => (
        <group key={bx} position={[bx, 0, -3.92]} raycast={noRay}>
          <Part geo={cyl(0.045, 0.055, 0.6, 12)} m={bollard} p={[0, 0.3, 0]} castShadow={false} />
          <Part geo={SPH} m={bollard} scale={0.05} p={[0, 0.6, 0]} castShadow={false} />
          <Part geo={cyl(0.058, 0.058, 0.04, 12)} m={binRing} p={[0, 0.5, 0]} castShadow={false} />
        </group>
      ))}
      <RainSheet p={[0.1, 1.55, -3.48]} size={[4.6, 3.5]} rep={[3, 2.2]} speed={1.9} k={0.5} />
      <RainSheet p={[-0.7, 1.35, -4.45]} size={[4.9, 2.9]} rep={[4.5, 2.6]} speed={1.3} k={0.38} />
      <Ripples />
      <PassingCar />
      <FlashVeil position={[(FACADE.x0 + FACADE.x1) / 2, 1.4, FACADE.z + 0.02]} size={[FACADE.x1 - FACADE.x0, FACADE.y1]} />
      <ViewFlakes x={[-2.9, 1.85]} y={[0.0, 3.2]} z={[-4.4, -3.45]} n={70} />
    </group>
  )
}
