import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, CatmullRomCurve3, TubeGeometry, Vector3, type Sprite } from 'three'
import { TAU, smooth } from '../../math'
import { dn, mix, hex, poly, rgb, seeded, usePainted } from '../paint'
import { Part, cyl, noRay, rbox } from '../parts'
import { mood } from '../anim'
import { glowTex } from '../textures'
import { ScrollLayer } from '../objects/ScrollLayer'
import { B } from './materials'
import { crestTex } from './textures'

// La mer par la grande porte du bungalow. Une vue peinte (ciel, soleil couchant ou lune, phare, mer, sable) posée juste
// derrière le mur, des vagues qui défilent par-dessus, et la terrasse de planches entre les deux.
// Le plan peint couvre x ∈ [-1.1, 2.1], y ∈ [-0.4, 3.0] : c'est tout ce qu'on voit par l'ouverture (le reste est caché par le mur).
const X0 = -1.1, Y1 = 3.0, PX = 200, W = 640, H = 680
const cx = (x: number) => (x - X0) * PX, cy = (y: number) => (Y1 - y) * PX
const HORIZON = cy(1.95), SHORE = cy(0.35)

const P = {
  skyTop: ['#f4ad9f', '#10163a'], skyMid: ['#f9c7a6', '#262c62'], skyLow: ['#ffe2b0', '#3b3f7a'],
  cloud: ['#fbd3c3', '#2b3166'], cloudLit: ['#fff0d8', '#4a4f88'],
  hill: ['#c99a8e', '#1e2350'], hillNear: ['#b98a84', '#181c42'],
  seaFar: ['#8fcfcf', '#2a3a74'], seaNear: ['#46b0b2', '#17244e'],
  sand: ['#f2d8a8', '#4c4b78'], wetSand: ['#d9b98a', '#3a3a66'],
} as const

function draw(x: CanvasRenderingContext2D, n: number) {
  const r = seeded(17), c = (k: keyof typeof P) => rgb(dn(P[k], n))
  // le ciel
  const sky = x.createLinearGradient(0, 0, 0, HORIZON)
  sky.addColorStop(0, c('skyTop')); sky.addColorStop(0.6, c('skyMid')); sky.addColorStop(1, c('skyLow'))
  x.fillStyle = sky; x.fillRect(0, 0, W, HORIZON + 2)
  // les étoiles, la nuit
  if (n > 0.05) for (let i = 0; i < 90; i++) {
    x.fillStyle = `rgba(255,248,230,${(0.3 + r() * 0.7) * n})`
    const s = r() < 0.1 ? 2.4 : 1.3
    x.fillRect(r() * W, r() * HORIZON * 0.85, s, s)
  } else for (let i = 0; i < 90; i++) { r(); r(); r(); r() }
  // le soleil qui se couche (jour), la lune (nuit)
  const sun: [number, number] = [cx(1.35), cy(2.12)], moon: [number, number] = [cx(-0.25), cy(2.7)]
  if (n < 0.95) {
    const k = 1 - n, gl = x.createRadialGradient(...sun, 0, ...sun, 210)
    gl.addColorStop(0, `rgba(255,236,190,${0.9 * k})`); gl.addColorStop(0.25, `rgba(255,190,140,${0.45 * k})`); gl.addColorStop(1, 'rgba(255,170,130,0)')
    x.fillStyle = gl; x.fillRect(0, 0, W, HORIZON)
    x.fillStyle = `rgba(255,246,220,${k})`; x.beginPath(); x.arc(...sun, 34, 0, TAU); x.fill()
  }
  if (n > 0.05) {
    const gl = x.createRadialGradient(...moon, 0, ...moon, 120)
    gl.addColorStop(0, `rgba(220,226,255,${0.45 * n})`); gl.addColorStop(1, 'rgba(200,210,255,0)')
    x.fillStyle = gl; x.fillRect(0, 0, W, HORIZON)
    x.fillStyle = `rgba(248,246,236,${n})`; x.beginPath(); x.arc(...moon, 22, 0, TAU); x.fill()
    x.fillStyle = `rgba(220,220,235,${0.5 * n})`; x.beginPath(); x.arc(moon[0] - 6, moon[1] - 4, 5, 0, TAU); x.arc(moon[0] + 7, moon[1] + 6, 3.5, 0, TAU); x.fill()
  }
  // longs nuages effilochés, éclairés par en dessous
  for (let i = 0; i < 7; i++) {
    const px = r() * W, py = 30 + r() * (HORIZON - 80), w = 90 + r() * 160
    x.fillStyle = rgb(mix(dn(P.cloud, n), dn(P.cloudLit, n), r()), 0.75)
    x.beginPath(); x.ellipse(px, py, w, 7 + r() * 6, 0, 0, TAU); x.fill()
    x.beginPath(); x.ellipse(px + w * 0.3, py - 6, w * 0.5, 6, 0, 0, TAU); x.fill()
  }
  // le cap et son phare, à gauche
  poly(x, [[0, HORIZON + 2], [0, cy(2.2)], [cx(-0.85), cy(2.28)], [cx(-0.55), cy(2.24)], [cx(-0.2), cy(2.1)], [cx(0.25), HORIZON + 2]], c('hill'))
  poly(x, [[0, HORIZON + 2], [0, cy(2.08)], [cx(-0.7), cy(2.04)], [cx(-0.1), HORIZON + 2]], c('hillNear'))
  const lx = cx(-0.55), ly = cy(2.24)
  x.fillStyle = rgb(mix(hex('#fbf6ee'), hex('#8a8fb8'), n)); poly(x, [[lx - 7, ly], [lx - 5, ly - 46], [lx + 5, ly - 46], [lx + 7, ly]], x.fillStyle as string)
  x.fillStyle = rgb(mix(hex('#e0586e'), hex('#6a3a60'), n)); x.fillRect(lx - 6.5, ly - 18, 13, 8); x.fillRect(lx - 5.5, ly - 36, 11, 8)
  x.fillStyle = rgb(mix(hex('#4a3a5a'), hex('#2a2440'), n)); x.fillRect(lx - 7, ly - 54, 14, 8)
  x.fillStyle = n > 0.3 ? '#fff2c0' : rgb(mix(hex('#fff2c0'), hex('#c9d4e8'), 0.5)); x.fillRect(lx - 4, ly - 52, 8, 5)
  // la mer, plus claire au loin
  const sea = x.createLinearGradient(0, HORIZON, 0, SHORE)
  sea.addColorStop(0, c('seaFar')); sea.addColorStop(1, c('seaNear'))
  x.fillStyle = sea; x.fillRect(0, HORIZON, W, SHORE - HORIZON + 4)
  // le chemin de lumière : soleil doré ou lune argentée
  const path = n < 0.5 ? sun[0] : moon[0], tint = n < 0.5 ? '255,226,160' : '226,232,255'
  for (let i = 0; i < 46; i++) {
    const k = r(), py = HORIZON + 4 + k * k * (SHORE - HORIZON - 20), spread = 10 + k * 70
    x.fillStyle = `rgba(${tint},${(0.75 - k * 0.5) * (n < 0.5 ? 1 - n * 1.6 : n)})`
    x.fillRect(path - spread / 2 + r() * spread * 0.6, py, 8 + r() * 26 * (1 - k * 0.5), 2 + k * 2)
  }
  // ondulations
  for (let i = 0; i < 70; i++) {
    const k = r(), py = HORIZON + 6 + k * (SHORE - HORIZON - 10)
    x.fillStyle = `rgba(255,255,255,${0.08 + k * 0.12})`
    x.fillRect(r() * W, py, 10 + k * 40, 1.5 + k * 1.5)
  }
  // un voilier au large
  const bx = cx(0.75), by = HORIZON - 1
  x.fillStyle = rgb(mix(hex('#fffaf0'), hex('#7a80b0'), n)); poly(x, [[bx, by - 4], [bx + 1, by - 34], [bx + 14, by - 6]], x.fillStyle as string)
  poly(x, [[bx - 2, by - 6], [bx - 1, by - 24], [bx - 11, by - 7]], x.fillStyle as string)
  x.fillStyle = rgb(mix(hex('#3a4a6b'), hex('#1a2040'), n)); x.fillRect(bx - 12, by - 4, 28, 4)
  // le sable, la frange mouillée
  const sand = x.createLinearGradient(0, SHORE - 6, 0, H)
  sand.addColorStop(0, c('wetSand')); sand.addColorStop(0.18, c('sand')); sand.addColorStop(1, c('sand'))
  x.fillStyle = sand; x.beginPath(); x.moveTo(0, SHORE)
  for (let px = 0; px <= W; px += 16) x.lineTo(px, SHORE + Math.sin(px * 0.02) * 4)
  x.lineTo(W, H); x.lineTo(0, H); x.closePath(); x.fill()
  for (let i = 0; i < 500; i++) { x.fillStyle = `rgba(${n > 0.5 ? '30,30,60' : '190,150,100'},${r() * 0.25})`; x.fillRect(r() * W, SHORE + 10 + r() * (H - SHORE), 2, 2) }
  // deux coquillages et une étoile de mer sur le sable
  x.fillStyle = rgb(mix(hex('#f7c3b4'), hex('#6a5a80'), n)); x.beginPath(); x.ellipse(cx(0.2), cy(0.05), 9, 6, 0.3, 0, TAU); x.fill()
  x.fillStyle = rgb(mix(hex('#f08a76'), hex('#5a3a60'), n))
  x.save(); x.translate(cx(1.5), cy(-0.05)); x.beginPath()
  for (let i = 0; i < 10; i++) { const a = (i / 10) * TAU - Math.PI / 2, rad = i % 2 ? 5 : 13; x.lineTo(Math.cos(a) * rad, Math.sin(a) * rad) }
  x.closePath(); x.fill(); x.restore()
}

const far = crestTex(2), mid = crestTex(4), near = crestTex(6), foam = crestTex(8, true)
const DECK_Z = -3.53
const rope = new TubeGeometry(new CatmullRomCurve3([new Vector3(-0.25, 0.78, -3.6), new Vector3(1.0, 0.6, -3.6), new Vector3(2.25, 0.78, -3.6)]), 24, 0.012, 5, false)

/** Ce qu'on voit par la porte : la mer qui bouge, le phare qui tourne la nuit, la terrasse et ses deux poteaux. */
export function SeaView() {
  const tex = usePainted(W, H, draw), beam = useRef<Sprite>(null!)
  useFrame(({ clock }) => {
    // Le phare : un éclat toutes les cinq secondes, la nuit.
    const n = smooth(mood.night), ph = (clock.elapsedTime % 5) / 5
    beam.current.material.opacity = n * (0.15 + 0.85 * Math.pow(Math.max(0, Math.cos(ph * TAU)), 18))
  })
  return (
    <group raycast={noRay}>
      <mesh position={[0.5, 1.3, -3.8]} raycast={noRay}>
        <planeGeometry args={[3.2, 3.4]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <sprite ref={beam} scale={0.9} position={[-0.55, 2.5, -3.78]} raycast={noRay}>
        <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
      <ScrollLayer map={far} position={[0.5, 1.78, -3.79]} size={[3.2, 0.1]} color={[0xe6f6f2, 0x6a78b0]} speed={0.006} bob={[0.006, 0.5]} />
      <ScrollLayer map={mid} position={[0.5, 1.3, -3.785]} size={[3.2, 0.18]} color={[0xdff4f0, 0x6070a8]} speed={-0.01} bob={[0.012, 0.7]} phase={1} />
      <ScrollLayer map={near} position={[0.5, 0.82, -3.78]} size={[3.2, 0.26]} color={[0xf2fbf8, 0x7884bc]} speed={0.014} bob={[0.02, 0.6]} phase={2} />
      <ScrollLayer map={foam} position={[0.5, 0.4, -3.775]} size={[3.2, 0.24]} color={[0xffffff, 0x8a94c8]} speed={0.004} bob={[0.07, 0.42]} phase={0.5} />
      {/* la terrasse dehors, ses deux poteaux et sa corde */}
      <Part geo={rbox(3.4, 0.12, 0.5, 0.03)} m={B.driftwood} p={[0.8, -0.06, DECK_Z]} castShadow={false} />
      {[-0.25, 2.25].map((px) => (
        <group key={px}>
          <Part geo={cyl(0.07, 0.08, 0.84, 12)} m={B.driftwood} p={[px, 0.4, -3.6]} castShadow={false} />
          <Part geo={cyl(0.085, 0.085, 0.04, 12)} m={B.wood} p={[px, 0.84, -3.6]} castShadow={false} />
        </group>
      ))}
      <mesh geometry={rope} material={B.rope} raycast={noRay} />
    </group>
  )
}
