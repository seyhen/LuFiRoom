import { Part, SPH, cyl, noRay, rbox, worldUV } from '../parts'
import { G } from './materials'

const IN = -3.0 // la face intérieure des parois (le fond en z, la gauche en x)
const H = 4.3 // le haut des parois
const KNEE = 0.95 // le soubassement de brique
const BAYS = 6 // un montant tous les 1,09 m

/** Un montant de fonte, sa base moulurée et son chapiteau. */
function Post({ p, h = H }: { p: [number, number, number]; h?: number }) {
  return (
    <group position={p}>
      <Part geo={rbox(0.16, h, 0.16, 0.04)} m={G.iron} p={[0, h / 2, 0]} />
      <Part geo={rbox(0.24, 0.16, 0.24, 0.05)} m={G.ironDark} p={[0, 0.08, 0]} castShadow={false} />
      <Part geo={rbox(0.22, 0.08, 0.22, 0.03)} m={G.brass} p={[0, 0.22, 0]} castShadow={false} />
      <Part geo={rbox(0.24, 0.12, 0.24, 0.04)} m={G.ironDark} p={[0, h - 0.06, 0]} castShadow={false} />
      <Part geo={SPH} m={G.brass} scale={0.07} p={[0, h + 0.08, 0]} castShadow={false} />
    </group>
  )
}

/** Une console de fonte en volute sous la sablière : un quart d'anneau et son enroulement. */
function Bracket({ at, along }: { at: [number, number, number]; along: 'x' | 'z' }) {
  return (
    <group position={at} rotation-y={along === 'x' ? 0 : -Math.PI / 2}>
      <Part m={G.ironDark} rotation-x={0} castShadow={false}>
        <torusGeometry args={[0.32, 0.025, 6, 16, Math.PI / 2]} />
      </Part>
      <Part m={G.brass} p={[0.02, -0.32, 0]} castShadow={false}>
        <torusGeometry args={[0.05, 0.016, 6, 14]} />
      </Part>
    </group>
  )
}

/**
 * La coque de la serre : le socle de pierre et son liseré, le carrelage ancien, les deux soubassements de brique blanchie, les
 * parois vitrées (montants de fonte vert bouteille, deux traverses, petits bois, verre embué qui laisse voir le jardin), la sablière
 * à consoles en volute, les poteaux d'angle.
 */
export function Shell() {
  const bays = Array.from({ length: BAYS + 1 }, (_, i) => -3.0 + i * (6.2 / BAYS))
  return (
    <>
      {/* le socle, son liseré, le sol */}
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={G.base} p={[-0.07, -0.44, -0.07]} />
      <Part geo={rbox(6.92, 0.06, 6.92, 0.025)} m={G.baseTrim} p={[-0.07, -0.2, -0.07]} castShadow={false} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={G.baseTrim} p={[-0.07, -0.12, -0.07]} />
      <mesh material={G.floor} position={[-0.07, 0.003, -0.07]} rotation-x={-Math.PI / 2} receiveShadow raycast={noRay}>
        <planeGeometry args={[6.42, 6.42]} />
      </mesh>
      {/* les soubassements : brique blanchie, chaperon de pierre */}
      <Part geo={worldUV(rbox(6.4, KNEE, 0.24, 0.04), 1.4)} m={G.knee} p={[0.0, KNEE / 2, IN - 0.12]} />
      <Part geo={worldUV(rbox(0.24, KNEE, 6.4, 0.04), 1.4)} m={G.knee} p={[IN - 0.12, KNEE / 2, 0.0]} />
      <Part geo={rbox(6.5, 0.07, 0.34, 0.03)} m={G.baseTrim} p={[0.0, KNEE + 0.02, IN - 0.12]} castShadow={false} />
      <Part geo={rbox(0.34, 0.07, 6.5, 0.03)} m={G.baseTrim} p={[IN - 0.12, KNEE + 0.02, 0.0]} castShadow={false} />
      {/* la sablière, au sommet : une poutre de fonte et sa moulure de laiton */}
      <Part geo={rbox(6.5, 0.18, 0.28, 0.05)} m={G.iron} p={[0.0, H - 0.05, IN - 0.12]} />
      <Part geo={rbox(0.28, 0.18, 6.5, 0.05)} m={G.iron} p={[IN - 0.12, H - 0.05, 0.0]} />
      <Part geo={rbox(6.52, 0.04, 0.32, 0.015)} m={G.brass} p={[0.0, H - 0.17, IN - 0.12]} castShadow={false} />
      <Part geo={rbox(0.32, 0.04, 6.52, 0.015)} m={G.brass} p={[IN - 0.12, H - 0.17, 0.0]} castShadow={false} />
      {/* les montants, les traverses et les petits bois de chaque paroi */}
      {bays.map((v, i) => (
        <group key={i}>
          <Part geo={rbox(0.1, H - KNEE, 0.14, 0.03)} m={G.iron} p={[v, KNEE + (H - KNEE) / 2, IN - 0.02]} castShadow={false} />
          <Part geo={rbox(0.14, H - KNEE, 0.1, 0.03)} m={G.iron} p={[IN - 0.02, KNEE + (H - KNEE) / 2, v]} castShadow={false} />
        </group>
      ))}
      {[2.2, 3.4].map((y) => (
        <group key={y}>
          <Part geo={rbox(6.3, 0.08, 0.12, 0.025)} m={G.iron} p={[0.0, y, IN - 0.02]} castShadow={false} />
          <Part geo={rbox(0.12, 0.08, 6.3, 0.025)} m={G.iron} p={[IN - 0.02, y, 0.0]} castShadow={false} />
        </group>
      ))}
      {/* un petit bois au milieu de chaque travée */}
      {bays.slice(0, -1).map((v, i) => (
        <group key={i}>
          <Part geo={rbox(0.03, H - KNEE - 0.2, 0.05, 0.01)} m={G.iron} p={[v + 0.52, KNEE + (H - KNEE) / 2, IN - 0.02]} castShadow={false} />
          <Part geo={rbox(0.05, H - KNEE - 0.2, 0.03, 0.01)} m={G.iron} p={[IN - 0.02, KNEE + (H - KNEE) / 2, v + 0.52]} castShadow={false} />
        </group>
      ))}
      {/* le verre embué : un plan par paroi, laisse voir le jardin */}
      <mesh material={G.fog} position={[0.1, KNEE + (H - KNEE) / 2, IN + 0.0]} raycast={noRay} renderOrder={3}>
        <planeGeometry args={[6.2, H - KNEE - 0.1]} />
      </mesh>
      <mesh material={G.fog} position={[IN + 0.0, KNEE + (H - KNEE) / 2, 0.1]} rotation-y={Math.PI / 2} raycast={noRay} renderOrder={3}>
        <planeGeometry args={[6.2, H - KNEE - 0.1]} />
      </mesh>
      {/* les poteaux : l'angle du fond, les deux bouts */}
      <Post p={[IN, 0, IN]} />
      <Post p={[3.12, 0, IN]} />
      <Post p={[IN, 0, 3.12]} />
      {/* les consoles en volute sous la sablière */}
      {[-1.7, 0.4, 2.2].map((v) => (
        <group key={v}>
          <Bracket at={[v, H - 0.2, IN + 0.1]} along="x" />
          <Bracket at={[IN + 0.1, H - 0.2, v]} along="z" />
        </group>
      ))}
      {/* le faîtage vu du côté : une arête de laiton le long de la sablière avec un fleuron à chaque bout */}
      {[-3.0, 3.1].map((v) => <Part key={v} geo={cyl(0.03, 0.03, 0.34, 6)} m={G.brass} p={[v, H + 0.2, IN]} castShadow={false} />)}
    </>
  )
}
