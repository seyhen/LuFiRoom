import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl, orient, rbox, type V3 } from '../parts'
import { reduceMotion } from '../anim'
import { LIVE, Static } from '../Static'
import { K } from './materials'
import {
  CAT_PAW, CHEF_HAND, CHEF_HEAD_Y, CHEF_SHOULDER, catBody, catPaw, chefArmL, chefArmR, chefBody, chefHead, customerBody, customerHead, customerLegs,
  figBrow, figEye, figGlint, figGold, figGoldDark, figHandle, figMouth, figSkin, figSteel, figWhisker, ladleCup,
} from './figures'

const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
/** La louche du cuisinier : manche de bois, coupelle d'acier. Repère : la main, le manche le long de +y, la coupelle ouverte vers +z. */
const LADLE_DIR: V3 = [0, -0.45, 0.89]

/**
 * Le cuisinier, derrière le comptoir : une figurine ronde en veste blanche et tablier d'indigo, un tenugui noué sur la tête, de
 * grands yeux brillants. Il tient la poignée du wok de la main droite et remue avec une louche de la gauche ; quand le wok saute,
 * il se balance en rythme, ses bras suivent et sa tête accompagne le geste ; au repos il respire doucement, cligne des yeux et
 * regarde les clients.
 */
export function Chef({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), head = useRef<Group>(null!), eyes = useRef<Group>(null!), armR = useRef<Group>(null!), armL = useRef<Group>(null!), k = useRef(0)
  const reachR = Math.hypot(...sub(CHEF_HAND.r, CHEF_SHOULDER.r))
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime, dt = Math.min(delta, 0.05)
    k.current = approach(k.current, isActive(useStore.getState(), 'wok') ? 1 : 0, dt * 2)
    const kk = reduceMotion ? 0 : k.current, beat = t * 7.2
    g.current.rotation.z = Math.sin(beat) * 0.03 * kk
    g.current.position.y = position[1] + (reduceMotion ? 0 : Math.sin(t * 1.4) * 0.004) + Math.max(0, Math.sin(beat + 0.4)) * 0.012 * kk
    head.current.rotation.z = Math.sin(beat + 0.6) * 0.07 * kk + (reduceMotion ? 0 : Math.sin(t * 0.5) * 0.03)
    head.current.rotation.y = reduceMotion ? 0 : Math.sin(t * 0.37) * 0.35 * (1 - kk * 0.8)
    const blink = reduceMotion ? 1 : Math.max(0.08, 1 - Math.max(0, Math.sin(t * 1.9) - 0.985) * 70)
    eyes.current.scale.y = blink
    // la main droite suit la poignée du wok, qui monte et descend avec le poignet ; la gauche remue la louche
    const rise = -0.0504 * Math.sin(beat) + 0.028 * Math.max(0, Math.sin(beat + 0.4))
    armR.current.rotation.x = (-rise / reachR) * kk
    const s = reduceMotion ? 0 : t * 0.9
    armL.current.rotation.y = Math.sin(beat * 0.5) * 0.13 * kk + Math.sin(s) * 0.015
    armL.current.rotation.x = Math.cos(beat * 0.5) * 0.05 * kk
  })
  return (
    <group ref={g} userData={LIVE} position={position}>
      <Static>
        {/* le buste et le tablier, les jambes courtes et les sabots (cachés derrière la carriole) */}
        <Part geo={chefBody()} m={figSkin} />
      </Static>
      {/* le bras droit tend la poignée du wok */}
      <group ref={armR} userData={LIVE} position={CHEF_SHOULDER.r}>
        <Part geo={chefArmR()} m={figSkin} />
      </group>
      {/* le bras gauche tient la louche au-dessus du wok */}
      <group ref={armL} userData={LIVE} position={CHEF_SHOULDER.l}>
        <Part geo={chefArmL()} m={figSkin} />
        <group position={sub(CHEF_HAND.l, CHEF_SHOULDER.l)} rotation={orient(LADLE_DIR)}>
          <Part geo={cyl(0.0125, 0.014, 0.64, 8)} m={figHandle} p={[0, 0.2, 0]} castShadow={false} />
          <Part geo={cyl(0.016, 0.016, 0.02, 8)} m={figGold} p={[0, 0.51, 0]} castShadow={false} />
          <group position={[0, 0.56, -0.023]} rotation-x={Math.PI / 2}>
            <Part geo={ladleCup} m={figSteel} castShadow={false} />
          </group>
          <Part m={figSteel} p={[0, 0.56, 0.023]} castShadow={false}>
            <torusGeometry args={[0.052, 0.0045, 6, 20]} />
          </Part>
        </group>
      </group>
      {/* la tête : visage rond, joues rosées, grands yeux brillants, sourire, tenugui noué */}
      <group ref={head} userData={LIVE} position={[0, CHEF_HEAD_Y, 0]} scale={0.92}>
        <Static>
          <Part geo={chefHead()} m={figSkin} />
          <Part m={figMouth} p={[0, -0.093, 0.2185]} rotation-z={Math.PI * 1.1} castShadow={false}>
            <torusGeometry args={[0.036, 0.008, 5, 14, Math.PI * 0.8]} />
          </Part>
          {[-1, 1].map((s) => (
            <Part key={s} m={figBrow} p={[s * 0.088, 0.012, 0.208]} rotation={[0, 0, s * -0.2]} castShadow={false}>
              <torusGeometry args={[0.026, 0.006, 4, 10, Math.PI * 0.55]} />
            </Part>
          ))}
        </Static>
        <group ref={eyes} userData={LIVE} position={[0, -0.025, 0]}>
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.092, 0, 0.2]}>
              <Part geo={SPH} m={figEye} scale={[0.036, 0.046, 0.024]} castShadow={false} />
              <Part geo={SPH} m={figGlint} scale={0.0125} p={[0.011, 0.02, 0.019]} castShadow={false} />
              <Part geo={SPH} m={figGlint} scale={0.0058} p={[-0.012, -0.017, 0.02]} castShadow={false} />
            </group>
          ))}
        </group>
      </group>
    </group>
  )
}

/**
 * Un maneki-neko sur le comptoir : chat de porcelaine blanc taché de roux et de noir, collier rouge à grelot, une pièce d'or
 * dans la patte gauche et la droite levée qui salue sans arrêt. Il porte chance à la carriole.
 */
export function LuckyCat({ position }: { position: V3 }) {
  const paw = useRef<Group>(null!)
  useFrame(({ clock }) => {
    paw.current.rotation.z = reduceMotion ? -0.3 : -0.3 + Math.sin(clock.elapsedTime * 3.2) * 0.45
  })
  return (
    <group position={position} rotation-y={0.5}>
      <Part geo={catBody()} m={figSkin} />
      {/* les yeux en arcs contents, le museau, les moustaches */}
      {[-1, 1].map((s) => (
        <group key={s}>
          <Part m={figEye} p={[s * 0.043, 0.249, 0.0935]} rotation={[0, s * 0.3, s * -0.12]} castShadow={false}>
            <torusGeometry args={[0.0165, 0.0052, 5, 12, Math.PI]} />
          </Part>
          <Part m={figMouth} p={[s * 0.0105, 0.2225, 0.1095]} rotation-z={Math.PI} castShadow={false}>
            <torusGeometry args={[0.0105, 0.003, 4, 8, Math.PI]} />
          </Part>
          {/* deux moustaches par joue, assez épaisses pour se lire de loin */}
          {[-0.5, 0.5].map((i) => (
            <Part key={i} geo={cyl(0.005, 0.004, 0.06, 6)} m={figWhisker} p={[s * 0.1, 0.222 + i * 0.016, 0.07]} rotation={orient([s, i * 0.4, 0.35])} castShadow={false} />
          ))}
        </group>
      ))}
      {/* le grelot du collier */}
      <Part geo={SPH} m={figGold} scale={0.0215} p={[0, 0.146, 0.106]} castShadow={false} />
      <Part geo={rbox(0.034, 0.0045, 0.006, 0.002)} m={figGoldDark} p={[0, 0.141, 0.1265]} castShadow={false} />
      {/* la pièce d'or (koban), tenue dans la patte gauche */}
      <group position={[-0.056, 0.136, 0.118]} rotation={[0, 0.12, 0.08]}>
        <Part geo={SPH} m={figGoldDark} scale={[0.037, 0.051, 0.0042]} castShadow={false} />
        <Part geo={SPH} m={figGold} scale={[0.032, 0.0455, 0.005]} p={[0, 0, 0.002]} castShadow={false} />
        {[0.019, 0.0, -0.019].map((y) => (
          <Part key={y} geo={rbox(0.023, 0.004, 0.004, 0.0015)} m={figGoldDark} p={[0, y, 0.0075]} castShadow={false} />
        ))}
      </group>
      {/* la patte droite levée : elle salue sans arrêt */}
      <group ref={paw} userData={LIVE} position={CAT_PAW}>
        <Part geo={catPaw()} m={figSkin} castShadow={false} />
      </group>
    </group>
  )
}

/**
 * Un client attablé au comptoir, vu de dos : son manteau (ou son ciré à capuche), ses cheveux (ou son chignon), les coudes sur le
 * comptoir. De temps en temps il se penche sur son bol, et sa tête plonge. Il fait face à la carriole (vers z−).
 */
export function Customer({ position, coat, hair, hood = false, ph = 0 }: { position: V3; coat: typeof K.cream; hair: typeof K.iron; hood?: boolean; ph?: number }) {
  const head = useRef<Group>(null!), body = useRef<Group>(null!)
  const coatHex = coat.color.getHex(), hairHex = hair.color.getHex()
  useFrame(({ clock }) => {
    const t = reduceMotion ? 0 : clock.elapsedTime
    const dip = Math.max(0, Math.sin(t * 0.75 + ph)) ** 4
    head.current.rotation.x = -dip * 0.32
    body.current.rotation.x = -dip * 0.06
    head.current.rotation.y = Math.sin(t * 0.23 + ph) * 0.15
  })
  return (
    <group position={position} userData={LIVE}>
      <Static>
        {/* les cuisses vers le comptoir, les mollets pendus, les chaussures */}
        <Part geo={customerLegs()} m={figSkin} castShadow={false} />
      </Static>
      <group ref={body} userData={LIVE} position={[0, 0.62, 0]}>
        <Static>
          <Part geo={customerBody(coatHex)} m={figSkin} />
        </Static>
        <group ref={head} userData={LIVE} position={[0, 0.7, 0]} scale={1.08}>
          <Static>
            <Part geo={customerHead(coatHex, hairHex, hood)} m={figSkin} />
            {[-1, 1].map((s) => (
              <Part key={s} geo={SPH} m={figEye} scale={[0.0165, 0.022, 0.012]} p={[s * 0.058, -0.012, -0.119]} castShadow={false} />
            ))}
          </Static>
        </group>
      </group>
    </group>
  )
}
