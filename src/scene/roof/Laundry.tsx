import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, PlaneGeometry, TubeGeometry, Vector3, type Group, type Material } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, cyl, noRay, rbox } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { R } from './materials'

const X = 2.85, Z0 = -1.75, Z1 = 2.1, TOP = 2.0, SAG = 0.12
const lineY = (z: number) => TOP - SAG * Math.sin((Math.PI * (z - Z0)) / (Z1 - Z0))
const rope = new TubeGeometry(new CatmullRomCurve3(Array.from({ length: 21 }, (_, i) => { const z = Z0 + ((Z1 - Z0) * i) / 20; return new Vector3(X, lineY(z), z) })), 40, 0.008, 4, false)
// Le linge : [début, largeur, hauteur, matériau].
const CLOTHES: [number, number, number, Material][] = [[-1.5, 1.0, 1.1, R.sheet], [-0.4, 0.5, 0.42, R.sheetBlue], [0.2, 0.9, 0.95, R.sheetStripe], [1.2, 0.36, 0.5, R.sheet], [1.65, 0.3, 0.32, R.sheetBlue]]

/** Une pièce de linge pincée sur le fil : elle ondule, plus fort en bas, et claque au vent quand il souffle. */
function Cloth({ z, w, h, m, wind, i }: { z: number; w: number; h: number; m: Material; wind: { current: number }; i: number }) {
  const geo = useMemo(() => new PlaneGeometry(w, h, 8, 8), [w, h])
  const rest = useMemo(() => Float32Array.from(geo.attributes.position.array), [geo])
  // La phase s'additionne image après image : multiplier le temps par une fréquence qui change ferait sauter le tissu.
  const phase = useRef(i * 1.7)
  useFrame(({ clock }, delta) => {
    if (reduceMotion) return
    const t = clock.elapsedTime, p = geo.attributes.position, k = wind.current
    phase.current += Math.min(delta, 0.05) * (1.5 + k * 3)
    for (let j = 0; j < p.count; j++) {
      const u = rest[j * 3] / w + 0.5, v = 0.5 - rest[j * 3 + 1] / h
      const flap = v * (0.03 + k * 0.32) * Math.sin(phase.current + u * 3 + i) + v * v * k * 0.12
      p.setZ(j, flap)
      p.setY(j, rest[j * 3 + 1] + v * k * 0.08 * Math.sin(t * 4 + u * 5))
    }
    p.needsUpdate = true
    geo.computeVertexNormals()
  })
  const y = lineY(z + w / 2)
  return (
    <>
      <mesh geometry={geo} material={m} position={[X, y - h / 2, z + w / 2]} rotation-y={Math.PI / 2} castShadow raycast={noRay} />
      {[z + 0.06, z + w - 0.06].map((pz) => (
        <Part key={pz} geo={rbox(0.03, 0.08, 0.02, 0.008)} m={R.teak} p={[X, lineY(pz) + 0.01, pz]} castShadow={false} />
      ))}
    </>
  )
}

/** La corde à linge entre deux poteaux : des draps, des taies, une chemise. Touchée, elle fait souffler le vent. */
export function Laundry() {
  const g = useRef<Group>(null!), wind = useRef(0)
  useSquash('laundry', g)
  useFrame((_, delta) => {
    wind.current = approach(wind.current, isActive(useStore.getState(), 'laundry') ? 1 : 0, Math.min(delta, 0.05) * 0.7)
  })
  return (
    // Le rebond du clic agrandit le groupe autour de son origine : au pied du fil, pas à l'origine du monde (le linge glissait de 0,3).
    <group ref={g} userData={{ id: 'laundry' }} position={[X, 0, (Z0 + Z1) / 2]}>
      <group position={[-X, 0, -(Z0 + Z1) / 2]}>
        {[Z0, Z1].map((z) => (
          <group key={z}>
            <Part geo={cyl(0.04, 0.05, TOP + 0.1, 10)} m={R.teak} p={[X, (TOP + 0.1) / 2, z]} />
            <Part geo={rbox(0.06, 0.06, 0.24, 0.02)} m={R.teak} p={[X, TOP, z]} castShadow={false} />
          </group>
        ))}
        <mesh geometry={rope} material={R.rope} raycast={noRay} />
        {CLOTHES.map(([z, w, h, m], i) => (
          <Cloth key={i} z={z} w={w} h={h} m={m} wind={wind} i={i} />
        ))}
      </group>
    </group>
  )
}
