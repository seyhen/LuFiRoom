import { M } from '../materials'
import { Part, cyl, rbox } from '../parts'

const LEGS = [[-2.85, -1.82], [-2.85, 0.42], [-0.35, -1.82], [-0.35, 0.42]]

/** Lit : cadre, matelas, tête de lit, oreillers, couette et son revers. */
export function Bed() {
  return (
    <>
      <Part geo={rbox(2.75, 0.34, 2.5, 0.1)} m={M.toffee} p={[-1.6, 0.3, -0.7]} />
      {LEGS.map(([x, z]) => (
        <Part key={`${x}${z}`} geo={cyl(0.06, 0.05, 0.16, 14)} m={M.toffee} p={[x, 0.08, z]} />
      ))}
      <Part geo={rbox(2.6, 0.32, 2.36, 0.13)} m={M.cream} p={[-1.6, 0.62, -0.7]} />
      <Part geo={rbox(0.24, 1.3, 2.6, 0.1)} m={M.toffee} p={[-2.86, 0.78, -0.7]} />
      {[-1.28, -0.12].map((z, i) => (
        <Part key={z} geo={rbox(0.5, 0.26, 0.98, 0.12)} m={M.pillow} p={[-2.4, 0.93, z]} rotation={[0, i ? 0.06 : -0.05, 0.28]} />
      ))}
      <Part geo={rbox(1.75, 0.12, 2.46, 0.06)} m={M.teal} p={[-1.12, 0.82, -0.7]} />
      <Part geo={rbox(0.26, 0.135, 2.47, 0.065)} m={M.tealLight} p={[-2.0, 0.84, -0.7]} />
    </>
  )
}
