import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, type Group, type Mesh, type MeshBasicMaterial, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import { TAU, approach, smooth } from '../../math'
import { dn, poly, rgb, seeded, usePainted, canvasTex } from '../paint'
import { Part, SPH, cyl, noRay } from '../parts'
import { mood, reduceMotion } from '../anim'
import { glowTex } from '../textures'
import { ScrollLayer } from '../objects/ScrollLayer'
import { LIVE } from '../Static'
import { crestTex } from '../beach/textures'
import { L } from './materials'
import { PORT } from './LighthouseShell'

// La mer par le hublot. Un fond peint (ciel de tempête, nuages, la lune, l'horizon, des rochers), posé derrière le mur ; devant
// lui trois bandes de vagues qui défilent, un cargo qui passe au large et une bouée qui clignote. La nuit, le faisceau du phare
// balaie la mer toutes les huit secondes et jette une tache de lumière qui traverse le plancher.
// Ce qu'on voit par un trou rond du mur remonte et glisse vers la droite : le plan est donc décalé de (-0,62 ; -0,5).
const CX = PORT.x - 0.62, CY = PORT.y - 0.5, Z = -3.8, PX = 200, W = 520, H = 520
const cy = (y: number) => 260 + (CY - y) * PX // y du monde → pixel
const HORIZON = cy(1.86)
const wx = (px: number) => CX + (px - 260) / PX // pixel → x du monde

const P = {
  skyTop: ['#6c7c92', '#0a1230'], skyMid: ['#9b9aa0', '#1a2850'], skyLow: ['#f1c486', '#35487a'],
  cloud: ['#59657a', '#1a2444'], cloudLit: ['#e8b27a', '#5a6e9c'],
  seaFar: ['#3d6a84', '#15284c'], seaNear: ['#173a52', '#060f26'],
  rock: ['#242c3a', '#04070f'], rockWet: ['#5c6a80', '#26385a'],
} as const

function draw(x: CanvasRenderingContext2D, n: number) {
  const r = seeded(31), c = (k: keyof typeof P) => rgb(dn(P[k], n))
  const sky = x.createLinearGradient(0, 0, 0, HORIZON)
  sky.addColorStop(0, c('skyTop')); sky.addColorStop(0.55, c('skyMid')); sky.addColorStop(1, c('skyLow'))
  x.fillStyle = sky; x.fillRect(0, 0, W, HORIZON + 2)
  // les étoiles, entre les nuages, la nuit
  if (n > 0.05) for (let i = 0; i < 70; i++) { x.fillStyle = `rgba(255,248,230,${(0.25 + r() * 0.6) * n})`; x.fillRect(r() * W, r() * HORIZON * 0.8, r() < 0.1 ? 2.2 : 1.2, r() < 0.1 ? 2.2 : 1.2) }
  else for (let i = 0; i < 70; i++) { r(); r(); r(); r() }
  // la lune, voilée
  if (n > 0.05) {
    const mx = 330, my = 150, gl = x.createRadialGradient(mx, my, 0, mx, my, 120)
    gl.addColorStop(0, `rgba(226,232,255,${0.5 * n})`); gl.addColorStop(1, 'rgba(210,220,255,0)')
    x.fillStyle = gl; x.fillRect(0, 0, W, HORIZON)
    x.fillStyle = `rgba(250,248,238,${n})`; x.beginPath(); x.arc(mx, my, 20, 0, TAU); x.fill()
  }
  // les nuages de tempête : de longs bancs sombres, la lumière rasante les borde de dessous
  for (let i = 0; i < 12; i++) {
    const py = 60 + (i / 12) * (HORIZON - 80) + r() * 14, pw = 90 + r() * 200, px = r() * W
    x.fillStyle = rgb(dn(P.cloud, n), 0.92)
    x.beginPath(); x.ellipse(px, py, pw, 14 + r() * 16, 0, 0, TAU); x.ellipse(px + pw * 0.4, py - 10, pw * 0.5, 11 + r() * 9, 0, 0, TAU); x.fill()
    x.fillStyle = rgb(dn(P.cloudLit, n), 0.55)
    x.beginPath(); x.ellipse(px, py + 12, pw * 0.9, 3 + r() * 3, 0, 0, TAU); x.fill()
  }
  // la trouée d'ambre au ras de l'horizon
  const gap = x.createLinearGradient(0, HORIZON - 40, 0, HORIZON)
  gap.addColorStop(0, 'rgba(255,200,130,0)'); gap.addColorStop(1, `rgba(255,205,140,${0.55 * (1 - n * 0.85)})`)
  x.fillStyle = gap; x.fillRect(0, HORIZON - 40, W, 40)
  // la mer
  const sea = x.createLinearGradient(0, HORIZON, 0, H)
  sea.addColorStop(0, c('seaFar')); sea.addColorStop(1, c('seaNear'))
  x.fillStyle = sea; x.fillRect(0, HORIZON, W, H - HORIZON)
  // le reflet : ambre le jour sous la trouée, argent la nuit sous la lune
  const gx = n < 0.5 ? 240 : 330, tint = n < 0.5 ? '255,214,150' : '226,232,255'
  for (let i = 0; i < 40; i++) {
    const k = r(), py = HORIZON + 3 + k * k * (H - HORIZON - 70), spread = 14 + k * 90
    x.fillStyle = `rgba(${tint},${(0.7 - k * 0.45) * (n < 0.5 ? 0.9 - n : 0.5 + n * 0.4)})`
    x.fillRect(gx - spread / 2 + r() * spread * 0.6, py, 8 + r() * 28, 2 + k * 2)
  }
  // des rouleaux plus sombres, au creux des vagues
  for (let i = 0; i < 60; i++) { const k = r(), py = HORIZON + 6 + k * (H - HORIZON - 40); x.fillStyle = `rgba(4,18,30,${0.1 + k * 0.18})`; x.fillRect(r() * W, py, 14 + k * 70, 2 + k * 3) }
  // la bouée, loin à gauche
  x.fillStyle = rgb(dn(['#a8323a', '#401820'], n)); poly(x, [[170, 338], [178, 322], [186, 338]], x.fillStyle as string)
  x.fillStyle = rgb(dn(['#2b2f3a', '#080a12'], n)); x.fillRect(176, 316, 4, 8)
  // les rochers du premier plan, noirs, luisants de mouillé
  const rock = c('rock'), wet = c('rockWet')
  poly(x, [[80, H], [80, 400], [112, 388], [140, 410], [170, 440], [210, 470], [260, H]], rock)
  poly(x, [[300, H], [340, 458], [380, 448], [410, 424], [440, 408], [470, 420], [470, H]], rock)
  x.strokeStyle = wet; x.lineWidth = 2
  x.beginPath(); x.moveTo(112, 389); x.lineTo(140, 411); x.moveTo(380, 449); x.lineTo(410, 425); x.moveTo(440, 409); x.lineTo(470, 421); x.stroke()
}

const crest = [crestTex(3), crestTex(5), crestTex(7), crestTex(9, true)]
/** Un petit cargo, vu de côté : coque, château, cheminée et sa fumée. */
const shipTex = canvasTex(96, 48, (x) => {
  x.fillStyle = '#fff'
  poly(x, [[4, 30], [92, 30], [82, 42], [12, 42]], '#fff')
  x.fillRect(22, 18, 36, 12); x.fillRect(58, 10, 12, 20); x.fillRect(64, 3, 5, 9)
  x.fillStyle = 'rgba(255,255,255,.55)'; x.beginPath(); x.ellipse(80, 6, 12, 5, 0, 0, TAU); x.ellipse(90, 2, 8, 3, 0, 0, TAU); x.fill()
})

/** Ce qu'on voit par le hublot : la mer qui bouge, le cargo, la bouée, le faisceau du phare (la nuit). */
export function SeaView() {
  const tex = usePainted(W, H, draw)
  const beam = useRef<Sprite>(null!), patch = useRef<Mesh>(null!), buoy = useRef<Sprite>(null!), ship = useRef<Mesh>(null!)
  const day = new Color(0x5a6a7e), night = new Color(0x0c1226)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, n = smooth(mood.night)
    // le faisceau : une balayée toutes les six secondes et demie, qui traverse le hublot de gauche à droite
    const p = (t % 6.5) / 2.4, on = p < 1 ? Math.sin(Math.PI * p) ** 2 : 0
    beam.current.material.opacity = n * on * 0.85
    beam.current.position.x = CX + (p * 2 - 1) * 1.5
    const m = patch.current.material as MeshBasicMaterial
    m.opacity = n * on * 0.5
    patch.current.position.x = PORT.x - 0.4 + (Math.min(p, 1) * 2 - 1) * 1.7
    // la bouée : un éclat rouge toutes les trois secondes
    buoy.current.material.opacity = 0.25 + 0.75 * Math.max(0, 1 - ((t % 3) / 0.35)) * (0.45 + n * 0.55)
    // le cargo traverse l'horizon en quatre minutes, en roulant un peu
    const q = (t / 240) % 1
    ship.current.position.x = CX + 1.4 - q * 2.8
    ship.current.position.y = CY + (260 - HORIZON) / PX + 0.045 + (reduceMotion ? 0 : Math.sin(t * 0.9) * 0.006)
    ;(ship.current.material as MeshBasicMaterial).color.copy(day).lerp(night, n)
  })
  return (
    <group userData={LIVE} raycast={noRay}>
      <mesh position={[CX, CY, Z]} raycast={noRay}>
        <planeGeometry args={[2.6, 2.6]} />
        <meshBasicMaterial map={tex} />
      </mesh>
      <mesh ref={ship} position={[CX, CY, Z + 0.004]} raycast={noRay}>
        <planeGeometry args={[0.36, 0.18]} />
        <meshBasicMaterial map={shipTex} transparent depthWrite={false} />
      </mesh>
      <ScrollLayer map={crest[0]} position={[CX, CY + (260 - HORIZON) / PX - 0.03, Z + 0.006]} size={[2.6, 0.1]} color={[0x9fbccb, 0x4a5e9a]} speed={0.007} bob={[0.006, 0.6]} />
      <ScrollLayer map={crest[1]} position={[CX, CY - 0.22, Z + 0.008]} size={[2.6, 0.2]} color={[0xb6d0dc, 0x5468a6]} speed={-0.012} bob={[0.014, 0.8]} phase={1} />
      <ScrollLayer map={crest[2]} position={[CX, CY - 0.48, Z + 0.01]} size={[2.6, 0.3]} color={[0xcfe2ea, 0x6074b4]} speed={0.02} bob={[0.024, 0.7]} phase={2} />
      <ScrollLayer map={crest[3]} position={[CX, CY - 0.7, Z + 0.012]} size={[2.6, 0.28]} color={[0xffffff, 0x8a98d0]} speed={-0.008} bob={[0.07, 0.5]} phase={0.5} />
      <sprite ref={buoy} scale={0.2} position={[wx(178), CY + (260 - 330) / PX, Z + 0.02]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0xff4a5a} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
      <sprite ref={beam} scale={[0.9, 2.8, 1]} position={[CX, CY, Z + 0.03]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0xfff1c8} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
      {/* la tache de lumière qui traverse le plancher quand le faisceau passe devant le hublot */}
      <mesh ref={patch} position={[PORT.x, 0.03, -1.7]} rotation-x={-Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[1.5, 2.6]} />
        <meshBasicMaterial map={glowTex} color={0xffe9b8} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </mesh>
    </group>
  )
}

/** Le battant du hublot, qui s'ouvre vers la pièce quand on écoute la mer ; la pluie coule sur sa vitre. */
export function Porthole() {
  const sash = useRef<Group>(null!), open = useRef(0)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    open.current = approach(open.current, isActive(useStore.getState(), 'window') ? 1 : 0, dt * 1.4)
    sash.current.rotation.y = -smooth(open.current) * 1.15
    const m = L.streaks.map
    if (m && !reduceMotion) m.offset.y = (m.offset.y - dt * 0.16 + 1) % 1
  })
  const hinge = PORT.x - PORT.r - 0.11
  return (
    <group userData={{ id: 'window' }}>
      <group ref={sash} position={[hinge, PORT.y, -2.96]}>
        <group position={[PORT.r + 0.11, 0, 0]}>
          <Part m={L.brass}>
            <torusGeometry args={[PORT.r - 0.05, 0.055, 12, 48]} />
          </Part>
          <Part geo={cyl(PORT.r - 0.07, PORT.r - 0.07, 0.02, 48)} m={L.glass} rotation-x={Math.PI / 2} castShadow={false} />
          <mesh material={L.streaks} position={[0, 0, 0.014]} renderOrder={2} raycast={noRay}>
            <circleGeometry args={[PORT.r - 0.08, 40]} />
          </mesh>
          {/* les écrous à oreilles, sur le bord droit */}
          {[-0.28, 0.28].map((dy) => (
            <group key={dy} position={[PORT.r - 0.02, dy, 0.07]}>
              <Part geo={cyl(0.035, 0.035, 0.1, 10)} m={L.brassDull} rotation-x={Math.PI / 2} castShadow={false} />
              <Part geo={SPH} m={L.brass} scale={[0.11, 0.035, 0.03]} p={[0, 0, 0.06]} castShadow={false} />
            </group>
          ))}
        </group>
      </group>
      {/* zone de tap invisible sur tout le hublot */}
      <mesh visible={false} position={[PORT.x, PORT.y, -2.99]}>
        <planeGeometry args={[PORT.r * 2, PORT.r * 2]} />
      </mesh>
    </group>
  )
}
