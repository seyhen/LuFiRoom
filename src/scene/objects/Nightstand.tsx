import { M } from '../materials'
import { Part, SPH, rbox } from '../parts'

/** Table de chevet, son tiroir et son bouton. */
export function Nightstand() {
  return (
    <>
      <Part geo={rbox(0.8, 0.68, 0.78, 0.1)} m={M.toffeeLight} p={[-2.55, 0.34, -2.55]} />
      <Part geo={rbox(0.04, 0.2, 0.56, 0.02)} m={M.cream} p={[-2.14, 0.42, -2.55]} />
      <Part geo={SPH} m={M.plum} scale={0.035} p={[-2.11, 0.42, -2.55]} />
    </>
  )
}
