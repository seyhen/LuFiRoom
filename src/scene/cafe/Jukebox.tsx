import { useRef } from 'react'
import type { Group } from 'three'
import { gummy, M } from '../materials'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { reduceMotion } from '../anim'
import { useBeat } from '../objects/useBeat'
import { K } from './materials'

/** La vitre lumineuse : ambre pâle, qui s'allume quand la musique joue. */
const glass = gummy(0xffe3a8, { emissive: 0xffa24a, emissiveIntensity: 0.12, roughness: 0.4 })

/**
 * Un petit jukebox de comptoir : coffre de noyer, arche lumineuse où le disque noir tourne, ornements de laiton, fente à pièces.
 * La vitre s'allume et le disque tourne quand la musique joue. C'est l'objet « radio » du café.
 */
export function Jukebox({ position }: { position: V3 }) {
  const disc = useRef<Group>(null!)
  const { g, notes } = useBeat(position, 0.95, (on, t, pulse) => {
    glass.emissiveIntensity = on ? 0.7 + pulse * 0.3 : 0.12
    if (on && !reduceMotion) disc.current.rotation.z = -t * 3
  })
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position}>
        <Part geo={rbox(0.54, 0.05, 0.32, 0.02)} m={K.walnut} p={[0, 0.025, 0]} />
        <Part geo={rbox(0.48, 0.42, 0.28, 0.05)} m={K.walnut} p={[0, 0.26, 0]} />
        {/* l'arche : demi-cylindre de noyer, vitre lumineuse devant, le disque qui tourne dedans */}
        <Part geo={cyl(0.24, 0.24, 0.28, 28)} m={K.walnut} p={[0, 0.47, 0]} rotation-x={Math.PI / 2} />
        <Part geo={cyl(0.2, 0.2, 0.02, 28)} m={glass} p={[0, 0.47, 0.143]} rotation-x={Math.PI / 2} castShadow={false} />
        <Part geo={rbox(0.4, 0.2, 0.02, 0.008)} m={glass} p={[0, 0.36, 0.143]} castShadow={false} />
        <group ref={disc} position={[0, 0.45, 0.16]}>
          <Part geo={cyl(0.12, 0.12, 0.01, 28)} m={M.ink} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.04, 0.04, 0.014, 16)} m={M.red} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={rbox(0.012, 0.07, 0.014, 0.004)} m={M.cream} p={[0.07, 0, 0]} castShadow={false} />
        </group>
        <Part m={K.brass} p={[0, 0.47, 0.155]} castShadow={false}>
          <torusGeometry args={[0.21, 0.014, 8, 28, Math.PI]} />
        </Part>
        {/* la grille du haut-parleur en laiton, les touches, la fente à pièces */}
        {[0.1, 0.14, 0.18].map((y) => (
          <Part key={y} geo={rbox(0.36, 0.012, 0.014, 0.005)} m={K.brass} p={[0, y, 0.145]} castShadow={false} />
        ))}
        {[-0.14, -0.08, -0.02].map((x, i) => (
          <Part key={x} geo={SPH} m={[M.red, M.butter, M.mint][i]} scale={0.018} p={[x, 0.255, 0.146]} castShadow={false} />
        ))}
        <Part geo={rbox(0.05, 0.04, 0.012, 0.005)} m={K.brass} p={[0.16, 0.255, 0.146]} castShadow={false} />
      </group>
      <group ref={notes.group} />
    </>
  )
}
