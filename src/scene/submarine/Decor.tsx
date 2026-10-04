import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type MeshBasicMaterial, type Sprite } from 'three'
import { TAU, smooth } from '../../math'
import { Part, SPH, cyl, noRay, orient, rbox, type V3 } from '../parts'
import { mood } from '../anim'
import { glowTex } from '../textures'
import { LIVE } from '../Static'
import { S } from './materials'

/** Le tapis rond, au centre de la pièce. */
const RUG = { x: 0.55, z: -0.1, r: 1.75 }

/** Un scaphandre de cuivre sur son piédestal : casque rond, trois hublots, collerette, boulons. */
function Helmet() {
  return (
    <group position={[-2.2, 0, 2.5]} rotation-y={0.8}>
      <Part geo={cyl(0.3, 0.34, 0.1, 28)} m={S.woodDark} p={[0, 0.05, 0]} />
      <Part geo={cyl(0.22, 0.26, 0.55, 24)} m={S.wood} p={[0, 0.37, 0]} />
      <Part geo={cyl(0.28, 0.28, 0.05, 28)} m={S.brass} p={[0, 0.66, 0]} castShadow={false} />
      <group position={[0, 0.98, 0]}>
        <Part geo={cyl(0.27, 0.3, 0.1, 28)} m={S.brass} p={[0, -0.22, 0]} />
        <Part geo={SPH} m={S.copper} scale={0.3} />
        <Part m={S.brass} p={[0, -0.14, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.27, 0.018, 8, 36]} />
        </Part>
        {/* les trois hublots : devant et de chaque côté, avec leur grille */}
        {[0, 0.9, -0.9].map((a, i) => (
          <group key={i} rotation-y={a}>
            <group position={[0, 0.02, 0.27]} scale={i ? 0.7 : 1}>
              <Part m={S.brass} castShadow={false}>
                <torusGeometry args={[0.09, 0.02, 8, 20]} />
              </Part>
              <Part geo={cyl(0.085, 0.085, 0.02, 20)} m={S.glass} p={[0, 0, -0.005]} rotation-x={Math.PI / 2} castShadow={false} />
              <Part geo={SPH} m={S.iron} scale={[0.08, 0.08, 0.02]} p={[0, 0, -0.02]} castShadow={false} />
            </group>
          </group>
        ))}
        <Part geo={cyl(0.03, 0.03, 0.06, 10)} m={S.brass} p={[0, 0.3, 0]} castShadow={false} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * TAU
          return <Part key={i} geo={SPH} m={S.brassDull} scale={0.016} p={[Math.cos(a) * 0.29, -0.2, Math.sin(a) * 0.29]} castShadow={false} />
        })}
      </group>
    </group>
  )
}

/** Une fougère de mer dans un pot de cuivre : des frondes en arc, un peu de sable. */
function Fern({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Part geo={cyl(0.19, 0.15, 0.3, 22)} m={S.copperDark} p={[0, 0.15, 0]} />
      <Part geo={cyl(0.2, 0.2, 0.03, 22)} m={S.brass} p={[0, 0.3, 0]} castShadow={false} />
      <Part geo={cyl(0.17, 0.17, 0.02, 22)} m={S.cream} p={[0, 0.29, 0]} castShadow={false} />
      {Array.from({ length: 9 }, (_, i) => {
        const a = (i / 9) * TAU + 0.3, lean = 0.55 + (i % 3) * 0.28, len = 0.5 + (i % 2) * 0.18 + (i % 3) * 0.08
        const dir: V3 = [Math.cos(a) * lean, 1, Math.sin(a) * lean]
        const mid = Math.hypot(...dir)
        return (
          <Part key={i} geo={SPH} m={S.verdigris} scale={[0.075, len / 2, 0.016]} p={[(dir[0] / mid) * len * 0.5, 0.3 + (dir[1] / mid) * len * 0.5, (dir[2] / mid) * len * 0.5]} rotation={orient(dir, [0, 1, 0])} castShadow={false} />
        )
      })}
    </group>
  )
}

/** Une applique de laiton à cage, avec son ampoule : elle s'allume la nuit. */
function Sconce({ position, rotation = 0 }: { position: V3; rotation?: number }) {
  const glow = useRef<Sprite>(null!), bulb = useRef<MeshBasicMaterial>(null!)
  useFrame(() => {
    const e = smooth(mood.night)
    glow.current.material.opacity = 0.1 + e * 0.7
    bulb.current.color.setRGB(0.55 + e * 0.45, 0.5 + e * 0.38, 0.32 + e * 0.1)
  })
  return (
    <group position={position} rotation-y={rotation} userData={LIVE}>
      <Part geo={rbox(0.14, 0.2, 0.05, 0.02)} m={S.brass} p={[0, 0, 0]} castShadow={false} />
      <Part geo={cyl(0.012, 0.012, 0.16, 6)} m={S.brass} p={[0, 0, 0.1]} rotation-x={Math.PI / 2} castShadow={false} />
      <mesh position={[0, 0.03, 0.2]}>
        <sphereGeometry args={[0.055, 16, 12]} />
        <meshBasicMaterial ref={bulb} color={0xfff0b8} />
      </mesh>
      {[0, 1, 2, 3].map((i) => (
        <Part key={i} geo={cyl(0.005, 0.005, 0.2, 4)} m={S.brass} p={[Math.cos((i / 4) * TAU) * 0.075, 0.03, 0.2 + Math.sin((i / 4) * TAU) * 0.075]} castShadow={false} />
      ))}
      <Part m={S.brass} p={[0, 0.03, 0.2]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.075, 0.008, 6, 18]} />
      </Part>
      <sprite ref={glow} scale={0.9} position={[0, 0.03, 0.24]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0xffd890} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.1} />
      </sprite>
    </group>
  )
}

/**
 * Ce qui habille la pièce autour des objets qui sonnent : le tapis rond à médaillon, un scaphandre de cuivre sur son piédestal,
 * une fougère de mer dans un pot de cuivre, des appliques à cage et une bouée de sauvetage.
 */
export function Decor() {
  return (
    <>
      <Part geo={cyl(RUG.r + 0.03, RUG.r + 0.03, 0.02, 56)} m={S.rugEdge} p={[RUG.x, 0.01, RUG.z]} castShadow={false} />
      <mesh material={S.rug} position={[RUG.x, 0.0215, RUG.z]} rotation-x={-Math.PI / 2} rotation-z={0.4} receiveShadow>
        <circleGeometry args={[RUG.r, 56]} />
      </mesh>
      <Helmet />
      <Fern position={[-2.45, 0, -1.45]} />
      <Sconce position={[-1.05, 2.4, -2.93]} />
      <Sconce position={[-2.93, 3.0, -1.2]} rotation={Math.PI / 2} />
      {/* la bouée de sauvetage, accrochée au mur du fond à droite du hublot, au-dessus de la banquette */}
      <group position={[2.35, 3.55, -2.94]}>
        <Part m={S.red}>
          <torusGeometry args={[0.28, 0.08, 14, 36]} />
        </Part>
        {[0, 1, 2, 3].map((i) => (
          <Part key={i} geo={rbox(0.07, 0.12, 0.17, 0.02)} m={S.cream} p={[Math.cos((i / 4) * TAU) * 0.28, Math.sin((i / 4) * TAU) * 0.28, 0]} rotation-z={(i / 4) * TAU} castShadow={false} />
        ))}
      </group>
    </>
  )
}
