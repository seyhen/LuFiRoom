import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type Group, type Vector3 } from 'three'
import { useStore } from '../../state/store'
import { approach, rand, smooth } from '../../math'
import { blob, cone, ell, pair } from '../blob'
import { skin } from '../materials'
import { Part, type V3 } from '../parts'
import { SPH_MID as SPH } from '../igloo/spheres'
import { LIVE, Static } from '../Static'
import { mood, reduceMotion } from '../anim'
import { useEvery } from '../life'
import { T } from './materials'

// Les bêtes de la cabane perchée, chacune d'une seule peau (scene/blob.ts) : l'écureuil roux sur le garde-corps, le merle du nichoir,
// la hulotte qui se pose le soir. Chaque bête est dessinée dans son repère (x vers l'avant, y en haut), puis tournée vers la caméra.

/** La peau luit très doucement de sa propre couleur : un roux ne vire pas à l'olive sous la lumière bleue de la nuit. */
export const FUR = skin({ emissive: 0xffffff, emissiveIntensity: 0.06 })
FUR.onBeforeCompile = (sh) => {
  sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n#ifdef USE_COLOR\n\ttotalEmissiveRadiance *= vColor.rgb;\n#endif')
}
FUR.customProgramCacheKey = () => 'treehouse-fur-glow'
/** La hulotte ne sort que la nuit : sa peau luit un peu plus, pour qu'on lise son disque facial dans le noir. */
const OWL = skin({ emissive: 0xffffff, emissiveIntensity: 0.2 })
OWL.onBeforeCompile = FUR.onBeforeCompile
OWL.customProgramCacheKey = () => 'treehouse-owl-glow'

const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
/** Un petit bruit déterministe, pour moucheter un plumage. */
const speckle = (p: Vector3, f: number) => 0.5 + 0.5 * Math.sin(p.x * f * 1.7 + Math.sin(p.y * f * 2.3) * 2 + p.z * f * 1.3) * Math.sin(p.y * f * 1.1 - p.z * f * 0.7)

// ——— l'écureuil roux ———
const RED = 0xc8622c, RED_DK = 0x9a4420, CREAM = 0xf4e2c2, NOSE = 0x3a2420
const cRd = new Color(RED_DK), cC = new Color(CREAM), cTail = new Color(0xd8783c)

const squirrelBody = () =>
  blob(
    [
      // le buste dressé, le ventre crème, les cuisses, les pieds posés à plat
      ell([0, 0.13, 0], [0.075, 0.11, 0.068], { rot: [0, 0, -0.2], color: RED }),
      ell([0.035, 0.12, 0], [0.05, 0.085, 0.052], { color: CREAM, k: 0.03 }),
      pair(ell([-0.01, 0.06, 0.045], [0.07, 0.058, 0.04], { color: RED, k: 0.04 })),
      pair(ell([0.05, 0.014, 0.05], [0.062, 0.016, 0.024], { color: RED_DK, k: 0.02 })),
      // la tête, le museau, la truffe ; les joues et le menton crème
      ell([0.035, 0.27, 0], [0.066, 0.058, 0.056], { color: RED, k: 0.04 }),
      ell([0.092, 0.253, 0], [0.036, 0.03, 0.032], { color: RED, k: 0.025 }),
      ell([0.07, 0.232, 0], [0.04, 0.022, 0.04], { color: CREAM, k: 0.02 }),
      ell([0.127, 0.258, 0], 0.012, { color: NOSE, k: 0.006 }),
      // les oreilles et leurs pinceaux
      pair(cone([0.02, 0.31, 0.03], [0.0, 0.37, 0.036], 0.022, 0.01, { color: RED, k: 0.02 })),
      pair(ell([-0.002, 0.382, 0.036], [0.011, 0.02, 0.009], { color: RED_DK, k: 0.008 })),
      // les pattes de devant, qui tiennent le gland contre la poitrine
      pair(cone([0.055, 0.2, 0.04], [0.105, 0.175, 0.016], 0.019, 0.013, { color: RED, k: 0.02 })),
    ],
    {
      paint: (p, base) => {
        // le dos plus sombre, le bout des pattes plus clair
        const back = ss(0.0, -0.07, p.x) * ss(0.05, 0.25, p.y)
        return base.lerp(cRd, back * 0.45)
      },
    },
  )

// la queue en panache, qui remonte le long du dos et s'enroule au-dessus de la tête ; son pied est le pivot de son mouvement
const TAIL_PTS: V3[] = [[-0.06, 0.05, 0], [-0.15, 0.1, 0], [-0.2, 0.2, 0], [-0.19, 0.31, 0], [-0.14, 0.4, 0], [-0.07, 0.43, 0], [-0.03, 0.41, 0]]
const squirrelTail = () =>
  blob(
    TAIL_PTS.map((p, i) => {
      const u = i / (TAIL_PTS.length - 1), r = 0.038 + 0.032 * Math.sin(Math.PI * Math.min(1, u * 1.15))
      return ell([p[0] - TAIL_PTS[0][0], p[1] - TAIL_PTS[0][1], 0], [r, r, r * 0.8], { color: RED, k: 0.05 })
    }),
    {
      paint: (p, base) => base.lerp(cC, ss(0.33, 0.4, p.y) * 0.25).lerp(cTail, speckle(p, 60) * 0.35),
    },
  )

/**
 * L'écureuil roux, assis sur la main courante de droite, un gland entre les pattes, la queue en panache relevée sur le dos.
 * De loin en loin, sa queue fouette et il tourne la tête (jamais avec `prefers-reduced-motion`) ; il respire.
 */
export function Squirrel({ position, ry = 0 }: { position: V3; ry?: number }) {
  const geo = useMemo(() => ({ body: squirrelBody(), tail: squirrelTail() }), [])
  const g = useRef<Group>(null!), tail = useRef<Group>(null!)
  const st = useRef({ flick: 0, look: 0, lookT: 0, t: 0 })
  useEvery(14, 30, () => { st.current.flick = 1 })
  useEvery(9, 20, () => { st.current.lookT = rand(-0.6, 0.5) })
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current
    s.t += dt
    s.flick = Math.max(0, s.flick - dt * 1.4)
    s.look = approach(s.look, s.lookT, dt * 1.5)
    const breathe = reduceMotion ? 0 : Math.sin(s.t * 3.1) * 0.012
    g.current.scale.set(1.7 * (1 + breathe), 1.7 * (1 - breathe * 0.5), 1.7 * (1 + breathe))
    tail.current.rotation.z = Math.sin(s.flick * Math.PI * 4) * 0.22 * s.flick
    g.current.rotation.y = ry + s.look * 0.5
  })
  return (
    <group position={position} userData={LIVE}>
      <group ref={g} rotation-y={ry} scale={1.7}>
        <mesh geometry={geo.body} material={FUR} castShadow receiveShadow />
        <group ref={tail} position={TAIL_PTS[0]}>
          <mesh geometry={geo.tail} material={FUR} castShadow receiveShadow />
        </group>
        <Static>
          {/* les yeux noirs et brillants, de chaque côté de la tête */}
          {[-1, 1].map((k) => <Part key={k} geo={SPH} m={T.eye} scale={0.012} p={[0.083, 0.288, k * 0.039]} castShadow={false} />)}
          {/* le gland qu'il tient */}
          <Part geo={SPH} m={T.acorn} scale={[0.026, 0.034, 0.026]} p={[0.13, 0.17, 0]} castShadow={false} />
          <Part geo={SPH} m={T.acornCap} scale={[0.029, 0.017, 0.029]} p={[0.13, 0.198, 0]} castShadow={false} />
        </Static>
      </group>
    </group>
  )
}

// ——— le merle du nichoir ———
const BROWN = 0x6e5440, ORANGE = 0xe0763a, BELLY = 0xf0e2cc, BILL = 0x3a3028
const cO = new Color(ORANGE), cB = new Color(BELLY)
// le rouge-gorge : un plastron orange qui couvre tout le devant, du front à la poitrine ; le ventre crème dessous
export const robinGeo = () =>
  blob(
    [
      ell([0, 0.07, 0], [0.078, 0.062, 0.056], { rot: [0, 0, 0.18], color: BROWN }),
      ell([0.055, 0.13, 0], 0.046, { color: BROWN, k: 0.04 }),
      cone([0.095, 0.132, 0], [0.128, 0.128, 0], 0.011, 0.003, { color: BILL, k: 0.006 }),
      cone([-0.06, 0.075, 0], [-0.135, 0.1, 0], 0.03, 0.018, { color: BROWN, k: 0.02 }),
      pair(ell([-0.01, 0.08, 0.046], [0.062, 0.036, 0.014], { rot: [0, 0, 0.25], color: 0x5a4434, k: 0.015 })),
      pair(cone([0.005, 0.03, 0.016], [0.012, -0.01, 0.016], 0.007, 0.006, { color: BILL, k: 0.005 })),
    ],
    {
      h: 0.012,
      paint: (p, base) => {
        // le plastron : le devant de la tête et la poitrine (sous l'œil, autour du bec), orange ; le ventre crème plus bas
        const front = ss(0.015, 0.05, p.x + 0.25 * (0.14 - p.y)) * ss(0.16, 0.13, p.y) * ss(0.02, 0.05, p.y) * (1 - ss(0.092, 0.1, p.x))
        base.lerp(cO, front)
        return base.lerp(cB, ss(0.05, 0.02, p.y) * ss(-0.03, 0.02, p.x) * 0.9)
      },
    },
  )

// ——— la hulotte ———
const TAWNY = 0xa07a52, TAWNY_DK = 0x6a4c34, FAWN = 0xf0dcb4, PALE = 0xf4e8d0
const cTd = new Color(TAWNY_DK), cP = new Color(PALE)
const owlBody = () =>
  blob(
    [
      ell([0, 0.15, 0], [0.11, 0.15, 0.11], { color: TAWNY }),
      ell([0.05, 0.14, 0], [0.07, 0.11, 0.08], { color: FAWN, k: 0.05 }),
      pair(ell([-0.015, 0.16, 0.09], [0.1, 0.13, 0.03], { rot: [0.1, 0, 0.1], color: TAWNY_DK, k: 0.03 })),
      ell([-0.09, 0.03, 0], [0.04, 0.03, 0.05], { color: TAWNY_DK, k: 0.03 }),
      pair(ell([0.07, 0.008, 0.04], [0.032, 0.016, 0.022], { color: PALE, k: 0.02 })),
    ],
    {
      paint: (p, base) => base.lerp(cTd, speckle(p, 55) * 0.35).lerp(cP, ss(0.06, 0.1, p.x) * speckle(p, 80) * 0.4),
    },
  )
// la tête, à part (elle tourne) : le disque facial clair couvre tout le devant, les yeux et le bec posés dessus
const owlHead = () =>
  blob(
    [
      ell([0, 0, 0], [0.098, 0.088, 0.104], { color: TAWNY }),
      ell([0.06, -0.008, 0], [0.05, 0.078, 0.094], { color: FAWN, k: 0.035 }),
      cone([0.1, -0.01, 0], [0.118, -0.035, 0], 0.012, 0.004, { color: 0xc8b070, k: 0.006 }),
    ],
    {
      paint: (p, base) => {
        // la raie sombre au-dessus du disque, et le pourtour du disque bordé de brun
        const rim = ss(0.02, 0.05, p.x) * (1 - ss(0.055, 0.08, p.x)) * ss(0.05, 0.075, Math.hypot(p.y + 0.005, p.z))
        return base.lerp(cTd, speckle(p, 60) * 0.3 * (1 - ss(0.04, 0.07, p.x))).lerp(cTd, rim * 0.6)
      },
    },
  )

/**
 * La hulotte, posée sur le coin du toit à la tombée de la nuit. Le jour, elle n'est pas là. Quand les oiseaux chantent la nuit, c'est
 * elle qu'on entend : à chaque hululement (`pulses.forest`), elle gonfle sa gorge et hoche la tête ; de temps en temps, elle tourne
 * la tête vers la cabane.
 */
export function Owl({ position, ry = 0 }: { position: V3; ry?: number }) {
  const geo = useMemo(() => ({ body: owlBody(), head: owlHead() }), [])
  const g = useRef<Group>(null!), head = useRef<Group>(null!)
  const st = useRef({ seen: useStore.getState().pulses.forest ?? 0, hoot: 0, turn: 0, turnT: 0, show: mood.night })
  useEvery(10, 24, () => { st.current.turnT = rand(-0.9, 0.6) })
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState()
    const n = store.pulses.forest ?? 0
    if (n !== s.seen) {
      s.seen = n
      if (store.night && store.on.forest && !reduceMotion) s.hoot = 1
    }
    s.hoot = Math.max(0, s.hoot - dt * 1.2)
    s.turn = approach(s.turn, reduceMotion ? 0 : s.turnT, dt * 1.2)
    // elle arrive avec la nuit et repart au matin (elle grandit de rien, sur son perchoir)
    s.show = approach(s.show, mood.night > 0.6 ? 1 : 0, dt * 0.6)
    const k = smooth(s.show)
    g.current.visible = k > 0.01
    g.current.scale.setScalar(Math.max(0.001, k) * 1.5)
    const h = Math.sin(s.hoot * Math.PI)
    head.current.rotation.set(0, s.turn, -h * 0.18)
    head.current.position.y = 0.315 - h * 0.012
  })
  return (
    <group position={position} rotation-y={ry} userData={LIVE}>
      <group ref={g}>
        <mesh geometry={geo.body} material={OWL} castShadow receiveShadow />
        <group ref={head} position={[0.01, 0.315, 0]}>
          <mesh geometry={geo.head} material={OWL} castShadow />
          {[-1, 1].map((k) => (
            <group key={k}>
              <mesh geometry={SPH} material={T.eye} scale={0.021} position={[0.094, 0.012, k * 0.036]} />
              <mesh geometry={SPH} material={T.glint} scale={0.006} position={[0.112, 0.02, k * 0.032]} />
            </group>
          ))}
        </group>
      </group>
    </group>
  )
}
