import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { gummy } from '../materials'
import { Part, SPH, cyl, orient, rbox, type V3 } from '../parts'
import { reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { K } from './materials'

const skin = gummy(0xf4c7a0, { roughness: 0.5, clearcoat: 0.35 })
const cheek = gummy(0xf59a9a, { roughness: 0.6, clearcoat: 0.1 })
const eye = gummy(0x1d1218, { roughness: 0.3, clearcoat: 0.8 })
const gold = gummy(0xf2c24a, { roughness: 0.3, clearcoat: 0.9 })
const catWhite = gummy(0xfff6ea, { roughness: 0.4, clearcoat: 0.6 })

/** Un bras d'une épaule à une main : manche blanche, poignet de peau. Les extrémités sont des points du repère de la carriole. */
function Arm({ from, to, r = 0.055 }: { from: V3; to: V3; r?: number }) {
  const d: V3 = [to[0] - from[0], to[1] - from[1], to[2] - from[2]], len = Math.hypot(...d)
  return (
    <>
      <Part geo={cyl(r, r * 0.92, len * 0.82, 10)} m={K.cream} p={[from[0] + d[0] * 0.41, from[1] + d[1] * 0.41, from[2] + d[2] * 0.41]} rotation={orient(d)} castShadow={false} />
      <Part geo={SPH} m={skin} scale={r * 1.15} p={to} castShadow={false} />
    </>
  )
}

/**
 * Le cuisinier, derrière le comptoir : un petit bonhomme rond en veste blanche et tablier d'indigo, un tenugui noué sur le front.
 * Il tient la poignée du wok de sa main droite ; quand le wok saute, il se balance en rythme et sa tête suit le geste ; au repos
 * il respire doucement, cligne des yeux et regarde les clients.
 */
export function Chef({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), head = useRef<Group>(null!), eyes = useRef<Group>(null!), k = useRef(0)
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
  })
  return (
    <group ref={g} userData={LIVE} position={position}>
      {/* le bassin et les jambes (cachés derrière la carriole), le buste, le tablier */}
      <Part geo={cyl(0.17, 0.17, 0.5, 14)} m={K.iron} p={[0, 0.72, 0]} castShadow={false} />
      <Part geo={cyl(0.17, 0.21, 0.5, 18)} m={K.cream} p={[0, 1.12, 0]} />
      <Part geo={rbox(0.26, 0.4, 0.03, 0.012)} m={K.indigo} p={[0, 1.04, 0.2]} castShadow={false} />
      {[1.22, 1.12].map((y) => (
        <Part key={y} geo={SPH} m={K.brass} scale={0.014} p={[0, y, 0.205]} castShadow={false} />
      ))}
      <Part geo={cyl(0.07, 0.08, 0.06, 12)} m={skin} p={[0, 1.4, 0]} castShadow={false} />
      {/* la tête : visage rond, joues, yeux, sourire, tenugui noué */}
      <group ref={head} position={[0, 1.58, 0]}>
        <Part geo={SPH} m={skin} scale={[0.17, 0.16, 0.16]} />
        {[-1, 1].map((s) => (
          <group key={s}>
            <Part geo={SPH} m={cheek} scale={[0.03, 0.02, 0.012]} p={[s * 0.1, -0.03, 0.14]} castShadow={false} />
            <Part geo={SPH} m={skin} scale={0.035} p={[s * 0.168, -0.01, 0]} castShadow={false} />
          </group>
        ))}
        <group ref={eyes}>
          {[-1, 1].map((s) => (
            <Part key={s} geo={SPH} m={eye} scale={[0.017, 0.024, 0.012]} p={[s * 0.055, 0.02, 0.152]} castShadow={false} />
          ))}
        </group>
        <Part m={eye} p={[0, -0.04, 0.152]} rotation-z={Math.PI} castShadow={false}>
          <torusGeometry args={[0.03, 0.005, 5, 10, Math.PI * 0.8]} />
        </Part>
        <Part m={K.indigo} p={[0, 0.09, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.158, 0.035, 8, 26]} />
        </Part>
        <Part geo={SPH} m={K.indigo} scale={[0.06, 0.04, 0.03]} p={[0, 0.1, -0.17]} castShadow={false} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={cyl(0.012, 0.004, 0.14, 5)} m={K.indigo} p={[s * 0.05, 0.05, -0.2]} rotation={[0.5, 0, s * 0.35]} castShadow={false} />
        ))}
        {Array.from({ length: 5 }, (_, i) => (
          <Part key={i} geo={SPH} m={K.cream} scale={0.008} p={[Math.sin((i - 2) * 0.55) * 0.158, 0.1, Math.cos((i - 2) * 0.55) * 0.158]} castShadow={false} />
        ))}
      </group>
      {/* le bras droit tend la poignée du wok, le gauche pend au flanc */}
      <Arm from={[-0.2, 1.3, 0.0]} to={[-0.28, 1.42, 0.56]} />
      <Arm from={[0.2, 1.3, 0]} to={[0.26, 1.02, 0.16]} />
    </group>
  )
}

/**
 * Un maneki-neko sur le comptoir : chat de porcelaine blanc, collier rouge à grelot, une pièce d'or dans la patte gauche et la droite
 * levée qui salue sans arrêt. Il porte chance à la carriole.
 */
export function LuckyCat({ position }: { position: V3 }) {
  const paw = useRef<Group>(null!)
  useFrame(({ clock }) => {
    paw.current.rotation.z = reduceMotion ? -0.3 : -0.3 + Math.sin(clock.elapsedTime * 3.2) * 0.45
  })
  return (
    <group position={position} rotation-y={-0.6}>
      <Part geo={cyl(0.085, 0.095, 0.03, 18)} m={K.red} p={[0, 0.015, 0]} castShadow={false} />
      <Part geo={SPH} m={catWhite} scale={[0.085, 0.1, 0.075]} p={[0, 0.115, 0]} />
      <Part geo={SPH} m={catWhite} scale={[0.09, 0.08, 0.08]} p={[0, 0.235, 0.005]} />
      {[-1, 1].map((s) => (
        <group key={s}>
          <Part geo={cyl(0.002, 0.04, 0.05, 4)} m={catWhite} p={[s * 0.058, 0.3, 0]} rotation-z={s * -0.25} castShadow={false} />
          <Part geo={SPH} m={eye} scale={[0.008, 0.01, 0.006]} p={[s * 0.032, 0.245, 0.077]} castShadow={false} />
          <Part geo={SPH} m={cheek} scale={[0.014, 0.01, 0.006]} p={[s * 0.052, 0.225, 0.07]} castShadow={false} />
        </group>
      ))}
      <Part geo={SPH} m={cheek} scale={[0.01, 0.007, 0.006]} p={[0, 0.226, 0.082]} castShadow={false} />
      <Part m={K.red} p={[0, 0.17, 0.02]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.058, 0.013, 6, 18]} />
      </Part>
      <Part geo={SPH} m={gold} scale={0.017} p={[0, 0.15, 0.075]} castShadow={false} />
      <Part geo={cyl(0.034, 0.034, 0.008, 14)} m={gold} p={[-0.06, 0.1, 0.055]} rotation-x={Math.PI / 2} castShadow={false} />
      <group ref={paw} position={[0.06, 0.15, 0.04]}>
        <Part geo={SPH} m={catWhite} scale={[0.022, 0.05, 0.022]} p={[0.012, 0.045, 0]} castShadow={false} />
      </group>
    </group>
  )
}

const pants = gummy(0x2c2a44, { roughness: 0.6, clearcoat: 0.2 })

/**
 * Un client attablé au comptoir, vu de dos : son manteau (ou son ciré à capuche), ses cheveux (ou son chignon), les coudes sur le
 * comptoir. De temps en temps il se penche sur son bol, et sa tête plonge. Il fait face à la carriole (vers z−).
 */
export function Customer({ position, coat, hair, hood = false, ph = 0 }: { position: V3; coat: typeof K.cream; hair: typeof K.iron; hood?: boolean; ph?: number }) {
  const head = useRef<Group>(null!), body = useRef<Group>(null!)
  useFrame(({ clock }) => {
    const t = reduceMotion ? 0 : clock.elapsedTime
    const dip = Math.max(0, Math.sin(t * 0.75 + ph)) ** 4
    head.current.rotation.x = -dip * 0.32
    body.current.rotation.x = -dip * 0.06
    head.current.rotation.y = Math.sin(t * 0.23 + ph) * 0.15
  })
  return (
    <group position={position} userData={LIVE}>
      {/* les cuisses vers le comptoir, les mollets pendus, les chaussures */}
      {[-0.08, 0.08].map((x) => (
        <group key={x}>
          <Part geo={cyl(0.055, 0.05, 0.3, 10)} m={pants} p={[x, 0.66, -0.15]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.048, 0.04, 0.42, 10)} m={pants} p={[x, 0.45, -0.3]} castShadow={false} />
          <Part geo={SPH} m={K.iron} scale={[0.05, 0.03, 0.08]} p={[x, 0.22, -0.34]} castShadow={false} />
        </group>
      ))}
      <group ref={body} position={[0, 0.62, 0]}>
        <Part geo={cyl(0.155, 0.175, 0.46, 16)} m={coat} p={[0, 0.25, 0]} />
        <Part geo={SPH} m={coat} scale={[0.19, 0.09, 0.13]} p={[0, 0.47, 0]} castShadow={false} />
        <Arm from={[-0.19, 0.44, -0.02]} to={[-0.12, 0.4, -0.5]} r={0.045} />
        <Arm from={[0.19, 0.44, -0.02]} to={[0.12, 0.4, -0.5]} r={0.045} />
        <group ref={head} position={[0, 0.62, 0]}>
          <Part geo={SPH} m={skin} scale={[0.12, 0.125, 0.12]} />
          {hood ? (
            <>
              <Part geo={SPH} m={coat} scale={[0.17, 0.165, 0.17]} p={[0, 0.012, 0.012]} />
              <Part geo={cyl(0.12, 0.155, 0.04, 16)} m={coat} p={[0, -0.1, 0.03]} castShadow={false} />
            </>
          ) : (
            <>
              <Part geo={SPH} m={hair} scale={[0.13, 0.125, 0.127]} p={[0, 0.012, 0.014]} />
              <Part geo={SPH} m={hair} scale={0.055} p={[0, 0.14, 0.01]} castShadow={false} />
            </>
          )}
        </group>
      </group>
    </group>
  )
}
