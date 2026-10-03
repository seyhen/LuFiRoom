import { LatheGeometry, Vector2 } from 'three'
import { Part, SPH } from '../parts'
import { C } from './materials'

// Profil d'un pouf : cylindre aux bords bien ronds (rayon 0.34, hauteur 0.38). Les mailles convergent au centre du dessus.
const R = 0.34, H = 0.38, K = 0.13
const pts = [new Vector2(0.001, 0)]
for (let i = 0; i <= 6; i++) {
  const a = -Math.PI / 2 + (i / 6) * (Math.PI / 2)
  pts.push(new Vector2(R - K + Math.cos(a) * K, K + Math.sin(a) * K))
}
for (let i = 0; i <= 6; i++) {
  const a = (i / 6) * (Math.PI / 2)
  pts.push(new Vector2(R - K + Math.cos(a) * K, H - K + Math.sin(a) * K))
}
pts.push(new Vector2(0.001, H))
const poufGeo = new LatheGeometry(pts, 32)

/** Pouf en grosse maille au bord du tapis. */
export function Pouf() {
  return (
    <group position={[0.75, 0, 0.3]}>
      <Part geo={poufGeo} m={C.knitPouf} />
      <Part geo={SPH} m={C.knit} scale={[0.05, 0.025, 0.05]} p={[0, H, 0]} castShadow={false} />
    </group>
  )
}
