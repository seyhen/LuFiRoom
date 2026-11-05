import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type Group } from 'three'
import { TAU } from '../../math'
import { blob, cone, ell, pair } from '../blob'
import { gummy, skin } from '../materials'
import { reduceMotion } from '../anim'
import { SPH, noRay, type V3 } from '../parts'
import { LIVE } from '../Static'

const C = { hoodie: 0x8a7fc0, pocket: 0x7a6fb0, jeans: 0x4a5f8a, skin: 0xf0c4a0, blush: 0xf2a08e, nose: 0xe8a888, hair: 0x3a2a24, beanie: 0xe8705a, cuff: 0xd05e4a, shoe: 0xf6f4ee, sole: 0xe8705a }
const SKIN = skin({ roughness: 0.6, clearcoat: 0.25, emissive: 0xffffff, emissiveIntensity: 0.04 })
// la peau luit très peu de sa couleur, pour ne pas virer au bleu sous le néon de nuit
SKIN.onBeforeCompile = (sh) => {
  sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n#ifdef USE_COLOR\n\ttotalEmissiveRadiance *= vColor.rgb;\n#endif')
}
SKIN.customProgramCacheKey = () => 'sleeper-glow'
const LID = gummy(0x5a3a30, { roughness: 0.5 })
const PHONES = gummy(0x2b3237, { roughness: 0.35, clearcoat: 0.8 })

const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const tmp = new Color()

// Repère : le milieu de l'assise (y = 0 au ras du siège), le visage vers +z. Le sol est à y = -0,45.
const NECK: V3 = [0.03, 0.56, -0.19]

/** Le corps du client assoupi : affalé contre le dossier, bras croisés sur le ventre, jambes allongées croisées aux chevilles. */
const BODY = (() =>
  blob(
    [
      // le sweat à capuche : le buste penché en arrière, le ventre, les épaules, la capuche roulée dans le dos, la poche
      ell([0, 0.32, -0.1], [0.21, 0.22, 0.15], { rot: [-0.3, 0, 0], color: C.hoodie, k: 0.06 }),
      ell([0, 0.17, -0.01], [0.2, 0.13, 0.17], { color: C.hoodie, k: 0.06 }),
      ...pair(ell([0.19, 0.44, -0.16], 0.085, { color: C.hoodie, k: 0.05 }), 'x'),
      ell([0, 0.5, -0.27], [0.15, 0.07, 0.08], { color: C.hoodie, k: 0.04 }),
      ell([0, 0.17, 0.15], [0.12, 0.06, 0.025], { color: C.pocket, k: 0.02 }),
      cone([0, 0.47, -0.18], NECK, 0.05, 0.048, { color: C.skin, k: 0.03 }),
      // le bassin et les jambes : cuisses vers l'avant, tibias qui descendent loin devant, chevilles croisées
      ell([0, 0.07, 0.0], [0.19, 0.09, 0.15], { color: C.jeans, k: 0.05 }),
      cone([0.09, 0.07, 0.03], [0.1, 0.08, 0.4], 0.085, 0.072, { color: C.jeans, k: 0.04 }),
      cone([-0.09, 0.07, 0.03], [-0.1, 0.08, 0.4], 0.085, 0.072, { color: C.jeans, k: 0.04 }),
      cone([0.1, 0.08, 0.4], [-0.02, -0.33, 0.74], 0.068, 0.052, { color: C.jeans, k: 0.03 }),
      cone([-0.1, 0.08, 0.4], [0.05, -0.37, 0.7], 0.068, 0.052, { color: C.jeans, k: 0.03 }),
      // les baskets blanches à semelle corail
      ell([-0.03, -0.37, 0.8], [0.055, 0.05, 0.11], { rot: [0.25, 0.2, 0], color: C.shoe, k: 0.02 }),
      ell([0.06, -0.41, 0.77], [0.055, 0.045, 0.11], { rot: [0.1, -0.15, 0], color: C.shoe, k: 0.02 }),
      // les bras croisés sur le ventre : le droit dessous, le gauche dessus, les mains rentrées sous les coudes
      cone([0.2, 0.43, -0.14], [0.22, 0.26, 0.05], 0.066, 0.058, { color: C.hoodie, k: 0.04 }),
      cone([0.22, 0.26, 0.05], [-0.09, 0.28, 0.16], 0.057, 0.05, { color: C.hoodie, k: 0.04 }),
      ell([-0.12, 0.29, 0.14], [0.045, 0.04, 0.05], { color: C.skin, k: 0.02 }),
      cone([-0.2, 0.43, -0.14], [-0.22, 0.3, 0.06], 0.066, 0.058, { color: C.hoodie, k: 0.04 }),
      cone([-0.22, 0.3, 0.06], [0.1, 0.33, 0.19], 0.057, 0.05, { color: C.hoodie, k: 0.04 }),
      ell([0.13, 0.33, 0.17], [0.045, 0.04, 0.05], { color: C.skin, k: 0.02 }),
    ],
    {
      h: 0.024,
      k: 0.05,
      paint: (p, c) => {
        // les semelles corail, le bas des baskets
        if (p.y < -0.38 && p.z > 0.64) c.lerp(tmp.setHex(C.sole), sstep(-0.4, -0.43, p.y))
        return c
      },
    },
  ))()

/** La tête : un bonnet corail (son revers, son pompon), les cheveux qui dépassent, les joues, le nez. Repère : le haut du cou. */
const HEAD = (() =>
  blob(
    [
      ell([0, 0.12, 0.02], [0.12, 0.13, 0.12], { color: C.skin }),
      ...pair(ell([0.06, 0.07, 0.07], 0.06, { color: C.skin, k: 0.05 }), 'x'),
      ell([0, 0.02, 0.06], [0.07, 0.05, 0.07], { color: C.skin, k: 0.05 }),
      ell([0, 0.1, 0.135], [0.022, 0.02, 0.02], { color: C.nose, k: 0.02 }),
      ...pair(ell([0.12, 0.1, 0.0], [0.025, 0.04, 0.03], { color: C.skin, k: 0.02 }), 'x'),
      ell([0, 0.1, -0.05], [0.125, 0.1, 0.1], { color: C.hair, k: 0.03 }),
      ell([0, 0.19, -0.005], [0.13, 0.1, 0.13], { color: C.beanie, k: 0.02 }),
      ell([0, 0.155, 0.0], [0.138, 0.035, 0.138], { color: C.cuff, k: 0.015 }),
      ell([0.0, 0.3, -0.02], 0.045, { color: C.beanie, k: 0.02 }),
    ],
    {
      h: 0.022,
      k: 0.045,
      paint: (p, c) => {
        if (p.z > 0.06) for (const s of [-1, 1]) c.lerp(tmp.setHex(C.blush), (1 - sstep(0.02, 0.045, Math.hypot(p.x - s * 0.07, (p.y - 0.07) * 1.2))) * 0.8)
        return c
      },
    },
  ))()

/**
 * Un client de la laverie, assoupi sur le banc en attendant la fin de son séchage : sweat à capuche lavande, jean, baskets, bonnet
 * corail, un casque autour du cou. D'une seule peau (`blob`) : le corps, et la tête à part, qui dodeline. Il respire lentement ;
 * de temps en temps sa tête penche un peu plus, puis se redresse.
 */
export function Sleeper({ position, ry = 0 }: { position: V3; ry?: number }) {
  const body = useRef<Group>(null!), head = useRef<Group>(null!), st = useRef({ br: 0, nod: 0 })
  useFrame((_, delta) => {
    if (reduceMotion) return
    const dt = Math.min(delta, 0.05), s = st.current
    s.br = (s.br + (dt * TAU) / 4.6) % TAU
    s.nod = (s.nod + (dt * TAU) / 23) % TAU
    const b = Math.sin(s.br)
    body.current.scale.set(1 + b * 0.008, 1 + b * 0.012, 1 + b * 0.01)
    const drop = Math.max(0, Math.sin(s.nod)) ** 4
    head.current.rotation.set(0.32 + b * 0.02 + drop * 0.22, 0.15, -0.3 - drop * 0.08)
  })
  return (
    <group position={position} rotation-y={ry} userData={LIVE}>
      <group ref={body}>
        <mesh geometry={BODY} material={SKIN} castShadow receiveShadow raycast={noRay} />
        {/* le casque autour du cou : l'arceau sur la nuque, les deux écouteurs sur les clavicules */}
        <mesh material={PHONES} position={[0.0, 0.5, -0.15]} rotation={[1.25, 0, 0]} raycast={noRay}>
          <torusGeometry args={[0.1, 0.014, 8, 20, Math.PI]} />
        </mesh>
        {[-1, 1].map((s) => (
          <mesh key={s} geometry={SPH} material={PHONES} scale={[0.03, 0.045, 0.045]} position={[s * 0.1, 0.47, -0.1]} raycast={noRay} />
        ))}
      </group>
      <group ref={head} position={NECK}>
        <mesh geometry={HEAD} material={SKIN} castShadow receiveShadow raycast={noRay} />
        {/* les yeux fermés : deux petits traits arqués */}
        {[-1, 1].map((s) => (
          <mesh key={s} geometry={SPH} material={LID} scale={[0.024, 0.006, 0.01]} position={[s * 0.045, 0.125, 0.136]} rotation-z={s * 0.15} raycast={noRay} />
        ))}
      </group>
    </group>
  )
}
