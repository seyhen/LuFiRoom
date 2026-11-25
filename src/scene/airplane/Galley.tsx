import { useMemo } from 'react'
import { PlaneGeometry } from 'three'
import { Steam } from '../objects/Steam'
import { Part, SPH_MID, cyl, noRay, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { A } from './materials'
import { IN } from './layout'

/** Le rideau de l'office : une étoffe qui pend d'un rail, des plis réguliers (l'étoffe avance et recule de 6 cm), plus larges en bas. */
function curtain(w: number, h: number, seed: number) {
  const g = new PlaneGeometry(w, h, 40, 6), p = g.attributes.position, uv = g.attributes.uv
  for (let i = 0; i < p.count; i++) {
    const u = p.getX(i) / w + 0.5, v = p.getY(i) / h + 0.5
    p.setZ(i, Math.sin(u * Math.PI * 2 * 5 + seed) * 0.055 * (0.45 + 0.55 * (1 - v)) + Math.sin(u * 23 + seed) * 0.008)
    uv.setXY(i, u * 3, v)
  }
  g.computeVertexNormals()
  return g
}

/** Un plan peint de la cloison : le côté des toilettes, l'office, l'affiche de la route. Tout est en coordonnées de la cloison (x = -3 + 0,x). */
function Poster() {
  return (
    <group position={[IN + 0.012, 1.95, -1.6]} rotation-y={Math.PI / 2}>
      <Part geo={rbox(0.7, 0.92, 0.03, 0.02)} m={A.frame} castShadow={false} />
      <mesh material={A.poster} position={[0, 0, 0.017]}>
        <planeGeometry args={[0.6, 0.8]} />
      </mesh>
    </group>
  )
}

/** Le poste de l'office : un meuble bas d'aluminium et d'ivoire, son plan de travail en acier, une cafetière, un tas de gobelets, un panier de biscuits, une carafe. */
function Counter() {
  const z0 = -1.62, len = 2.45
  return (
    <Static>
      <group position={[IN + 0.28, 0, z0]}>
        <Part geo={rbox(0.55, 0.92, len, 0.05)} m={A.binPlain} p={[0, 0.54, 0]} />
        <Part geo={rbox(0.6, 0.04, len + 0.05, 0.015)} m={A.cartTop} p={[0.01, 1.02, 0]} castShadow={false} />
        {/* deux portes d'aluminium à poignée creuse (le texte « LUFI AIR · SERVICE » en bas) */}
        {[-0.62, 0.62].map((z) => (
          <mesh key={z} material={A.cartFace} position={[0.285, 0.5, z]} rotation-y={Math.PI / 2} raycast={noRay}>
            <planeGeometry args={[1.12, 0.84]} />
          </mesh>
        ))}
        <Part geo={rbox(0.03, 0.9, 0.04, 0.012)} m={A.aluminium} p={[0.3, 0.5, 0]} castShadow={false} />
        {/* le socle : en retrait de 2,5 cm devant, de 6 cm côté cloison (la plinthe d'aluminium du mur passe là) et de 3 cm à chaque bout, sinon son bout se confond avec celui du meuble */}
        <Part geo={rbox(0.44, 0.1, len - 0.06, 0.02)} m={A.rubber} p={[0.01, 0.05, 0]} castShadow={false} />
        {/* la cafetière : un corps d'acier, sa verseuse de verre, son cadran allumé, la goutte */}
        <group position={[0.0, 1.04, -0.85]}>
          <Part geo={rbox(0.3, 0.42, 0.26, 0.04)} m={A.steel} p={[0, 0.21, 0]} />
          <Part geo={rbox(0.22, 0.04, 0.2, 0.015)} m={A.rubber} p={[0.04, 0.3, 0]} castShadow={false} />
          <Part geo={cyl(0.07, 0.065, 0.13, 16)} m={A.plastic} p={[0.07, 0.085, 0]} castShadow={false} />
          <Part geo={cyl(0.062, 0.058, 0.06, 16)} m={A.tea} p={[0.07, 0.05, 0]} castShadow={false} />
          <Part geo={rbox(0.012, 0.05, 0.1, 0.004)} m={A.button} p={[0.16, 0.34, 0]} castShadow={false} />
        </group>
        {/* les gobelets : trois piles de papier blanc */}
        {[-0.08, 0, 0.08].map((dz, i) => <Part key={i} geo={cyl(0.045, 0.032, 0.18 - i * 0.03, 14)} m={A.napkin} p={[-0.05, 1.04 + (0.18 - i * 0.03) / 2, -0.28 + dz * 2]} />)}
        {/* le panier de biscuits : un osier brun, trois sachets */}
        <Part geo={rbox(0.3, 0.09, 0.22, 0.04)} m={A.bread} p={[0, 1.085, 0.3]} />
        {[[-0.07, 0.02, 0.3, 0.5], [0.04, 0.02, 0.26, -0.3], [0.0, 0.02, 0.35, 0.1]].map(([x, , z, r], i) => (
          <Part key={i} geo={rbox(0.1, 0.016, 0.06, 0.006)} m={i % 2 ? A.sock : A.pillow} p={[x, 1.15, z]} rotation-y={r} castShadow={false} />
        ))}
        {/* la carafe d'eau et son bouchon */}
        <Part geo={cyl(0.065, 0.075, 0.26, 18)} m={A.bottle} p={[0.0, 1.17, 0.78]} castShadow={false} />
        <Part geo={cyl(0.05, 0.05, 0.03, 14)} m={A.button} p={[0.0, 1.32, 0.78]} castShadow={false} />
      </group>
      <Steam at={[IN + 0.35, 1.5, z0 - 0.85]} every={1.4} />
    </Static>
  )
}

/**
 * La cloison arrière, côté gauche : le poste de l'office (en bas, derrière les sièges), l'affiche de la route, le rideau de l'office
 * qui ferme le bout du couloir (un rail, des anneaux, une lueur chaude dans l'entrebâillement), la porte des toilettes avec son voyant.
 */
export function Bulkhead() {
  const c1 = useMemo(() => curtain(0.78, 2.7, 0.5), []), c2 = useMemo(() => curtain(0.5, 2.7, 2.2), [])
  return (
    <>
      <Counter />
      <Poster />
      <Static>
        {/* le rideau : deux pans, un rail, des anneaux ; la lueur de l'office entre les deux */}
        <group position={[IN + 0.12, 1.43, 0.55]} rotation-y={Math.PI / 2}>
          <mesh geometry={c1} material={A.curtain} position={[-0.32, 0, 0]} castShadow receiveShadow />
          <mesh geometry={c2} material={A.curtain} position={[0.42, 0, 0]} castShadow receiveShadow />
        </group>
        <mesh position={[IN + 0.02, 1.43, 0.55 - 0.02]} rotation-y={Math.PI / 2} raycast={noRay}>
          <planeGeometry args={[0.16, 2.7]} />
          <meshBasicMaterial color={0xffe6b8} />
        </mesh>
        <Part geo={cyl(0.014, 0.014, 1.5, 8)} m={A.aluminium} p={[IN + 0.12, 2.82, 0.55]} rotation-x={Math.PI / 2} castShadow={false} />
        {[-0.65, -0.45, -0.25, -0.05, 0.1, 0.3, 0.5, 0.65].map((dz) => <Part key={dz} m={A.aluminium} p={[IN + 0.12, 2.8, 0.55 + dz]} rotation-y={Math.PI / 2} castShadow={false}><torusGeometry args={[0.03, 0.006, 5, 12]} /></Part>)}
        <Part geo={rbox(0.05, 0.05, 1.6, 0.015)} m={A.aluminium} p={[IN + 0.1, 2.88, 0.55]} castShadow={false} />
        {/* la porte des toilettes : un vantail ivoire, son pictogramme, la poignée creuse, le voyant « libre » au-dessus */}
        <Part geo={rbox(0.06, 2.3, 1.0, 0.03)} m={A.binPlain} p={[IN + 0.03, 1.2, 2.2]} />
        <mesh material={A.lavDoor} position={[IN + 0.065, 1.52, 2.2]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[0.92, 1.38]} />
        </mesh>
        <mesh material={A.vacant} position={[IN + 0.065, 2.52, 2.2]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[0.22, 0.22]} />
        </mesh>
        <Part geo={rbox(0.03, 0.06, 0.3, 0.012)} m={A.aluminium} p={[IN + 0.09, 1.0, 1.9]} castShadow={false} />
      </Static>
    </>
  )
}

/** Une pile de plateaux repas sur le chariot, un petit bac (voir `Trolley`). */
const TOP_Y = 1.0

/**
 * Le chariot de service, garé dans l'allée contre la cloison : un corps d'aluminium brossé à porte rainurée, une poignée en U, quatre roulettes,
 * et dessus deux verseuses d'acier, une pile de gobelets, un panier de sachets, une boîte de thés. La face qui regarde la caméra est celle de la porte.
 * `position` : le sol sous le centre du chariot.
 */
export function Trolley({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Static>
        <Part geo={rbox(1.0, 0.86, 0.42, 0.04)} m={A.cartTop} p={[0, 0.54, 0]} />
        <mesh material={A.cartFace} position={[0, 0.54, 0.222]}>
          <planeGeometry args={[0.92, 0.46]} />
        </mesh>
        <Part geo={rbox(1.04, 0.047, 0.46, 0.015)} m={A.steel} p={[0, TOP_Y - 0.0065, 0]} />
        {/* les roulettes, une pédale de frein rouge */}
        {[[-0.4, 0.16], [0.4, 0.16], [-0.4, -0.16], [0.4, -0.16]].map(([x, z], i) => <Part key={i} geo={cyl(0.06, 0.06, 0.04, 14)} m={A.rubber} p={[x, 0.06, z]} rotation-x={Math.PI / 2} />)}
        <Part geo={rbox(0.1, 0.014, 0.05, 0.005)} m={A.tomato} p={[0.4, 0.14, 0.22]} castShadow={false} />
        {/* la poignée en U au bout côté cloison */}
        {[-0.14, 0.14].map((z) => <Part key={z} geo={cyl(0.014, 0.014, 0.34, 8)} m={A.aluminium} p={[-0.54, 1.12, z]} castShadow={false} />)}
        <Part geo={cyl(0.016, 0.016, 0.28, 8)} m={A.aluminium} p={[-0.54, 1.29, 0]} rotation-x={Math.PI / 2} castShadow={false} />
        {/* dessus : deux verseuses, des gobelets, un panier, une boîte de thé */}
        {[-0.36, -0.12].map((x, i) => (
          <group key={x} position={[x, TOP_Y + 0.0175, -0.04 + i * 0.03]}>
            {/* une verseuse d'acier : le corps, l'épaule, le couvercle et son bouton, le bec, l'anse, un bandeau de couleur (café rouge, thé vert) */}
            <Part geo={cyl(0.07, 0.065, 0.25, 18)} m={A.steel} p={[0, 0.125, 0]} />
            <Part geo={cyl(0.0715, 0.0715, 0.035, 18)} m={i ? A.pillow : A.tomato} p={[0, 0.1, 0]} castShadow={false} />
            <Part geo={SPH_MID} m={A.steel} scale={[0.068, 0.034, 0.068]} p={[0, 0.25, 0]} castShadow={false} />
            <Part geo={cyl(0.04, 0.05, 0.03, 16)} m={A.rubber} p={[0, 0.292, 0]} castShadow={false} />
            <Part geo={SPH_MID} m={A.rubber} scale={0.016} p={[0, 0.318, 0]} castShadow={false} />
            <Part geo={cyl(0.012, 0.02, 0.07, 8)} m={A.steel} p={[0.085, 0.235, 0]} rotation-z={-0.9} castShadow={false} />
            <Part m={A.rubber} p={[-0.066, 0.15, 0]} rotation-z={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.055, 0.011, 6, 14, Math.PI]} />
            </Part>
          </group>
        ))}
        <Part geo={cyl(0.045, 0.032, 0.2, 14)} m={A.napkin} p={[0.12, TOP_Y + 0.1175, -0.1]} castShadow={false} />
        <Part geo={rbox(0.26, 0.08, 0.2, 0.035)} m={A.bread} p={[0.32, TOP_Y + 0.0575, 0.0]} />
        {[[0.26, 0.04], [0.37, -0.02], [0.32, 0.0]].map(([x, z], i) => <Part key={i} geo={rbox(0.09, 0.016, 0.055, 0.006)} m={i % 2 ? A.sock : A.pillow} p={[x, TOP_Y + 0.1, z]} rotation-y={i * 0.7} castShadow={false} />)}
        <Part geo={rbox(0.14, 0.07, 0.1, 0.012)} m={A.shade} p={[-0.02, TOP_Y + 0.0525, 0.12]} rotation-y={0.2} castShadow={false} />
        <Part geo={SPH_MID} m={A.tea} scale={0.01} p={[-0.02, TOP_Y + 0.0525 + 0.04, 0.12]} castShadow={false} />
      </Static>
      <Steam at={[-0.36, TOP_Y + 0.4, -0.04]} every={1.6} />
    </group>
  )
}

