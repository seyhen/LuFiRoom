import { Part, cyl } from '../parts'
import { C } from './materials'

// Une pile de bûches contre le mur de gauche : trois en bas, deux au milieu, une au sommet.
const LOGS = [[-2.9, 0.14], [-2.62, 0.14], [-2.34, 0.14], [-2.76, 0.37], [-2.48, 0.37], [-2.62, 0.6], [-2.9, 0.6], [-2.34, 0.6], [-2.76, 0.83], [-2.48, 0.83]]

/** Bois de chauffage empilé. */
export function Firewood() {
  return (
    <>
      {LOGS.map(([x, y], i) => (
        <Part key={i} geo={cyl(0.14, 0.14, 1.15, 16)} m={i % 2 ? C.log : C.beam} p={[x, y, 1.45]} rotation-x={Math.PI / 2} />
      ))}
    </>
  )
}
