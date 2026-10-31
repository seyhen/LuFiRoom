import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide, type Group, type Mesh, type MeshBasicMaterial } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach } from '../../math'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Steam } from '../objects/Steam'
import { Static } from '../Static'
import { K } from './materials'
import { ringTex } from './textures'
import { Vessel, innerR } from '../igloo/Vessel'

const R = 0.27, H = 0.44
/** Le bouillon : 4 cm sous le bord (pied du faitout à 0,07) ; les ronds des bulles flottent 8 mm au-dessus. */
const BROTH = H - 0.04
const potInner = K.steelDark.clone()
potInner.side = DoubleSide
/** Le couvercle, appuyé contre la panse : direction (rad), inclinaison vers la marmite, rayon. */
const LID = { a: 0.8, tilt: 0.25, r: 0.235 }
const BUBBLES = 4

/**
 * La marmite de bouillon, sur son réchaud : un grand faitout d'acier plein à ras bord d'un bouillon doré, deux anses, un couvercle
 * appuyé contre sa panse et une louche posée en travers. Quand elle frémit, des bulles crèvent la surface et une vapeur épaisse
 * monte ; au repos elle fume à peine.
 */
export function Pot({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), bubbles = useRef<Mesh[]>([]), k = useRef(0)
  const on = useStore((s) => isActive(s, 'pot'))
  useSquash('pot', g)
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime
    k.current = approach(k.current, isActive(useStore.getState(), 'pot') ? 1 : 0.15, Math.min(delta, 0.05) * 1.2)
    bubbles.current.forEach((b, i) => {
      const p = reduceMotion ? 0.5 : (t * (0.35 + (i % 3) * 0.12) + i * 0.37) % 1 // phase linéaire en t : fréquence fixe par bulle
      const a = (i / BUBBLES) * TAU + i * 0.8, r = 0.04 + ((i * 53) % 17) * 0.011
      b.position.set(Math.cos(a) * r, BROTH + 0.018, Math.sin(a) * r)
      b.scale.setScalar(0.03 + p * 0.1)
      ;(b.material as MeshBasicMaterial).opacity = Math.sin(Math.PI * p) * 0.55 * k.current
    })
  })
  return (
    <group ref={g} userData={{ id: 'pot' }} position={position}>
      <Static>
      {/* le réchaud : une couronne de fonte, un tuyau de gaz */}
      <Part geo={cyl(0.2, 0.22, 0.07, 22)} m={K.iron} p={[0, 0.035, 0]} />
      {/* le faitout : un vrai récipient ouvert (paroi, paroi intérieure, fond, bourrelet), le bouillon posé dedans sous le bord */}
      <Vessel p={[0, 0.07, 0]} rt={R} rb={R * 0.96} h={H} m={K.steel} inner={potInner} t={0.012} />
      <Part geo={cyl(innerR(R, R * 0.96, H, BROTH, 0.012), innerR(R, R * 0.96, H, BROTH, 0.012), 0.01, 30)} m={K.broth} p={[0, 0.07 + BROTH - 0.005, 0]} castShadow={false} />
      <Part geo={cyl(R * 0.97, R * 0.97, 0.03, 30)} m={K.steelDark} p={[0, 0.22, 0]} castShadow={false} />
      {[-1, 1].map((s) => (
        <Part key={s} m={K.steelDark} p={[s * (R + 0.03), 0.4, 0]} rotation-y={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.05, 0.012, 6, 14, Math.PI]} />
        </Part>
      ))}
      {/* le couvercle, debout sur le comptoir et penché contre la panse côté client (son bord du haut touche la paroi, rien n'entre
          dedans), et sa poignée de bois tournée vers nous */}
      <group position={[Math.sin(LID.a) * (R + 0.02 + LID.r * Math.sin(LID.tilt)), LID.r * Math.cos(LID.tilt) + 0.012, Math.cos(LID.a) * (R + 0.02 + LID.r * Math.sin(LID.tilt))]} rotation-y={LID.a}>
        <group rotation-x={Math.PI / 2 - LID.tilt}>
          <Part geo={cyl(0.22, 0.22, 0.02, 28)} m={K.steelDark} />
          <Part geo={cyl(LID.r, LID.r, 0.012, 28)} m={K.steel} p={[0, -0.012, 0]} castShadow={false} />
          <Part geo={SPH} m={K.woodDark} scale={[0.04, 0.03, 0.04]} p={[0, 0.03, 0]} castShadow={false} />
        </group>
      </group>
      {/* la louche : son cuilleron trempe dans le bouillon, son manche s'appuie sur le bord et sort de la marmite */}
      <group position={[0, 0.07, 0]} rotation-y={-0.7}>
        <Part geo={cyl(0.012, 0.012, 0.47, 8)} m={K.woodPale} p={[0.14, BROTH + 0.09, 0]} rotation-z={-(Math.PI / 2 - 0.31)} castShadow={false} />
        <Part geo={SPH} m={K.steel} scale={[0.06, 0.032, 0.06]} p={[-0.1, BROTH + 0.004, 0]} castShadow={false} />
      </group>
      {/* le tuyau d'arrivée du gaz et sa manette */}
      <Part geo={rbox(0.06, 0.06, 0.5, 0.02)} m={K.iron} p={[0.1, 0.03, 0.4]} castShadow={false} />
      </Static>
      {/* les bulles qui crèvent la surface */}
      <group position={[0, 0.07, 0]}>
        {Array.from({ length: BUBBLES }, (_, i) => (
          <mesh key={i} ref={(el) => void (el && (bubbles.current[i] = el))} rotation-x={-Math.PI / 2} raycast={noRay}>
            <planeGeometry args={[1, 1]} />
            <meshBasicMaterial map={ringTex} color={0xffe6b0} transparent depthWrite={false} opacity={0} blending={AdditiveBlending} />
          </mesh>
        ))}
      </group>
      <Steam at={[0, H + 0.2, 0]} every={on ? 0.9 : 1.8} />
    </group>
  )
}
