import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ExtrudeGeometry, Path, Shape, type Group, type Material } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, smooth } from '../../math'
import { M } from '../materials'
import { Part, WIN, rbox, rrPath } from '../parts'

// Deux battants à la française, qui s'ouvrent vers l'intérieur.
export const paneW = (WIN.x1 - WIN.x0) / 2 - 0.02
export const paneH = WIN.y1 - WIN.y0 - 0.04
const frameShape = rrPath(new Shape(), 0, 0, paneW, paneH, 0.08)
frameShape.holes.push(rrPath(new Path(), 0.08, 0.08, paneW - 0.16, paneH - 0.16, 0.03))
const frameGeo = new ExtrudeGeometry(frameShape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 6 })

interface Look {
  /** Peinture du cadre. */
  frame?: Material
  /** Vitre de chaque battant, gauche puis droit (une vitre peinte ou embuée, par exemple). */
  glass?: [Material, Material]
  /** Vitrine : une seule traverse haute (l'imposte), pas de montant au milieu. */
  transom?: boolean
}

function Pane({ frame, glass, transom }: { frame: Material; glass: Material; transom?: boolean }) {
  return (
    <>
      <Part geo={frameGeo} m={frame} p={[0, 0, -0.03]} />
      {!transom && <Part geo={rbox(0.05, paneH - 0.16, 0.05, 0.02)} m={frame} p={[paneW / 2, paneH / 2, 0]} />}
      {(transom ? [paneH * 0.7] : [paneH / 3, (2 * paneH) / 3]).map((y) => (
        <Part key={y} geo={rbox(paneW - 0.16, 0.05, 0.05, 0.02)} m={frame} p={[paneW / 2, y, 0]} />
      ))}
      <mesh material={glass} position={[paneW / 2, paneH / 2, 0]}>
        <planeGeometry args={[paneW - 0.16, paneH - 0.16]} />
      </mesh>
    </>
  )
}

/** Fenêtre : ouverte (1.08 rad) quand son son est actif. */
export function Window({ frame = M.plum, glass = [M.glass, M.glass], transom }: Look) {
  const left = useRef<Group>(null!), right = useRef<Group>(null!), open = useRef(0)
  useFrame((_, delta) => {
    open.current = approach(open.current, isActive(useStore.getState(), 'window') ? 1 : 0, Math.min(delta, 0.05) * 1.6)
    const a = smooth(open.current) * 1.08
    left.current.rotation.y = -a
    right.current.rotation.y = a
  })
  return (
    <group userData={{ id: 'window' }}>
      <group ref={left} position={[WIN.x0 + 0.01, WIN.y0 + 0.02, -3.12]}>
        <Pane frame={frame} glass={glass[0]} transom={transom} />
      </group>
      <group ref={right} position={[WIN.x1 - 0.01, WIN.y0 + 0.02, -3.12]}>
        <group position={[-paneW, 0, 0]}>
          <Pane frame={frame} glass={glass[1]} transom={transom} />
        </group>
      </group>
      {/* zone de tap invisible sur toute l'ouverture */}
      <mesh visible={false} position={[(WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, -2.99]}>
        <planeGeometry args={[WIN.x1 - WIN.x0, WIN.y1 - WIN.y0]} />
      </mesh>
    </group>
  )
}
