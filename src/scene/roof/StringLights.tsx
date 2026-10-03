import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Object3D, TubeGeometry, Vector3, type Group, type InstancedMesh, type PointLight, type PointsMaterial } from 'three'
import { smooth } from '../../math'
import { Part, SPH, cyl, noRay } from '../parts'
import { mood, useSquash } from '../anim'
import { bulbGlowTex } from '../textures'
import { R } from './materials'

// La guirlande guinguette part du coin de la cage d'escalier vers trois poteaux, et pend entre eux.
const HUB = new Vector3(-1.5, 2.45, -1.65)
const POLES = [new Vector3(3.0, 2.75, -2.95), new Vector3(3.0, 2.75, 0.4), new Vector3(-2.95, 2.75, 2.95)]
const SAG = 0.38, PER = 11
const strand = (a: Vector3, b: Vector3) => Array.from({ length: 25 }, (_, i) => { const k = i / 24; return a.clone().lerp(b, k).setY(a.y + (b.y - a.y) * k - SAG * Math.sin(Math.PI * k)) })
const STRANDS = POLES.map((p) => strand(HUB, p))
const wires = STRANDS.map((pts) => new TubeGeometry(new CatmullRomCurve3(pts), 48, 0.009, 4, false))
const BULBS = STRANDS.flatMap((pts) => Array.from({ length: PER }, (_, i) => pts[Math.round(((i + 0.5) / PER) * 24)].clone().add(new Vector3(0, -0.07, 0))))
const glowGeo = new BufferGeometry().setAttribute('position', new Float32BufferAttribute(BULBS.flatMap((b) => [b.x, b.y - 0.02, b.z]), 3))
const dummy = new Object3D()

/**
 * Guirlande au-dessus de la terrasse, et le poteau de devant qui la tient : on le touche pour passer au soir.
 * Allumée un peu le jour, vive la nuit ; une lumière chaude pour toute la terrasse.
 */
export function StringLights() {
  const bulbs = useRef<InstancedMesh>(null!), glow = useRef<PointsMaterial>(null!), light = useRef<PointLight>(null!), pole = useRef<Group>(null!)
  useSquash('lamp', pole)
  useLayoutEffect(() => {
    BULBS.forEach((b, i) => {
      dummy.position.copy(b); dummy.scale.set(0.05, 0.065, 0.05); dummy.updateMatrix()
      bulbs.current.setMatrixAt(i, dummy.matrix)
    })
    bulbs.current.instanceMatrix.needsUpdate = true
  }, [])
  useFrame(({ clock }) => {
    const e = smooth(mood.night)
    R.bulb.emissiveIntensity = 0.3 + e * 1.4 + Math.sin(clock.elapsedTime * 1.4) * 0.04
    glow.current.opacity = 0.08 + e * 0.75
    light.current.intensity = (0.1 + e * 1.15) * Math.PI // × π : voir materials.ts
  })
  return (
    <>
      {wires.map((w, i) => (
        <mesh key={i} geometry={w} material={R.steel} raycast={noRay} />
      ))}
      <instancedMesh ref={bulbs} args={[SPH, R.bulb, BULBS.length]} raycast={noRay} />
      <points geometry={glowGeo} raycast={noRay}>
        <pointsMaterial ref={glow} map={bulbGlowTex} size={0.5} sizeAttenuation blending={AdditiveBlending} transparent depthWrite={false} />
      </points>
      <pointLight ref={light} color={0xffbe7a} intensity={0} distance={11} decay={1.3} position={[0.4, 2.3, 0.4]} />
      {/* les poteaux : celui de devant à droite est l'objet « lampe » */}
      {POLES.map((p, i) => (
        <group key={i} ref={i === 1 ? pole : undefined} userData={i === 1 ? { id: 'lamp' } : undefined} position={[p.x, 0, p.z]}>
          <Part geo={cyl(0.04, 0.05, p.y + 0.12, 10)} m={R.teak} p={[0, (p.y + 0.12) / 2, 0]} />
          <Part geo={SPH} m={R.steel} scale={0.05} p={[0, p.y + 0.14, 0]} castShadow={false} />
          {i === 1 && <Part geo={cyl(0.22, 0.24, 0.3, 18)} m={R.terracotta} p={[0, 0.15, 0]} />}
        </group>
      ))}
    </>
  )
}
