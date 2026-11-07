import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { clamp, smooth } from '../../math'
import { reduceMotion, useSquash } from '../anim'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { L } from './materials'
import { JUG_PINK, Jug } from './Jug'

const TOP = 0.9 // le dessus de la table
const T = 0.014 // l'épaisseur de la serviette
// le geste, en secondes depuis le début du son (channels/fold.ts) : secouer, poser, lisser deux fois, plier
const SHAKE = 0.5, LAND = 0.65, PATS = [0.95, 1.25], FOLD0 = 1.55, FOLD1 = 2.15

/** Une serviette pliée de la pile : son éponge, la bande tissée qui en fait le tour. */
function Folded({ p, m, band, w = 0.34, d = 0.26, ry = 0 }: { p: V3; m: typeof L.coral; band: typeof L.coral; w?: number; d?: number; ry?: number }) {
  return (
    <group position={p} rotation-y={ry}>
      {/* sans ombre : 4 cm d'épaisseur n'en font pas une qui se voie, et chaque couleur garde un seul tracé */}
      <Part geo={rbox(w, 0.045, d, 0.018)} m={m} p={[0, 0.0225, 0]} castShadow={false} />
      <Part geo={rbox(0.05, 0.053, d + 0.008, 0.02)} m={band} p={[w * 0.28, 0.0225, 0]} castShadow={false} />
    </group>
  )
}

/**
 * La grande table pliante au milieu de la laverie : un plateau de stratifié crème bordé de menthe, ses pieds de tube et leurs
 * patins, l'étagère du bas (une bassine de linge propre, une boîte de lingettes). Sur le plateau : la pile de serviettes pliées,
 * la bouteille d'adoucissant, une paire de chaussettes roulées, un ticket. Quand son son joue, à chaque geste qu'on entend
 * (`pulses.fold`), la serviette bleue se soulève, se secoue et s'ouvre, retombe à plat, on la lisse deux fois, puis on la plie.
 */
export function FoldingTable({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), towel = useRef<Group>(null!), flap = useRef<Group>(null!)
  const st = useRef({ seen: useStore.getState().pulses.fold ?? 0, t: 99 })
  useSquash('folding', g)
  useFrame((_, delta) => {
    const s = st.current, store = useStore.getState(), p = store.pulses.fold ?? 0
    if (p !== s.seen) {
      s.seen = p
      if (isActive(store, 'folding') && !reduceMotion) s.t = 0
    }
    s.t += Math.min(delta, 0.05)
    const t = s.t
    // ouverte (0) ou pliée (π) : elle s'ouvre en secouant, se replie à la fin
    const open = t < FOLD0 ? smooth(clamp(t / 0.25, 0, 1)) : 1 - smooth(clamp((t - FOLD0) / (FOLD1 - FOLD0), 0, 1))
    const up = t < LAND ? Math.sin(clamp(t / LAND, 0, 1) * Math.PI) : 0
    const wave = t < SHAKE ? Math.sin(t * 30) * 0.18 * (1 - t / SHAKE) : 0
    const pat = PATS.reduce((a, at) => a + Math.max(0, 1 - Math.abs(t - at) / 0.07), 0)
    flap.current.rotation.x = Math.PI * (1 - open) + wave * 0.6
    towel.current.position.y = TOP + up * 0.2
    towel.current.rotation.x = wave * 0.5
    towel.current.scale.set(1, 1 - pat * 0.4, 1)
  })
  return (
    <group ref={g} userData={{ id: 'folding' }} position={position}>
      <Static>
        {/* le plateau et son chant menthe */}
        <Part geo={rbox(0.8, 0.045, 1.6, 0.018)} m={L.laminate} p={[0, TOP - 0.0225, 0]} />
        <Part geo={rbox(0.82, 0.03, 1.62, 0.012)} m={L.mintPaint} p={[0, TOP - 0.05, 0]} castShadow={false} />
        {/* les pieds, leurs patins, les traverses, l'étagère du bas */}
        {[-1, 1].flatMap((sx) => [-1, 1].map((sz) => (
          <group key={`${sx}${sz}`} position={[sx * 0.34, 0, sz * 0.72]}>
            <Part geo={cyl(0.022, 0.022, TOP - 0.06, 12)} m={L.steel} p={[0, (TOP - 0.06) / 2, 0]} />
            <Part geo={cyl(0.03, 0.032, 0.03, 12)} m={L.rubber} p={[0, 0.015, 0]} castShadow={false} />
          </group>
        )))}
        {[-1, 1].map((sx) => (
          <Part key={sx} geo={cyl(0.012, 0.012, 1.44, 8)} m={L.steel} p={[sx * 0.34, 0.22, 0]} rotation-x={Math.PI / 2} castShadow={false} />
        ))}
        <Part geo={rbox(0.66, 0.02, 1.42, 0.008)} m={L.steelDark} p={[0, 0.23, 0]} />
        {/* sur l'étagère : la bassine de linge propre (ses parois basses devant), une boîte de lingettes */}
        <group position={[0.02, 0.24, -0.32]}>
          <Part geo={rbox(0.46, 0.02, 0.5, 0.01)} m={L.basket} p={[0, 0.01, 0]} castShadow={false} />
          <Part geo={rbox(0.46, 0.16, 0.02, 0.01)} m={L.basket} p={[0, 0.08, -0.24]} castShadow={false} />
          <Part geo={rbox(0.02, 0.16, 0.5, 0.01)} m={L.basket} p={[-0.22, 0.08, 0]} castShadow={false} />
          <Part geo={rbox(0.46, 0.1, 0.02, 0.01)} m={L.basket} p={[0, 0.05, 0.24]} castShadow={false} />
          <Part geo={rbox(0.02, 0.1, 0.5, 0.01)} m={L.basket} p={[0.22, 0.05, 0]} castShadow={false} />
          {/* deux piles de linge plié dans la bassine */}
          <Folded p={[-0.08, 0.02, -0.08]} m={L.white} band={L.sky} w={0.24} d={0.2} />
          <Folded p={[-0.08, 0.066, -0.08]} m={L.pinkCloth} band={L.white} w={0.22} d={0.19} ry={0.08} />
          <Folded p={[0.1, 0.02, 0.1]} m={L.sky} band={L.white} w={0.2} d={0.2} ry={-0.1} />
        </group>
        <group position={[0.05, 0.24, 0.35]} rotation-y={0.2}>
          <Part geo={rbox(0.22, 0.1, 0.12, 0.02)} m={L.mintPaint} p={[0, 0.05, 0]} />
          <Part geo={SPH} m={L.white} scale={[0.04, 0.025, 0.03]} p={[0, 0.105, 0]} castShadow={false} />
        </group>
        {/* sur le plateau : la pile de serviettes pliées, au bout */}
        <Folded p={[0.02, TOP, -0.52]} m={L.coral} band={L.white} />
        <Folded p={[0.0, TOP + 0.046, -0.52]} m={L.mintCloth} band={L.white} ry={0.05} />
        <Folded p={[0.03, TOP + 0.092, -0.53]} m={L.butter} band={L.coral} ry={-0.06} />
        <Folded p={[0.01, TOP + 0.138, -0.51]} m={L.lilac} band={L.butter} w={0.3} d={0.24} ry={0.1} />
        <Jug p={[-0.27, TOP, -0.31]} ry={0.3} {...JUG_PINK} w={0.1} h={0.19} d={0.075} />
        {/* le panier de linge à plier, au bout de devant : ses parois ajourées (basses devant), les vêtements en vrac */}
        <group position={[0.02, TOP, 0.6]} rotation-y={0.08}>
          <Part geo={rbox(0.5, 0.02, 0.34, 0.01)} m={L.basket} p={[0, 0.01, 0]} castShadow={false} />
          <Part geo={rbox(0.5, 0.2, 0.02, 0.01)} m={L.basket} p={[0, 0.1, -0.16]} />
          <Part geo={rbox(0.02, 0.2, 0.34, 0.01)} m={L.basket} p={[-0.24, 0.1, 0]} />
          <Part geo={rbox(0.5, 0.13, 0.02, 0.01)} m={L.basket} p={[0, 0.065, 0.16]} castShadow={false} />
          <Part geo={rbox(0.02, 0.13, 0.34, 0.01)} m={L.basket} p={[0.24, 0.065, 0]} castShadow={false} />
          {/* les jours dans les parois : des fentes sombres */}
          {[-0.15, -0.05, 0.05, 0.15].map((x) => (
            <Part key={x} geo={rbox(0.05, 0.05, 0.008, 0.004)} m={L.frameDark} p={[x, 0.07, 0.171]} castShadow={false} />
          ))}
          {[-0.08, 0.08].map((z) => (
            <Part key={z} geo={rbox(0.008, 0.05, 0.06, 0.004)} m={L.frameDark} p={[0.251, 0.07, z]} castShadow={false} />
          ))}
          <Part geo={SPH} m={L.coral} scale={[0.2, 0.07, 0.12]} p={[-0.03, 0.12, 0.0]} rotation-y={0.3} castShadow={false} />
          <Part geo={SPH} m={L.white} scale={[0.13, 0.06, 0.1]} p={[0.1, 0.15, 0.03]} rotation-y={-0.4} castShadow={false} />
          <Part geo={SPH} m={L.lilac} scale={[0.1, 0.05, 0.08]} p={[-0.12, 0.16, -0.04]} castShadow={false} />
          {/* une manche qui pend par-dessus le bord */}
          <Part geo={rbox(0.07, 0.12, 0.025, 0.012)} m={L.coral} p={[0.05, 0.12, 0.18]} rotation-x={0.25} castShadow={false} />
        </group>
        {/* les chaussettes roulées, près de la serviette */}
        <Part geo={SPH} m={L.coral} scale={[0.05, 0.04, 0.045]} p={[0.27, TOP + 0.038, -0.18]} castShadow={false} />
        <Part geo={SPH} m={L.white} scale={[0.035, 0.03, 0.04]} p={[0.27, TOP + 0.03, -0.1]} castShadow={false} />
      </Static>
      {/* la serviette qu'on plie : une moitié posée, l'autre qui se rabat dessus ; l'éponge et sa bande sur chaque face */}
      <group ref={towel} position={[0, TOP, 0.02]} userData={LIVE}>
        <group position={[0, 0, 0.13]}>
          <mesh geometry={rbox(0.4, T, 0.26, 0.006)} material={L.sky} position={[0, T / 2, 0]} castShadow receiveShadow raycast={noRay} />
          <mesh material={L.towelSky} position={[0, T + 0.002, 0]} rotation-x={-Math.PI / 2} raycast={noRay}>
            <planeGeometry args={[0.39, 0.25]} />
          </mesh>
        </group>
        <group ref={flap} position={[0, T, 0]} rotation-x={Math.PI}>
          <mesh geometry={rbox(0.4, T, 0.26, 0.006)} material={L.sky} position={[0, -T / 2, -0.13]} castShadow receiveShadow raycast={noRay} />
          <mesh material={L.towelSky} position={[0, 0.002, -0.13]} rotation-x={-Math.PI / 2} raycast={noRay}>
            <planeGeometry args={[0.39, 0.25]} />
          </mesh>
          <mesh material={L.towelSky} position={[0, -T - 0.002, -0.13]} rotation-x={Math.PI / 2} raycast={noRay}>
            <planeGeometry args={[0.39, 0.25]} />
          </mesh>
        </group>
      </group>
    </group>
  )
}
