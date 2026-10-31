import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, smooth } from '../../math'
import { Part } from '../parts'
import { blob, cone, ell, pair } from '../blob'
import { reduceMotion, useSquash } from '../anim'
import { beads } from '../objects/beads'
import { R } from './materials'

// Trois pigeons sur le parapet du fond : [x, orientation, déphasage].
const BIRDS = [[0.5, -0.4, 0], [1.05, -1.3, 1.3], [1.7, -0.7, 2.6]] as const

// Un pigeon d'une seule peau (scene/blob.ts), regardant vers +x, pieds en (0, 0, 0). Les trois pigeons partagent les mêmes maillages.
const GREY = 0xa9adbd, WING = 0x8a8fa6, BAR = 0x4b4f66, TAIL = 0x5d6174, NECK = 0x5fae94, VIOLET = 0x9a78c4, BEAK = 0x3d363c, FEET = 0xe08486
const cBar = new Color(BAR), cGreen = new Color(NECK), cViolet = new Color(VIOLET), cBelly = new Color(0xc9c9d6)
const clamp01 = (x: number) => Math.min(1, Math.max(0, x))
const iris = (f: number) => cGreen.clone().lerp(cViolet, f)
const band = (x: number, c: number, w: number) => 1 - smooth(clamp01(Math.abs(x - c) / w))

// Le corps : poitrail bombé, dos, ailes repliées (deux barres sombres, bouts sombres) et queue courte.
const BODY = blob([
  ell([-0.005, 0.118, 0], [0.115, 0.075, 0.07], { color: GREY, rot: [0, 0, 0.15] }),
  ell([0.065, 0.133, 0], [0.075, 0.08, 0.073], { color: GREY, k: 0.05 }),
  pair(ell([-0.03, 0.14, 0.04], [0.098, 0.05, 0.036], { color: WING, rot: [0, 0, 0.2], k: 0.02 })),
  ell([-0.15, 0.108, 0], [0.075, 0.017, 0.045], { color: TAIL, rot: [0, 0, 0.22], k: 0.03 }),
], {
  h: 0.0125, k: 0.04,
  paint: (p, c) => {
    // le ventre plus clair
    c.lerp(cBelly, 0.45 * smooth(clamp01((0.105 - p.y) / 0.05)))
    // le haut du poitrail prolonge le col irisé
    const w = smooth(clamp01((p.y - 0.13) / 0.035)) * smooth(clamp01((p.x - 0.015) / 0.04))
    if (w > 0) c.lerp(iris(clamp01((0.2 - p.y) / 0.06 + (p.x - 0.05) * 2.5)), w)
    // deux barres sombres en travers de l'aile, et le bout des ailes plus sombre
    if (Math.abs(p.z) > 0.03 && p.y > 0.1) {
      c.lerp(cBar, 0.7 * Math.max(band(p.x, -0.038, 0.016), band(p.x, -0.078, 0.016)))
      c.lerp(cBar, 0.5 * smooth(clamp01((-p.x - 0.1) / 0.04)))
    }
    return c
  },
})

// La tête et le cou : pivot en bas du cou (dans la poitrine). Le col vert et violet fond dans la tête grise, le bec sombre porte une cire claire.
const HEAD = blob([
  cone([0, -0.01, 0], [0.04, 0.065, 0], 0.062, 0.047, { color: GREY, k: 0.05 }),
  ell([0.047, 0.075, 0], [0.048, 0.045, 0.043], { color: GREY, k: 0.05 }),
  cone([0.082, 0.07, 0], [0.13, 0.058, 0], 0.0145, 0.0088, { color: BEAK, k: 0.01 }),
  ell([0.131, 0.056, 0], 0.0088, { color: BEAK, k: 0.01 }),
  ell([0.094, 0.077, 0], [0.012, 0.01, 0.012], { color: 0xf3eef0, k: 0.008 }),
], {
  h: 0.0115, k: 0.04,
  paint: (p, c) => {
    // le col irisé : du vert en haut du cou au violet en bas et vers l'avant, sous l'œil seulement
    const w = smooth(clamp01((0.058 - p.y) / 0.02)) * (p.x < 0.085 ? 1 : 0)
    if (w > 0) {
      const f = clamp01((0.045 - p.y) / 0.06 + (p.x - 0.02) * 3 - 0.2)
      c.lerp(iris(f), w)
    }
    return c
  },
})

// Les yeux : une grosse bille orange, sa pupille et son reflet, de chaque côté de la tête (repère du pivot du cou).
const EYES = beads([-1, 1].flatMap((s) => [
  { c: [0.07, 0.087, 0.033 * s], r: 0.0165, color: 0xf08a3a },
  { c: [0.0735, 0.0885, 0.0418 * s], r: 0.0088, color: 0x2a2430 },
  { c: [0.0775, 0.0935, 0.0478 * s], r: 0.0034, color: 0xffffff },
]), 12)

// Les pattes roses (rayon 0,008, environ 0,012 une fois le pigeon agrandi) et leurs petits pieds.
const LEGS = blob(
  [-1, 1].flatMap((s) => [
    cone([-0.005, 0.065, s * 0.026], [0.004, 0.012, s * 0.026], 0.009, 0.0078, { color: FEET }),
    ell([0.018, 0.008, s * 0.026], [0.024, 0.007, 0.013], { color: FEET, k: 0.008 }),
  ]),
  { h: 0.007, k: 0.01 },
)

// Le pivot du cou
const HX = 0.075, HY = 0.15

function Pigeon({ x, rot, ph, coo }: { x: number; rot: number; ph: number; coo: { current: boolean } }) {
  const body = useRef<Group>(null!), head = useRef<Group>(null!), w = useRef(0), peck = useRef(0)
  useFrame(({ clock }, delta) => {
    if (reduceMotion) return
    const t = clock.elapsedTime + ph, dt = Math.min(delta, 0.05)
    // le roucoulement : la gorge gonfle, la tête plonge et remonte ; sinon, de petits coups de tête. Les deux se fondent l'un dans
    // l'autre (w, peck) : à l'allumage, rien ne saute.
    w.current = approach(w.current, coo.current ? 1 : 0, dt * 1.5)
    peck.current = approach(peck.current, Math.sin(t * 0.7) > 0.6 ? 1 : 0, dt * 4)
    const c = w.current * Math.max(0, Math.sin(t * 2.4))
    body.current.scale.set(1, 1 + c * 0.12, 1 + c * 0.1)
    head.current.position.x = HX - c * 0.03 + (1 - w.current) * Math.sin(t * 5) * 0.01 * peck.current
    head.current.rotation.z = -c * 0.5
    head.current.rotation.y = Math.sin(t * 0.6) * 0.5
  })
  return (
    <group position={[x, 1.02, -3.18]} rotation-y={rot} scale={1.45}>
      <Part geo={LEGS} m={R.pigeonSkin} castShadow={false} />
      <group ref={body}>
        <Part geo={BODY} m={R.pigeonSkin} />
      </group>
      <group ref={head} position={[HX, HY, 0]}>
        <Part geo={HEAD} m={R.pigeonSkin} castShadow={false} />
        <Part geo={EYES} m={R.pigeonBead} castShadow={false} />
      </group>
    </group>
  )
}

/** Les pigeons du toit : quand on les écoute, ils roucoulent en gonflant la gorge. */
export function Pigeons() {
  const g = useRef<Group>(null!), coo = useRef(false)
  useSquash('pigeons', g)
  useFrame(() => void (coo.current = isActive(useStore.getState(), 'pigeons')))
  return (
    // Le rebond agrandit le groupe autour de son origine : on la met au milieu des oiseaux, sur le parapet.
    <group ref={g} userData={{ id: 'pigeons' }} position={[1.1, 1.0, -3.18]}>
      <group position={[-1.1, -1.0, 3.18]}>
        {BIRDS.map(([x, rot, ph]) => (
          <Pigeon key={x} x={x} rot={rot} ph={ph} coo={coo} />
        ))}
      </group>
    </group>
  )
}
