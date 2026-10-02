import { TAU } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'

const FEET = [0, 1, 2, 3, 4].map((i) => (i / 5) * TAU + 0.3)

/** Chaise de bureau à roulettes. */
export function Chair() {
  return (
    <group position={[1.55, 0, -1.6]}>
      {FEET.map((a) => (
        <group key={a}>
          <Part geo={rbox(0.38, 0.05, 0.07, 0.022)} m={M.plum} p={[Math.cos(a) * 0.19, 0.1, Math.sin(a) * 0.19]} rotation-y={-a} />
          <Part geo={SPH} m={M.plum} scale={0.05} p={[Math.cos(a) * 0.36, 0.05, Math.sin(a) * 0.36]} />
        </group>
      ))}
      <Part geo={cyl(0.045, 0.045, 0.52, 12)} m={M.plum} p={[0, 0.37, 0]} />
      <Part geo={rbox(0.8, 0.14, 0.74, 0.07)} m={M.pink} p={[0, 0.68, 0]} />
      <Part geo={rbox(0.12, 0.34, 0.06, 0.03)} m={M.plum} p={[0, 0.86, 0.34]} />
      <Part geo={rbox(0.74, 0.86, 0.13, 0.065)} m={M.pink} p={[0, 1.2, 0.38]} rotation-x={0.08} />
    </group>
  )
}
