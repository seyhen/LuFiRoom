import { Part, SPH, cyl, rbox } from '../parts'
import { Candle } from '../objects/Candle'
import { R } from './materials'
import { Foliage } from '../nature/Foliage'
import { Aloe } from './Planters'
import { Vessel, innerR } from '../igloo/Vessel'

/** Une bouteille de vin debout : corps, épaule arrondie, goulot, capsule et étiquette. `p` est son pied. */
function WineBottle({ p, m = R.wine, s = 1 }: { p: [number, number, number]; m?: typeof R.wine; s?: number }) {
  return (
    <group position={p} scale={s}>
      <Part geo={cyl(0.04, 0.04, 0.17, 16)} m={m} p={[0, 0.085, 0]} />
      <Part geo={SPH} m={m} scale={[0.04, 0.035, 0.04]} p={[0, 0.17, 0]} castShadow={false} />
      <Part geo={cyl(0.014, 0.018, 0.09, 12)} m={m} p={[0, 0.24, 0]} castShadow={false} />
      <Part geo={cyl(0.017, 0.017, 0.045, 12)} m={R.brass} p={[0, 0.28, 0]} castShadow={false} />
      {/* l'étiquette fait le tour du corps, un peu plus large que lui */}
      <Part geo={cyl(0.042, 0.042, 0.07, 16)} m={R.label} p={[0, 0.08, 0]} castShadow={false} />
    </group>
  )
}

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
        <WineBottle p={[0.15, 0.42, 0.12]} />
        {/* le bouchon tiré, posé à côté ; des lattes et la marque au pochoir sur les faces vues */}
        <Part geo={cyl(0.012, 0.012, 0.035, 10)} m={R.label} p={[-0.16, 0.425, -0.12]} rotation-z={Math.PI / 2} castShadow={false} />
        {[0.1, 0.21, 0.32].map((y) => (
          <group key={y}>
            <Part geo={rbox(0.46, 0.012, 0.012, 0.005)} m={R.log} p={[0, y, 0.215]} castShadow={false} />
            <Part geo={rbox(0.012, 0.012, 0.38, 0.005)} m={R.log} p={[0.255, y, 0]} castShadow={false} />
          </group>
        ))}
      </group>
      <Lantern position={[0.25, 0, -1.45]} />
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

/** Devant : un bac de zinc plein de glace et de bouteilles et des caisses de bois empilées avec des plantes (l'arrosoir est à part : WateringCan). */
export function FrontCorner() {
  return (
    <>
      {/* le bac de zinc, ouvert : la glace pilée à mi-hauteur, quatre bouteilles penchées dedans (corps, étiquette, goulot) */}
      <group position={[1.45, 0, 2.2]}>
        <Vessel p={[0, 0, 0]} rt={0.32} rb={0.27} h={0.36} m={R.zinc} inner={R.zincIn} t={0.014} />
        {[-1, 1].map((s) => (
          <Part key={s} m={R.zinc} p={[s * 0.335, 0.29, 0]} rotation-y={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.05, 0.012, 6, 12, Math.PI]} />
          </Part>
        ))}
        <Part geo={cyl(innerR(0.32, 0.27, 0.36, 0.27, 0.014), innerR(0.32, 0.27, 0.36, 0.27, 0.014), 0.02, 22)} m={R.ice} p={[0, 0.26, 0]} castShadow={false} />
        {/* des glaçons qui dépassent de la glace pilée */}
        {[[0.16, 0.08], [-0.17, 0.1], [0.02, 0.19], [-0.08, -0.16], [0.15, -0.12]].map(([x, z], i) => (
          <Part key={i} geo={rbox(0.07, 0.06, 0.07, 0.02)} m={R.ice} p={[x, 0.285, z]} rotation={[0.3 * i, i, 0.2]} castShadow={false} />
        ))}
        {([[-0.1, 0.06, R.wine, -0.2], [0.08, -0.07, R.leafDark, 0.22], [0.1, 0.1, R.mustard, 0.15], [-0.06, -0.12, R.leafDark, -0.25]] as const).map(([x, z, m, a], i) => (
          <group key={i} position={[x, 0.12, z]} rotation={[a, 0, a * 0.6]}>
            <WineBottle p={[0, 0, 0]} m={m} s={1.05} />
          </group>
        ))}
      </group>
      <group position={[-1.3, 0, 2.6]} rotation-y={0.3}>
        <Part geo={rbox(0.55, 0.32, 0.4, 0.02)} m={R.teak} p={[0, 0.16, 0]} />
        <Part geo={rbox(0.45, 0.3, 0.36, 0.02)} m={R.teak} p={[0.05, 0.47, 0.0]} rotation-y={0.2} />
        <Part geo={cyl(0.12, 0.1, 0.16, 14)} m={R.terracotta} p={[0.05, 0.7, 0]} />
        <Aloe position={[0.05, 0.77, 0]} />
        {/* les lattes des deux caisses, sur les faces vues */}
        {[0.08, 0.2].map((y) => (
          <group key={y}>
            <Part geo={rbox(0.5, 0.012, 0.012, 0.005)} m={R.log} p={[0, y, 0.205]} castShadow={false} />
            <Part geo={rbox(0.012, 0.012, 0.35, 0.005)} m={R.log} p={[0.28, y, 0]} castShadow={false} />
          </group>
        ))}
        {/* le pot de tomates, par terre au pied des caisses : pot, terre sous le bord, tuteur et ficelle, feuillage, grappe */}
        <group position={[-0.5, 0, 0.12]}>
          <Vessel p={[0, 0, 0]} rt={0.13} rb={0.1} h={0.22} m={R.terracotta} inner={R.soil} t={0.012} />
          <Part geo={cyl(innerR(0.13, 0.1, 0.22, 0.19, 0.012), innerR(0.13, 0.1, 0.22, 0.19, 0.012), 0.02, 16)} m={R.soil} p={[0, 0.19, 0]} castShadow={false} />
          <Part geo={cyl(0.01, 0.01, 0.62, 6)} m={R.log} p={[0.03, 0.47, -0.02]} castShadow={false} />
          {[0.36, 0.52].map((y) => (
            <Part key={y} m={R.rope} p={[0.03, y, -0.02]} rotation-x={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.018, 0.005, 5, 10]} />
            </Part>
          ))}
          <Foliage v={3} p={[0, 0.36, 0]} s={[0.16, 0.2, 0.15]} m={R.tomatoF} shadow={false} />
          <Foliage v={1} p={[0.02, 0.58, 0]} s={[0.1, 0.1, 0.1]} m={R.tomatoF} shadow={false} />
          {[[0.12, 0.34, 0.06], [0.14, 0.28, -0.02], [0.08, 0.44, 0.12], [-0.1, 0.4, 0.11], [0.04, 0.3, 0.15]].map(([x, y, z], i) => (
            <Part key={i} geo={SPH} m={R.tomato} scale={[0.038, 0.034, 0.038]} p={[x, y, z]} castShadow={false} />
          ))}
        </group>
      </group>
    </>
  )
}
