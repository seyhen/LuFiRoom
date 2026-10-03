import { TAU } from '../../math'
import { Part, cyl, rbox } from '../parts'
import { R } from './materials'
import { SHED } from './RoofShell'

/** Le château d'eau de bois sur ses pieds d'acier, perché sur la cage d'escalier, avec son échelle. */
export function WaterTower() {
  const cx = (SHED.x0 + SHED.x1) / 2 + 0.05, cz = (SHED.z0 + SHED.z1) / 2
  return (
    <group position={[cx, SHED.h + 0.05, cz]}>
      {[0, 1, 2, 3].map((i) => {
        const a = Math.PI / 4 + (i / 4) * TAU
        return <Part key={i} geo={cyl(0.03, 0.035, 0.75, 8)} m={R.steel} p={[Math.cos(a) * 0.48, 0.37, Math.sin(a) * 0.48]} />
      })}
      <Part geo={rbox(1.15, 0.05, 1.15, 0.02)} m={R.steel} p={[0, 0.76, 0]} />
      <Part geo={cyl(0.62, 0.62, 1.2, 28)} m={R.stave} p={[0, 1.38, 0]} />
      <Part m={R.steel} p={[0, 2.18, 0]}>
        <coneGeometry args={[0.7, 0.42, 28]} />
      </Part>
      <Part geo={cyl(0.04, 0.04, 0.12, 8)} m={R.steel} p={[0, 2.45, 0]} castShadow={false} />
      {/* l'échelle, côté ville */}
      <group position={[0.66, 1.3, 0.25]}>
        {[-0.1, 0.1].map((z) => (
          <Part key={z} geo={cyl(0.01, 0.01, 1.3, 4)} m={R.steel} p={[0, 0, z]} castShadow={false} />
        ))}
        {[-0.45, -0.15, 0.15, 0.45].map((y) => (
          <Part key={y} geo={cyl(0.008, 0.008, 0.2, 4)} m={R.steel} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false} />
        ))}
      </group>
    </group>
  )
}
