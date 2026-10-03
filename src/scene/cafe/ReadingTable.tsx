import { M } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { K } from './materials'
import { Candle } from './Candle'
import { Steam } from './Steam'

/** Chaise de bistrot en bois courbé, dossier rond. */
export function BistroChair({ position, rotation = 0, seat = M.pink }: { position: [number, number, number]; rotation?: number; seat?: typeof M.pink }) {
  return (
    <group position={position} rotation-y={rotation}>
      {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, z]) => (
        <Part key={`${x}${z}`} geo={cyl(0.02, 0.018, 0.48, 8)} m={K.walnut} p={[x * 1.1, 0.24, z * 1.1]} rotation={[z * 0.25, 0, -x * 0.25]} />
      ))}
      <Part geo={cyl(0.22, 0.22, 0.05, 22)} m={K.walnut} p={[0, 0.49, 0]} />
      <Part geo={cyl(0.19, 0.19, 0.04, 22)} m={seat} p={[0, 0.53, 0]} />
      {[-0.13, 0.13].map((x) => (
        <Part key={x} geo={cyl(0.016, 0.016, 0.46, 8)} m={K.walnut} p={[x, 0.75, -0.19]} />
      ))}
      <Part m={K.walnut} p={[0, 0.98, -0.19]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.13, 0.02, 8, 18, Math.PI]} />
      </Part>
    </group>
  )
}

/**
 * Table de lecture, au milieu : plateau de marbre sur pied de fonte, un livre ouvert, un thé, un scone, une bougie.
 * Quelqu'un vient de se lever : sa chaise est tirée, son pull sur le dossier.
 */
export function ReadingTable() {
  return (
    <group position={[0.55, 0, 0.55]}>
      <Part geo={cyl(0.46, 0.46, 0.05, 32)} m={K.marble} p={[0, 0.78, 0]} />
      <Part geo={cyl(0.48, 0.48, 0.02, 32)} m={K.walnut} p={[0, 0.75, 0]} castShadow={false} />
      <Part geo={cyl(0.04, 0.06, 0.72, 12)} m={K.iron} p={[0, 0.38, 0]} />
      <Part geo={cyl(0.22, 0.26, 0.04, 22)} m={K.iron} p={[0, 0.02, 0]} />
      {/* le livre ouvert, ses deux pages qui se bombent */}
      <group position={[-0.08, 0.81, 0.08]} rotation-y={0.5}>
        <Part geo={rbox(0.42, 0.012, 0.28, 0.005)} m={K.burgundy} castShadow={false} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={SPH} m={M.cream} scale={[0.1, 0.018, 0.13]} p={[s * 0.1, 0.01, 0]} castShadow={false} />
        ))}
      </group>
      {/* le thé, le scone à la confiture */}
      <Part geo={cyl(0.08, 0.075, 0.012, 20)} m={M.cream} p={[0.22, 0.81, -0.12]} castShadow={false} />
      <Part geo={cyl(0.05, 0.04, 0.07, 16)} m={K.teal} p={[0.22, 0.85, -0.12]} />
      <Part m={K.teal} p={[0.275, 0.855, -0.12]} castShadow={false}>
        <torusGeometry args={[0.022, 0.008, 6, 12]} />
      </Part>
      <Steam at={[0.22, 0.9, -0.12]} />
      <Part geo={cyl(0.1, 0.09, 0.012, 22)} m={M.cream} p={[-0.2, 0.81, -0.22]} castShadow={false} />
      <Part geo={SPH} m={K.scone} scale={[0.06, 0.04, 0.06]} p={[-0.2, 0.845, -0.22]} />
      <Part geo={SPH} m={K.berry} scale={[0.035, 0.012, 0.035]} p={[-0.2, 0.882, -0.22]} castShadow={false} />
      <Candle position={[0.12, 0.805, 0.24]} holder="jar" height={0.08} radius={0.035} />
      <BistroChair position={[-0.62, 0, -0.38]} rotation={0.95} seat={M.pink} />
      <group>
        <BistroChair position={[0.72, 0, 0.42]} rotation={-2.3} seat={M.butter} />
        {/* le pull vert laissé sur le dossier */}
        <group position={[0.86, 0.94, 0.56]} rotation-y={-2.3}>
          <Part geo={rbox(0.34, 0.12, 0.08, 0.04)} m={K.jumper} />
          <Part geo={rbox(0.08, 0.3, 0.06, 0.03)} m={K.jumper} p={[-0.13, -0.17, 0.02]} rotation-z={0.15} castShadow={false} />
        </group>
      </group>
    </group>
  )
}
