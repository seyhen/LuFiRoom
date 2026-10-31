import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, DoubleSide, LatheGeometry, MeshBasicMaterial, Vector2, type Group, type PointLight, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach, rand } from '../../math'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { reduceMotion, useParticles, useSquash } from '../anim'
import { emberTex, glowTex } from '../textures'
import { Steam } from '../objects/Steam'
import { LIVE, Static } from '../Static'
import { noRay } from '../parts'
import { K } from './materials'

// Le profil d'un wok : fond rond, flancs qui s'évasent (rayon, hauteur).
const bowl = new LatheGeometry([[0, 0], [0.06, 0.004], [0.13, 0.03], [0.2, 0.085], [0.255, 0.16], [0.285, 0.24], [0.295, 0.275]].map(([r, y]) => new Vector2(r, y)), 28)
const wokMat = K.steelDark.clone()
wokMat.side = DoubleSide
const BITS = 9
const bitMats = [K.scallion, K.noodle, K.pork, K.yolk, K.scallion]
/** Le dôme de nouilles : centre et demi-axes ; un ingrédient au repos se pose sur sa surface. */
const DOME = { y: 0.1, r: 0.19, h: 0.07 }
const domeY = (r: number) => DOME.y + DOME.h * Math.sqrt(Math.max(0, 1 - (r / DOME.r) ** 2))
/**
 * La flamme du réchaud à gaz : une couronne de langues bleues à cœur orangé, au bord du brûleur (rayon 0,2), qui lèchent le dehors
 * du wok sans jamais passer à travers (le fond du wok est à 0,1 au centre, à 0,185 au rayon 0,2 : les langues restent dessous).
 */
const TONGUES = 10
const tongueOuter = new MeshBasicMaterial({ color: 0xff9a3c, transparent: true, opacity: 0.85, depthWrite: false, blending: AdditiveBlending })
const tongueCore = new MeshBasicMaterial({ color: 0x5aa8ff, transparent: true, opacity: 0.9, depthWrite: false, blending: AdditiveBlending })

function GasFire() {
  const ring = useRef<Group>(null!), tongues = useRef<Group[]>([]), light = useRef<PointLight>(null!), halo = useRef<Sprite>(null!), lit = useRef(0)
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), t = clock.elapsedTime
    lit.current = approach(lit.current, isActive(useStore.getState(), 'wok') ? 1 : 0, dt * 2.2)
    const k = lit.current
    ring.current.visible = k > 0.01
    tongues.current.forEach((f, i) => {
      const w = reduceMotion ? 0 : Math.sin(t * 11 + i * 1.9) * 0.18 + Math.sin(t * 17 + i * 0.7) * 0.1
      f.scale.set(1, Math.max(0.01, k * (1 + w)), 1)
    })
    light.current.intensity = k * (1.0 + (reduceMotion ? 0 : Math.sin(t * 11) * 0.12)) * Math.PI
    halo.current.material.opacity = k * 0.55
  })
  return (
    <group userData={LIVE}>
      <group ref={ring}>
        {Array.from({ length: TONGUES }, (_, i) => {
          const a = (i / TONGUES) * TAU
          return (
            <group key={i} ref={(el) => void (el && (tongues.current[i] = el))} position={[Math.cos(a) * 0.195, 0.05, Math.sin(a) * 0.195]}>
              <mesh geometry={SPH} material={tongueOuter} scale={[0.035, 0.06, 0.035]} position={[0, 0.05, 0]} raycast={noRay} />
              <mesh geometry={SPH} material={tongueCore} scale={[0.02, 0.035, 0.02]} position={[0, 0.03, 0]} raycast={noRay} />
            </group>
          )
        })}
      </group>
      <pointLight ref={light} color={0xff8a3d} intensity={0} distance={4.5} decay={1.5} position={[0, 0.4, 0.3]} />
      <sprite ref={halo} scale={0.8} position={[0, 0.16, 0.14]} raycast={noRay}>
        <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}

/**
 * Le wok sur sa flamme : un bol de fonte noire à longue poignée de bois, plein de nouilles, de lardons et de ciboule. Quand il
 * saute, il se balance d'avant en arrière, les ingrédients volent et retombent, des étincelles montent, la flamme gronde et la
 * vapeur siffle ; au repos tout dort dans le fond, et la flamme est éteinte.
 */
export function Wok({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), pan = useRef<Group>(null!), bits = useRef<Group[]>([]), k = useRef(0), since = useRef(0)
  const sparks = useParticles()
  useSquash('wok', g)
  const seeds = useMemo(() => Array.from({ length: BITS }, (_, i) => ({ a: (i / BITS) * TAU * 2.3, r: 0.02 + ((i * 37) % 11) * 0.011, ph: rand(0, TAU), v: rand(4.2, 6.4), m: i % bitMats.length })), [])
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
      // au repos, posé sur le dôme de nouilles ; en l'air, il s'écarte un peu et monte (jamais au-delà du bord)
      const rr = s.r * (1 + u * 0.5 * kk)
      b.position.set(Math.cos(s.a) * rr, domeY(rr) + 0.008 + u * 0.15 * kk, Math.sin(s.a) * rr)
      b.rotation.set(u * kk * 4 + s.ph, s.ph, u * kk * 3)
    })
    since.current += dt
    if (kk > 0.6 && since.current > 0.45) {
      since.current = 0
      sparks.emit(emberTex, position[0] + rand(-0.12, 0.12), position[1] + 0.35 + rand(0, 0.08), position[2] + rand(-0.08, 0.1), { size: 0.075, life: 1.0, vy: 0.9, sway: 0.12, peak: 0.95 })
    }
  })
  const on = useStore((s) => isActive(s, 'wok'))
  return (
    <>
      <group ref={g} userData={{ id: 'wok' }} position={position}>
        {/* le brûleur : une couronne de fonte percée, les trois pieds qui tiennent le wok */}
        <Static>
          <Part geo={cyl(0.19, 0.22, 0.05, 22)} m={K.iron} p={[0, 0.025, 0]} />
          {[0, 1, 2].map((i) => {
            const a = (i / 3) * TAU + 0.5
            return <Part key={i} geo={rbox(0.03, 0.07, 0.03, 0.01)} m={K.iron} p={[Math.cos(a) * 0.17, 0.085, Math.sin(a) * 0.17]} castShadow={false} />
          })}
        </Static>
        <GasFire />
        <group ref={pan} position={[0, 0.1, 0]}>
          <Static>
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
          </Static>
          {/* le contenu : nouilles, lardons, œuf brouillé, ciboule */}
          {seeds.map((s, i) => (
            <group key={i} ref={(el) => void (el && (bits.current[i] = el))}>
              <Part geo={i % 3 === 0 ? cyl(0.012, 0.012, 0.035, 6) : SPH} m={bitMats[s.m]} scale={i % 3 === 0 ? 1 : [0.026, 0.012, 0.018]} castShadow={false} />
            </group>
          ))}
          {/* le dôme de nouilles qui remplit le fond, et des boucles de nouilles posées dessus */}
          <Static>
            <Part geo={SPH} m={K.noodle} scale={[DOME.r, DOME.h, DOME.r]} p={[0, DOME.y, 0]} castShadow={false} />
            {Array.from({ length: 7 }, (_, i) => {
              const a = i * 2.4, r = 0.03 + (i % 3) * 0.045
              return (
                <Part key={i} m={K.noodle} p={[Math.cos(a) * r, domeY(r) - 0.004, Math.sin(a) * r]} rotation={[Math.PI / 2 - 0.25 * (r / 0.12), 0, a]} castShadow={false}>
                  <torusGeometry args={[0.035 + (i % 2) * 0.012, 0.009, 6, 16]} />
                </Part>
              )
            })}
          </Static>
        </group>
        {on && <Steam at={[0, 0.5, 0]} every={1.1} />}
      </group>
      <group ref={sparks.group} />
    </>
  )
}
