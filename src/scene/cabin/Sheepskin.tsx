import { Part, SPH } from '../parts'
import { C } from './materials'

/** Peau de mouton devant la cheminée. */
export function Sheepskin() {
  return <Part geo={SPH} m={C.wool} scale={[1.15, 0.045, 0.85]} p={[-1.9, 0.04, -1.5]} />
}
