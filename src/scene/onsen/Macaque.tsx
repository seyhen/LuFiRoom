import { useMemo } from 'react'
import { Part, SPH, rbox, type V3 } from '../parts'
import { blob, cone, ell, pair } from '../blob'
import { skin } from '../materials'
import { O } from './materials'

// La fourrure : gris-brun des macaques des neiges, plus claire aux joues et au poitrail, plus sombre au front et sur le dos.
const FUR = 0x8f7b68, FUR_DARK = 0x6a584a, FUR_LIGHT = 0xcdbba2, SKIN = 0xd9604f, SKIN_LIGHT = 0xeb8e7c, EAR = 0xe49a8c

// Un macaque d'une seule peau : dos et épaules rondes et fourrées, grosse tête, face rouge modelée (joues, museau court, front), collier de
// poils épais, petites oreilles rondes, deux bras posés devant. Il regarde vers +z. Calculé une fois.
const GEO = blob(
  [
    // le dos et les épaules, qui dépassent de l'eau ; le corps plonge bien plus bas, sous la surface
    ell([0, 0.06, -0.1], [0.34, 0.27, 0.26], { color: FUR, k: 0.06 }),
    ell([0, 0.2, -0.16], [0.27, 0.15, 0.2], { color: FUR_DARK, k: 0.08 }),
    // le poitrail clair, juste sous le menton
    ell([0, 0.13, 0.1], [0.2, 0.12, 0.12], { color: FUR_LIGHT, k: 0.06 }),
    // les bras : de l'épaule au poing, posés sur l'eau devant lui
    ...pair(cone([0.27, 0.16, -0.02], [0.3, 0.12, 0.3], 0.085, 0.065, { color: FUR, k: 0.05 }), 'x'),
    ...pair(ell([0.3, 0.115, 0.34], [0.058, 0.04, 0.06], { color: SKIN_LIGHT, k: 0.03 }), 'x'),
    // la tête, grosse et ronde
    ell([0, 0.37, 0.03], [0.255, 0.23, 0.23], { color: FUR, k: 0.06 }),
    // le dessus du crâne et le front, plus sombres
    ell([0, 0.47, -0.05], [0.2, 0.1, 0.16], { color: FUR_DARK, k: 0.06 }),
    // le collier de poils : des joues larges et claires, une barbe sous le menton
    ...pair(ell([0.2, 0.31, 0.09], [0.115, 0.115, 0.12], { color: FUR_LIGHT, k: 0.05 }), 'x'),
    ell([0, 0.2, 0.1], [0.19, 0.075, 0.12], { color: FUR_LIGHT, k: 0.06 }),
    ...pair(ell([0.12, 0.215, 0.14], [0.1, 0.07, 0.09], { color: FUR_LIGHT, k: 0.05 }), 'x'),
    // la face nue : un masque large et bombé qui avance dans les poils
    ell([0, 0.35, 0.19], [0.16, 0.13, 0.1], { color: SKIN, k: 0.02 }), ell([0, 0.3, 0.2], [0.14, 0.12, 0.1], { color: SKIN, k: 0.03 }),
    ...pair(ell([0.085, 0.3, 0.225], [0.07, 0.065, 0.06], { color: SKIN, k: 0.025 }), 'x'),
    // le museau court, plus clair, et le nez
    ell([0, 0.285, 0.272], [0.075, 0.058, 0.058], { color: SKIN_LIGHT, k: 0.03 }),
    // l'arcade des sourcils
    ...pair(ell([0.075, 0.435, 0.22], [0.075, 0.022, 0.04], { color: FUR_DARK, k: 0.025 }), 'x'),
    // les oreilles rondes, avec un creux rose
    ...pair(ell([0.255, 0.38, 0.02], [0.07, 0.075, 0.05], { color: FUR, k: 0.04, rot: [0, 0.2, 0] }), 'x'),
    ...pair(ell([0.285, 0.38, 0.04], [0.04, 0.05, 0.03], { color: EAR, k: 0.025 }), 'x'),
  ],
  {
    h: 0.026,
    k: 0.045,
  },
)

/** Le matériau d'une seule peau : un peu moins verni que le gummy, pour de la fourrure. */
const SKIN_MAT = skin({ roughness: 0.82, clearcoat: 0.06 })

/**
 * Un macaque japonais qui prend son bain, de l'eau jusqu'aux épaules : une grosse tête ronde, la face rose-rouge dans un collier de
 * poils épais, deux petites oreilles, les yeux fermés d'aise, une serviette pliée sur le crâne, les bras posés devant lui. `p` est
 * le point de l'eau sous lui (la surface passe 0,1 plus haut), `s` sa taille (0,6 pour le petit). Il regarde vers la caméra (+x, +z).
 */
export function Macaque({ p, s = 1, ry = Math.PI / 4 }: { p: V3; s?: number; ry?: number }) {
  const geo = useMemo(() => GEO, [])
  return (
    <group position={p} rotation-y={ry} scale={s}>
      <mesh geometry={geo} material={SKIN_MAT} castShadow receiveShadow />
      {/* les yeux fermés d'aise : deux arcs épais */}
      {[-1, 1].map((x) => (
        <Part key={x} m={O.eye} p={[x * 0.082, 0.382, 0.277]} rotation={[-0.2, x * 0.32, Math.PI]} castShadow={false}>
          <torusGeometry args={[0.036, 0.0105, 6, 14, Math.PI]} />
        </Part>
      ))}
      {/* le sourire : un trait sous le nez */}
      <Part m={O.eye} p={[0, 0.272, 0.327]} rotation={[0.35, 0, Math.PI]} castShadow={false}>
        <torusGeometry args={[0.03, 0.006, 6, 12, Math.PI]} />
      </Part>
      {/* les narines */}
      {[-1, 1].map((x) => (
        <Part key={x} geo={SPH} m={O.eye} scale={[0.0075, 0.009, 0.006]} p={[x * 0.02, 0.302, 0.335]} castShadow={false} />
      ))}
      {/* la serviette pliée sur le crâne, comme on la pose pour ne pas avoir trop chaud */}
      <Part geo={rbox(0.26, 0.055, 0.19, 0.022)} m={O.towel} p={[0, 0.585, -0.02]} rotation-z={0.06} />
      <Part geo={rbox(0.26, 0.012, 0.19, 0.005)} m={O.indigo} p={[0, 0.553, -0.02]} rotation-z={0.06} castShadow={false} />
    </group>
  )
}
