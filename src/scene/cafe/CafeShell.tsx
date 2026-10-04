import { Part, WIN, rbox } from '../parts'
import { holedWall } from '../walls'
import { M } from '../materials'
import { K } from './materials'

/** Socle de pierre, carrelage, mur du fond (pierre et lambris, même fenêtre que la chambre), mur de gauche et appui de fenêtre. */
export function CafeShell() {
  return (
    <>
      <Part geo={rbox(6.86, 0.55, 6.86, 0.2)} m={K.base} p={[-0.07, -0.44, -0.07]} />
      <Part geo={rbox(6.54, 0.24, 6.54, 0.08)} m={K.floor} p={[-0.07, -0.12, -0.07]} />
      {/* le chevron entier, à sa taille (la boîte arrondie n'en montrerait que le centre, très agrandi) */}
      <mesh material={K.floor} position={[-0.07, 0.003, -0.07]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[6.42, 6.42]} />
      </mesh>
      <Part geo={holedWall([WIN])} m={K.wall} p={[0, 0, -3.26]} />
      <Part geo={rbox(0.34, 4.35, 6.54, 0.08)} m={K.stone} p={[-3.17, 2.125, -0.07]} />
      <Part geo={rbox(2.62, 0.1, 0.3, 0.04)} m={M.cream} p={[(WIN.x0 + WIN.x1) / 2, WIN.y0 - 0.03, -2.9]} />
    </>
  )
}
