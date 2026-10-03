import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import { canvasTex } from '../paint'
import { Part, SPH, noRay, rbox } from '../parts'
import { A } from './materials'

/** Les poutres de chêne d'un vieil atelier sous les combles : une sablière sur chaque mur, des entraits qui traversent. */
export function Rafters() {
  return (
    <>
      <Part geo={rbox(0.22, 0.22, 6.5, 0.04)} m={A.oakDark} p={[-2.89, 4.2, -0.07]} />
      <Part geo={rbox(6.5, 0.22, 0.22, 0.04)} m={A.oakDark} p={[-0.07, 4.2, -2.89]} />
      {[-1.6, 0.4, 2.4].map((z) => (
        <group key={z}>
          <Part geo={rbox(0.62, 0.18, 0.16, 0.03)} m={A.oakDark} p={[-2.7, 4.06, z]} />
          <Part geo={rbox(0.14, 0.5, 0.14, 0.03)} m={A.oakDark} p={[-2.86, 3.8, z]} rotation-z={-0.6} />
        </group>
      ))}
    </>
  )
}

// Petits cadres au mur de gauche : [z, y, largeur, hauteur, motif].
const FRAMES: [number, number, number, number, number][] = [[0.3, 2.95, 0.42, 0.52, 0], [0.82, 3.05, 0.34, 0.34, 1], [0.78, 2.6, 0.34, 0.26, 2], [1.25, 2.85, 0.42, 0.62, 3], [1.68, 3.1, 0.28, 0.36, 4], [1.7, 2.65, 0.28, 0.28, 0]]
const COLORS = ['#f0c4bc', '#9db59a', '#2c4a6e', '#d9a441', '#c7703e']
const prints = COLORS.map((c, i) => canvasTex(96, 128, (x) => {
  x.fillStyle = '#fbf8f0'; x.fillRect(0, 0, 96, 128)
  x.fillStyle = c
  if (i % 3 === 0) { x.beginPath(); x.arc(48, 56, 26, 0, Math.PI * 2); x.fill(); x.fillStyle = COLORS[(i + 2) % 5]; x.fillRect(14, 86, 68, 20) }
  else if (i % 3 === 1) { x.beginPath(); x.moveTo(10, 110); x.lineTo(40, 40); x.lineTo(62, 80); x.lineTo(86, 30); x.lineTo(86, 110); x.fill() }
  else { for (let k = 0; k < 4; k++) { x.fillRect(16 + k * 18, 30 + (k % 2) * 14, 12, 70 - (k % 2) * 14) } }
}))

/** Un mur de cadres d'illustrations au-dessus du fauteuil, et une guirlande d'ampoules qui court le long de la sablière. */
export function Gallery() {
  return (
    <>
      {FRAMES.map(([z, y, w, h, k], i) => (
        <group key={i} position={[-2.97, y, z]} rotation-y={Math.PI / 2}>
          <Part geo={rbox(w, h, 0.03, 0.01)} m={i % 2 ? A.oak : A.ink} castShadow={false} />
          <mesh position={[0, 0, 0.017]}>
            <planeGeometry args={[w - 0.06, h - 0.06]} />
            <meshStandardMaterial map={prints[k]} roughness={0.8} />
          </mesh>
        </group>
      ))}
      <mesh geometry={wire} material={A.ink} raycast={noRay} />
      {BULBS.map((p, i) => (
        <mesh key={i} geometry={SPH} material={A.bulb} scale={[0.035, 0.045, 0.035]} position={[p.x, p.y - 0.05, p.z]} />
      ))}
    </>
  )
}
const pts = Array.from({ length: 31 }, (_, i) => { const k = i / 30, z = -2.8 + k * 5.8; return new Vector3(-2.75, 3.95 - 0.16 * Math.abs(Math.sin(k * Math.PI * 4)), z) })
const wire = new TubeGeometry(new CatmullRomCurve3(pts), 90, 0.007, 4, false)
const BULBS = Array.from({ length: 16 }, (_, i) => pts[Math.round(((i + 0.5) / 16) * 30)])
