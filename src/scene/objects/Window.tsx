import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { ExtrudeGeometry, Path, Shape, type Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, smooth } from '../../math'
import { M } from '../materials'
import { Part, WIN, rbox, rrPath } from '../parts'

// Deux battants à la française, qui s'ouvrent vers l'intérieur.
const paneW = (WIN.x1 - WIN.x0) / 2 - 0.02, paneH = WIN.y1 - WIN.y0 - 0.04
const frameShape = rrPath(new Shape(), 0, 0, paneW, paneH, 0.08)
frameShape.holes.push(rrPath(new Path(), 0.08, 0.08, paneW - 0.16, paneH - 0.16, 0.03))
const frameGeo = new ExtrudeGeometry(frameShape, { depth: 0.04, bevelEnabled: true, bevelThickness: 0.02, bevelSize: 0.02, bevelSegments: 2, curveSegments: 6 })

function Pane() {
  return (
    <>
      <Part geo={frameGeo} m={M.plum} p={[0, 0, -0.03]} />
      <Part geo={rbox(0.05, paneH - 0.16, 0.05, 0.02)} m={M.plum} p={[paneW / 2, paneH / 2, 0]} />
      {[paneH / 3, (2 * paneH) / 3].map((y) => (
        <Part key={y} geo={rbox(paneW - 0.16, 0.05, 0.05, 0.02)} m={M.plum} p={[paneW / 2, y, 0]} />
      ))}
      <mesh material={M.glass} position={[paneW / 2, paneH / 2, 0]}>
        <planeGeometry args={[paneW - 0.16, paneH - 0.16]} />
      </mesh>
    </>
  )
}

/** Fenêtre : ouverte (1.08 rad) quand son son est actif. */
export function Window() {
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
        <Pane />
      </group>
      <group ref={right} position={[WIN.x1 - 0.01, WIN.y0 + 0.02, -3.12]}>
        <group position={[-paneW, 0, 0]}>
          <Pane />
        </group>
      </group>
      {/* zone de tap invisible sur toute l'ouverture */}
      <mesh visible={false} position={[(WIN.x0 + WIN.x1) / 2, (WIN.y0 + WIN.y1) / 2, -2.99]}>
        <planeGeometry args={[WIN.x1 - WIN.x0, WIN.y1 - WIN.y0]} />
      </mesh>
    </group>
  )
}
