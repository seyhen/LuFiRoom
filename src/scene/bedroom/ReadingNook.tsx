import { LatheGeometry, SplineCurve, Vector2 } from 'three'
import { TAU } from '../../math'
import { M } from '../materials'
import { Part, cyl, rbox } from '../parts'
import { Candles } from '../objects/Candles'
import { B } from './materials'

// Un pouf-poire, lisse (un profil adouci, tourné autour de l'axe).
const bag = new LatheGeometry(
  new SplineCurve([[0, 0], [0.5, 0.02], [0.62, 0.17], [0.6, 0.4], [0.5, 0.58], [0.36, 0.7], [0.2, 0.7], [0.1, 0.66], [0, 0.64]].map(([x, y]) => new Vector2(x, y))).getPoints(32),
  36,
)
/** Coin lecture : pouf-poire beurre avec un coussin rose, tabouret en bois et une bougie qui brille la nuit (le diffuseur d'huiles est dessus : Diffuser). */
export function ReadingNook() {
  return (
    <>
      <group position={[2.15, 0, 0.9]} rotation-y={-0.5} scale={0.82}>
        <Part geo={bag} m={M.butter} scale={[1, 0.95, 0.92]} />
        <Part m={M.butterDeep} p={[0, 0.56, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.5, 0.012, 6, 36]} />
        </Part>
        <Part geo={rbox(0.4, 0.4, 0.13, 0.06)} m={B.blush} p={[-0.34, 0.66, 0]} rotation={[0, Math.PI / 2, 0.55]} />
      </group>
      {/* tabouret */}
      <Part geo={cyl(0.27, 0.27, 0.05, 28)} m={M.woodLight} p={[2.82, 0.5, 0.5]} />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * TAU + 0.6
        return <Part key={i} geo={cyl(0.03, 0.025, 0.5, 10)} m={M.woodLeg} p={[2.82 + Math.cos(a) * 0.17, 0.24, 0.5 + Math.sin(a) * 0.17]} rotation={[-Math.sin(a) * 0.12, 0, Math.cos(a) * 0.12]} />
      })}
      <Candles items={[{ p: [2.95, 0.525, 0.64], h: 0.13, r: 0.055 }]} />
    </>
  )
}
