import { Part, SPH } from '../parts'
import { C } from './materials'

/** Peau de mouton devant la cheminée, posée un peu au-dessus du tapis tressé qu'elle chevauche. */
export function Sheepskin() {
  return <Part geo={SPH} m={C.wool} scale={[1.15, 0.045, 0.85]} p={[-1.9, 0.06, -1.5]} />
}
