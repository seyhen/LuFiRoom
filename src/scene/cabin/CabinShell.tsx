import { RepeatWrapping } from 'three'
import { Batch, Part, SPH, WIN, backWall, rbox, worldUV, type Item } from '../parts'
import { M } from '../materials'
import { C } from './materials'
import { wallTex } from './textures'

// Mur de gauche : un plan à part, dont la texture se répète sur 6.54 × 4.35 (lames de 0.45).
const leftTex = wallTex.clone()
leftTex.wrapS = leftTex.wrapT = RepeatWrapping
leftTex.repeat.set(6.54 / 1.35, 4.35 / 1.35)
leftTex.needsUpdate = true

// Coulures de neige au bord des congères, côté pièce : le long du mur du fond, puis du mur de gauche.
const DRIPS: Item[] = [
  ...[-2.6, -0.6, 0.9, 2.2, 3.0].map((x, i): Item => ({ p: [x, 4.34, -2.9], s: [0.16 + (i % 2) * 0.05, 0.09, 0.07] })),
  ...[-2.0, -0.3, 1.2, 2.6].map((z, i): Item => ({ p: [-2.93, 4.28, z], s: [0.07, 0.09, 0.15 + (i % 2) * 0.06] })),
]

/** Socle sous la neige, plancher, murs de rondins (même gabarit et même fenêtre que la chambre), appui de fenêtre, neige sur les murs. */
export function CabinShell() {
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={C.base} p={[-0.07, -0.44, -0.07]} />
      <Part geo={worldUV(rbox(6.54, 0.24, 6.54, 0.08), 2)} m={C.floor} p={[-0.07, -0.12, -0.07]} />
      <Part geo={backWall} m={C.wall} p={[0, 0, -3.26]} />
      <Part geo={rbox(0.34, 4.35, 6.54, 0.08)} m={C.beam} p={[-3.17, 2.125, -0.07]} />
      <mesh rotation-y={Math.PI / 2} position={[-2.995, 2.125, -0.07]} receiveShadow>
        <planeGeometry args={[6.54, 4.35]} />
        <meshStandardMaterial map={leftTex} roughness={0.85} />
      </mesh>
      <Part geo={rbox(2.62, 0.1, 0.3, 0.04)} m={M.cream} p={[(WIN.x0 + WIN.x1) / 2, WIN.y0 - 0.03, -2.9]} />
      <Part geo={rbox(6.74, 0.2, 0.5, 0.1)} m={C.snowCap} p={[-0.07, 4.42, -3.13]} />
      <Part geo={rbox(0.52, 0.2, 6.74, 0.1)} m={C.snowCap} p={[-3.17, 4.36, -0.07]} />
      <Batch geo={SPH} m={C.snowCap} items={DRIPS} />
      {/* congère dehors, au pied de la fenêtre */}
      <Part geo={SPH} m={C.snowCap} scale={[1.3, 0.13, 0.18]} p={[(WIN.x0 + WIN.x1) / 2, WIN.y0, -3.45]} castShadow={false} />
    </>
  )
}
