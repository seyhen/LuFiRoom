import { useMemo, useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, MeshBasicMaterial, PlaneGeometry, SpriteMaterial, type Group } from 'three'
import { TAU, approach, rand, smooth } from '../../../math'
import { isActive, useStore } from '../../../state/store'
import { mood, reduceMotion, useSquash } from '../../anim'
import { far, gummy } from '../../materials'
import { noRay, rbox } from '../../parts'
import { skyFade } from '../../outdoor'
import { useEvery } from '../../life'
import { glowTex } from '../../textures'
import { carBody, carLamps } from './carGeo'
import { reflectTex } from './streetTex'

// Les voitures de la rue mouillée (son `wetroad`) : sur la chaussée de droite, le long du trottoir, une petite voiture jaune attend,
// un panier de linge bleu sur sa galerie (la voiture d'un client de la laverie). Touchée, elle démarre : phares et feux allumés, leur
// faisceau et leur reflet étiré sur l'asphalte mouillé, les essuie-glaces qui balaient le pare-brise de loin en loin ; et la route
// vit : une autre voiture passe à chaque passage du son (le canal appelle `pulse` : même instant), une fois dans un sens, une fois
// dans l'autre, sur deux voies qui ne se croisent pas. Éteinte, la voiture reste là, sombre ; de très loin en loin une autre passe
// quand même (la rue de nuit, sans son). Seule la voiture qui attend est interactive (hors du `<Static>`, `userData.id`).

const F = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5 }
const ROAD = -0.34
/** La voiture garée : au bord du trottoir de la rue de droite (le bord est à x = 6,2), l'avant vers +z, face à la caméra. */
const PARKED = { x: 7.05, z: 2.0 }
/** Les deux voies de passage : x, sens (1 : vers +z), couleur de la carrosserie. */
const LANES = [
  { x: 8.55, dir: 1, paint: 0x8ab8e0 },
  { x: 10.4, dir: -1, paint: 0xe9948c },
] as const
const Z_FROM = -12, Z_TO = 12
/** Une traversée : un peu plus que le passage du son (huit à onze secondes), pour que la voiture soit au plus près au milieu. */
const CROSS = 10.5

const BODIES = [carBody(0xffd25a, true), carBody(LANES[0].paint), carBody(LANES[1].paint)]
const LAMPS = carLamps()
const paint = skyFade(gummy(0xffffff, { vertexColors: true, roughness: 0.34, clearcoat: 0.8, clearcoatRoughness: 0.2 }), F)
const blade = skyFade(far(0xaab4bc, { roughness: 0.4 }), F)
const BLADE = rbox(0.022, 0.012, 0.28, 0.005, 1)
const BEAM = new PlaneGeometry(1.6, 3.0), STREAK = new PlaneGeometry(0.9, 3.0)

/** Le fondu dans le ciel de `skyFade`, recalculé pour ce qui n'est pas un matériau (les halos). */
const fadeOf = (x: number, z: number) => 1 - Math.pow(smooth((Math.hypot(x, z) - F.r0) / (F.r1 - F.r0)), 2)
const glow = (map: typeof glowTex, offset: number) =>
  skyFade(new MeshBasicMaterial({ map, color: 0xffd890, blending: AdditiveBlending, transparent: true, depthWrite: false, opacity: 0, polygonOffset: true, polygonOffsetFactor: offset }), { ...F, additive: true })

interface Mats { lamp: MeshBasicMaterial; beam: MeshBasicMaterial; streak: MeshBasicMaterial; halo: SpriteMaterial }
/** Les matériaux lumineux d'une voiture : propres à elle, parce que l'éclat de chacune suit son rythme. */
const useMats = (): Mats => useMemo(() => ({
  lamp: skyFade(new MeshBasicMaterial({ color: 0x2a2f36, vertexColors: true }), F),
  beam: glow(glowTex, -2),
  streak: glow(reflectTex, -3),
  halo: new SpriteMaterial({ map: glowTex, color: 0xffd890, blending: AdditiveBlending, transparent: true, depthWrite: false, opacity: 0 }),
}), [])

/** Règle l'éclat des optiques, du faisceau, du reflet et du halo : `lit` de 0 (éteinte) à 1 (allumée), `fade` : le fondu dans le ciel. */
function shine(m: Mats, lit: number, fade: number) {
  const night = smooth(mood.night), wet = 0.45 + 0.55 * mood.rain * (1 - mood.snow)
  m.lamp.color.setScalar(0.16 + lit * 1.25)
  m.beam.opacity = lit * (0.35 + 0.65 * night) * fade
  m.streak.opacity = lit * (0.4 + 0.6 * night) * wet * fade
  m.halo.opacity = lit * (0.35 + 0.65 * night) * fade
}

/** Une voiture : la coque (un maillage), les optiques (un maillage), le faisceau sur la route, son reflet sur l'asphalte et, pour celle qui attend seule (`halo`), le halo de l'optique tournée vers la caméra : un tracé de plus par voiture qui passe se paie dans le budget de la pièce. */
function Car({ geo, m, halo, ray, shell, children }: { geo: number; m: Mats; halo?: 'front' | 'rear'; ray?: boolean; shell?: React.Ref<Group>; children?: ReactNode }) {
  return (
    <>
      <group ref={shell}>
        <mesh geometry={BODIES[geo]} material={paint} raycast={ray ? undefined : noRay} />
        <mesh geometry={LAMPS} material={m.lamp} raycast={noRay} />
        {children}
      </group>
      <mesh geometry={BEAM} material={m.beam} position={[0, 0.02, 2.6]} rotation-x={-Math.PI / 2} renderOrder={3} raycast={noRay} />
      <mesh geometry={STREAK} material={m.streak} position={[0, 0.04, 1.9]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} renderOrder={3} raycast={noRay} />
      {halo && <sprite material={m.halo} scale={[1.7, 0.8, 1]} position={[0, 0.52, halo === 'front' ? 1.45 : -1.45]} renderOrder={4} raycast={noRay} />}
    </>
  )
}

/** La voiture qui attend : jaune, interactive. Allumée : feux, faisceau, essuie-glaces (un balayage lent, puis ils se rangent). */
function ParkedCar() {
  const root = useRef<Group>(null!), shell = useRef<Group>(null!), arms = [useRef<Group>(null!), useRef<Group>(null!)]
  const m = useMats(), st = useRef({ lit: 0, ph: 0, vib: 0 })
  useSquash('wetroad', root)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'wetroad')
    s.lit = approach(s.lit, on ? 1 : 0, dt * 1.4)
    shine(m, s.lit, fadeOf(PARKED.x, PARKED.z))
    // les essuie-glaces : un balayage (aller, retour) tous les 2,7 s, puis au repos le long du bas du pare-brise ; éteints, ils finissent leur tour
    const cyc = s.ph % TAU
    if (!reduceMotion && (on || cyc > 0)) {
      const was = Math.floor(s.ph / TAU)
      s.ph += dt * 2.3
      if (!on && Math.floor(s.ph / TAU) > was) s.ph = (was + 1) * TAU
    }
    const k = (s.ph % TAU) / TAU, sweep = k < 0.6 ? 0.5 - 0.5 * Math.cos((k / 0.6) * TAU) : 0
    for (const a of arms) a.current.rotation.y = Math.PI / 2 - sweep * (Math.PI / 2 + 0.12)
    // le moteur au ralenti : la caisse frémit à peine (phase additionnée image après image)
    s.vib += dt * 31
    shell.current.position.y = reduceMotion ? 0 : Math.sin(s.vib) * 0.004 * s.lit
  })
  return (
    <group ref={root} position={[PARKED.x, ROAD, PARKED.z]} userData={{ id: 'wetroad' }}>
      <Car geo={0} m={m} halo="front" ray shell={shell}>
        {/* les deux essuie-glaces, pivotés au bas du pare-brise (incliné à 45°) : l'axe de rotation est la normale de la vitre */}
        {[0.14, -0.14].map((x, i) => (
          <group key={x} position={[x, 0.768, 0.608]} rotation-x={Math.PI / 4}>
            <group ref={arms[i]}>
              <mesh geometry={BLADE} material={blade} position={[0, 0, -0.14]} raycast={noRay} />
            </group>
          </group>
        ))}
      </Car>
    </group>
  )
}

interface Pass { t: number }

/** Une voie : la voiture qui la traverse de bout en bout quand `s.t` court de 0 à `CROSS`, invisible entre deux passages. */
function Lane({ i, s }: { i: 0 | 1; s: Pass }) {
  const g = useRef<Group>(null!), m = useMats(), lane = LANES[i]
  useFrame((_, delta) => {
    const k = s.t / CROSS
    if (s.t < 0 || k >= 1) { s.t = -1; g.current.visible = false; return }
    s.t += Math.min(delta, 0.05)
    const z = lane.dir > 0 ? Z_FROM + (Z_TO - Z_FROM) * k : Z_TO - (Z_TO - Z_FROM) * k
    g.current.position.z = z
    g.current.visible = true
    shine(m, 1, fadeOf(lane.x, z))
  })
  return (
    <group ref={g} position={[lane.x, ROAD, Z_FROM]} rotation-y={lane.dir > 0 ? 0 : Math.PI} visible={false}>
      <Car geo={i + 1} m={m} />
    </group>
  )
}

/** La circulation : une voiture entre à chaque passage du son (le compteur `pulses` avance à l'instant du passage), de loin en loin sans lui. */
function Traffic() {
  const passes = useRef<Pass[]>([{ t: -1 }, { t: -1 }]), seen = useRef(useStore.getState().pulses.wetroad ?? 0)
  const go = (i: number) => { if (passes.current[i].t < 0) passes.current[i].t = 0 }
  useFrame(() => {
    const n = useStore.getState().pulses.wetroad ?? 0
    if (n === seen.current) return
    seen.current = n
    if (!reduceMotion) go((n - 1) % 2) // la même parité que le sens du panoramique du canal
  })
  useEvery(35, 80, () => go(Math.floor(rand(0, 2))), () => !isActive(useStore.getState(), 'wetroad'), 12)
  return (
    <>
      <Lane i={0} s={passes.current[0]} />
      <Lane i={1} s={passes.current[1]} />
    </>
  )
}

export function WetRoad() {
  return (
    <>
      <ParkedCar />
      <Traffic />
    </>
  )
}
