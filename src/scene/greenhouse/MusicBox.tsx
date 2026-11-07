import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { TAU } from '../../math'
import { isActive, useStore } from '../../state/store'
import { reduceMotion, useSquash } from '../anim'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { G } from './materials'

/** La table de lecture : plateau rond de bois, un pied tourné, trois pieds en griffe. */
function ReadingTable({ top }: { top: number }) {
  return (
    <Static>
      <Part geo={cyl(0.42, 0.42, 0.04, 28)} m={G.woodDark} p={[0, top - 0.02, 0]} />
      <Part geo={cyl(0.4, 0.4, 0.012, 28)} m={G.inlay} p={[0, top + 0.001, 0]} castShadow={false} />
      <Part geo={cyl(0.04, 0.06, top - 0.1, 12)} m={G.woodDark} p={[0, (top - 0.1) / 2 + 0.04, 0]} />
      <Part geo={SPH} m={G.woodDark} scale={[0.07, 0.05, 0.07]} p={[0, top * 0.5, 0]} castShadow={false} />
      {[0, 1, 2].map((i) => (
        <group key={i} rotation-y={(i / 3) * TAU + 0.4}>
          <Part geo={rbox(0.32, 0.04, 0.05, 0.015)} m={G.woodDark} p={[0.17, 0.03, 0]} rotation-z={0.15} castShadow={false} />
        </group>
      ))}
    </Static>
  )
}

/**
 * La boîte à musique, objet « berceuse » : un coffret de bois verni aux incrustations claires, le couvercle ouvert sur le peigne de
 * laiton et son cylindre à picots, une petite danseuse en tutu qui tourne sur son pivot, la clé qui tourne sur le côté. À chaque
 * note entendue (`pulses.musicbox`), le cylindre avance d'un cran, la danseuse fait une petite révérence. Sur la table, à côté, une
 * tasse de thé sur sa soucoupe et un livre ouvert.
 */
export function MusicBox({ position, top = 0.7 }: { position: V3; top?: number }) {
  const g = useRef<Group>(null!), dancer = useRef<Group>(null!), cyl_ = useRef<Group>(null!), key = useRef<Group>(null!), st = useRef({ seen: useStore.getState().pulses.musicbox ?? 0, step: 0, bow: 0, ph: 0 })
  useSquash('musicbox', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState(), on = isActive(store, 'musicbox')
    const n = store.pulses.musicbox ?? 0
    if (n !== s.seen) {
      s.seen = n
      if (on && !reduceMotion) { s.step += 0.18; s.bow = 1 }
    }
    s.bow = Math.max(0, s.bow - dt * 3)
    if (on && !reduceMotion) s.ph += dt * 1.1
    cyl_.current.rotation.x = s.step
    key.current.rotation.z = -s.ph * 0.9
    dancer.current.rotation.y = s.ph * 2.2
    dancer.current.position.y = 0.19 + Math.sin(s.bow * Math.PI) * 0.012
  })
  return (
    <>
      <group position={[position[0], 0, position[2]]}>
        <ReadingTable top={top} />
        {/* un livre ouvert, face vers le haut, et la tasse de thé sur sa soucoupe */}
        <Static>
          <Part geo={rbox(0.26, 0.02, 0.19, 0.008)} m={G.paper} p={[-0.2, top + 0.02, -0.12]} rotation-y={0.35} castShadow={false} />
          <Part geo={rbox(0.135, 0.012, 0.19, 0.005)} m={G.cushion2} p={[-0.2, top + 0.008, -0.12]} rotation-y={0.35} castShadow={false} />
          <Part geo={cyl(0.07, 0.07, 0.012, 20)} m={G.cream} p={[0.2, top + 0.008, 0.18]} castShadow={false} />
          <Part geo={cyl(0.045, 0.036, 0.06, 18)} m={G.cream} p={[0.2, top + 0.045, 0.18]} castShadow={false} />
          <Part geo={cyl(0.04, 0.04, 0.008, 18)} m={G.lacquer} p={[0.2, top + 0.072, 0.18]} castShadow={false} />
          <Part m={G.cream} p={[0.2, top + 0.045, 0.235]} rotation-y={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.022, 0.007, 6, 12, Math.PI]} />
          </Part>
        </Static>
      </group>
      <group ref={g} userData={{ id: 'musicbox' }} position={[position[0], top, position[2]]} rotation-y={-0.5}>
       {/* un peu plus grande que nature, pour se lire de loin */}
       <group scale={1.5}>
        <Static>
          {/* le coffret : socle, couvercle ouvert en arrière, incrustation et filet de laiton */}
          <Part geo={rbox(0.34, 0.1, 0.24, 0.025)} m={G.lacquer} p={[0, 0.05, 0]} />
          <Part geo={rbox(0.36, 0.014, 0.26, 0.008)} m={G.inlay} p={[0, 0.103, 0]} castShadow={false} />
          <Part geo={rbox(0.3, 0.008, 0.06, 0.004)} m={G.inlay} p={[0.015, 0.06, 0.122]} castShadow={false} />
          <Part geo={rbox(0.04, 0.025, 0.012, 0.006)} m={G.brass} p={[0.175, 0.095, 0]} castShadow={false} />
          {/* le couvercle relevé : une planche inclinée vers l'arrière, sa face intérieure claire, un miroir ovale */}
          <group position={[-0.17, 0.11, 0]} rotation-z={-1.7}>
            <Part geo={rbox(0.2, 0.02, 0.24, 0.01)} m={G.lacquer} p={[0.1, 0, 0]} />
            <Part geo={SPH} m={G.steel} scale={[0.07, 0.003, 0.09]} p={[0.1, 0.012, 0]} castShadow={false} />
          </group>
          {/* le peigne de laiton : une lame de dents fines devant le cylindre */}
          <Part geo={rbox(0.2, 0.012, 0.04, 0.004)} m={G.horn} p={[-0.02, 0.125, 0.06]} castShadow={false} />
          {Array.from({ length: 9 }, (_, i) => <Part key={i} geo={cyl(0.003, 0.003, 0.03, 4)} m={G.horn} p={[-0.1 + i * 0.022, 0.131, 0.045]} rotation-x={Math.PI / 2} castShadow={false} />)}
          {/* le pivot de la danseuse, sur le dessus */}
          <Part geo={cyl(0.03, 0.03, 0.012, 14)} m={G.brass} p={[0.07, 0.118, -0.04]} castShadow={false} />
        </Static>
        {/* le cylindre à picots, qui avance à chaque note */}
        <group ref={cyl_} position={[-0.02, 0.145, -0.03]} rotation-z={Math.PI / 2}>
          <Part geo={cyl(0.026, 0.026, 0.2, 18)} m={G.horn} castShadow={false} />
          {Array.from({ length: 12 }, (_, i) => (
            <group key={i} rotation-y={(i / 12) * TAU}>
              <Part geo={cyl(0.003, 0.003, 0.012, 4)} m={G.steel} p={[0.03, ((i * 5) % 9) * 0.02 - 0.08, 0]} rotation-z={Math.PI / 2} castShadow={false} />
            </group>
          ))}
        </group>
        {/* la danseuse : socle, jupe en tutu, buste, tête, bras levés ; elle tourne sur son pivot */}
        <group ref={dancer} position={[0.07, 0.19, -0.04]} userData={LIVE}>
          <Part geo={cyl(0.01, 0.01, 0.06, 6)} m={G.brass} p={[0, -0.04, 0]} castShadow={false} />
          <Part geo={cyl(0.052, 0.012, 0.03, 16)} m={G.tutu} p={[0, 0.0, 0]} castShadow={false} />
          <Part geo={cyl(0.012, 0.016, 0.04, 8)} m={G.cushion2} p={[0, 0.035, 0]} castShadow={false} />
          <Part geo={SPH} m={G.skinTone} scale={0.014} p={[0, 0.065, 0]} castShadow={false} />
          <Part geo={rbox(0.05, 0.007, 0.007, 0.003)} m={G.skinTone} p={[0, 0.05, 0]} rotation-z={0.5} castShadow={false} />
        </group>
        {/* la clé de remontage, sur le flanc */}
        <group ref={key} position={[0, 0.05, 0.13]} userData={LIVE}>
          <Part geo={cyl(0.008, 0.008, 0.04, 8)} m={G.brass} p={[0, 0, 0.02]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={rbox(0.06, 0.012, 0.01, 0.004)} m={G.brass} p={[0, 0, 0.045]} castShadow={false} />
        </group>
       </group>
      </group>
    </>
  )
}
