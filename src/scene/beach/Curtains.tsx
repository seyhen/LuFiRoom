import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PlaneGeometry, type Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach } from '../../math'
import { Part, cyl, noRay } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { B } from './materials'
import { DOOR } from './BeachShell'

const W = 0.78, H = 3.55, TOP = DOOR.y1 + 0.22, Z = -2.88

/** Un voilage de lin : un plan qu'on plisse et qu'on fait gonfler, plus fort en bas (il pend de sa tringle). */
function Sheer({ x, side, wind }: { x: number; side: 1 | -1; wind: { current: number } }) {
  const geo = useMemo(() => new PlaneGeometry(W, H, 10, 20), [])
  const rest = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, p = geo.attributes.position, k = wind.current
    for (let i = 0; i < p.count; i++) {
      const u = rest[i * 3] / W + 0.5, v = 0.5 - rest[i * 3 + 1] / H // v : 0 en haut, 1 en bas
      const folds = Math.sin(u * TAU * 3.5) * 0.05 * (1 - u * 0.5)
      const billow = reduceMotion ? 0 : v * v * (0.04 + k * 0.4) * (0.6 + 0.4 * Math.sin(t * (1.1 + k) + u * 2 + side))
      const sway = reduceMotion ? 0 : v * v * Math.sin(t * 0.9 + side * 1.3) * (0.02 + k * 0.12)
      p.setXYZ(i, rest[i * 3] + sway * side, rest[i * 3 + 1], folds + billow)
    }
    p.needsUpdate = true
    geo.computeVertexNormals()
  })
  // z = 0 : le groupe parent est déjà à Z, pour que le rebond de clic se fasse autour des rideaux et non autour de l'origine du monde
  return <mesh geometry={geo} material={B.sheer} position={[x, -H / 2 - 0.05, 0]} raycast={noRay} />
}

/** Les voilages de la grande porte : ils respirent doucement, et gonflent dans la brise quand on écoute la mer. */
export function Curtains() {
  const g = useRef<Group>(null!), wind = useRef(0)
  useSquash('window', g)
  useFrame((_, delta) => {
    wind.current = approach(wind.current, isActive(useStore.getState(), 'window') ? 1 : 0, Math.min(delta, 0.05) * 0.8)
  })
  const { x0, x1, y0, y1 } = DOOR
  return (
    <group userData={{ id: 'window' }}>
      <Part geo={cyl(0.025, 0.025, x1 - x0 + 0.9, 10)} m={B.wood} p={[(x0 + x1) / 2, TOP, Z - 0.02]} rotation-z={Math.PI / 2} castShadow={false} />
      <group ref={g} position={[(x0 + x1) / 2, TOP, Z]}>
        <Sheer x={x0 + W / 2 - 0.32 - (x0 + x1) / 2} side={-1} wind={wind} />
        <Sheer x={x1 - W / 2 + 0.32 - (x0 + x1) / 2} side={1} wind={wind} />
      </group>
      {/* zone de tap invisible sur toute l'ouverture */}
      <mesh visible={false} position={[(x0 + x1) / 2, (y0 + y1) / 2, -3.0]}>
        <planeGeometry args={[x1 - x0, y1 - y0]} />
      </mesh>
    </group>
  )
}
