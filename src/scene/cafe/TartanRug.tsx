import { Part, cyl, rbox } from '../parts'
import { K } from './materials'

const FRINGE = Array.from({ length: 14 }, (_, i) => -1.2 + (i * 2.4) / 13)

/** Tapis de tartan devant la cheminée, frangé aux deux bouts. */
export function TartanRug() {
  return (
    <group position={[-1.62, 0, 0.0]}>
      <Part geo={rbox(1.75, 0.03, 2.6, 0.015)} m={K.navy} p={[0, 0.015, 0]} />
      <mesh material={K.tartan} position={[0, 0.031, 0]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[1.72, 2.57]} />
      </mesh>
      {[-1, 1].map((s) =>
        FRINGE.map((x) => (
          <mesh key={`${s}${x}`} geometry={cyl(0.012, 0.012, 0.09, 4)} material={K.wool} position={[x * 0.68, 0.012, s * 1.34]} rotation-x={Math.PI / 2} />
        )),
      )}
    </group>
  )
}
