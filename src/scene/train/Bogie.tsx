import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { TorusGeometry, type Group, type Material } from 'three'
import { reduceMotion } from '../anim'
import { LIVE, Static } from '../Static'
import { Part, cyl, rbox } from '../parts'

// Un bogie de voiture-lits : deux essieux montés, leurs boîtes d'essieu et leurs ressorts à lames, deux longerons, la traverse
// danseuse sous la caisse. Les roues roulent sur les rails : elles tournent à la vitesse du défilement de la voie.

/** Le rayon d'une roue (au roulement), l'empattement du bogie. */
export const WHEEL_R = 0.3
const BASE = 1.0
/** Le dessus des rails (voir `out/Line.tsx`) : la roue s'y pose. */
const RAIL_TOP = -1.11
const AXLE_Y = RAIL_TOP + WHEEL_R

const TYRE = new TorusGeometry(WHEEL_R - 0.035, 0.04, 8, 32)

export interface BogieMats {
  /** Fonte des roues, essieux, longerons. */
  iron: Material
  /** Le bandage d'acier poli et le boudin. */
  steel: Material
  /** Rayons, moyeux, ressorts : le laiton de la livrée. */
  gold: Material
}

/** Une roue : voile sombre, six rayons dorés, bandage d'acier, boudin du côté intérieur de la voie (`inner` : son signe en z). */
function Wheel({ z, inner, m }: { z: number; inner: number; m: BogieMats }) {
  return (
    <group position={[0, 0, z]}>
      <Part geo={cyl(WHEEL_R - 0.04, WHEEL_R - 0.04, 0.03, 28)} m={m.iron} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={TYRE} m={m.steel} scale={[1, 1, 0.9]} castShadow={false} />
      <Part geo={cyl(WHEEL_R + 0.04, WHEEL_R + 0.04, 0.022, 32)} m={m.steel} p={[0, 0, inner * 0.065]} rotation-x={Math.PI / 2} castShadow={false} />
      {/* six rayons : trois barres d'un bord à l'autre, qui dépassent un peu du voile des deux côtés */}
      {[0, 1, 2].map((k) => (
        <Part key={k} geo={rbox(0.045, 2 * WHEEL_R - 0.1, 0.05, 0.015)} m={m.gold} rotation-z={(k * Math.PI) / 3} castShadow={false} />
      ))}
      <Part geo={cyl(0.075, 0.075, 0.1, 18)} m={m.gold} rotation-x={Math.PI / 2} castShadow={false} />
    </group>
  )
}

/** Un essieu monté : l'axe et ses deux roues, sur les deux files de rails. `spin` : il tourne avec le défilement. */
function Wheelset({ x, rails, m, spin, speed }: { x: number; rails: readonly number[]; m: BogieMats; spin: boolean; speed: number }) {
  const g = useRef<Group>(null!)
  useFrame((_, dt) => {
    // le train roule vers +x : la roue tourne dans le sens horaire vue de +z
    if (spin && !reduceMotion) g.current.rotation.z -= (Math.min(dt, 0.05) * speed) / WHEEL_R
  })
  const lo = Math.min(...rails), hi = Math.max(...rails), mid = (lo + hi) / 2
  const body = (
    <>
      <Part geo={cyl(0.045, 0.045, hi - lo + 0.3, 10)} m={m.iron} p={[0, 0, mid]} rotation-x={Math.PI / 2} castShadow={false} />
      {rails.map((rz) => <Wheel key={rz} z={rz} inner={rz > mid ? -1 : 1} m={m} />)}
    </>
  )
  return spin
    ? <group ref={g} position={[x, AXLE_Y, 0]} userData={LIVE}><Static>{body}</Static></group>
    : <group ref={g} position={[x, AXLE_Y, 0]}>{body}</group>
}

/**
 * Un bogie centré en `x` sous la caisse, sur les rails `rails` (leurs z). Longerons à l'extérieur des roues, boîtes d'essieu, ressorts
 * à lames dorés, traverse danseuse sous la caisse. `spin` : les roues tournent (le bogie qu'on voit, au bout de la voiture).
 */
export function Bogie({ x, rails, m, spin = false, speed = 0 }: { x: number; rails: readonly number[]; m: BogieMats; spin?: boolean; speed?: number }) {
  const lo = Math.min(...rails), hi = Math.max(...rails), mid = (lo + hi) / 2
  return (
    <group position={[x, 0, 0]}>
      {[-BASE / 2, BASE / 2].map((dx) => <Wheelset key={dx} x={dx} rails={rails} m={m} spin={spin} speed={speed} />)}
      {rails.map((rz) => {
        const out = rz > mid ? 1 : -1, z = rz + out * 0.17
        return (
          <group key={rz} position={[0, AXLE_Y, z]}>
            {/* le longeron, au-dessus des boîtes d'essieu, sous la caisse */}
            <Part geo={rbox(BASE + 0.62, 0.16, 0.08, 0.04)} m={m.iron} p={[0, 0.16, 0]} castShadow={false} />
            {[-BASE / 2, BASE / 2].map((dx) => (
              <group key={dx} position={[dx, 0, 0]}>
                {/* la boîte d'essieu et son couvercle */}
                <Part geo={rbox(0.2, 0.2, 0.12, 0.05)} m={m.iron} p={[0, 0, out * 0.01]} castShadow={false} />
                <Part geo={cyl(0.06, 0.06, 0.04, 14)} m={m.gold} p={[0, 0, out * 0.085]} rotation-x={Math.PI / 2} castShadow={false} />
              </group>
            ))}
            {/* le ressort à lames, suspendu au milieu du longeron, ses deux brides */}
            {[0, 1, 2].map((k) => (
              <Part key={k} geo={rbox(0.5 - k * 0.12, 0.025, 0.07, 0.01)} m={m.gold} p={[0, 0.06 - k * 0.03, out * 0.012]} castShadow={false} />
            ))}
            {[-0.2, 0.2].map((dx) => <Part key={dx} geo={rbox(0.03, 0.12, 0.09, 0.01)} m={m.iron} p={[dx, 0.06, 0]} castShadow={false} />)}
          </group>
        )
      })}
      {/* la traverse danseuse, d'un longeron à l'autre, sous la caisse */}
      <Part geo={rbox(0.24, 0.24, hi - lo + 0.42, 0.05)} m={m.iron} p={[0, AXLE_Y + 0.3, mid]} castShadow={false} />
    </group>
  )
}
