import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, Matrix4, Quaternion, TorusGeometry, Vector3, type Group } from 'three'
import { blob, cone, ell } from '../blob'
import { skin } from '../materials'
import { reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { type V3 } from '../parts'
import { A } from './materials'

// Le chat noir de l'atelier, un « smoking » parisien : noir, plastron, museau et chaussettes blancs. Il dort en rond, le nez dans
// la queue. Repère : le visage vers +x (le groupe le tourne vers la caméra), le dessous à y = 0 (le dessus du pouf).
const BLACK = 0x2d2a33, WHITE = 0xf3ede4, PINK = 0xe39aa8
const HEAD: V3 = [0.12, 0.105, 0.07], HEAD_R: V3 = [0.088, 0.078, 0.095]
// la tête est un peu tournée vers le flanc visible (+z)
const YAW = 0.45

function build() {
  const fx = Math.cos(YAW), fz = Math.sin(YAW)
  // un point de la tête dans le repère du visage : a (devant), u (haut), s (côté)
  const at = (a: number, u: number, s: number): V3 => [HEAD[0] + a * fx - s * fz, HEAD[1] + u, HEAD[2] + a * fz + s * fx]
  // la queue fait le tour du corps par devant, jusque sous le menton
  const tail: V3[] = [180, 150, 120, 92, 66, 45].map((deg, i) => {
    const a = (deg * Math.PI) / 180, r = 0.205 - i * 0.004
    return [Math.cos(a) * r - 0.01, 0.042 - i * 0.002, Math.sin(a) * r + 0.0]
  })
  const vols = [
    // le corps roulé : la grosse miche, la hanche à l'arrière, l'épaule sous la tête
    ell([-0.04, 0.09, -0.02], [0.18, 0.092, 0.18], { color: BLACK, k: 0.06 }),
    ell([-0.12, 0.1, -0.08], [0.12, 0.1, 0.12], { color: BLACK }),
    ell([0.06, 0.085, -0.08], [0.11, 0.08, 0.1], { color: BLACK }),
    // le plastron blanc qui dépasse sous le menton
    ell([0.12, 0.055, 0.1], [0.07, 0.045, 0.075], { color: WHITE, k: 0.03 }),
    // la tête posée, le front noir, le museau blanc qui remonte en pointe entre les yeux
    ell(HEAD, HEAD_R, { color: BLACK, k: 0.05 }),
    ell(at(0.07, -0.022, 0), [0.05, 0.04, 0.056], { color: WHITE, k: 0.03, rot: [0, -YAW, 0] }),
    ell(at(0.074, 0.012, 0), [0.03, 0.03, 0.022], { color: WHITE, k: 0.025, rot: [0, -YAW, 0] }),
    ell(at(0.054, -0.052, 0), [0.04, 0.026, 0.044], { color: WHITE, k: 0.025, rot: [0, -YAW, 0] }),
    ell(at(0.118, 0.004, 0), [0.016, 0.013, 0.02], { color: PINK, k: 0.012, rot: [0, -YAW, 0] }),
    // les oreilles, larges et arrondies au bout
    ...[1, -1].map((s) => cone(at(-0.02, 0.05, s * 0.05), at(-0.03, 0.105, s * 0.068), 0.038, 0.016, { color: BLACK, k: 0.025 })),
    ...[1, -1].map((s) => ell(at(0.0, 0.085, s * 0.058), [0.016, 0.026, 0.02], { op: 'sub', k: 0.02, rot: [0, -YAW, 0] })),
    // les pattes de devant, chaussettes blanches, repliées sous la tête
    cone([0.06, 0.03, 0.14], [0.17, 0.026, 0.165], 0.033, 0.03, { color: WHITE, k: 0.02 }),
    cone([0.02, 0.03, 0.16], [0.11, 0.026, 0.2], 0.03, 0.028, { color: WHITE, k: 0.02 }),
    // la queue, noire, son bout sous le nez
    ...tail.slice(1).map((b, i) => cone(tail[i], b, 0.036 - i * 0.002, 0.034 - i * 0.002, { color: BLACK, k: 0.02 })),
  ]
  const cP = new Color(PINK), ears = [1, -1].map((s) => new Vector3(...at(0.0, 0.085, s * 0.058)))
  const body = blob(vols, {
    h: 0.017,
    k: 0.04,
    // le creux des oreilles rosé
    paint: (p, c) => {
      for (const e of ears) {
        const d = p.distanceTo(e)
        if (d < 0.035) c.lerp(cP, 0.7 * (1 - d / 0.035))
      }
      return c
    },
  })
  // les yeux fermés : deux petits arcs gris clair (sur le noir, ils se lisent), posés sur le front, au-dessus du museau
  const arc = new TorusGeometry(0.02, 0.0055, 6, 12, Math.PI * 0.8)
  arc.rotateZ(Math.PI * 1.1)
  const eyes = [1, -1].map((s) => {
    const p = new Vector3(...at(0.07, 0.034, s * 0.046))
    const n = new Vector3(0.75 * fx - s * 0.6 * fz, 0.3, 0.75 * fz + s * 0.6 * fx).normalize()
    const q = new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(n, new Vector3(), new Vector3(0, 1, 0)))
    return { p: p.addScaledVector(n, 0.008).toArray() as V3, q }
  })
  return { body, arc, eyes }
}

/** Le chat noir endormi sur le pouf, roulé en boule. Il respire doucement ; il ne fait pas de bruit (pas de son à lui). */
export function BlackCat({ position, rotation = 0 }: { position: V3; rotation?: number }) {
  const { body, arc, eyes } = useMemo(build, [])
  const breath = useRef<Group>(null!)
  const mat = useMemo(() => skin(), [])
  useFrame(({ clock }) => {
    if (reduceMotion) return
    const b = Math.sin(clock.elapsedTime * 1.6) * 0.5 + 0.5
    breath.current.scale.set(1 + b * 0.012, 1 + b * 0.025, 1 + b * 0.012)
  })
  return (
    <group position={position} rotation-y={rotation}>
      <group ref={breath} userData={LIVE}>
        <mesh geometry={body} material={mat} castShadow receiveShadow />
        {eyes.map((e, i) => (
          <mesh key={i} geometry={arc} material={A.catEye} position={e.p} quaternion={e.q} />
        ))}
      </group>
    </group>
  )
}
