import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshBasicMaterial, RingGeometry, type Group, type Mesh } from 'three'
import { approach, TAU } from '../../math'
import { isActive, useStore } from '../../state/store'
import { reduceMotion, useSquash } from '../anim'
import { blob, ell, pair } from '../blob'
import { gummy, skin } from '../materials'
import { Part, SPH, SPH_MID, cyl, rbox, noRay, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { Vessel, innerR } from '../igloo/Vessel'
import { B } from './materials'

// Le baquet de bois cerclé (rayon du haut, du bas, hauteur) et la hauteur de l'eau dedans.
const RT = 0.62, RB = 0.56, H = 0.48, WATER = 0.36
/** Le capybara est agrandi pour se lire de loin (le premier jet, à taille réelle, ne se reconnaissait pas). */
const SIZE = 1.45
/** L'angle (autour du baquet) où la serviette est posée sur le bord : devant à gauche, là où on voit le pan retomber. */
const TOWEL = 2.05
const FUR = 0xa8743f, FUR_D = 0x7a5030, NOSE = 0x3e2c22, LID = 0x4a3426

// Le capybara, dessiné le museau vers +x, puis tourné d'un huitième de tour pour regarder la caméra. Il est assis dans l'eau : le dos
// et les épaules dépassent, la grosse tête carrée posée en avant, les yeux fermés (deux fentes), les petites oreilles rondes, la truffe
// sombre et large. Le dessus de la tête garde la couleur du pelage (vu d'en haut, pas de masque).
const BODY = [
  ell([-0.05, 0.3, 0], [0.27, 0.25, 0.23], { color: FUR, k: 0.08 }),
  ell([0.06, 0.42, 0], [0.2, 0.17, 0.2], { color: FUR, k: 0.08 }),
]
const HEAD = [
  // le crâne, puis le long museau carré et profond (la silhouette du capybara, vue de trois quarts), la truffe large au bout
  ell([0.12, 0.62, 0], [0.17, 0.15, 0.145], { rot: [0, 0, -0.15], color: FUR, k: 0.06 }),
  ell([0.3, 0.57, 0], [0.17, 0.125, 0.12], { rot: [0, 0, -0.08], color: FUR, k: 0.06 }),
  ell([0.45, 0.565, 0], [0.04, 0.085, 0.09], { color: NOSE, k: 0.035 }),
  ell([0.4, 0.49, 0], [0.07, 0.022, 0.075], { color: FUR_D, k: 0.03 }),
  // les yeux fermés, posés haut sur les côtés : deux paupières sombres en croissant
  ...pair(ell([0.17, 0.69, 0.115], [0.045, 0.012, 0.03], { rot: [0, 0.25, -0.15], color: LID, k: 0.008 })),
  // les petites oreilles rondes, plaquées en arrière sur le dessus du crâne
  ...pair(ell([0.0, 0.75, 0.095], [0.04, 0.035, 0.022], { rot: [0.3, 0, 0.3], color: FUR_D, k: 0.015 })),
]
// tourné à peine vers la caméra : de trois quarts, le profil carré se lit (de face il ressemblait à un cheval)
const TURN = 0.2

/** Les yuzus qui flottent (angle, distance au centre) ; ils dansent à chaque respiration. */
const FLOAT: [number, number][] = [[0.5, 0.48], [1.9, 0.5], [3.2, 0.47], [4.3, 0.5], [5.4, 0.46]]

const YUZU = gummy(0xf0bd2c, { roughness: 0.55, clearcoat: 0.4, emissive: 0xf0bd2c, emissiveIntensity: 0.08 })
const YUZU_LEAF = gummy(0x5a9a4a, { roughness: 0.6, clearcoat: 0.3 })
const WATER_M = gummy(0xe4ecc6, { roughness: 0.05, clearcoat: 1, emissive: 0xd8e2a8, emissiveIntensity: 0.06 })
const STAVE = gummy(0xd8b484, { roughness: 0.7, clearcoat: 0.15 })
const STAVE_IN = gummy(0xc8a070, { roughness: 0.75, clearcoat: 0.1 })
const HOOP = gummy(0x9a7048, { roughness: 0.45, clearcoat: 0.4 })
const RIPPLE = new MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0, depthWrite: false })
const RING = new RingGeometry(0.9, 1, 32).rotateX(-Math.PI / 2)

/** Un yuzu : le fruit grumeleux et sa petite queue à une feuille. */
function Yuzu({ p, r = 0.06 }: { p: V3; r?: number }) {
  return (
    <group position={p}>
      <Part geo={SPH_MID} m={YUZU} scale={[r, r * 0.9, r]} />
      <Part geo={cyl(0.006, 0.006, 0.03, 5)} m={YUZU_LEAF} p={[0, r * 0.9, 0]} castShadow={false} />
      <Part geo={SPH} m={YUZU_LEAF} scale={[0.035, 0.006, 0.018]} p={[0.025, r * 0.9 + 0.012, 0]} rotation-y={0.5} castShadow={false} />
    </group>
  )
}

/**
 * Le capybara dans son bain de yuzus, au milieu de la salle de bain : un baquet de bois clair cerclé de deux bandes, l'eau chaude
 * jaunie par les fruits, le capybara assis dedans, les yeux fermés, un yuzu posé sur la tête ; des yuzus qui flottent autour de lui,
 * une serviette pliée sur le bord et un petit seau de yuzus à côté. Objet `capybara`, son `capybara` : à chaque respiration qu'on
 * entend (le compteur `pulses.capybara`), son dos se soulève, un rond s'élargit sur l'eau et les yuzus dansent. `position` : le pied
 * du baquet.
 */
export function Capybara({ position }: { position: V3 }) {
  const root = useRef<Group>(null!), body = useRef<Group>(null!), head = useRef<Group>(null!), yuzus = useRef<(Group | null)[]>([])
  const ripple = useRef<Mesh>(null!)
  const s = useRef({ last: -1, kick: 0, ph: 0, ring: 1, amp: 0 })
  const geo = useMemo(() => ({ body: blob(BODY, { h: 0.02, k: 0.07 }), head: blob(HEAD, { h: 0.016, k: 0.05 }) }), [])
  useEffect(() => () => { geo.body.dispose(); geo.head.dispose() }, [geo])
  const fur = useMemo(() => skin({ roughness: 0.85, clearcoat: 0.05 }), [])
  useEffect(() => () => fur.dispose(), [fur])
  useSquash('capybara', root)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), S = s.current, st = useStore.getState(), on = isActive(st, 'capybara') && !reduceMotion
    const n = st.pulses.capybara ?? 0
    if (S.last < 0) S.last = n
    if (n !== S.last) { S.last = n; if (on) { S.kick = 1; S.ring = 0 } }
    S.amp = approach(S.amp, on ? 1 : 0.35, dt * 0.5)
    // la respiration : lente toujours, plus ample quand le bain chante ; l'élan d'une vague retombe en 2 s
    S.ph = (S.ph + dt * (TAU / 4.4)) % TAU
    S.kick = Math.max(0, S.kick - dt * 0.5)
    const lift = (Math.sin(S.ph) * 0.008 + S.kick * 0.02) * S.amp
    body.current.position.y = lift
    head.current.position.y = lift * 1.2
    head.current.rotation.z = Math.sin(S.ph * 0.5) * 0.04 * S.amp
    yuzus.current.forEach((y, i) => { if (y) y.position.y = WATER + 0.012 + Math.sin(S.ph * 1.3 + i * 1.7) * 0.006 * S.amp + S.kick * 0.012 * Math.sin(i * 2.1 + S.ph * 3) })
    // le rond qui s'élargit depuis le capybara jusqu'à la paroi
    S.ring = Math.min(1, S.ring + dt * 0.45)
    const r = 0.4 + S.ring * (innerR(RT, RB, H, WATER) - 0.42)
    ripple.current.scale.setScalar(r)
    RIPPLE.opacity = (1 - S.ring) * 0.55 * (on ? 1 : 0)
  })
  const wr = innerR(RT, RB, H, WATER)
  return (
    <group ref={root} position={position} userData={{ id: 'capybara' }}>
      <Static>
        {/* le baquet : douelles claires, deux cercles foncés, un fond ; l'eau jaunie par les yuzus */}
        <Vessel p={[0, 0, 0]} rt={RT} rb={RB} h={H} m={STAVE} inner={STAVE_IN} rim={HOOP} t={0.03} />
        {[0.09, H - 0.08].map((y) => (
          <Part key={y} m={HOOP} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[RB + (RT - RB) * (y / H) + 0.006, 0.014, 6, 32]} />
          </Part>
        ))}
        <Part geo={cyl(wr, wr, 0.012, 32)} m={WATER_M} p={[0, WATER, 0]} castShadow={false} />
        {/* la serviette pliée sur le bord, côté caméra à gauche : un pli posé sur le bord, un pan qui retombe dehors contre les douelles */}
        <group position={[Math.cos(TOWEL) * (RT - 0.02), H, Math.sin(TOWEL) * (RT - 0.02)]} rotation-y={-TOWEL}>
          <Part geo={rbox(0.14, 0.03, 0.32, 0.014)} m={B.towelPeach} p={[0, 0.012, 0]} castShadow={false} />
          <Part geo={rbox(0.03, 0.24, 0.32, 0.014)} m={B.towelPeach} p={[0.085, -0.1, 0]} rotation-z={-0.06} />
        </group>
        {/* le petit seau de yuzus à côté du baquet */}
        <group position={[0.62, 0, -0.55]}>
          <Vessel p={[0, 0, 0]} rt={0.15} rb={0.13} h={0.2} m={STAVE} inner={STAVE_IN} rim={HOOP} t={0.015} />
          <Yuzu p={[0.03, 0.17, 0.02]} r={0.055} />
          <Yuzu p={[-0.06, 0.16, -0.03]} r={0.05} />
          <Yuzu p={[0.02, 0.19, -0.07]} r={0.05} />
        </group>
        <Yuzu p={[0.9, 0.05, -0.3]} r={0.05} />
      </Static>
      {/* le capybara, tourné vers la caméra ; le corps et la tête respirent séparément */}
      <group rotation-y={TURN} position={[-0.04, 0, -0.03]} scale={SIZE}>
        <group ref={body} userData={LIVE}>
          <mesh geometry={geo.body} material={fur} castShadow />
        </group>
        <group ref={head} userData={LIVE}>
          <mesh geometry={geo.head} material={fur} castShadow />
          <Yuzu p={[0.06, 0.785, 0]} r={0.07} />
        </group>
      </group>
      {FLOAT.map(([a, d], i) => (
        <group key={i} ref={(g) => { yuzus.current[i] = g }} position={[Math.cos(a) * d, WATER + 0.012, Math.sin(a) * d]} userData={LIVE}>
          <Static><Yuzu p={[0, 0, 0]} r={0.055} /></Static>
        </group>
      ))}
      <mesh ref={ripple} geometry={RING} material={RIPPLE} position={[0, WATER + 0.009, 0]} renderOrder={2} raycast={noRay} />
    </group>
  )
}
