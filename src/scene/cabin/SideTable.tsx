import { M } from '../materials'
import { Part, cyl } from '../parts'

/** Table ronde à côté du fauteuil : la lampe et le chocolat chaud sont posés dessus (voir CabinScene). */
export function SideTable() {
  return (
    <>
      <Part geo={cyl(0.66, 0.66, 0.06, 40)} m={M.toffeeLight} p={[2.0, 0.59, -0.65]} />
      <Part geo={cyl(0.07, 0.09, 0.56, 14)} m={M.toffee} p={[2.0, 0.29, -0.65]} />
      <Part geo={cyl(0.27, 0.29, 0.04, 24)} m={M.toffee} p={[2.0, 0.02, -0.65]} />
    </>
  )
}
