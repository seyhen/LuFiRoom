import { Part, SPH, cyl, rbox } from '../parts'
import { T } from './materials'

/** Une valise de cuir à sangles et coins de laiton, avec ses étiquettes de voyage. */
function Suitcase({ p, size, m, rot = 0 }: { p: [number, number, number]; size: [number, number, number]; m: typeof T.leather; rot?: number }) {
  const [w, h, d] = size
  return (
    <group position={p} rotation-y={rot}>
      <Part geo={rbox(w, h, d, 0.04)} m={m} />
      {[-w * 0.3, w * 0.3].map((x) => (
        <Part key={x} geo={rbox(0.04, h + 0.01, d + 0.01, 0.01)} m={T.leatherDark} p={[x, 0, 0]} castShadow={false} />
      ))}
      <Part m={T.brass} p={[0, h / 2 + 0.02, 0]} castShadow={false}>
        <torusGeometry args={[0.06, 0.012, 6, 14, Math.PI]} />
      </Part>
      <Part geo={rbox(0.12, 0.08, 0.005, 0.01)} m={T.cream} p={[-w * 0.12, 0.02, d / 2 + 0.003]} rotation-z={0.2} castShadow={false} />
      <Part geo={cyl(0.04, 0.04, 0.005, 16)} m={T.rose} p={[w * 0.12, -0.03, d / 2 + 0.003]} rotation-x={Math.PI / 2} castShadow={false} />
    </group>
  )
}

/** Le filet à bagages de laiton au-dessus de la fenêtre : une grande valise, un vanity bleu canard, une boîte à chapeau rayée. */
export function LuggageRack() {
  return (
    <group position={[0.9, 3.8, -2.82]}>
      {[-0.12, 0.12].map((z) => (
        <Part key={z} geo={cyl(0.018, 0.018, 3.0, 10)} m={T.brass} p={[0, 0, z]} rotation-z={Math.PI / 2} castShadow={false} />
      ))}
      {[-1.4, -0.45, 0.45, 1.4].map((x) => (
        <group key={x}>
          <Part geo={cyl(0.012, 0.012, 0.26, 6)} m={T.brass} p={[x, 0, 0]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.014, 0.014, 0.3, 6)} m={T.brass} p={[x, 0.12, -0.12]} castShadow={false} />
        </group>
      ))}
      <Suitcase p={[-0.6, 0.18, 0]} size={[0.95, 0.32, 0.36]} m={T.leather} />
      <Suitcase p={[0.35, 0.14, 0]} size={[0.5, 0.25, 0.3]} m={T.teal} rot={-0.08} />
      <group position={[1.05, 0.17, 0]}>
        <Part geo={cyl(0.2, 0.2, 0.32, 24)} m={T.cream} />
        <Part geo={cyl(0.205, 0.205, 0.05, 24)} m={T.velvet} p={[0, 0.14, 0]} castShadow={false} />
        <Part m={T.velvet} p={[0, 0.2, 0]} castShadow={false}>
          <torusGeometry args={[0.07, 0.01, 6, 12, Math.PI]} />
        </Part>
      </group>
    </group>
  )
}

/** Un fauteuil club de velours bleu canard, un journal plié sur l'accoudoir, un pouf. */
export function ClubChair() {
  return (
    <>
      <group position={[2.55, 0, -1.75]} rotation-y={-1.15}>
        {[[-0.32, -0.28], [0.32, -0.28], [-0.32, 0.28], [0.32, 0.28]].map(([x, z]) => (
          <Part key={`${x}${z}`} geo={cyl(0.035, 0.025, 0.12, 8)} m={T.mahoganyDark} p={[x, 0.06, z]} />
        ))}
        <Part geo={rbox(0.9, 0.32, 0.82, 0.14)} m={T.teal} p={[0, 0.28, 0]} />
        <Part geo={rbox(0.62, 0.14, 0.64, 0.07)} m={T.teal} p={[0, 0.48, 0.06]} />
        <Part geo={rbox(0.9, 0.62, 0.22, 0.12)} m={T.teal} p={[0, 0.62, -0.32]} rotation-x={-0.08} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={rbox(0.18, 0.44, 0.82, 0.1)} m={T.teal} p={[s * 0.38, 0.48, 0]} />
        ))}
        {[-0.26, -0.09, 0.09, 0.26].map((x) => (
          <Part key={x} geo={SPH} m={T.brass} scale={0.012} p={[x, 0.85, -0.2]} castShadow={false} />
        ))}
        <Part geo={rbox(0.24, 0.02, 0.32, 0.008)} m={T.cream} p={[0.4, 0.71, 0.08]} rotation-y={0.1} castShadow={false} />
        <Part geo={rbox(0.24, 0.03, 0.3, 0.01)} m={T.wool} p={[-0.02, 0.57, 0.12]} rotation-y={0.4} castShadow={false} />
      </group>
      <Part geo={cyl(0.24, 0.26, 0.32, 22)} m={T.velvet} p={[1.65, 0.16, -0.9]} />
      <Part geo={cyl(0.245, 0.245, 0.03, 22)} m={T.gold} p={[1.65, 0.3, -0.9]} castShadow={false} />
    </>
  )
}

/** La valise ouverte sur son porte-bagages pliant : des pulls pliés, un appareil photo, une carte. */
export function OpenSuitcase() {
  return (
    <group position={[0.55, 0, 1.15]} rotation-y={0.35}>
      {[-0.32, 0.32].map((x) => (
        <group key={x}>
          <Part geo={cyl(0.015, 0.015, 0.62, 6)} m={T.mahoganyDark} p={[x, 0.28, 0]} rotation-x={0.45} />
          <Part geo={cyl(0.015, 0.015, 0.62, 6)} m={T.mahoganyDark} p={[x, 0.28, 0]} rotation-x={-0.45} />
        </group>
      ))}
      {[-0.15, 0.15].map((z) => (
        <Part key={z} geo={rbox(0.7, 0.02, 0.04, 0.01)} m={T.velvet} p={[0, 0.55, z]} castShadow={false} />
      ))}
      <group position={[0, 0.57, 0]}>
        <Part geo={rbox(0.8, 0.14, 0.5, 0.04)} m={T.leather} p={[0, 0.07, 0]} />
        <Part geo={rbox(0.74, 0.02, 0.44, 0.02)} m={T.velvetDark} p={[0, 0.13, 0]} castShadow={false} />
        {/* le couvercle grand ouvert, doublé de velours, une poche d'étiquettes */}
        <Part geo={rbox(0.8, 0.5, 0.05, 0.04)} m={T.leather} p={[0, 0.3, -0.38]} rotation-x={-0.55} />
        <Part geo={rbox(0.72, 0.42, 0.02, 0.02)} m={T.velvet} p={[0, 0.31, -0.35]} rotation-x={-0.55} castShadow={false} />
        <Part geo={rbox(0.3, 0.14, 0.02, 0.01)} m={T.velvetDark} p={[-0.12, 0.2, -0.3]} rotation-x={-0.55} castShadow={false} />
        {/* les affaires : un pull moutarde, un pull crème, une écharpe roulée, l'appareil photo */}
        <Part geo={rbox(0.34, 0.09, 0.38, 0.045)} m={T.mustard} p={[-0.18, 0.18, 0.02]} />
        <Part geo={rbox(0.3, 0.08, 0.34, 0.04)} m={T.wool} p={[-0.17, 0.26, 0.03]} rotation-y={0.12} />
        <Part geo={cyl(0.06, 0.06, 0.3, 14)} m={T.blanket} p={[0.2, 0.18, 0.12]} rotation-x={Math.PI / 2} rotation-z={0.3} />
        <group position={[0.2, 0.22, -0.08]}>
          <Part geo={rbox(0.16, 0.09, 0.06, 0.02)} m={T.iron} />
          <Part geo={cyl(0.035, 0.035, 0.05, 14)} m={T.iron} p={[0, 0, 0.05]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.025, 0.025, 0.01, 14)} m={T.glass} p={[0, 0, 0.078]} rotation-x={Math.PI / 2} castShadow={false} />
        </group>
      </group>
    </group>
  )
}

/** Le chariot de thé du wagon-restaurant, oublié là : théière d'argent, tasses, une assiette de biscuits. */
export function TeaTrolley() {
  return (
    <group position={[1.95, 0, 1.55]} rotation-y={0.5}>
      {[0.25, 0.7].map((y) => (
        <Part key={y} geo={rbox(0.8, 0.04, 0.48, 0.02)} m={T.mahogany} p={[0, y, 0]} />
      ))}
      {[[-0.38, -0.22], [0.38, -0.22], [-0.38, 0.22], [0.38, 0.22]].map(([x, z]) => (
        <group key={`${x}${z}`}>
          <Part geo={cyl(0.018, 0.018, 0.82, 8)} m={T.brass} p={[x, 0.45, z]} />
          <Part geo={cyl(0.05, 0.05, 0.03, 12)} m={T.iron} p={[x, 0.05, z]} rotation-z={Math.PI / 2} castShadow={false} />
        </group>
      ))}
      <Part m={T.brass} p={[-0.45, 0.88, 0]} rotation={[0, Math.PI / 2, 0]} castShadow={false}>
        <torusGeometry args={[0.2, 0.015, 6, 16, Math.PI]} />
      </Part>
      <Part geo={rbox(0.82, 0.012, 0.5, 0.006)} m={T.sheet} p={[0, 0.725, 0]} castShadow={false} />
      {/* la théière */}
      <group position={[-0.15, 0.73, 0]}>
        <Part geo={SPH} m={T.brass} scale={[0.12, 0.1, 0.12]} p={[0, 0.1, 0]} />
        <Part geo={SPH} m={T.brass} scale={0.025} p={[0, 0.21, 0]} castShadow={false} />
        <Part geo={cyl(0.012, 0.022, 0.12, 8)} m={T.brass} p={[0.14, 0.12, 0]} rotation-z={-0.8} castShadow={false} />
        <Part m={T.brass} p={[-0.12, 0.11, 0]} castShadow={false}>
          <torusGeometry args={[0.045, 0.01, 6, 12, Math.PI * 1.3]} />
        </Part>
      </group>
      {[[0.18, -0.1], [0.24, 0.12]].map(([x, z], i) => (
        <group key={i} position={[x, 0.73, z]}>
          <Part geo={cyl(0.065, 0.055, 0.01, 18)} m={T.sheet} castShadow={false} />
          <Part geo={cyl(0.045, 0.035, 0.055, 16)} m={T.sheet} p={[0, 0.03, 0]} />
        </group>
      ))}
      <Part geo={cyl(0.12, 0.1, 0.015, 20)} m={T.sheet} p={[0.05, 0.27, 0]} castShadow={false} />
      {[[0.02, 0.03], [0.09, -0.03], [0.04, -0.06]].map(([x, z], i) => (
        <Part key={i} geo={cyl(0.03, 0.03, 0.012, 14)} m={T.croissant} p={[0.05 + x, 0.29, z]} castShadow={false} />
      ))}
    </group>
  )
}

/** Des pantoufles au pied de l'échelle. */
export function Slippers() {
  return (
    <>
      {[[-1.72, -0.95, 0.3], [-1.6, -0.75, 0.1]].map(([x, z, a], i) => (
        <group key={i} position={[x, 0.03, z]} rotation-y={a}>
          <Part geo={SPH} m={T.velvet} scale={[0.07, 0.03, 0.14]} />
          <Part geo={SPH} m={T.wool} scale={[0.065, 0.035, 0.07]} p={[0, 0.02, 0.06]} castShadow={false} />
        </group>
      ))}
    </>
  )
}
