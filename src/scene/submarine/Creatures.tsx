import { Part, type V3 } from '../parts'
import { blob, cone, ell, pair } from '../blob'
import { skin } from '../materials'
import { DOT, S } from './materials'

// Les créatures du sous-marin, d'une seule peau (voir blob.ts) : le poulpe en peluche de la banquette et les poissons rouges du bocal.

const RED = 0xd8404a, RED_TIP = 0xf0707a, RED_DARK = 0xb02e3c, CHEEK = 0xff9aa8

/** Les huit tentacules : chacune pose une base épaisse sur l'assise, s'effile, et se recourbe en boucle ou relève le bout. */
function arms(): ReturnType<typeof cone>[] {
  const out: ReturnType<typeof cone>[] = []
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + 0.2, side = i % 2 ? 1 : -1
    // en avant (z+), elles restent courtes et dodues ; en arrière, plus longues
    const front = (Math.sin(a) + 1) / 2, len = 0.19 - front * 0.04 + (i % 3) * 0.015
    const c = Math.cos(a), s = Math.sin(a), tx = -s, tz = c
    const p0: V3 = [c * 0.07, 0.05, s * 0.07]
    const p1: V3 = [c * (0.07 + len * 0.55) + tx * side * 0.025, 0.04, s * (0.07 + len * 0.55) + tz * side * 0.025]
    const p2: V3 = [c * (0.07 + len) + tx * side * 0.075, 0.045 + (i % 3 === 0 ? 0.05 : 0), s * (0.07 + len) + tz * side * 0.075]
    const p3: V3 = [c * (0.07 + len * 0.92) + tx * side * 0.1, 0.07 + (i % 3 === 0 ? 0.1 : 0.02), s * (0.07 + len * 0.92) + tz * side * 0.1]
    out.push(cone(p0, p1, 0.042, 0.03, { color: RED, k: 0.03 }), cone(p1, p2, 0.03, 0.022, { color: RED, k: 0.03 }), cone(p2, p3, 0.022, 0.019, { color: RED_TIP, k: 0.03 }))
  }
  return out
}

// Il regarde vers +z. La tête est un grand manteau rond, un peu penché en arrière ; deux joues roses, deux bosses pour les yeux.
const OCTO = blob(
  [
    ell([0, 0.075, 0], [0.12, 0.06, 0.12], { color: RED, k: 0.04 }),
    ell([0, 0.2, -0.015], [0.115, 0.135, 0.115], { color: RED, k: 0.05, rot: [-0.15, 0, 0] }),
    // des taches plus sombres sur le dessus
    ell([0, 0.3, -0.04], [0.06, 0.04, 0.06], { color: RED_DARK, k: 0.04 }),
    ...pair(ell([0.062, 0.195, 0.085], [0.048, 0.05, 0.036], { color: RED, k: 0.03 }), 'x'),
    ...pair(ell([0.075, 0.15, 0.08], [0.035, 0.03, 0.03], { color: CHEEK, k: 0.03 }), 'x'),
    ...arms(),
  ],
  { h: 0.0175, k: 0.04 },
)
const OCTO_MAT = skin({ roughness: 0.4, clearcoat: 0.7 })

/** Un petit poulpe en peluche : grosse tête ronde, huit tentacules qui s'enroulent, de grands yeux brillants. Il regarde vers +z. */
export function Octopus() {
  return (
    <group>
      <mesh geometry={OCTO} material={OCTO_MAT} castShadow receiveShadow />
      {[-1, 1].map((x) => (
        <group key={x} position={[x * 0.062, 0.2, 0.115]}>
          <Part geo={DOT} m={S.cream} scale={[0.036, 0.04, 0.02]} castShadow={false} />
          <Part geo={DOT} m={S.iron} scale={[0.024, 0.028, 0.016]} p={[0, -0.002, 0.012]} castShadow={false} />
          <Part geo={DOT} m={S.cream} scale={0.007} p={[0.008, 0.01, 0.026]} castShadow={false} />
        </group>
      ))}
      {/* un petit sourire */}
      <Part m={S.iron} p={[0, 0.135, 0.118]} rotation={[0.1, 0, Math.PI]} castShadow={false}>
        <torusGeometry args={[0.018, 0.0045, 6, 12, Math.PI]} />
      </Part>
    </group>
  )
}

// Un poisson rouge : corps fusiforme joufflu, nageoires rondes. Il regarde vers +x ; la queue est à part (elle bat), à l'origine de son pivot.
const FISH_ORANGE = 0xf08a3c, FISH_BELLY = 0xffc070, FISH_FIN = 0xff9a52
export const FISH_BODY = blob(
  [
    ell([0, 0, 0], [0.062, 0.042, 0.037], { color: FISH_ORANGE, k: 0.02 }),
    ell([0.04, -0.004, 0], [0.036, 0.034, 0.034], { color: FISH_ORANGE, k: 0.02 }),
    ell([0.0, -0.022, 0], [0.045, 0.02, 0.03], { color: FISH_BELLY, k: 0.02 }),
    // la lèvre et les joues
    ...pair(ell([0.058, -0.008, 0.016], [0.018, 0.016, 0.014], { color: FISH_BELLY, k: 0.015 }), 'z'),
    // la nageoire du dos, ronde, et les deux pectorales
    ell([-0.008, 0.05, 0], [0.034, 0.024, 0.01], { color: FISH_FIN, k: 0.014, rot: [0, 0, -0.35] }),
    ...pair(ell([0.012, -0.012, 0.04], [0.02, 0.009, 0.015], { color: FISH_FIN, k: 0.012, rot: [0.5, 0.3, 0.5] }), 'z'),
  ],
  { h: 0.007, k: 0.02 },
)
// La queue : un éventail large et rond, qui part de x = 0 vers -x.
export const FISH_TAIL = blob(
  [
    cone([0.004, 0, 0], [-0.02, 0, 0], 0.016, 0.012, { color: FISH_ORANGE, k: 0.01 }),
    ell([-0.043, 0.02, 0], [0.034, 0.021, 0.008], { color: FISH_FIN, k: 0.012, rot: [0, 0, -0.55] }),
    ell([-0.043, -0.02, 0], [0.034, 0.021, 0.008], { color: FISH_FIN, k: 0.012, rot: [0, 0, 0.55] }),
    ell([-0.04, 0, 0], [0.024, 0.016, 0.008], { color: FISH_FIN, k: 0.012 }),
  ],
  { h: 0.005, k: 0.012 },
)
// une petite lueur orange propre au poisson : la nuit, dans le bocal à l’ombre de la lampe, il virait au noir
export const FISH_MAT = skin({ roughness: 0.3, clearcoat: 0.85, emissive: 0xff9a3a, emissiveIntensity: 0.55 })
/** Les yeux d'un poisson : de grosses billes brillantes sur les côtés de la tête. */
export function FishEyes() {
  return (
    <>
      {[-1, 1].map((z) => (
        <group key={z} position={[0.04, 0.012, z * 0.03]}>
          <Part geo={DOT} m={S.cream} scale={0.017} castShadow={false} />
          <Part geo={DOT} m={S.iron} scale={0.012} p={[0.005, 0, z * 0.007]} castShadow={false} />
          <Part geo={DOT} m={S.cream} scale={0.004} p={[0.008, 0.005, z * 0.012]} castShadow={false} />
        </group>
      ))}
    </>
  )
}
