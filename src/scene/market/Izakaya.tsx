import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Mesh, type MeshBasicMaterial, type Sprite } from 'three'
import { smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { mood, reduceMotion } from '../anim'
import { glowTex } from '../textures'
import { LIVE } from '../Static'
import { Steam } from '../objects/Steam'
import { K } from './materials'

/** La porte de l'izakaya, percée dans le mur de gauche : z du seuil gauche et droit, hauteur du linteau. */
export const DOOR = { z0: -0.15, z1: 0.85, top: 2.2 }
const cz = (DOOR.z0 + DOOR.z1) / 2

/** Une lanterne de papier pendue à un bras de laiton fixé au mur : rouge (麺) ou blanche (酒). Elle se balance un peu. */
function WallLantern({ position, white = false }: { position: V3; white?: boolean }) {
  const g = useRef<Group>(null!), glow = useRef<Sprite>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, e = smooth(mood.night)
    g.current.rotation.z = reduceMotion ? 0 : Math.sin(t * 0.9 + position[2]) * 0.035
    glow.current.material.opacity = 0.25 + e * 0.55
  })
  return (
    <group position={position}>
      <Part geo={rbox(0.36, 0.03, 0.03, 0.01)} m={K.iron} p={[0.18, 0, 0]} castShadow={false} />
      <Part geo={rbox(0.05, 0.12, 0.05, 0.015)} m={K.iron} p={[0.01, 0, 0]} castShadow={false} />
      <group ref={g} userData={LIVE} position={[0.34, 0, 0]}>
        <Part geo={cyl(0.005, 0.005, 0.12, 4)} m={K.iron} p={[0, -0.06, 0]} castShadow={false} />
        <Part geo={SPH} m={white ? K.lanternWhite : K.lantern} scale={[0.15, 0.2, 0.15]} p={[0, -0.3, 0]} rotation-y={0.5} />
        <Part geo={cyl(0.07, 0.07, 0.025, 14)} m={K.lanternCap} p={[0, -0.12, 0]} castShadow={false} />
        <Part geo={cyl(0.07, 0.07, 0.025, 14)} m={K.lanternCap} p={[0, -0.48, 0]} castShadow={false} />
        <sprite ref={glow} scale={0.9} position={[0.04, -0.3, 0]} raycast={noRay}>
          <spriteMaterial map={glowTex} color={white ? 0xffe0a0 : 0xff6a4a} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.3} />
        </sprite>
      </group>
    </group>
  )
}

/** Le noren rouge de la porte : trois pans fendus, qui se balancent. */
function DoorNoren() {
  const g = useRef<Group>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    g.current.rotation.z = reduceMotion ? 0 : Math.sin(t * 1.1) * 0.03 + Math.sin(t * 2.7) * 0.012
  })
  return (
    <group ref={g} userData={LIVE} position={[-2.9, DOOR.top - 0.02, cz]}>
      {[-0.31, 0, 0.31].map((z, i) => (
        <group key={i} position={[0, 0, z]}>
          <Part geo={rbox(0.025, 0.58, 0.27, 0.01)} m={K.red} p={[0, -0.29, 0]} castShadow={false} />
          <Part geo={rbox(0.03, 0.05, 0.27, 0.01)} m={K.cream} p={[0, -0.04, 0]} castShadow={false} />
          <Part geo={rbox(0.03, 0.04, 0.27, 0.01)} m={K.redDark} p={[0, -0.55, 0]} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

/**
 * L'izakaya dans le mur de gauche : une porte où l'on devine un comptoir et des étagères de bouteilles sous des lanternes, un noren
 * rouge, un linteau de bois sous l'enseigne « 酒処 », deux lanternes de chaque côté, une fenêtre à treillis chaude au-dessus du
 * poste de télé, un banc devant où fument les habitués, et la lumière ambrée qui coule de la porte sur le pavé.
 */
export function Izakaya() {
  const spill = useRef<Mesh>(null!), halo = useRef<Sprite>(null!)
  useFrame(({ clock }) => {
    const n = smooth(mood.night), f = 1 + (reduceMotion ? 0 : Math.sin(clock.elapsedTime * 3.1) * 0.03)
    ;(spill.current.material as MeshBasicMaterial).opacity = (0.18 + 0.4 * n) * f
    halo.current.material.opacity = (0.2 + 0.5 * n) * f
    K.izakaya.color.setRGB(0.78 + 0.22 * n, 0.74 + 0.2 * n, 0.68 + 0.14 * n)
    K.lattice.color.setRGB(0.78 + 0.22 * n, 0.74 + 0.2 * n, 0.68 + 0.14 * n)
  })
  const w = DOOR.z1 - DOOR.z0
  return (
    <>
      {/* ce qu'on voit par la porte : l'intérieur peint, juste derrière le mur (décalé pour la parallaxe) */}
      <mesh material={K.izakaya} position={[-3.65, 0.6, -0.3]} rotation-y={-Math.PI / 2}>
        <planeGeometry args={[1.5, 2.6]} />
      </mesh>
      {/* le cadre : montants, linteau, seuil, la planche de l'enseigne */}
      {[DOOR.z0 - 0.04, DOOR.z1 + 0.04].map((z) => (
        <Part key={z} geo={rbox(0.1, DOOR.top + 0.08, 0.12, 0.03)} m={K.woodDark} p={[-2.96, (DOOR.top + 0.08) / 2, z]} />
      ))}
      <Part geo={rbox(0.14, 0.14, w + 0.4, 0.04)} m={K.woodDark} p={[-2.95, DOOR.top + 0.1, cz]} />
      <Part geo={rbox(0.3, 0.07, w + 0.2, 0.025)} m={K.steelDark} p={[-2.86, 0.035, cz]} />
      <mesh material={K.sakeSign} position={[-2.945, DOOR.top + 0.72, cz]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[0.46, 0.92]} />
      </mesh>
      <Part geo={rbox(0.05, 1.0, 0.52, 0.02)} m={K.woodDark} p={[-2.985, DOOR.top + 0.72, cz]} castShadow={false} />
      <DoorNoren />
      {/* les lanternes de part et d'autre : rouge côté fond, blanche côté télé */}
      <WallLantern position={[-2.98, 2.05, DOOR.z0 - 0.38]} />
      <WallLantern position={[-2.98, 2.05, DOOR.z1 + 0.38]} white />
      {/* la fenêtre à treillis, au-dessus du poste de télé, avec son cadre et son appui */}
      <group position={[-2.97, 2.38, 2.3]} rotation-y={Math.PI / 2}>
        <Part geo={rbox(1.04, 0.82, 0.05, 0.03)} m={K.woodDark} />
        <mesh material={K.lattice} position={[0, 0, 0.03]}>
          <planeGeometry args={[0.92, 0.7]} />
        </mesh>
        <Part geo={rbox(1.2, 0.06, 0.2, 0.02)} m={K.woodDark} p={[0, -0.45, 0.07]} />
        <sprite scale={[2.0, 1.7, 1]} position={[0, 0, 0.3]} raycast={noRay}>
          <spriteMaterial map={glowTex} color={0xffa860} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.22} />
        </sprite>
      </group>
      {/* le banc des habitués, contre le mur, entre la porte et le poste de télé, avec une théière et deux tasses */}
      <group position={[-2.68, 0, 1.45]}>
        <Part geo={rbox(0.45, 0.07, 1.1, 0.025)} m={K.woodPale} p={[0, 0.46, 0]} />
        {[-0.45, 0.45].map((z) => (
          <Part key={z} geo={rbox(0.4, 0.44, 0.07, 0.02)} m={K.woodDark} p={[0, 0.22, z]} />
        ))}
        <Part geo={rbox(0.36, 0.05, 0.3, 0.02)} m={K.indigo} p={[0.0, 0.52, -0.12]} castShadow={false} />
        <Part geo={cyl(0.06, 0.07, 0.08, 14)} m={K.teal} p={[0.02, 0.54, 0.25]} />
        <Part geo={SPH} m={K.teal} scale={[0.03, 0.02, 0.03]} p={[0.02, 0.6, 0.25]} castShadow={false} />
        <Part geo={cyl(0.028, 0.022, 0.04, 10)} m={K.bowl} p={[-0.08, 0.52, 0.16]} castShadow={false} />
        <Steam at={[0.02, 0.66, 0.25]} every={1.0} />
      </group>
      {/* la lumière qui coule de la porte sur le pavé, et son halo */}
      <mesh ref={spill} position={[-2.0, 0.03, cz]} rotation-x={-Math.PI / 2} raycast={noRay} userData={LIVE}>
        <planeGeometry args={[2.8, 2.6]} />
        <meshBasicMaterial map={glowTex} color={0xffa050} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.3} />
      </mesh>
      <sprite ref={halo} scale={[1.8, 3.0, 1]} position={[-2.7, 1.2, cz]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0xffb060} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.3} />
      </sprite>
    </>
  )
}
