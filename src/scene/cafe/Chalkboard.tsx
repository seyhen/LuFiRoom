import { Part, rbox } from '../parts'
import { K } from './materials'

/** Ardoise du menu, au-dessus du comptoir. */
export function Chalkboard() {
  return (
    <>
      <Part geo={rbox(1.66, 1.07, 0.07, 0.03)} m={K.walnut} p={[-1.62, 3.0, -2.96]} />
      <mesh material={K.chalk} position={[-1.62, 3.0, -2.918]} receiveShadow>
        <planeGeometry args={[1.5, 0.9]} />
      </mesh>
    </>
  )
}
