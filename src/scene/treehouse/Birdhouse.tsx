import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, smooth } from '../../math'
import { rb } from './box'
import { SPH_MID as SPH } from '../igloo/spheres'
import { Part, cyl, noRay, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { mood, reduceMotion, useSquash } from '../anim'
import { T } from './materials'
import { FUR, robinGeo } from './Creatures'

const W = 0.24, H = 0.3, D = 0.22 // largeur (z), hauteur des murs, profondeur (x)
/** Le nichoir est un peu plus grand que nature : il se lit de loin. Son dos touche la branche (voir TreehouseScene). */
export const BH_S = 1.5
/** La distance du centre de la branche au centre du nichoir, dans le repère du nichoir. */
const LIMB_D = 0.21

/**
 * Le nichoir cloué sur la seconde branche, au-dessus du hamac : une boîte peinte vert sauge, son toit à deux pans de bois blond, le
 * trou d'envol et son perchoir, la planche de dos fixée à la branche par deux colliers de fil de fer, un brin de paille qui dépasse
 * du trou, une soucoupe de graines dessous. C'est l'objet « les oiseaux » : le jour, un rouge-gorge se tient sur le perchoir et chante
 * à chaque phrase qu'on entend (il lève la tête, gonfle sa gorge, sa queue bat) ; la nuit, il rentre dormir.
 */
export function Birdhouse({ position, ry = 0 }: { position: V3; ry?: number }) {
  const g = useRef<Group>(null!), bird = useRef<Group>(null!), head = useRef<Group>(null!)
  const robin = useMemo(robinGeo, [])
  const st = useRef({ seen: useStore.getState().pulses.forest ?? 0, song: 0, show: 1 - mood.night })
  useSquash('birdhouse', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState(), on = isActive(store, 'birdhouse')
    const n = store.pulses.forest ?? 0
    if (n !== s.seen) {
      s.seen = n
      if (on && !store.night && !reduceMotion) s.song = 1
    }
    s.song = Math.max(0, s.song - dt * 0.6)
    s.show = approach(s.show, mood.night < 0.5 ? 1 : 0, dt * 0.8)
    const k = smooth(s.show), h = Math.sin(Math.min(1, s.song * 1.4) * Math.PI) * (s.song > 0 ? 1 : 0)
    bird.current.visible = k > 0.02
    bird.current.scale.setScalar(Math.max(0.001, k) * 1.2)
    // il chante : la tête se lève, le corps se redresse un peu, de petits frémissements
    bird.current.rotation.z = h * 0.22 + Math.sin(s.song * 40) * 0.03 * s.song
    head.current.scale.setScalar(1 + h * 0.06)
  })
  const roofA = Math.atan2(0.11, W / 2)
  return (
    <group ref={g} userData={{ id: 'birdhouse' }} position={position} rotation-y={ry}>
     <group scale={BH_S}>
      <Static>
        {/* la planche de dos, plus haute que la boîte, et les deux colliers de fil de fer autour de la branche */}
        <Part geo={rb(0.03, H + 0.32, W - 0.04, 0.012)} m={T.plank} p={[-D / 2 - 0.015, H / 2 + 0.02, 0]} />
        {[0.02, H + 0.05].map((y) => (
          <Part key={y} m={T.iron} p={[-LIMB_D, y, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.105, 0.007, 6, 20]} />
          </Part>
        ))}
        {/* la boîte peinte, le liseré crème du bas */}
        <Part geo={rb(D, H, W, 0.025)} m={T.cushion2} p={[0, H / 2, 0]} />
        <Part geo={rb(D + 0.02, 0.03, W + 0.02, 0.01)} m={T.linen} p={[0, 0.015, 0]} castShadow={false} />
        {/* le pignon de devant : un triangle (une boîte tournée), sous le toit */}
        <Part geo={rb(0.02, 0.12, 0.12, 0.01)} m={T.cushion2} p={[D / 2 - 0.02, H + 0.0, 0]} rotation-x={Math.PI / 4} castShadow={false} />
        {/* le toit à deux pans, qui déborde, et son faîtage */}
        {[-1, 1].map((k) => (
          <Part key={k} geo={rb(D + 0.1, 0.025, W / 2 + 0.07, 0.01)} m={T.terracotta} p={[0, H + 0.06, k * (W / 4 + 0.025)]} rotation-x={k * roofA} />
        ))}
        <Part geo={cyl(0.016, 0.016, D + 0.12, 8)} m={T.ridge} p={[0, H + 0.1, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        {/* le trou d'envol (son ombre, son bord clair), le perchoir */}
        <mesh material={T.iron} position={[D / 2 + 0.004, H * 0.66, 0]} rotation-y={Math.PI / 2} raycast={noRay}>
          <circleGeometry args={[0.045, 20]} />
        </mesh>
        <Part m={T.linen} p={[D / 2 + 0.004, H * 0.66, 0]} rotation-y={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.047, 0.007, 6, 20]} />
        </Part>
        <Part geo={cyl(0.009, 0.009, 0.12, 6)} m={T.plankDark} p={[D / 2 + 0.06, H * 0.36, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        {/* des brins de paille qui dépassent du trou : on y niche */}
        <Part geo={cyl(0.009, 0.009, 0.11, 4)} m={T.dried} p={[D / 2 + 0.03, H * 0.62, 0.02]} rotation={[0.4, 0, 1.2]} castShadow={false} />
        <Part geo={cyl(0.009, 0.009, 0.09, 4)} m={T.dried} p={[D / 2 + 0.025, H * 0.6, -0.02]} rotation={[-0.5, 0, 1.4]} castShadow={false} />
        {/* la soucoupe de graines, suspendue sous la boîte par trois ficelles */}
        <group position={[0.02, -0.2, 0]}>
          <Part geo={cyl(0.1, 0.08, 0.03, 18)} m={T.terracotta} />
          <Part geo={cyl(0.085, 0.085, 0.01, 18)} m={T.dried} p={[0, 0.02, 0]} castShadow={false} />
          {[0, 2.1, 4.2].map((a) => (
            <Part key={a} geo={cyl(0.009, 0.009, 0.21, 4)} m={T.twine} p={[Math.cos(a) * 0.06, 0.12, Math.sin(a) * 0.06]} rotation={[Math.sin(a) * 0.28, 0, -Math.cos(a) * 0.28]} castShadow={false} />
          ))}
        </group>
      </Static>
      {/* le rouge-gorge, sur le perchoir, tourné vers la cabane */}
      <group position={[D / 2 + 0.08, H * 0.36 + 0.012, 0]} userData={LIVE}>
        <group ref={bird} rotation-y={-0.5}>
          <group ref={head}>
            <mesh geometry={robin} material={FUR} castShadow />
          </group>
          {[-1, 1].map((k) => (
            <group key={k}>
              <mesh geometry={SPH} material={T.eye} scale={0.0085} position={[0.083, 0.142, k * 0.03]} />
              <mesh geometry={SPH} material={T.glint} scale={0.0028} position={[0.09, 0.146, k * 0.032]} />
            </group>
          ))}
        </group>
      </group>
     </group>
    </group>
  )
}
