import { useRef } from 'react'
import { ExtrudeGeometry, Path, Shape, type Group } from 'three'
import { useSquash } from '../anim'
import { usePainted } from '../paint'
import { Part, noRay, rbox, rrPath } from '../parts'
import { Static } from '../Static'
import { A } from './materials'
import { EXIT_DOOR, IN, PORTS } from './layout'
import { paintView } from './view'

const PW = PORTS[0].w, PH = PORTS[0].y1 - PORTS[0].y0, PY = (PORTS[0].y0 + PORTS[0].y1) / 2

/** Le cadre intérieur : un anneau de plastique ivoire de 10 cm de large qui avance de 7 cm dans la cabine. */
function ring(w: number, h: number) {
  const s = rrPath(new Shape(), -w / 2 - 0.1, -h / 2 - 0.1, w + 0.2, h + 0.2, w / 2 + 0.08)
  s.holes.push(rrPath(new Path(), -w / 2, -h / 2, w, h, w / 2 - 0.02))
  return new ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 14 })
}
const RING = ring(PW, PH)

/** Un hublot : le cadre, la vitre intérieure, le store à moitié baissé (ou non), la vue peinte derrière. `drop` : la part du hublot que le store cache. */
function Port({ x, drop, tex, group, id }: { x: number; drop: number; tex: ReturnType<typeof usePainted>; group?: React.RefObject<Group>; id?: boolean }) {
  const shadeH = PH * drop
  return (
    <group ref={group} userData={id ? { id: 'porthole' } : undefined} position={[x, PY, IN]}>
      <Static>
        <Part geo={RING} m={A.reveal} castShadow={false} />
        {/* le store : une plaque qui coulisse depuis le haut, sa poignée creuse en bas */}
        {drop > 0 && (
          <>
            <Part geo={rbox(PW - 0.03, shadeH, 0.022, 0.01)} m={A.shade} p={[0, PH / 2 - shadeH / 2, -0.055]} castShadow={false} />
            <Part geo={rbox(0.14, 0.028, 0.03, 0.01)} m={A.binDark} p={[0, PH / 2 - shadeH - 0.002, -0.04]} castShadow={false} />
          </>
        )}
      </Static>
      {/* la vitre : on la devine à peine, elle a juste un reflet */}
      <mesh material={A.glass} position={[0, 0, -0.1]} raycast={noRay}>
        <planeGeometry args={[PW, PH]} />
      </mesh>
      {/* la vue : un grand plan derrière le mur (ce qu'on voit au travers glisse vers le haut et la droite, d'où le décalage) */}
      <mesh position={[-0.28, -0.3, -0.5]} raycast={noRay}>
        <planeGeometry args={[PW + 1.1, PH + 0.9]} />
        <meshBasicMaterial map={tex} />
      </mesh>
    </group>
  )
}

/**
 * Les hublots du flanc : celui de la rangée 1 (au-dessus du dormeur, store à moitié baissé) est l'objet « hublot » ; celui de la rangée 2
 * est ouvert sur l'aurore. Le petit hublot de la porte de secours montre la même vue. Les vues suivent le jour, la nuit et la météo.
 */
export function Hublots() {
  const g = useRef<Group>(null!)
  useSquash('porthole', g)
  const t0 = usePainted(150, 215, (x, n, r, w) => paintView(x, 150, 215, n, r, w, 0, 11))
  const t1 = usePainted(150, 215, (x, n, r, w) => paintView(x, 150, 215, n, r, w, 1, 23))
  const ew = EXIT_DOOR.win
  return (
    <>
      <Port x={PORTS[0].x} drop={0.42} tex={t0} group={g} id />
      <Port x={PORTS[1].x} drop={0} tex={t1} />
      {/* le hublot de la porte : un petit anneau et la même vue */}
      <group position={[ew.x, (ew.y0 + ew.y1) / 2, IN]}>
        <mesh position={[-0.2, -0.2, -0.5]} raycast={noRay}>
          <planeGeometry args={[ew.w + 0.9, ew.y1 - ew.y0 + 0.8]} />
          <meshBasicMaterial map={t1} />
        </mesh>
      </group>
    </>
  )
}

