import { Color } from 'three'
import { TAU } from '../../math'
import { M } from '../materials'
import { Part, cyl, rbox } from '../parts'
import { blob, ell } from '../blob'
import { Candles } from '../objects/Candles'
import { B } from './materials'

// Un pouf-poire en velours menthe, d'une seule peau (blob) : une grosse goutte affaissée, le dossier qui remonte derrière, le creux
// laissé par celui qui vient de s'y asseoir. Un passepoil plus foncé court au ras du sol, le velours fonce vers le bas.
const VELVET = 0x9fd9c6, VELVET_DEEP = 0x6fbca6
const deep = new Color(VELVET_DEEP), seam = new Color(0x5aa892)
const POUF = blob(
  [
    ell([0, 0.22, 0], [0.5, 0.22, 0.46], { color: VELVET, k: 0.08 }),
    ell([-0.2, 0.4, 0], [0.28, 0.3, 0.4], { color: VELVET, k: 0.12 }),
    ell([0.12, 0.3, 0], [0.34, 0.16, 0.36], { color: VELVET, k: 0.1 }),
    // le creux de l'assise
    ell([0.12, 0.5, 0.02], [0.24, 0.12, 0.25], { op: 'sub', k: 0.1 }),
  ],
  {
    h: 0.022,
    k: 0.08,
    paint: (p, c) => {
      c.lerp(deep, Math.max(0, Math.min(1, (0.3 - p.y) / 0.3)) * 0.45)
      if (Math.abs(p.y - 0.07) < 0.014) c.lerp(seam, 0.8)
      return c
    },
  },
)

/** Coin lecture : pouf-poire en velours menthe avec un coussin rose, tabouret en bois et une bougie qui brille la nuit (le diffuseur d'huiles est dessus : Diffuser). */
export function ReadingNook() {
  return (
    <>
      <group position={[1.92, 0, 1.02]} rotation-y={-0.5}>
        <Part geo={POUF} m={B.plush} />
        {/* le coussin calé contre le dossier, un peu de travers */}
        <group position={[-0.2, 0.62, 0.04]} rotation={[0, Math.PI / 2, 0.42]}>
          <Part geo={rbox(0.36, 0.36, 0.12, 0.06)} m={B.blush} />
          {/* le bouton capitonné, sur la face qui regarde la pièce */}
          {[1, -1].map((s) => (
            <Part key={s} m={B.blushDeep} p={[0, 0, s * 0.058]} castShadow={false}>
              <torusGeometry args={[0.03, 0.012, 6, 14]} />
            </Part>
          ))}
        </group>
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
