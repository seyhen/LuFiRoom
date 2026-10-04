import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, SphereGeometry, type Group, type PointLight, type Sprite } from 'three'
import { TAU, smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { mood, useSquash } from '../anim'
import { glowTex } from '../textures'
import { L } from './materials'

/** La table à cartes : son centre au sol, contre le mur du fond, et la hauteur du plateau. */
export const TABLE = { x: -0.5, z: -2.48, top: 1.0 }
const dome = new SphereGeometry(0.1, 20, 10, 0, TAU, 0, Math.PI / 2)

/** La lampe à huile de laiton sur la table : verre fumé, mèche, halo. Bascule jour / nuit et éclaire la table la nuit. */
function OilLamp() {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!)
  useSquash('lamp', g)
  useFrame(({ clock }) => {
    const e = smooth(mood.night), f = 1 + Math.sin(clock.elapsedTime * 7) * 0.025
    light.current.intensity = e * 1.9 * f * Math.PI // × π : voir materials.ts
    L.glassWarm.emissiveIntensity = 0.08 + e * 1.1
    glow.current.material.opacity = e * 0.8
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={[0.12, TABLE.top + 0.035, TABLE.z + 0.02]}>
      <Part geo={cyl(0.12, 0.14, 0.05, 20)} m={L.brass} p={[0, 0.025, 0]} />
      <Part geo={SPH} m={L.brass} scale={[0.1, 0.09, 0.1]} p={[0, 0.12, 0]} />
      <Part geo={cyl(0.05, 0.05, 0.06, 14)} m={L.brassDull} p={[0, 0.22, 0]} castShadow={false} />
      <Part geo={cyl(0.075, 0.06, 0.26, 18)} m={L.glassWarm} p={[0, 0.38, 0]} castShadow={false} />
      <Part geo={dome} m={L.glassWarm} p={[0, 0.51, 0]} scale={[0.75, 0.9, 0.75]} castShadow={false} />
      <Part geo={cyl(0.012, 0.012, 0.12, 6)} m={L.brassDull} p={[0.1, 0.12, 0]} rotation-z={-0.5} castShadow={false} />
      <Part m={L.brass} p={[0.17, 0.2, 0]} castShadow={false}>
        <torusGeometry args={[0.04, 0.008, 6, 12]} />
      </Part>
      <pointLight ref={light} color={0xffc27a} intensity={0} distance={7} decay={1.5} position={[0, 0.4, 0.2]} />
      <sprite ref={glow} scale={1.8} position={[0, 0.4, 0]} raycast={noRay}>
        <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}

/**
 * La table à cartes du gardien, sous le baromètre : le plateau de chêne, une carte marine dépliée et ses instruments (compas à
 * pointes sèches, loupe, boussole de laiton), les livres de bord, un navire dans sa bouteille, la lampe à huile, un tabouret.
 */
export function ChartTable() {
  const { x, z, top } = TABLE
  return (
    <>
      <Part geo={rbox(1.7, 0.07, 0.92, 0.025)} m={L.oak} p={[x, top - 0.035, z]} />
      {[[-0.76, -0.38], [0.76, -0.38], [-0.76, 0.38], [0.76, 0.38]].map(([dx, dz]) => (
        <Part key={`${dx}${dz}`} geo={cyl(0.04, 0.03, top - 0.07, 10)} m={L.oakDark} p={[x + dx, (top - 0.07) / 2, z + dz]} />
      ))}
      <Part geo={rbox(1.5, 0.05, 0.05, 0.015)} m={L.oakDark} p={[x, 0.3, z + 0.38]} castShadow={false} />
      {/* le tiroir, avec son bouton de laiton */}
      <Part geo={rbox(0.6, 0.14, 0.04, 0.015)} m={L.oakPale} p={[x - 0.2, top - 0.16, z + 0.45]} />
      <Part geo={SPH} m={L.brass} scale={0.028} p={[x - 0.2, top - 0.16, z + 0.48]} castShadow={false} />
      {/* la carte, ses coins relevés par un livre de bord et un presse-papier de laiton */}
      <Part geo={rbox(0.98, 0.012, 0.66, 0.006)} m={L.chart} p={[x - 0.1, top + 0.006, z - 0.02]} rotation-y={0.05} castShadow={false} />
      <Part geo={cyl(0.04, 0.045, 0.05, 12)} m={L.brass} p={[x + 0.32, top + 0.035, z + 0.24]} castShadow={false} />
      {/* le compas à pointes sèches : deux branches, une charnière */}
      <group position={[x - 0.2, top + 0.018, z + 0.1]} rotation-y={0.5}>
        <Part geo={cyl(0.007, 0.004, 0.26, 6)} m={L.brassDull} p={[-0.045, 0, 0]} rotation-z={Math.PI / 2 - 0.16} castShadow={false} />
        <Part geo={cyl(0.007, 0.004, 0.26, 6)} m={L.brassDull} p={[0.045, 0, 0]} rotation-z={Math.PI / 2 + 0.16} castShadow={false} />
        <Part geo={SPH} m={L.brass} scale={0.016} p={[-0.17, 0, 0]} castShadow={false} />
      </group>
      {/* la boussole de laiton, à couvercle de verre */}
      <group position={[x + 0.3, top + 0.03, z - 0.14]}>
        <Part geo={cyl(0.1, 0.1, 0.05, 24)} m={L.brass} />
        <Part geo={cyl(0.082, 0.082, 0.012, 24)} m={L.paper} p={[0, 0.027, 0]} castShadow={false} />
        <Part geo={rbox(0.008, 0.004, 0.13, 0.002)} m={L.red} p={[0, 0.036, 0]} rotation-y={0.7} castShadow={false} />
        <Part geo={cyl(0.085, 0.085, 0.006, 24)} m={L.glass} p={[0, 0.045, 0]} castShadow={false} />
      </group>
      {/* la loupe : un anneau de laiton et son manche */}
      <group position={[x - 0.42, top + 0.014, z - 0.18]} rotation-y={-0.5}>
        <Part m={L.brass} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.06, 0.008, 8, 20]} />
        </Part>
        <Part geo={cyl(0.01, 0.01, 0.12, 6)} m={L.oakDark} p={[0.12, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      </group>
      {/* les livres de bord */}
      {[[0.36, 0.045, L.navy], [0.32, 0.04, L.red], [0.34, 0.04, L.leather]].map(([w, h, m], i) => (
        <Part key={i} geo={rbox(w as number, h as number, 0.24, 0.012)} m={m as typeof L.navy} p={[x - 0.66, top + 0.022 + i * 0.043, z - 0.2]} rotation-y={i * 0.2 - 0.1} />
      ))}
      {/* un navire dans sa bouteille, couché sur son berceau */}
      <group position={[x + 0.62, top + 0.02, z - 0.16]} rotation-y={0.4}>
        <Part geo={rbox(0.24, 0.05, 0.08, 0.015)} m={L.oakDark} p={[0, 0.025, 0]} castShadow={false} />
        <Part geo={cyl(0.07, 0.07, 0.3, 16)} m={L.glass} p={[0, 0.11, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.022, 0.03, 0.08, 10)} m={L.glass} p={[0.19, 0.11, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.026, 0.026, 0.03, 10)} m={L.oakPale} p={[0.25, 0.11, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={rbox(0.12, 0.025, 0.04, 0.01)} m={L.navy} p={[-0.02, 0.07, 0]} castShadow={false} />
        <Part geo={cyl(0.004, 0.004, 0.09, 4)} m={L.oakDark} p={[-0.04, 0.12, 0]} castShadow={false} />
        <Part geo={rbox(0.005, 0.07, 0.05, 0.002)} m={L.cream} p={[-0.04, 0.125, 0]} castShadow={false} />
        <Part geo={rbox(0.005, 0.05, 0.04, 0.002)} m={L.cream} p={[0.02, 0.115, 0]} castShadow={false} />
      </group>
      <OilLamp />
      {/* un mug d'émail et le tabouret rond */}
      <group position={[x + 0.55, top, z + 0.22]}>
        <Part geo={cyl(0.05, 0.045, 0.1, 14)} m={L.mugBlue} p={[0, 0.05, 0]} />
        <Part m={L.mugBlue} p={[0.058, 0.055, 0]} castShadow={false}>
          <torusGeometry args={[0.03, 0.009, 6, 12, Math.PI * 1.2]} />
        </Part>
      </group>
      <group position={[x + 0.05, 0, z + 1.1]}>
        <Part geo={cyl(0.2, 0.2, 0.06, 22)} m={L.oakPale} p={[0, 0.5, 0]} />
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * TAU + 0.4
          return <Part key={i} geo={cyl(0.025, 0.02, 0.5, 8)} m={L.oakDark} p={[Math.cos(a) * 0.14, 0.25, Math.sin(a) * 0.14]} rotation={[-Math.sin(a) * 0.12, 0, Math.cos(a) * 0.12]} />
        })}
      </group>
    </>
  )
}
