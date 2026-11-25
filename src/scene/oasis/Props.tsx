import { useMemo } from 'react'
import { LatheGeometry, Vector2 } from 'three'
import { seeded } from '../paint'
import { Batch, Part, SPH, SPH_MID, cyl, rbox, worldUV, type Item, type V3 } from '../parts'
import { Static } from '../Static'
import { BEAM } from './Awning'
import { D } from './materials'

const lathe = (pts: [number, number][], seg = 28) => new LatheGeometry(pts.map(([r, y]) => new Vector2(r, y)), seg)
// l'amphore : pied, panse, épaule, col, lèvre (rayon, hauteur ; la hauteur totale est 1)
const AMPHORA = lathe([[0.001, 0], [0.12, 0.0], [0.2, 0.05], [0.36, 0.28], [0.4, 0.45], [0.33, 0.68], [0.17, 0.83], [0.13, 0.92], [0.17, 0.965], [0.165, 0.985]])
const JAR = lathe([[0.001, 0], [0.16, 0], [0.3, 0.12], [0.34, 0.45], [0.26, 0.82], [0.2, 0.92], [0.23, 0.98], [0.22, 1.0]])
const BASKET = lathe([[0.001, 0], [0.1, 0], [0.16, 0.12], [0.2, 0.22], [0.2, 0.24], [0.18, 0.23], [0.15, 0.12], [0.09, 0.02], [0.001, 0.02]])

/** Une grande amphore de terre peinte (bandes, frise en zigzag, points), deux anses, la bouche ouverte et sombre, un bouchon de chiffon sur l'autre. */
function Amphora({ p, h = 1, ry = 0, plug = false }: { p: V3; h?: number; ry?: number; plug?: boolean }) {
  return (
    <group position={p} rotation-y={ry} scale={h}>
      <mesh geometry={AMPHORA} material={D.clay} castShadow receiveShadow />
      {[-1, 1].map((s) => <Part key={s} m={D.clayDark} p={[s * 0.14, 0.86, 0]} rotation={[0, 0, s * Math.PI / 2]} castShadow={false}><torusGeometry args={[0.1, 0.022, 8, 14, Math.PI * 1.05]} /></Part>)}
      {plug ? <Part geo={SPH} m={D.blanket} scale={[0.13, 0.06, 0.13]} p={[0, 0.975, 0]} castShadow={false} /> : <Part geo={cyl(0.12, 0.12, 0.01, 16)} m={D.coal} p={[0, 0.955, 0]} castShadow={false} />}
    </group>
  )
}

/** Le coffre de bois d'acacia : caisson, couvercle bombé, quatre équerres de laiton, serrure, poignées, une rangée de clous, un plaid plié dessus. `position` est le sol. */
export function Chest({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Static>
        <Part geo={worldUV(rbox(0.52, 0.34, 0.98, 0.03), 0.8)} m={D.wood} p={[0, 0.17, 0]} />
        <Part geo={rbox(0.54, 0.06, 1.0, 0.025)} m={D.woodDark} p={[0, 0.03, 0]} castShadow={false} />
        {/* le couvercle bombé : un demi-cylindre couché, deux bandes de laiton */}
        <Part geo={cyl(0.26, 0.26, 0.98, 18)} m={D.wood} scale={[0.98, 1, 0.55]} p={[0, 0.34, 0]} rotation-x={Math.PI / 2} castShadow={false} />
        {[-0.36, 0.36].map((z) => <Part key={z} geo={rbox(0.54, 0.4, 0.04, 0.015)} m={D.brassDull} p={[0, 0.2, z]} castShadow={false} />)}
        {/* la serrure, le moraillon, des clous (face vers nous : +x et +z) */}
        <Part geo={rbox(0.03, 0.09, 0.07, 0.01)} m={D.brass} p={[0.27, 0.3, 0]} castShadow={false} />
        <Part geo={SPH} m={D.iron} scale={0.012} p={[0.285, 0.28, 0]} castShadow={false} />
        {[-0.38, -0.3, 0.3, 0.38].map((z) => <Part key={z} geo={SPH} m={D.brass} scale={0.014} p={[0.272, 0.11, z]} castShadow={false} />)}
        {/* un plaid rayé plié sur le couvercle, et une petite lampe de cuivre à huile à côté */}
        <Part geo={rbox(0.3, 0.07, 0.5, 0.03)} m={D.blanket} p={[-0.02, 0.48, -0.18]} rotation-y={0.12} />
        {[0.0, 0.05].map((dz) => <Part key={dz} geo={rbox(0.3, 0.012, 0.045, 0.004)} m={D.blanketStripe} p={[-0.02, 0.485 + dz * 0.2, -0.04 + dz]} rotation-y={0.12} castShadow={false} />)}
        <Part geo={SPH} m={D.copper} scale={[0.07, 0.03, 0.045]} p={[0.0, 0.5, 0.33]} rotation-y={0.4} castShadow={false} />
        <Part m={D.copper} p={[-0.06, 0.51, 0.33]} rotation-y={0.4} castShadow={false}><coneGeometry args={[0.015, 0.05, 8]} /></Part>
      </Static>
    </group>
  )
}

/** Le kilim accroché à un mur : une tige de bois, deux glands, le tissage rayé, une frange en bas. `position` est le centre du tissage, `ry` tourne le tissu vers l'intérieur (π/2 : le mur de gauche, il regarde +x). */
export function WallKilim({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <mesh material={D.kilim} receiveShadow raycast={() => {}}>
        <planeGeometry args={[1.0, 0.9]} />
      </mesh>
      <Part geo={cyl(0.024, 0.024, 1.18, 8)} m={D.woodDark} p={[0, 0.47, 0.02]} rotation-z={Math.PI / 2} castShadow={false} />
      {[-0.5, 0.5].map((dx) => <Part key={dx} geo={SPH} m={D.woodDark} scale={0.032} p={[dx * 1.18, 0.47, 0.02]} castShadow={false} />)}
      {Array.from({ length: 16 }, (_, i) => <Part key={i} geo={cyl(0.007, 0.007, 0.08, 4)} m={D.blanket} p={[-0.47 + i * 0.0625, -0.49, 0.012]} castShadow={false} />)}
    </group>
  )
}

/** Le sol sous l'auvent, au fond à gauche : deux amphores, une jarre à grain, un sac. */
export function JarCorner() {
  return (
    <Static>
      <Amphora p={[-2.5, 0, -2.45]} h={1.05} ry={0.5} />
      <Amphora p={[-1.5, 0, -2.6]} h={0.8} ry={2} plug />
      <group position={[-2.75, 0, -1.55]}>
        <mesh geometry={JAR} material={D.clayPlain} scale={0.62} castShadow receiveShadow />
        <Part geo={cyl(0.12, 0.12, 0.01, 16)} m={D.grain} p={[0, 0.58, 0]} castShadow={false} />
        <Part geo={SPH} m={D.grain} scale={[0.1, 0.03, 0.1]} p={[0, 0.6, 0]} castShadow={false} />
      </group>
    </Static>
  )
}

/** Le coin avant droit : un sac de grain ficelé, un panier de dattes, deux sacoches rayées et un rouleau de corde. */
export function FrontCorner() {
  const dates = useMemo(() => {
    const r = seeded(7), out: Item[] = []
    for (let i = 0; i < 22; i++) {
      const a = r() * Math.PI * 2, d = Math.sqrt(r()) * 0.15
      out.push({ p: [Math.cos(a) * d, 0.2 + (0.15 - d) * 0.5 + r() * 0.02, Math.sin(a) * d], s: [0.026, 0.04, 0.026], r: [r() * 3, r() * 3, r() * 3], c: [0xc0621e, 0x8a3a14, 0xa84a1a][i % 3] })
    }
    return out
  }, [])
  return (
    <Static>
      {/* le sac de grain : un volume qui s'affaisse, le col ficelé, une trace de grain renversé */}
      <group position={[2.55, 0, 2.15]} rotation-y={0.5}>
        {/* le ventre affaissé, plus large que haut ; le col froncé qui s'évase en collerette au-dessus de la ficelle, la gueule qui retombe d'un côté */}
        <Part geo={rbox(0.5, 0.36, 0.36, 0.15)} m={D.sack} p={[0, 0.18, 0]} rotation-z={0.05} />
        <Part geo={cyl(0.05, 0.085, 0.07, 10)} m={D.sack} p={[0.01, 0.39, 0]} rotation-z={0.05} castShadow={false} />
        <Part geo={cyl(0.12, 0.05, 0.07, 10)} m={D.sack} p={[0.03, 0.46, 0]} rotation-z={0.22} castShadow={false} />
        <Part geo={SPH} m={D.sack} scale={[0.07, 0.035, 0.1]} p={[0.07, 0.49, 0.02]} rotation-z={0.5} castShadow={false} />
        <Part m={D.rope} p={[0.015, 0.42, 0]} rotation-x={Math.PI / 2} castShadow={false}><torusGeometry args={[0.063, 0.012, 6, 14]} /></Part>
        {/* un pli de toile sur le flanc, et le bout de ficelle qui pend */}
        <Part geo={SPH_MID} m={D.sack} scale={[0.012, 0.11, 0.12]} p={[0.25, 0.19, -0.04]} castShadow={false} />
        <Part geo={cyl(0.005, 0.005, 0.07, 4)} m={D.rope} p={[0.08, 0.4, 0.06]} rotation-z={0.3} castShadow={false} />
        <Part geo={SPH_MID} m={D.grain} scale={[0.14, 0.015, 0.1]} p={[0.26, 0.005, 0.1]} castShadow={false} />
      </group>
      {/* le panier : un tressage évasé, une anse arquée, un tas de dattes dessus */}
      <group position={[2.15, 0, 2.7]}>
        <mesh geometry={BASKET} material={D.basket} scale={1.25} castShadow receiveShadow />
        <Part m={D.basketDark} p={[0, 0.3, 0]} rotation-x={Math.PI / 2} castShadow={false}><torusGeometry args={[0.245, 0.014, 6, 24]} /></Part>
        <Part m={D.basketDark} p={[0, 0.3, 0]} rotation-y={Math.PI / 2} castShadow={false}><torusGeometry args={[0.24, 0.012, 6, 20, Math.PI]} /></Part>
        {[0.08, 0.17].map((y) => <Part key={y} geo={cyl(0.12 + y * 0.45, 0.12 + y * 0.45, 0.01, 22)} m={D.basketDark} p={[0, y + 0.02, 0]} castShadow={false} />)}
        <Batch geo={SPH} m={D.dateTint} items={dates} />
      </group>
      {/* les sacoches rayées (khurjin) jetées côte à côte, leur sangle, deux glands */}
      <group position={[2.9, 0, 1.45]} rotation-y={0.9}>
        <Part geo={worldUV(rbox(0.36, 0.34, 0.2, 0.09), 0.5)} m={D.cushionA} p={[0, 0.17, -0.2]} />
        <Part geo={worldUV(rbox(0.36, 0.34, 0.2, 0.09), 0.5)} m={D.cushionA} p={[0, 0.17, 0.2]} rotation-y={0.1} />
        <Part geo={rbox(0.12, 0.03, 0.34, 0.012)} m={D.leather} p={[0, 0.355, 0]} castShadow={false} />
        {[-0.2, 0.2].map((z) => <Part key={z} geo={SPH} m={D.tassel} scale={0.03} p={[0.19, 0.22, z]} castShadow={false} />)}
      </group>
      {/* le rouleau de corde au pied du sac */}
      <group position={[1.85, 0.02, 2.0]}>
        {[0, 0.04, 0.08].map((y, i) => <Part key={y} m={D.rope} p={[0, y + 0.015, 0]} rotation-x={Math.PI / 2} castShadow={false}><torusGeometry args={[0.1 - i * 0.012, 0.018, 6, 20]} /></Part>)}
      </group>
    </Static>
  )
}

/** La gourde de peau de chèvre pendue à la poutre de l'auvent, à 0,3 de la perche arrière : le sac, les quatre moignons, le col noué, la corde. */
export function Waterskin() {
  const x = BEAM[0] + 0.1, top = BEAM[1] - 0.18, z = -2.6
  return (
    <group position={[x, top, z]}>
      <Static>
        <Part geo={cyl(0.007, 0.007, 0.18, 5)} m={D.rope} p={[0, -0.09, 0]} castShadow={false} />
        <Part geo={SPH} m={D.leatherCream} scale={[0.1, 0.17, 0.075]} p={[0, -0.33, 0]} rotation-z={0.05} />
        {[[-0.07, -0.2, -0.04], [0.07, -0.2, 0.04], [-0.06, -0.46, 0.04], [0.06, -0.46, -0.04]].map(([lx, ly, lz], i) => (
          <Part key={i} m={D.leatherCream} p={[lx, ly, lz]} rotation={[0, 0, (i < 2 ? 1 : -1) * (lx > 0 ? -1 : 1) * 0.9]} castShadow={false}><coneGeometry args={[0.022, 0.1, 7]} /></Part>
        ))}
        <Part geo={cyl(0.026, 0.034, 0.05, 8)} m={D.leatherDark} p={[0, -0.17, 0]} castShadow={false} />
        <Part m={D.rope} p={[0, -0.185, 0]} rotation-x={Math.PI / 2} castShadow={false}><torusGeometry args={[0.028, 0.006, 6, 12]} /></Part>
      </Static>
    </group>
  )
}
