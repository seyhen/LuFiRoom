import { RepeatWrapping } from 'three'
import { Part, WIN, rbox } from '../parts'
import { backWall } from '../objects/Shell'
import { M } from '../materials'
import { C } from './materials'
import { wallTex } from './textures'

// Mur de gauche : un plan à part, dont la texture se répète sur 6.54 × 4.35 (lames de 0.45).
const leftTex = wallTex.clone()
leftTex.wrapS = leftTex.wrapT = RepeatWrapping
leftTex.repeat.set(6.54 / 1.35, 4.35 / 1.35)
leftTex.needsUpdate = true

/** Socle sous la neige, plancher, murs de rondins (même gabarit et même fenêtre que la chambre) et appui de fenêtre. */
export function CabinShell() {
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={C.base} p={[-0.07, -0.44, -0.07]} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={C.floor} p={[-0.07, -0.12, -0.07]} />
      <Part geo={backWall} m={C.wall} p={[0, 0, -3.26]} />
      <Part geo={rbox(0.34, 4.35, 6.54, 0.08)} m={C.beam} p={[-3.17, 2.125, -0.07]} />
      <mesh rotation-y={Math.PI / 2} position={[-2.995, 2.125, -0.07]} receiveShadow>
        <planeGeometry args={[6.54, 4.35]} />
        <meshStandardMaterial map={leftTex} roughness={0.85} />
      </mesh>
      <Part geo={rbox(2.62, 0.1, 0.3, 0.04)} m={M.cream} p={[(WIN.x0 + WIN.x1) / 2, WIN.y0 - 0.03, -2.9]} />
    </>
  )
}
