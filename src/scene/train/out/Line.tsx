import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, TubeGeometry, Vector3, type Group } from 'three'
import { seeded, smooth } from '../../../math'
import { mood, reduceMotion } from '../../anim'
import { LIVE, Static } from '../../Static'
import { Batch, Part, SPH, cyl, noRay, rbox, type Item, type V3 } from '../../parts'
import { Firs, type Fir } from '../../nature/firs'
import { Foliage } from '../../nature/Foliage'
import { Rock } from '../../nature/Rock'
import { R, gravel, meadow } from './materials'
import { RAILS, SPEED } from '../TrainShell'
import { GlowPoints } from '../../objects/GlowPoints'

// La voie et ses abords, qui défilent : le train roule vers +x (comme le paysage de la fenêtre), donc le monde glisse vers -x.
// Tout ce qui défile est fait d'un motif de `P` mètres, posé trois fois : le groupe recule de `P` puis revient, sans couture.

/** Le sol, le haut du ballast, le dessus des rails. */
export const GROUND = -1.75
const BALLAST = -1.27
const RAIL_Z = RAILS
/** Le milieu de la voie, sous le milieu de la voiture. */
const MID = (RAILS[0] + RAILS[1]) / 2
/** La longueur du motif qui se répète ; la vitesse du train (m/s) est celle des roues (`TrainShell`). */
const P = 24
export { SPEED }

const tube = (pts: V3[], r: number, seg = 24) => new TubeGeometry(new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), seg, r, 6, false)

/** Le ballast : un talus de cailloux sous les traverses, en long (coupe constante le long de x). */
function ballastGeo() {
  const sec: [number, number][] = [[MID - 3.0, GROUND - 0.02], [MID - 2.35, BALLAST], [MID + 2.35, BALLAST], [MID + 3.0, GROUND - 0.02]]
  const pos: number[] = [], uv: number[] = [], idx: number[] = []
  const X0 = -24, X1 = 24
  sec.forEach(([z, y], i) => {
    for (const x of [X0, X1]) { pos.push(x, y, z); uv.push(x / 2, i / 3) }
  })
  for (let i = 0; i < sec.length - 1; i++) { const a = i * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  return g
}

/**
 * Les poteaux télégraphiques d'un motif (x), au bord de la voie, de l'autre côté de la voiture : côté caméra, leurs fils
 * passeraient devant la pièce (ils coupaient le compartiment en deux) ; derrière, le mur du fond les cache et on les voit filer
 * à droite de la voiture.
 */
const POLES = [3, 11, 19]
const POLE_Z = -4.7
const POLE_TOP = GROUND + 3.5
const INS = [-0.36, 0.36]

/** Les fils : une chaînette d'un poteau au suivant, pour chaque isolateur. */
function wires() {
  const out: BufferGeometry[] = []
  for (const x of POLES) for (const dz of INS) {
    const a: V3 = [x, POLE_TOP - 0.12, POLE_Z + dz]
    const pts: V3[] = Array.from({ length: 7 }, (_, i) => { const t = i / 6; return [a[0] + 8 * t, a[1] - 0.34 * Math.sin(Math.PI * t), a[2]] })
    out.push(tube(pts, 0.012, 20))
  }
  return out
}

/** Un poteau : fût de bois, traverse, deux isolateurs de verre turquoise, une jambe de force. */
function Pole({ x }: { x: number }) {
  return (
    <group position={[x, GROUND, POLE_Z]}>
      <Part geo={cyl(0.07, 0.09, 3.6, 10)} m={R.pole} p={[0, 1.75, 0]} />
      <Part geo={rbox(0.09, 0.09, 1.0, 0.03)} m={R.pole} p={[0, 3.32, 0]} />
      <Part geo={cyl(0.02, 0.02, 0.6, 6)} m={R.iron} p={[0, 3.05, 0.2]} rotation-x={-0.7} castShadow={false} />
      {INS.map((dz) => (
        <group key={dz} position={[0, 3.38, dz]}>
          <Part geo={cyl(0.012, 0.012, 0.08, 6)} m={R.iron} p={[0, 0.02, 0]} castShadow={false} />
          <Part geo={cyl(0.035, 0.05, 0.08, 10)} m={R.insulator} p={[0, 0.08, 0]} castShadow={false} />
          <Part geo={SPH} m={R.insulator} p={[0, 0.12, 0]} scale={[0.035, 0.025, 0.035]} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

/** Le signal du canton : un mât, une cible noire à deux feux sous leurs visières ; le vert s'allume le soir. Derrière la voie : devant, il passait devant la pièce. */
export const SIGNAL = { x: 15.5, z: -3.95 }
function Signal() {
  return (
    <group position={[SIGNAL.x, GROUND, SIGNAL.z]}>
      <Part geo={rbox(0.36, 0.14, 0.36, 0.04)} m={R.stone} p={[0, 0.07, 0]} />
      <Part geo={cyl(0.045, 0.05, 2.7, 10)} m={R.black} p={[0, 1.45, 0]} />
      <group position={[0, 2.75, 0.04]}>
        <Part geo={rbox(0.34, 0.66, 0.08, 0.12)} m={R.black} />
        <Part geo={rbox(0.38, 0.7, 0.04, 0.13)} m={R.white} p={[0, 0, -0.05]} castShadow={false} />
        {[[0.15, R.lens], [-0.15, R.lensRed]].map(([dy, m], i) => (
          <group key={i} position={[0, dy as number, 0.045]}>
            <Part geo={cyl(0.085, 0.085, 0.03, 18)} m={m as typeof R.lens} rotation-x={Math.PI / 2} castShadow={false} />
            <Part geo={cyl(0.1, 0.1, 0.11, 18)} m={R.black} p={[0, 0.06, 0.04]} rotation-x={Math.PI / 2} scale={[1, 1, 0.5]} castShadow={false} />
          </group>
        ))}
      </group>
      {/* une petite échelle de service */}
      {[-0.1, 0.1].map((dx) => <Part key={dx} geo={cyl(0.012, 0.012, 1.6, 5)} m={R.iron} p={[dx, 1.6, -0.1]} castShadow={false} />)}
      {Array.from({ length: 6 }, (_, i) => <Part key={i} geo={cyl(0.01, 0.01, 0.2, 5)} m={R.iron} p={[0, 0.9 + i * 0.26, -0.1]} rotation-z={Math.PI / 2} castShadow={false} />)}
    </group>
  )
}

/** Le chalet derrière la voie : socle de pierre, bois blond, balcon, toit à deux pans qui déborde, cheminée ; ses fenêtres s'allument. */
export const CHALET = { x: 7.5, z: -6.6 }
function Chalet() {
  const W = 2.2, D = 1.8, H = 1.5
  return (
    <group position={[CHALET.x, GROUND, CHALET.z]}>
      <Part geo={rbox(W + 0.1, 0.5, D + 0.1, 0.06)} m={R.stone} p={[0, 0.25, 0]} />
      <Part geo={rbox(W, H, D, 0.05)} m={R.wood} p={[0, 0.5 + H / 2, 0]} />
      <mesh position={[0, 0.5 + H / 2, D / 2 + 0.006]} material={R.chalet} receiveShadow raycast={noRay}>
        <planeGeometry args={[W - 0.08, H - 0.06]} />
      </mesh>
      {/* le pignon, côté +x : un triangle de bois sous le toit */}
      {[-1, 1].map((s) => (
        <group key={s} position={[0, 0.5 + H + 0.42, s * D * 0.27]} rotation-x={s * 0.72}>
          <Part geo={rbox(W + 0.5, 0.1, D * 0.7, 0.04)} m={R.chaletRoof} />
        </group>
      ))}
      <Part geo={rbox(W - 0.1, 0.6, D * 0.5, 0.05)} m={R.wood} p={[0, 0.5 + H + 0.25, 0]} />
      <Part geo={rbox(0.26, 0.6, 0.26, 0.04)} m={R.stone} p={[0.55, 0.5 + H + 0.7, -0.35]} />
      {/* le balcon de bois, devant */}
      <Part geo={rbox(W + 0.2, 0.06, 0.4, 0.02)} m={R.wood} p={[0, 0.5 + 0.55, D / 2 + 0.2]} />
      {Array.from({ length: 9 }, (_, i) => <Part key={i} geo={rbox(0.05, 0.36, 0.04, 0.015)} m={R.wood} p={[-W / 2 - 0.05 + i * ((W + 0.1) / 8), 0.5 + 0.76, D / 2 + 0.38]} castShadow={false} />)}
      <Part geo={rbox(W + 0.2, 0.06, 0.06, 0.02)} m={R.wood} p={[0, 0.5 + 0.96, D / 2 + 0.38]} castShadow={false} />
      {/* le tas de bois contre le mur */}
      {Array.from({ length: 6 }, (_, i) => <Part key={i} geo={cyl(0.07, 0.07, 0.5, 10)} m={R.trunk} p={[W / 2 + 0.16, 0.57 + Math.floor(i / 3) * 0.13, -0.3 + (i % 3) * 0.15]} rotation-z={Math.PI / 2} castShadow={false} />)}
    </group>
  )
}

/** Ce qui défile sur un motif de P mètres : poteaux, clôture, signal, chalet, bosquets, rochers. */
function Tile() {
  const ws = useMemo(wires, [])
  return (
    <>
      {POLES.map((x) => <Pole key={x} x={x} />)}
      {ws.map((g, i) => <Part key={i} geo={g} m={R.wire} castShadow={false} />)}
      {/* la clôture de perches le long du pré */}
      {Array.from({ length: 12 }, (_, i) => (
        <group key={i} position={[i * 2, GROUND, 7.5]}>
          <Part geo={rbox(0.1, 0.8, 0.1, 0.03)} m={R.fence} p={[0, 0.38, 0]} />
          {[0.3, 0.6].map((y) => <Part key={y} geo={cyl(0.035, 0.035, 2.06, 7)} m={R.fence} p={[1, y, 0]} rotation-z={Math.PI / 2} />)}
        </group>
      ))}
      <Signal />
      <Chalet />
      <Foliage v={1} p={[9.0, GROUND, 6.0]} s={[0.55, 0.42, 0.5]} m={R.bush} shadow={false} />
      <Foliage v={3} p={[20.5, GROUND, 5.6]} s={[0.4, 0.32, 0.38]} m={R.bush} shadow={false} />
      <Foliage v={4} p={[5.4, GROUND, -5.1]} s={[0.7, 0.5, 0.6]} m={R.bush} shadow={false} />
      <Rock v={2} p={[13.2, GROUND - 0.05, 8.6]} s={[0.4, 0.3, 0.35]} m={R.rock} shadow={false} />
      <Rock v={5} p={[1.0, GROUND - 0.05, 9.4]} s={[0.3, 0.22, 0.28]} m={R.rock} shadow={false} />
      <Rock v={0} p={[17.5, GROUND - 0.05, -5.6]} s={[0.5, 0.36, 0.45]} m={R.rock} shadow={false} />
    </>
  )
}

/** Les sapins et les fleurs de tous les motifs (une seule série chacun). */
function lists() {
  const r = seeded(31), firs: Fir[] = [], petals: Item[] = [], stems: Item[] = []
  const FIRS: [number, number, number][] = [[6, 8.8, 2.2], [14.5, 6.6, 1.5], [22, 9.0, 2.8], [1.5, -6.2, 3.4], [4.2, -8.6, 4.2], [12.5, -5.8, 2.8], [17, -8.8, 3.8], [21, -6.4, 3.1], [10.8, -9.6, 3.6]]
  const FLOWERS: [number, number][] = [[2.2, 5.6], [7.4, 6.6], [12, 5.4], [16.8, 6.9], [19.6, 8.4], [10.2, 8.9], [4.6, 8.1]]
  const COLORS = [0xfffaf0, 0xffe27a, 0xf4a6b8, 0xc9b6f0, 0x8fc4f4]
  for (const k of [-1, 0, 1]) {
    for (const [x, z, h] of FIRS) firs.push({ p: [x + k * P, GROUND - 0.05, z], h, tiers: h > 3 ? 5 : 4, snow: 0 })
    FLOWERS.forEach(([x, z], j) => {
      const c = COLORS[j % COLORS.length]
      for (let i = 0; i < 9; i++) {
        const a = r() * 6.3, d = Math.sqrt(r()) * 0.4, fx = x + k * P + Math.cos(a) * d, fz = z + Math.sin(a) * d, h = 0.14 + r() * 0.12
        stems.push({ p: [fx, GROUND + h / 2, fz], s: [1, h, 1] })
        petals.push({ p: [fx, GROUND + h + 0.02, fz], s: [0.055, 0.035, 0.055], c })
      }
    })
  }
  return { firs, petals, stems }
}

/** Les traverses de tous les motifs : une tous les 60 cm. */
function sleepers(): Item[] {
  const out: Item[] = []
  for (let x = -P; x < 2 * P; x += 0.6) out.push({ p: [x, BALLAST + 0.035, MID], s: 1 })
  return out
}

/** Le feu du signal, le soir : un halo vert dans chaque motif. */
function SignalGlows() {
  return (
    <>
      <GlowPoints points={[-1, 0, 1].map((k): V3 => [SIGNAL.x + k * P, GROUND + 2.9, SIGNAL.z + 0.14])} color={0x7dffb0} size={0.9} level={() => R.glow.opacity} />
    </>
  )
}

/**
 * La voie qui file sous le train : rails et ballast immobiles (ils sont pareils partout), traverses, poteaux et fils, clôture, signal,
 * chalet, sapins et fleurs qui défilent ; le pré et le ballast font défiler leur texture à la même vitesse.
 */
export function Line() {
  const roll = useRef<Group>(null!), flowers = useRef<Group>(null!)
  const s = useRef(0)
  const ballast = useMemo(ballastGeo, [])
  const l = useMemo(lists, [])
  const sl = useMemo(sleepers, [])
  const stemGeo = useMemo(() => cyl(0.008, 0.01, 1, 4), [])
  const sleeperGeo = useMemo(() => rbox(0.24, 0.07, 4.3, 0.03), [])
  useFrame((_, delta) => {
    if (!reduceMotion) s.current = (s.current + Math.min(delta, 0.05) * SPEED) % (P * 100)
    roll.current.position.x = -(s.current % P)
    meadow.offset.x = (s.current / 3) % 1
    gravel.offset.x = (s.current / 2) % 1
    const k = Math.min(1, smooth(mood.night) + mood.rain * 0.3)
    R.lens.emissiveIntensity = 0.3 + k * 1.5
    R.glow.opacity = k * 0.9
    // sous la neige, les fleurs du talus sont couvertes (leurs tiges sombres piquaient le blanc comme des brindilles)
    flowers.current.visible = mood.snow < 0.35
  })
  return (
    <>
      {/* le pré : un grand plan dont la texture défile */}
      <mesh position={[0, GROUND, -1.5]} rotation-x={-Math.PI / 2} material={R.meadow} receiveShadow raycast={noRay}>
        <planeGeometry args={[48, 26]} />
      </mesh>
      <mesh geometry={ballast} material={R.gravel} receiveShadow raycast={noRay} />
      <Static>
        {RAIL_Z.map((z) => (
          <group key={z}>
            <Part geo={rbox(48, 0.05, 0.1, 0.02)} m={R.rail} p={[0, -1.135, z]} castShadow={false} />
            <Part geo={rbox(48, 0.07, 0.16, 0.02)} m={R.railFoot} p={[0, -1.19, z]} castShadow={false} />
          </group>
        ))}
      </Static>
      <group ref={roll} userData={LIVE}>
        <Static>
          {[-1, 0, 1].map((k) => (
            <group key={k} position-x={k * P}>
              <Tile />
            </group>
          ))}
        </Static>
        <Batch geo={sleeperGeo} m={R.sleeper} items={sl} />
        <Firs list={l.firs} m={R.fir} snowM={R.snowCap} trunkM={R.trunk} seed={7} />
        <group ref={flowers}>
          <Batch geo={stemGeo} m={R.stem} items={l.stems} />
          <Batch geo={SPH} m={R.petal} items={l.petals} />
        </group>
        <SignalGlows />
      </group>
    </>
  )
}
