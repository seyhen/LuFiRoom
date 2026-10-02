import { M } from '../materials'
import { Part, cyl, rbox, worldUV } from '../parts'
import { C } from './materials'

/** Fauteuil canneberge tourné vers la cheminée : plaid écossais sur le dossier (côté pièce), coussin en tricot. */
export function Armchair() {
  return (
    <group position={[0.1, 0, -0.95]} rotation-y={Math.PI / 4} scale={1.15}>
      {[[-0.34, -0.3], [0.34, -0.3], [-0.34, 0.3], [0.34, 0.3]].map(([x, z]) => (
        <Part key={`${x}${z}`} geo={cyl(0.05, 0.04, 0.2, 10)} m={M.toffee} p={[x, 0.1, z]} />
      ))}
      <Part geo={rbox(1.0, 0.3, 0.94, 0.12)} m={C.cranberry} p={[0, 0.33, 0]} />
      <Part geo={rbox(0.86, 0.14, 0.78, 0.07)} m={C.cranberryLight} p={[0, 0.54, -0.03]} />
      <Part geo={rbox(1.0, 0.78, 0.26, 0.12)} m={C.cranberry} p={[0, 0.76, 0.34]} />
      {[-0.5, 0.5].map((x) => (
        <Part key={x} geo={rbox(0.2, 0.46, 0.94, 0.09)} m={C.cranberry} p={[x, 0.56, 0]} />
      ))}
      <Part geo={worldUV(rbox(0.42, 0.34, 0.14, 0.07), 0.4)} m={C.knit} p={[-0.22, 0.78, 0.2]} rotation-z={0.2} />
      {/* plaid jeté sur le dossier : posé dessus, il retombe derrière */}
      <group position={[0.12, 0, 0]} rotation-z={0.05}>
        <Part geo={worldUV(rbox(0.6, 0.05, 0.34, 0.025), 0.5)} m={C.tartan} p={[0, 1.165, 0.34]} />
        <Part geo={worldUV(rbox(0.6, 0.56, 0.05, 0.025), 0.5)} m={C.tartan} p={[0, 0.9, 0.495]} />
      </group>
    </group>
  )
}
