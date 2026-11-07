import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, TubeGeometry, Vector3, type Group } from 'three'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { Vessel } from '../igloo/Vessel'
import { K } from './materials'

const POLE: V3 = [2.86, 0, -2.0]

/** Un fil qui pend entre deux points : une courbe de Catmull-Rom sur une chaînette, un peu de mou. */
const wire = (a: V3, b: V3, sag: number) =>
  new TubeGeometry(
    new CatmullRomCurve3(Array.from({ length: 12 }, (_, i) => {
      const u = i / 11
      return new Vector3(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - 4 * sag * u * (1 - u), a[2] + (b[2] - a[2]) * u)
    })),
    24, 0.007, 4,
  )

/**
 * Le poteau électrique de béton, comme à chaque coin de rue au Japon : deux traverses et leurs isolateurs, le transformateur gris,
 * les échelons, le miroir convexe orange du carrefour, et un écheveau de fils qui part dans toutes les directions au-dessus de la ruelle.
 */
function UtilityPole() {
  const [px, , pz] = POLE
  const wires = useMemo(() => {
    const top = (z: number): V3 => [px, 4.38, pz + z], low = (z: number): V3 => [px, 4.0, pz + z]
    return [
      wire(top(-0.35), [-2.95, 4.2, pz - 0.25], 0.42), wire(top(0), [-2.95, 4.28, pz + 0.05], 0.5), wire(top(0.35), [-2.95, 4.12, pz + 0.4], 0.38),
      wire(low(-0.3), [-2.95, 3.95, pz - 0.7], 0.55), wire(low(0.3), [-2.95, 3.9, pz + 0.9], 0.6),
      wire(top(-0.35), [1.1, 4.1, -2.95], 0.25), wire(low(0), [-0.6, 4.05, -2.95], 0.4),
      // le fil de branchement qui pend jusqu'à l'enseigne du fond
      wire(low(0.3), [px - 0.9, 3.1, pz + 0.3], 0.1),
    ]
  }, [px, pz])
  return (
    <group>
      <group position={POLE}>
        <Part geo={cyl(0.085, 0.115, 4.5, 14)} m={K.concrete} p={[0, 2.25, 0]} />
        {/* les deux traverses, les isolateurs de porcelaine dessus */}
        {[[4.32, 0.9], [3.96, 0.7]].map(([y, len]) => (
          <group key={y} position={[0, y, 0]}>
            <Part geo={rbox(0.07, 0.07, len, 0.02)} m={K.woodPale} />
            {[-1, 0, 1].map((k) => (
              <group key={k} position={[0, 0.035, k * len * 0.4]}>
                <Part geo={cyl(0.018, 0.026, 0.05, 8)} m={K.cream} p={[0, 0.025, 0]} castShadow={false} />
                <Part geo={SPH} m={K.cream} scale={[0.03, 0.022, 0.03]} p={[0, 0.06, 0]} castShadow={false} />
              </group>
            ))}
          </group>
        ))}
        {/* le transformateur : fût gris, couvercle, deux bornes */}
        <group position={[0.17, 3.45, 0.05]}>
          <Part geo={cyl(0.13, 0.13, 0.46, 18)} m={K.steel} />
          <Part geo={cyl(0.14, 0.14, 0.03, 18)} m={K.steelDark} p={[0, 0.24, 0]} castShadow={false} />
          {[-0.05, 0.05].map((x) => <Part key={x} geo={cyl(0.012, 0.012, 0.07, 6)} m={K.iron} p={[x, 0.29, 0]} castShadow={false} />)}
          <Part geo={rbox(0.05, 0.32, 0.03, 0.01)} m={K.steelDark} p={[-0.12, 0, 0.0]} castShadow={false} />
        </group>
        {/* les échelons de fer, un côté puis l'autre */}
        {Array.from({ length: 8 }, (_, i) => (
          <Part key={i} geo={cyl(0.011, 0.011, 0.2, 6)} m={K.iron} p={[0, 0.8 + i * 0.27, 0.0]} rotation-z={Math.PI / 2} rotation-y={i % 2 ? 0.9 : -0.9} castShadow={false} />
        ))}
        {/* la plaque jaune du poteau, et la bande rouge et blanche au pied */}
        <Part geo={rbox(0.15, 0.22, 0.012, 0.004)} m={K.yellow} p={[0.0, 2.6, 0.112]} castShadow={false} />
        <Part geo={cyl(0.117, 0.124, 0.28, 14)} m={K.red} p={[0, 0.34, 0]} castShadow={false} />
        <Part geo={cyl(0.12, 0.126, 0.07, 14)} m={K.cream} p={[0, 0.34, 0]} castShadow={false} />
        {/* le miroir de carrefour : un disque orange sur un bras */}
        <group position={[0.08, 2.15, 0.1]} rotation-y={Math.PI / 4}>
          <Part geo={cyl(0.012, 0.012, 0.22, 6)} m={K.iron} p={[0, 0, 0.1]} rotation-x={Math.PI / 2} castShadow={false} />
          <group position={[0, 0.0, 0.25]}>
            <Part geo={cyl(0.17, 0.17, 0.045, 24)} m={K.rust} rotation-x={Math.PI / 2} />
            <Part geo={SPH} m={K.steel} scale={[0.155, 0.155, 0.04]} p={[0, 0, 0.012]} castShadow={false} />
          </group>
        </group>
      </group>
      {wires.map((g, i) => <Part key={i} geo={g} m={K.iron} castShadow={false} />)}
    </group>
  )
}

/** Un poisson rouge de fête foraine : corps rond, queue en éventail, nageoire, deux yeux. Nez vers +x. */
function Goldfish({ p, m = K.goldfish, s = 1, ph = 0 }: { p: V3; m?: typeof K.goldfish; s?: number; ph?: number }) {
  const tail = useRef<Group>(null!)
  useFrame(({ clock }) => {
    if (!reduceMotion) tail.current.rotation.y = Math.sin(clock.elapsedTime * 5 + ph) * 0.4
  })
  return (
    <group position={p} rotation-y={Math.PI / 2} scale={s}>
      <Part geo={SPH} m={m} scale={[0.06, 0.035, 0.032]} castShadow={false} />
      <group ref={tail} userData={LIVE} position={[-0.055, 0, 0]}>
        <Part geo={SPH} m={m} scale={[0.04, 0.03, 0.006]} p={[-0.025, 0, 0]} castShadow={false} />
      </group>
      <Part geo={SPH} m={m} scale={[0.02, 0.022, 0.006]} p={[0.0, 0.032, 0]} castShadow={false} />
      {[-1, 1].map((z) => <Part key={z} geo={SPH} m={K.iron} scale={0.007} p={[0.04, 0.008, z * 0.022]} castShadow={false} />)}
    </group>
  )
}

/** La pêche aux poissons rouges (kingyo sukui) : bassin bleu, poissons qui tournent, épuisette de papier posée sur le bord, pancarte. */
function GoldfishPond({ position, ry = 0 }: { position: V3; ry?: number }) {
  const ring = useRef<Group>(null!)
  useFrame((_, dt) => {
    if (!reduceMotion) ring.current.rotation.y += Math.min(dt, 0.05) * 0.35
  })
  const H = 0.17
  return (
    <group position={position} rotation-y={ry}>
      <Vessel p={[0, 0.2, 0]} rt={0.44} rb={0.4} h={H} m={K.tub} inner={K.tubIn} />
      {/* le tréteau bas sous le bassin */}
      {[[-0.28, -0.2], [0.28, -0.2], [-0.28, 0.2], [0.28, 0.2]].map(([x, z]) => <Part key={`${x}${z}`} geo={cyl(0.025, 0.02, 0.2, 8)} m={K.woodPale} p={[x, 0.1, z]} castShadow={false} />)}
      <Part geo={cyl(0.4, 0.4, 0.02, 24)} m={K.woodPale} p={[0, 0.19, 0]} castShadow={false} />
      {/* l'eau, un peu sous le bord, et les poissons qui tournent */}
      <Part geo={cyl(0.385, 0.385, 0.01, 28)} m={K.pond} p={[0, 0.2 + H - 0.04, 0]} castShadow={false} />
      <group ref={ring} userData={LIVE} position={[0, 0.2 + H - 0.025, 0]}>
        <Goldfish p={[0.24, 0, 0]} ph={0} />
        <group rotation-y={2.2}><Goldfish p={[0.17, 0, 0]} m={K.red} s={0.9} ph={1.5} /></group>
        <group rotation-y={4.0}><Goldfish p={[0.28, 0, 0]} m={K.cream} s={0.85} ph={3} /></group>
        <group rotation-y={5.2}><Goldfish p={[0.12, 0, 0]} s={0.75} ph={4.4} /></group>
      </group>
      {/* l'épuisette : un anneau de plastique rouge, son papier, le manche posé sur le bord */}
      <group position={[0.2, 0.2 + H + 0.012, 0.41]} rotation-y={0.5}>
        <Part geo={cyl(0.07, 0.07, 0.008, 18)} m={K.red} castShadow={false} />
        <Part geo={cyl(0.055, 0.055, 0.012, 18)} m={K.cream} p={[0, 0.003, 0]} castShadow={false} />
        <Part geo={rbox(0.2, 0.012, 0.025, 0.006)} m={K.red} p={[0.14, 0, 0]} castShadow={false} />
      </group>
      {/* la pancarte, plantée derrière sur deux piquets de bambou */}
      <group position={[-0.1, 0, -0.55]}>
        {[-0.38, 0.38].map((x) => <Part key={x} geo={cyl(0.014, 0.016, 0.9, 6)} m={K.woodPale} p={[x, 0.45, 0]} castShadow={false} />)}
        <mesh material={K.kingyoSign} position={[0, 0.78, 0.02]} castShadow>
          <planeGeometry args={[0.8, 0.3]} />
        </mesh>
        <Part geo={rbox(0.84, 0.03, 0.03, 0.01)} m={K.woodDark} p={[0, 0.94, 0.0]} castShadow={false} />
        <Part geo={rbox(0.84, 0.03, 0.03, 0.01)} m={K.woodDark} p={[0, 0.62, 0.0]} castShadow={false} />
      </group>
    </group>
  )
}

/** Ce qui fait du marché un matsuri japonais : le poteau et ses fils, et la pêche aux poissons rouges. */
export function Matsuri() {
  return (
    <>
      <UtilityPole />
      <GoldfishPond position={[2.05, 0, 1.4]} ry={0.2} />
    </>
  )
}
