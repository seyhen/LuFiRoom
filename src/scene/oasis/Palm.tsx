import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { BufferGeometry, Group } from 'three'
import { approach } from '../../math'
import { isActive, useStore } from '../../state/store'
import { reduceMotion, useSquash } from '../anim'
import { Leaf } from '../nature/Leaf'
import { Rock } from '../nature/Rock'
import { Batch, Part, SPH, cyl, type Item, type V3 } from '../parts'
import { Static } from '../Static'
import { seeded } from '../paint'
import { D } from './materials'
import { crownFronds, frondMatrix, mergeFronds, trunkGeo } from './palmGeo'

/** Le palmier de la pièce : le pied, la hauteur du tronc et son décalage au sommet (il penche vers la mare et vers nous). */
export const PALM = { at: [2.75, 0, -2.5] as V3, h: 3.3, lean: [-0.15, 0.55] as [number, number] }
const CROWN: V3 = [PALM.lean[0], PALM.h, PALM.lean[1]]
const MATS = [D.frond, D.frond2, D.frond]

/**
 * Le palmier dattier (objet « palmier » : les palmes dans la brise) : un tronc élancé aux écailles d'écorce, évasé au pied, une couronne de
 * quatorze palmes pennées (les dressées au centre, les arquées autour) que le vent balance en trois paquets, des bases de palmes en
 * collerette, des palmes mortes qui pendent, trois régimes de dattes ; au pied, un tertre de sable, des pierres, un rejet, deux palmes
 * tombées. Quand les palmes bruissent, les paquets se balancent plus large et plus vite. `PALM.at` est le pied.
 */
export function DatePalm() {
  const g = useRef<Group>(null!), clusters = useRef<(Group | null)[]>([])
  const st = useRef({ on: 0, ph: 0 })
  const geo = useMemo(() => {
    const list = crownFronds(3, 14, 1)
    const trunk = trunkGeo(PALM.h, PALM.lean)
    const parts: BufferGeometry[] = [0, 1, 2].map((c) => mergeFronds(list.filter((_, i) => i % 3 === c).map((f) => f.m)))
    return { trunk, parts }
  }, [])
  useEffect(() => () => { geo.trunk.dispose(); geo.parts.forEach((p) => p.dispose()) }, [geo])
  useSquash('datepalm', g)
  const { dates, dead } = useMemo(() => {
    const r = seeded(17), dates: Item[] = []
    ;[0.5, 2.5, 4.4].forEach((a, b) => {
      for (let i = 0; i < 16; i++) {
        const k = i / 15, ang = a + (r() - 0.5) * 0.5, rad = 0.14 + Math.sin(k * 3.1) * 0.07 + r() * 0.03
        dates.push({ p: [Math.cos(ang) * rad, -0.12 - k * 0.42, Math.sin(ang) * rad], s: [0.03, 0.048, 0.03], r: [(r() - 0.5) * 0.5, 0, (r() - 0.5) * 0.5], c: [0xc0621e, 0x9a4416, 0xd07a28][(i + b) % 3] })
      }
    })
    const dead = mergeFronds([[0.4, -0.55], [2.2, -0.75], [3.6, -0.6], [5.2, -0.8]].map(([yaw, p]) => frondMatrix(yaw, p, 1.3, 0.2)))
    return { dates, dead }
  }, [])
  useEffect(() => () => dead.dispose(), [dead])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current
    s.on = approach(s.on, reduceMotion ? 0 : isActive(useStore.getState(), 'datepalm') ? 1 : 0, dt * 0.5)
    s.ph += dt * (0.7 + s.on * 0.9)
    const a = reduceMotion ? 0 : 0.012 + s.on * 0.05
    clusters.current.forEach((c, i) => {
      if (!c) return
      c.rotation.set(Math.cos(s.ph * 0.83 + i * 2.1) * a * 0.8, 0, Math.sin(s.ph + i * 1.7) * a)
    })
  })
  return (
    <group ref={g} userData={{ id: 'datepalm' }} position={PALM.at}>
      <mesh geometry={geo.trunk} material={D.bark} castShadow receiveShadow />
      <Static>
        {/* le pied : un tertre de sable, des pierres, les racines qui s'évasent, un rejet */}
        <Part geo={SPH} m={D.sand} scale={[0.5, 0.08, 0.45]} p={[0, 0.0, 0]} castShadow={false} />
        {Array.from({ length: 6 }, (_, i) => {
          const a = i * 1.05 + 0.3
          return <Rock key={i} v={6 + (i % 2)} p={[Math.cos(a) * 0.42, -0.02, Math.sin(a) * 0.4]} s={[0.14, 0.06, 0.1]} ry={a} m={D.stone} shadow={false} />
        })}
        {/* le rejet : un petit palmier, un bulbe et cinq palmes qui s'ouvrent (serrées à 57°, elles faisaient une pomme de pin) */}
        <Part geo={SPH} m={D.barkBase} scale={[0.07, 0.09, 0.07]} p={[0.34, 0.05, 0.18]} castShadow={false} />
        {[0, 1, 2, 3, 4].map((i) => <Leaf key={i} kind="pinnate" w={0.11} l={0.6} m={D.frond2} p={[0.34, 0.1, 0.18]} r={[-0.55 - (i % 2) * 0.15, i * 1.26 + 0.3, 0]} />)}
        <Leaf kind="pinnate" w={0.17} l={1.0} m={D.frondDry} p={[-0.7, 0.03, 0.55]} r={[-0.08, 0.7, 0]} />
        {/* tournée en travers de la vue : dans l'axe de la caméra, elle se tassait en pomme de pin */}
        <Leaf kind="pinnate" w={0.15} l={0.85} m={D.frondDry} p={[0.9, 0.03, 0.75]} r={[-0.05, 3.9 + Math.PI / 2, 0]} />
        {/* le haut du tronc : la collerette des bases de palmes coupées, serrées */}
        <group position={CROWN}>
          {Array.from({ length: 10 }, (_, i) => {
            const a = (i / 10) * Math.PI * 2
            return <Part key={i} geo={cyl(0.03, 0.055, 0.34, 6)} m={D.boot} p={[Math.cos(a) * 0.16, -0.14, Math.sin(a) * 0.16]} rotation={[Math.sin(a) * 0.5, 0, -Math.cos(a) * 0.5]} castShadow={false} />
          })}
          <Part geo={SPH} m={D.boot} scale={[0.17, 0.12, 0.17]} p={[0, 0.02, 0]} castShadow={false} />
          <Batch geo={SPH} m={D.dateTint} items={dates} />
          <mesh geometry={dead} material={D.frondDry} castShadow />
        </group>
      </Static>
      {/* la couronne : trois paquets de palmes, chacun pivote sur le cœur (le vent les balance séparément) */}
      <group position={CROWN}>
        {geo.parts.map((p, i) => (
          <group key={i} ref={(c) => { clusters.current[i] = c }}>
            <mesh geometry={p} material={MATS[i]} castShadow receiveShadow />
          </group>
        ))}
      </group>
    </group>
  )
}
