import { Part, SPH, cyl, rbox } from '../parts'
import { A } from './materials'

/**
 * Par terre, devant le tapis : un gros pouf tricoté où l'on s'assoit pour feuilleter, une pile de livres d'art avec une
 * tasse dessus ; près des toiles, un panier de dessins roulés.
 */
export function FloorNook() {
  return (
    <>
      <group position={[-0.55, 0, 2.45]}>
        {/* le pouf, ses côtes de tricot et son bouton */}
        <Part geo={SPH} m={A.ochre} scale={[0.36, 0.22, 0.36]} p={[0, 0.2, 0]} />
        {Array.from({ length: 8 }, (_, i) => {
          const a = (i / 8) * Math.PI * 2
          return <Part key={i} geo={SPH} m={A.ochre} scale={[0.07, 0.19, 0.07]} p={[Math.cos(a) * 0.3, 0.2, Math.sin(a) * 0.3]} castShadow={false} />
        })}
        <Part geo={cyl(0.035, 0.035, 0.03, 12)} m={A.terracotta} p={[0, 0.42, 0]} castShadow={false} />
        <Part geo={rbox(0.26, 0.025, 0.2, 0.01)} m={A.prussian} p={[0.05, 0.43, 0.02]} rotation={[0, 0.5, 0.06]} castShadow={false} />
      </group>
      <group position={[0.2, 0, 2.85]} rotation-y={0.3}>
        {[[0.36, 0.05, A.prussian], [0.32, 0.04, A.sage], [0.34, 0.06, A.cream], [0.28, 0.04, A.terracotta]].map(([w, h, m], i, arr) => {
          const y = arr.slice(0, i).reduce((acc, a) => acc + (a[1] as number), 0)
          return <Part key={i} geo={rbox(w as number, h as number, (w as number) * 0.75, 0.01)} m={m as typeof A.cream} p={[0, y + (h as number) / 2, 0]} rotation-y={(i % 2 ? 1 : -1) * 0.12} />
        })}
        <Part geo={cyl(0.045, 0.04, 0.09, 16)} m={A.white} p={[0.03, 0.235, 0]} />
        <Part m={A.white} p={[0.08, 0.24, 0]} rotation-y={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.025, 0.007, 6, 12]} />
        </Part>
      </group>
      <group position={[1.95, 0, 2.9]}>
        <Part geo={cyl(0.17, 0.14, 0.36, 18)} m={A.basket} p={[0, 0.18, 0]} />
        {[[0.04, 0.02, 0.62, 0.1], [-0.05, 0.03, 0.7, -0.12], [0.02, -0.06, 0.55, 0.18], [-0.03, -0.02, 0.5, -0.05]].map(([x, z, h, t], i) => (
          <Part key={i} geo={cyl(0.03, 0.03, h, 12)} m={i % 2 ? A.paper : A.white} p={[x, h / 2 + 0.02, z]} rotation-z={t} castShadow={i === 1} />
        ))}
      </group>
    </>
  )
}
