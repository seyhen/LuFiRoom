import { Part, SPH, cyl, rbox } from '../parts'
import { LatheGeometry, Vector2 } from 'three'
import { A } from './materials'

/** Le coussin du repose-pieds : un cylindre bas aux bords bien ronds, le dessus un peu bombé. */
const cushion = (() => {
  const R = 0.28, H = 0.2, K = 0.07, pts = [new Vector2(0.001, 0)]
  for (let i = 0; i <= 6; i++) {
    const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2)
    pts.push(new Vector2(R - K + Math.cos(a) * K, K + Math.sin(a) * K))
  }
  for (let i = 0; i <= 6; i++) {
    const a = (i / 6) * (Math.PI / 2)
    pts.push(new Vector2(R - K + Math.cos(a) * K, H - K + Math.sin(a) * K))
  }
  pts.push(new Vector2(0.001, H + 0.01))
  return new LatheGeometry(pts, 32)
})()

/**
 * Devant le fauteuil, son repose-pieds ; par terre, une pile de livres d'art avec une tasse dessus ; près des toiles, un
 * panier de dessins roulés.
 */
export function FloorNook() {
  return (
    <>
      {/* le repose-pieds assorti au fauteuil : coussin capitonné sur quatre pieds de chêne fuselés, un carnet posé dessus */}
      <group position={[-0.5, 0, 2.5]} rotation-y={0.4}>
        {[0, 1, 2, 3].map((i) => {
          const a = (i / 4) * Math.PI * 2 + Math.PI / 4
          return <Part key={i} geo={cyl(0.018, 0.012, 0.14, 8)} m={A.oakDark} p={[Math.cos(a) * 0.2, 0.07, Math.sin(a) * 0.2]} rotation={[-Math.sin(a) * 0.18, 0, Math.cos(a) * 0.18]} />
        })}
        <Part geo={cushion} m={A.ochre} p={[0, 0.13, 0]} />
        {[[0, 0], [0.12, 0.05], [-0.12, -0.05], [0.05, -0.12], [-0.05, 0.12]].map(([x, z], i) => (
          <Part key={i} geo={SPH} m={A.ochreDeep} scale={[0.016, 0.008, 0.016]} p={[x, 0.335, z]} castShadow={false} />
        ))}
        <Part geo={rbox(0.2, 0.02, 0.15, 0.008)} m={A.prussian} p={[0.06, 0.345, 0.02]} rotation-y={0.5} castShadow={false} />
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
      <group position={[2.55, 0, 0.55]}>
        <Part geo={cyl(0.17, 0.14, 0.36, 18)} m={A.basket} p={[0, 0.18, 0]} />
        {[[0.04, 0.02, 0.62, 0.1], [-0.05, 0.03, 0.7, -0.12], [0.02, -0.06, 0.55, 0.18], [-0.03, -0.02, 0.5, -0.05]].map(([x, z, h, t], i) => (
          <Part key={i} geo={cyl(0.03, 0.03, h, 12)} m={i % 2 ? A.paper : A.white} p={[x, h / 2 + 0.02, z]} rotation-z={t} castShadow={i === 1} />
        ))}
      </group>
    </>
  )
}
