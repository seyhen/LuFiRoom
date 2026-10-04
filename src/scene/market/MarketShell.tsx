import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import { Part, SPH, WIN, backWall, cyl, rbox, worldUV, type V3 } from '../parts'
import { holedWall } from '../walls'
import { DOOR } from './Izakaya'
import { K } from './materials'

const cables = new Map<string, TubeGeometry>()
/** Un câble qui pend entre des points (tube fin, courbe douce). */
function Cable({ pts, r = 0.012, m = K.iron }: { pts: V3[]; r?: number; m?: typeof K.iron }) {
  const key = JSON.stringify(pts) + r
  let g = cables.get(key)
  if (!g) cables.set(key, (g = new TubeGeometry(new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), 24, r, 5)))
  return <Part geo={g} m={m} castShadow={false} />
}

/** Un climatiseur de façade : caisson, grille de ventilateur, bavette qui goutte, deux consoles. */
function AirCon({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Part geo={rbox(0.78, 0.52, 0.42, 0.08)} m={K.steel} />
      <Part geo={cyl(0.19, 0.19, 0.03, 24)} m={K.steelDark} p={[-0.1, 0, 0.215]} rotation-x={Math.PI / 2} castShadow={false} />
      {[0, 1, 2, 3, 4].map((i) => (
        <Part key={i} geo={rbox(0.34, 0.012, 0.014, 0.004)} m={K.iron} p={[-0.1, -0.12 + i * 0.06, 0.235]} castShadow={false} />
      ))}
      <Part geo={rbox(0.12, 0.3, 0.02, 0.006)} m={K.steelDark} p={[0.28, 0, 0.22]} castShadow={false} />
      <Part geo={rbox(0.82, 0.04, 0.5, 0.015)} m={K.rust} p={[0, -0.28, 0.02]} castShadow={false} />
      <Part geo={cyl(0.012, 0.012, 0.35, 6)} m={K.iron} p={[0.3, -0.45, 0.1]} castShadow={false} />
      {[-0.28, 0.28].map((x) => (
        <Part key={x} geo={rbox(0.04, 0.04, 0.3, 0.012)} m={K.iron} p={[x, -0.3, -0.12]} castShadow={false} />
      ))}
    </group>
  )
}

/**
 * La ruelle : un socle de béton sale, des pavés luisants de pluie, une façade de brique fumée percée d'une grande baie sur le
 * boulevard (cadre d'acier et petit store rayé), un rideau de fer ondulé à gauche, des climatiseurs, des tuyaux, des câbles qui
 * pendent, des affiches décollées.
 */
export function MarketShell() {
  return (
    <>
      {/* le socle : béton, deux assises, des tuyaux d'évacuation qui sortent du flanc */}
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={K.plaster} p={[-0.07, -0.37, -0.07]} />
      <Part geo={rbox(6.6, 0.3, 6.6, 0.1)} m={K.iron} p={[-0.07, -0.78, -0.07]} />
      <Part geo={rbox(6.9, 0.05, 6.9, 0.02)} m={K.rust} p={[-0.07, -0.1, -0.07]} castShadow={false} />
      <Part geo={cyl(0.1, 0.1, 0.5, 14)} m={K.steelDark} p={[3.5, -0.5, 1.4]} rotation-z={Math.PI / 2} />
      <Part geo={cyl(0.13, 0.13, 0.06, 14)} m={K.rust} p={[3.28, -0.5, 1.4]} rotation-z={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.08, 0.08, 0.4, 14)} m={K.steelDark} p={[-1.2, -0.52, 3.6]} rotation-x={Math.PI / 2} />
      {/* le pavé */}
      <Part geo={worldUV(rbox(6.44, 0.1, 6.44, 0.03), 1.4)} m={K.paving} p={[-0.07, -0.05, -0.07]} />
      {/* façade du fond (brique, baie) et mur de gauche (rideau de fer) */}
      <Part geo={worldUV(backWall, 1.2)} m={K.brick} p={[0, 0, -3.26]} />
      <Part geo={worldUV(holedWall([{ x0: -DOOR.z1, x1: -DOOR.z0, y0: 0, y1: DOOR.top, r: 0.1 }]), 1.6)} m={K.yakisugi} p={[-3.26, 0, 0]} rotation-y={Math.PI / 2} />
      {/* soubassement de pierre sombre sous la brique, plinthe */}
      <Part geo={worldUV(rbox(6.4, 0.5, 0.07, 0.025), 1)} m={K.iron} p={[-0.07, 0.25, -2.97]} castShadow={false} />
      <Part geo={worldUV(rbox(0.07, 0.5, 6.4, 0.025), 1)} m={K.iron} p={[-2.97, 0.25, -0.07]} castShadow={false} />
      {/* le cadre de la baie : acier sombre, meneaux en croix, appui de fenêtre */}
      <group position={[(WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, -3.08]}>
        {[WIN.y0 - 0.02, WIN.y1 + 0.02].map((y, i) => (
          <Part key={i} geo={rbox(WIN.x1 - WIN.x0 + 0.16, 0.1, 0.1, 0.03)} m={K.steelDark} p={[0, y - (WIN.y0 + WIN.y1) / 2, 0]} />
        ))}
        {[WIN.x0 - 0.02, WIN.x1 + 0.02].map((x, i) => (
          <Part key={i} geo={rbox(0.1, WIN.y1 - WIN.y0 + 0.16, 0.1, 0.03)} m={K.steelDark} p={[x - (WIN.x0 + WIN.x1) / 2, 0, 0]} />
        ))}
        <Part geo={rbox(0.06, WIN.y1 - WIN.y0, 0.06, 0.02)} m={K.steelDark} castShadow={false} />
        <Part geo={rbox(WIN.x1 - WIN.x0, 0.06, 0.06, 0.02)} m={K.steelDark} p={[0, 0.3, 0]} castShadow={false} />
        <mesh material={K.glass} position={[0, 0, 0.005]}>
          <planeGeometry args={[WIN.x1 - WIN.x0, WIN.y1 - WIN.y0]} />
        </mesh>
      </group>
      <Part geo={rbox(2.9, 0.08, 0.32, 0.03)} m={K.woodDark} p={[(WIN.x0 + WIN.x1) / 2, WIN.y0 - 0.11, -2.9]} />
      {/* le petit store rayé au-dessus de la baie, incliné, avec sa bande festonnée */}
      <group position={[(WIN.x0 + WIN.x1) / 2, WIN.y1 + 0.2, -2.98]} rotation-x={0.5}>
        <Part geo={worldUV(rbox(2.9, 0.04, 0.55, 0.015), 1)} m={K.stripe} p={[0, 0, 0.27]} castShadow={false} />
        {Array.from({ length: 12 }, (_, i) => (
          <Part key={i} geo={SPH} m={i % 2 ? K.cream : K.indigo} scale={[0.12, 0.04, 0.05]} p={[-1.32 + i * 0.24, 0, 0.55]} castShadow={false} />
        ))}
        {[-1.4, 1.4].map((x) => (
          <Part key={x} geo={rbox(0.04, 0.04, 0.6, 0.012)} m={K.iron} p={[x, -0.02, 0.28]} castShadow={false} />
        ))}
      </group>
      <AirCon position={[-1.95, 3.7, -2.78]} />
      <AirCon position={[-0.55, 3.85, -2.78]} />
      {/* une descente d'eau et son collier, un tuyau de gaz rouillé qui court le long du mur de gauche */}
      <Part geo={cyl(0.06, 0.06, 4.2, 12)} m={K.steelDark} p={[2.88, 2.15, -2.88]} />
      {[0.7, 1.9, 3.1].map((y) => (
        <Part key={y} geo={cyl(0.08, 0.08, 0.05, 12)} m={K.iron} p={[2.88, y, -2.88]} castShadow={false} />
      ))}
      <Part geo={cyl(0.05, 0.05, 2.5, 12)} m={K.rust} p={[-2.86, 0.62, -1.75]} rotation-x={Math.PI / 2} />
      {[-2.7, -1.7, -0.7].map((z) => (
        <Part key={z} geo={cyl(0.07, 0.07, 0.05, 12)} m={K.iron} p={[-2.86, 0.62, z]} rotation-x={Math.PI / 2} castShadow={false} />
      ))}
      {/* un compteur électrique, une boîte de dérivation et leurs câbles qui pendent */}
      <Part geo={rbox(0.5, 0.62, 0.14, 0.04)} m={K.steelDark} p={[-2.55, 2.0, -2.9]} />
      <Part geo={rbox(0.34, 0.34, 0.03, 0.012)} m={K.cream} p={[-2.55, 2.06, -2.81]} castShadow={false} />
      <Part geo={cyl(0.1, 0.1, 0.02, 16)} m={K.glass} p={[-2.55, 2.06, -2.78]} rotation-x={Math.PI / 2} castShadow={false} />
      <Cable pts={[[-2.55, 1.68, -2.88], [-2.55, 1.2, -2.86], [-2.3, 0.9, -2.84], [-1.9, 0.7, -2.86]]} r={0.016} />
      <Cable pts={[[-2.7, 2.3, -2.88], [-2.5, 2.8, -2.86], [-2.2, 3.15, -2.82], [-1.95, 3.2, -2.78]]} />
      <Cable pts={[[-1.55, 3.4, -2.8], [-1.2, 3.1, -2.88], [-0.9, 2.9, -2.9], [-0.6, 3.2, -2.9], [-0.2, 3.5, -2.9]]} r={0.01} />
      <Cable pts={[[-0.2, 3.95, -2.88], [0.6, 4.15, -2.86], [1.8, 4.2, -2.86], [2.6, 3.9, -2.86], [2.9, 3.5, -2.88]]} r={0.009} />
      {/* les affiches de cinéma collées sur la brique, une qui se décolle */}
      {([[1.55, 1.5, 0.04, 0], [2.15, 1.45, -0.05, 1], [2.68, 1.3, 0.03, 2]] as const).map(([x, y, rz, i]) => (
        <group key={i} position={[x, y, -2.95]} rotation-z={rz}>
          <mesh material={K.posters[i]} position={[0, 0, 0.004]}>
            <planeGeometry args={[0.48, 0.72]} />
          </mesh>
        </group>
      ))}
      {/* le haut du mur : une corniche de tôle, un bord de toit */}
      <Part geo={rbox(6.44, 0.12, 0.16, 0.04)} m={K.steelDark} p={[-0.07, 4.25, -2.93]} castShadow={false} />
      <Part geo={rbox(0.16, 0.12, 6.44, 0.04)} m={K.steelDark} p={[-2.93, 4.25, -0.07]} castShadow={false} />
    </>
  )
}
