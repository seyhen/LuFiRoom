import { ExtrudeGeometry, Shape } from 'three'
import { M } from '../materials'
import { Part, cyl, rbox, worldUV } from '../parts'
import { C } from './materials'

// Le plaid jeté sur le dossier (repère du fauteuil : le dossier va de z = 0,21 à 0,47, son dessus est à y = 1,15). Sa section est
// une bande de 3 cm qui suit le dossier : elle monte devant, s'arrondit par-dessus en gardant un pli, et retombe derrière plus bas.
// La section est extrudée sur la largeur du plaid (x), avec un biseau pour des bords doux.
const PLAID = (() => {
  // la ligne médiane du tissu (z, y), de l'avant (bas) vers l'arrière (bas)
  const mid: [number, number][] = [[0.185, 0.92], [0.19, 1.04], [0.2, 1.13], [0.25, 1.185], [0.33, 1.2], [0.41, 1.19], [0.47, 1.15], [0.505, 1.06], [0.515, 0.9], [0.51, 0.72], [0.52, 0.6]]
  const th = 0.013, top: [number, number][] = [], bot: [number, number][] = []
  mid.forEach(([z, y], i) => {
    const [z0, y0] = mid[Math.max(0, i - 1)], [z1, y1] = mid[Math.min(mid.length - 1, i + 1)]
    const tz = z1 - z0, ty = y1 - y0, l = Math.hypot(tz, ty)
    const nz = ty / l, ny = -tz / l // la normale qui pointe vers le dossier
    top.push([z - nz * th, y - ny * th])
    bot.push([z + nz * th, y + ny * th])
  })
  const s = new Shape()
  s.moveTo(top[0][0], top[0][1])
  top.slice(1).forEach(([z, y]) => s.lineTo(z, y))
  bot.reverse().forEach(([z, y]) => s.lineTo(z, y))
  s.closePath()
  const g = new ExtrudeGeometry(s, { depth: 0.6, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.01, bevelSegments: 2, curveSegments: 4 })
  // la forme est dans le plan (z, y) : on la couche pour que l'extrusion suive x, centrée
  g.rotateY(-Math.PI / 2)
  g.translate(0.3, 0, 0)
  // des plis : la partie qui pend ondule sur la largeur (plus le tissu descend, plus le pli se creuse), l'ourlet n'est pas droit
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), k = Math.max(0, Math.min(1, (1.1 - y) / 0.45))
    if (z > 0.45) p.setXYZ(i, x, y + 0.012 * k * Math.cos(x * 9), z + 0.024 * k * (0.5 + 0.5 * Math.sin(x * 16 + 0.6)))
  }
  g.computeVertexNormals()
  return worldUV(g, 0.5)
})()

/** Fauteuil canneberge tourné vers la cheminée : plaid écossais sur le dossier (côté pièce), coussin en tricot. */
export function Armchair() {
  return (
    <group position={[0.55, 0, -0.15]} rotation-y={Math.PI / 4} scale={1.15}>
      {[[-0.34, -0.3], [0.34, -0.3], [-0.34, 0.3], [0.34, 0.3]].map(([x, z]) => (
        <Part key={`${x}${z}`} geo={cyl(0.05, 0.04, 0.2, 10)} m={M.toffee} p={[x, 0.1, z]} />
      ))}
      <Part geo={rbox(1.0, 0.3, 0.94, 0.12)} m={C.cranberry} p={[0, 0.33, 0]} />
      <Part geo={rbox(0.86, 0.14, 0.78, 0.07)} m={C.cranberryLight} p={[0, 0.54, -0.03]} />
      <Part geo={rbox(1.0, 0.78, 0.26, 0.12)} m={C.cranberry} p={[0, 0.76, 0.34]} />
      {[-0.5, 0.5].map((x) => (
        <Part key={x} geo={rbox(0.2, 0.46, 0.94, 0.09)} m={C.cranberry} p={[x, 0.56, 0]} />
      ))}
      <Part geo={worldUV(rbox(0.42, 0.34, 0.14, 0.07), 0.4)} m={C.knit} p={[-0.22, 0.78, 0.2]} rotation-z={0.2} />
      {/* plaid jeté sur le dossier : il épouse le dessus et retombe derrière, avec ses franges */}
      <group position={[0.12, 0, 0]} rotation-z={0.04}>
        <Part geo={PLAID} m={C.tartan} />
        {Array.from({ length: 9 }, (_, i) => (
          <Part key={i} geo={cyl(0.008, 0.006, 0.05, 5)} m={C.cranberryLight} p={[-0.27 + i * 0.0675, 0.575, 0.52]} castShadow={false} />
        ))}
      </group>
    </group>
  )
}
