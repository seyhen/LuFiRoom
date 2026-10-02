import { M } from '../materials'
import { Part, rbox } from '../parts'

export function Rug() {
  return <Part geo={rbox(2.9, 0.06, 2.0, 0.03)} m={M.peri} p={[0.35, 0.03, 1.3]} />
}
