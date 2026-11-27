import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PlaneGeometry, TorusGeometry, type Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach } from '../../math'
import { M } from '../materials'
import { Batch, Part, SPH, cyl, type Item } from '../parts'
import { reduceMotion } from '../anim'
import { B } from './materials'

// Deux rideaux de chaque côté de la fenêtre, tenus par des embrasses : plis, tringle, anneaux. Ils ondulent quand la fenêtre est ouverte
// et un peu quand le ventilo souffle.
const TOP = 3.95, H = 1.75, PINCH = 2.85, NX = 44, NY = 16
const Z = -2.955
// x0 : bord extérieur ; dir : vers l'intérieur (+1 vers la droite) ; w : largeur au repos.
const PANELS = [{ x0: -0.5, dir: 1, w: 0.68, mat: B.curtain }, { x0: 3.17, dir: -1, w: 0.6, mat: B.curtain }]
const ring = new TorusGeometry(0.045, 0.01, 6, 14)
const RINGS: Item[] = PANELS.flatMap(({ x0, dir, w }) => Array.from({ length: 7 }, (_, i): Item => ({ p: [x0 + dir * ((i + 0.5) / 7) * w, TOP + 0.01, -2.93], s: 1, r: [0, Math.PI / 2, 0] })))

function panelGeo(w: number, dir: number, x0: number) {
  const g = new PlaneGeometry(1, 1, NX, NY), p = g.attributes.position
  const base = new Float32Array(p.count * 3)
  for (let k = 0; k < p.count; k++) {
    const u = p.getX(k) + 0.5, v = 0.5 - p.getY(k) // u : 0 au bord extérieur → 1 vers la fenêtre ; v : 0 en haut → 1 en bas
    const y = TOP - v * H
    const pinch = 1 - 0.4 * Math.exp(-(((y - PINCH) / 0.14) ** 2))
    const x = x0 + dir * u * w * pinch * (1 + 0.12 * v)
    const z = Z + (0.02 + 0.026 * v) * Math.sin(u * 4.2 * TAU) * (1 + 0.5 * Math.exp(-(((y - PINCH) / 0.2) ** 2)))
    p.setXYZ(k, x, y, z)
    base.set([x, y, z], k * 3)
  }
  g.computeVertexNormals()
  return { g, base }
}

/** La tringle, les anneaux, les deux rideaux et leurs embrasses. */
export function Curtains() {
  const meshes = useRef<(Mesh | null)[]>([])
  const panels = useMemo(() => PANELS.map(({ w, dir, x0 }) => panelGeo(w, dir, x0)), [])
  const sway = useRef(0)
  useFrame(({ clock }, delta) => {
    const s = useStore.getState(), t = clock.elapsedTime
    const target = reduceMotion ? 0 : (isActive(s, 'window') ? 0.1 : 0) + (isActive(s, 'fan') ? 0.03 : 0)
    const before = sway.current
    sway.current = approach(before, target, Math.min(delta, 0.05) * 0.12)
    if (sway.current < 1e-4 && before < 1e-4) return
    panels.forEach(({ g, base }, i) => {
      const p = g.attributes.position
      for (let k = 0; k < p.count; k++) {
        const y = base[k * 3 + 1], v = (TOP - y) / H, a = sway.current * v * v
        p.setZ(k, base[k * 3 + 2] + a * (Math.sin(t * 1.7 + base[k * 3] * 2.2 + i) + 0.6 * Math.sin(t * 2.9 + y * 3)))
        p.setX(k, base[k * 3] + a * 0.35 * Math.sin(t * 1.3 + y * 2))
      }
      p.needsUpdate = true
      g.computeVertexNormals()
    })
  })
  return (
    <>
      <Part geo={cyl(0.022, 0.022, 3.85, 10)} m={M.plum} p={[1.42, TOP + 0.04, -2.93]} rotation-z={Math.PI / 2} castShadow={false} />
      {[-0.5, 3.35].map((x) => (
        <Part key={x} geo={SPH} m={M.butter} scale={0.05} p={[x, TOP + 0.04, -2.93]} castShadow={false} />
      ))}
      <Batch geo={ring} m={M.plum} items={RINGS} />
      {panels.map(({ g }, i) => (
        <mesh key={i} ref={(m) => void (meshes.current[i] = m)} geometry={g} material={PANELS[i].mat} castShadow />
      ))}
      {/* embrasses : un lien crème et une boule beurre, à la hauteur du pincement */}
      {PANELS.map(({ x0, dir }, i) => (
        <group key={i}>
          <Part geo={SPH} m={M.butter} scale={0.045} p={[x0 + dir * 0.26, PINCH - 0.03, -2.9]} castShadow={false} />
          <Part geo={SPH} m={M.cream} scale={[0.05, 0.015, 0.05]} p={[x0 + dir * 0.26, PINCH + 0.015, -2.92]} castShadow={false} />
        </group>
      ))}
    </>
  )
}
