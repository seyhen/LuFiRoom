import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { PlaneGeometry, type Group, type Mesh } from 'three'
import { smooth } from '../../math'
import { Part, SPH, cyl, rbox } from '../parts'
import { mood, useSquash } from '../anim'
import { LIVE, Static } from '../Static'
import { R } from './materials'

type Kind = 'flat' | 'deco' | 'spire' | 'needle' | 'tank'
// [x, z, largeur, profondeur, hauteur, matériau (0-3), forme] : rangée proche derrière le parapet du fond, puis rangée lointaine.
const NEAR: [number, number, number, number, number, number, Kind][] = [
  [-2.55, -3.85, 1.3, 0.6, 3.1, 0, 'flat'], [-1.4, -3.9, 0.9, 0.6, 3.9, 1, 'deco'], [-0.4, -3.8, 1.05, 0.55, 2.5, 2, 'tank'],
  [0.6, -3.95, 0.85, 0.6, 4.2, 3, 'spire'], [1.6, -3.8, 1.05, 0.55, 2.2, 0, 'flat'], [2.65, -3.85, 1.2, 0.6, 3.3, 1, 'deco'],
]
const FAR: [number, number, number, number, number, number, Kind][] = [
  [-2.1, -4.75, 1.3, 0.5, 4.6, 0, 'flat'], [-0.95, -4.8, 0.9, 0.5, 5.1, 0, 'needle'], [1.25, -4.75, 1.1, 0.5, 4.8, 0, 'flat'], [2.45, -4.7, 1.0, 0.5, 3.9, 0, 'flat'],
]
// À gauche, derrière le parapet : [z, largeur, hauteur].
const LEFT: [number, number, number, number][] = [[-0.25, 1.15, 2.5, 2], [1.05, 1.1, 1.85, 3], [2.3, 1.2, 2.9, 1]]

/** Un plan de fenêtres à la taille de la façade : la grille garde la même échelle partout (un étage ≈ 0.1). */
function windowsGeo(w: number, h: number, seed: number) {
  const g = new PlaneGeometry(w - 0.12, h - 0.2)
  const uv = g.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (w / 0.55) + seed * 0.37, uv.getY(i) * (h / 0.62) + seed * 0.21)
  return g
}

function Tower({ x, z, w, d, h, m, kind, seed, far }: { x: number; z: number; w: number; d: number; h: number; m: number; kind: Kind; seed: number; far?: boolean }) {
  const front = useMemo(() => windowsGeo(w, h, seed), [w, h, seed]), side = useMemo(() => windowsGeo(d, h, seed + 3), [d, h, seed])
  const mat = far ? R.far : R.tower[m]
  return (
    <group position={[x, 0, z]}>
      <Part geo={rbox(w, h, d, 0.06)} m={mat} p={[0, h / 2, 0]} castShadow={false} />
      <mesh geometry={front} material={R.windows} position={[0, h / 2 - 0.05, d / 2 + 0.005]} />
      <mesh geometry={side} material={R.windows} position={[w / 2 + 0.005, h / 2 - 0.05, 0]} rotation-y={Math.PI / 2} />
      {kind === 'deco' && (
        <>
          <Part geo={rbox(w * 0.7, 0.35, d * 0.7, 0.05)} m={mat} p={[0, h + 0.17, 0]} castShadow={false} />
          <Part geo={rbox(w * 0.42, 0.3, d * 0.42, 0.05)} m={mat} p={[0, h + 0.5, 0]} castShadow={false} />
          <Part m={mat} p={[0, h + 0.85, 0]} castShadow={false}>
            <coneGeometry args={[w * 0.18, 0.45, 8]} />
          </Part>
        </>
      )}
      {kind === 'spire' && (
        <>
          <Part geo={rbox(w * 0.72, 0.5, d * 0.72, 0.05)} m={mat} p={[0, h + 0.25, 0]} castShadow={false} />
          <Part geo={rbox(w * 0.45, 0.4, d * 0.45, 0.05)} m={mat} p={[0, h + 0.7, 0]} castShadow={false} />
          <Part geo={cyl(0.03, 0.05, 0.7, 8)} m={mat} p={[0, h + 1.25, 0]} castShadow={false} />
        </>
      )}
      {kind === 'needle' && <Part geo={cyl(0.015, 0.03, 0.9, 6)} m={mat} p={[0, h + 0.45, 0]} castShadow={false} />}
      {kind === 'tank' && (
        <group position={[w * 0.15, h, 0]}>
          {[-0.12, 0.12].map((dx) => (
            <Part key={dx} geo={cyl(0.012, 0.012, 0.3, 4)} m={R.steel} p={[dx, 0.15, 0]} castShadow={false} />
          ))}
          <Part geo={cyl(0.2, 0.2, 0.36, 14)} m={R.stave} p={[0, 0.48, 0]} castShadow={false} />
          <Part m={R.steel} p={[0, 0.76, 0]} castShadow={false}>
            <coneGeometry args={[0.22, 0.2, 14]} />
          </Part>
        </group>
      )}
    </group>
  )
}

/**
 * La ville autour du toit : deux rangées de tours derrière le parapet du fond, d'autres à gauche. Leurs fenêtres s'allument
 * le soir, la flèche clignote en rouge, la lune se lève. On la touche pour entendre la ville.
 */
export function Skyline() {
  const g = useRef<Group>(null!), beacon = useRef<Mesh>(null!), moon = useRef<Mesh>(null!)
  useSquash('city', g)
  useFrame(({ clock }) => {
    const n = smooth(mood.night)
    R.windows.emissiveIntensity = 0.08 + n * 1.0
    R.moon.opacity = n
    beacon.current.visible = Math.sin(clock.elapsedTime * 2.2) > 0.3
  })
  return (
    <>
      <mesh ref={moon} material={R.moon} position={[1.2, 6.1, -4.6]}>
        <circleGeometry args={[0.38, 32]} />
      </mesh>
      <group ref={g} userData={{ id: 'city' }}>
        <Static>
          {FAR.map(([x, z, w, d, h, m, kind], i) => (
            <Tower key={`f${i}`} x={x} z={z} w={w} d={d} h={h} m={m} kind={kind} seed={i + 10} far />
          ))}
          {NEAR.map(([x, z, w, d, h, m, kind], i) => (
            <Tower key={`n${i}`} x={x} z={z} w={w} d={d} h={h} m={m} kind={kind} seed={i} />
          ))}
          {LEFT.map(([z, w, h, m], i) => (
            <group key={`l${i}`} position={[-3.85, 0, z]} rotation-y={Math.PI / 2}>
              <Tower x={0} z={0} w={w} d={0.6} h={h} m={m} kind="flat" seed={i + 20} />
            </group>
          ))}
          <mesh ref={beacon} userData={LIVE} geometry={SPH} material={R.beacon} scale={0.05} position={[0.6, 4.2 + 1.62, -3.95]} />
        </Static>
      </group>
    </>
  )
}
