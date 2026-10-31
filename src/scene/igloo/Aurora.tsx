import { useLayoutEffect, useMemo, useRef } from 'react'
import { PlaneGeometry } from 'three'
import { useFrame } from '@react-three/fiber'
import type { Group, Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { LIVE, Static } from '../Static'
import { mood, reduceMotion, useSquash } from '../anim'
import { I } from './materials'
import { DOME, polar } from './IglooShell'

// La fenêtre : un bloc de glace claire dans la paroi du fond, au-dessus de la tête du lit (243°, à 1,12 m). Plus haut, le haut du
// dôme la cacherait à la caméra (la paroi du fond n'est visible que jusqu'à 1,3 à 1,5 m).
const WIN_A = 243, WIN_Y = 1.12
const WIN_R = Math.sqrt(DOME.r * DOME.r - WIN_Y * WIN_Y)
export const WINDOW = polar(WIN_A, WIN_R - 0.02, WIN_Y)

// Les rideaux de l'aurore, derrière le dôme : [x, y, z, largeur, hauteur, vitesse de défilement].
// Centrés au-dessus du dôme à l'écran (x ≈ z), assez bas pour ne pas passer sous les puces des pièces.
const CURTAINS: [number, number, number, number, number, number][] = [
  [-3.2, 3.2, -3.2, 10, 3.0, 0.012],
  [-4.4, 3.7, -4.4, 9, 2.4, -0.008],
]

/** Un rideau plissé : un plan dont le pied ondule en profondeur (des plis lents), plus fort en bas qu'en haut. */
function pleated(w: number, h: number, seed: number) {
  const g = new PlaneGeometry(w, h, 48, 6), p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), k = 0.6 + 0.4 * (0.5 - y / h)
    p.setZ(i, (Math.sin(x * 0.9 + seed) * 0.6 + Math.sin(x * 2.1 + seed * 2) * 0.25) * k)
  }
  g.computeVertexNormals()
  return g
}

/** Ce qu'il reste de ciel clair (l'aurore se cache derrière les nuages de pluie, de neige ou d'orage). */
const clear = () => 1 - Math.max(mood.rain, mood.snow, mood.storm) * 0.92

/**
 * L'aurore boréale. Dehors, deux grands rideaux de lumière verte et rose ondulent derrière le dôme : à peine visibles la nuit quand
 * le son se tait, ils s'allument et dansent quand l'aurore « chante » (et pâlissent le jour, ou derrière les nuages).
 * Dedans, la fenêtre de glace de la paroi du fond (c'est l'objet qu'on touche) s'éclaire de la même lumière.
 */
export function Aurora() {
  const st = useRef({ k: 0, sway: 0 })
  const curtains = useRef<Mesh[]>([])
  const geos = useMemo(() => CURTAINS.map(([, , , w, h], i) => pleated(w, h, i)), [])
  const mats = useMemo(() => CURTAINS.map((_, i) => {
    const m = I.aurora.clone()
    m.map = I.aurora.map!.clone()
    m.map.needsUpdate = true
    m.map.offset.x = i * 0.37
    return m
  }), [])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'icewindow')
    s.k = approach(s.k, on ? 1 : 0, dt * 0.5)
    const night = smooth(mood.night), sky = clear()
    // la nuit, un voile d'aurore même sans le son ; vive quand elle chante ; pâle le jour
    const level = (0.12 * night + s.k * (0.06 + 0.8 * night)) * sky
    if (!reduceMotion) s.sway += dt * (0.25 + s.k * 0.5)
    mats.forEach((m, i) => {
      m.opacity = level * (i ? 0.75 : 1)
      if (!reduceMotion) m.map!.offset.x += dt * CURTAINS[i][5] * (1 + s.k * 2)
    })
    curtains.current.forEach((c, i) => {
      c.position.x = CURTAINS[i][0] + Math.sin(s.sway * (i ? 0.7 : 1) + i) * 0.25
      c.scale.y = 1 + Math.sin(s.sway * 0.6 + i * 2) * 0.06 * s.k
    })
    // la fenêtre : la glace s'illumine de vert
    I.pane.emissiveIntensity = (0.08 + 0.12 * night) * sky + level * 0.9
    I.auroraPane.opacity = level * 0.9
    if (!reduceMotion) I.auroraPane.map!.offset.x += dt * 0.02 * (1 + s.k)
  })
  return (
    <group userData={LIVE}>
      {CURTAINS.map(([x, y, z], i) => (
        <mesh key={i} ref={(el) => void (el && (curtains.current[i] = el))} material={mats[i]} position={[x, y, z]} rotation-y={Math.PI / 4} raycast={noRay} renderOrder={-1}>
          <primitive object={geos[i]} attach="geometry" />
        </mesh>
      ))}
    </group>
  )
}

/**
 * La fenêtre de glace (l'objet qu'on touche pour l'aurore) : un bloc de glace claire serti dans la paroi, face à la pièce. Quatre blocs
 * de neige taillés l'encadrent en relief (le linteau, les jambages, l'appui qui fait un petit rebord) ; la glace a ses bulles, ses
 * fêlures et du givre dans les coins ; derrière, la lumière du dehors, puis l'aurore qui s'y reflète quand elle chante.
 */
export function IceWindow() {
  const g = useRef<Group>(null!)
  useSquash('icewindow', g)
  // Face au centre du dôme : la normale de la paroi.
  useLayoutEffect(() => g.current.lookAt(0, WIN_Y * 0.55, 0), [])
  return (
    <group ref={g} userData={{ id: 'icewindow' }} position={WINDOW}>
     <Static>
      {/* le fond de l'embrasure, plus bleu, puis le bloc de glace */}
      <Part geo={rbox(0.8, 0.64, 0.08, 0.06)} m={I.snowShade} p={[0, 0, -0.01]} castShadow={false} />
      <Part geo={rbox(0.66, 0.5, 0.1, 0.05)} m={I.pane} p={[0, 0, 0.02]} castShadow={false} />
      {/* l'aurore et le givre, sur la face plate du bloc (sans déborder sur ses bords arrondis) */}
      <mesh material={I.auroraPane} position={[0, 0, 0.073]} raycast={noRay}>
        <planeGeometry args={[0.56, 0.4]} />
      </mesh>
      <mesh material={I.iceFace} position={[0, 0, 0.077]} raycast={noRay}>
        <planeGeometry args={[0.56, 0.4]} />
      </mesh>
      {/* les joints de glace (le bloc est fait de quatre morceaux) */}
      {/* limités à la face plate du bloc : ils ne descendent plus jusqu'à l'appui */}
      <Part geo={rbox(0.018, 0.4, 0.13, 0.008)} m={I.iceRim} p={[0, 0, 0.022]} castShadow={false} />
      <Part geo={rbox(0.56, 0.018, 0.13, 0.008)} m={I.iceRim} p={[0, 0.02, 0.022]} castShadow={false} />
      {/* pas d'encadrement en relief (il faisait meuble, deux colonnes) : le bloc est serti dans un creux bleuté de la paroi,
          et seul l'appui avance, de la teinte de la paroi. Le givre est peint dans la glace (iceTex). */}
      {/* l'appui : de la neige tassée unie (une texture de blocs sur une boîte arrondie n'en montrait que le centre, étiré) */}
      <Part geo={rbox(0.92, 0.08, 0.22, 0.035)} m={I.snow} p={[0, -0.3, 0.08]} />
      {/* sur le rebord : une boussole de laiton et une petite pile de trois boules de neige qu'on a roulées */}
      <group position={[-0.22, -0.27, 0.15]}>
        <Part geo={cyl(0.05, 0.05, 0.02, 20)} m={I.brass} p={[0, 0.01, 0]} castShadow={false} />
        <Part geo={cyl(0.04, 0.04, 0.004, 20)} m={I.paper} p={[0, 0.021, 0]} castShadow={false} />
        <Part geo={rbox(0.006, 0.003, 0.06, 0.001)} m={I.collar} p={[0, 0.024, 0]} rotation-y={0.5} castShadow={false} />
      </group>
      {[[0.2, 0.05], [0.28, 0.045], [0.24, 0.04]].map(([x, s], i) => (
        <Part key={i} geo={SPH} m={I.snow} scale={s} p={[x, -0.28 + s + (i === 2 ? 0.06 : 0), 0.15 + (i === 2 ? 0 : 0.01)]} castShadow={false} />
      ))}
     </Static>
    </group>
  )
}
