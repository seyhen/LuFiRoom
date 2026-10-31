import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { PointLight } from 'three'
import { smooth } from '../../math'
import { mood } from '../anim'
import { worldUV, Part, cyl, rbox } from '../parts'
import { Candle } from '../objects/Candle'
import { B } from './materials'
import { Vessel, innerR } from '../igloo/Vessel'
import { Scallop, Whelk } from './Corner'

/** Une citronnade dans un grand verre, sa paille et sa rondelle. */
function Lemonade({ p }: { p: [number, number, number] }) {
  const [x, y, z] = p
  return (
    <>
      {/* le verre est ouvert : la citronnade s'arrête sous le bord, deux glaçons flottent dessus */}
      <Vessel p={[x, y, z]} rt={0.05} rb={0.045} h={0.17} m={B.glass} inner={B.glassIn} t={0.004} />
      <Part geo={cyl(innerR(0.05, 0.045, 0.17, 0.13, 0.004), innerR(0.05, 0.045, 0.17, 0, 0.004), 0.125, 16)} m={B.lemonade} p={[x, y + 0.0675, z]} castShadow={false} />
      {[[-0.015, 0.01], [0.018, -0.012]].map(([dx, dz], i) => (
        <Part key={i} geo={rbox(0.025, 0.02, 0.025, 0.006)} m={B.glass} p={[x + dx, y + 0.13, z + dz]} rotation-y={i} castShadow={false} />
      ))}
      <Part geo={cyl(0.006, 0.006, 0.22, 6)} m={B.coral} p={[x + 0.015, y + 0.17, z]} rotation-z={-0.25} castShadow={false} />
      <Part geo={cyl(0.03, 0.03, 0.008, 14)} m={B.butter} p={[x - 0.05, y + 0.165, z]} rotation-z={1.2} castShadow={false} />
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
          <Part key={`${x}${z}`} geo={cyl(0.05, 0.06, 0.34, 8)} m={B.driftwood} p={[x, 0.17, z]} rotation={[-z * 0.3, 0, x * 0.25]} />
        ))}
        {/* le bol de coquillages */}
        <Vessel p={[-0.18, 0.4, -0.05]} rt={0.17} rb={0.11} h={0.08} m={B.turquoise} inner={B.turquoise} t={0.012} />
        <Part geo={cyl(0.1, 0.1, 0.012, 20)} m={B.sand} p={[-0.18, 0.418, -0.05]} castShadow={false} />
        <Scallop p={[-0.24, 0.425, -0.06]} rot={0.6} />
        <Scallop p={[-0.12, 0.43, -0.03]} m={B.shellPink} s={0.9} rot={-0.8} />
        <Whelk p={[-0.17, 0.445, -0.13]} rot={1.2} />
        <Scallop p={[-0.17, 0.43, 0.04]} m={B.shellPink} s={0.8} rot={2.4} />
        <Candle position={[-0.38, 0.4, 0.12]} holder="jar" height={0.1} radius={0.035} />
        <Lemonade p={[0.18, 0.4, -0.12]} />
        <Lemonade p={[0.3, 0.4, 0.06]} />
        {/* le livre, et des lunettes de soleil posées dessus */}
        <Part geo={rbox(0.26, 0.04, 0.19, 0.01)} m={B.navy} p={[0.02, 0.42, 0.14]} rotation-y={0.35} />
        {/* les lunettes de soleil : deux verres, le pont, les deux branches repliées dessous */}
        <group position={[0.02, 0.452, 0.14]} rotation-y={0.35}>
          {[-1, 1].map((s) => (
            <group key={s}>
              <Part geo={cyl(0.038, 0.038, 0.01, 18)} m={B.ink} p={[s * 0.045, 0, 0]} scale={[1, 1, 0.85]} castShadow={false} />
              <Part m={B.coral} p={[s * 0.045, 0.002, 0]} rotation-x={Math.PI / 2} scale={[1, 0.85, 1]} castShadow={false}>
                <torusGeometry args={[0.039, 0.005, 5, 18]} />
              </Part>
              <Part geo={rbox(0.008, 0.006, 0.075, 0.003)} m={B.coral} p={[s * 0.07, 0.012, -0.035]} rotation-y={-s * 0.5} castShadow={false} />
            </group>
          ))}
          <Part m={B.coral} p={[0, 0.006, -0.012]} castShadow={false}>
            <torusGeometry args={[0.012, 0.004, 5, 10, Math.PI]} />
          </Part>
        </group>
      </group>
      <CandleGlow />
      {/* un pouf corail, un gros coussin de sol */}
      <Part geo={cyl(0.28, 0.3, 0.34, 24)} m={B.coral} p={[0.2, 0.17, 1.6]} />
      <Part geo={rbox(0.62, 0.16, 0.62, 0.08)} m={B.seaglass} p={[-0.75, 0.08, 1.0]} rotation-y={0.4} />
      <Part geo={worldUV(rbox(0.5, 0.12, 0.5, 0.06), 0.6)} m={B.stripeNavy} p={[-0.72, 0.21, 0.98]} rotation-y={0.25} />
    </>
  )
}

/** La lueur des bougies sur la table basse, le soir : une flaque de lumière dorée au milieu de la pièce. */
function CandleGlow() {
  const l = useRef<PointLight>(null!)
  useFrame(({ clock }) => void (l.current.intensity = smooth(mood.night) * (1.1 + Math.sin(clock.elapsedTime * 7) * 0.06) * Math.PI)) // × π : voir materials.ts
  return <pointLight ref={l} color={0xffb36a} intensity={0} distance={6.5} decay={1.4} position={[0.1, 0.9, 0.15]} />
}
