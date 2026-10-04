import { Part, cyl } from '../parts'
import { Candle } from '../objects/Candle'
import { B } from './materials'

/**
 * Le coin douillet du devant : un kilim tissé à plat, une lanterne de rotin posée au sol avec sa bougie, un panier où
 * l'on a roulé un plaid et une serviette.
 */
export function Hearthside() {
  return (
    <>
      <mesh material={B.kilim} position={[-0.75, 0.014, 2.05]} rotation={[-Math.PI / 2, 0, 0.5]} receiveShadow>
        <planeGeometry args={[1.5, 2.25]} />
      </mesh>
      {/* la lanterne : socle et chapeau de rotin, verre, bougie, anse */}
      <group position={[-1.35, 0, 2.6]}>
        <Part geo={cyl(0.13, 0.15, 0.06, 16)} m={B.rattan} p={[0, 0.03, 0]} />
        <mesh geometry={cyl(0.11, 0.11, 0.3, 18)} position={[0, 0.21, 0]}>
          <meshPhysicalMaterial color={0xfff0d8} transparent opacity={0.28} roughness={0.08} clearcoat={1} depthWrite={false} />
        </mesh>
        <Part geo={cyl(0.06, 0.14, 0.09, 16)} m={B.rattan} p={[0, 0.4, 0]} />
        <Part m={B.rope} p={[0, 0.46, 0]} castShadow={false}>
          <torusGeometry args={[0.06, 0.008, 6, 16, Math.PI]} />
        </Part>
        <Candle position={[0, 0.06, 0]} height={0.13} radius={0.04} />
      </group>
      {/* le panier : un plaid corail et une serviette rayée, roulés */}
      <group position={[0.25, 0, 2.85]} rotation-y={0.4}>
        <Part geo={cyl(0.24, 0.2, 0.34, 20)} m={B.rattan} p={[0, 0.17, 0]} />
        <Part geo={cyl(0.08, 0.08, 0.42, 16)} m={B.throwKnit} p={[-0.06, 0.38, 0]} rotation-z={0.35} />
        <Part geo={cyl(0.07, 0.07, 0.4, 16)} m={B.linen} p={[0.08, 0.36, 0.04]} rotation={[0.2, 0, -0.3]} />
      </group>
    </>
  )
}
