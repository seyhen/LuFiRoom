import { TAU } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { S } from './materials'
import { PORT } from './SubShell'

/** Un rang de clous de laiton le long d'une arête. */
function Studs({ n, from, to, y, z }: { n: number; from: number; to: number; y: number; z: number }) {
  return (
    <>
      {Array.from({ length: n }, (_, i) => (
        <Part key={i} geo={SPH} m={S.brass} scale={0.018} p={[from + ((to - from) * i) / (n - 1), y, z]} castShadow={false} />
      ))}
    </>
  )
}

/** Un petit poulpe en peluche : tête ronde, huit tentacules qui s'enroulent, deux yeux. */
function Octopus() {
  return (
    <group>
      <Part geo={SPH} m={S.red} scale={[0.1, 0.11, 0.1]} p={[0, 0.17, 0]} />
      <Part geo={SPH} m={S.red} scale={[0.09, 0.05, 0.09]} p={[0, 0.07, 0]} castShadow={false} />
      {Array.from({ length: 8 }, (_, i) => {
        const a = (i / 8) * TAU
        return (
          <group key={i} rotation-y={-a}>
            <Part geo={SPH} m={S.red} scale={[0.07, 0.022, 0.026]} p={[0.1, 0.028, 0]} rotation-z={0.15} castShadow={false} />
            <Part geo={SPH} m={S.red} scale={[0.035, 0.018, 0.02]} p={[0.17, 0.03, 0.025]} castShadow={false} />
          </group>
        )
      })}
      {[-1, 1].map((s) => (
        <group key={s} position={[0.075, 0.18, s * 0.04]}>
          <Part geo={SPH} m={S.cream} scale={0.026} castShadow={false} />
          <Part geo={SPH} m={S.iron} scale={0.014} p={[0.016, 0, 0]} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

/**
 * Les sièges : une banquette de cuir sous le hublot, avec ses clous de laiton, deux coussins sarcelle, un poulpe en peluche et un
 * rouleau de cartes ; et un fauteuil club lie-de-vin tourné vers la pièce, sur pieds de laiton.
 */
export function Seating() {
  return (
    <>
      {/* la banquette sous le hublot, un peu plus large que lui */}
      <group position={[PORT.x, 0, -2.58]}>
        <Part geo={rbox(2.3, 0.44, 0.7, 0.07)} m={S.wood} p={[0, 0.25, 0]} />
        <Part geo={rbox(2.36, 0.07, 0.74, 0.03)} m={S.woodDark} p={[0, 0.035, 0.0]} castShadow={false} />
        <Part geo={rbox(2.26, 0.15, 0.66, 0.07)} m={S.leather} p={[0, 0.54, 0]} />
        <Studs n={12} from={-1.05} to={1.05} y={0.52} z={0.335} />
        {[-0.88, 0.45].map((x, i) => (
          <Part key={x} geo={rbox(0.5, 0.36, 0.14, 0.07)} m={S.teal} p={[x, 0.76, -0.2]} rotation={[-0.2, i ? -0.2 : 0.15, 0]} />
        ))}
        {/* le poulpe, assis au bout, et un rouleau de cartes marines */}
        <group position={[0.98, 0.6, 0.0]} rotation-y={-0.5}>
          <Octopus />
        </group>
        <group position={[0.0, 0.64, 0.1]} rotation-y={0.4}>
          <Part geo={cyl(0.035, 0.035, 0.46, 12)} m={S.paper} rotation-z={Math.PI / 2} />
          <Part geo={cyl(0.037, 0.037, 0.02, 12)} m={S.red} p={[-0.1, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        </group>
      </group>
      {/* le fauteuil club, tourné vers la caméra */}
      <group position={[1.95, 0, -0.9]} rotation-y={0.62}>
        <Part geo={rbox(0.96, 0.22, 0.9, 0.08)} m={S.leather} p={[0, 0.42, 0]} />
        <Part geo={rbox(0.78, 0.13, 0.7, 0.07)} m={S.leatherDark} p={[0, 0.55, 0.04]} />
        <Part geo={rbox(0.96, 0.82, 0.22, 0.09)} m={S.leather} p={[0, 0.82, -0.36]} rotation-x={-0.1} />
        {[-0.42, 0.42].map((x) => (
          <Part key={x} geo={rbox(0.16, 0.34, 0.82, 0.07)} m={S.leather} p={[x, 0.66, 0.02]} />
        ))}
        <Studs n={7} from={-0.4} to={0.4} y={0.4} z={0.455} />
        {[-0.38, 0.38].flatMap((x) => [-0.34, 0.34].map((z) => <Part key={`${x}${z}`} geo={cyl(0.04, 0.03, 0.34, 10)} m={S.brass} p={[x, 0.17, z]} />))}
        <Part geo={rbox(0.5, 0.28, 0.12, 0.06)} m={S.cream} p={[0, 0.9, -0.22]} rotation-x={-0.25} />
      </group>
    </>
  )
}
