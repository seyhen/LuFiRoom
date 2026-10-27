import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Sprite } from 'three'
import { TAU, rand, smooth } from '../../math'
import { Batch, Part, SPH, cyl, noRay, rbox } from '../parts'
import { LIVE, Static } from '../Static'
import { mood, reduceMotion } from '../anim'
import { glowTex } from '../textures'
import { seeded } from '../paint'
import { I } from './materials'
import { SPH_LO, SPH_MID } from './spheres'
import { along, polar } from './IglooShell'

/**
 * Le traîneau de l'expédition, garé au bord de l'île à droite : deux patins de bois relevés devant, les montants et le plateau,
 * le chargement sous une bâche kaki sanglée, une pelle à neige, la corde de trait enroulée devant.
 */
export function Sled({ a }: { a: number }) {
  return (
    <group position={polar(a, 3.55, 0)} rotation-y={along(a)}>
      {[-0.22, 0.22].map((z) => (
        <group key={z} position={[0, 0, z]}>
          {/* le patin, et sa pointe qui part de son bout, monte et revient en crosse vers la rambarde */}
          <Part geo={rbox(1.25, 0.04, 0.05, 0.015)} m={I.wood} p={[-0.05, 0.03, 0]} />
          <Part m={I.wood} p={[0.575, 0.13, 0]} rotation-z={-Math.PI / 2} scale={[1, 1, 1.4]}>
            <torusGeometry args={[0.1, 0.02, 8, 20, Math.PI]} />
          </Part>
          {/* les montants */}
          {[-0.5, -0.15, 0.2, 0.45].map((x) => (
            <Part key={x} geo={cyl(0.018, 0.018, 0.2, 8)} m={I.wood} p={[x, 0.14, 0]} castShadow={false} />
          ))}
          {/* la rambarde */}
          <Part geo={cyl(0.016, 0.016, 1.05, 8)} m={I.wood} p={[-0.02, 0.36, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          {[-0.5, 0.45].map((x) => (
            <Part key={x} geo={cyl(0.015, 0.015, 0.14, 8)} m={I.wood} p={[x, 0.29, 0]} castShadow={false} />
          ))}
        </group>
      ))}
      {/* le plateau de lattes */}
      {[-0.45, -0.25, -0.05, 0.15, 0.35].map((x) => (
        <Part key={x} geo={rbox(0.14, 0.025, 0.52, 0.01)} m={I.crate} p={[x, 0.25, 0]} castShadow={false} />
      ))}
      {/* le chargement bâché, ses deux sangles */}
      <Part geo={rbox(0.85, 0.32, 0.46, 0.13)} m={I.canvas} p={[-0.1, 0.42, 0]} />
      {[-0.32, 0.12].map((x) => (
        <Part key={x} geo={rbox(0.04, 0.34, 0.48, 0.02)} m={I.leatherDark} p={[x, 0.42, 0]} castShadow={false} />
      ))}
      {/* le tapis roulé sur le dessus, la pelle couchée, la neige qui a pris sur la bâche */}
      <Part geo={cyl(0.08, 0.08, 0.44, 16)} m={I.rust} p={[-0.1, 0.65, 0.02]} rotation-x={Math.PI / 2} />
      <Part geo={SPH} m={I.snow} scale={[0.15, 0.03, 0.17]} p={[-0.37, 0.585, 0]} castShadow={false} />
      {/* la pelle à neige plantée à côté du traîneau (côté caméra), le manche appuyé sur la rambarde */}
      <group position={[0.42, 0.16, -0.38]} rotation-x={0.45}>
        <Part geo={rbox(0.18, 0.2, 0.02, 0.02)} m={I.orange} p={[0, -0.08, 0]} />
        <Part geo={cyl(0.016, 0.016, 0.42, 8)} m={I.wood} p={[0, 0.23, 0]} castShadow={false} />
        <Part geo={rbox(0.11, 0.025, 0.03, 0.012)} m={I.leatherDark} p={[0, 0.45, 0]} castShadow={false} />
        <Part geo={SPH} m={I.snow} scale={[0.13, 0.03, 0.08]} p={[0, -0.16, 0.02]} castShadow={false} />
      </group>
      {/* la corde de trait, enroulée sur la neige devant les patins */}
      {[0.11, 0.085, 0.06].map((r, i) => (
        <Part key={r} m={I.rope} p={[0.85, 0.018 + i * 0.016, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[r, 0.014, 6, 20]} />
        </Part>
      ))}
    </group>
  )
}

// Les festons du bord d'un étage (les bouts des branches), en sphères légères : il y en a plus de cent (des Part : le Static les fusionne).
const fringe = (w: number) =>
  Array.from({ length: 9 }, (_, k) => {
    const a = (k / 9) * TAU
    return { p: [Math.cos(a) * w * 0.86, 0.04, Math.sin(a) * w * 0.86] as [number, number, number], s: [w * 0.26, w * 0.13, w * 0.26] as [number, number, number] }
  })

/**
 * Un sapin chargé de neige : un tronc court, quatre étages de branches arrondies (pas de pointe : on reste « gummy »), chacun
 * coiffé d'une couche de neige qui déborde un peu.
 */
export function Fir({ a, r, h = 2, ry = 0 }: { a: number; r: number; h?: number; ry?: number }) {
  const k = h / 2
  return (
    <group position={polar(a, r, 0)} rotation-y={ry} scale={k}>
      <Part geo={cyl(0.07, 0.09, 0.3, 10)} m={I.bark} p={[0, 0.15, 0]} />
      {[[0.5, 0.3, 0.42], [0.42, 0.68, 0.36], [0.32, 1.02, 0.3], [0.2, 1.32, 0.24]].map(([w, y, hh], i) => (
        <group key={i} position={[0, y, 0]} rotation-y={i * 0.9}>
          {/* l'étage de branches : un cône doux, son bord qui retombe en festons (des branches, pas un abat-jour) */}
          <Part geo={cyl(w * 0.35, w * 0.92, hh, 32)} m={i % 2 ? I.pine : I.pineDeep} p={[0, hh / 2, 0]} />
          {fringe(w).map((f, k) => (
            <Part key={k} geo={SPH_LO} m={i % 2 ? I.pine : I.pineDeep} scale={f.s} p={f.p} castShadow={false} />
          ))}
          {/* la neige posée sur le dessus, qui déborde un peu d'un côté */}
          <Part geo={SPH} m={I.snow} scale={[w * 0.66, hh * 0.28, w * 0.6]} p={[w * 0.04, hh * 0.82, 0]} castShadow={false} />
        </group>
      ))}
      <Part geo={SPH} m={I.snow} scale={[0.13, 0.15, 0.13]} p={[0, 1.62, 0]} castShadow={false} />
    </group>
  )
}

/**
 * La lanterne de neige, au devant de l'île : une pyramide de boules de neige posées en rangs (on en fait sur le pas de la porte, les
 * soirs d'hiver), une bougie dedans dont la lueur passe entre les boules. Elle luit doucement le jour, chaudement la nuit.
 */
export function SnowLantern({ a }: { a: number }) {
  const glow = useRef<Sprite>(null!), ph = useRef(rand(0, 9))
  const balls = useMemo(() => {
    const out: { p: [number, number, number]; s: number }[] = []
    for (const [n, rr, y, s] of [[9, 0.3, 0.09, 0.1], [7, 0.23, 0.26, 0.095], [5, 0.15, 0.42, 0.085], [3, 0.075, 0.56, 0.075]] as const) {
      for (let i = 0; i < n; i++) {
        const t = (i / n) * TAU + y * 3
        out.push({ p: [Math.cos(t) * rr, y, Math.sin(t) * rr], s })
      }
    }
    out.push({ p: [0, 0.67, 0], s: 0.07 })
    return out
  }, [])
  useFrame((_, delta) => {
    if (!reduceMotion) ph.current += Math.min(delta, 0.05) * 5
    const n = smooth(mood.night), f = 1 + Math.sin(ph.current) * 0.06
    glow.current.material.opacity = (0.2 + n * 0.7) * f
    I.snowLit.emissiveIntensity = (0.04 + n * 0.42) * f
  })
  return (
    <group position={polar(a, 3.55, 0)}>
      <Batch geo={SPH_MID} m={I.snowLit} items={balls} shadow />
      {/* la bougie au cœur, et sa lueur */}
      <Part geo={cyl(0.03, 0.03, 0.08, 10)} m={I.wool} p={[0, 0.04, 0]} castShadow={false} />
      <Part geo={SPH} m={I.flame} scale={[0.02, 0.04, 0.02]} p={[0, 0.12, 0]} castShadow={false} />
      {/* la lueur, un peu devant la pyramide (côté caméra) : derrière les boules, on ne la verrait pas */}
      <sprite ref={glow} scale={1.5} position={[0.28, 0.32, 0.28]} raycast={noRay} userData={LIVE}>
        <spriteMaterial map={glowTex} color={0xffb36a} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}

/**
 * Les skis de l'explorateur plantés dans la neige près de l'entrée, pointes en l'air, et ses deux bâtons croisés ; à la dragonne
 * d'un bâton pend une petite lanterne qui éclaire le pas de la porte le soir.
 */
export function Skis({ a }: { a: number }) {
  const glow = useRef<Sprite>(null!)
  useFrame(() => {
    glow.current.material.opacity = 0.1 + smooth(mood.night) * 0.6
  })
  return (
    <group position={polar(a, 3.62, 0)} rotation-y={Math.PI / 4}>
      {/* tournés vers nous : la semelle face à la caméra, pas la tranche */}
      {[-0.09, 0.09].map((x, i) => (
        <group key={x} position={[x, 0, 0]} rotation-z={i ? -0.06 : 0.05}>
          <Part geo={rbox(0.08, 1.55, 0.025, 0.012)} m={i ? I.rust : I.orange} p={[0, 0.74, 0]} />
          {/* la spatule, qui prolonge le ski et se recourbe vers l'arrière, aussi large que lui */}
          <Part m={i ? I.rust : I.orange} p={[0, 1.515, -0.06]} rotation-y={-Math.PI / 2} scale={[1, 1, 3]}>
            <torusGeometry args={[0.06, 0.0125, 6, 12, Math.PI / 2]} />
          </Part>
          <Part geo={rbox(0.085, 0.06, 0.04, 0.01)} m={I.darkSteel} p={[0, 0.62, 0.02]} castShadow={false} />
        </group>
      ))}
      {/* les bâtons, croisés devant les skis, leurs rondelles enfoncées dans la neige */}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.2, 0, 0.12]} rotation-z={s * 0.22}>
          <Part geo={cyl(0.012, 0.012, 1.25, 8)} m={I.darkSteel} p={[0, 0.62, 0]} castShadow={false} />
          <Part geo={cyl(0.06, 0.06, 0.012, 14)} m={I.ink} p={[0, 0.08, 0]} castShadow={false} />
          <Part geo={cyl(0.022, 0.02, 0.14, 10)} m={I.leatherDark} p={[0, 1.2, 0]} castShadow={false} />
        </group>
      ))}
      {/* la lanterne, pendue par une dragonne de cuir à la poignée du bâton qui monte vers la droite */}
      <group position={[0.15, 1.0, 0.12]}>
        <Part geo={cyl(0.009, 0.009, 0.12, 6)} m={I.leatherDark} p={[-0.04, 0.16, 0]} rotation-z={0.755} castShadow={false} />
        <Part geo={cyl(0.05, 0.055, 0.04, 14)} m={I.darkSteel} p={[0, -0.04, 0]} castShadow={false} />
        <Part geo={SPH} m={I.lampGlass} scale={[0.045, 0.06, 0.045]} p={[0, 0.03, 0]} castShadow={false} />
        <Part geo={cyl(0.025, 0.05, 0.03, 14)} m={I.darkSteel} p={[0, 0.1, 0]} castShadow={false} />
        <sprite ref={glow} scale={0.9} position={[0, 0.03, 0.05]} raycast={noRay} userData={LIVE}>
          <spriteMaterial map={glowTex} color={0xffb36a} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
        </sprite>
      </group>
    </group>
  )
}

/** Les traces de pas dans la neige, du bord de l'île jusqu'à l'entrée du tunnel : des creux ovales bleutés, gauche, droite. */
export function Footprints({ a0, a1, r0, r1 }: { a0: number; a1: number; r0: number; r1: number }) {
  const items = useMemo(() => {
    const out: { p: [number, number, number]; s: [number, number, number]; r: [number, number, number] }[] = []
    const n = 14, rnd = seeded(31)
    for (let i = 0; i < n; i++) {
      const t = i / (n - 1), a = a0 + (a1 - a0) * t, r = r0 + (r1 - r0) * t, side = i % 2 ? 1 : -1
      const [x, , z] = polar(a, r + side * 0.07, 0), yaw = along(a) + (a1 > a0 ? Math.PI : 0)
      out.push({ p: [x, 0.0015, z], s: [0.075, 0.004, 0.042], r: [0, yaw + (rnd() - 0.5) * 0.25, 0] })
    }
    return out
  }, [a0, a1, r0, r1])
  return <Batch geo={SPH_LO} m={I.snowShade} items={items} />
}

/**
 * Le muret de blocs qu'on est en train de monter au devant (un pare-vent) : deux rangs de blocs taillés, décalés, un bloc posé à
 * côté qui attend sa place, et la scie à neige plantée dans la congère.
 */
export function BlockWall({ a }: { a: number }) {
  return (
    <group position={polar(a, 3.6, 0)} rotation-y={along(a)}>
      <Static>
        {[-0.5, -0.02, 0.46].map((x, i) => (
          <Part key={x} geo={rbox(0.46, 0.24, 0.3, 0.06)} m={i % 2 ? I.snowShade : I.snow} p={[x, 0.12, 0]} rotation-y={(i - 1) * 0.08} />
        ))}
        {[-0.26, 0.22].map((x, i) => (
          <Part key={x} geo={rbox(0.44, 0.22, 0.28, 0.06)} m={i ? I.snow : I.snowShade} p={[x, 0.355, 0.01]} />
        ))}
        <Part geo={rbox(0.44, 0.22, 0.28, 0.06)} m={I.snow} p={[0.95, 0.11, 0.2]} rotation-y={0.5} />
        {/* la scie à neige : sa lame large, ses dents arrondies sur un bord, sa poignée de bois en D */}
        <group position={[-0.95, 0, 0.1]} rotation={[0.15, 0.4, 0.12]}>
          <Part geo={rbox(0.13, 0.5, 0.008, 0.004)} m={I.steel} p={[0, 0.2, 0]} castShadow={false} />
          {[0.02, 0.09, 0.16, 0.23, 0.3, 0.37].map((y) => (
            <Part key={y} geo={SPH} m={I.steel} scale={[0.018, 0.02, 0.005]} p={[0.068, y, 0]} castShadow={false} />
          ))}
          <Part geo={rbox(0.05, 0.12, 0.04, 0.015)} m={I.wood} p={[0, 0.5, 0]} castShadow={false} />
          <Part m={I.wood} p={[0, 0.58, 0]} castShadow={false}>
            <torusGeometry args={[0.055, 0.014, 6, 16]} />
          </Part>
        </group>
      </Static>
    </group>
  )
}
