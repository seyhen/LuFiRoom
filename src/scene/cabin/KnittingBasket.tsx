import { Part, SPH, cyl } from '../parts'
import { C } from './materials'

/**
 * À côté du pouf, le panier à tricot : des pelotes canneberge, crème et sapin, deux aiguilles plantées dedans, et l'écharpe
 * commencée qui pend par-dessus le bord.
 */
export function KnittingBasket() {
  return (
    <group position={[-0.2, 0, 1.6]} rotation-y={0.5}>
      <Part geo={cyl(0.2, 0.16, 0.22, 20)} m={C.wicker} p={[0, 0.11, 0]} />
      <Part m={C.log} p={[0, 0.22, 0]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.2, 0.015, 6, 24]} />
      </Part>
      {([[-0.06, 0.04, C.cranberry], [0.07, -0.03, C.wool], [0.0, -0.08, C.pineLight]] as const).map(([x, z, m], i) => (
        <Part key={i} geo={SPH} m={m} scale={0.08} p={[x, 0.24, z]} />
      ))}
      {[-0.15, 0.2].map((t, i) => (
        <group key={i} position={[0.02 + i * 0.03, 0.3, 0.02]} rotation={[t, 0, -t]}>
          <Part geo={cyl(0.007, 0.007, 0.3, 6)} m={C.log} castShadow={false} />
          <Part geo={SPH} m={C.gold} scale={0.014} p={[0, 0.15, 0]} castShadow={false} />
        </group>
      ))}
      <Part geo={cyl(0.09, 0.09, 0.03, 4)} m={C.knit} p={[0.19, 0.16, 0.04]} rotation={[0, 0.3, 1.45]} scale={[1, 1, 0.35]} castShadow={false} />
    </group>
  )
}
