import { M } from '../materials'
import { Part, SPH, rbox, worldUV } from '../parts'
import { C } from './materials'

// Dans le repère de la cheminée : sous le manteau, devant chaque pilier. Le pied pointe vers l'extérieur.
const PAIR = [
  { x: -0.86, m: C.cranberry, s: -1 },
  { x: 0.88, m: C.pineLight, s: 1 },
]

/** Deux chaussettes de Noël pendues à des crochets dorés : revers en tricot, bout crème. */
export function Stockings() {
  return (
    <>
      {PAIR.map(({ x, m, s }) => (
        <group key={x} position={[x, 1.66, 0.45]} rotation-z={s * 0.05}>
          <Part geo={SPH} m={C.gold} scale={0.035} p={[0, -0.01, -0.02]} castShadow={false} />
          <Part geo={rbox(0.2, 0.4, 0.1, 0.08)} m={m} p={[0, -0.32, 0]} castShadow={false} />
          <Part geo={SPH} m={m} scale={[0.16, 0.095, 0.055]} p={[s * 0.07, -0.5, 0]} castShadow={false} />
          <Part geo={SPH} m={M.cream} scale={[0.06, 0.06, 0.05]} p={[s * 0.19, -0.5, 0]} castShadow={false} />
          <Part geo={worldUV(rbox(0.25, 0.13, 0.125, 0.05), 0.4)} m={C.knit} p={[0, -0.1, 0]} castShadow={false} />
        </group>
      ))}
    </>
  )
}
