import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { BufferGeometry, CatmullRomCurve3, PlaneGeometry, SphereGeometry, TubeGeometry, Vector3, type Group, type Mesh } from 'three'
import { smooth } from '../../../math'
import { mood, reduceMotion } from '../../anim'
import { LIVE } from '../../Static'
import { noRay } from '../../parts'
import { D } from './materials'

// Les méduses : des cloches de lumière qui montent et descendent lentement derrière et autour du sous-marin. Pâles le jour, elles
// brillent la nuit (le fond de l'eau était un bleu uni sans rien à regarder). Elles restent dans le courant, loin de la coque.

const GLOW = new PlaneGeometry(1, 1)
const BELL = new SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2)
const FRILL = new SphereGeometry(1, 18, 4, 0, Math.PI * 2, Math.PI / 2.4, Math.PI / 5)
const tentacle = (len: number, ph: number) => new TubeGeometry(new CatmullRomCurve3(Array.from({ length: 6 }, (_, i) => new Vector3(Math.sin(i * 0.9 + ph) * 0.05 * i, -(i / 5) * len, Math.cos(i * 0.7 + ph) * 0.04 * i))), 10, 0.012, 4, false)

/** [x, y, z, taille, couleur (0 à 2), phase]. À 5 à 10 du centre : plus loin, `skyFade` les éteint. */
const JELLIES: [number, number, number, number, number, number][] = [
  [-8.2, 2.2, -5.6, 0.52, 0, 0], [-9.2, 1.4, -2.2, 0.4, 1, 1.7], [-6.6, 3.4, 3.2, 0.34, 2, 3.1],
  [3.2, 2.8, -6.4, 0.46, 1, 2.3], [6.4, 1.5, -2.6, 0.38, 0, 4.2], [8.4, 3.0, 1.6, 0.3, 2, 5.4], [-2.8, 3.6, -8.4, 0.42, 2, 0.9],
]

function Jelly({ x, y, z, s, c, ph }: { x: number; y: number; z: number; s: number; c: number; ph: number }) {
  const g = useRef<Group>(null!), spin = useRef<Group>(null!), bell = useRef<Group>(null!), halo = useRef<Mesh>(null!), t = useRef(ph)
  // la cloche, sa jupe et ses cinq tentacules en un seul maillage : une méduse coûte 2 tracés (avec son halo), pas 8
  const body = useMemo(() => {
    const parts: BufferGeometry[] = [BELL.clone().scale(1, 0.72, 1), FRILL.clone().scale(1.02, 0.72, 1.02)]
    for (let i = 0; i < 5; i++) parts.push(tentacle(1.2 + (i % 3) * 0.3, ph + i).translate(Math.cos(i * 1.26) * 0.55, 0.02, Math.sin(i * 1.26) * 0.55))
    return mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)), false)
  }, [ph])
  useFrame(({ camera }, dt) => {
    if (!reduceMotion) t.current += Math.min(dt, 0.05) * 0.8
    const p = t.current, n = smooth(mood.night)
    g.current.position.y = y + Math.sin(p * 0.6) * 0.35
    spin.current.rotation.y = p * 0.15
    halo.current.quaternion.copy(camera.quaternion) // le halo fait toujours face à la caméra (un plan, pas un sprite : `skyFade` ne s'applique pas aux sprites)
    const pulse = 1 + Math.sin(p * 2.2) * 0.07
    bell.current.scale.set(pulse, 1 / pulse, pulse)
    D.jelly[c].opacity = 0.12 + n * 0.4
    D.jellyGlow[c].opacity = 0.08 + n * 0.55
  })
  return (
    <group ref={g} position={[x, y, z]} scale={s} userData={LIVE}>
      <group ref={spin}>
        <group ref={bell}>
          <mesh geometry={body} material={D.jelly[c]} raycast={noRay} />
        </group>
      </group>
      <mesh ref={halo} geometry={GLOW} material={D.jellyGlow[c]} scale={3.2} position={[0, 0.1, 0]} renderOrder={4} raycast={noRay} />
    </group>
  )
}

export function Jellies() {
  return <>{JELLIES.map(([x, y, z, s, c, ph], i) => <Jelly key={i} x={x} y={y} z={z} s={s * 1.4} c={c} ph={ph} />)}</>
}
