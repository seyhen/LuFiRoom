import { Part, SPH, cyl, orient, rbox, type V3 } from '../parts'
import { Foliage } from '../nature/Foliage'
import { foliage, moss, stone } from '../nature/materials'
import { K } from './materials'

const needles = foliage(0x3a9a62), needlesLight = foliage(0x5cb878), cushion = moss(0x5f9a4a), pebble = stone(0x8a8296)

/** Un tube de tronc entre deux points, avec une articulation arrondie au bout. */
function Limb({ a, b, r0, r1 }: { a: V3; b: V3; r0: number; r1: number }) {
  const d: V3 = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...d)
  return (
    <>
      <Part geo={cyl(r1, r0, len, 10)} m={K.woodDark} p={[a[0] + d[0] / 2, a[1] + d[1] / 2, a[2] + d[2] / 2]} rotation={orient(d)} castShadow={false} />
      <Part geo={SPH} m={K.woodDark} scale={r1 * 1.05} p={b} castShadow={false} />
    </>
  )
}

/**
 * Un bonsaï de ruelle dans un pot d'émail bleu : un tronc noueux en S, des branches qui portent trois nuages de feuillage taillés
 * en plateaux, un tapis de mousse, deux galets, un pot sur quatre pieds. Il sort chaque soir devant la porte de l'izakaya.
 */
export function Bonsai({ position }: { position: V3 }) {
  return (
    <group position={position} scale={1.3}>
      {/* le pot : cuve émaillée, lèvre, pieds ; la terre, la mousse, les galets */}
      <Part geo={rbox(0.5, 0.14, 0.36, 0.045)} m={K.glazeBlue} p={[0, 0.1, 0]} />
      <Part geo={rbox(0.54, 0.03, 0.4, 0.014)} m={K.glazeBlue} p={[0, 0.175, 0]} castShadow={false} />
      {[-0.19, 0.19].flatMap((x) => [-0.11, 0.11].map((z) => <Part key={`${x}${z}`} geo={rbox(0.07, 0.03, 0.06, 0.012)} m={K.glazeBlue} p={[x, 0.015, z]} castShadow={false} />))}
      <Part geo={rbox(0.44, 0.02, 0.3, 0.008)} m={K.woodDark} p={[0, 0.185, 0]} castShadow={false} />
      <Part geo={SPH} m={cushion} scale={[0.15, 0.025, 0.1]} p={[-0.1, 0.197, 0.04]} castShadow={false} />
      <Part geo={SPH} m={cushion} scale={[0.1, 0.02, 0.08]} p={[0.13, 0.195, -0.05]} castShadow={false} />
      <Part geo={SPH} m={pebble} scale={[0.04, 0.025, 0.035]} p={[0.15, 0.2, 0.09]} castShadow={false} />
      <Part geo={SPH} m={pebble} scale={[0.03, 0.02, 0.028]} p={[-0.17, 0.198, -0.08]} castShadow={false} />
      {/* le tronc en S, évasé à la base, et les trois branches maîtresses */}
      <Part geo={SPH} m={K.woodDark} scale={[0.065, 0.045, 0.06]} p={[0, 0.2, 0]} castShadow={false} />
      <Limb a={[0, 0.2, 0]} b={[0.035, 0.32, 0.0]} r0={0.05} r1={0.04} />
      <Limb a={[0.035, 0.32, 0]} b={[-0.04, 0.44, 0.02]} r0={0.04} r1={0.032} />
      <Limb a={[-0.04, 0.44, 0.02]} b={[0.03, 0.56, 0]} r0={0.032} r1={0.024} />
      <Limb a={[0.03, 0.56, 0]} b={[0.0, 0.66, 0.0]} r0={0.024} r1={0.016} />
      <Limb a={[-0.04, 0.44, 0.02]} b={[-0.22, 0.5, 0.06]} r0={0.022} r1={0.014} />
      <Limb a={[0.03, 0.56, 0]} b={[0.22, 0.6, -0.04]} r0={0.02} r1={0.012} />
      <Limb a={[0.035, 0.32, 0]} b={[0.16, 0.4, 0.12]} r0={0.02} r1={0.012} />
      {/* les plateaux de feuillage, taillés en nuages : le grand à gauche, un moyen à droite, la couronne, un petit devant */}
      <Foliage v={1} p={[-0.23, 0.5, 0.06]} s={[0.2, 0.085, 0.17]} m={needles} style="clipped" />
      <Foliage v={3} p={[0.23, 0.6, -0.04]} s={[0.18, 0.08, 0.15]} m={needlesLight} style="clipped" ry={1} />
      <Foliage v={0} p={[0, 0.66, 0]} s={[0.15, 0.085, 0.14]} m={needles} style="clipped" ry={2} />
      <Foliage v={4} p={[0.17, 0.4, 0.13]} s={[0.1, 0.055, 0.09]} m={needlesLight} style="clipped" ry={0.5} />
    </group>
  )
}
