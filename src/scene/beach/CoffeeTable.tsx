import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { PointLight } from 'three'
import { smooth } from '../../math'
import { mood } from '../anim'
import { Part, SPH, cyl, rbox } from '../parts'
import { Candle } from '../objects/Candle'
import { B } from './materials'

/** Une citronnade dans un grand verre, sa paille et sa rondelle. */
function Lemonade({ p }: { p: [number, number, number] }) {
  const [x, y, z] = p
  return (
    <>
      <Part geo={cyl(0.045, 0.04, 0.15, 16)} m={B.lemonade} p={[x, y + 0.075, z]} castShadow={false} />
      <Part geo={cyl(0.05, 0.045, 0.17, 16)} m={B.glass} p={[x, y + 0.085, z]} castShadow={false} />
      <Part geo={cyl(0.006, 0.006, 0.2, 6)} m={B.coral} p={[x + 0.015, y + 0.2, z]} rotation-z={-0.25} castShadow={false} />
      <Part geo={cyl(0.03, 0.03, 0.008, 14)} m={B.butter} p={[x - 0.04, y + 0.16, z]} rotation-z={1.2} castShadow={false} />
    </>
  )
}

/** Tapis de jute rond, table basse en bois flotté : un bol de coquillages, deux citronnades, un livre, une bougie. */
export function CoffeeTable() {
  return (
    <>
      <mesh material={B.jute} position={[0.35, 0.012, 0.05]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[1.3, 48]} />
      </mesh>
      <group position={[0.35, 0, 0.05]}>
        <Part geo={cyl(0.56, 0.6, 0.08, 32)} m={B.driftwood} p={[0, 0.36, 0]} scale={[1, 1, 0.68]} />
        {[[-0.32, -0.18], [0.32, -0.18], [-0.3, 0.2], [0.3, 0.2]].map(([x, z]) => (
          <Part key={`${x}${z}`} geo={cyl(0.05, 0.06, 0.34, 8)} m={B.driftwood} p={[x, 0.17, z]} rotation={[z * 0.3, 0, -x * 0.25]} />
        ))}
        {/* le bol de coquillages */}
        <Part geo={cyl(0.17, 0.11, 0.08, 22)} m={B.turquoise} p={[-0.18, 0.44, -0.05]} />
        {[[-0.22, -0.06, B.shell], [-0.13, -0.02, B.shellPink], [-0.18, -0.11, B.shell], [-0.2, 0.02, B.coral]].map(([x, z, m], i) => (
          <Part key={i} geo={SPH} m={m as typeof B.shell} scale={[0.05, 0.03, 0.04]} p={[x as number, 0.49, z as number]} rotation-y={i} castShadow={false} />
        ))}
        <Candle position={[-0.38, 0.4, 0.12]} holder="jar" height={0.1} radius={0.035} />
        <Lemonade p={[0.18, 0.4, -0.12]} />
        <Lemonade p={[0.3, 0.4, 0.06]} />
        {/* le livre, et des lunettes de soleil posées dessus */}
        <Part geo={rbox(0.26, 0.04, 0.19, 0.01)} m={B.navy} p={[0.02, 0.42, 0.14]} rotation-y={0.35} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={cyl(0.04, 0.04, 0.012, 16)} m={B.ink} p={[0.02 + s * 0.045, 0.45, 0.14 - s * 0.016]} castShadow={false} />
        ))}
      </group>
      <CandleGlow />
      {/* un pouf corail, un gros coussin de sol */}
      <Part geo={cyl(0.28, 0.3, 0.34, 24)} m={B.coral} p={[0.2, 0.17, 1.6]} />
      <Part geo={rbox(0.62, 0.16, 0.62, 0.08)} m={B.seaglass} p={[-0.75, 0.08, 1.0]} rotation-y={0.4} />
      <Part geo={rbox(0.5, 0.12, 0.5, 0.06)} m={B.stripeNavy} p={[-0.72, 0.21, 0.98]} rotation-y={0.25} />
    </>
  )
}

/** La lueur des bougies sur la table basse, le soir : une flaque de lumière dorée au milieu de la pièce. */
function CandleGlow() {
  const l = useRef<PointLight>(null!)
  useFrame(({ clock }) => void (l.current.intensity = smooth(mood.night) * (1.1 + Math.sin(clock.elapsedTime * 7) * 0.06) * Math.PI)) // × π : voir materials.ts
  return <pointLight ref={l} color={0xffb36a} intensity={0} distance={6.5} decay={1.4} position={[0.1, 0.9, 0.15]} />
}
