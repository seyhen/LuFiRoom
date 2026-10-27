import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { rand } from '../../math'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { reduceMotion } from '../anim'
import { I } from './materials'
import { Vessel } from './Vessel'

// Ce qui sèche sur le séchoir : [x le long de la barre, sorte, couleur].
const LAUNDRY: [number, 'sock' | 'mitten' | 'scarf', 'red' | 'wool' | 'grey'][] = [
  [-0.3, 'sock', 'red'], [-0.12, 'mitten', 'grey'], [0.06, 'sock', 'wool'], [0.26, 'scarf', 'red'],
]

/**
 * Le séchoir pliant de bois, près du réchaud : deux cadres en A reliés par deux barres, et ce qu'on fait sécher à la chaleur
 * (des chaussettes de laine, une moufle, une écharpe), pincé par des pinces à linge. Le linge se balance à peine dans l'air chaud.
 */
export function DryingRack({ position, ry = 0 }: { position: V3; ry?: number }) {
  const sway = useRef<Group[]>([]), ph = useRef(LAUNDRY.map(() => rand(0, 6)))
  useFrame((_, delta) => {
    if (reduceMotion) return
    sway.current.forEach((g, i) => {
      ph.current[i] += Math.min(delta, 0.05) * (0.9 + i * 0.13)
      g.rotation.x = Math.sin(ph.current[i]) * 0.05
    })
  })
  const mat = (c: 'red' | 'wool' | 'grey') => (c === 'red' ? I.woolRed : c === 'wool' ? I.wool : I.greyFur)
  return (
    <group position={position} rotation-y={ry}>
      <Static>
        {/* les deux cadres en A (pieds évasés vers le bas) et leurs barres */}
        {[-0.42, 0.42].map((x) => (
          <group key={x} position={[x, 0, 0]}>
            {[-1, 1].map((s) => (
              <Part key={s} geo={cyl(0.016, 0.018, 0.92, 8)} m={I.wood} p={[0, 0.44, s * 0.11]} rotation-x={-s * 0.25} castShadow={false} />
            ))}
            <Part geo={cyl(0.012, 0.012, 0.18, 8)} m={I.wood} p={[0, 0.3, 0]} rotation-x={Math.PI / 2} castShadow={false} />
          </group>
        ))}
        <Part geo={cyl(0.014, 0.014, 0.92, 8)} m={I.wood} p={[0, 0.86, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.012, 0.012, 0.92, 8)} m={I.wood} p={[0, 0.3, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      </Static>
      {LAUNDRY.map(([x, kind, c], i) => (
        <group key={x} ref={(el) => void (el && (sway.current[i] = el))} position={[x, 0.86, 0]} userData={LIVE}>
          {/* la pince à linge */}
          <Part geo={rbox(0.018, 0.05, 0.024, 0.006)} m={I.crate} p={[0, 0.01, 0]} castShadow={false} />
          {kind === 'sock' && (
            <>
              <Part geo={rbox(0.08, 0.24, 0.035, 0.03)} m={mat(c)} p={[0, -0.13, 0]} />
              <Part geo={SPH} m={mat(c)} scale={[0.06, 0.045, 0.022]} p={[0.035, -0.255, 0]} />
              <Part geo={rbox(0.085, 0.04, 0.038, 0.012)} m={c === 'red' ? I.wool : I.woolRed} p={[0, -0.03, 0]} castShadow={false} />
            </>
          )}
          {kind === 'mitten' && (
            <>
              <Part geo={SPH} m={I.leather} scale={[0.065, 0.1, 0.03]} p={[0, -0.13, 0]} />
              <Part geo={SPH} m={I.leather} scale={[0.025, 0.045, 0.022]} p={[-0.06, -0.12, 0]} rotation-z={0.5} />
              <Part geo={cyl(0.05, 0.05, 0.06, 14)} m={mat(c)} p={[0, -0.025, 0]} />
            </>
          )}
          {kind === 'scarf' && (
            <>
              <Part geo={rbox(0.11, 0.44, 0.016, 0.008)} m={I.woolRed} p={[-0.02, -0.21, 0.012]} />
              <Part geo={rbox(0.11, 0.34, 0.016, 0.008)} m={I.woolRed} p={[0.04, -0.16, -0.012]} />
              {/* les franges et deux rayures crème */}
              {[-0.38, -0.3].map((y) => (
                <Part key={y} geo={rbox(0.112, 0.03, 0.018, 0.004)} m={I.wool} p={[-0.02, y, 0.012]} castShadow={false} />
              ))}
            </>
          )}
        </group>
      ))}
    </group>
  )
}

/**
 * Le seau du pêcheur, près du trou : un seau d'acier émaillé et son anse, de l'eau, et la prise du jour, une truite argentée dont
 * la queue dépasse.
 */
export function FishBucket({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Vessel p={[0, 0, 0]} rt={0.15} rb={0.12} h={0.26} m={I.steel} inner={I.steelIn} rim={I.darkSteel} t={0.012} />
      <Part m={I.darkSteel} p={[0, 0.26, 0]} rotation={[0, 0.5, 0]} castShadow={false}>
        <torusGeometry args={[0.15, 0.006, 6, 20, Math.PI]} />
      </Part>
      <Part geo={cyl(0.129, 0.127, 0.01, 24)} m={I.water} p={[0, 0.215, 0]} castShadow={false} />
      {/* la truite : le corps qui sort de l'eau en biais, son ventre clair, la queue en V arrondi */}
      <group position={[0.02, 0.26, 0.02]} rotation={[0.2, 0.6, 0.9]}>
        <Part geo={SPH} m={I.fish} scale={[0.14, 0.04, 0.03]} p={[0.04, 0, 0]} />
        <Part geo={SPH} m={I.fishBelly} scale={[0.12, 0.022, 0.026]} p={[0.04, -0.018, 0]} castShadow={false} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={SPH} m={I.fish} scale={[0.05, 0.022, 0.008]} p={[0.2, s * 0.024, 0]} rotation-z={s * 0.6} castShadow={false} />
        ))}
      </group>
    </group>
  )
}

/** Le tabouret pliant du pêcheur, sa toile kaki tendue entre deux paires de pieds croisés, au bord du trou. */
export function FishingStool({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      {[-0.14, 0.14].map((z) => (
        <group key={z} position={[0, 0, z]}>
          {[-1, 1].map((s) => (
            <Part key={s} geo={cyl(0.012, 0.012, 0.42, 8)} m={I.wood} p={[0, 0.19, 0]} rotation-z={s * 0.62} castShadow={false} />
          ))}
        </group>
      ))}
      {[-1, 1].map((s) => (
        <Part key={s} geo={cyl(0.014, 0.014, 0.3, 8)} m={I.wood} p={[s * 0.13, 0.355, 0]} rotation-x={Math.PI / 2} castShadow={false} />
      ))}
      <Part geo={rbox(0.27, 0.012, 0.3, 0.005)} m={I.canvas} p={[0, 0.355, 0]} />
    </group>
  )
}
