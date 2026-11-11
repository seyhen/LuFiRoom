import type { Material } from 'three'
import { Part, cyl, noRay, type V3 } from '../parts'
import { B, Box, LOW, Link, SW } from './streetKit'
import { S, T as K } from './streetMaterials'

// Les maisons voisines, à moitié visibles : à gauche le relieur (boutique bordeaux, trois étages de grès, pignon à redents et
// cheminées), au fond à droite le pub qui ferme l'impasse (mansarde d'ardoise, lucarnes, fûts devant la porte), puis de chaque côté
// une maison plus basse qui s'efface dans la brume. Tout est modelé en boîtes arrondies, fenêtre par fenêtre. Les couleurs du café
// (`K` ici) sont leurs copies brumeuses (`T` de streetMaterials.ts) : tout s'efface au loin d'un même pas.

const rel = (h: number) => SW + h

/**
 * Une fenêtre à guillotine sur un mur : cadre blanc, croisillons, linteau et appui de pierre, jambages. `face` : le mur regarde +z ou +x.
 * `lit` : 0 à 2 pour une vitre qui s'allume (voir `S.lit`), -1 pour une vitre éteinte. Le centre est sur le nu du mur.
 */
export function Win({ at, face = 'z', w = 0.8, h = 1.5, lit = -1, curtain = false }: { at: V3; face?: 'z' | 'x'; w?: number; h?: number; lit?: number; curtain?: boolean }) {
  const glass: Material = lit >= 0 ? S.lit[lit].m : K.navy
  return (
    <group position={at} rotation-y={face === 'x' ? Math.PI / 2 : 0}>
      <Box s={[w, h, 0.04]} p={[0, 0, 0.02]} m={glass} />
      {/* cadre, montant et traverse de milieu */}
      <Box s={[w + 0.1, 0.07, 0.07]} p={[0, h / 2, 0.045]} m={K.stone} />
      <Box s={[w + 0.1, 0.07, 0.07]} p={[0, -h / 2, 0.045]} m={K.stone} />
      {[-1, 1].map((s) => <Box key={s} s={[0.06, h, 0.07]} p={[s * (w / 2 + 0.02), 0, 0.045]} m={K.stone} />)}
      <Box s={[0.04, h, 0.06]} p={[0, 0, 0.05]} m={K.stone} />
      <Box s={[w, 0.05, 0.06]} p={[0, h * 0.06, 0.05]} m={K.stone} />
      {curtain && <Box s={[w * 0.5, h * 0.4, 0.03]} p={[-w * 0.22, h * 0.28, 0.035]} m={K.stone} />}
      {/* linteau, jambages, appui : la pierre claire qui l'encadre */}
      <B s={[w + 0.36, 0.16, 0.2]} p={[0, h / 2 + 0.14, 0.07]} m={K.stone} r={0.05} />
      <B s={[w + 0.34, 0.09, 0.26]} p={[0, -h / 2 - 0.08, 0.1]} m={K.stone} r={0.04} />
      {[-1, 1].map((s) => <Box key={s} s={[0.11, h + 0.08, 0.1]} p={[s * (w / 2 + 0.17), 0, 0.045]} m={K.stone} />)}
    </group>
  )
}

/** Une fenêtre de maison lointaine : vitre, cadre et appui en boîtes plates (la brume les efface, inutile de les arrondir). */
function SimpleWin({ at, lit }: { at: V3; lit: number }) {
  return (
    <group position={at}>
      <Box s={[0.8, 1.4, 0.05]} p={[0, 0, 0.025]} m={lit < 0 ? K.navy : S.lit[lit].m} />
      <Box s={[0.95, 0.09, 0.2]} p={[0, -0.75, 0.1]} m={K.stone} />
      <Box s={[0.95, 0.12, 0.14]} p={[0, 0.76, 0.07]} m={K.stone} />
      <Box s={[0.05, 1.4, 0.08]} p={[0, 0, 0.06]} m={K.stone} />
      <Box s={[0.8, 0.05, 0.08]} p={[0, 0.05, 0.06]} m={K.stone} />
    </group>
  )
}

/** Une souche de cheminée de grès, un chaperon, et des mitres de terre cuite. */
export function Chimney({ at, w = 0.7, h = 1.1, d = 0.5, pots = 2 }: { at: V3; w?: number; h?: number; d?: number; pots?: number }) {
  return (
    <group position={at}>
      <B s={[w, h, d]} p={[0, h / 2, 0]} m={S.sand} uv={2} r={0.04} />
      <B s={[w + 0.12, 0.1, d + 0.12]} p={[0, h + 0.05, 0]} m={K.stone} r={0.03} />
      {Array.from({ length: pots }, (_, i) => {
        const x = pots === 1 ? 0 : -w / 2 + (w * (i + 0.5)) / pots
        return (
          <group key={i} position={[x, h + 0.1, 0]}>
            <Part geo={cyl(0.075, 0.1, 0.3, 14)} m={K.burgundy} p={[0, 0.15, 0]} castShadow={false} raycast={noRay} />
            <Part geo={cyl(0.105, 0.085, 0.06, 14)} m={K.burgundy} p={[0, 0.32, 0]} castShadow={false} raycast={noRay} />
          </group>
        )
      })}
    </group>
  )
}

/** Un tuyau de descente en fonte, avec sa cuvette et ses colliers. */
function Downpipe({ at, h, face = 'z' }: { at: V3; h: number; face?: 'z' | 'x' }) {
  return (
    <group position={at} rotation-y={face === 'x' ? Math.PI / 2 : 0}>
      <Part geo={cyl(0.045, 0.045, h, 10)} m={K.iron} p={[0, h / 2, 0.06]} castShadow={false} raycast={noRay} />
      {[0.5, h * 0.4, h * 0.75].map((y) => <Part key={y} geo={cyl(0.06, 0.06, 0.05, 10)} m={K.iron} p={[0, y, 0.06]} castShadow={false} raycast={noRay} />)}
      <B s={[0.24, 0.26, 0.2]} p={[0, h + 0.02, 0.08]} m={K.iron} r={0.04} />
    </group>
  )
}

/** Le relieur, la maison de gauche : devant (z = 3,36) la boutique, derrière elle le mur de brique qui domine le café. */
const L = { x0: -10.85, x1: -3.85, zF: 3.36, zB: -5.0 }
const LC = (L.x0 + L.x1) / 2
function Bookbinder() {
  const { zF } = L
  return (
    <group>
      {/* le corps : façade de grès (devant) et mur de brique (côté du café) */}
      <B s={[7.0, 6.9, 0.36]} p={[LC, rel(3.45), zF - 0.18]} m={S.sand} uv={2} r={0.05} />
      <B s={[0.36, 6.86, zF - L.zB - 0.03]} p={[L.x1 - 0.18, rel(3.43), (zF - 0.03 + L.zB) / 2]} m={S.brick} uv={2} r={0.05} />
      <B s={[7.2, 0.14, 0.14]} p={[LC, rel(2.85), zF + 0.06]} m={K.stone} r={0.04} />
      <B s={[7.2, 0.1, 0.12]} p={[LC, rel(4.75), zF + 0.05]} m={K.stone} r={0.04} />

      {/* la boutique : soubassement, pilastres, vitrine à petits bois, porte et marche */}
      <B s={[5.1, 0.7, 0.14]} p={[-8.0, rel(0.35), zF + 0.07]} m={K.burgundy} r={0.04} />
      {[-10.65, -4.05].map((x) => <B key={x} s={[0.3, 2.8, 0.22]} p={[x, rel(1.4), zF + 0.11]} m={K.burgundy} r={0.05} />)}
      {[-10.65, -4.05].map((x) => <B key={`c${x}`} s={[0.38, 0.1, 0.28]} p={[x, rel(2.82), zF + 0.12]} m={K.mustard} r={0.04} />)}
      <Box s={[4.9, 1.1, 0.04]} p={[-8.0, rel(1.2), zF + 0.03]} m={S.lit[1].m} />
      {[-10.4, -9.2, -8.0, -6.8, -5.6].map((x) => <Box key={x} s={[0.06, 1.15, 0.07]} p={[x, rel(1.2), zF + 0.06]} m={K.burgundy} />)}
      <Box s={[5.0, 0.06, 0.07]} p={[-8.0, rel(1.78), zF + 0.06]} m={K.burgundy} />
      <Box s={[5.0, 0.06, 0.07]} p={[-8.0, rel(1.2), zF + 0.06]} m={K.burgundy} />
      <B s={[1.0, 2.0, 0.08]} p={[-4.85, rel(1.05), zF + 0.06]} m={K.burgundy} r={0.03} />
      <Box s={[0.6, 0.75, 0.02]} p={[-4.85, rel(1.45), zF + 0.115]} m={S.lit[0].m} />
      <Part geo={LOW} m={K.mustard} scale={0.04} p={[-4.55, rel(1.0), zF + 0.14]} castShadow={false} raycast={noRay} />
      <B s={[1.3, 0.14, 0.5]} p={[-4.85, SW + 0.07, zF + 0.3]} m={K.stone} r={0.04} />
      {/* le bandeau et son enseigne de relieur */}
      <B s={[6.0, 0.9, 0.14]} p={[LC, rel(2.34), zF + 0.08]} m={K.burgundy} r={0.04} />
      <mesh material={S.signBook} position={[LC, rel(2.34), zF + 0.16]} raycast={noRay}>
        <planeGeometry args={[4.5, 0.84]} />
      </mesh>
      {/* l'auvent rayé au-dessus de la vitrine, sa retombe, ses deux montants de fer */}
      <B s={[5.2, 0.05, 0.9]} p={[-8.0, rel(1.62), zF + 0.5]} m={S.awning} r={0.015} rx={0.34} />
      <B s={[5.2, 0.24, 0.04]} p={[-8.0, rel(1.3), zF + 0.88]} m={S.awning} r={0.015} />
      {[-10.5, -5.5].map((x) => <Link key={x} a={[x, rel(1.7), zF + 0.2]} b={[x, rel(1.15), zF + 0.86]} m={K.iron} r={0.014} />)}

      {/* les étages : trois fenêtres chacun */}
      {[-9.85, -7.35, -4.85].map((x, i) => (
        <group key={x}>
          <Win at={[x, rel(3.85), zF]} h={1.4} lit={[0, -1, 1][i]} curtain={i === 0} />
          <Win at={[x, rel(5.6), zF]} h={1.3} lit={[-1, 2, -1][i]} />
        </group>
      ))}
      <Downpipe at={[-10.6, SW, zF]} h={6.6} />
      <Downpipe at={[-4.05, SW, zF]} h={6.6} />
      {/* la corniche */}
      <B s={[7.3, 0.24, 0.4]} p={[LC, rel(6.72), zF + 0.04]} m={K.stone} r={0.06} />

      {/* le pignon à redents et son œil-de-bœuf */}
      {[0, 1, 2, 3].map((k) => (
        <B key={k} s={[6.94 - k * 1.5, 0.44, 0.38]} p={[LC, rel(6.94 + k * 0.42), zF - 0.16]} m={S.sand} uv={2} r={0.05} />
      ))}
      <group position={[LC, rel(7.45), zF + 0.02]}>
        <Part geo={cyl(0.3, 0.3, 0.04, 20)} m={S.lit[2].m} rotation-x={Math.PI / 2} castShadow={false} raycast={noRay} />
        <Part m={K.stone} castShadow={false} raycast={noRay}>
          <torusGeometry args={[0.32, 0.055, 8, 22]} />
        </Part>
      </group>
      <Chimney at={[LC, rel(8.65), zF - 0.4]} w={0.9} h={1.0} d={0.55} pots={3} />

      {/* le toit : le pan qui regarde le café, ardoise ; le faîtage ; une seconde souche */}
      <B s={[4.1, 0.12, zF - L.zB]} p={[-5.6, rel(7.62), (zF + L.zB) / 2]} m={S.slate} uv={1.6} along="z" r={0.04} rz={-0.5} />
      <B s={[0.22, 0.14, zF - L.zB]} p={[LC, rel(8.58), (zF + L.zB) / 2]} m={K.stone} r={0.05} />
      <Chimney at={[LC + 0.2, rel(8.5), -2.6]} w={0.8} h={1.1} d={0.5} />

      {/* le mur de brique côté café : fantôme de réclame, deux fenêtres, tuyau de descente */}
      <mesh material={S.ghost} position={[L.x1 + 0.012, rel(5.45), -0.9]} rotation-y={Math.PI / 2} raycast={noRay} renderOrder={1}>
        <planeGeometry args={[1.6, 2.0]} />
      </mesh>
      <Win at={[L.x1, rel(5.75), 2.1]} face="x" h={1.1} w={0.75} lit={0} />
      <Win at={[L.x1, rel(5.75), -3.2]} face="x" h={1.1} w={0.75} lit={-1} />
      <Downpipe at={[L.x1, SW, 3.1]} h={6.6} face="x" />
    </group>
  )
}

/** Une maison plus basse qui prolonge la rue, à demi cachée : façade, deux étages de fenêtres, toit pentu et cheminée. */
function Neighbour({ x0, x1, zF, floors = 2, mat, lit, roofZ = 0 }: { x0: number; x1: number; zF: number; floors?: number; mat: Material; lit: number[]; roofZ?: number }) {
  const w = x1 - x0, cx = (x0 + x1) / 2, h = 2.9 + floors * 1.8, n = Math.max(2, Math.round(w / 2.3)), bars = Math.max(3, Math.round((w - 0.8) / 0.95))
  return (
    <group>
      <B s={[w, h, 0.36]} p={[cx, SW + h / 2, zF - 0.18]} m={mat} uv={2} r={0.05} />
      <B s={[w + 0.16, 0.2, 0.4]} p={[cx, SW + h + 0.1, zF - 0.1]} m={K.stone} r={0.05} />
      {/* un rez-de-chaussée de boutique peinte, vitrine allumée */}
      <B s={[w - 0.4, 0.7, 0.12]} p={[cx, SW + 0.35, zF + 0.06]} m={K.green} r={0.04} />
      <Box s={[w - 0.8, 1.2, 0.04]} p={[cx, SW + 1.3, zF + 0.03]} m={lit[0] < 0 ? K.navy : S.lit[lit[0]].m} />
      <B s={[w - 0.2, 0.7, 0.1]} p={[cx, SW + 2.35, zF + 0.05]} m={K.green} r={0.04} />
      {/* la devanture : petits bois verticaux, traverse d'imposte, porte vitrée au milieu, appui de pierre (pas un aplat de 6 m) */}
      {Array.from({ length: bars + 1 }, (_, i) => (
        <Box key={`m${i}`} s={[0.07, 1.22, 0.06]} p={[cx - (w - 0.8) / 2 + ((w - 0.8) * i) / bars, SW + 1.3, zF + 0.06]} m={K.green} />
      ))}
      <Box s={[w - 0.78, 0.07, 0.06]} p={[cx, SW + 1.62, zF + 0.06]} m={K.green} />
      <B s={[w - 0.6, 0.08, 0.2]} p={[cx, SW + 0.72, zF + 0.1]} m={K.stone} r={0.03} />
      <Box s={[0.82, 1.5, 0.05]} p={[cx, SW + 1.15, zF + 0.07]} m={K.green} />
      <Box s={[0.56, 0.75, 0.03]} p={[cx, SW + 1.4, zF + 0.1]} m={lit[0] < 0 ? K.navy : S.lit[lit[0]].m} />
      <Box s={[0.05, 0.05, 0.05]} p={[cx + 0.3, SW + 1.05, zF + 0.12]} m={K.mustard} />
      {Array.from({ length: floors }, (_, f) =>
        Array.from({ length: n }, (_, i) => <SimpleWin key={`${f}${i}`} at={[x0 + (w * (i + 0.5)) / n, SW + 3.8 + f * 1.8, zF]} lit={lit[(f * n + i + 1) % lit.length]} />),
      )}
      {/* le toit : le pan de devant, vers la rue, ardoise ; deux souches */}
      <B s={[w + 0.2, 0.12, 2.6]} p={[cx, SW + h + 1.0, zF - 1.3 + roofZ]} m={S.slate} uv={1.6} along="x" r={0.04} rx={-0.7} />
      <Chimney at={[x0 + w * 0.25, SW + h + 1.2, zF - 2.2 + roofZ]} w={0.6} h={0.9} d={0.5} />
      <Chimney at={[x0 + w * 0.75, SW + h + 1.2, zF - 2.2 + roofZ]} w={0.6} h={0.9} d={0.5} pots={3} />
    </group>
  )
}

/** Le pub qui ferme l'impasse : trois étages de grès, façade du rez-de-chaussée vert bouteille, porte cintrée, lanterne, enseigne, mansarde. */
const R = { x0: 4.0, x1: 10.6, zF: -3.8 }
const RC = (R.x0 + R.x1) / 2
function Pub() {
  const { zF } = R, top = 6.4
  return (
    <group>
      <B s={[R.x1 - R.x0, top + 0.6, 0.4]} p={[RC, SW + (top + 0.6) / 2, zF - 0.2]} m={S.sand} uv={2} r={0.05} />
      <B s={[0.4, top + 0.56, 5.97]} p={[R.x1 - 0.2, SW + (top + 0.56) / 2, zF - 3.015]} m={S.brick} uv={2} r={0.05} />
      {/* le rez-de-chaussée : boiseries vertes, deux baies allumées, la porte cintrée */}
      <B s={[R.x1 - R.x0 - 0.2, 2.9, 0.14]} p={[RC, rel(1.45), zF + 0.07]} m={K.green} r={0.05} />
      {[5.1, 8.9].map((x) => <Box key={x} s={[1.6, 1.3, 0.04]} p={[x, rel(1.5), zF + 0.16]} m={S.lit[x < 6 ? 2 : 1].m} />)}
      {[5.1, 8.9].map((x) => (
        <group key={`f${x}`}>
          <Box s={[1.7, 0.07, 0.06]} p={[x, rel(2.15), zF + 0.17]} m={K.mustard} />
          <Box s={[1.7, 0.07, 0.06]} p={[x, rel(0.85), zF + 0.17]} m={K.mustard} />
          {[-1, 1].map((s) => <Box key={s} s={[0.07, 1.37, 0.06]} p={[x + s * 0.85, rel(1.5), zF + 0.17]} m={K.mustard} />)}
          <Box s={[0.05, 1.3, 0.05]} p={[x, rel(1.5), zF + 0.17]} m={K.mustard} />
        </group>
      ))}
      <group position={[7.0, SW, zF + 0.1]}>
        <B s={[1.2, 2.5, 0.12]} p={[0, 1.25, 0]} m={K.stone} r={0.05} />
        <B s={[0.92, 2.1, 0.08]} p={[0, 1.05, 0.06]} m={K.burgundy} r={0.04} />
        <Part geo={cyl(0.46, 0.46, 0.08, 20, )} m={K.burgundy} p={[0, 2.1, 0.06]} rotation-x={Math.PI / 2} castShadow={false} raycast={noRay} />
        <Part geo={cyl(0.3, 0.3, 0.03, 20)} m={S.lit[0].m} p={[0, 2.12, 0.11]} rotation-x={Math.PI / 2} castShadow={false} raycast={noRay} />
        <Part geo={LOW} m={K.mustard} scale={0.045} p={[0.3, 1.0, 0.12]} castShadow={false} raycast={noRay} />
        <B s={[1.5, 0.14, 0.5]} p={[0, 0.07, 0.3]} m={K.stone} r={0.04} />
      </group>
      {/* le bandeau doré et la plaque qui pend au bout d'une potence de fer */}
      <B s={[R.x1 - R.x0 - 0.2, 0.5, 0.12]} p={[RC, rel(3.15), zF + 0.08]} m={K.green} r={0.04} />
      <B s={[R.x1 - R.x0 - 0.1, 0.1, 0.16]} p={[RC, rel(2.88), zF + 0.1]} m={K.mustard} r={0.04} />
      <Link a={[5.7, rel(2.55), zF + 0.1]} b={[5.7, rel(2.55), zF + 0.95]} m={K.iron} r={0.02} />
      <Link a={[5.7, rel(2.55), zF + 0.5]} b={[5.7, rel(2.05), zF + 0.9]} m={K.iron} r={0.014} />
      <mesh material={S.signPub} position={[5.7, rel(2.05), zF + 0.95]} rotation-y={0} raycast={noRay}>
        <planeGeometry args={[0.7, 0.52]} />
      </mesh>
      <Link a={[5.55, rel(2.3), zF + 0.95]} b={[5.55, rel(2.55), zF + 0.95]} m={K.iron} r={0.008} />
      <Link a={[5.85, rel(2.3), zF + 0.95]} b={[5.85, rel(2.55), zF + 0.95]} m={K.iron} r={0.008} />
      {/* les étages : trois fenêtres, la cornice */}
      {[5.1, 7.3, 9.5].map((x, i) => (
        <group key={x}>
          <Win at={[x, rel(3.95), zF]} h={1.4} lit={[1, -1, 0][i]} />
          <Win at={[x, rel(5.5), zF]} h={1.25} lit={[-1, 2, -1][i]} />
        </group>
      ))}
      <B s={[R.x1 - R.x0 + 0.3, 0.24, 0.44]} p={[RC, rel(6.5), zF + 0.02]} m={K.stone} r={0.06} />
      <B s={[R.x1 - R.x0 + 0.1, 0.12, 0.16]} p={[RC, rel(3.55), zF + 0.06]} m={K.stone} r={0.04} />
      {/* la mansarde : pente raide d'ardoise, faîtage plat, deux lucarnes à fronton, trois souches */}
      <B s={[R.x1 - R.x0 + 0.2, 1.7, 0.14]} p={[RC, rel(7.35), zF - 0.5]} m={S.slate} uv={1.6} along="z" r={0.04} rx={-0.45} />
      <B s={[R.x1 - R.x0 + 0.2, 0.16, 5.4]} p={[RC, rel(8.2), zF - 3.4]} m={S.slate} uv={1.6} along="z" r={0.04} />
      <B s={[0.14, 1.7, 5.6]} p={[R.x1 + 0.05, rel(7.35), zF - 3.5]} m={S.slate} uv={1.6} along="x" r={0.04} rz={0.45} />
      {[6.1, 8.6].map((x, i) => (
        <group key={x} position={[x, rel(7.0), zF - 0.5]}>
          <B s={[0.95, 1.1, 0.8]} p={[0, 0.2, 0.05]} m={S.sand} uv={2} r={0.05} />
          <Box s={[0.6, 0.75, 0.04]} p={[0, 0.2, 0.46]} m={S.lit[i === 0 ? 1 : 0].m} />
          <Box s={[0.05, 0.8, 0.05]} p={[0, 0.2, 0.48]} m={K.stone} />
          <Box s={[0.65, 0.05, 0.05]} p={[0, 0.22, 0.48]} m={K.stone} />
          {[-1, 1].map((s) => <B key={s} s={[0.6, 0.07, 0.95]} p={[s * 0.27, 0.9, 0.0]} m={S.slate} r={0.025} rz={-s * 0.55} />)}
          <B s={[1.1, 0.12, 0.14]} p={[0, -0.4, 0.48]} m={K.stone} r={0.04} />
        </group>
      ))}
      <Chimney at={[5.0, rel(8.3), zF - 2.5]} w={0.8} h={1.1} d={0.5} pots={2} />
      <Chimney at={[7.5, rel(8.3), zF - 3.2]} w={0.8} h={1.3} d={0.5} pots={3} />
      <Chimney at={[10.0, rel(8.3), zF - 2.5]} w={0.7} h={1.0} d={0.5} pots={2} />
      {/* la lanterne de laiton à côté de la porte */}
      <group position={[6.15, rel(2.0), zF + 0.2]}>
        <Part geo={cyl(0.08, 0.06, 0.2, 6)} m={K.mustard} castShadow={false} raycast={noRay} />
        <Part geo={cyl(0.05, 0.1, 0.06, 6)} m={K.mustard} p={[0, 0.13, 0]} castShadow={false} raycast={noRay} />
      </group>
    </group>
  )
}

export function Terrace() {
  return (
    <>
      <Bookbinder />
      <Pub />
      {/* les maisons qui continuent la rue, à gauche et à droite : plus basses, plus pâles */}
      <Neighbour x0={-16.0} x1={L.x0} zF={L.zF} floors={2} mat={S.brick} lit={[0, -1, 1, -1, 2]} />
      <Neighbour x0={R.x1} x1={15.2} zF={-3.0} floors={1} mat={S.sand} lit={[-1, 1, 0]} roofZ={0} />
    </>
  )
}
