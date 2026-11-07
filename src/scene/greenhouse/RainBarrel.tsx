import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshBasicMaterial, DoubleSide, type Group, type Mesh } from 'three'
import { useMemo } from 'react'
import { TAU } from '../../math'
import { isActive, useStore } from '../../state/store'
import { reduceMotion, useSquash } from '../anim'
import { Part, cyl, orient, rbox, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { Vessel } from '../igloo/Vessel'
import { G } from './materials'

const BR = 0.44, BH = 0.9, WATER = 0.76

/**
 * Le tonneau d'eau de pluie, objet « gouttière » : un tonneau de chêne cerclé de fer, plein d'eau jusqu'au bord ; au-dessus, la
 * gouttière qui descend du chéneau le long du poteau, son coude et sa goulotte d'où tombe un filet. Quand le son joue, le filet est
 * plein, des ronds s'élargissent sur l'eau ; sinon il goutte à peine. Une louche de cuivre est accrochée au bord.
 * `position` est le pied du tonneau, collé au poteau d'angle.
 */
export function RainBarrel({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), stream = useRef<Mesh>(null!), rings = [useRef<Mesh>(null!), useRef<Mesh>(null!)], t = useRef(0)
  const mats = useMemo(() => [0, 1].map(() => new MeshBasicMaterial({ color: 0xeafaff, transparent: true, opacity: 0, depthWrite: false, side: DoubleSide })), [])
  useSquash('barrel', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), on = isActive(useStore.getState(), 'barrel')
    if (!reduceMotion) t.current += dt * (on ? 1 : 0.35)
    const k = on ? 1 : 0.3
    stream.current.scale.set(k, 1, k)
    const sm = stream.current.material as MeshBasicMaterial
    sm.opacity = on ? 0.75 : 0.35
    rings.forEach((r, i) => {
      const f = (t.current * 0.9 + i * 0.5) % 1
      r.current.scale.setScalar(0.04 + f * 0.3)
      mats[i].opacity = (1 - f) * (on ? 0.6 : 0.25)
    })
  })
  const hoops = [0.16, 0.42, 0.7]
  return (
    <group ref={g} userData={{ id: 'barrel' }} position={position}>
      <Static>
        <Vessel p={[0, 0, 0]} rt={BR} rb={BR - 0.07} h={BH} m={G.wood} inner={G.woodDark} rim={G.woodDark} t={0.012} />
        <Part geo={cyl(BR - 0.07, BR - 0.07, 0.02, 24)} m={G.woodDark} p={[0, 0.02, 0]} castShadow={false} />
        {/* l'eau, un peu sous le bord */}
        <Part geo={cyl(BR - 0.05, BR - 0.05, 0.012, 28)} m={G.barrelWater} p={[0, WATER, 0]} castShadow={false} />
        {/* les cerceaux de fer, rivetés */}
        {hoops.map((y) => <Part key={y} geo={cyl(BR - 0.07 + (BH - y) * 0.078 + 0.012, BR - 0.07 + (BH - y) * 0.078 + 0.012, 0.045, 28)} m={G.ironDark} p={[0, y, 0]} castShadow={false} />)}
        {/* les douves : de fines rainures verticales tout autour, côté caméra */}
        {Array.from({ length: 10 }, (_, i) => {
          const a = ((i + 0.5) / 10) * TAU
          return <Part key={i} geo={rbox(0.008, BH - 0.1, 0.012, 0.003)} m={G.woodDark} p={[Math.cos(a) * (BR - 0.01), BH / 2, Math.sin(a) * (BR - 0.01)]} rotation-y={-a + Math.PI / 2} castShadow={false} />
        })}
        {/* la louche de cuivre accrochée au bord : manche, bol */}
        <group position={[0.34, BH - 0.01, 0.3]} rotation-y={0.7}>
          <Part geo={cyl(0.008, 0.008, 0.4, 6)} m={G.horn} p={[0, 0.0, 0]} rotation-z={Math.PI / 2 - 0.5} castShadow={false} />
          <Part geo={cyl(0.04, 0.03, 0.04, 12)} m={G.horn} p={[-0.16, 0.14, 0]} castShadow={false} />
        </group>
        {/* la gouttière : descente verticale le long du poteau, coude, goulotte au-dessus du tonneau */}
        <Part geo={cyl(0.035, 0.035, 2.4, 10)} m={G.ironDark} p={[-0.38, 2.6, -0.42]} castShadow={false} />
        <Part geo={cyl(0.045, 0.045, 0.05, 10)} m={G.brass} p={[-0.38, 1.4, -0.42]} castShadow={false} />
        <Part geo={cyl(0.045, 0.045, 0.05, 10)} m={G.brass} p={[-0.38, 2.6, -0.42]} castShadow={false} />
        <Part geo={cyl(0.035, 0.035, 0.52, 10)} m={G.ironDark} p={[-0.2, 1.35, -0.22]} rotation={orient([0.36, -0.1, 0.4])} castShadow={false} />
        <Part geo={cyl(0.03, 0.03, 0.06, 10)} m={G.ironDark} p={[-0.02, 1.3, -0.02]} castShadow={false} />
        <Part geo={cyl(0.026, 0.045, 0.1, 10)} m={G.brass} p={[-0.02, 1.26, -0.02]} castShadow={false} />
      </Static>
      {/* le filet : un fin cylindre d'eau, de la goulotte à la surface */}
      <mesh ref={stream} material={G.stream} position={[-0.02, (1.22 + WATER) / 2, -0.02]} userData={LIVE} raycast={() => {}}>
        <cylinderGeometry args={[0.013, 0.01, 1.22 - WATER, 8]} />
      </mesh>
      {rings.map((r, i) => (
        <mesh key={i} ref={r} material={mats[i]} position={[-0.02, WATER + 0.01, -0.02]} rotation-x={-Math.PI / 2} userData={LIVE} raycast={() => {}}>
          <ringGeometry args={[0.9, 1, 28]} />
        </mesh>
      ))}
    </group>
  )
}
