import { M } from '../materials'
import { Part, cyl, rbox } from '../parts'
import { C } from './materials'

/** Fauteuil tourné vers la cheminée, avec un plaid sur l'accoudoir. */
export function Armchair() {
  return (
    <group position={[0.1, 0, -0.95]} rotation-y={Math.PI / 4} scale={1.15}>
      {[[-0.34, -0.3], [0.34, -0.3], [-0.34, 0.3], [0.34, 0.3]].map(([x, z]) => (
        <Part key={`${x}${z}`} geo={cyl(0.05, 0.04, 0.2, 10)} m={M.toffee} p={[x, 0.1, z]} />
      ))}
      <Part geo={rbox(1.0, 0.3, 0.94, 0.12)} m={M.teal} p={[0, 0.33, 0]} />
      <Part geo={rbox(0.86, 0.14, 0.78, 0.07)} m={M.tealLight} p={[0, 0.54, -0.03]} />
      <Part geo={rbox(1.0, 0.78, 0.26, 0.12)} m={M.teal} p={[0, 0.76, 0.34]} />
      {[-0.5, 0.5].map((x) => (
        <Part key={x} geo={rbox(0.2, 0.46, 0.94, 0.09)} m={M.teal} p={[x, 0.56, 0]} />
      ))}
      <Part geo={rbox(0.24, 0.05, 0.6, 0.02)} m={M.pink} p={[0.5, 0.82, 0.02]} rotation-z={0.06} />
      <Part geo={rbox(0.42, 0.34, 0.14, 0.07)} m={M.butter} p={[-0.22, 0.78, 0.2]} rotation-z={0.2} />
      <Part geo={rbox(0.36, 0.01, 0.9, 0.004)} m={C.wool} p={[0.5, 0.835, 0.02]} />
    </group>
  )
}
