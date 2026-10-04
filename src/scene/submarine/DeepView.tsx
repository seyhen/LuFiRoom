import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, MeshBasicMaterial, Object3D, SphereGeometry, type InstancedMesh, type Mesh, type PointLight, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach, rand, smooth } from '../../math'
import { canvasTex, dn, poly, rgb, seeded, usePainted } from '../paint'
import { Part, cyl, noRay } from '../parts'
import { mood, reduceMotion } from '../anim'
import { glowTex } from '../textures'
import { ScrollLayer } from '../objects/ScrollLayer'
import { LIVE } from '../Static'
import { S } from './materials'
import { PORT } from './SubShell'
import { fishTex, jellyTex, raysTex, reefTex, whaleTex } from './textures'

// L'abysse par le hublot. Un fond peint (eau qui s'assombrit vers le bas, une épave, le sable, des rochers), posé derrière le mur ;
// devant lui, des rayons de lumière qui se balancent, deux bancs de poissons, deux bandes de varech, des méduses qui pulsent,
// de la neige marine, et, quand on écoute le chant, une baleine qui traverse. Ce qu'on voit par un trou rond du mur remonte et
// glisse vers la droite : le plan est décalé de (-0,65 ; -0,52).
const CX = PORT.x - 0.65, CY = PORT.y - 0.52, Z = -3.8, W = 600, H = 600

const P = {
  top: ['#9be8dc', '#1b6c88'], upper: ['#4cc0c0', '#0f4a6c'], mid: ['#1e86a0', '#08304e'], low: ['#0d4a6c', '#041a30'],
  wreck: ['#2f7f86', '#0a2e44'], wreckDark: ['#1d5f6c', '#061e30'], sand: ['#cfe6b4', '#1f5460'], sandDark: ['#9cc59a', '#123a48'],
  rock: ['#2b6a70', '#0a2a3a'], coral: ['#e8806a', '#7a3a58'], star: ['#f29a52', '#7a4a4a'],
} as const

function draw(x: CanvasRenderingContext2D, n: number) {
  const r = seeded(21), c = (k: keyof typeof P, a = 1) => rgb(dn(P[k], n), a)
  const water = x.createLinearGradient(0, 0, 0, H)
  water.addColorStop(0, c('top')); water.addColorStop(0.28, c('upper')); water.addColorStop(0.62, c('mid')); water.addColorStop(1, c('low'))
  x.fillStyle = water; x.fillRect(0, 0, W, H)
  // une lueur de surface, loin au-dessus
  const sun = x.createRadialGradient(360, 0, 0, 360, 0, 300)
  sun.addColorStop(0, `rgba(255,250,220,${0.55 - n * 0.4})`); sun.addColorStop(1, 'rgba(255,250,220,0)')
  x.fillStyle = sun; x.fillRect(0, 0, W, 320)
  // l'épave d'un galion, couchée sur le flanc, dans la brume bleue : coque, château de poupe, deux mâts brisés
  x.save()
  x.translate(190, 388); x.rotate(-0.12)
  poly(x, [[-70, 40], [-62, -4], [-30, -14], [40, -18], [86, -34], [100, 36], [60, 50], [-20, 52]], c('wreck'))
  poly(x, [[-62, -4], [-70, -30], [-44, -36], [-30, -14]], c('wreckDark'))
  x.strokeStyle = c('wreckDark'); x.lineWidth = 4; x.lineCap = 'round'
  x.beginPath(); x.moveTo(-10, -16); x.lineTo(-18, -92); x.moveTo(48, -20); x.lineTo(70, -74); x.moveTo(-18, -76); x.lineTo(30, -66); x.stroke()
  x.lineWidth = 1.4; x.strokeStyle = c('wreckDark', 0.8)
  x.beginPath(); x.moveTo(-18, -92); x.quadraticCurveTo(14, -52, 70, -74); x.moveTo(-18, -92); x.lineTo(-64, -30); x.stroke()
  x.fillStyle = c('low', 0.7)
  for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(-44 + i * 26, 18, 5, 0, TAU); x.fill() }
  x.restore()
  // la brume bleue qui efface le fond
  const fog = x.createLinearGradient(0, 330, 0, 470)
  fog.addColorStop(0, rgb(dn(P.mid, n), 0)); fog.addColorStop(1, rgb(dn(P.mid, n), 0.5))
  x.fillStyle = fog; x.fillRect(0, 330, W, 140)
  // le sable : des dunes en plans successifs, ridées, et des rochers
  const dune = (y: number, amp: number, col: string, ph: number) => {
    x.fillStyle = col; x.beginPath(); x.moveTo(0, H)
    for (let px = 0; px <= W; px += 10) x.lineTo(px, y + Math.sin(px * 0.012 + ph) * amp + Math.sin(px * 0.031 + ph * 2) * amp * 0.4)
    x.lineTo(W, H); x.closePath(); x.fill()
  }
  dune(448, 9, c('sandDark', 0.9), 1); dune(478, 11, c('sand'), 3)
  x.strokeStyle = c('sandDark', 0.55); x.lineWidth = 1.6
  for (let i = 0; i < 40; i++) { const px = r() * W, py = 484 + r() * 100; x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + 14, py - 3, px + 30, py); x.stroke() }
  for (const [px, py, rad] of [[420, 478, 34], [452, 490, 22], [96, 498, 28], [250, 512, 18]]) {
    x.fillStyle = c('rock'); x.beginPath(); x.ellipse(px, py, rad, rad * 0.62, 0, 0, TAU); x.fill()
    x.fillStyle = rgb(dn(P.rock, n), 0.5); x.beginPath(); x.ellipse(px - rad * 0.2, py - rad * 0.25, rad * 0.5, rad * 0.22, -0.2, 0, TAU); x.fill()
  }
  // des coraux branchus et une étoile de mer sur le sable
  x.strokeStyle = c('coral'); x.lineCap = 'round'
  for (const [px, py, h] of [[470, 480, 50], [345, 500, 40], [150, 506, 34]]) {
    x.lineWidth = 5
    for (const d of [-1, 0, 1]) { x.beginPath(); x.moveTo(px, py); x.quadraticCurveTo(px + d * 12, py - h * 0.5, px + d * 22, py - h); x.stroke(); x.fillStyle = c('coral'); x.beginPath(); x.arc(px + d * 22, py - h, 5, 0, TAU); x.fill() }
  }
  x.fillStyle = c('star')
  x.beginPath()
  for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU - Math.PI / 2, rad = i % 2 ? 4 : 11; x.lineTo(386 + Math.cos(a) * rad, 508 + Math.sin(a) * rad * 0.7) }
  x.closePath(); x.fill()
}

/** Un voile de lumière qui danse : des lignes brillantes qui s'entrecroisent. Se répète. */
const causticDraw = (seed: number) => (x: CanvasRenderingContext2D) => {
  const r = seeded(seed)
  x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256)
  x.lineCap = 'round'
  for (let k = 0; k < 2; k++) {
    for (let i = 0; i < 12; i++) {
      const o = r() * 256, ph = r() * TAU, amp = 6 + r() * 12
      x.strokeStyle = `rgba(190,255,245,${0.35 + r() * 0.4})`; x.lineWidth = 1.2 + r() * 2.4
      x.beginPath()
      for (let s = 0; s <= 256; s += 8) {
        const a = o + Math.sin(s * 0.035 + ph) * amp + Math.sin(s * 0.09 + ph * 2) * amp * 0.4
        k ? x.lineTo(s, a) : x.lineTo(a, s)
      }
      x.stroke()
    }
  }
}
const caustics = [canvasTex(256, 256, causticDraw(5), [2, 2]), canvasTex(256, 256, causticDraw(11), [2.4, 2.4])]

const dot = new SphereGeometry(1, 6, 4)
const dummy = new Object3D()
const SNOW = 60

/** L'abysse : tout ce qu'on voit par le hublot (rien de tout cela ne capte un tap, sauf le hublot lui-même, voir Porthole). */
export function DeepView() {
  const tex = usePainted(W, H, draw)
  const rays = useRef<Mesh>(null!), whale = useRef<Mesh>(null!), patchA = useRef<Mesh>(null!), patchB = useRef<Mesh>(null!)
  const jellies = useRef<Sprite[]>([]), snow = useRef<InstancedMesh>(null!), light = useRef<PointLight>(null!)
  const swim = useRef(0), alpha = useRef(0)
  const dayC = new Color(0x1d5f6e), nightC = new Color(0x03111e)
  const jelly = useMemo(
    () => [
      { x: -0.5, y: 0.3, s: 0.46, c: 0xff9ad8, ph: 0 },
      { x: 0.42, y: 0.52, s: 0.34, c: 0x8ff6ee, ph: 2 },
      { x: 0.18, y: -0.3, s: 0.52, c: 0xc8a0ff, ph: 4 },
      { x: -0.18, y: 0.78, s: 0.22, c: 0x9ff0ff, ph: 1 },
    ],
    [],
  )
  const flakes = useMemo(() => Array.from({ length: SNOW }, () => ({ x: rand(-1.5, 1.5), y: rand(-1.5, 1.5), z: rand(0.04, 0.3), s: rand(0.012, 0.026), v: rand(0.02, 0.06), ph: rand(0, TAU) })), [])
  const snowMat = useMemo(() => new MeshBasicMaterial({ color: 0xe6fff8, transparent: true, opacity: 0.5, depthWrite: false }), [])
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime, dt = Math.min(delta, 0.05), n = smooth(mood.night), still = reduceMotion
    // les rayons se balancent, plus faibles la nuit
    const sway = still ? 0 : Math.sin(t * 0.25) * 0.16
    rays.current.position.x = CX + sway
    ;(rays.current.material as MeshBasicMaterial).opacity = 0.5 - n * 0.36 + (still ? 0 : Math.sin(t * 0.7) * 0.05)
    // les méduses pulsent et dérivent
    jellies.current.forEach((s, i) => {
      const j = jelly[i], u = still ? 0 : t
      s.position.set(CX + j.x + Math.sin(u * 0.23 + j.ph) * 0.12, CY + j.y + Math.sin(u * 0.31 + j.ph * 2) * 0.1, Z + 0.03 + i * 0.002)
      const p = Math.sin(u * 1.9 + j.ph)
      s.scale.set(j.s * 1.2 * (1 - p * 0.08), j.s * 1.5 * (1 + p * 0.1), 1)
      s.material.opacity = 0.8 + n * 0.2
    })
    // la neige marine tombe lentement
    flakes.forEach((f, i) => {
      if (!still) { f.y -= f.v * dt; f.x += Math.sin(t * 0.3 + f.ph) * 0.02 * dt }
      if (f.y < -1.5) f.y = 1.5
      dummy.position.set(CX + f.x, CY + f.y, Z + f.z)
      dummy.scale.setScalar(f.s)
      dummy.updateMatrix()
      snow.current.setMatrixAt(i, dummy.matrix)
    })
    snow.current.instanceMatrix.needsUpdate = true
    snowMat.opacity = 0.4 + n * 0.25
    // la baleine : elle ne nage que pendant le chant, de droite à gauche, et s'éteint au bord du cadre
    const on = isActive(useStore.getState(), 'window')
    alpha.current = approach(alpha.current, on ? 1 : 0, dt * 0.6)
    if (on) swim.current = (swim.current + dt / 30) % 1
    else if (alpha.current <= 0.001) swim.current = 0
    const w = whale.current, edge = Math.min(1, swim.current * 8, (1 - swim.current) * 8)
    w.visible = alpha.current > 0.01
    w.position.set(CX + 2.1 - swim.current * 4.2, CY + 0.28 + (still ? 0 : Math.sin(t * 0.5) * 0.06) + swim.current * 0.15, Z + 0.015)
    w.rotation.z = still ? 0 : Math.sin(t * 0.5 - 1) * 0.035
    const wm = w.material as MeshBasicMaterial
    wm.color.copy(dayC).lerp(nightC, n)
    wm.opacity = alpha.current * edge * (0.85 - n * 0.1)
    // la lumière turquoise du hublot sur le plancher : deux voiles qui glissent en sens contraires, et vacillent
    const shimmer = 0.88 + (still ? 0 : Math.sin(t * 1.3) * 0.07 + Math.sin(t * 2.9) * 0.05)
    light.current.intensity = (1.45 - n * 0.4) * shimmer * Math.PI
    for (const [k, m] of [patchA.current, patchB.current].entries()) {
      const mat = m.material as MeshBasicMaterial
      mat.opacity = (0.34 - n * 0.14) * shimmer
      if (!still) { mat.map!.offset.x = (t * (k ? -0.012 : 0.01)) % 1; mat.map!.offset.y = (t * (k ? 0.008 : -0.011)) % 1 }
    }
  })
  return (
    <group userData={LIVE} raycast={noRay}>
      <mesh position={[CX, CY, Z]} raycast={noRay}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <mesh ref={rays} position={[CX, CY + 0.2, Z + 0.004]} raycast={noRay}>
        <planeGeometry args={[3, 3]} />
        <meshBasicMaterial map={raysTex} color={0xe8fff6} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.5} />
      </mesh>
      <ScrollLayer map={reefTex} position={[CX, CY - 0.88, Z + 0.006]} size={[3, 0.8]} color={[0x2c8a84, 0x0b3c4a]} speed={0.003} />
      <ScrollLayer map={fishTex} position={[CX, CY + 0.12, Z + 0.008]} size={[3, 0.5]} color={[0x2a8294, 0x0a2840]} speed={0.01} bob={[0.03, 0.4]} opacity={[0.55, 0.7]} />
      <ScrollLayer map={fishTex} position={[CX, CY - 0.35, Z + 0.01]} size={[3, 0.36]} color={[0x1a6478, 0x061c30]} speed={-0.016} bob={[0.04, 0.5]} phase={2} opacity={[0.7, 0.8]} />
      <ScrollLayer map={reefTex} position={[CX, CY - 1.08, Z + 0.012]} size={[3, 0.95]} color={[0x0f5a5c, 0x04202c]} speed={-0.006} />
      {jelly.map((j, i) => (
        <sprite key={i} ref={(el) => void (el && (jellies.current[i] = el))} raycast={noRay}>
          <spriteMaterial map={jellyTex} color={j.c} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.6} />
        </sprite>
      ))}
      <mesh ref={whale} position={[CX + 3, CY, Z + 0.015]} raycast={noRay} visible={false}>
        <planeGeometry args={[2.2, 0.86]} />
        <meshBasicMaterial map={whaleTex} transparent depthWrite={false} opacity={0} />
      </mesh>
      <instancedMesh ref={snow} args={[dot, snowMat, SNOW]} frustumCulled={false} raycast={noRay} />
      {/* la lumière du hublot sur le plancher, et sur la pièce */}
      {[0, 1].map((k) => (
        <mesh key={k} ref={k ? patchB : patchA} position={[PORT.x + 0.1, 0.03 + k * 0.002, -1.55]} rotation-x={-Math.PI / 2} raycast={noRay}>
          <planeGeometry args={[2.3, 2.9]} />
          <meshBasicMaterial map={caustics[k]} alphaMap={glowTex} color={0x8ff4e4} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.3} />
        </mesh>
      ))}
      <pointLight ref={light} color={0x7fe8dc} intensity={0} distance={7.5} decay={1.5} position={[PORT.x, PORT.y - 0.2, -2.3]} />
    </group>
  )
}

/** Le hublot : une vitre épaisse sous son anneau de laiton, des reflets, et la zone de tap. Il garde la baleine : toucher = chant. */
export function Porthole() {
  return (
    <group userData={{ id: 'window' }}>
      <Part geo={cyl(PORT.r - 0.02, PORT.r - 0.02, 0.05, 56)} m={S.glass} p={[PORT.x, PORT.y, -3.1]} rotation-x={Math.PI / 2} castShadow={false} />
      {/* deux reflets, comme un trait de lumière sur du verre bombé */}
      <mesh position={[PORT.x - 0.05, PORT.y + 0.04, -3.05]} rotation-z={0.35} raycast={noRay}>
        <torusGeometry args={[0.72, 0.014, 6, 30, 0.85]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh position={[PORT.x - 0.05, PORT.y + 0.04, -3.05]} rotation-z={0.35 + 1.05} raycast={noRay}>
        <torusGeometry args={[0.72, 0.01, 6, 8, 0.28]} />
        <meshBasicMaterial color={0xffffff} transparent opacity={0.3} depthWrite={false} />
      </mesh>
      {/* zone de tap sur tout le hublot */}
      <mesh visible={false} position={[PORT.x, PORT.y, -2.99]}>
        <planeGeometry args={[PORT.r * 2, PORT.r * 2]} />
      </mesh>
    </group>
  )
}
