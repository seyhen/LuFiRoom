import { Part, SPH, cyl, rbox } from '../parts'
import { R } from './materials'

/** Un barbecue boule sur trois pieds, sa clayette de teck, la spatule et la pince accrochées. `position` est le sol sous lui. */
function Kettle({ position, ry = 0 }: { position: [number, number, number]; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      {/* trois pieds qui s'écartent vers le bas, et l'anneau qui les tient */}
      {[0, 1, 2].map((i) => {
        const a = (i / 3) * Math.PI * 2 + 0.5
        return (
          <group key={i} rotation-y={-a}>
            <Part geo={cyl(0.014, 0.014, 0.58, 6)} m={R.steel} p={[0.17, 0.27, 0]} rotation-z={0.16} castShadow={false} />
          </group>
        )
      })}
      <Part geo={cyl(0.21, 0.21, 0.025, 20)} m={R.steel} p={[0, 0.3, 0]} castShadow={false} />
      {/* la cuve noire et le couvercle rouille, un petit jeu entre les deux */}
      <Part geo={SPH} m={R.steel} scale={[0.33, 0.2, 0.33]} p={[0, 0.58, 0]} />
      <Part geo={SPH} m={R.rust} scale={[0.34, 0.24, 0.34]} p={[0, 0.7, 0]} />
      <Part geo={cyl(0.345, 0.345, 0.025, 24)} m={R.steel} p={[0, 0.655, 0]} castShadow={false} />
      <Part geo={cyl(0.045, 0.05, 0.03, 12)} m={R.steel} p={[0, 0.94, 0]} castShadow={false} />
      <Part geo={cyl(0.012, 0.012, 0.06, 6)} m={R.brass} p={[0, 0.975, 0]} castShadow={false} />
      <Part geo={rbox(0.2, 0.03, 0.03, 0.012)} m={R.steel} p={[0.0, 0.82, 0.34]} castShadow={false} />
      {[-0.09, 0.09].map((x) => <Part key={x} geo={cyl(0.008, 0.008, 0.08, 6)} m={R.steel} p={[x, 0.79, 0.34]} castShadow={false} />)}
      {/* la clayette latérale : une planche de teck, la spatule et la pince */}
      <Part geo={rbox(0.34, 0.03, 0.2, 0.01)} m={R.teak} p={[0.5, 0.56, 0]} />
      <Part geo={cyl(0.01, 0.01, 0.16, 6)} m={R.steel} p={[0.4, 0.5, 0.08]} rotation-z={Math.PI / 2} castShadow={false} />
      <Part geo={rbox(0.2, 0.012, 0.012, 0.005)} m={R.steel} p={[0.5, 0.585, 0.04]} rotation-y={0.2} castShadow={false} />
      <Part geo={rbox(0.07, 0.01, 0.06, 0.004)} m={R.steel} p={[0.6, 0.585, 0.04]} castShadow={false} />
      <Part geo={rbox(0.18, 0.012, 0.012, 0.005)} m={R.steel} p={[0.48, 0.585, -0.04]} rotation-y={-0.15} castShadow={false} />
    </group>
  )
}

/** Une glacière : caisse sarcelle, couvercle crème, poignées, fermoir de laiton, une serviette mouillée posée dessus. */
function Cooler({ position, ry = 0 }: { position: [number, number, number]; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Part geo={rbox(0.7, 0.34, 0.42, 0.05)} m={R.teal} p={[0, 0.17, 0]} />
      <Part geo={rbox(0.72, 0.1, 0.44, 0.04)} m={R.cushion} p={[0, 0.39, 0]} />
      {[-0.39, 0.39].map((x) => <Part key={x} geo={rbox(0.05, 0.05, 0.2, 0.02)} m={R.steel} p={[x, 0.3, 0]} castShadow={false} />)}
      <Part geo={rbox(0.08, 0.07, 0.02, 0.01)} m={R.brass} p={[0, 0.34, 0.215]} castShadow={false} />
      <Part geo={rbox(0.3, 0.08, 0.012, 0.004)} m={R.label} p={[-0.12, 0.2, 0.213]} castShadow={false} />
      <Part geo={cyl(0.02, 0.02, 0.03, 10)} m={R.steel} p={[0.3, 0.06, 0.215]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={rbox(0.34, 0.025, 0.22, 0.01)} m={R.sheetStripe} p={[0.1, 0.455, 0.02]} rotation-y={0.18} castShadow={false} />
    </group>
  )
}

/**
 * Le coin du fond à droite, resté vide entre le fauteuil, l'olivier et le parapet : un barbecue boule et sa clayette,
 * une glacière de pique-nique posée à côté.
 */
export function BackNook() {
  return (
    <>
      <Kettle position={[1.5, 0, -1.25]} ry={-0.5} />
      <Cooler position={[2.4, 0, -1.72]} ry={0.18} />
    </>
  )
}
