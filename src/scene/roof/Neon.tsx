import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, MeshBasicMaterial, type Sprite } from 'three'
import { smooth } from '../../math'
import { canvasTex } from '../paint'
import { Part, SPH, cyl, noRay, rbox } from '../parts'
import { mood, reduceMotion, useParticles } from '../anim'
import { glowTex, puffTex } from '../textures'
import { LIVE } from '../Static'
import { R } from './materials'

/** L'enseigne de néon d'un diner, sur le toit d'en face : « DINER » en rose, une tasse qui fume en bleu. */
const neonTex = canvasTex(512, 160, (x) => {
  x.clearRect(0, 0, 512, 160)
  x.lineCap = 'round'; x.lineJoin = 'round'
  const tube = (draw: () => void, col: string) => {
    x.shadowColor = col; x.shadowBlur = 18; x.strokeStyle = col; x.lineWidth = 9; draw(); x.stroke()
    x.shadowBlur = 0; x.strokeStyle = '#fff'; x.lineWidth = 3; draw(); x.stroke()
  }
  x.font = 'italic bold 92px Georgia, serif'
  tube(() => { x.beginPath(); x.strokeText('Diner', 150, 110); x.beginPath() }, '#ff6fae')
  x.shadowColor = '#ff6fae'; x.shadowBlur = 20; x.strokeStyle = '#ff6fae'; x.lineWidth = 6; x.strokeText('Diner', 150, 110)
  x.shadowBlur = 0; x.strokeStyle = '#ffe6f2'; x.lineWidth = 2; x.strokeText('Diner', 150, 110)
  tube(() => { x.beginPath(); x.moveTo(40, 70); x.lineTo(48, 130); x.lineTo(100, 130); x.lineTo(108, 70); x.closePath() }, '#6fd8ff')
  tube(() => { x.beginPath(); x.arc(112, 95, 16, -1.2, 1.2) }, '#6fd8ff')
  tube(() => { x.beginPath(); x.moveTo(62, 58); x.bezierCurveTo(54, 44, 70, 36, 62, 20); x.moveTo(84, 58); x.bezierCurveTo(76, 44, 92, 36, 84, 20) }, '#6fd8ff')
})
const neonMat = new MeshBasicMaterial({ map: neonTex, transparent: true, depthWrite: false, blending: AdditiveBlending, opacity: 0.2 })

/** L'enseigne et son cadre d'acier, posée sur la tour de droite de la rangée proche. Elle s'allume le soir et grésille. */
export function NeonSign() {
  const glow = useRef<Sprite>(null!)
  useFrame(({ clock }) => {
    const n = smooth(mood.night), t = clock.elapsedTime
    const buzz = reduceMotion ? 1 : (Math.sin(t * 0.9) > 0.985 ? 0.3 : 1) * (0.94 + Math.sin(t * 60) * 0.06)
    neonMat.opacity = (0.25 + n * 0.75) * buzz
    glow.current.material.opacity = n * 0.45 * buzz
  })
  return (
    <group position={[2.6, 3.55, -3.45]} scale={1.5}>
      {[-0.55, 0.55].map((x) => (
        <Part key={x} geo={cyl(0.015, 0.015, 0.75, 6)} m={R.steel} p={[x, 0.32, -0.05]} castShadow={false} />
      ))}
      <Part geo={rbox(1.3, 0.03, 0.03, 0.01)} m={R.steel} p={[0, 0.1, -0.05]} castShadow={false} />
      <mesh material={neonMat} position={[0, 0.48, 0]} userData={LIVE} raycast={noRay}>
        <planeGeometry args={[1.4, 0.44]} />
      </mesh>
      <sprite ref={glow} scale={[2.4, 1.2, 1]} position={[0, 0.48, 0.05]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0xff7ab8} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}

/** L'escalier de secours de fer noir, accroché à l'immeuble de gauche : paliers, rambardes, échelles. */
export function FireEscape() {
  return (
    <group position={[-3.5, 0, 0.95]}>
      {[0.6, 1.35].map((y) => (
        <group key={y} position={[0, y, 0]}>
          <Part geo={rbox(0.36, 0.03, 0.95, 0.01)} m={R.steel} castShadow={false} />
          <Part geo={cyl(0.008, 0.008, 0.95, 4)} m={R.steel} p={[0.17, 0.3, 0]} rotation-x={Math.PI / 2} castShadow={false} />
          {[-0.45, -0.15, 0.15, 0.45].map((z) => (
            <Part key={z} geo={cyl(0.007, 0.007, 0.3, 4)} m={R.steel} p={[0.17, 0.15, z]} castShadow={false} />
          ))}
        </group>
      ))}
      <group position={[0.06, 0.98, -0.1]} rotation-x={0.75}>
        {[-0.08, 0.08].map((x) => (
          <Part key={x} geo={cyl(0.007, 0.007, 1.0, 4)} m={R.steel} p={[x, 0, 0]} castShadow={false} />
        ))}
        {[-0.35, -0.12, 0.12, 0.35].map((y) => (
          <Part key={y} geo={rbox(0.16, 0.012, 0.05, 0.004)} m={R.steel} p={[0, y, 0]} castShadow={false} />
        ))}
      </group>
      <Part geo={cyl(0.08, 0.06, 0.12, 12)} m={R.terracotta} p={[0.05, 1.42, 0.3]} castShadow={false} />
      <Part geo={SPH} m={R.leaf} scale={[0.1, 0.08, 0.1]} p={[0.05, 1.52, 0.3]} castShadow={false} />
    </group>
  )
}

/** Une bouche d'aération sur le toit, qui crache un peu de vapeur dans le soir. */
export function Vent() {
  const puffs = useParticles(), since = useRef(0)
  useFrame((_, delta) => {
    if (reduceMotion) return
    since.current += Math.min(delta, 0.05)
    if (since.current > 0.6) {
      since.current = 0
      puffs.emit(puffTex, -0.68 + Math.random() * 0.05, 2.88, -3.75, { size: 0.35, life: 3.5, vy: 0.25, sway: 0.12, grow: 1.6, peak: 0.35 })
    }
  })
  return (
    <>
      <Part geo={cyl(0.08, 0.08, 0.35, 12)} m={R.steel} p={[-0.68, 2.67, -3.75]} castShadow={false} />
      <Part geo={cyl(0.13, 0.1, 0.06, 12)} m={R.steel} p={[-0.68, 2.86, -3.75]} castShadow={false} />
      <group ref={puffs.group} />
    </>
  )
}
