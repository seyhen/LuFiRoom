import { Part, rbox } from '../parts'
import { K } from './materials'

/** Ardoise du menu, au-dessus du comptoir. */
export function Chalkboard() {
  return (
    <>
      <Part geo={rbox(1.95, 1.25, 0.07, 0.03)} m={K.walnut} p={[-1.4, 3.0, -2.96]} />
      <mesh material={K.chalk} position={[-1.4, 3.0, -2.918]} receiveShadow>
        <planeGeometry args={[1.75, 1.05]} />
      </mesh>
    </>
  )
}
