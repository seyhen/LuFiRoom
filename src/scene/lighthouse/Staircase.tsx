import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import { Part, cyl, rbox } from '../parts'
import { L } from './materials'

/** L'escalier en colimaçon : son centre, son rayon, le nombre de marches, la hauteur de chacune et l'angle entre deux. */
export const STAIRS = { x: -2.05, z: 1.35, r: 0.8, n: 14, rise: 0.28, turn: 0.49, y0: 0.28, a0: 0.5 }

const steps = Array.from({ length: STAIRS.n }, (_, i) => ({ a: STAIRS.a0 + i * STAIRS.turn, y: STAIRS.y0 + i * STAIRS.rise }))
// La rampe : une hélice continue à 85 cm au-dessus des marches, au bord extérieur.
const rail = new TubeGeometry(
  new CatmullRomCurve3(
    Array.from({ length: STAIRS.n * 6 }, (_, i) => {
      const k = i / 6, a = STAIRS.a0 + k * STAIRS.turn, y = STAIRS.y0 + k * STAIRS.rise + 0.86, r = STAIRS.r - 0.03
      return new Vector3(STAIRS.x + Math.cos(a) * r, y, STAIRS.z + Math.sin(a) * r)
    }),
  ),
  STAIRS.n * 14,
  0.025,
  8,
  false,
)

/**
 * L'escalier de fonte qui monte vers la lanterne : un fût central, des marches en tôle larmée qui tournent d'un cran à chaque
 * pas, des balustres, une rampe de chêne sombre. Il sort par le haut de la pièce.
 */
export function Staircase() {
  const { x, z, r } = STAIRS
  return (
    <>
      <Part geo={cyl(0.3, 0.34, 0.06, 28)} m={L.iron} p={[x, 0.03, z]} />
      <Part geo={cyl(0.075, 0.075, 4.34, 16)} m={L.iron} p={[x, 2.17, z]} />
      {steps.map(({ a, y }, i) => (
        <group key={i} position={[x, y, z]} rotation-y={-a}>
          {/* la marche : tôle larmée, plus large vers l'extérieur ; son nez est relevé d'un liseré clair */}
          <Part geo={rbox(r - 0.06, 0.05, 0.4, 0.02)} m={L.ironLight} p={[(r - 0.06) / 2 + 0.05, 0, 0]} />
          <Part geo={rbox(0.045, 0.06, 0.4, 0.015)} m={L.brassDull} p={[r - 0.02, 0.005, 0]} castShadow={false} />
          {/* la contremarche ajourée : un seul fer plat sous le nez */}
          <Part geo={rbox(r * 0.55, 0.04, 0.03, 0.01)} m={L.iron} p={[r * 0.5, -0.12, 0.17]} castShadow={false} />
          {/* le balustre, au bord extérieur */}
          <Part geo={cyl(0.012, 0.012, 0.86, 6)} m={L.iron} p={[r - 0.03, 0.43, 0]} castShadow={false} />
        </group>
      ))}
      <mesh geometry={rail} material={L.oakDark} castShadow receiveShadow />
    </>
  )
}
