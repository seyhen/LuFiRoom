import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, LatheGeometry, Vector2, type Group, type PointLight, type Sprite } from 'three'
import { smooth } from '../../math'
import { mood, useSquash } from '../anim'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { glowTex } from '../textures'
import { L } from './materials'
import { magazineTex } from './textures'
import { MeshStandardMaterial } from 'three'

const TOP = 0.95
// l'abat-jour plissé : un tronc de cône à seize plis, ouvert en haut et en bas
const SHADE = new LatheGeometry([[0.13, 0], [0.128, 0.02], [0.09, 0.17], [0.088, 0.18]].map(([r, y]) => new Vector2(r, y)), 32)
{
  const p = SHADE.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), a = Math.atan2(z, x), k = 1 + Math.cos(a * 16) * 0.035
    p.setXYZ(i, x * k, p.getY(i), z * k)
  }
  SHADE.computeVertexNormals()
}
const MAG = new MeshStandardMaterial({ map: magazineTex('#e46f9b', '#f6d77a', 'MAISON', 3), roughness: 0.6 })

/**
 * La lampe du comptoir : un pied de céramique menthe, une tige de laiton, l'abat-jour plissé crème, l'ampoule. C'est l'objet du
 * jour / nuit ; le soir elle fait la seule lumière chaude de la laverie, son halo sur le comptoir.
 */
function Lamp({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!)
  useSquash('lamp', g)
  useFrame(() => {
    const e = smooth(mood.night)
    light.current.intensity = (0.12 + e * 1.35) * Math.PI
    glow.current.material.opacity = 0.08 + e * 0.55
    L.shade.emissiveIntensity = 0.12 + e * 0.75
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={position}>
      <Static>
        <Part geo={cyl(0.08, 0.09, 0.025, 24)} m={L.lampBase} p={[0, 0.0125, 0]} />
        <Part geo={SPH} m={L.lampBase} scale={[0.07, 0.09, 0.07]} p={[0, 0.11, 0]} />
        <Part geo={cyl(0.012, 0.012, 0.16, 10)} m={L.brass} p={[0, 0.26, 0]} castShadow={false} />
        <Part geo={cyl(0.022, 0.022, 0.03, 12)} m={L.brass} p={[0, 0.33, 0]} castShadow={false} />
        <Part geo={SHADE} m={L.shade} p={[0, 0.27, 0]} />
        {/* l'interrupteur à tirette, sous l'abat-jour */}
        <Part geo={cyl(0.003, 0.003, 0.08, 6)} m={L.brass} p={[0.05, 0.25, 0.03]} castShadow={false} />
        <Part geo={SPH} m={L.brass} scale={0.012} p={[0.05, 0.205, 0.03]} castShadow={false} />
      </Static>
      <mesh geometry={SPH} material={L.bulb} scale={[0.04, 0.05, 0.04]} position={[0, 0.36, 0]} raycast={noRay} />
      <pointLight ref={light} color={0xffb466} intensity={0} distance={6.5} decay={1.4} position={[0, 0.4, 0]} />
      <sprite ref={glow} scale={1.3} position={[0, 0.36, 0.05]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0xffc070} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}

/**
 * Le petit comptoir du dépôt-pressing, au coin de devant : un meuble peint menthe, son plateau de bois, la plaque « PRESSING ·
 * DÉPÔT », la plinthe. Dessus : la lampe (jour / nuit), la sonnette chromée, la pique à tickets, le carnet ouvert et son stylo, un
 * magazine corné ; derrière, un tabouret haut.
 */
export function Counter({ position }: { position: V3 }) {
  const [x, y, z] = position
  return (
    <>
      <group position={position}>
        {/* le meuble, ses panneaux en relief, son plateau de bois, la plinthe */}
        <Part geo={rbox(0.55, TOP - 0.04, 1.2, 0.04)} m={L.mintPaint} p={[0, (TOP - 0.04) / 2, 0]} />
        {[-0.3, 0.3].map((dz) => (
          <Part key={dz} geo={rbox(0.02, 0.5, 0.5, 0.015)} m={L.mintPaint} p={[0.285, 0.42, dz]} castShadow={false} />
        ))}
        <Part geo={rbox(0.62, 0.04, 1.28, 0.018)} m={L.wood} p={[0.02, TOP - 0.02, 0]} />
        <Part geo={rbox(0.57, 0.06, 1.18, 0.02)} m={L.woodDark} p={[0.0, 0.03, 0]} castShadow={false} />
        <mesh material={L.counterSign} position={[0.302, 0.78, 0]} rotation-y={Math.PI / 2} raycast={noRay}>
          <planeGeometry args={[0.6, 0.15]} />
        </mesh>
        {/* la sonnette : son socle, son dôme chromé, son bouton */}
        <group position={[0.12, TOP, 0.42]}>
          <Part geo={cyl(0.055, 0.06, 0.02, 20)} m={L.woodDark} p={[0, 0.01, 0]} castShadow={false} />
          <Part geo={SPH} m={L.chrome} scale={[0.045, 0.035, 0.045]} p={[0, 0.02, 0]} castShadow={false} />
          <Part geo={cyl(0.006, 0.006, 0.02, 8)} m={L.chrome} p={[0, 0.06, 0]} castShadow={false} />
          <Part geo={SPH} m={L.rubber} scale={0.012} p={[0, 0.072, 0]} castShadow={false} />
        </group>
        {/* la pique à tickets et ses tickets */}
        <group position={[-0.12, TOP, 0.45]}>
          <Part geo={cyl(0.035, 0.04, 0.015, 14)} m={L.steelDark} p={[0, 0.008, 0]} castShadow={false} />
          <Part geo={cyl(0.004, 0.004, 0.16, 6)} m={L.chrome} p={[0, 0.09, 0]} castShadow={false} />
          {[0.03, 0.05, 0.07].map((ty, i) => (
            <Part key={ty} geo={rbox(0.07, 0.003, 0.1, 0.0015)} m={L.paper} p={[0, ty, 0]} rotation-y={i * 0.5} castShadow={false} />
          ))}
        </group>
        {/* le carnet de dépôt ouvert, son stylo */}
        <group position={[0.06, TOP, 0.0]} rotation-y={0.15}>
          <Part geo={rbox(0.24, 0.016, 0.34, 0.006)} m={L.capBlue} p={[0, 0.008, 0]} castShadow={false} />
          <Part geo={rbox(0.22, 0.012, 0.155, 0.004)} m={L.paper} p={[0, 0.02, 0.08]} castShadow={false} />
          <Part geo={rbox(0.22, 0.012, 0.155, 0.004)} m={L.paper} p={[0, 0.02, -0.08]} castShadow={false} />
          {[0, 1, 2, 3].map((k) => (
            <Part key={k} geo={rbox(0.14, 0.002, 0.006, 0.001)} m={L.ink} p={[0.0, 0.0275, 0.03 + k * 0.03]} castShadow={false} />
          ))}
          <Part geo={cyl(0.007, 0.007, 0.15, 8)} m={L.coral} p={[0.03, 0.033, -0.08]} rotation={[0, 0.6, Math.PI / 2]} castShadow={false} />
        </group>
        {/* un magazine corné, posé de travers */}
        <group position={[0.1, TOP + 0.004, -0.4]} rotation-y={-0.35}>
          <Part geo={rbox(0.2, 0.008, 0.26, 0.003)} m={L.paper} castShadow={false} />
          <mesh material={MAG} position={[0, 0.0045, 0]} rotation-x={-Math.PI / 2} raycast={noRay}>
            <planeGeometry args={[0.2, 0.26]} />
          </mesh>
          <Part geo={rbox(0.05, 0.004, 0.05, 0.002)} m={L.paper} p={[0.075, 0.009, -0.105]} rotation={[0, 0.78, 0.25]} castShadow={false} />
        </group>
        {/* le tabouret haut, derrière le comptoir : assise ronde, pied central, repose-pied */}
        <group position={[-0.66, 0, 0.15]}>
          <Part geo={cyl(0.17, 0.16, 0.05, 24)} m={L.benchSeat} p={[0, 0.66, 0]} />
          <Part geo={cyl(0.025, 0.03, 0.64, 12)} m={L.chrome} p={[0, 0.33, 0]} />
          <Part m={L.chrome} p={[0, 0.25, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.13, 0.012, 8, 24]} />
          </Part>
          <Part geo={cyl(0.18, 0.2, 0.03, 24)} m={L.steelDark} p={[0, 0.015, 0]} castShadow={false} />
        </group>
      </group>
      <Lamp position={[x - 0.05, y + TOP, z - 0.3]} />
    </>
  )
}
