import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, smooth } from '../../math'
import { Part } from '../parts'
import { blob, cone, ell, pair } from '../blob'
import { reduceMotion, useSquash } from '../anim'
import { beads } from '../objects/beads'
import { B } from './materials'

// Une mouette posée, d'une seule peau (scene/blob.ts). Repère : le pied du poteau en (0, 0, 0), le bec vers +x.
const WHITE = 0xfffdf8, GREY = 0x7a8fae, INK = 0x2c2b3d, BILL = 0xf6c544, RED = 0xe2564a, LEG = 0xf2a45e
const cRed = new Color(RED), cWhite = new Color(0xffffff), cDark = new Color(0x6f7f9a)

// le corps, les ailes et la tête sont posés un peu plus haut que les pattes (qui montent dans le ventre)
const LIFT = 0.03, FOLD = 0.2

// Le corps : une poire gonflée (ventre rond en bas, poitrail qui monte vers le cou), dos gris clair, queue courte et blanche qui pend.
const BODY = blob([
  ell([0.0, 0.145, 0], [0.135, 0.1, 0.098], { color: WHITE, rot: [0, 0, 0.28] }),
  ell([0.075, 0.2, 0], [0.075, 0.095, 0.078], { color: WHITE, rot: [0, 0, -0.25], k: 0.06 }),
  ell([-0.1, 0.168, 0], [0.1, 0.075, 0.082], { color: WHITE, rot: [0, 0, 0.3], k: 0.05 }),
  ell([-0.06, 0.205, 0], [0.11, 0.04, 0.07], { color: GREY, rot: [0, 0, 0.3], k: 0.035 }),
  ell([-0.18, 0.145, 0], [0.072, 0.022, 0.048], { color: WHITE, rot: [0, 0, 0.25], k: 0.035 }),
], { h: 0.015, k: 0.04 })

// Une aile repliée, vue du côté +z : l'origine est l'épaule (le pivot de l'ébrouement). Gris clair, bout noir qui dépasse sur la queue.
const WING = blob([
  ell([-0.085, -0.02, 0], [0.125, 0.04, 0.032], { color: GREY, rot: [0, 0, 0.2] }),
  ell([-0.215, -0.04, -0.002], [0.082, 0.025, 0.025], { color: INK, rot: [0, 0, 0.2], k: 0.008 }),
], {
  h: 0.012, k: 0.03,
  // le bas de l'aile un peu plus ombré, une petite tache blanche au bout noir
  paint: (p, c) => {
    c.lerp(cDark, 0.25 * smooth(Math.min(1, Math.max(0, (-p.y - 0.035) / 0.04))) * (p.x > -0.13 ? 1 : 0))
    if (Math.hypot(p.x + 0.255, p.y + 0.047, p.z) < 0.011 && p.z > 0) c.lerp(cWhite, 0.9)
    return c
  },
})

// La tête : pivot en bas du cou (dans la poitrine). Cou court, grosse tête ronde, bec jaune arrondi qui fond dans le visage.
const HEAD = blob([
  cone([0, 0, 0], [0.03, 0.085, 0], 0.062, 0.054, { color: WHITE, k: 0.05 }),
  ell([0.03, 0.088, 0], [0.08, 0.074, 0.072], { color: WHITE, k: 0.05 }),
  pair(ell([0.045, 0.058, 0.04], [0.045, 0.036, 0.03], { color: WHITE, k: 0.05 })),
  cone([0.085, 0.076, 0], [0.162, 0.07, 0], 0.025, 0.0135, { color: BILL, k: 0.012 }),
  ell([0.163, 0.063, 0], [0.017, 0.016, 0.0135], { color: BILL, k: 0.012 }),
], { h: 0.013, k: 0.04 })

// La mandibule du bas : s'ouvre quand elle crie. Tache rouge près du bout.
const JAW = blob([
  cone([0, 0, 0], [0.054, 0.006, 0], 0.017, 0.0115, { color: BILL }),
  ell([0.056, 0.006, 0], [0.012, 0.011, 0.011], { color: BILL, k: 0.01 }),
], {
  h: 0.0075, k: 0.012,
  paint: (p, c) => c.lerp(cRed, 0.9 * smooth(Math.min(1, Math.max(0, (p.x - 0.034) / 0.01)))),
})

// Les yeux : grosses billes sombres posées sur les côtés de la tête (repère du pivot du cou), avec leur reflet.
const EYES = beads([-1, 1].flatMap((s) => [
  { c: [0.066, 0.1, s * 0.058], r: 0.024, color: 0x2e2438 },
  { c: [0.074, 0.111, s * 0.072], r: 0.0075, color: 0xffffff },
]), 12)

// Les pattes fines (rayon 0,011) et leurs pieds palmés posés sur le poteau.
const LEGS = blob(
  [-1, 1].flatMap((s) => [
    cone([0.0, 0.14, s * 0.045], [0.012, 0.016, s * 0.045], 0.0125, 0.0105, { color: LEG }),
    ell([0.03, 0.012, s * 0.045], [0.03, 0.01, 0.02], { color: LEG, k: 0.012 }),
  ]),
  { h: 0.009, k: 0.012 },
)

/**
 * Une mouette posée sur le poteau de la terrasse. Elle regarde autour d'elle ; quand on écoute les mouettes, elle lève la
 * tête et ouvre le bec pour crier, et s'ébroue des ailes de temps en temps.
 */
export function Gull() {
  const g = useRef<Group>(null!), head = useRef<Group>(null!), jaw = useRef<Group>(null!), wings = useRef<Group[]>([])
  const call = useRef(0), ruffle = useRef(0)
  useSquash('gull', g)
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime, on = isActive(useStore.getState(), 'gull')
    // cri : une fois toutes les ~4 s quand elle est « allumée »
    const phase = (t % 4.3) / 4.3, crying = on && phase < 0.18
    call.current = approach(call.current, crying ? 1 : 0, Math.min(delta, 0.05) * 10)
    const k = call.current
    if (!reduceMotion) head.current.rotation.y = Math.sin(t * 0.7) * 0.6 * (1 - k) + Math.sin(t * 2.3) * 0.08
    head.current.rotation.z = k * 0.55
    jaw.current.rotation.z = -k * 0.4
    // l'ébrouement : les ailes s'écartent du corps (tour autour de y) et se soulèvent (autour de x), pas de saut d'une image à l'autre
    // l'ébrouement monte et retombe en cloche (sin sur la fenêtre de 0,6 s), et son poids `ruffle` suit l'allumage en douceur
    ruffle.current = approach(ruffle.current, on && !reduceMotion ? 1 : 0, Math.min(delta, 0.05) * 3)
    const w = t % 9, bell = w < 0.6 ? Math.sin((w / 0.6) * Math.PI) : 0
    const flap = ruffle.current * bell * (Math.sin(t * 30) * 0.4 + 0.6)
    wings.current.forEach((w, i) => {
      const s = i ? -1 : 1
      // au repos les bouts des ailes se rejoignent un peu sur la queue ; l'ébrouement les écarte
      w.rotation.y = s * (flap * 0.55 - FOLD)
      w.rotation.x = s * flap * 0.4
    })
  })
  return (
    <group ref={g} userData={{ id: 'gull' }} position={[-0.25, 0.86, -3.6]} rotation-y={0.45}>
      <Part geo={LEGS} m={B.gullSkin} castShadow={false} />
      <group position={[0, LIFT, 0]}>
        <Part geo={BODY} m={B.gullSkin} />
        {[1, -1].map((s, i) => (
          <group key={s} ref={(el) => void (el && (wings.current[i] = el))} position={[0.02, 0.232, s * 0.066]} scale={[1, 1, s]}>
            <Part geo={WING} m={B.gullSkin} />
          </group>
        ))}
        <group ref={head} position={[0.08, 0.215, 0]}>
          <Part geo={HEAD} m={B.gullSkin} />
          <Part geo={EYES} m={B.gullBead} castShadow={false} />
          <group ref={jaw} position={[0.088, 0.046, 0]}>
            <Part geo={JAW} m={B.gullSkin} castShadow={false} />
          </group>
        </group>
      </group>
    </group>
  )
}
