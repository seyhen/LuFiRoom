import { M } from '../materials'
import { Part, cyl } from '../parts'

/** Table ronde à côté du fauteuil : la lampe et le chocolat chaud sont posés dessus (voir CabinScene). */
export function SideTable() {
  return (
    <>
      <Part geo={cyl(0.66, 0.66, 0.06, 40)} m={M.toffeeLight} p={[1.5, 0.59, -1.62]} />
      <Part geo={cyl(0.07, 0.09, 0.56, 14)} m={M.toffee} p={[1.5, 0.29, -1.62]} />
      <Part geo={cyl(0.27, 0.29, 0.04, 24)} m={M.toffee} p={[1.5, 0.02, -1.62]} />
    </>
  )
}
