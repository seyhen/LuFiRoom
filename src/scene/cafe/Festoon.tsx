import { useLayoutEffect, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Object3D, TubeGeometry, Vector3, type InstancedMesh, type PointLight, type PointsMaterial } from 'three'
import { smooth } from '../../math'
import { M } from '../materials'
import { SPH, cyl, noRay } from '../parts'
import { mood } from '../anim'
import { K } from './materials'
import { bulbGlowTex } from '../textures'


// Une guirlande guinguette (grosses ampoules) en trois festons le long du haut du mur du fond.
const Z = -2.94, TOP = 4.28, SAG = 0.2, HOOKS = [-2.95, -0.9, 1.15, 3.1]
const wy = (x: number) => {
  for (let i = 0; i < HOOKS.length - 1; i++) {
    const a = HOOKS[i], b = HOOKS[i + 1]
    if (x <= b) return TOP - SAG * Math.sin((Math.PI * (x - a)) / (b - a))
  }
  return TOP
}
const X0 = HOOKS[0], X1 = HOOKS[HOOKS.length - 1]
const wire = new TubeGeometry(
  new CatmullRomCurve3(Array.from({ length: 91 }, (_, i) => { const x = X0 + ((X1 - X0) * i) / 90; return new Vector3(x, wy(x), Z) })),
  180, 0.01, 5, false,
)
const BULBS = Array.from({ length: 18 }, (_, i) => X0 + ((X1 - X0) * (i + 0.5)) / 18).map((x) => [x, wy(x) - 0.08, Z + 0.02] as const)
const glowGeo = new BufferGeometry().setAttribute('position', new Float32BufferAttribute(BULBS.flatMap(([x, y, z]) => [x, y - 0.02, z + 0.04]), 3))
const socketGeo = cyl(0.022, 0.022, 0.05, 8)
const dummy = new Object3D()

/**
 * La guirlande, et la lumière chaude de la salle qui va avec : allumée le jour (il fait gris dehors), plus vive le soir.
 * Ampoules et douilles en instances, halos en points : trois appels de dessin pour toute la guirlande.
 */
export function Festoon() {
  const bulbs = useRef<InstancedMesh>(null!), sockets = useRef<InstancedMesh>(null!), glow = useRef<PointsMaterial>(null!)
  const light = useRef<PointLight>(null!)
  useLayoutEffect(() => {
    BULBS.forEach(([x, y, z], i) => {
      dummy.position.set(x, y, z); dummy.scale.set(0.045, 0.06, 0.045); dummy.updateMatrix()
      bulbs.current.setMatrixAt(i, dummy.matrix)
      dummy.position.set(x, y + 0.07, z); dummy.scale.set(1, 1, 1); dummy.updateMatrix()
      sockets.current.setMatrixAt(i, dummy.matrix)
    })
    bulbs.current.instanceMatrix.needsUpdate = true
    sockets.current.instanceMatrix.needsUpdate = true
  }, [])
  useFrame(({ clock }) => {
    const e = smooth(mood.night), t = clock.elapsedTime
    K.bulb.emissiveIntensity = 0.75 + e * 0.9 + Math.sin(t * 1.3) * 0.04
    glow.current.opacity = 0.25 + e * 0.6
    light.current.intensity = (0.45 + mood.rain * 0.15 + e * 0.95) * Math.PI // × π : voir materials.ts
  })
  return (
    <>
      <mesh geometry={wire} material={M.plum} raycast={noRay} />
      <instancedMesh ref={sockets} args={[socketGeo, M.plum, BULBS.length]} raycast={noRay} />
      <instancedMesh ref={bulbs} args={[SPH, K.bulb, BULBS.length]} raycast={noRay} />
      <points geometry={glowGeo} raycast={noRay}>
        <pointsMaterial ref={glow} map={bulbGlowTex} size={0.42} sizeAttenuation blending={AdditiveBlending} transparent depthWrite={false} />
      </points>
      <pointLight ref={light} color={0xffbd78} intensity={0} distance={10} decay={1.3} position={[0.2, 3.5, -1.0]} />
    </>
  )
}
