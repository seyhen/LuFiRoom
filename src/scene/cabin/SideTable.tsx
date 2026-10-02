import { M } from '../materials'
import { Part, cyl } from '../parts'

/** Petite table ronde à côté du fauteuil : la lampe est posée dessus (voir CabinScene). */
export function SideTable() {
  return (
    <>
      <Part geo={cyl(0.38, 0.38, 0.06, 28)} m={M.toffeeLight} p={[1.4, 0.59, -1.75]} />
      <Part geo={cyl(0.06, 0.08, 0.56, 14)} m={M.toffee} p={[1.4, 0.29, -1.75]} />
      <Part geo={cyl(0.22, 0.24, 0.04, 22)} m={M.toffee} p={[1.4, 0.02, -1.75]} />
    </>
  )
}
