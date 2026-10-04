import { Part, SPH, cyl, rbox } from '../parts'
import { Candle } from '../objects/Candle'
import { R } from './materials'
import { Foliage } from '../nature/Foliage'
import { Aloe } from './Planters'

/** Le canapé d'extérieur en teck contre le parapet : gros coussins, un plaid, un coussin moutarde et un rouille. */
export function Sofa() {
  return (
    <group position={[-2.6, 0, 0.15]}>
      <Part geo={rbox(0.92, 0.3, 2.9, 0.05)} m={R.teak} p={[0, 0.2, 0]} />
      {[-1.38, 1.38].map((z) => (
        <Part key={z} geo={rbox(0.92, 0.62, 0.14, 0.05)} m={R.teak} p={[0, 0.36, z]} />
      ))}
      <Part geo={rbox(0.14, 0.7, 2.9, 0.05)} m={R.teak} p={[-0.4, 0.5, 0]} />
      {[-0.66, 0.66].map((z) => (
        <Part key={z} geo={rbox(0.74, 0.16, 1.26, 0.07)} m={R.cushion} p={[0.06, 0.43, z]} />
      ))}
      {[-0.66, 0.66].map((z) => (
        <Part key={z} geo={rbox(0.2, 0.5, 1.22, 0.1)} m={R.cushion} p={[-0.24, 0.72, z]} rotation-z={-0.15} />
      ))}
      <Part geo={rbox(0.14, 0.34, 0.38, 0.08)} m={R.mustard} p={[-0.1, 0.68, -0.95]} rotation={[0.15, 0.2, -0.25]} />
      <Part geo={rbox(0.14, 0.32, 0.36, 0.08)} m={R.rust} p={[-0.1, 0.67, 0.92]} rotation={[-0.15, -0.2, -0.25]} />
      <Part geo={rbox(0.14, 0.3, 0.34, 0.08)} m={R.teal} p={[-0.08, 0.66, 0.15]} rotation={[0, 0.1, -0.2]} />
      {/* le plaid, jeté sur le coussin du bout : il retombe devant l'assise, contre sa face (le bord du siège est à x = 0,46) */}
      <Part geo={rbox(0.56, 0.04, 0.58, 0.02)} m={R.plaid} p={[0.19, 0.53, 0.93]} />
      <Part geo={rbox(0.04, 0.26, 0.56, 0.02)} m={R.plaid} p={[0.485, 0.4, 0.93]} castShadow={false} />
    </group>
  )
}

/** Un fauteuil Adirondack en bois peint, son dossier à lattes, ses larges accoudoirs. */
function Adirondack({ position, rotation, m }: { position: [number, number, number]; rotation: number; m: typeof R.teal }) {
  return (
    <group position={position} rotation-y={rotation}>
      {[-0.28, 0.28].map((x) => (
        <group key={x}>
          <Part geo={rbox(0.06, 0.48, 0.07, 0.02)} m={m} p={[x, 0.24, 0.28]} />
          <Part geo={rbox(0.06, 0.26, 0.07, 0.02)} m={m} p={[x, 0.13, -0.36]} />
          <Part geo={rbox(0.05, 0.22, 0.05, 0.02)} m={m} p={[x * 1.15, 0.39, -0.18]} castShadow={false} />
          <Part geo={rbox(0.05, 0.06, 0.8, 0.02)} m={m} p={[x, 0.22, -0.02]} rotation-x={-0.12} />
          <Part geo={rbox(0.16, 0.045, 0.72, 0.02)} m={m} p={[x * 1.15, 0.5, 0.0]} />
        </group>
      ))}
      <Part geo={rbox(0.58, 0.04, 0.62, 0.02)} m={m} p={[0, 0.3, 0.0]} rotation-x={-0.12} />
      <group position={[0, 0.3, -0.3]} rotation-x={-0.45}>
        {[-0.22, -0.11, 0, 0.11, 0.22].map((x) => (
          <Part key={x} geo={rbox(0.1, 0.75 + (0.12 - Math.abs(x)) * 0.8, 0.035, 0.035)} m={m} p={[x, 0.38, 0]} rotation-z={-x * 0.35} />
        ))}
        <Part geo={rbox(0.62, 0.05, 0.04, 0.02)} m={m} p={[0, 0.2, -0.03]} castShadow={false} />
      </group>
      <Part geo={rbox(0.44, 0.08, 0.4, 0.04)} m={R.cushion} p={[0, 0.33, 0.02]} rotation-x={-0.1} />
    </group>
  )
}

/** Le coin du feu : tapis rayé, deux fauteuils Adirondack, une caisse en guise de table avec du vin et une lanterne. */
export function FireCorner() {
  return (
    <>
      <mesh material={R.rug} position={[-1.15, 0.008, 0.35]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[2.6, 3.0]} />
      </mesh>
      <Adirondack position={[0.55, 0, -0.55]} rotation={-2.2} m={R.teal} />
      <Adirondack position={[0.45, 0, 1.35]} rotation={-1.0} m={R.mustard} />
      {/* caisse de bois, verres de vin, lanterne */}
      <group position={[-1.75, 0, -1.25]}>
        <Part geo={rbox(0.5, 0.42, 0.42, 0.03)} m={R.teak} p={[0, 0.21, 0]} />
        {[[-0.08, 0.06], [0.1, -0.05]].map(([x, z], i) => (
          <group key={i} position={[x, 0.42, z]}>
            <Part geo={cyl(0.03, 0.03, 0.006, 12)} m={R.glass} castShadow={false} />
            <Part geo={cyl(0.005, 0.005, 0.08, 6)} m={R.glass} p={[0, 0.04, 0]} castShadow={false} />
            <Part geo={cyl(0.032, 0.022, 0.06, 12)} m={R.wine} p={[0, 0.1, 0]} castShadow={false} />
          </group>
        ))}
        <Part geo={cyl(0.03, 0.035, 0.24, 12)} m={R.wine} p={[0.17, 0.54, 0.14]} />
        <Part geo={cyl(0.012, 0.012, 0.08, 6)} m={R.wine} p={[0.17, 0.7, 0.14]} castShadow={false} />
      </group>
      <Lantern position={[-0.15, 0, -1.6]} />
      <Lantern position={[1.55, 0, 0.45]} />
    </>
  )
}

/** Une lanterne de métal noir et de verre, une bougie dedans. */
export function Lantern({ position, scale = 1 }: { position: [number, number, number]; scale?: number }) {
  const [x, y, z] = position
  return (
    <group position={[x, y, z]} scale={scale}>
      <Part geo={rbox(0.24, 0.03, 0.24, 0.01)} m={R.steel} p={[0, 0.015, 0]} />
      <Part geo={rbox(0.2, 0.32, 0.2, 0.02)} m={R.glass} p={[0, 0.19, 0]} castShadow={false} />
      {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([sx, sz]) => (
        <Part key={`${sx}${sz}`} geo={cyl(0.01, 0.01, 0.34, 4)} m={R.steel} p={[sx * 0.1, 0.19, sz * 0.1]} castShadow={false} />
      ))}
      <Part m={R.steel} p={[0, 0.4, 0]} rotation-y={Math.PI / 4}>
        <coneGeometry args={[0.17, 0.12, 4]} />
      </Part>
      <Part m={R.steel} p={[0, 0.5, 0]} castShadow={false}>
        <torusGeometry args={[0.04, 0.008, 6, 12]} />
      </Part>
      <Candle position={[0, 0.03, 0]} height={0.1} radius={0.035} />
    </group>
  )
}

/** Une caisse de bois à lattes au bout du canapé, la radio dessus. */
export function RadioCrate() {
  return (
    <group position={[-2.55, 0, 2.35]}>
      <Part geo={rbox(0.95, 0.5, 0.55, 0.03)} m={R.teak} p={[0, 0.25, 0]} />
      {/* les lattes : des rainures sur les deux faces vues de la caméra (+z et +x) */}
      {[0.12, 0.25, 0.38].map((y) => (
        <group key={y}>
          <Part geo={rbox(0.9, 0.014, 0.012, 0.005)} m={R.tar} p={[0, y, 0.275]} castShadow={false} />
          <Part geo={rbox(0.012, 0.014, 0.5, 0.005)} m={R.tar} p={[0.477, y, 0]} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

/**
 * Une lunette astronomique sur son trépied de bois, tournée vers le ciel : tablette à oculaires entre les pieds, monture
 * de laiton, tube avec son pare-buée, le petit chercheur sur le côté et l'oculaire coudé.
 */
export function Telescope() {
  return (
    <group position={[0.15, 0, 2.6]} rotation-y={0.35}>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.5
        return <Part key={i} geo={cyl(0.016, 0.02, 1.02, 8)} m={R.teak} p={[Math.cos(a) * 0.17, 0.49, Math.sin(a) * 0.17]} rotation={[-Math.sin(a) * 0.34, 0, Math.cos(a) * 0.34]} />
      })}
      {/* la tablette triangulaire, à mi-hauteur, et deux oculaires posés dessus */}
      <Part geo={cyl(0.1, 0.1, 0.015, 3)} m={R.teak} p={[0, 0.42, 0]} rotation-y={0.5} castShadow={false} />
      {[[0.03, 0.02], [-0.03, -0.02]].map(([x, z], i) => (
        <Part key={i} geo={cyl(0.012, 0.012, 0.04, 10)} m={R.steel} p={[x, 0.45, z]} castShadow={false} />
      ))}
      {/* la tête et sa monture */}
      <Part geo={cyl(0.05, 0.06, 0.05, 12)} m={R.brass} p={[0, 1.0, 0]} />
      <Part geo={rbox(0.03, 0.12, 0.1, 0.012)} m={R.brass} p={[0, 1.07, 0]} castShadow={false} />
      {/* le tube, pointé vers le haut du ciel, vers le fond */}
      <group position={[0, 1.1, 0]} rotation={[-0.9, 0, 0]}>
        <Part geo={cyl(0.05, 0.05, 0.78, 18)} m={R.brass} p={[0, 0.12, 0]} />
        <Part geo={cyl(0.062, 0.058, 0.2, 18)} m={R.steel} p={[0, 0.58, 0]} />
        <Part geo={cyl(0.052, 0.052, 0.01, 18)} m={R.glass} p={[0, 0.685, 0]} castShadow={false} />
        {[0.0, 0.3].map((y) => (
          <Part key={y} geo={cyl(0.054, 0.054, 0.02, 18)} m={R.steel} p={[0, y, 0]} castShadow={false} />
        ))}
        {/* le chercheur sur ses deux bagues */}
        <Part geo={cyl(0.016, 0.016, 0.22, 10)} m={R.steel} p={[0.075, 0.2, 0]} castShadow={false} />
        {[0.12, 0.28].map((y) => (
          <Part key={y} geo={rbox(0.03, 0.012, 0.012, 0.004)} m={R.steel} p={[0.055, y, 0]} castShadow={false} />
        ))}
        {/* le renvoi coudé et l'oculaire, en bas du tube */}
        <Part geo={cyl(0.022, 0.022, 0.08, 10)} m={R.steel} p={[0, -0.3, 0]} castShadow={false} />
        <Part geo={cyl(0.018, 0.02, 0.08, 10)} m={R.steel} p={[0, -0.34, 0.04]} rotation-x={Math.PI / 2} castShadow={false} />
      </group>
    </group>
  )
}

/** Devant : un bac de zinc plein de glace et de bouteilles, des caisses de bois empilées avec des plantes, un arrosoir. */
export function FrontCorner() {
  return (
    <>
      <group position={[1.0, 0, 1.75]}>
        <Part geo={cyl(0.32, 0.28, 0.36, 22)} m={R.zinc} p={[0, 0.18, 0]} />
        {[-1, 1].map((s) => (
          <Part key={s} m={R.zinc} p={[s * 0.33, 0.3, 0]} rotation-y={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.05, 0.012, 6, 12, Math.PI]} />
          </Part>
        ))}
        <Part geo={cyl(0.29, 0.29, 0.04, 22)} m={R.ice} p={[0, 0.355, 0]} castShadow={false} />
        {[[-0.1, 0.05, R.wine], [0.08, -0.06, R.leafDark], [0.12, 0.12, R.mustard], [-0.05, -0.14, R.leafDark]].map(([x, z, m], i) => (
          <group key={i} position={[x as number, 0.2, z as number]} rotation={[0.2 * (i % 2 ? 1 : -1), 0, 0.15]}>
            {/* une bouteille plantée dans la glace : corps, épaule, goulot et capsule dorée dépassent du bac */}
            <Part geo={cyl(0.045, 0.045, 0.2, 12)} m={m as typeof R.wine} p={[0, 0.1, 0]} castShadow={false} />
            <Part geo={SPH} m={m as typeof R.wine} scale={[0.045, 0.045, 0.045]} p={[0, 0.2, 0]} castShadow={false} />
            <Part geo={cyl(0.016, 0.022, 0.12, 10)} m={m as typeof R.wine} p={[0, 0.27, 0]} castShadow={false} />
            <Part geo={cyl(0.02, 0.02, 0.035, 10)} m={R.brass} p={[0, 0.34, 0]} castShadow={false} />
          </group>
        ))}
      </group>
      <group position={[-1.3, 0, 2.6]} rotation-y={0.3}>
        <Part geo={rbox(0.55, 0.32, 0.4, 0.02)} m={R.teak} p={[0, 0.16, 0]} />
        <Part geo={rbox(0.45, 0.3, 0.36, 0.02)} m={R.teak} p={[0.05, 0.47, 0.0]} rotation-y={0.2} />
        <Part geo={cyl(0.12, 0.1, 0.16, 14)} m={R.terracotta} p={[0.05, 0.7, 0]} />
        <Aloe position={[0.05, 0.77, 0]} />
        <Part geo={cyl(0.1, 0.09, 0.14, 14)} m={R.terracotta} p={[-0.15, 0.39, 0.1]} />
        <Foliage v={3} p={[-0.15, 0.44, 0.1]} s={[0.12, 0.12, 0.11]} m={R.herbF[0]} shadow={false} />
        {[0, 1, 2, 3].map((i) => (
          <Part key={i} geo={SPH} m={R.tomato} scale={0.03} p={[-0.15 + Math.cos(i * 1.6) * 0.08, 0.53 + (i % 2) * 0.03, 0.1 + Math.sin(i * 1.6) * 0.08]} castShadow={false} />
        ))}
        {/* l'arrosoir */}
        <group position={[0.45, 0, 0.2]}>
          <Part geo={cyl(0.1, 0.11, 0.22, 16)} m={R.zinc} p={[0, 0.11, 0]} />
          <Part geo={cyl(0.012, 0.02, 0.26, 8)} m={R.zinc} p={[0.15, 0.2, 0]} rotation-z={-0.9} castShadow={false} />
          <Part m={R.zinc} p={[-0.02, 0.24, 0]} castShadow={false}>
            <torusGeometry args={[0.07, 0.012, 6, 12, Math.PI]} />
          </Part>
        </group>
      </group>
    </>
  )
}
