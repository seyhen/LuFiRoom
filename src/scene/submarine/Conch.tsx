import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, type Group, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { noRay } from '../parts'
import { Static } from '../Static'
import { glowTex } from '../textures'
import { S } from './materials'
import { blob, cone, ell } from '../blob'
import { skin } from '../materials'

/** La conque sur son piédestal, à l'avant gauche : son pied au sol. */
export const CONCH = { x: -1.2, z: 2.1, top: 0.77 }

const SHELL = 0xf3dccb, SPINE = 0xe9c9ad, LIP = 0xf8cfc6, MOUTH = 0xf4a3b2
const band = new Color(0xc99a78), shellCol = new Color(SHELL)
/**
 * La conque d'une seule peau (`blob`) : le dernier tour bombé, la spire qui s'effile en marches vers la gauche, le canal du siphon
 * vers la droite, la lèvre évasée côté pièce, creusée par la bouche, et une couronne d'épines effilées, de longueurs inégales, sur
 * l'épaule. Quelques bandes fauves en zigzag sur la nacre. Repère : le dessous du coquillage à y = 0, la bouche vers +z.
 */
const SHELL_GEO = blob(
  [
    ell([0, 0.15, 0], [0.2, 0.14, 0.15], { color: SHELL, k: 0.05 }),
    // la spire : des tours de plus en plus petits, fondus juste assez pour garder leurs marches
    ell([-0.19, 0.19, 0], [0.11, 0.1, 0.1], { color: SHELL, k: 0.03 }),
    ell([-0.27, 0.215, 0], [0.075, 0.07, 0.07], { color: SHELL, k: 0.02 }),
    ell([-0.33, 0.235, 0], [0.05, 0.048, 0.048], { color: SHELL, k: 0.015 }),
    cone([-0.36, 0.245, 0], [-0.42, 0.26, 0], 0.034, 0.012, { color: LIP, k: 0.012 }),
    // le canal du siphon, qui s'allonge et se relève un peu
    cone([0.12, 0.11, 0.02], [0.34, 0.09, 0.03], 0.075, 0.022, { color: SHELL, k: 0.04 }),
    // la lèvre évasée, qui déborde vers la pièce et monte en aile
    ell([0.04, 0.16, 0.135], [0.21, 0.14, 0.032], { color: LIP, k: 0.04, rot: [0.25, 0, -0.12] }),
    ell([0.13, 0.25, 0.1], [0.08, 0.06, 0.03], { color: LIP, k: 0.04, rot: [0.3, 0, -0.6] }),
    // la couronne d'épines, sur l'épaule : effilées, inégales, penchées vers l'arrière
    ...([[-0.16, 0.07], [-0.09, 0.1], [-0.02, 0.12], [0.05, 0.09], [0.11, 0.06]] as const).map(([x, l], i) =>
      cone([x, 0.25, -0.03], [x + 0.01, 0.25 + l, -0.06 - (i % 2) * 0.02], 0.034, 0.008, { color: SPINE, k: 0.03 })),
    // la bouche, creusée dans la lèvre
    ell([0.05, 0.14, 0.18], [0.15, 0.075, 0.07], { color: MOUTH, k: 0.03, op: 'sub', rot: [0.25, 0, -0.12] }),
  ],
  {
    h: 0.014,
    k: 0.04,
    // des bandes fauves en zigzag sur le dos, pas sur la lèvre ni dans la bouche
    paint: (p, c) => (Math.abs(c.r - shellCol.r) + Math.abs(c.g - shellCol.g) + Math.abs(c.b - shellCol.b) < 0.08 && p.z < 0.08 ? c.lerp(band, 0.28 * Math.max(0, Math.sin(p.x * 46 + Math.sin(p.y * 70) * 1.2))) : c),
  },
)
const SHELL_MAT = skin({ roughness: 0.28, clearcoat: 1, clearcoatRoughness: 0.15, sheen: 0.6, sheenColor: new Color(0xffe0f0) })

/**
 * La grande conque : un piédestal de cuivre vert-de-gris, et dessus un coquillage à la nacre rose, la bouche tournée vers la pièce.
 * Quand le son joue (la mer qu'on entend dans un coquillage), une lueur nacrée respire dans son ouverture et sur sa lèvre, et un halo
 * doux l'accompagne. Au repos, elle ne fait que luire à peine.
 */
export function Conch() {
  const g = useRef<Group>(null!), halo = useRef<Sprite>(null!), st = useRef({ k: 0, ph: 0 })
  useSquash('shell', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'shell')
    s.k = approach(s.k, on ? 1 : 0, dt * 0.8)
    if (!reduceMotion) s.ph += dt * (0.5 + s.k * 0.7) // la respiration ralentit au repos : phase ajoutée image après image
    const breath = reduceMotion ? 0.6 : 0.5 + 0.5 * Math.sin(s.ph * 2.1)
    S.pearlGlow.emissiveIntensity = 0.15 + s.k * (0.35 + 0.9 * breath)
    halo.current.material.opacity = s.k * (0.25 + 0.55 * breath)
    halo.current.scale.setScalar(0.55 + 0.25 * breath * s.k)
  })
  return (
    <group ref={g} userData={{ id: 'shell' }} position={[CONCH.x, 0, CONCH.z]}>
      <Static>
        {/* le piédestal : une base large, un fût qui s'évase, une coupe de laiton */}
        <Part geo={cyl(0.3, 0.33, 0.08, 28)} m={S.hullDark} p={[0, 0.04, 0]} />
        <Part geo={cyl(0.15, 0.2, 0.62, 24)} m={S.verdigris} p={[0, 0.39, 0]} />
        <Part geo={cyl(0.19, 0.17, 0.035, 24)} m={S.band} p={[0, 0.2, 0]} castShadow={false} />
        <Part geo={cyl(0.25, 0.18, 0.07, 28)} m={S.band} p={[0, CONCH.top - 0.035, 0]} />
        {/* la conque, couchée : la spire à gauche, la bouche vers la pièce */}
        <group position={[0, CONCH.top - 0.005, 0]} rotation-y={0.6} scale={1.3}>
          <mesh geometry={SHELL_GEO} material={SHELL_MAT} castShadow />
        </group>
      </Static>
      {/* le fond de la bouche, nacré : il rougeoit quand la conque chante */}
      <group position={[0, CONCH.top - 0.005, 0]} rotation-y={0.6} scale={1.3}>
        <Part geo={SPH} m={S.pearlGlow} scale={[0.13, 0.06, 0.035]} p={[0.05, 0.14, 0.135]} rotation={[0.25, 0, -0.12]} castShadow={false} />
        <sprite ref={halo} position={[0.08, 0.17, 0.24]} scale={0.55} raycast={noRay}>
          <spriteMaterial map={glowTex} color={0xffb8d0} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
        </sprite>
      </group>
    </group>
  )
}
