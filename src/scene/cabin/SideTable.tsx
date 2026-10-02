import { M } from '../materials'
import { Part, cyl, type V3 } from '../parts'

/** Petite table ronde : la lampe est posée dessus (voir les scènes). Par défaut à côté du fauteuil de la cabane. */
export function SideTable({ position = [1.4, 0, -1.75] }: { position?: V3 }) {
  const [x, , z] = position
  return (
    <>
      <Part geo={cyl(0.38, 0.38, 0.06, 28)} m={M.toffeeLight} p={[x, 0.59, z]} />
      <Part geo={cyl(0.06, 0.08, 0.56, 14)} m={M.toffee} p={[x, 0.29, z]} />
      <Part geo={cyl(0.22, 0.24, 0.04, 22)} m={M.toffee} p={[x, 0.02, z]} />
    </>
  )
}
