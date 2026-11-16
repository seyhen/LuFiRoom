import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { BufferGeometry, CatmullRomCurve3, PlaneGeometry, SphereGeometry, TubeGeometry, Vector3, type Group, type Mesh } from 'three'
import { approach, smooth } from '../../../math'
import { isActive, useStore } from '../../../state/store'
import { mood, reduceMotion, useSquash } from '../../anim'
import { LIVE } from '../../Static'
import { noRay } from '../../parts'
import { D } from './materials'

// Les méduses : des cloches de lumière qui montent et descendent lentement derrière et autour du sous-marin. Pâles le jour, elles
// brillent la nuit (le fond de l'eau était un bleu uni sans rien à regarder). Elles restent dans le courant, loin de la coque.
// La grande de droite (`CHOIR`) est un interrupteur (`jellychoir`, son `jellies`) : touchée, tout le banc chante, les cloches battent plus
// vite et brillent même le jour.

/** La méduse qui porte le bouton : son indice dans `JELLIES` (la grande de droite, bien en vue). */
const CHOIR = 4

const GLOW = new PlaneGeometry(1, 1)
const BELL = new SphereGeometry(1, 18, 10, 0, Math.PI * 2, 0, Math.PI / 2)
const FRILL = new SphereGeometry(1, 18, 4, 0, Math.PI * 2, Math.PI / 2.4, Math.PI / 5)
const tentacle = (len: number, ph: number) => new TubeGeometry(new CatmullRomCurve3(Array.from({ length: 6 }, (_, i) => new Vector3(Math.sin(i * 0.9 + ph) * 0.05 * i, -(i / 5) * len, Math.cos(i * 0.7 + ph) * 0.04 * i))), 10, 0.012, 4, false)

/** [x, y, z, taille, couleur (0 à 2), phase]. À 5 à 10 du centre : plus loin, `skyFade` les éteint. */
const JELLIES: [number, number, number, number, number, number][] = [
  [-9.6, 1.0, 5.2, 0.5, 0, 0], [-9.2, 1.4, -2.2, 0.4, 1, 1.7], [-6.6, 3.4, 3.2, 0.34, 2, 3.1],
  [3.2, 2.8, -6.4, 0.46, 1, 2.3], [5.6, 2.4, -1.6, 0.38, 0, 4.2], [8.4, 3.0, 1.6, 0.3, 2, 5.4], [-1.4, 3.4, -10.0, 0.42, 2, 0.9],
]

function Jelly({ x, y, z, s, c, ph, choir }: { x: number; y: number; z: number; s: number; c: number; ph: number; choir: boolean }) {
  const root = useRef<Group>(null!), amp = useRef(0)
  useSquash('jellychoir', root)
  const g = useRef<Group>(null!), spin = useRef<Group>(null!), bell = useRef<Group>(null!), halo = useRef<Mesh>(null!), t = useRef(ph)
  // la cloche, sa jupe et ses cinq tentacules en un seul maillage : une méduse coûte 2 tracés (avec son halo), pas 8
  const body = useMemo(() => {
    const parts: BufferGeometry[] = [BELL.clone().scale(1, 0.72, 1), FRILL.clone().scale(1.02, 0.72, 1.02)]
    for (let i = 0; i < 5; i++) parts.push(tentacle(1.2 + (i % 3) * 0.3, ph + i).translate(Math.cos(i * 1.26) * 0.55, 0.02, Math.sin(i * 1.26) * 0.55))
    return mergeGeometries(parts.map((g) => (g.index ? g.toNonIndexed() : g)), false)
  }, [ph])
  useFrame(({ camera }, dt) => {
    amp.current = approach(amp.current, isActive(useStore.getState(), 'jellychoir') ? 1 : 0, Math.min(dt, 0.05) * 0.6)
    const a = amp.current
    if (!reduceMotion) t.current += Math.min(dt, 0.05) * (0.8 + a * 0.9)
    const p = t.current, n = smooth(mood.night)
    g.current.position.y = Math.sin(p * 0.6) * 0.35
    spin.current.rotation.y = p * 0.15
    halo.current.quaternion.copy(camera.quaternion) // le halo fait toujours face à la caméra (un plan, pas un sprite : `skyFade` ne s'applique pas aux sprites)
    const pulse = 1 + Math.sin(p * 2.2) * (0.07 + a * 0.05)
    bell.current.scale.set(pulse, 1 / pulse, pulse)
    // additif sur un fond de jour clair : à 0,15 la cloche rose virait au blanc pur (la grande du chœur aussi) ; le jour, très pâle
    D.jelly[c].opacity = 0.06 + n * 0.49 + a * 0.04
    D.jellyGlow[c].opacity = 0.03 + n * 0.6 + a * 0.06
    halo.current.scale.setScalar(3.2 * (1 + a * 0.18 * (0.5 + 0.5 * Math.sin(p * 2.2))))
  })
  return (
    <group ref={root} position={[x, y, z]} userData={choir ? { id: 'jellychoir' } : LIVE}>
      <group ref={g} scale={s} userData={LIVE}>
        <group ref={spin}>
          <group ref={bell}>
            <mesh geometry={body} material={D.jelly[c]} raycast={choir ? undefined : noRay} />
          </group>
        </group>
        <mesh ref={halo} geometry={GLOW} material={D.jellyGlow[c]} scale={3.2} position={[0, 0.1, 0]} renderOrder={4} raycast={noRay} />
      </group>
    </group>
  )
}

export function Jellies() {
  return <>{JELLIES.map(([x, y, z, s, c, ph], i) => <Jelly key={i} x={x} y={y} z={z} s={s * 1.4} c={c} ph={ph} choir={i === CHOIR} />)}</>
}
