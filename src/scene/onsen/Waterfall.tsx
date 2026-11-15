import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, RepeatWrapping, SRGBColorSpace, type Group, type Mesh } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { gummy } from '../materials'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { LIVE } from '../Static'
import { reduceMotion, useSquash } from '../anim'
import { Rock } from '../nature/Rock'
import { makeCanvas } from '../textures'
import { O } from './materials'

const FOAM = gummy(0xf8fdfc, { roughness: 0.5, clearcoat: 0, transparent: true, opacity: 0.85 })
const TOP = 1.9 // le haut de la falaise, d'où l'eau part
const SHELF = 0.95 // le dessus de la tablette où l'eau fait une halte
const BOTTOM = 0.2 // le bas de la chute, dans le bassin
const FOAMS = [-0.3, -0.15, 0, 0.15, 0.3]

/**
 * Les filets de l'eau qui tombe : un fond bleu-vert, des traits blancs verticaux de largeur et de clarté variées (périodes
 * entières en hauteur : pas de raccord), et des bords qui s'effacent (la nappe n'a pas de côtés coupés).
 */
const streaks = (() => {
  const [c, x] = makeCanvas(128, 256)
  x.fillStyle = 'rgba(120,200,224,0.78)'
  x.fillRect(0, 0, 128, 256)
  let seed = 11
  const r = () => ((seed = (seed * 16807) % 2147483647) / 2147483647)
  for (let i = 0; i < 40; i++) {
    const px = 6 + r() * 116, w = 1.5 + r() * 5, a = 0.3 + r() * 0.5, k = 1 + ((r() * 3) | 0), ph = r() * 6.28
    for (let y = 0; y < 256; y += 4) {
      x.fillStyle = `rgba(255,255,255,${a * (0.5 + 0.5 * Math.sin((y / 256) * 6.2832 * k + ph))})`
      x.fillRect(px, y, w, 4)
    }
  }
  x.globalCompositeOperation = 'destination-in'
  const g = x.createLinearGradient(0, 0, 128, 0)
  g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(0.12, 'rgba(0,0,0,1)'); g.addColorStop(0.88, 'rgba(0,0,0,1)'); g.addColorStop(1, 'rgba(0,0,0,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 128, 256)
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.colorSpace = SRGBColorSpace
  return t
})()
const SHEET = gummy(0xffffff, { map: streaks, roughness: 0.1, clearcoat: 1, transparent: true, opacity: 0.9, depthWrite: false })

/**
 * La cascade au fond à gauche, là où se tenait le shishi-odoshi : une falaise de pierre moussue en deux étages. L'eau de la
 * montagne tombe d'abord sur une tablette où elle fait une petite halte, puis se jette dans un bassin de pierre en soulevant de
 * l'écume. Quand le son joue, les filets défilent vite et la nappe s'épaissit, l'écume bat ; au repos tout coule à peine.
 * Phase cumulée image après image : rien ne saute quand on l'arrête.
 */
export function Waterfall({ position }: { position: [number, number, number] }) {
  const g = useRef<Group>(null!), foams = useRef<(Mesh | null)[]>([])
  const st = useRef({ flow: 0.25, phase: 0 })
  useSquash('waterfall', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current
    s.flow = approach(s.flow, isActive(useStore.getState(), 'waterfall') ? 1 : 0.25, dt * 1.5)
    if (!reduceMotion) s.phase += dt * (0.25 + 0.75 * s.flow)
    streaks.offset.y = s.phase * 0.9
    SHEET.opacity = 0.5 + 0.4 * s.flow
    foams.current.forEach((m, i) => {
      if (!m) return
      const k = 0.7 + 0.3 * Math.sin(s.phase * 7 + i * 1.9)
      m.scale.set(0.07 * k, (0.03 + 0.03 * s.flow) * k, 0.06 * k)
    })
  })
  return (
    <group ref={g} userData={{ id: 'waterfall' }} position={position}>
      {/* la falaise : le cœur de pierre où l'eau d'en haut glisse, sa lèvre, et deux rochers au sommet */}
      <Part geo={rbox(0.95, TOP, 0.3, 0.04)} m={O.stone[2]} p={[0, TOP / 2, -0.1]} />
      <Part geo={rbox(0.62, 0.08, 0.14, 0.03)} m={O.stone[1]} p={[0, TOP, 0.06]} castShadow={false} />
      <Rock v={1} p={[-0.28, TOP, -0.16]} s={[0.32, 0.32, 0.26]} ry={0.9} m={O.stone[1]} moss={O.moss} />
      <Rock v={3} p={[0.26, TOP, -0.2]} s={[0.28, 0.26, 0.25]} ry={-0.3} m={O.stone[0]} moss={O.moss} />
      {/* la tablette de la halte : son socle de pierre, son dessus, sa petite mare */}
      <Part geo={rbox(0.9, SHELF - 0.06, 0.4, 0.03)} m={O.stone[0]} p={[0, (SHELF - 0.06) / 2, 0.2]} />
      <Part geo={rbox(1.0, 0.12, 0.5, 0.04)} m={O.stone[3]} p={[0, SHELF - 0.06, 0.15]} />
      <Part geo={cyl(0.22, 0.22, 0.02, 24)} m={O.water} p={[0, SHELF + 0.01, 0.17]} castShadow={false} />
      {/* les rochers des deux côtés, plus hauts à droite */}
      <Rock v={0} p={[-0.52, 0, -0.02]} s={[0.3, 1.5, 0.3]} ry={0.4} m={O.stone[0]} moss={O.moss} />
      <Rock v={2} p={[0.52, 0, -0.06]} s={[0.3, 1.7, 0.3]} ry={-0.5} m={O.stone[2]} moss={O.moss} />
      <Rock v={4} p={[-0.5, 0, 0.42]} s={[0.26, 0.6, 0.24]} ry={0.2} m={O.stone[3]} moss={O.moss} />
      <Rock v={5} p={[0.5, 0, 0.42]} s={[0.24, 0.5, 0.22]} ry={1.1} m={O.stone[1]} moss={O.moss} />
      {/* le bassin du pied : une margelle de pierre et l'eau, un peu au-dessus de son bord intérieur */}
      <Part geo={cyl(0.5, 0.54, 0.16, 28)} m={O.stone[2]} p={[0, 0.08, 0.85]} />
      <Part geo={cyl(0.4, 0.4, 0.02, 28)} m={O.water} p={[0, 0.17, 0.85]} castShadow={false} />
      {/* les deux nappes : la chute d'en haut, étroite, puis celle d'en bas, plus large */}
      <mesh material={SHEET} position={[0, (TOP + SHELF) / 2, 0.08]} raycast={noRay} userData={LIVE}>
        <planeGeometry args={[0.56, TOP - SHELF]} />
      </mesh>
      <mesh material={SHEET} position={[0, (SHELF + BOTTOM) / 2, 0.43]} raycast={noRay} userData={LIVE}>
        <planeGeometry args={[0.78, SHELF - BOTTOM]} />
      </mesh>
      {/* l'écume : au bord de la mare d'en haut, et au pied de la grande chute dans le bassin */}
      {FOAMS.map((x, i) => (
        <mesh key={x} ref={(m) => { foams.current[i] = m }} userData={LIVE} geometry={SPH} material={FOAM} position={[x * 1.2, BOTTOM + 0.05, 0.5]} raycast={noRay} />
      ))}
    </group>
  )
}
