import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Group, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, rand } from '../../math'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { reduceMotion, useParticles, useSquash } from '../anim'
import { glowTex, noteTexA, noteTexB } from '../textures'
import { C } from './materials'

// Plateau : le disque tourne au centre de (DX, 0) ; le bras pivote en (PX, PZ), à l'arrière droit.
const DX = -0.16
const PX = 0.38, PZ = -0.2
const ARM = 0.52
// Angle du bras (autour de la verticale) : posé sur son repos, hors du disque, puis sur le premier sillon.
const REST = -0.2, DROP = 0.03

const LED_ON = 0xffb454, LED_OFF = 0x5a3a2a

/**
 * Tourne-disque valise : le disque tourne, le bras se pose sur le sillon, le voyant s'allume, des notes s'envolent
 * et le haut-parleur du couvercle bat sur le kick. Il pilote la musique de la cabane (le son « radio »).
 */
export function Turntable({ position = [1.9, 0.71, -2.64] }: { position?: V3 }) {
  const [px, py, pz] = position
  const g = useRef<Group>(null!), disc = useRef<Group>(null!), arm = useRef<Group>(null!), glow = useRef<Sprite>(null!)
  const notes = useParticles()
  const play = useRef({ speed: 0, angle: 0, arm: REST, lift: 0.1 })
  const beat = useRef({ seen: useStore.getState().kicks, at: -10, flip: false })
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), t = clock.elapsedTime, s = useStore.getState(), on = isActive(s, 'turntable'), p = play.current, b = beat.current
    if (s.kicks !== b.seen) {
      b.seen = s.kicks
      b.at = t
      if (on) {
        b.flip = !b.flip
        notes.emit(b.flip ? noteTexA : noteTexB, px + rand(-0.35, 0.3), py + 0.95, pz + 0.3, { size: 0.28, life: 2.8, vy: 0.5, sway: 0.14 })
      }
    }
    // Le disque prend de la vitesse, le bras se pose (et se lève avant de revenir au repos).
    p.speed = approach(p.speed, on && !reduceMotion ? 3.4 : 0, dt * 1.6)
    p.angle -= p.speed * dt
    disc.current.rotation.y = p.angle
    const target = on ? DROP + (reduceMotion ? 0 : 0.035 * Math.sin(t * 0.12)) : REST
    p.arm += (target - p.arm) * Math.min(1, dt * (reduceMotion ? 60 : 2.4))
    p.lift += ((on ? 0 : 0.11) - p.lift) * Math.min(1, dt * (reduceMotion ? 60 : 3.2))
    arm.current.rotation.set(0, p.arm, -p.lift)
    C.led.color.setHex(on ? LED_ON : LED_OFF)
    glow.current.material.opacity = on ? 0.8 + Math.sin(t * 2) * 0.05 : 0
  })
  useSquash('turntable', g, (t) => (isActive(useStore.getState(), 'turntable') ? Math.exp(-(t - beat.current.at) * 9) * 0.04 : 0))
  return (
    <>
      <group ref={g} userData={{ id: 'turntable' }} position={position}>
        {/* valise, plateau, deux boutons et le voyant */}
        <Part geo={rbox(1.14, 0.2, 0.7, 0.08)} m={C.deck} p={[0, 0.1, 0]} />
        <Part geo={rbox(1.04, 0.035, 0.6, 0.03)} m={C.deckPlate} p={[0, 0.2175, 0]} />
        {[0.28, 0.4].map((x) => (
          <Part key={x} geo={cyl(0.034, 0.038, 0.04, 14)} m={C.brass} p={[x, 0.255, 0.21]} castShadow={false} />
        ))}
        <Part geo={SPH} m={C.led} scale={0.02} p={[0.47, 0.24, 0.23]} castShadow={false} />
        <sprite ref={glow} scale={0.26} position={[0.47, 0.25, 0.23]} raycast={noRay}>
          <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
        </sprite>
        {/* platine : plateau d'acier, feutrine, disque (qui tourne), étiquette, axe */}
        <Part geo={cyl(0.285, 0.285, 0.03, 40)} m={C.steel} p={[DX, 0.25, 0]} />
        <Part geo={cyl(0.268, 0.268, 0.012, 40)} m={C.felt} p={[DX, 0.271, 0]} castShadow={false} />
        <group ref={disc} position={[DX, 0, 0]}>
          <mesh geometry={cyl(0.256, 0.256, 0.012, 56)} material={[C.vinylEdge, C.vinyl, C.vinylEdge]} position={[0, 0.283, 0]} castShadow receiveShadow />
          <mesh geometry={cyl(0.085, 0.085, 0.006, 28)} material={[C.vinylEdge, C.label, C.vinylEdge]} position={[0, 0.2905, 0]} />
        </group>
        <Part geo={cyl(0.012, 0.012, 0.045, 10)} m={C.brass} p={[DX, 0.305, 0]} castShadow={false} />
        {/* bras : socle, pivot, tube, contrepoids, tête de lecture */}
        <Part geo={cyl(0.052, 0.062, 0.05, 20)} m={C.steel} p={[PX, 0.26, PZ]} />
        <group ref={arm} position={[PX, 0.305, PZ]} rotation-y={REST}>
          <Part geo={cyl(0.034, 0.034, 0.045, 14)} m={C.brass} p={[0, 0.01, 0]} castShadow={false} />
          <Part geo={cyl(0.011, 0.011, ARM, 8)} m={C.brass} p={[-ARM / 2, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.034, 0.034, 0.08, 12)} m={C.steel} p={[0.1, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          <Part geo={rbox(0.11, 0.022, 0.055, 0.01)} m={C.brass} p={[-ARM - 0.025, -0.012, 0.012]} rotation-y={-0.32} castShadow={false} />
          <Part geo={rbox(0.045, 0.03, 0.03, 0.01)} m={C.deckPlate} p={[-ARM - 0.045, -0.032, 0.02]} rotation-y={-0.32} castShadow={false} />
        </group>
        {/* couvercle ouvert, adossé : coque verte dehors, haut-parleur à l'intérieur */}
        <group position={[0, 0.2, -0.35]} rotation-x={-1.45}>
          <Part geo={rbox(1.14, 0.06, 0.7, 0.04)} m={C.deck} p={[0, 0.03, 0.35]} />
          <mesh position={[0, -0.001, 0.35]} rotation-x={Math.PI / 2} material={C.lid} receiveShadow>
            <planeGeometry args={[1.08, 0.64]} />
          </mesh>
          <Part geo={rbox(0.5, 0.03, 0.03, 0.012)} m={C.brass} p={[0, 0.03, 0.7]} castShadow={false} />
        </group>
      </group>
      <group ref={notes.group} />
    </>
  )
}
