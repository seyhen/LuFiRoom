import type { Material } from 'three'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { K } from './materials'

const GLASS = [K.bottleGreen, K.bottleBrown]
const CAPS = [K.red, K.yellow, K.brass]
const XS = [-0.26, -0.087, 0.087, 0.26], ZS = [-0.15, 0, 0.15]

/** Une bouteille de bière de 33 cl : corps, étiquette, épaule, goulot, capsule. Haute de 0,29 pour tenir sous la caisse du dessus. */
function Bottle({ position, glass, cap, tilt = 0 }: { position: V3; glass: Material; cap: Material; tilt?: number }) {
  return (
    <group position={position} rotation-z={tilt}>
      <Part geo={cyl(0.034, 0.034, 0.14, 12)} m={glass} p={[0, 0.07, 0]} castShadow={false} />
      <Part geo={cyl(0.0355, 0.0355, 0.05, 12)} m={K.cream} p={[0, 0.07, 0]} castShadow={false} />
      <Part geo={SPH} m={glass} scale={[0.034, 0.03, 0.034]} p={[0, 0.145, 0]} castShadow={false} />
      <Part geo={cyl(0.013, 0.022, 0.08, 10)} m={glass} p={[0, 0.215, 0]} castShadow={false} />
      <Part geo={cyl(0.0175, 0.0175, 0.018, 10)} m={cap} p={[0, 0.265, 0]} castShadow={false} />
    </group>
  )
}

/**
 * Une caisse de bière en plastique : fond ajouré sur pieds, quatre montants, deux lattes par côté avec du jour entre elles, poignées
 * moulées aux extrémités, casiers de séparation, et jusqu'à douze bouteilles (vert ou brun) qui dépassent de leur capsule.
 * `empty` retire des bouteilles (un trou dans le plan 4 × 3 : une caisse qu'on a déjà entamée).
 */
export function BeerCrate({ position, rotation = 0, color, empty = [] }: { position: V3; rotation?: number; color: Material; empty?: number[] }) {
  return (
    <group position={position} rotation-y={rotation}>
      <Part geo={rbox(0.66, 0.02, 0.46, 0.008)} m={color} p={[0, 0.02, 0]} />
      {[-0.28, 0.28].flatMap((x) => [-0.18, 0.18].map((z) => <Part key={`${x}${z}`} geo={rbox(0.06, 0.02, 0.06, 0.008)} m={color} p={[x, 0.01, z]} castShadow={false} />))}
      {/* les quatre montants et les lattes : deux par côté, un jour de 3 cm entre elles */}
      {[-0.325, 0.325].flatMap((x) => [-0.225, 0.225].map((z) => <Part key={`p${x}${z}`} geo={rbox(0.05, 0.3, 0.05, 0.012)} m={color} p={[x, 0.15, z]} />))}
      {[0.08, 0.2].flatMap((y) => [-0.225, 0.225].map((z) => <Part key={`l${y}${z}`} geo={rbox(0.62, 0.07, 0.02, 0.008)} m={color} p={[0, y, z]} />))}
      {[0.08, 0.2].flatMap((y) => [-0.325, 0.325].map((x) => <Part key={`e${y}${x}`} geo={rbox(0.02, 0.07, 0.4, 0.008)} m={color} p={[x, y, 0]} />))}
      {[-0.337, 0.337].map((x) => (
        <Part key={x} geo={rbox(0.016, 0.05, 0.16, 0.01)} m={K.iron} p={[x, 0.255, 0]} castShadow={false} />
      ))}
      {/* les casiers : trois cloisons dans la longueur, deux dans la largeur */}
      {[-0.175, 0, 0.175].map((x) => (
        <Part key={x} geo={rbox(0.012, 0.18, 0.42, 0.004)} m={color} p={[x, 0.11, 0]} castShadow={false} />
      ))}
      {[-0.075, 0.075].map((z) => (
        <Part key={z} geo={rbox(0.62, 0.18, 0.012, 0.004)} m={color} p={[0, 0.11, z]} castShadow={false} />
      ))}
      {XS.flatMap((x, i) =>
        ZS.map((z, j) => {
          const n = i * 3 + j
          return empty.includes(n) ? null : <Bottle key={n} position={[x, 0.03, z]} glass={GLASS[(i + j) % 2 === 0 ? 0 : 1]} cap={CAPS[(i * 2 + j) % 3]} />
        }),
      )}
    </group>
  )
}

/**
 * Deux caisses empilées contre le mur, la haute entamée, une bouteille debout à côté et une autre couchée sur le pavé, dans la
 * flaque de lumière du néon, avec leur capsule tombée.
 */
export function Crates() {
  return (
    <group position={[2.5, 0, -2.45]} rotation-y={0.18}>
      <BeerCrate position={[0, 0, 0]} color={K.red} />
      <BeerCrate position={[0.02, 0.3, 0.01]} rotation={0.08} color={K.yellow} empty={[1, 4, 7, 10]} />
      <Bottle position={[-0.52, 0, 0.22]} glass={K.bottleBrown} cap={K.red} />
      <group position={[-0.62, 0.034, 0.08]} rotation-y={0.9}>
        <Part geo={cyl(0.034, 0.034, 0.14, 12)} m={K.bottleGreen} p={[0.07, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={SPH} m={K.bottleGreen} scale={[0.03, 0.034, 0.034]} p={[0.15, 0, 0]} castShadow={false} />
        <Part geo={cyl(0.013, 0.022, 0.08, 10)} m={K.bottleGreen} p={[0.2, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.0175, 0.0175, 0.018, 10)} m={K.yellow} p={[0.25, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      </group>
      <Part geo={cyl(0.018, 0.018, 0.008, 10)} m={K.brass} p={[-0.4, 0.004, 0.32]} castShadow={false} />
      <Part geo={rbox(0.52, 0.2, 0.4, 0.02)} m={K.kraft} p={[-0.88, 0.1, -0.1]} rotation-y={0.4} />
    </group>
  )
}
