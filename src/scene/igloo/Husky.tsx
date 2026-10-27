import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { Part, SPH, cyl, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { reduceMotion } from '../anim'
import { I } from './materials'

/**
 * Le chien de traîneau, un husky gris et blanc, roulé en boule sur la peau de renne. Un dos plus sombre (la « selle »), le plastron
 * et le ventre blancs, la cuisse arrière ramenée, les deux pattes avant repliées devant lui, la queue en panache enroulée autour, son
 * bout blanc ; la tête posée sur les pattes : le masque blanc et ses deux taches au-dessus des yeux, les yeux fermés, le museau, la
 * truffe, les oreilles dressées à l'intérieur rose, le collier rouge et sa médaille. Il dort : ses flancs montent et descendent
 * lentement. Il ne fait pas de son (on ne joue pas de respiration : voir le skill room-objects).
 */
export function Husky({ position, ry = 0 }: { position: V3; ry?: number }) {
  const body = useRef<Group>(null!), ph = useRef(0)
  useFrame((_, delta) => {
    if (!reduceMotion) ph.current += Math.min(delta, 0.05) * 1.3
    body.current.scale.set(1, 1 + Math.sin(ph.current) * 0.035, 1 + Math.sin(ph.current) * 0.02)
  })
  return (
    <group position={position} rotation-y={ry} userData={LIVE}>
      <group ref={body}>
        <Static>
          {/* le corps roulé, la selle plus sombre sur le dos, le ventre et le plastron blancs */}
          <Part geo={SPH} m={I.husky} scale={[0.42, 0.22, 0.3]} p={[0, 0.2, 0]} />
          <Part geo={SPH} m={I.huskyDark} scale={[0.32, 0.12, 0.22]} p={[-0.06, 0.3, -0.04]} castShadow={false} />
          <Part geo={SPH} m={I.huskyLight} scale={[0.36, 0.16, 0.26]} p={[0.05, 0.15, 0.07]} />
          {/* la cuisse arrière, ramenée contre le flanc, et sa patte blanche */}
          <Part geo={SPH} m={I.husky} scale={[0.16, 0.13, 0.12]} p={[-0.24, 0.17, 0.16]} />
          <Part geo={SPH} m={I.huskyLight} scale={[0.09, 0.045, 0.06]} p={[-0.14, 0.05, 0.25]} castShadow={false} />
        </Static>
      </group>
      <Static>
        {/* la queue en panache, enroulée devant, et son bout blanc */}
        <Part geo={SPH} m={I.husky} scale={[0.3, 0.09, 0.11]} p={[0.04, 0.11, 0.3]} rotation-y={0.25} />
        <Part geo={SPH} m={I.huskyDark} scale={[0.22, 0.05, 0.08]} p={[0.0, 0.17, 0.3]} rotation-y={0.25} castShadow={false} />
        <Part geo={SPH} m={I.huskyLight} scale={[0.11, 0.075, 0.085]} p={[0.32, 0.11, 0.24]} />
        {/* les deux pattes avant repliées, où la tête se pose */}
        {[0.06, 0.15].map((z) => (
          <Part key={z} geo={SPH} m={I.huskyLight} scale={[0.14, 0.045, 0.05]} p={[0.42, 0.05, z]} rotation-y={-0.3} />
        ))}
      </Static>
      {/* la tête posée sur les pattes */}
      <group position={[0.38, 0.2, 0.12]} rotation-y={-0.5}>
        <Static>
          <Part geo={SPH} m={I.husky} scale={[0.15, 0.13, 0.14]} />
          {/* le masque blanc : les joues, le front entre les yeux, les deux taches au-dessus des yeux */}
          <Part geo={SPH} m={I.huskyLight} scale={[0.12, 0.09, 0.12]} p={[0.04, -0.04, 0.0]} />
          <Part geo={SPH} m={I.huskyLight} scale={[0.07, 0.05, 0.03]} p={[0.1, 0.04, 0]} castShadow={false} />
          {/* le museau, la truffe, la bouche */}
          <Part geo={SPH} m={I.huskyLight} scale={[0.1, 0.06, 0.065]} p={[0.15, -0.06, 0.0]} />
          <Part geo={SPH} m={I.nose} scale={[0.026, 0.02, 0.03]} p={[0.245, -0.04, 0]} castShadow={false} />
          <Part geo={cyl(0.004, 0.004, 0.06, 4)} m={I.huskyDark} p={[0.21, -0.085, 0]} rotation-x={Math.PI / 2} castShadow={false} />
          {[-1, 1].map((s) => (
            <group key={s}>
              {/* l'œil fermé, la tache blanche au-dessus */}
              <Part geo={SPH} m={I.huskyDark} scale={[0.026, 0.008, 0.014]} p={[0.122, 0.015, s * 0.06]} rotation-y={s * 0.35} castShadow={false} />
              <Part geo={SPH} m={I.huskyLight} scale={[0.02, 0.012, 0.018]} p={[0.1, 0.055, s * 0.05]} castShadow={false} />
              {/* l'oreille dressée et son intérieur rose */}
              <Part m={I.husky} p={[-0.02, 0.15, s * 0.07]} rotation={[s * 0.25, 0, -0.15]}>
                <coneGeometry args={[0.052, 0.12, 12]} />
              </Part>
              <Part m={I.earPink} p={[-0.006, 0.145, s * 0.072]} rotation={[s * 0.25, 0, -0.15]} castShadow={false}>
                <coneGeometry args={[0.026, 0.075, 10]} />
              </Part>
            </group>
          ))}
          {/* le collier autour du cou (un anneau autour de l'axe tête-corps, juste derrière la tête) et sa médaille, côté caméra */}
          <Part m={I.collar} p={[-0.11, -0.05, 0]} rotation-y={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.1, 0.017, 8, 28]} />
          </Part>
          <Part geo={cyl(0.026, 0.026, 0.007, 16)} m={I.brass} p={[-0.105, -0.13, 0.085]} rotation-x={(3 * Math.PI) / 4} castShadow={false} />
        </Static>
      </group>
    </group>
  )
}
