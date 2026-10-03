import { Part, SPH, cyl, rbox } from '../parts'
import { Candle } from '../objects/Candle'
import { R } from './materials'

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
      {/* le plaid, en vrac au bout du canapé */}
      <Part geo={rbox(0.62, 0.06, 0.6, 0.03)} m={R.plaid} p={[0.1, 0.54, 0.95]} rotation={[0.08, 0.3, 0.05]} />
      <Part geo={rbox(0.05, 0.3, 0.55, 0.02)} m={R.plaid} p={[0.42, 0.36, 1.0]} rotation-z={0.1} castShadow={false} />
    </group>
  )
}

/** Un fauteuil Adirondack en bois peint, son dossier à lattes, ses larges accoudoirs. */
function Adirondack({ position, rotation, m }: { position: [number, number, number]; rotation: number; m: typeof R.teal }) {
  return (
    <group position={position} rotation-y={rotation}>
      {[-0.28, 0.28].map((x) => (
        <group key={x}>
          <Part geo={rbox(0.05, 0.42, 0.06, 0.02)} m={m} p={[x, 0.21, 0.28]} />
          <Part geo={rbox(0.05, 0.06, 0.8, 0.02)} m={m} p={[x, 0.22, -0.02]} rotation-x={-0.12} />
          <Part geo={rbox(0.14, 0.04, 0.72, 0.02)} m={m} p={[x * 1.15, 0.5, 0.0]} />
        </group>
      ))}
      {[-0.15, 0, 0.15, 0.3].map((z) => (
        <Part key={z} geo={rbox(0.6, 0.03, 0.12, 0.012)} m={m} p={[0, 0.3 - z * 0.15, z]} castShadow={false} />
      ))}
      <group position={[0, 0.3, -0.3]} rotation-x={-0.45}>
        {[-0.2, -0.1, 0, 0.1, 0.2].map((x) => (
          <Part key={x} geo={rbox(0.08, 0.75 + (0.1 - Math.abs(x)) * 0.8, 0.03, 0.03)} m={m} p={[x, 0.38, 0]} />
        ))}
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

/** Une caisse de disques au bout du canapé, la radio dessus. */
export function RadioCrate() {
  return (
    <group position={[-2.55, 0, 2.35]}>
      <Part geo={rbox(0.95, 0.5, 0.55, 0.03)} m={R.teak} p={[0, 0.25, 0]} />
      <Part geo={rbox(0.88, 0.46, 0.48, 0.02)} m={R.tar} p={[0, 0.28, 0]} castShadow={false} />
      {[-0.3, -0.2, -0.1, 0, 0.1, 0.2, 0.3].map((x, i) => (
        <Part key={x} geo={rbox(0.025, 0.38, 0.42, 0.008)} m={[R.rust, R.teal, R.mustard, R.cushion, R.plaid, R.teal, R.pink][i]} p={[x, 0.34, 0]} rotation-z={-0.1 + (i % 2) * 0.08} castShadow={false} />
      ))}
    </group>
  )
}

/** Une lunette astronomique sur son trépied, tournée vers le ciel. */
export function Telescope() {
  return (
    <group position={[1.1, 0, 2.45]} rotation-y={-0.7}>
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2
        return <Part key={i} geo={cyl(0.014, 0.014, 1.0, 6)} m={R.teak} p={[Math.cos(a) * 0.16, 0.48, Math.sin(a) * 0.16]} rotation={[Math.sin(a) * 0.32, 0, -Math.cos(a) * 0.32]} />
      })}
      <Part geo={SPH} m={R.brass} scale={0.04} p={[0, 0.98, 0]} />
      <group position={[0, 1.02, 0]} rotation={[0, 0, 0.75]}>
        <Part geo={cyl(0.055, 0.065, 0.8, 16)} m={R.brass} p={[0, 0.22, 0]} />
        <Part geo={cyl(0.075, 0.075, 0.08, 16)} m={R.steel} p={[0, 0.62, 0]} castShadow={false} />
        <Part geo={cyl(0.02, 0.025, 0.12, 8)} m={R.steel} p={[0, -0.22, 0]} castShadow={false} />
      </group>
    </group>
  )
}
