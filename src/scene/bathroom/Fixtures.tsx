import { TAU } from '../../math'
import { Garment } from '../objects/Garment'
import { Candle } from '../objects/Candle'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { Vines } from '../nature/Vines'
import { B } from './materials'
import { RolledTowel, Towel } from './Towel'

/** Une gravure encadrée sur le mur du fond (le papier est à z = -3, le cadre déborde de 4 cm). `p` : le centre. */
export function Print({ p, w, h, m, side = 'back' }: { p: V3; w: number; h: number; m: typeof B.printA; side?: 'back' | 'left' }) {
  return (
    <group position={p} rotation-y={side === 'left' ? Math.PI / 2 : 0}>
      <Part geo={rbox(w + 0.07, h + 0.07, 0.04, 0.012)} m={B.woodLight} castShadow={false} />
      <Part geo={rbox(w + 0.03, h + 0.03, 0.044, 0.008)} m={B.trim} castShadow={false} />
      <mesh material={m} position={[0, 0, 0.0235]} raycast={() => {}}>
        <planeGeometry args={[w, h]} />
      </mesh>
    </group>
  )
}

/** Le sèche-serviettes à barreaux, vissé au mur du fond : deux montants de chrome, cinq barreaux, des serviettes jetées dessus. */
export function TowelLadder({ position }: { position: V3 }) {
  const bars = [0.52, 0.84, 1.16, 1.48, 1.8]
  return (
    <group position={position}>
      {[-0.23, 0.23].map((x) => (
        <group key={x}>
          <Part geo={cyl(0.017, 0.017, 1.78, 10)} m={B.chrome} p={[x, 1.16, 0]} castShadow={false} />
          {[0.3, 2.0].map((y) => <Part key={y} geo={cyl(0.024, 0.024, 0.09, 10)} m={B.chrome} p={[x, y, -0.045]} rotation-x={Math.PI / 2} castShadow={false} />)}
        </group>
      ))}
      {bars.map((y) => <Part key={y} geo={cyl(0.013, 0.013, 0.46, 8)} m={B.chrome} p={[0, y, 0]} rotation-z={Math.PI / 2} castShadow={false} />)}
      <Towel position={[0, 1.8, 0]} width={0.4} drop={0.66} m={B.towelCream} hem={B.rail} bar={0.013} />
      <Towel position={[-0.02, 1.16, 0]} width={0.4} drop={0.5} m={B.towelSage} hem={B.trim} bar={0.013} />
      <Towel position={[0.0, 0.84, 0]} width={0.34} drop={0.3} m={B.towelPeach} hem={B.trim} bar={0.013} />
    </group>
  )
}

/** La robe de chambre en éponge crème, pendue à une patère de laiton : col châle, ceinture rose, deux poches. `position` : la platine de la patère, sur le mur du fond (z = -3). */
export function Robe({ position }: { position: V3 }) {
  return (
    <group position={position}>
      {/* la patère : une platine contre le mur (z = 0), un fût, un bouton ; la robe pend au fût */}
      <Part geo={cyl(0.04, 0.045, 0.02, 14)} m={B.brass} p={[0, 0, 0.01]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.012, 0.012, 0.13, 8)} m={B.brass} p={[0, 0, 0.075]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={SPH} m={B.brass} scale={0.022} p={[0, 0, 0.15]} castShadow={false} />
      <Garment kind="coat" p={[0, 0.0, 0.17]} s={[1.08, 1.12, 1]} m={B.robe}>
        <Part geo={rbox(0.34, 0.034, 0.012, 0.006)} m={B.rail} p={[0, -0.4, 0.045]} castShadow={false} />
        <Part geo={rbox(0.05, 0.3, 0.012, 0.006)} m={B.trim} p={[-0.07, -0.16, 0.052]} rotation-z={0.3} castShadow={false} />
        <Part geo={rbox(0.05, 0.3, 0.012, 0.006)} m={B.trim} p={[0.07, -0.16, 0.052]} rotation-z={-0.3} castShadow={false} />
        {[-0.115, 0.115].map((x) => <Part key={x} geo={rbox(0.09, 0.08, 0.01, 0.005)} m={B.trim} p={[x, -0.55, 0.05]} castShadow={false} />)}
      </Garment>
    </group>
  )
}

/** Le lavabo sur colonne, contre le mur de gauche (le dos de la vasque touche le mur, la vasque regarde +x) : colonne de porcelaine, vasque, robinets, miroir ovale. */
export function Sink({ position }: { position: V3 }) {
  return (
    <group position={position}>
      {/* la colonne et son pied, la vasque et son rebord, le dosseret */}
      <Part geo={cyl(0.1, 0.14, 0.62, 20)} m={B.ceramic} p={[0.14, 0.34, 0]} />
      <Part geo={cyl(0.17, 0.2, 0.05, 22)} m={B.ceramic} p={[0.14, 0.025, 0]} castShadow={false} />
      <Part geo={rbox(0.46, 0.15, 0.66, 0.07)} m={B.ceramic} p={[0.2, 0.82, 0]} />
      <Part geo={rbox(0.03, 0.15, 0.66, 0.012)} m={B.ceramic} p={[-0.015, 0.97, 0]} castShadow={false} />
      <Part geo={cyl(0.2, 0.17, 0.012, 26)} m={B.basin} p={[0.22, 0.9, 0]} scale={[1, 1, 1.36]} castShadow={false} />
      <Part geo={cyl(0.02, 0.02, 0.012, 12)} m={B.chrome} p={[0.22, 0.906, 0]} castShadow={false} />
      {/* le mélangeur : un col, un bec, deux manettes en croix */}
      <Part geo={cyl(0.016, 0.02, 0.12, 12)} m={B.brass} p={[0.02, 0.97, 0]} castShadow={false} />
      <Part geo={cyl(0.011, 0.011, 0.13, 8)} m={B.brass} p={[0.085, 1.03, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.016, 0.012, 0.03, 8)} m={B.brass} p={[0.15, 1.015, 0]} castShadow={false} />
      {[-0.13, 0.13].map((z, i) => (
        <group key={z} position={[0.04, 0.92, z]}>
          <Part geo={cyl(0.012, 0.012, 0.05, 8)} m={B.brass} castShadow={false} />
          <Part geo={rbox(0.05, 0.014, 0.014, 0.005)} m={B.chrome} p={[0, 0.03, 0]} castShadow={false} />
          <Part geo={cyl(0.017, 0.017, 0.012, 12)} m={i ? B.ceramicBlue : B.ceramicRose} p={[0, 0.038, 0]} castShadow={false} />
        </group>
      ))}
      {/* sur le rebord : le gobelet aux deux brosses à dents, le flacon de savon liquide */}
      <group position={[0.26, 0.9, -0.24]}>
        <Part geo={cyl(0.04, 0.034, 0.1, 14)} m={B.ceramicBlue} p={[0, 0.05, 0]} castShadow={false} />
        {[[-0.012, 0.1], [0.014, -0.15]].map(([x, tilt], i) => (
          <group key={i} position={[x, 0.05, 0]} rotation-z={tilt}>
            <Part geo={cyl(0.006, 0.006, 0.14, 6)} m={i ? B.rail : B.bottleSage} p={[0, 0.06, 0]} castShadow={false} />
            <Part geo={rbox(0.016, 0.03, 0.014, 0.005)} m={B.trim} p={[0, 0.14, 0]} castShadow={false} />
          </group>
        ))}
      </group>
      <group position={[0.3, 0.9, 0.24]}>
        <Part geo={cyl(0.03, 0.03, 0.1, 14)} m={B.bottleRose} p={[0, 0.05, 0]} castShadow={false} />
        <Part geo={cyl(0.008, 0.008, 0.045, 8)} m={B.bottleCap} p={[0, 0.12, 0]} castShadow={false} />
        <Part geo={rbox(0.045, 0.014, 0.012, 0.005)} m={B.bottleCap} p={[0.015, 0.145, 0]} castShadow={false} />
      </group>
      {/* le miroir ovale : un verre et un cadre de laiton, accroché au mur */}
      <group position={[0.04, 2.1, 0]}>
        <Part geo={cyl(0.36, 0.36, 0.014, 40)} m={B.mirror} rotation-z={Math.PI / 2} scale={[1.4, 1, 1]} castShadow={false} />
        <Part m={B.brass} p={[0.012, 0, 0]} rotation-y={Math.PI / 2} scale={[1, 1.4, 1]} castShadow={false}>
          <torusGeometry args={[0.36, 0.022, 8, 44]} />
        </Part>
      </group>
    </group>
  )
}

/** Le panier à linge en osier, à couvercle un peu de travers, un coin de serviette qui dépasse. */
export function Hamper({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Part geo={cyl(0.27, 0.23, 0.62, 22)} m={B.wickerBig} p={[0, 0.31, 0]} />
      <Part geo={cyl(0.285, 0.285, 0.03, 22)} m={B.woodDark} p={[0, 0.62, 0]} castShadow={false} />
      <Part geo={cyl(0.235, 0.235, 0.012, 22)} m={B.woodDark} p={[0, 0.02, 0]} castShadow={false} />
      <Part geo={cyl(0.285, 0.285, 0.03, 22)} m={B.woodDark} p={[0, 0.2, 0]} castShadow={false} />
      <group position={[0.04, 0.66, 0.02]} rotation={[0.07, 0, -0.1]}>
        <Part geo={cyl(0.28, 0.28, 0.04, 22)} m={B.wood} castShadow={false} />
        <Part geo={SPH} m={B.woodDark} scale={0.04} p={[0, 0.045, 0]} castShadow={false} />
      </group>
      <Part geo={rbox(0.2, 0.05, 0.1, 0.02)} m={B.towelPeach} p={[0.18, 0.64, 0.14]} rotation={[0.2, 0.5, -0.4]} castShadow={false} />
    </group>
  )
}

/**
 * L'étagère d'angle en chêne clair contre le mur du fond, à droite de la fenêtre : serviettes roulées, une pile pliée avec son savon,
 * un bocal de cotons et un pot de bougie, un pothos qui retombe du haut. `position` : le pied, au centre.
 */
export function ShelfUnit({ position }: { position: V3 }) {
  const w = 0.74, d = 0.3, ys = [0.22, 0.62, 1.02, 1.42]
  return (
    <group position={position}>
      {[-w / 2, w / 2].map((x) => <Part key={x} geo={rbox(0.035, 1.46, d, 0.012)} m={B.woodLight} p={[x, 0.73, 0]} />)}
      {ys.map((y) => <Part key={y} geo={rbox(w, 0.032, d, 0.012)} m={B.wood} p={[0, y, 0]} castShadow={false} />)}
      <Part geo={rbox(w, 0.03, 0.025, 0.01)} m={B.woodDark} p={[0, 0.06, d / 2 - 0.02]} castShadow={false} />
      {/* du bas : un panier de serviettes roulées */}
      <RolledTowel p={[-0.2, 0.298, 0]} m={B.towelRose} />
      <RolledTowel p={[0.0, 0.298, 0]} m={B.towelCream} />
      <RolledTowel p={[0.2, 0.298, 0]} m={B.towelSage} />
      {/* une pile pliée, et un savon sur sa soucoupe */}
      <Part geo={rbox(0.32, 0.07, 0.22, 0.02)} m={B.towelSage} p={[-0.17, 0.67 + 0.035, 0]} castShadow={false} />
      <Part geo={rbox(0.31, 0.07, 0.21, 0.02)} m={B.towelCream} p={[-0.17, 0.67 + 0.105, 0.005]} rotation-y={0.05} castShadow={false} />
      <Part geo={rbox(0.3, 0.06, 0.2, 0.02)} m={B.towelRose} p={[-0.17, 0.67 + 0.17, 0]} rotation-y={-0.04} castShadow={false} />
      <Part geo={cyl(0.07, 0.06, 0.014, 16)} m={B.ceramic} p={[0.2, 0.653, 0.0]} castShadow={false} />
      <Part geo={rbox(0.09, 0.03, 0.055, 0.014)} m={B.soap} p={[0.2, 0.68, 0.0]} castShadow={false} />
      {/* un bocal de cotons, une bougie dans son verre */}
      <Part geo={cyl(0.06, 0.06, 0.15, 16)} m={B.jar} p={[-0.2, 1.1, 0.0]} castShadow={false} />
      {[0, 1, 2, 3, 4, 5].map((i) => <Part key={i} geo={SPH} m={B.towelCream} scale={0.026} p={[Math.cos(i * 1.7) * 0.03, 1.058 + i * 0.016, Math.sin(i * 1.7) * 0.03]} castShadow={false} />)}
      <Part geo={cyl(0.063, 0.063, 0.012, 16)} m={B.woodDark} p={[-0.2, 1.185, 0.0]} castShadow={false} />
      <Candle position={[0.18, 1.036, 0.0]} height={0.09} radius={0.035} holder="jar" />
      {/* le haut : un pothos, qui retombe devant l'étagère */}
      <group position={[0, ys[3] + 0.016, 0]}>
        <Part geo={cyl(0.1, 0.075, 0.12, 18)} m={B.ceramicRose} p={[0, 0.06, 0]} />
        <Part geo={cyl(0.092, 0.092, 0.012, 16)} m={B.soil} p={[0, 0.118, 0]} castShadow={false} />
        <Vines p={[0, 0.12, 0]} strands={[[0.09, 0.13, 0.62], [-0.07, 0.14, 0.46], [0.14, 0.1, 0.78], [-0.13, 0.1, 0.36], [0.02, 0.15, 0.55]]} m={B.leaf} m2={B.leafLight} size={0.075} crown={9} seed={4} />
      </group>
    </group>
  )
}

/** Le tapis de bain devant la baignoire (des rayures roses et crème, des franges) et une paire de chaussons moelleux. */
export function BathMat({ position, ry = 0.05 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Part geo={rbox(1.12, 0.016, 0.58, 0.007)} m={B.towelCream} p={[0, 0.008, 0]} castShadow={false} />
      <mesh material={B.mat} position={[0, 0.0235, 0]} rotation-x={-Math.PI / 2} receiveShadow raycast={() => {}}>
        <planeGeometry args={[1.06, 0.52]} />
      </mesh>
      {[-0.54, 0.54].flatMap((x) => Array.from({ length: 7 }, (_, i) => (
        <Part key={`${x}${i}`} geo={cyl(0.004, 0.004, 0.05, 5)} m={B.towelCream} p={[x * 1.07, 0.012, -0.24 + i * 0.08]} rotation-z={Math.PI / 2} castShadow={false} />
      )))}
      {/* les chaussons : une semelle, un dessus rembourré, un petit nœud */}
      {[-0.16, 0.16].map((z) => (
        <group key={z} position={[0.15, 0.03, z]} rotation-y={-0.3 + z}>
          <Part geo={rbox(0.26, 0.02, 0.1, 0.01)} m={B.ceramicRose} p={[0, 0, 0]} castShadow={false} />
          <Part geo={SPH} m={B.towelRose} scale={[0.1, 0.05, 0.062]} p={[0.04, 0.045, 0]} castShadow={false} />
          <Part geo={SPH} m={B.towelRose} scale={[0.05, 0.035, 0.05]} p={[-0.08, 0.036, 0]} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

/** Un panier d'osier de serviettes roulées, au sol, et le tabouret en rotin du kalimba. */
export function TowelBasket({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Part geo={cyl(0.27, 0.22, 0.34, 20)} m={B.wickerSmall} p={[0, 0.17, 0]} />
      <Part geo={cyl(0.285, 0.285, 0.026, 20)} m={B.woodDark} p={[0, 0.345, 0]} castShadow={false} />
      <RolledTowel p={[-0.1, 0.4, 0.0]} r={0.065} len={0.3} m={B.towelPeach} rotY={0.4} />
      <RolledTowel p={[0.1, 0.4, 0.0]} r={0.065} len={0.3} m={B.towelRose} rotY={-0.5} />
      <RolledTowel p={[0.0, 0.51, 0.0]} r={0.06} len={0.28} m={B.towelCream} rotY={0.1} />
      {/* les deux anses */}
      {[-1, 1].map((s) => <Part key={s} geo={cyl(0.016, 0.016, 0.07, 8)} m={B.woodDark} p={[s * 0.27, 0.27, 0]} rotation-z={Math.PI / 2} castShadow={false} />)}
    </group>
  )
}

/** Un tabouret rond de rotin, posé sur trois pieds ; dessus, une serviette pliée. `top` : la hauteur du dessus de la serviette. */
export const STOOL_TOP = 0.52
export function Stool({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Part geo={cyl(0.25, 0.25, 0.05, 24)} m={B.woodLight} p={[0, 0.455, 0]} />
      <Part geo={cyl(0.24, 0.24, 0.06, 24)} m={B.wickerSmall} p={[0, 0.4, 0]} castShadow={false} />
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * TAU + 0.5
        return (
          <group key={i} position={[Math.cos(a) * 0.18, 0, Math.sin(a) * 0.18]} rotation={[-Math.sin(a) * 0.09, 0, Math.cos(a) * 0.09]}>
            <Part geo={cyl(0.028, 0.02, 0.43, 10)} m={B.wood} p={[0, 0.215, 0]} castShadow={false} />
          </group>
        )
      })}
      <Part geo={cyl(0.19, 0.19, 0.018, 20)} m={B.wood} p={[0, 0.2, 0]} castShadow={false} />
      {/* le pli de serviette où repose l'instrument */}
      <Part geo={rbox(0.44, 0.036, 0.3, 0.014)} m={B.towelRose} p={[0, 0.5, 0]} rotation-y={0.2} castShadow={false} />
    </group>
  )
}
