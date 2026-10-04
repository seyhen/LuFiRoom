import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { DoubleSide, LatheGeometry, Vector2, type Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach, rand } from '../../math'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { reduceMotion, useParticles, useSquash } from '../anim'
import { emberTex } from '../textures'
import { Flames } from '../objects/Flames'
import { Steam } from '../objects/Steam'
import { K } from './materials'

// Le profil d'un wok : fond rond, flancs qui s'évasent (rayon, hauteur).
const bowl = new LatheGeometry([[0, 0], [0.06, 0.004], [0.13, 0.03], [0.2, 0.085], [0.255, 0.16], [0.285, 0.24], [0.295, 0.275]].map(([r, y]) => new Vector2(r, y)), 28)
const wokMat = K.steelDark.clone()
wokMat.side = DoubleSide
const BITS = 15
const bitMats = [K.scallion, K.noodle, K.pork, K.yolk, K.scallion]

/**
 * Le wok sur sa flamme : un bol de fonte noire à longue poignée de bois, plein de nouilles, de lardons et de ciboule. Quand il
 * saute, il se balance d'avant en arrière, les ingrédients volent et retombent, des étincelles montent, la flamme gronde et la
 * vapeur siffle ; au repos tout dort dans le fond, et la flamme est éteinte.
 */
export function Wok({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), pan = useRef<Group>(null!), bits = useRef<Group[]>([]), k = useRef(0), since = useRef(0)
  const sparks = useParticles()
  useSquash('wok', g)
  const seeds = useMemo(() => Array.from({ length: BITS }, (_, i) => ({ a: (i / BITS) * TAU * 2.3, r: 0.02 + ((i * 37) % 11) * 0.016, ph: rand(0, TAU), v: rand(4.2, 6.4), m: i % bitMats.length })), [])
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), t = clock.elapsedTime, on = isActive(useStore.getState(), 'wok')
    k.current = approach(k.current, on ? 1 : 0, dt * 2)
    const kk = reduceMotion ? 0 : k.current
    // le poignet du cuisinier : le wok bascule vers l'avant puis revient, en un rythme de saut (≈ 2,3 coups par seconde)
    const beat = t * 7.2
    pan.current.rotation.z = Math.sin(beat) * 0.09 * kk
    pan.current.rotation.x = Math.sin(beat + 1.1) * 0.05 * kk
    pan.current.position.y = 0.1 + Math.max(0, Math.sin(beat + 0.4)) * 0.04 * kk
    bits.current.forEach((b, i) => {
      const s = seeds[i], u = Math.max(0, Math.sin(beat * 0.5 + s.ph)) ** 2
      b.position.set(Math.cos(s.a) * s.r * (1 + u * 0.8), 0.045 + 0.02 * (i % 3) + u * 0.17 * kk, Math.sin(s.a) * s.r * (1 + u * 0.8))
      b.rotation.set(u * kk * 4 + s.ph, s.ph, u * kk * 3)
    })
    since.current += dt
    if (kk > 0.6 && since.current > 0.16) {
      since.current = 0
      sparks.emit(emberTex, position[0] + rand(-0.12, 0.12), position[1] + 0.35 + rand(0, 0.08), position[2] + rand(-0.08, 0.1), { size: 0.075, life: 1.0, vy: 0.9, sway: 0.12, peak: 0.95 })
    }
  })
  const on = useStore((s) => isActive(s, 'wok'))
  return (
    <>
      <group ref={g} userData={{ id: 'wok' }} position={position}>
        {/* le brûleur : une couronne de fonte percée, les trois pieds qui tiennent le wok */}
        <Part geo={cyl(0.19, 0.22, 0.05, 22)} m={K.iron} p={[0, 0.025, 0]} />
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * TAU + 0.5
          return <Part key={i} geo={rbox(0.03, 0.07, 0.03, 0.01)} m={K.iron} p={[Math.cos(a) * 0.17, 0.085, Math.sin(a) * 0.17]} castShadow={false} />
        })}
        <Flames id="wok" position={[0, 0.04, 0]} size={0.5} light={{ at: [0, 0.4, 0.3], intensity: 1.0, distance: 4.5 }} glow={{ at: [0, 0.22, 0.12], scale: 1.0 }} />
        <group ref={pan} position={[0, 0.1, 0]}>
          <mesh geometry={bowl} material={wokMat} castShadow receiveShadow />
          <Part m={K.iron} p={[0, 0.275, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.295, 0.012, 6, 30]} />
          </Part>
          {/* la poignée de bois, vers la gauche, et l'anse de l'autre côté */}
          <Part geo={cyl(0.016, 0.02, 0.5, 10)} m={K.woodDark} p={[-0.52, 0.31, 0]} rotation-z={Math.PI / 2 - 0.12} />
          <Part geo={cyl(0.01, 0.01, 0.14, 8)} m={K.iron} p={[-0.3, 0.3, 0]} rotation-z={Math.PI / 2 - 0.12} castShadow={false} />
          <Part m={K.iron} p={[0.31, 0.27, 0]} castShadow={false}>
            <torusGeometry args={[0.035, 0.008, 6, 12]} />
          </Part>
          {/* le contenu : nouilles, lardons, œuf brouillé, ciboule */}
          {seeds.map((s, i) => (
            <group key={i} ref={(el) => void (el && (bits.current[i] = el))}>
              <Part geo={i % 3 === 0 ? cyl(0.012, 0.012, 0.035, 6) : SPH} m={bitMats[s.m]} scale={i % 3 === 0 ? 1 : [0.026, 0.012, 0.018]} castShadow={false} />
            </group>
          ))}
          <Part geo={SPH} m={K.noodle} scale={[0.15, 0.03, 0.15]} p={[0, 0.05, 0]} castShadow={false} />
        </group>
        {on && <Steam at={[0, 0.5, 0]} every={0.3} />}
      </group>
      <group ref={sparks.group} />
    </>
  )
}
