import { LatheGeometry, SphereGeometry, Vector2 } from 'three'
import { Foliage } from '../../nature/Foliage'
import { Part, rbox, cyl, type V3 } from '../../parts'
import { S } from './layout'
import { K } from './materials'

// L'îlot du village : la colline lilas aux maisons rondes que la fenêtre montre au loin, ici posée sur un nuage, plus près.
const lathe = (pts: [number, number][], seg = 28) => new LatheGeometry(pts.map(([r, y]) => new Vector2(r, y)), seg)
// le dessus : un dôme doux
const DOME = lathe([[1.7, -0.02], ...Array.from({ length: 12 }, (_, i) => {
  const a = ((11 - i) / 12) * (Math.PI / 2)
  return [Math.sin(a) * 1.7, Math.cos(a) ** 0.9 * 0.95 - 0.02] as [number, number]
})])
// le dessous : un rocher de nuage qui s'effile en goutte
const UNDER = lathe([[0.001, -1.95], [0.22, -1.88], [0.45, -1.66], [0.75, -1.3], [1.1, -0.95], [1.42, -0.6], [1.62, -0.3], [1.7, -0.02]])
const roofGeo = new SphereGeometry(1, 16, 11)

const HOUSES: { p: V3; ry: number; w: number; h: number; roof: 'rose' | 'mint' }[] = [
  { p: [-0.6, 0.78, 0.1], ry: 0.15, w: 0.66, h: 0.46, roof: 'rose' },
  { p: [0.5, 0.78, -0.3], ry: -0.25, w: 0.58, h: 0.4, roof: 'mint' },
  { p: [0.6, 0.6, 0.85], ry: 0.3, w: 0.5, h: 0.36, roof: 'rose' },
]

/** Le dehors de la fenêtre, en volume : colline, trois maisons aux toits ronds, trois arbres au feuillage taillé. Les fenêtres brillent la nuit. */
export function Islet() {
  return (
    <group position={S(7.4, 0.5, -1.5)} rotation-y={0.2} scale={1.05}>
      <Part geo={DOME} m={K.hill} castShadow={false} />
      <Part geo={UNDER} m={K.under} castShadow={false} />
      {HOUSES.map((h, i) => (
        <group key={i} position={h.p} rotation-y={h.ry}>
          <Part geo={rbox(h.w, h.h, h.w * 0.85, 0.07, 2)} m={K.wall} p={[0, h.h / 2 - 0.04, 0]} castShadow={false} />
          {/* le toit rond qui déborde, et sa cheminée */}
          <Part geo={roofGeo} m={h.roof === 'rose' ? K.roofRose : K.roofMint} p={[0, h.h - 0.01, 0]} scale={[h.w * 0.66, h.w * 0.3, h.w * 0.58]} castShadow={false} />
          <Part geo={rbox(0.1, 0.22, 0.1, 0.03, 1)} m={K.door} p={[h.w * 0.22, h.h + h.w * 0.2, -0.02]} castShadow={false} />
          <Part geo={rbox(0.13, 0.04, 0.13, 0.015, 1)} m={K.wall} p={[h.w * 0.22, h.h + h.w * 0.2 + 0.12, -0.02]} castShadow={false} />
          {/* la porte et la fenêtre sur la face +z, une fenêtre sur la face +x */}
          <Part geo={rbox(0.09, 0.15, 0.03, 0.02, 1)} m={K.door} p={[-h.w * 0.22, 0.07, h.w * 0.43]} castShadow={false} />
          <Part geo={rbox(0.1, 0.1, 0.03, 0.02, 1)} m={K.win} p={[h.w * 0.2, h.h * 0.6, h.w * 0.43]} castShadow={false} />
          <Part geo={rbox(0.03, 0.1, 0.1, 0.02, 1)} m={K.win} p={[h.w / 2 + 0.005, h.h * 0.6, 0]} castShadow={false} />
        </group>
      ))}
      {[[-0.05, 0.9, -0.75, 0.34], [-1.1, 0.5, -0.5, 0.26], [-0.2, 0.72, 0.9, 0.24]].map(([x, y, z, r], i) => (
        <group key={i} position={[x, y, z]}>
          <Part geo={cyl(0.03, 0.045, 0.22, 7)} m={K.trunk} p={[0, 0.06, 0]} castShadow={false} />
          {/* un houppier taillé en boule, et une touffe plus petite à côté (jamais une sphère lisse) */}
          <Foliage v={i * 2} p={[0, 0.1, 0]} s={[r, r * 1.6, r]} m={K.leaf} style="clipped" shadow={false} ry={i} />
          <Foliage v={i * 2 + 1} p={[r * 0.6, 0.02, r * 0.25]} s={[r * 0.55, r * 0.8, r * 0.55]} m={K.leaf} style="clipped" shadow={false} />
        </group>
      ))}
    </group>
  )
}
