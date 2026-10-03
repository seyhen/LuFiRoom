import { Batch, Part, cyl, type Item, type V3 } from '../parts'
import { C } from './materials'

// Entre la cheminée et le coffre, sous la couronne. Bûches debout : x, z, inclinaisons.
const LOGS = [
  [-0.1, -0.06, 0.12, 0.18],
  [0.09, -0.1, -0.1, -0.15],
  [0, 0.1, 0.2, 0.05],
  [0.14, 0.08, 0.05, -0.28],
]
const R = 0.075, HALF = 0.36
// Écorce, puis le bout du haut en bois clair (une rondelle posée au bout de chaque bûche, suivant son inclinaison).
const BARK: Item[] = LOGS.map(([x, z, rx, rz]) => ({ p: [x, 0.42, z], s: [R, 2 * HALF, R], r: [rx, 0, rz] }))
const ENDS: Item[] = LOGS.map(([x, z, rx, rz]): Item => {
  // l'axe de la bûche, tourné comme elle (rotation X puis Z, ordre XYZ de three) : (0, 1, 0) → ...
  const ax: V3 = [-Math.sin(rz), Math.cos(rz) * Math.cos(rx), Math.cos(rz) * Math.sin(rx)]
  return { p: [x + ax[0] * HALF, 0.42 + ax[1] * HALF, z + ax[2] * HALF], s: [R * 0.92, 0.012, R * 0.92], r: [rx, 0, rz] }
})

/** Panier en osier plein de bûches, à côté du feu. */
export function LogBasket() {
  return (
    <group position={[-0.28, 0, -2.52]}>
      {/* le dessus sombre fait l'intérieur du panier */}
      <mesh geometry={cyl(0.36, 0.3, 0.4, 28)} material={[C.wicker, C.soot, C.wicker]} position={[0, 0.2, 0]} castShadow receiveShadow />
      <Part m={C.beam} p={[0, 0.4, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.36, 0.035, 8, 32]} />
      </Part>
      <Batch geo={cyl(1, 1, 1, 14)} m={C.log} items={BARK} shadow />
      <Batch geo={cyl(1, 1, 1, 14)} m={C.cut} items={ENDS} />
    </group>
  )
}
