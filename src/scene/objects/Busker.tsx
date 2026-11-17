import { useRef, type ReactNode } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshStandardMaterial, type Group, type Texture } from 'three'
import { approach } from '../../math'
import { isActive, useStore } from '../../state/store'
import type { ObjectId } from '../../rooms/types'
import { reduceMotion, useSquash } from '../anim'
import { far } from '../materials'
import { skyFade, type FadeOpts } from '../outdoor'
import { LIVE, Static } from '../Static'
import { Part, SPH, cyl, orient, rbox, type V3 } from '../parts'

// Un musicien de rue gummy, vu de loin (sur un toit voisin) : jambes, buste, bras qui tiennent l'instrument, tête aux yeux fermés.
// Interactif : touché, il joue, et son buste se balance doucement (la phase s'additionne image après image). `children` : l'instrument,
// en coordonnées du pied du musicien (+z devant lui, l'origine au sol) ; `hands` : où se posent ses mains dans ce repère.

export interface BuskerColors { shirt: number; pants: number; hair: number; shoe?: number; skin?: number; /** Un haut à motif (rayures) : la texture remplace la couleur du haut. */ shirtMap?: Texture }
export interface BuskerMats { skin: MeshStandardMaterial; shirt: MeshStandardMaterial; pants: MeshStandardMaterial; hair: MeshStandardMaterial; shoe: MeshStandardMaterial; eye: MeshStandardMaterial }

/** Les matériaux du musicien, fondus dans le ciel comme le reste du dehors. */
export function buskerMats(fade: FadeOpts, c: BuskerColors): BuskerMats {
  const f = (color: number, roughness = 0.6) => skyFade(far(color, { roughness }), fade)
  return { skin: f(c.skin ?? 0xe8b894), shirt: skyFade(far(c.shirtMap ? 0xffffff : c.shirt, { roughness: 0.6, map: c.shirtMap ?? null }), fade), pants: f(c.pants, 0.7), hair: f(c.hair, 0.8), shoe: f(c.shoe ?? 0x3a2c28, 0.5), eye: f(0x2a2024) }
}

const HIP = 0.74, SHOULDER: V3 = [0.25, 1.26, 0]

/** Un bras de l'épaule `a` à la main `b` : un tube, un coude arrondi, la main. */
function Arm({ a, b, m, skin }: { a: V3; b: V3; m: MeshStandardMaterial; skin: MeshStandardMaterial }) {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...d)
  return (
    <group>
      <Part geo={cyl(0.062, 0.058, len, 10)} m={m} p={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={orient(d)} castShadow={false} />
      <Part geo={SPH} m={m} p={a} scale={0.075} castShadow={false} />
      <Part geo={SPH} m={skin} p={b} scale={0.07} castShadow={false} />
    </group>
  )
}

export function Busker({ id, at, ry, mats, hands, head, children, scale = 1 }: {
  id: ObjectId
  at: V3
  ry: number
  mats: BuskerMats
  /** Mains gauche et droite (du musicien : sa gauche est du côté +x quand il regarde vers +z). */
  hands: [V3, V3]
  /** Le couvre-chef, en coordonnées du pied. */
  head?: ReactNode
  children?: ReactNode
  scale?: number
}) {
  const root = useRef<Group>(null!), upper = useRef<Group>(null!)
  const s = useRef({ amp: 0, phase: 0 })
  useSquash(id, root)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), S = s.current
    S.amp = approach(S.amp, isActive(useStore.getState(), id) && !reduceMotion ? 1 : 0, dt * 1.2)
    S.phase += dt * 1.7
    upper.current.rotation.z = Math.sin(S.phase) * 0.06 * S.amp
    upper.current.rotation.x = Math.sin(S.phase * 0.5 + 1) * 0.035 * S.amp
  })
  return (
    <group ref={root} position={at} rotation-y={ry} userData={{ id }}>
      <group scale={scale}>
      <Static>
        {/* les jambes et les chaussures : elles ne bougent pas */}
        {[-0.1, 0.1].map((x) => (
          <group key={x}>
            <Part geo={cyl(0.085, 0.08, HIP - 0.05, 12)} m={mats.pants} p={[x, 0.05 + (HIP - 0.05) / 2, 0]} castShadow={false} />
            <Part geo={rbox(0.15, 0.09, 0.27, 0.04)} m={mats.shoe} p={[x, 0.045, 0.04]} castShadow={false} />
          </group>
        ))}
      </Static>
      <group ref={upper} position={[0, HIP, 0]} userData={LIVE}>
        <Static>
          <group position={[0, -HIP, 0]}>
            <Part geo={rbox(0.44, 0.2, 0.27, 0.07)} m={mats.pants} p={[0, HIP + 0.02, 0]} castShadow={false} />
            <Part geo={rbox(0.43, 0.58, 0.29, 0.1)} m={mats.shirt} p={[0, HIP + 0.3, 0]} castShadow={false} />
            <Part geo={cyl(0.07, 0.08, 0.1, 10)} m={mats.skin} p={[0, 1.34, 0]} castShadow={false} />
            <Part geo={SPH} m={mats.skin} p={[0, 1.58, 0]} scale={[0.22, 0.23, 0.215]} castShadow={false} />
            <Part geo={SPH} m={mats.hair} p={[0, 1.65, -0.035]} scale={[0.235, 0.2, 0.225]} castShadow={false} />
            {/* les yeux fermés : deux petits traits ; le nez */}
            {[-0.075, 0.075].map((x) => <Part key={x} geo={SPH} m={mats.eye} p={[x, 1.58, 0.205]} scale={[0.032, 0.011, 0.01]} castShadow={false} />)}
            <Part geo={SPH} m={mats.skin} p={[0, 1.54, 0.225]} scale={[0.03, 0.035, 0.03]} castShadow={false} />
            {head}
            <Arm a={[-SHOULDER[0], SHOULDER[1], 0]} b={hands[1]} m={mats.shirt} skin={mats.skin} />
            <Arm a={SHOULDER} b={hands[0]} m={mats.shirt} skin={mats.skin} />
            {children}
          </group>
        </Static>
      </group>
      </group>
    </group>
  )
}
