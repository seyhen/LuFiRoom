import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshBasicMaterial, PlaneGeometry, type Group, type Mesh } from 'three'
import { approach, TAU } from '../../../math'
import { isActive, useStore } from '../../../state/store'
import { reduceMotion, useSquash } from '../../anim'
import { far } from '../../materials'
import { canvasTex } from '../../paint'
import { Part, SPH, cyl, noRay, rbox } from '../../parts'
import { skyFade } from '../../outdoor'
import { LIVE } from '../../Static'

// La fenêtre éclairée de l'immeuble d'en face : un salon chaud, un piano droit, quelqu'un qui joue un air lent dans la nuit. Interactive
// (`pianowindow`) : touchée, le piano joue (le son `windowpiano`), la lampe respire et quelques notes montent de la fenêtre.

const F = { c: [0, 0] as [number, number], r0: 10, r1: 15.5 }
const W = 1.1, H = 2.1

/** L'intérieur peint : un mur chaud, un cadre, la lampe, le piano droit (clavier blanc, pupitre) et le dos de la personne assise au tabouret. */
const roomTex = canvasTex(144, 272, (x) => {
  const g = x.createLinearGradient(0, 0, 0, 272)
  g.addColorStop(0, '#f7dc9c'); g.addColorStop(1, '#e49a58')
  x.fillStyle = g; x.fillRect(0, 0, 144, 272)
  // une suspension au plafond, puis tout le reste est décalé vers le bas et vers la droite
  x.fillStyle = '#5a3a2a'; x.fillRect(71, 0, 2, 24); x.fillStyle = '#fff0c0'; x.beginPath(); x.moveTo(60, 38); x.lineTo(84, 38); x.lineTo(78, 24); x.lineTo(66, 24); x.fill()
  x.translate(8, 80)
  // un cadre au mur, la lampe d'angle et son abat-jour
  x.fillStyle = '#7a4a3a'; x.fillRect(18, 26, 28, 36); x.fillStyle = '#e8c890'; x.fillRect(22, 30, 20, 28)
  x.fillStyle = '#d8884a'; x.fillRect(24, 44, 16, 10)
  x.fillStyle = '#5a3a2a'; x.fillRect(102, 76, 4, 70)
  x.fillStyle = '#fff0c0'; x.beginPath(); x.moveTo(92, 76); x.lineTo(116, 76); x.lineTo(110, 58); x.lineTo(98, 58); x.fill()
  // le piano droit : le corps brun, le pupitre, le clavier
  x.fillStyle = '#4a2c24'; x.beginPath(); x.roundRect(16, 88, 92, 82, 5); x.fill()
  x.fillStyle = '#6a3e30'; x.fillRect(22, 96, 80, 6)
  x.fillStyle = '#f4ead6'; x.fillRect(26, 70, 40, 24)
  x.fillStyle = '#c8b090'; for (let i = 0; i < 5; i++) x.fillRect(30, 76 + i * 4, 32, 1)
  x.fillStyle = '#f6f0e4'; x.fillRect(20, 124, 84, 11)
  x.fillStyle = '#2a1a1a'; for (let i = 0; i < 12; i++) if (i % 7 !== 2 && i % 7 !== 6) x.fillRect(24 + i * 6.7, 124, 3.4, 7)
  // la personne de dos au tabouret : tête, épaules, bras vers le clavier
  x.fillStyle = '#2a2430'; x.beginPath(); x.arc(64, 100, 9, 0, TAU); x.fill()
  x.beginPath(); x.roundRect(48, 108, 32, 38, 10); x.fill()
  x.fillRect(50, 124, 8, 14); x.fillRect(70, 124, 8, 14)
  x.fillStyle = '#6a3e30'; x.fillRect(46, 160, 36, 8)
})
/** Une croche, pour les notes qui montent. */
const noteTex = canvasTex(32, 48, (x) => {
  x.fillStyle = '#fff4cc'; x.beginPath(); x.ellipse(11, 38, 8, 6, -0.4, 0, TAU); x.fill()
  x.fillRect(17, 8, 3, 30); x.beginPath(); x.moveTo(20, 8); x.quadraticCurveTo(30, 16, 26, 28); x.lineTo(23, 24); x.quadraticCurveTo(25, 18, 20, 14); x.fill()
})

const f = (color: number, o = {}) => skyFade(far(color, { roughness: 0.5, ...o }), F)
const GLASS = skyFade(far(0xffffff, { map: roomTex, emissiveMap: roomTex, emissive: 0xffffff, emissiveIntensity: 0.55, roughness: 0.3 }), F)
const FRAME = f(0xeee6d8, { roughness: 0.6 })
const STONE = f(0xc8c2b4, { roughness: 0.75 })
const CURTAIN = f(0xf2e4cc, { roughness: 0.9 })
const BOX = f(0x37725a, { roughness: 0.55 })
const LEAF = f(0x5a8a58, { roughness: 0.7 })
const FLOWERS = [f(0xe86a7a), f(0xf4c040), f(0xf6f0f0)]
const NOTE_GEO = new PlaneGeometry(0.2, 0.3)
const notes = [0, 1, 2].map(() => new MeshBasicMaterial({ map: noteTex, transparent: true, opacity: 0, depthWrite: false }))

/** `at` : le centre de la fenêtre, collée à la façade (x, y, z) ; la fenêtre regarde vers +z. */
export function PianoWindow({ at }: { at: [number, number, number] }) {
  const root = useRef<Group>(null!), noteRefs = useRef<Mesh[]>([])
  const s = useRef({ amp: 0, glow: 0, phase: [0, 0.33, 0.66] })
  useSquash('pianowindow', root)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), S = s.current
    S.amp = approach(S.amp, isActive(useStore.getState(), 'pianowindow') && !reduceMotion ? 1 : 0, dt * 1.2)
    // la lampe respire (la phase s'additionne image après image), les notes montent et s'effacent l'une après l'autre
    S.glow += dt * 0.9
    GLASS.emissiveIntensity = 0.55 + 0.1 * S.amp * Math.sin(S.glow)
    for (let i = 0; i < 3; i++) {
      S.phase[i] = (S.phase[i] + dt * 0.16) % 1
      const k = S.phase[i], m = noteRefs.current[i]
      if (!m) continue
      m.position.set(-0.2 + i * 0.22 + Math.sin(k * 5 + i * 2) * 0.05, 0.1 + k * 0.85, 0.2 + k * 0.5)
      notes[i].opacity = S.amp * Math.sin(k * Math.PI) * 0.85
    }
  })
  return (
    <group ref={root} position={at} userData={{ id: 'pianowindow' }}>
      {/* le verre peint, le cadre blanc à quatre montants et son meneau, le rideau de chaque côté */}
      <mesh material={GLASS} position={[0, 0, 0.01]}><planeGeometry args={[W - 0.14, H - 0.14]} /></mesh>
      <Part geo={rbox(W, 0.08, 0.08, 0.02)} m={FRAME} p={[0, H / 2 - 0.04, 0.03]} castShadow={false} />
      <Part geo={rbox(W, 0.08, 0.08, 0.02)} m={FRAME} p={[0, -H / 2 + 0.04, 0.03]} castShadow={false} />
      {[-1, 1].map((sx) => <Part key={sx} geo={rbox(0.08, H, 0.08, 0.02)} m={FRAME} p={[sx * (W / 2 - 0.04), 0, 0.03]} castShadow={false} />)}
      <Part geo={rbox(W - 0.1, 0.04, 0.05, 0.015)} m={FRAME} p={[0, 0.35, 0.03]} castShadow={false} />
      {[-1, 1].map((sx) => <Part key={sx} geo={rbox(0.16, H - 0.2, 0.05, 0.02)} m={CURTAIN} p={[sx * 0.33, -0.02, 0.08]} castShadow={false} />)}
      {/* l'appui de pierre et la jardinière aux géraniums */}
      <Part geo={rbox(W + 0.24, 0.07, 0.24, 0.025)} m={STONE} p={[0, -H / 2 - 0.035, 0.1]} castShadow={false} />
      <Part geo={rbox(0.82, 0.13, 0.15, 0.03)} m={BOX} p={[0, -H / 2 + 0.07, 0.16]} castShadow={false} />
      {[-0.3, -0.1, 0.1, 0.3].map((x, i) => (
        <group key={x} position={[x, -H / 2 + 0.2, 0.16]}>
          <Part geo={cyl(0.012, 0.012, 0.1, 5)} m={LEAF} p={[0, 0, 0]} castShadow={false} />
          <Part geo={SPH} m={LEAF} p={[0, 0.0, 0]} scale={[0.1, 0.05, 0.08]} castShadow={false} />
          <Part geo={SPH} m={FLOWERS[i % 3]} p={[0, 0.08, 0]} scale={0.055} castShadow={false} />
        </group>
      ))}
      {/* les notes qui montent de la fenêtre */}
      <group userData={LIVE}>
        {notes.map((m, i) => (
          <mesh key={i} ref={(o) => { if (o) noteRefs.current[i] = o }} geometry={NOTE_GEO} material={m} raycast={noRay} renderOrder={5} />
        ))}
      </group>
    </group>
  )
}
