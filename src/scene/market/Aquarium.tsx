import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, InstancedMesh, MeshBasicMaterial, Object3D, TubeGeometry, Vector3, type Group } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { isActive, useStore } from '../../state/store'
import { rand } from '../../math'
import { gummy } from '../materials'
import { Part, SPH_LO, cyl, rbox, worldUV, type V3 } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { Rock } from '../nature/Rock'
import { Leaf } from '../nature/Leaf'
import { leafy, stone } from '../nature/materials'
import { School, type Swimmer } from './School'
import { gravelTex, tankBackTex, tankSignTex } from './textures'
import { K } from './materials'

/**
 * L'aquarium de l'étal : une cuve de verre de 84 cm sur un tréteau de bois sombre, comme celle d'un marchand de carpes koï qui
 * s'est installé entre le tonneau et la télé. Dedans, trois koï (un kohaku blanc et rouge, un ogon doré, un orange) qui nagent
 * lentement, du gravier, des galets, des herbes qui montent du fond, une pierre à air d'où partent les bulles ; dessus, la rampe
 * de lumière ; sur le côté, le filtre suspendu qui déverse son filet. Dessous, sur l'étagère : la pompe à air (son tuyau noir
 * monte derrière la cuve et passe le bord), la boîte de nourriture. Devant, la planche du marchand : « 錦鯉 一匹 三百円 ».
 * Le tréteau est tourné d'un quart de tour : la grande vitre regarde vers +x, le long du mur de la télé.
 * Quand le son joue, la pierre à air lâche ses bulles (au rythme de ce qu'on entend : `pulses.aquarium`, voir audio/channels/aquarium.ts)
 * et les poissons s'animent un peu ; sans lui, ils nagent quand même, au ralenti. Les bulles et les poissons sont instanciés.
 */
const AT = { x: -1.48, z: 2.3 }
const GLASS_Y = 0.69 // le milieu des vitres
const SURFACE = 0.84 // le niveau de l'eau
const STONE: V3 = [-0.2, 0.56, -0.1] // le haut de la pierre à air
/** Le temps que met une grosse bulle à monter : le canal audio programme son « bloup » à ce moment-là (BUBBLE_RISE dans audio/channels/aquarium.ts : à garder égal). */
const BUBBLE_RISE = 1.1

const glass = gummy(0xd8f4ff, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.16, depthWrite: false })
// l'eau : un cyan franc, bien plus clair que le bois sombre derrière ; elle luit un peu (la rampe l'éclaire)
const water = gummy(0x58c8d8, { roughness: 0.05, clearcoat: 0.6, transparent: true, opacity: 0.42, depthWrite: false, emissive: 0x38c4d6, emissiveIntensity: 0.95 })
const gravel = gummy(0xffffff, { map: gravelTex, roughness: 0.85, clearcoat: 0.05 })
const back = gummy(0xffffff, { map: tankBackTex, roughness: 0.7, clearcoat: 0.1, emissive: 0xffffff, emissiveMap: tankBackTex, emissiveIntensity: 0.9 })
const sign = gummy(0xffffff, { map: tankSignTex, roughness: 0.7, clearcoat: 0.2 })
const rock = stone(0x8c9aa6, { emissive: 0x2a3a46, emissiveIntensity: 0.4 })
const weed = leafy(0x58c878, { emissive: 0x1c5a34, emissiveIntensity: 0.45 })
const bubbleMat = new MeshBasicMaterial({ color: 0xe8fbff, transparent: true, opacity: 0.6, depthWrite: false })

// les quatre vitres en un seul maillage (un tracé), la grande devant (+z) et celle de droite (+x)
const panes = mergeGeometries([
  rbox(0.852, 0.42, 0.012, 0.004).clone().translate(0, GLASS_Y, 0.2),
  rbox(0.852, 0.42, 0.012, 0.004).clone().translate(0, GLASS_Y, -0.2),
  rbox(0.012, 0.42, 0.388, 0.004).clone().translate(0.42, GLASS_Y, 0),
  rbox(0.012, 0.42, 0.388, 0.004).clone().translate(-0.42, GLASS_Y, 0),
])!
// l'eau : un bloc, un peu en retrait des vitres (14 mm) pour ne pas se disputer le pixel avec elles
const waterBox = rbox(0.8, SURFACE - 0.48, 0.36, 0.012)
// le tuyau d'air : de la pompe, derrière la cuve, par-dessus le bord, puis le long de la vitre du fond jusqu'à la pierre
const airLine = new TubeGeometry(
  new CatmullRomCurve3([[0.25, 0.225, 0], [0.27, 0.28, -0.12], [0.29, 0.36, -0.195], [0.3, 0.45, -0.224], [0.31, 0.9, -0.224], [0.31, 0.945, -0.2], [0.3, 0.9, -0.182], [0.3, 0.56, -0.182], [0.14, 0.546, -0.15], [STONE[0], 0.548, STONE[2]]].map(([x, y, z]) => new Vector3(x, y, z))),
  60, 0.0065, 5,
)

// les poissons : un chemin de Lissajous dans la cuve (les phases ne font que s'additionner), nez dans le sens de la nage
const koiPath = (ax: number, az: number, y0: number, ay: number, pa: number, pb: number, pc: number) => (ph: number, o: number[]) => {
  o[0] = ax * Math.sin(ph + pa)
  o[1] = y0 + ay * Math.sin(ph * 1.7 + pc)
  o[2] = az * Math.sin(ph * 1.31 + pb)
}
const KOI: Swimmer[] = [
  { tint: 0xffffff, s: 0.88, rate: 0.29, ph0: 0.5, at: koiPath(0.2, 0.09, 0.74, 0.035, 0, 1.2, 0.5) },
  { tint: 0xf3bf44, s: 0.82, rate: 0.24, ph0: 3.3, at: koiPath(0.22, 0.08, 0.68, 0.03, 2.2, 0.3, 2.1) },
  { tint: 0xff9450, s: 0.76, rate: 0.33, ph0: 5.4, at: koiPath(0.19, 0.09, 0.78, 0.03, 4.1, 2.4, 3.9) },
]

const dummy = new Object3D()
const N_BUBBLES = 40

/** Les bulles : un petit chapelet fin en continu, et une grosse à chaque battement du son (elle monte exactement le temps que le son l'attend). */
function Bubbles() {
  const mesh = useRef<InstancedMesh>(null!)
  const st = useRef({
    n: -1,
    acc: 0,
    gap: 0.13,
    // x, z, y, vitesse, rayon, phase de balancement, vivante (0 / 1)
    b: Array.from({ length: N_BUBBLES }, () => [0, 0, 0, 0, 0, 0, 0]),
    next: 0,
  })
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState()
    const on = isActive(store, 'aquarium') && !reduceMotion
    const spawn = (r: number, v: number) => {
      const b = s.b[s.next]
      s.next = (s.next + 1) % N_BUBBLES
      b[0] = STONE[0] + rand(-0.008, 0.008)
      b[1] = STONE[2] + rand(-0.008, 0.008)
      b[2] = STONE[1] + 0.01
      b[3] = v
      b[4] = r
      b[5] = rand(0, 6.28)
      b[6] = 1
    }
    // une grosse bulle par battement entendu : elle monte pendant `BUBBLE_RISE`, le « bloup » éclate à la surface
    const n = store.pulses.aquarium ?? 0
    if (s.n < 0) s.n = n
    if (on) for (let k = Math.min(3, n - s.n); k > 0; k--) spawn(0.0165, (SURFACE - 0.015 - STONE[1]) / BUBBLE_RISE)
    s.n = n
    // le chapelet fin de la pierre
    if (on) {
      s.acc += dt
      while (s.acc > s.gap) {
        s.acc -= s.gap
        s.gap = rand(0.1, 0.22)
        spawn(rand(0.004, 0.0075), rand(0.26, 0.34))
      }
    }
    for (let i = 0; i < N_BUBBLES; i++) {
      const b = s.b[i]
      if (b[6]) {
        b[2] += b[3] * dt
        b[5] += dt * 5
        if (b[2] > SURFACE - 0.012) b[6] = 0
      }
      if (b[6]) {
        const grow = 1 + (b[2] - STONE[1]) * 0.9
        dummy.position.set(b[0] + Math.sin(b[5]) * 0.006, b[2], b[1] + Math.cos(b[5] * 0.8) * 0.004)
        dummy.scale.setScalar(b[4] * grow)
      } else dummy.scale.setScalar(0)
      dummy.updateMatrix()
      mesh.current.setMatrixAt(i, dummy.matrix)
    }
    mesh.current.instanceMatrix.needsUpdate = true
  })
  return <instancedMesh ref={mesh} args={[SPH_LO, bubbleMat, N_BUBBLES]} frustumCulled={false} renderOrder={3} />
}

/**
 * Un faisceau de feuilles rubanées (type vallisnérie) : de longues feuilles lancéolées qui montent du gravier et s'arquent. `face` est
 * la direction (angle autour de y) vers le milieu de la cuve : les feuilles s'écartent en éventail de part et d'autre, jamais vers la
 * vitre voisine (elles la traversaient).
 */
function Weeds({ p, n, seed, face }: { p: V3; n: number; seed: number; face: number }) {
  const blades = useMemo(
    () => Array.from({ length: n }, (_, i) => ({
      ry: face + (i - (n - 1) / 2) * 0.42,
      tilt: 0.1 + ((i * 37 + seed * 11) % 10) * 0.02,
      l: 0.17 + ((i * 53 + seed * 7) % 10) * 0.012,
      ox: Math.cos(i * 2.1 + seed) * 0.012,
      oz: Math.sin(i * 2.1 + seed) * 0.012,
    })),
    [n, seed, face],
  )
  return (
    <group position={p}>
      {blades.map((b, i) => (
        <group key={i} position={[b.ox, 0, b.oz]} rotation-y={b.ry}>
          <Leaf kind="lance" w={0.013} l={b.l} m={weed} r={[-Math.PI / 2 + b.tilt, 0, 0]} />
        </group>
      ))}
    </group>
  )
}

export function Aquarium() {
  const g = useRef<Group>(null!)
  useSquash('aquarium', g)
  const speed = useMemo(() => () => (isActive(useStore.getState(), 'aquarium') ? 1.3 : 1), [])
  return (
    <group ref={g} userData={{ id: 'aquarium' }} position={[AT.x, 0, AT.z]} rotation-y={Math.PI / 2}>
      <Static>
        {/* le tréteau : plateau, quatre pieds, entretoises, étagère basse, tablier sous le plateau devant */}
        <Part geo={rbox(0.92, 0.04, 0.44, 0.012)} m={K.woodDark} p={[0, 0.44, 0]} />
        {[-0.4, 0.4].flatMap((x) => [-0.18, 0.18].map((z) => <Part key={`${x}${z}`} geo={cyl(0.028, 0.024, 0.42, 10)} m={K.woodDark} p={[x, 0.21, z]} />))}
        {[-0.4, 0.4].map((x) => <Part key={x} geo={rbox(0.024, 0.026, 0.34, 0.008)} m={K.woodDark} p={[x, 0.3, 0]} />)}
        <Part geo={rbox(0.84, 0.025, 0.36, 0.01)} m={K.woodDark} p={[0, 0.14, 0]} />
        <Part geo={rbox(0.78, 0.1, 0.02, 0.008)} m={K.woodDark} p={[0, 0.37, 0.205]} />
        <mesh material={sign} position={[0, 0.37, 0.223]} receiveShadow>
          <planeGeometry args={[0.6, 0.089]} />
        </mesh>
        {/* sur l'étagère : la pompe à air (boîtier, sortie), la boîte de nourriture (boîte rouge, couvercle de bois) */}
        <Part geo={rbox(0.1, 0.06, 0.07, 0.014)} m={K.iron} p={[0.25, 0.1825 + 0.0125, 0]} castShadow={false} />
        <Part geo={cyl(0.009, 0.009, 0.04, 8)} m={K.iron} p={[0.25, 0.235, 0]} castShadow={false} />
        <Part geo={cyl(0.052, 0.052, 0.07, 16)} m={K.red} p={[-0.22, 0.1525 + 0.0125 + 0.0175, 0.04]} castShadow={false} />
        <Part geo={cyl(0.056, 0.056, 0.018, 16)} m={K.woodDark} p={[-0.22, 0.232, 0.04]} castShadow={false} />
        {/* la cuve : platine noire, vitres (plus bas), poteaux d'angle, cadre du haut */}
        <Part geo={rbox(0.88, 0.02, 0.44, 0.008)} m={K.iron} p={[0, 0.47, 0]} castShadow={false} />
        {[-0.42, 0.42].flatMap((x) => [-0.2, 0.2].map((z) => <Part key={`${x}${z}`} geo={rbox(0.03, 0.42, 0.03, 0.008)} m={K.iron} p={[x, GLASS_Y, z]} castShadow={false} />))}
        {[-0.2, 0.2].map((z) => <Part key={z} geo={rbox(0.88, 0.025, 0.03, 0.008)} m={K.iron} p={[0, 0.9125, z]} castShadow={false} />)}
        {[-0.42, 0.42].map((x) => <Part key={x} geo={rbox(0.03, 0.025, 0.43, 0.008)} m={K.iron} p={[x, 0.9125, 0]} castShadow={false} />)}
        {/* la rampe de lumière : un capot noir le long du bord arrière (l'eau reste visible d'en haut) */}
        <Part geo={rbox(0.86, 0.022, 0.09, 0.008)} m={K.iron} p={[0, 0.936, -0.155]} castShadow={false} />
        {/* le fond (peint, derrière les vitres du fond et de gauche), le gravier, les galets, la pierre à air, les herbes */}
        <mesh material={back} position={[0, GLASS_Y, -0.215]}>
          <planeGeometry args={[0.84, 0.42]} />
        </mesh>
        <mesh material={back} position={[-0.435, GLASS_Y, 0]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[0.4, 0.42]} />
        </mesh>
        <Part geo={worldUV(rbox(0.81, 0.05, 0.37, 0.02), 0.3)} m={gravel} p={[0, 0.505, 0]} castShadow={false} />
        <Rock v={1} p={[-0.26, 0.525, 0.08]} s={[0.085, 0.075, 0.07]} ry={0.4} m={rock} shadow={false} />
        <Rock v={3} p={[0.17, 0.525, -0.1]} s={[0.07, 0.09, 0.06]} ry={1.8} m={rock} shadow={false} />
        <Rock v={5} p={[0.32, 0.525, 0.11]} s={[0.055, 0.05, 0.05]} ry={2.6} m={rock} shadow={false} />
        <Part geo={cyl(0.02, 0.02, 0.026, 10)} m={rock} p={[STONE[0], 0.543, STONE[2]]} castShadow={false} />
        <Weeds p={[-0.31, 0.525, -0.1]} n={7} seed={1} face={1.26} />
        <Weeds p={[0.31, 0.525, -0.12]} n={6} seed={4} face={-1.2} />
        <Weeds p={[-0.04, 0.525, -0.14]} n={5} seed={9} face={0.2} />
        {/* le filtre suspendu, sur la vitre de droite : boîtier, pont par-dessus le bord, bec, prise d'eau avec sa crépine */}
        <Part geo={rbox(0.07, 0.2, 0.13, 0.02)} m={K.iron} p={[0.475, 0.83, 0]} castShadow={false} />
        <Part geo={rbox(0.14, 0.02, 0.1, 0.008)} m={K.iron} p={[0.43, 0.97 - 0.02, 0]} castShadow={false} />
        <Part geo={rbox(0.07, 0.012, 0.07, 0.005)} m={K.iron} p={[0.37, 0.93, 0]} rotation-z={-0.18} castShadow={false} />
        <Part geo={cyl(0.01, 0.01, 0.36, 8)} m={K.iron} p={[0.385, 0.74, 0.07]} castShadow={false} />
        <Part geo={cyl(0.024, 0.024, 0.05, 12)} m={rock} p={[0.385, 0.57, 0.07]} castShadow={false} />
        <Part geo={airLine} m={K.iron} castShadow={false} />
      </Static>
      {/* le verre et l'eau : transparents, ils ne s'écrivent pas dans la profondeur (poissons et bulles se voient dedans) */}
      <mesh geometry={waterBox} material={water} position={[0, 0.66, 0]} renderOrder={1} />
      <mesh geometry={panes} material={glass} renderOrder={2} />
      <School kind="koi" swimmers={KOI} speed={speed} />
      <Bubbles />
    </group>
  )
}
