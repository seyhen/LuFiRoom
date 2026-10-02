import { ExtrudeGeometry, Path, Shape } from 'three'
import { M } from '../materials'
import { Part, WIN, rbox, rrPath } from '../parts'
import { muralTex } from '../textures'

// Mur du fond, percé de la fenêtre.
const wallShape = rrPath(new Shape(), -3.34, -0.05, 6.54, 4.35, 0.12)
wallShape.holes.push(rrPath(new Path(), WIN.x0, WIN.y0, WIN.x1 - WIN.x0, WIN.y1 - WIN.y0, 0.16))
export const backWall = new ExtrudeGeometry(wallShape, { depth: 0.2, bevelEnabled: true, bevelThickness: 0.06, bevelSize: 0.06, bevelSegments: 3, curveSegments: 10 })

/** Socle, parquet, murs (fresque à gauche) et appui intérieur de la fenêtre. */
export function Shell() {
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={M.base} p={[-0.07, -0.44, -0.07]} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={M.floor} p={[-0.07, -0.12, -0.07]} />
      <Part geo={backWall} m={M.wallBack} p={[0, 0, -3.26]} />
      <Part geo={rbox(0.34, 4.35, 6.54, 0.08)} m={M.wallLeft} p={[-3.17, 2.125, -0.07]} />
      <mesh rotation-y={Math.PI / 2} position={[-2.995, 2.125, -0.07]} receiveShadow>
        <planeGeometry args={[6.54, 4.35]} />
        <meshStandardMaterial map={muralTex} roughness={0.85} />
      </mesh>
      <Part geo={rbox(2.62, 0.1, 0.3, 0.04)} m={M.cream} p={[(WIN.x0 + WIN.x1) / 2, WIN.y0 - 0.03, -2.9]} />
    </>
  )
}
