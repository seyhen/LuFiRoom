import { ExtrudeGeometry, Path, Shape } from 'three'
import { Part, cyl, rbox, rrPath } from '../parts'
import { Static } from '../Static'
import { A } from './materials'
import { EXIT_DOOR, IN } from './layout'

const W = EXIT_DOOR.x1 - EXIT_DOOR.x0, CX = (EXIT_DOOR.x0 + EXIT_DOOR.x1) / 2, H = EXIT_DOOR.h
const win = EXIT_DOOR.win

/** Le vantail : un rectangle arrondi plein, avec le trou du hublot ; les UV vont de 0 à 1 sur toute la porte (la texture est dessinée à sa taille). */
const LEAF = (() => {
  const s = rrPath(new Shape(), -W / 2, 0, W, H, 0.16)
  s.holes.push(rrPath(new Path(), win.x - CX - win.w / 2, win.y0, win.w, win.y1 - win.y0, win.w / 2 - 0.02))
  const g = new ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 12 })
  const uv = g.attributes.uv, p = g.attributes.position
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) + W / 2) / W, p.getY(i) / H)
  return g
})()

/**
 * La porte de secours du bout du flanc : un vantail ivoire à bords arrondis, son petit hublot, la plaque rouge de la poignée avec son levier,
 * le bandeau d'avertissement et le voyant de l'écriteau « sortie » (qu'on voit de loin). Elle ferme l'avant du couloir contre le flanc.
 */
export function ExitDoor() {
  return (
    <Static>
      <group position={[CX, 0, IN]}>
        <mesh geometry={LEAF} material={A.door} castShadow receiveShadow />
        {/* le levier de la poignée : un manche d'aluminium sur la plaque rouge, avec sa goupille */}
        <Part geo={rbox(0.3, 0.06, 0.05, 0.02)} m={A.aluminium} p={[0, 1.07, 0.1]} />
        <Part geo={cyl(0.03, 0.03, 0.05, 14)} m={A.aluminium} p={[-0.1, 1.07, 0.08]} rotation-x={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.01, 0.01, 0.07, 8)} m={A.buckle} p={[0.18, 1.07, 0.12]} castShadow={false} />
        {/* les gonds et le joint : deux bandes d'aluminium sur le côté */}
        {[0.5, 1.5, 2.4].map((y) => <Part key={y} geo={rbox(0.05, 0.16, 0.012, 0.005)} m={A.aluminium} p={[W / 2 - 0.04, y, 0.075]} castShadow={false} />)}
      </group>
      {/* l'écriteau de sortie, sur le flanc à côté de la porte */}
      <mesh material={A.exit} position={[EXIT_DOOR.x0 - 0.22, 2.55, IN + 0.012]}>
        <planeGeometry args={[0.28, 0.28]} />
      </mesh>
    </Static>
  )
}
