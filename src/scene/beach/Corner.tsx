import { TAU } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { Candle } from '../objects/Candle'
import { B } from './materials'

// Pochettes de disques dans la caisse : [décalage, couleur].
const RECORDS = [[-0.3, B.coral], [-0.22, B.turquoise], [-0.15, B.butter], [-0.08, B.navy], [0, B.pink], [0.08, B.seaglass], [0.16, B.coral], [0.24, B.linen]] as const

/** Une caisse de bois pleine de disques, au pied du mur : la radio est posée dessus. */
export function RecordCrate() {
  return (
    <group position={[-2.45, 0, 1.55]}>
      <Part geo={rbox(0.95, 0.5, 0.52, 0.03)} m={B.wood} p={[0, 0.25, 0]} />
      <Part geo={rbox(0.88, 0.46, 0.45, 0.02)} m={B.slab} p={[0, 0.27, 0]} castShadow={false} />
      {RECORDS.map(([x, m], i) => (
        <Part key={i} geo={rbox(0.025, 0.36, 0.38, 0.008)} m={m} p={[x, 0.32 + (i % 3) * 0.015, 0]} rotation-z={-0.12 + (i % 2) * 0.06} castShadow={false} />
      ))}
    </group>
  )
}

/** Une planche de surf pastel appuyée contre le mur, et sa dérive. */
export function Surfboard() {
  return (
    <group position={[-2.82, 0, 2.55]} rotation={[0, 0, -0.18]}>
      <group position={[0, 1.15, 0]} rotation-x={0.12}>
        <Part geo={SPH} m={B.shell} scale={[0.05, 1.12, 0.29]} />
        <Part geo={SPH} m={B.coral} scale={[0.052, 1.0, 0.06]} p={[0.002, 0.02, 0]} castShadow={false} />
        <Part geo={SPH} m={B.turquoise} scale={[0.053, 0.08, 0.27]} p={[0, -0.25, 0]} castShadow={false} />
      </group>
    </group>
  )
}

/** Deux chapeaux de paille accrochés au mur, au-dessus de la caisse. */
export function Hats() {
  return (
    <>
      {[[1.15, B.coral], [1.62, B.turquoise]].map(([z, band], i) => (
        <group key={i} position={[-2.92, 2.15 - i * 0.12, z as number]} rotation-z={-Math.PI / 2 + 0.25}>
          <Part geo={cyl(0.26, 0.26, 0.02, 28)} m={B.cane} />
          <Part geo={SPH} m={B.cane} scale={[0.14, 0.11, 0.14]} p={[0, 0.03, 0]} />
          <Part geo={cyl(0.142, 0.142, 0.035, 22)} m={band as typeof B.coral} p={[0, 0.04, 0]} castShadow={false} />
        </group>
      ))}
      {[1.15, 1.62].map((z, i) => (
        <Part key={z} geo={cyl(0.015, 0.015, 0.08, 6)} m={B.wood} p={[-2.96, 2.2 - i * 0.12, z]} rotation-z={Math.PI / 2} castShadow={false} />
      ))}
    </>
  )
}

/** L'étagère de bois flotté au-dessus du lit : coquillages, un bateau en bouteille, un pot de sable, une petite plante. */
export function ShellShelf() {
  return (
    <group position={[-2.82, 1.95, -0.3]}>
      <Part geo={rbox(0.3, 0.06, 1.5, 0.02)} m={B.driftwood} />
      {[-0.55, 0.55].map((z) => (
        <Part key={z} geo={rbox(0.24, 0.14, 0.05, 0.02)} m={B.wood} p={[-0.02, -0.09, z]} castShadow={false} />
      ))}
      {/* bateau en bouteille */}
      <group position={[0, 0.1, -0.45]}>
        <Part geo={cyl(0.065, 0.065, 0.3, 16)} m={B.glass} rotation-x={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.025, 0.035, 0.08, 10)} m={B.glass} p={[0, 0, -0.18]} rotation-x={Math.PI / 2} castShadow={false} />
        <Part geo={rbox(0.03, 0.03, 0.16, 0.01)} m={B.wood} p={[0, -0.03, 0]} castShadow={false} />
        <Part m={B.linen} p={[0, 0.02, 0.01]} rotation-y={Math.PI / 2} castShadow={false}>
          <coneGeometry args={[0.045, 0.08, 3]} />
        </Part>
      </group>
      {/* coquillages, une étoile de mer */}
      {[[-0.12, B.shellPink, 0.06], [0.02, B.shell, 0.05], [0.22, B.shellPink, 0.045]].map(([z, m, s], i) => (
        <Part key={i} geo={SPH} m={m as typeof B.shell} scale={[s as number, (s as number) * 0.8, (s as number) * 1.1]} p={[0, 0.07, z as number]} rotation-x={i} castShadow={false} />
      ))}
      <group position={[0.03, 0.05, 0.38]} rotation-z={Math.PI / 2 - 0.2}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Part key={i} geo={SPH} m={B.coral} scale={[0.018, 0.06, 0.012]} p={[Math.sin((i / 5) * TAU) * 0.04, Math.cos((i / 5) * TAU) * 0.04, 0]} rotation-z={-(i / 5) * TAU} castShadow={false} />
        ))}
      </group>
      <Candle position={[0, 0.03, -0.12]} holder="jar" height={0.09} radius={0.03} />
      {/* pot de sable */}
      <Part geo={cyl(0.06, 0.06, 0.16, 16)} m={B.glass} p={[0, 0.11, 0.12]} castShadow={false} />
      <Part geo={cyl(0.055, 0.055, 0.08, 16)} m={B.sand} p={[0, 0.07, 0.12]} castShadow={false} />
      {/* une petite succulente */}
      <Part geo={cyl(0.06, 0.05, 0.08, 14)} m={B.turquoise} p={[0, 0.07, 0.6]} />
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <Part key={i} geo={SPH} m={B.leafLight} scale={[0.02, 0.045, 0.02]} p={[Math.cos(i) * 0.03, 0.15, 0.6 + Math.sin(i) * 0.03]} rotation={[Math.sin(i) * 0.5, 0, Math.cos(i) * 0.5]} castShadow={false} />
      ))}
    </group>
  )
}

/** Tenture de macramé au-dessus du lit : une baguette, des cordelettes nouées qui pendent en V, des franges. */
export function Macrame() {
  return (
    <group position={[-2.95, 3.05, -0.3]}>
      <Part geo={cyl(0.022, 0.022, 0.95, 8)} m={B.driftwood} rotation-x={Math.PI / 2} />
      {Array.from({ length: 11 }, (_, i) => {
        const z = -0.4 + i * 0.08, len = 0.75 - Math.abs(z) * 0.9
        return (
          <group key={i}>
            <Part geo={cyl(0.008, 0.008, len, 4)} m={B.rope} p={[0.01, -len / 2, z]} castShadow={false} />
            <Part geo={SPH} m={B.rope} scale={0.018} p={[0.012, -len * 0.4, z]} castShadow={false} />
          </group>
        )
      })}
      <Part geo={SPH} m={B.coral} scale={[0.01, 0.06, 0.06]} p={[0.02, -0.25, 0]} castShadow={false} />
    </group>
  )
}

/** Près de la porte : des tongs, un cabas de paille et sa serviette rayée roulée. */
export function BeachBag() {
  return (
    <>
      {[[1.62, -2.5, 0.2, B.coral], [1.85, -2.4, -0.25, B.coral]].map(([x, z, a, m], i) => (
        <group key={i} position={[x as number, 0.012, z as number]} rotation-y={a as number}>
          <Part geo={SPH} m={m as typeof B.coral} scale={[0.07, 0.012, 0.15]} castShadow={false} />
          <Part m={B.butter} p={[0, 0.015, 0.03]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.045, 0.008, 6, 12, Math.PI]} />
          </Part>
        </group>
      ))}
      <group position={[2.55, 0, -2.25]} rotation-y={-0.4}>
        <Part geo={rbox(0.5, 0.4, 0.22, 0.08)} m={B.rattan} p={[0, 0.2, 0]} />
        <Part m={B.cane} p={[0, 0.42, 0]}>
          <torusGeometry args={[0.15, 0.015, 6, 16, Math.PI]} />
        </Part>
        <Part geo={cyl(0.07, 0.07, 0.42, 16)} m={B.stripeTowel} p={[0.1, 0.42, 0]} rotation-z={0.3} />
      </group>
    </>
  )
}

/** Un filet de pêcheur tendu au mur de gauche, ses flotteurs de verre et quelques étoiles de mer. */
export function FishingNet() {
  const knots = Array.from({ length: 7 * 5 }, (_, i) => [(i % 7) * 0.16 - 0.48, -((i / 7) | 0) * 0.15 - Math.sin(((i % 7) / 6) * Math.PI) * 0.12] as const)
  return (
    <group position={[-2.97, 3.3, 1.55]} rotation-y={Math.PI / 2}>
      <Part geo={cyl(0.02, 0.02, 1.15, 8)} m={B.driftwood} rotation-z={Math.PI / 2} castShadow={false} />
      {knots.map(([x, y], i) => (
        <group key={i}>
          {i % 7 < 6 && <Part geo={cyl(0.004, 0.004, 0.17, 3)} m={B.rope} p={[x + 0.08, y - 0.02, 0.01]} rotation-z={Math.PI / 2 + 0.25 * (i % 2 ? 1 : -1)} castShadow={false} />}
          {i < 28 && <Part geo={cyl(0.004, 0.004, 0.16, 3)} m={B.rope} p={[x, y - 0.08, 0.01]} castShadow={false} />}
        </group>
      ))}
      {[[-0.35, -0.35, B.seaglass], [0.1, -0.5, B.turquoise], [0.4, -0.3, B.seaglass]].map(([x, y, m], i) => (
        <Part key={i} geo={SPH} m={m as typeof B.seaglass} scale={0.07} p={[x as number, y as number, 0.05]} castShadow={false} />
      ))}
      <group position={[-0.1, -0.25, 0.04]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Part key={i} geo={SPH} m={B.coral} scale={[0.02, 0.06, 0.012]} p={[Math.sin((i / 5) * TAU) * 0.04, Math.cos((i / 5) * TAU) * 0.04, 0]} rotation-z={-(i / 5) * TAU} castShadow={false} />
        ))}
      </group>
    </group>
  )
}

/** Dehors, sur la terrasse : un transat rayé face à la mer, et une serviette posée dessus. */
export function DeckChair() {
  return (
    <group position={[1.6, 0, -3.55]} rotation-y={Math.PI + 0.25}>
      {[-0.22, 0.22].map((x) => (
        <group key={x}>
          <Part geo={rbox(0.03, 0.03, 0.9, 0.01)} m={B.wood} p={[x, 0.3, 0]} rotation-x={0.6} castShadow={false} />
          <Part geo={rbox(0.03, 0.03, 0.7, 0.01)} m={B.wood} p={[x, 0.25, 0.05]} rotation-x={-0.7} castShadow={false} />
        </group>
      ))}
      <Part geo={rbox(0.42, 0.01, 0.85, 0.005)} m={B.stripeCoral} p={[0, 0.32, -0.02]} rotation-x={0.6} castShadow={false} />
    </group>
  )
}
