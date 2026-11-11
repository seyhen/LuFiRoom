import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, Color, ExtrudeGeometry, Float32BufferAttribute, MeshBasicMaterial, RepeatWrapping, Shape, Vector2, type Group } from 'three'
import { TAU, seeded, smooth } from '../../../math'
import { mood, reduceMotion } from '../../anim'
import { LIVE, Static } from '../../Static'
import { Part, SPH, noRay, rbox } from '../../parts'
import { far } from '../../materials'
import { canvasTex } from '../../paint'
import { SkyFadeClock, skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { Ice, glacierGeo, pinnacleGeo, tableGeo } from './Glaciers'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { igloo } from '../../../rooms/igloo'
import { Penguin } from '../Penguin'

// Le dehors de l'igloo : son île de neige est une banquise qui flotte sur une mer arctique. Autour, d'autres plaques de glace qui
// dansent sur la houle, des icebergs au loin, un kayak tiré sur une plaque, deux manchots qui regardent l'eau.

/** Le niveau de la mer (le dessous de l'île de neige plonge à -0,55). */
const SEA = -0.38
const F = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5 }

/** Les rides de la mer froide : des traits clairs courts, sur transparent. */
const rippleTex = canvasTex(256, 256, (x) => {
  const r = seeded(12)
  x.clearRect(0, 0, 256, 256); x.lineCap = 'round'
  for (let i = 0; i < 70; i++) {
    const X = r() * 256, Y = r() * 256, w = 8 + r() * 26
    x.strokeStyle = `rgba(255,255,255,${0.2 + r() * 0.35})`; x.lineWidth = 1.2 + r() * 1.6
    x.beginPath(); x.moveTo(X - w / 2, Y); x.quadraticCurveTo(X, Y - 3, X + w / 2, Y); x.stroke()
  }
}, [1, 1])
rippleTex.wrapS = rippleTex.wrapT = RepeatWrapping
rippleTex.repeat.set(8, 8)

const FG = { c: [0, 0] as [number, number], r0: 9.5, r1: 17.5 }

const M = {
  sea: skyFade(far(0x2f6a88, { roughness: 0.15, clearcoat: 0.9, clearcoatRoughness: 0.15 }), F),
  ripple: skyFade(new MeshBasicMaterial({ map: rippleTex, transparent: true, opacity: 0.5, depthWrite: false }), F),
  floe: skyFade(snowTop(far(0xf2f7fc, { roughness: 0.5, clearcoat: 0.35 }), 0.6), F),
  floeSide: skyFade(far(0xb8d8ec, { roughness: 0.2, clearcoat: 0.9 }), F),
  // la glace des séracs : la couleur vient des sommets (strates, crevasses, ligne d'eau pâle, voir Glaciers.tsx)
  ice: skyFade(snowTop(far(0xf4f8fc, { vertexColors: true, roughness: 0.3, clearcoat: 0.8, clearcoatRoughness: 0.2 }), 0.9, 0.5, 0.85), F),
  glacier: skyFade(snowTop(far(0xf4f8fc, { vertexColors: true, roughness: 0.35, clearcoat: 0.5, clearcoatRoughness: 0.25 }), 0.9, 0.5, 0.85), FG),
  kayak: skyFade(far(0xd8552e, { roughness: 0.35, clearcoat: 0.8 }), F),
  deck: skyFade(far(0x2a2e38, { roughness: 0.5, clearcoat: 0.4 }), F),
  wood: skyFade(far(0xc89a62, { roughness: 0.6 }), F),
  blade: skyFade(far(0xf4c040, { roughness: 0.4, clearcoat: 0.6 }), F),
  foam: skyFade(new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.6, depthWrite: false }), F),
}

/** Une plaque de glace : un contour irrégulier extrudé, bords arrondis (le dessus blanc, le flanc bleuté sous l'eau). */
function floeGeo(r: number, seed: number) {
  // un contour doux (une spline par des points irréguliers) : pas d'angle vif
  const rnd = seeded(seed), s = new Shape(), n = 8
  const pts = Array.from({ length: n }, (_, i) => { const a = (i / n) * TAU, d = r * (0.78 + rnd() * 0.32); return new Vector2(Math.cos(a) * d, Math.sin(a) * d) })
  s.moveTo(pts[0].x, pts[0].y)
  s.splineThru([...pts.slice(1), pts[0]])
  const g = new ExtrudeGeometry(s, { depth: 0.18, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.1, bevelSegments: 3, curveSegments: 40 })
  g.rotateX(-Math.PI / 2)
  return g
}

/** Les plaques : [x, z, rayon, a un kayak / des manchots]. */
const FLOES: [number, number, number][] = [[6.0, 2.6, 1.3], [3.4, 6.4, 0.9], [-5.6, 5.2, 1.1], [7.4, -2.0, 0.8], [-2.0, 7.6, 0.6], [5.4, 5.6, 0.45], [-7.0, 1.6, 0.6]]

/** Un anneau d'écume au pied de l'île : sa ligne d'eau est un cercle de 4,6 m (l'île est mise à l'échelle 1,15). */
function ringGeo(r: number, w: number) {
  const N = 64, pos: number[] = [], idx: number[] = []
  for (let i = 0; i <= N; i++) { const a = (i / N) * TAU; for (const d of [r, r + w]) pos.push(Math.cos(a) * d, 0, Math.sin(a) * d) }
  for (let i = 0; i < N; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) }
  const g = new BufferGeometry(); g.setAttribute('position', new Float32BufferAttribute(pos, 3)); g.setIndex(idx)
  return g
}

const DAY = new Color(0x2f6a88), NIGHT = new Color(0x0f2236), STORM = new Color(0x4a5e6c), WHITE = new Color(0x8aa6ba)

/** Une plaque qui danse sur la houle (et ce qu'on y a posé). */
function Floe({ x, z, r, i, children }: { x: number; z: number; r: number; i: number; children?: ReactNode }) {
  const g = useRef<Group>(null!), ph = useRef(i * 1.7)
  const geo = useMemo(() => floeGeo(r, i + 3), [r, i])
  useFrame((_, dt) => {
    if (!reduceMotion) ph.current += Math.min(dt, 0.05) * (0.7 + smooth(mood.storm) * 0.9)
    const k = 1 + smooth(mood.storm) * 1.5
    g.current.position.y = SEA - 0.12 + Math.sin(ph.current) * 0.03 * k
    g.current.rotation.set(Math.sin(ph.current * 0.8) * 0.025 * k, i, Math.cos(ph.current * 0.7) * 0.025 * k)
  })
  return (
    <group ref={g} position={[x, SEA - 0.12, z]} userData={LIVE}>
      <Static>
        <mesh geometry={geo} material={[M.floe, M.floeSide]} castShadow receiveShadow raycast={noRay} />
        {children}
      </Static>
    </group>
  )
}

/** Le kayak inuit : coque fine rouge, pont sombre, hiloire du cockpit, pagaie double à pales jaunes posée en travers. */
function Kayak() {
  return (
    <group position={[0, 0.37, 0]} rotation-y={0.3}>
      <Part geo={SPH} m={M.kayak} scale={[1.05, 0.14, 0.2]} />
      <Part geo={SPH} m={M.deck} p={[0, 0.07, 0]} scale={[0.95, 0.06, 0.15]} castShadow={false} />
      <Part geo={SPH} m={M.wood} p={[0.05, 0.11, 0]} scale={[0.2, 0.04, 0.13]} castShadow={false} />
      <Part geo={SPH} m={M.deck} p={[0.05, 0.13, 0]} scale={[0.15, 0.03, 0.09]} castShadow={false} />
      <group position={[0.1, 0.17, 0]} rotation={[0, 0.9, 0.05]}>
        <Part geo={rbox(1.4, 0.03, 0.03, 0.012)} m={M.wood} castShadow={false} />
        {[-0.72, 0.72].map((dx) => <Part key={dx} geo={SPH} m={M.blade} p={[dx, 0, 0]} scale={[0.14, 0.012, 0.06]} castShadow={false} />)}
      </group>
    </group>
  )
}

/** La mer : couleur froide (grise d'orage, d'encre la nuit), rides qui dérivent. */
function Sea() {
  const c = useMemo(() => new Color(), [])
  const ring = useMemo(() => ringGeo(4.55, 0.35), [])
  useFrame(({ clock }, dt) => {
    if (!reduceMotion) { rippleTex.offset.x += Math.min(dt, 0.05) * 0.01; rippleTex.offset.y += Math.min(dt, 0.05) * (0.015 + mood.storm * 0.04) }
    c.copy(DAY).lerp(STORM, Math.max(smooth(mood.storm), mood.rain * 0.4)).lerp(WHITE, smooth(mood.snow) * 0.4).lerp(NIGHT, smooth(mood.night) * 0.85)
    M.sea.color.copy(c)
    M.ripple.opacity = 0.35 + smooth(mood.storm) * 0.4 - smooth(mood.night) * 0.12
    M.foam.opacity = (reduceMotion ? 0.5 : 0.45 + 0.15 * Math.sin(clock.elapsedTime * 1.2)) * (1 - smooth(mood.night) * 0.4)
  })
  return (
    <>
      <mesh position={[0, SEA, 0]} rotation-x={-Math.PI / 2} material={M.sea} receiveShadow raycast={noRay}><planeGeometry args={[34, 34]} /></mesh>
      <mesh position={[0, SEA + 0.01, 0]} rotation-x={-Math.PI / 2} material={M.ripple} renderOrder={2} raycast={noRay}><planeGeometry args={[34, 34]} /></mesh>
      <mesh geometry={ring} position={[0, SEA + 0.015, 0]} material={M.foam} renderOrder={3} raycast={noRay} />
    </>
  )
}

/** Les icebergs tabulaires, au loin : de grandes tables de glace aux bords arrondis : [x, z, largeur, hauteur, profondeur, rotation]. */
const TABLES: [number, number, number, number, number, number][] = [[-4.6, -8.4, 3.4, 1.3, 2.2, 0.3], [5.2, -8.8, 2.6, 1.0, 1.8, -0.4], [-9.0, -1.6, 2.2, 0.9, 1.6, 1.1]]
/** Les pinacles : des blocs dressés, arrondis : [x, z, largeur, hauteur, forme]. */
const BERGS: [number, number, number, number, number][] = [[-7.2, -5.4, 1.2, 2.2, 1], [8.4, -4.4, 1.0, 1.7, 3], [1.0, -9.8, 1.1, 1.9, 2]]

/** La chaîne de glaciers au fond (le haut de l'écran était un aplat de ciel) : [x, z, demi-largeur, hauteur, forme]. Les premiers sont à 11 du
 * centre (écran de téléphone), les autres à 13 à 15 (grand écran) : leur fondu est plus large que celui du reste. */
const GLACIERS: [number, number, number, number, number][] = [
  [-11.0, -3.4, 1.6, 2.6, 1], [-8.6, -7.6, 1.5, 3.0, 4], [-5.8, -10.0, 1.6, 2.8, 6], [-2.6, -11.0, 1.7, 2.6, 2],
  [-14.0, -1.5, 2.2, 3.4, 3], [-12.0, -8.5, 2.4, 3.8, 5], [-7.0, -13.0, 2.2, 3.4, 1], [-1.0, -14.5, 2.4, 3.6, 4], [5.0, -13.5, 2.1, 3.2, 6], [11.0, -10.0, 2.1, 3.0, 2], [14.5, -4.5, 2.1, 2.8, 5],
]

export function Surroundings() {
  return (
    <>
      <SkyFadeClock room={igloo} />
      <Sea />
      <Static>
        {TABLES.map(([x, z, w, h, d, ry], i) => (
          <group key={`t${i}`} position={[x, SEA, z]} rotation-y={ry}>
            {/* la table : huit pans, strates fines, crevasses bleues, encoche pâle à la ligne d'eau ; un éclat détaché au pied */}
            <Ice geo={tableGeo(i)} m={M.ice} p={[0, 0, 0]} s={[w / 2, h, d / 2]} />
            {/* un second gradin, plus petit, décalé : la table a fondu par le bord */}
            <Ice geo={tableGeo(i + 3)} m={M.ice} p={[-w * 0.14, h * 0.86, -d * 0.1]} s={[w * 0.29, h * 0.4, d * 0.31]} ry={0.5 + i} />
            {/* des séracs posés sur le dessus : une table plate fait boîte */}
            <Ice geo={glacierGeo(i + 1)} m={M.ice} p={[w * 0.22, h * 0.86, d * 0.12]} s={[w * 0.1, h * 0.5, w * 0.09]} ry={i} />
            <Ice geo={pinnacleGeo(i + 1)} m={M.ice} p={[-w * 0.3, h * 0.88, d * 0.2]} s={[w * 0.07, h * 0.4, w * 0.07]} ry={i + 2} />
          </group>
        ))}
        {GLACIERS.map(([x, z, w, h, v], i) => (
          <Ice key={`g${i}`} geo={glacierGeo(v)} m={M.glacier} p={[x, SEA, z]} s={[w, h * (i < 4 ? 0.82 : 1), w * 0.85]} ry={i * 0.9} />
        ))}
        {BERGS.map(([x, z, w, h, v], i) => (
          <Ice key={i} geo={pinnacleGeo(v)} m={M.ice} p={[x, SEA, z]} s={[w * 0.9, h, w * 0.8]} ry={i * 1.3} />
        ))}
      </Static>
      {FLOES.map(([x, z, r], i) => (
        <Floe key={i} x={x} z={z} r={r} i={i}>
          {i === 0 && <Kayak />}
          {/* deux manchots sur la plaque de gauche, qui regardent l'eau */}
          {i === 2 && (
            <>
              <Penguin coat="blue" position={[0.1, 0.26, -0.2]} ry={0.6 - i} s={0.9} />
              <Penguin coat="pink" position={[-0.35, 0.26, 0.25]} ry={1.4 - i} s={0.8} />
            </>
          )}
        </Floe>
      ))}
      <OutdoorPrecip ground={SEA} area={[-13, 13, -12, 12]} />
    </>
  )
}
