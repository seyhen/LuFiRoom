import { useRef, type RefObject } from 'react'
import type { Group } from 'three'
import { reduceMotion } from '../anim'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { useBeat } from '../objects/useBeat'
import { L } from './materials'

const W = 0.56, H = 0.28, D = 0.15 // largeur (z), hauteur, profondeur (x : la façade regarde vers +x)
const FX = D / 2 // la façade

/** Un haut-parleur : la bague chromée, la grille, le cône qui bat sur le kick (sa ref). */
function Speaker({ z, cone }: { z: number; cone: RefObject<Group> }) {
  return (
    <group position={[FX, 0.13, z]}>
      <Static>
        <Part m={L.chrome} p={[0.012, 0, 0]} rotation-y={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.072, 0.011, 10, 32]} />
        </Part>
        <Part geo={cyl(0.07, 0.07, 0.012, 28)} m={L.grille} p={[0.004, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      </Static>
      <group ref={cone} position={[0.012, 0, 0]}>
        <Part geo={SPH} m={L.boomboxDark} scale={[0.012, 0.045, 0.045]} castShadow={false} />
        <Part geo={SPH} m={L.chrome} scale={[0.01, 0.018, 0.018]} p={[0.008, 0, 0]} castShadow={false} />
      </group>
    </group>
  )
}

/**
 * Le radiocassette posé sur le lave-linge n° 4 : c'est l'objet « radio » de la laverie. Un boîtier jaune beurre aux angles ronds,
 * deux haut-parleurs à bague chromée, la fenêtre de la cassette au milieu (ses deux bobines tournent quand la musique joue), le
 * cadran FM / AM et son aiguille, les touches de lecture sur le dessus, la poignée, l'antenne. Sur le kick : il rebondit, les cônes
 * battent, le voyant s'allume, des notes s'envolent. À côté, le boîtier d'une autre cassette.
 */
export function Boombox({ position, ry = 0 }: { position: V3; ry?: number }) {
  const reels = [useRef<Group>(null!), useRef<Group>(null!)], cones = [useRef<Group>(null!), useRef<Group>(null!)], turn = useRef(0)
  const { g, notes } = useBeat(position, 0.5, (on, _t, pulse) => {
    if (on && !reduceMotion) turn.current += 0.05
    reels.forEach((r) => (r.current.rotation.x = -turn.current))
    const k = on ? 1 + pulse * 0.9 : 1
    cones.forEach((c) => c.current.scale.set(k, 1, 1))
    L.led.emissiveIntensity = on ? 0.5 + pulse * 1.2 : 0
    L.tuner.emissiveIntensity = on ? 0.45 + pulse * 0.2 : 0.12
  }, 0.04, { vy: 0.45, dx: 0.35 })
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position} rotation-y={ry}>
        <Static>
          {/* le boîtier, ses patins, la façade sombre en léger relief */}
          <Part geo={rbox(D, H, W, 0.05)} m={L.boombox} p={[0, H / 2 + 0.012, 0]} />
          {[-0.2, 0.2].map((z) => (
            <Part key={z} geo={rbox(0.1, 0.014, 0.08, 0.006)} m={L.rubber} p={[0, 0.007, z]} castShadow={false} />
          ))}
          <Part geo={rbox(0.02, 0.21, W - 0.06, 0.02)} m={L.boomboxDark} p={[FX + 0.0, 0.14, 0]} castShadow={false} />
          {/* la fenêtre de la cassette, le cadran et son aiguille */}
          <mesh material={L.cassette} position={[FX + 0.012, 0.13, 0]} rotation-y={Math.PI / 2} raycast={noRay}>
            <planeGeometry args={[0.14, 0.07]} />
          </mesh>
          <mesh material={L.tuner} position={[FX + 0.012, 0.215, 0]} rotation-y={Math.PI / 2} raycast={noRay}>
            <planeGeometry args={[0.3, 0.035]} />
          </mesh>
          {/* le voyant, le bouton de volume */}
          <Part geo={SPH} m={L.led} scale={0.009} p={[FX + 0.013, 0.065, 0.05]} castShadow={false} />
          <Part geo={cyl(0.018, 0.018, 0.02, 14)} m={L.chrome} p={[FX + 0.015, 0.065, -0.05]} rotation-z={Math.PI / 2} castShadow={false} />
          {/* les touches de lecture sur le dessus, à l'avant ; l'une est enfoncée (lecture) */}
          {[-0.09, -0.054, -0.018, 0.018, 0.054, 0.09].map((z, i) => (
            <Part key={z} geo={rbox(0.05, 0.022, 0.03, 0.008)} m={i === 2 ? L.coral : L.reel} p={[0.03, H + 0.012 + (i === 2 ? 0.004 : 0.01), z]} castShadow={false} />
          ))}
          {/* la poignée sur ses deux pattes, l'antenne couchée le long du dessus */}
          {[-0.2, 0.2].map((z) => (
            <Part key={z} geo={rbox(0.05, 0.05, 0.03, 0.012)} m={L.boomboxDark} p={[-0.02, H + 0.035, z]} castShadow={false} />
          ))}
          <Part geo={cyl(0.016, 0.016, 0.42, 12)} m={L.chrome} p={[-0.02, H + 0.07, 0]} rotation-x={Math.PI / 2} castShadow={false} />
          <group position={[-0.06, H + 0.02, -0.24]} rotation={[0.55, 0, 0.12]}>
            <Part geo={cyl(0.007, 0.007, 0.3, 8)} m={L.chrome} p={[0, 0.15, 0]} castShadow={false} />
            <Part geo={SPH} m={L.chrome} scale={0.013} p={[0, 0.3, 0]} castShadow={false} />
          </group>
          {/* le boîtier d'une autre cassette, posé derrière, à plat */}
          <group position={[-0.17, 0.006, 0.2]} rotation-y={0.4}>
            <Part geo={rbox(0.07, 0.012, 0.11, 0.004)} m={L.glass} castShadow={false} />
            <Part geo={rbox(0.06, 0.008, 0.1, 0.003)} m={L.coral} p={[0, -0.001, 0]} castShadow={false} />
          </group>
        </Static>
        <Speaker z={-0.17} cone={cones[0]} />
        <Speaker z={0.17} cone={cones[1]} />
        {/* les deux bobines de la cassette, qui tournent */}
        {[-0.035, 0.035].map((z, i) => (
          <group key={z} ref={reels[i]} position={[FX + 0.016, 0.124, z]}>
            <Part geo={cyl(0.017, 0.017, 0.006, 14)} m={L.reel} rotation-z={Math.PI / 2} castShadow={false} />
            {[0, 1, 2].map((k) => (
              <Part key={k} geo={rbox(0.004, 0.022, 0.005, 0.002)} m={L.boomboxDark} p={[0.004, 0, 0]} rotation-x={(k * Math.PI) / 3} castShadow={false} />
            ))}
          </group>
        ))}
      </group>
      <group ref={notes.group} />
    </>
  )
}
