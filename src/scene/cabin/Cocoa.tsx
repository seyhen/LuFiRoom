import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import { rand } from '../../math'
import { M } from '../materials'
import { Part, cyl, noRay, rbox } from '../parts'
import { reduceMotion, useParticles } from '../anim'
import { wispTex, wispTexes } from '../textures'
import { C } from './materials'
import { starGeo } from './ChristmasTree'
import { Vessel, innerR } from '../igloo/Vessel'

// Sur la table d'appoint, côté pièce : un gros mug (plus gros que nature, pour qu'on le voie), un napperon, deux biscuits.
const P = [2.4, 0.62, -0.53] as const
const COOKIE = starGeo(0.085, 0.048, 0.03)

// Sucre d'orge qui trempe dans le chocolat : une tige et sa crosse, tournée vers l'avant.
const candyGeo = (() => {
  const pts: Vector3[] = [new Vector3(0, -0.06, 0), new Vector3(0, 0.1, 0), new Vector3(0, 0.22, 0)]
  for (let i = 1; i <= 8; i++) {
    const a = (i / 8) * Math.PI
    pts.push(new Vector3(-0.055 + Math.cos(a) * 0.055, 0.22 + Math.sin(a) * 0.055, 0))
  }
  return new TubeGeometry(new CatmullRomCurve3(pts), 40, 0.013, 8, false)
})()

/** Chocolat chaud aux guimauves et au sucre d'orge, qui fume en grosses volutes ; biscuits sur le côté. */
export function Cocoa() {
  const steam = useParticles(), since = useRef(0)
  useFrame((_, delta) => {
    if (reduceMotion) return
    since.current += Math.min(delta, 0.05)
    if (since.current > 0.4) {
      since.current = 0
      steam.emit(wispTexes, P[0] + rand(-0.04, 0.04), P[1] + 0.4, P[2] + rand(-0.03, 0.03), { size: 0.42, life: 3.4, vy: 0.2, sway: 0.08, grow: 0.8, peak: 0.85, soft: true })
    }
  })
  const still = useMemo(() => [[0, 0.62, 0.5, 0.9], [0.03, 0.95, 0.42, 0.55]], [])
  return (
    <>
      <group position={P as unknown as [number, number, number]}>
        {/* napperon */}
        <Part geo={cyl(0.27, 0.27, 0.006, 32)} m={M.cream} p={[-0.02, 0.003, 0.02]} castShadow={false} />
        {/* mug : corps canneberge, bord crème, chocolat, anse tournée vers la droite de l'écran */}
        {/* un vrai mug ouvert (Vessel) : le chocolat est dedans, 2 cm sous le bord crème */}
        <Vessel p={[0, 0.006, 0]} rt={0.135} rb={0.12} h={0.25} m={C.cranberry} inner={C.cranberryInner} rim={M.cream} t={0.012} />
        <mesh geometry={cyl(innerR(0.135, 0.12, 0.25, 0.23, 0.012), innerR(0.135, 0.12, 0.25, 0.23, 0.012), 0.01, 28)} material={C.cocoa} position={[0, 0.236, 0]} />
        <Part m={C.cranberry} p={[0.1, 0.14, -0.1]} rotation-y={Math.PI / 4} castShadow={false}>
          <torusGeometry args={[0.065, 0.02, 10, 20]} />
        </Part>
        {[[-0.045, 0.03, 0.3], [0.04, -0.01, -0.4], [-0.01, -0.06, 0.9]].map(([x, z, r]) => (
          <Part key={r} geo={rbox(0.065, 0.05, 0.065, 0.022)} m={M.pillow} p={[x, 0.252, z]} rotation-y={r} castShadow={false} />
        ))}
        <mesh geometry={candyGeo} material={C.candy} position={[0.045, 0.15, 0.01]} rotation={[0, 0.8, -0.22]} castShadow />
        {/* biscuits en étoile : pain d'épice et sablé, une perle rouge au centre */}
        {[[-0.38, 0.22, 0.5, C.log], [-0.3, 0.4, 2.4, C.cut]].map(([x, z, r, m], i) => (
          <group key={i} position={[x as number, 0.02, z as number]} rotation-y={r as number}>
            <Part geo={COOKIE} m={m as typeof C.log} rotation-x={-Math.PI / 2} />
            <Part geo={cyl(0.013, 0.013, 0.01, 8)} m={C.cranberry} p={[0, 0.04, 0]} castShadow={false} />
          </group>
        ))}
      </group>
      <group ref={steam.group} />
      {reduceMotion &&
        still.map(([dx, dy, s, o], i) => (
          <sprite key={i} scale={s} position={[P[0] + dx, P[1] + dy, P[2]]} raycast={noRay}>
            <spriteMaterial map={wispTex} transparent depthWrite={false} opacity={o} />
          </sprite>
        ))}
    </>
  )
}
