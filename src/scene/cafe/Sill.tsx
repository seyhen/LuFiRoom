import { TAU } from '../../math'
import { Part, SPH, cyl } from '../parts'
import { K } from './materials'
import { Candle } from '../objects/Candle'

// Brins de bruyère : [x, z, hauteur].
const HEATHER = Array.from({ length: 16 }, (_, i) => [Math.cos(i * 2.4) * 0.08 * ((i % 4) / 4 + 0.4), Math.sin(i * 2.4) * 0.07 * ((i % 4) / 4 + 0.4), 0.12 + (i % 5) * 0.025] as const)

/** Sur l'appui de fenêtre : une bougie dans son verre, un pot de bruyère des Highlands, deux livres. */
export function Sill() {
  return (
    <group position={[0, 2.12, -2.86]}>
      <Candle position={[0.5, 0, 0.02]} holder="jar" height={0.1} radius={0.035} />
      <group position={[2.28, 0, 0]}>
        <Part geo={cyl(0.1, 0.08, 0.13, 18)} m={K.pot} p={[0, 0.065, 0]} />
        {HEATHER.map(([x, z, h], i) => (
          <group key={i} position={[x, 0.12, z]}>
            <Part geo={cyl(0.006, 0.006, h, 4)} m={K.leafDark} p={[0, h / 2, 0]} castShadow={false} />
            <Part geo={SPH} m={K.thistle} scale={[0.022, 0.05, 0.022]} p={[0, h, 0]} rotation-y={(i / 16) * TAU} castShadow={false} />
          </group>
        ))}
      </group>
      {[[0x2c5a4c, 0.045], [0xd9a441, 0.035]].map(([c, h], i) => (
        <mesh key={i} position={[1.85, (i ? 0.045 : 0) + h / 2, 0]} rotation-y={0.15 - i * 0.3} castShadow receiveShadow>
          <boxGeometry args={[0.26, h, 0.18]} />
          <meshPhysicalMaterial color={c} roughness={0.6} clearcoat={0.3} />
        </mesh>
      ))}
    </group>
  )
}
