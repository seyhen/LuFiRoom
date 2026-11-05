import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { rb } from './box'
import { SPH_MID as SPH } from '../igloo/spheres'
import { Part, cyl, noRay, type V3 } from '../parts'
import { Static } from '../Static'
import { reduceMotion } from '../anim'
import { useBeat } from '../objects/useBeat'
import { T } from './materials'

/** La malle : où elle est, et la hauteur de son couvercle. */
export const CHEST = { x: -0.7, z: -2.5, w: 1.05, d: 0.56, h: 0.46, ry: 0.0 }
export const CHEST_TOP = CHEST.h + 0.1

/**
 * La malle de voyage, au fond sous le toit : caisse de bois sombre à lattes, deux sangles de cuir, coins et serrure de laiton,
 * poignée de corde sur le flanc, un autocollant de voyage. Dessus, un carré de tissu plié et une boîte à médiators.
 */
export function Chest() {
  const { x, z, w, d, h } = CHEST
  return (
    <group position={[x, 0, z]}>
      <Part geo={rb(w, h, d, 0.04)} m={T.chest} p={[0, h / 2 + 0.01, 0]} />
      {/* les lattes du corps, en relief, et le couvercle qui déborde */}
      {[0.12, 0.3].map((y) => (
        <Part key={y} geo={rb(w + 0.02, 0.05, d + 0.02, 0.015)} m={T.chestLight} p={[0, y, 0]} castShadow={false} />
      ))}
      <Part geo={rb(w + 0.05, 0.1, d + 0.05, 0.035)} m={T.chestLight} p={[0, h + 0.05, 0]} />
      {/* les sangles de cuir, qui font le tour, et leurs boucles */}
      {[-0.3, 0.3].map((sx) => (
        <group key={sx}>
          <Part geo={rb(0.07, h + 0.13, d + 0.08, 0.015)} m={T.leather} p={[sx, (h + 0.13) / 2 - 0.005, 0]} castShadow={false} />
          <Part geo={rb(0.09, 0.07, 0.02, 0.006)} m={T.brass} p={[sx, h - 0.06, d / 2 + 0.045]} castShadow={false} />
        </group>
      ))}
      {/* les coins de laiton */}
      {[-1, 1].flatMap((a) => [-1, 1].map((b) => (
        <Part key={`${a}${b}`} geo={rb(0.07, 0.07, 0.07, 0.02)} m={T.brass} p={[a * (w / 2 + 0.01), h + 0.06, b * (d / 2 + 0.01)]} castShadow={false} />
      )))}
      {/* la serrure, son trou de clé */}
      <Part geo={rb(0.1, 0.12, 0.02, 0.01)} m={T.brass} p={[0, h - 0.04, d / 2 + 0.025]} castShadow={false} />
      <Part geo={cyl(0.012, 0.012, 0.01, 8)} m={T.iron} p={[0, h - 0.04, d / 2 + 0.037]} rotation-x={Math.PI / 2} castShadow={false} />
      {/* la poignée de corde sur le flanc droit */}
      <Part m={T.rope} p={[w / 2 + 0.035, h * 0.62, 0]} rotation-y={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.07, 0.014, 6, 14, Math.PI]} />
      </Part>
      {/* l'autocollant de voyage sur la face avant, entre les sangles */}
      <mesh material={T.sticker} position={[-0.0, 0.2, d / 2 + 0.012]} raycast={noRay}>
        <planeGeometry args={[0.36, 0.18]} />
      </mesh>
      {/* sur le couvercle : un carré de tissu plié, la boîte à médiators ouverte et deux médiators */}
      <Part geo={rb(0.26, 0.025, 0.22, 0.012)} m={T.blanket} p={[0.33, CHEST_TOP + 0.012, 0.08]} rotation-y={0.2} castShadow={false} />
      <Part geo={cyl(0.045, 0.045, 0.025, 16)} m={T.iron} p={[0.36, CHEST_TOP + 0.038, 0.07]} castShadow={false} />
      <Part geo={cyl(0.038, 0.038, 0.01, 16)} m={T.brass} p={[0.36, CHEST_TOP + 0.048, 0.07]} castShadow={false} />
      {[[0.27, -0.05, 0.4], [0.2, 0.0, 1.6]].map(([px, pz, ry], i) => (
        <Part key={i} geo={cyl(0.022, 0.022, 0.006, 3)} m={i ? T.cushion : T.cushion3} p={[px, CHEST_TOP + 0.003, pz]} rotation-y={ry} castShadow={false} />
      ))}
    </group>
  )
}

const POT = { r: 0.17, h: 0.07 }
const NECK = 0.66
/** Le banjo est à l'échelle de la cabane (un peu plus grand que nature, pour se lire de loin). */
const BANJO_S = 1.35
const STR_Y = 0.136 // les cordes passent au-dessus du chevalet et de la touche

/**
 * Le banjo, couché sur la malle : c'est l'objet « radio » de la cabane. Le fût d'érable, la peau claire et sa couronne de tirants de
 * chrome, le résonateur de noyer dessous ; le manche et sa touche sombre, ses frettes, la tête et ses quatre clés, la cinquième clé sur
 * le côté du manche ; le chevalet, le cordier, cinq cordes. Quand la musique joue : il rebondit sur le temps, les cordes s'allument et
 * vibrent, des notes s'envolent.
 */
export function Banjo({ position, ry = 0 }: { position: V3; ry?: number }) {
  const strings = useRef<Group>(null!), shake = useRef(0)
  const { g, notes } = useBeat(position, 0.4, (on, _t, pulse) => {
    T.string.emissiveIntensity = on ? 0.15 + pulse * 0.6 : 0
    shake.current = on && !reduceMotion ? pulse : 0
  }, 0.05)
  useFrame(({ clock }) => {
    strings.current.position.y = STR_Y + Math.sin(clock.elapsedTime * 90) * 0.0025 * shake.current
  })
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position} rotation-y={ry}>
        <group scale={BANJO_S}>
        <Static>
          {/* le résonateur de noyer, le fût d'érable, la peau */}
          <Part geo={cyl(POT.r + 0.02, POT.r + 0.01, 0.05, 32)} m={T.walnut} p={[0, 0.025, 0]} />
          <Part geo={cyl(POT.r, POT.r, POT.h, 32)} m={T.maple} p={[0, 0.05 + POT.h / 2, 0]} />
          <mesh material={T.head} position={[0, 0.05 + POT.h + 0.004, 0]} rotation-x={-Math.PI / 2} receiveShadow>
            <circleGeometry args={[POT.r - 0.012, 32]} />
          </mesh>
          {/* le cercle de tension chromé, et ses tirants tout autour */}
          <Part m={T.chrome} p={[0, 0.05 + POT.h + 0.004, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[POT.r - 0.008, 0.009, 8, 32]} />
          </Part>
          {Array.from({ length: 16 }, (_, i) => {
            const a = (i / 16) * Math.PI * 2
            return <Part key={i} geo={cyl(0.006, 0.006, 0.07, 6)} m={T.chrome} p={[Math.cos(a) * (POT.r + 0.006), 0.085, Math.sin(a) * (POT.r + 0.006)]} castShadow={false} />
          })}
          {/* le manche, sa touche, les frettes, les repères de nacre */}
          <Part geo={rb(NECK, 0.035, 0.065, 0.012)} m={T.maple} p={[POT.r + NECK / 2 - 0.04, 0.05 + POT.h - 0.01, 0]} />
          <Part geo={rb(NECK - 0.02, 0.012, 0.058, 0.004)} m={T.walnut} p={[POT.r + NECK / 2 - 0.03, 0.05 + POT.h + 0.012, 0]} castShadow={false} />
          {Array.from({ length: 9 }, (_, i) => (
            <Part key={i} geo={rb(0.006, 0.006, 0.06, 0.002)} m={T.chrome} p={[POT.r + 0.03 + i * 0.065 * (1 - i * 0.03), 0.05 + POT.h + 0.019, 0]} castShadow={false} />
          ))}
          {[2, 4, 6].map((i) => (
            <Part key={i} geo={SPH} m={T.paper} scale={[0.008, 0.003, 0.008]} p={[POT.r + 0.06 + i * 0.065 * (1 - i * 0.03), 0.05 + POT.h + 0.019, 0]} castShadow={false} />
          ))}
          {/* la tête, un peu renversée, ses quatre clés de chaque côté */}
          <group position={[POT.r + NECK - 0.02, 0.05 + POT.h - 0.01, 0]} rotation-z={0.18}>
            <Part geo={rb(0.16, 0.035, 0.1, 0.02)} m={T.walnut} p={[0.07, 0, 0]} />
            {[0.03, 0.1].flatMap((px) => [-1, 1].map((s) => (
              <group key={`${px}${s}`} position={[px, 0, s * 0.06]}>
                <Part geo={cyl(0.006, 0.006, 0.04, 6)} m={T.chrome} rotation-x={Math.PI / 2} castShadow={false} />
                <Part geo={SPH} m={T.paper} scale={[0.012, 0.016, 0.01]} p={[0, 0, s * 0.025]} castShadow={false} />
              </group>
            )))}
          </group>
          {/* la cinquième clé, à mi-manche */}
          <group position={[POT.r + 0.25, 0.05 + POT.h - 0.01, 0.045]}>
            <Part geo={cyl(0.005, 0.005, 0.03, 6)} m={T.chrome} rotation-x={Math.PI / 2} castShadow={false} />
            <Part geo={SPH} m={T.paper} scale={[0.01, 0.014, 0.008]} p={[0, 0, 0.02]} castShadow={false} />
          </group>
          {/* le chevalet, le cordier */}
          <Part geo={rb(0.014, 0.022, 0.07, 0.004)} m={T.maple} p={[-0.03, 0.05 + POT.h + 0.014, 0]} castShadow={false} />
          <Part geo={rb(0.11, 0.012, 0.045, 0.005)} m={T.chrome} p={[-0.12, 0.05 + POT.h + 0.012, 0]} castShadow={false} />
        </Static>
        {/* les cinq cordes, du cordier à la tête (elles vibrent avec la musique) */}
        <group ref={strings} position={[0, STR_Y, 0]}>
          {[-0.02, -0.01, 0, 0.01, 0.02].map((sz, i) => {
            const x0 = -0.12, x1 = i === 4 ? POT.r + 0.25 : POT.r + NECK - 0.02, len = x1 - x0
            return <mesh key={sz} geometry={cyl(0.004, 0.004, len, 5)} material={T.string} position={[(x0 + x1) / 2, 0.012, sz]} rotation-z={Math.PI / 2} raycast={noRay} />
          })}
        </group>
        </group>
      </group>
      <group ref={notes.group} />
    </>
  )
}
