import { M } from '../materials'
import { Part, SPH, rbox } from '../parts'
import { C } from './materials'

/** Coffre en bois sous la fenêtre : la radio est posée dessus (voir CabinScene). */
export function Chest() {
  return (
    <>
      <Part geo={rbox(1.4, 0.64, 0.72, 0.1)} m={C.beam} p={[1.9, 0.32, -2.7]} />
      <Part geo={rbox(1.46, 0.1, 0.78, 0.06)} m={M.toffeeLight} p={[1.9, 0.66, -2.7]} />
      <Part geo={rbox(1.2, 0.05, 0.03, 0.015)} m={M.cream} p={[1.9, 0.46, -2.33]} />
      <Part geo={SPH} m={M.plum} scale={[0.07, 0.05, 0.03]} p={[1.9, 0.5, -2.32]} />
    </>
  )
}
