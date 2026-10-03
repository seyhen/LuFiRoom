import { canvasTex } from '../paint'
import { Part, SPH, cyl, rbox } from '../parts'
import { T } from './materials'

/** Une affiche de voyage à l'ancienne : un col de montagne, un train, « Les Alpes ». */
const posterTex = canvasTex(256, 360, (x) => {
  const g = x.createLinearGradient(0, 0, 0, 360)
  g.addColorStop(0, '#f6c89a'); g.addColorStop(1, '#f3e6cf')
  x.fillStyle = g; x.fillRect(0, 0, 256, 360)
  x.fillStyle = '#6a8ab8'; x.beginPath(); x.moveTo(0, 230); x.lineTo(70, 120); x.lineTo(120, 180); x.lineTo(180, 90); x.lineTo(256, 210); x.lineTo(256, 260); x.lineTo(0, 260); x.fill()
  x.fillStyle = '#fff'; x.beginPath(); x.moveTo(70, 120); x.lineTo(56, 142); x.lineTo(84, 142); x.fill(); x.beginPath(); x.moveTo(180, 90); x.lineTo(162, 116); x.lineTo(198, 116); x.fill()
  x.fillStyle = '#4f8a5a'; x.fillRect(0, 250, 256, 40)
  x.fillStyle = '#1f2f5a'; x.fillRect(30, 262, 150, 14); x.fillStyle = '#e2b25a'; x.fillRect(30, 268, 150, 2)
  x.fillStyle = '#1f2f5a'; x.font = 'bold 40px Georgia, serif'; x.textAlign = 'center'; x.fillText('LES ALPES', 128, 330)
  x.font = 'italic 16px Georgia, serif'; x.fillText('en voiture-lits', 128, 352)
})

/** La commode d'acajou contre la paroi (la radio dessus), l'affiche, le manteau et le chapeau au crochet. */
export function Sideboard() {
  return (
    <>
      <group position={[-2.58, 0, 1.6]}>
        <Part geo={rbox(0.8, 0.72, 1.3, 0.04)} m={T.mahogany} p={[0, 0.36, 0]} />
        <Part geo={rbox(0.84, 0.04, 1.34, 0.015)} m={T.mahoganyDark} p={[0, 0.74, 0]} />
        {[-0.3, 0.3].map((z) => (
          <group key={z}>
            <Part geo={rbox(0.02, 0.5, 0.52, 0.02)} m={T.mahoganyDark} p={[0.41, 0.36, z]} castShadow={false} />
            <Part geo={SPH} m={T.brass} scale={0.022} p={[0.43, 0.42, z - Math.sign(z) * 0.18]} castShadow={false} />
          </group>
        ))}
      </group>
      <group position={[-2.95, 2.25, 1.55]} rotation-y={Math.PI / 2}>
        <Part geo={rbox(0.78, 1.06, 0.04, 0.015)} m={T.gold} />
        <mesh position={[0, 0, 0.022]} receiveShadow>
          <planeGeometry args={[0.7, 0.98]} />
          <meshStandardMaterial map={posterTex} roughness={0.7} />
        </mesh>
      </group>
      {/* le crochet, le manteau camel, l'écharpe, le chapeau */}
      <group position={[-2.9, 2.0, 2.75]}>
        <Part geo={cyl(0.02, 0.02, 0.12, 6)} m={T.brass} p={[0.06, 0.32, 0]} rotation-z={Math.PI / 2 - 0.3} castShadow={false} />
        <Part geo={cyl(0.1, 0.17, 0.95, 14)} m={T.canvas} scale={[0.6, 1, 1]} p={[0.1, -0.15, 0]} />
        <Part geo={SPH} m={T.canvas} scale={[0.09, 0.07, 0.16]} p={[0.1, 0.32, 0]} />
        <Part geo={rbox(0.04, 0.7, 0.1, 0.02)} m={T.velvet} p={[0.2, 0.0, 0.05]} rotation-z={0.05} castShadow={false} />
        <group position={[0.14, 0.48, 0]} rotation-z={-0.3}>
          <Part geo={cyl(0.17, 0.17, 0.015, 22)} m={T.iron} />
          <Part geo={cyl(0.1, 0.11, 0.1, 18)} m={T.iron} p={[0, 0.05, 0]} />
          <Part geo={cyl(0.112, 0.112, 0.025, 18)} m={T.velvet} p={[0, 0.02, 0]} castShadow={false} />
        </group>
      </group>
    </>
  )
}

/** La plaque de laiton du compartiment, avec son numéro, et le petit lavabo d'angle sous un miroir. */
export function Washstand() {
  return (
    <>
      <group position={[-1.6, 3.55, -2.97]}>
        <Part geo={rbox(0.36, 0.2, 0.02, 0.01)} m={T.brass} />
        <mesh position={[0, 0, 0.012]}>
          <planeGeometry args={[0.32, 0.16]} />
          <meshStandardMaterial map={plateTex} roughness={0.4} />
        </mesh>
      </group>
      <group position={[-1.6, 0, -2.85]}>
        <Part geo={rbox(0.6, 0.7, 0.32, 0.03)} m={T.mahogany} p={[0, 0.65, 0]} />
        <Part geo={cyl(0.18, 0.12, 0.08, 20)} m={T.sheet} p={[0, 1.02, 0.02]} />
        <Part geo={cyl(0.012, 0.012, 0.16, 6)} m={T.brass} p={[0, 1.12, -0.1]} rotation-x={0.6} castShadow={false} />
        <Part geo={rbox(0.5, 0.62, 0.03, 0.03)} m={T.brass} p={[0, 1.6, -0.14]} />
        <Part geo={rbox(0.44, 0.56, 0.01, 0.02)} m={T.mirror} p={[0, 1.6, -0.12]} castShadow={false} />
        <Part geo={rbox(0.12, 0.03, 0.1, 0.01)} m={T.sheet} p={[0.2, 1.04, 0.06]} castShadow={false} />
      </group>
    </>
  )
}
const plateTex = canvasTex(128, 64, (x) => {
  x.fillStyle = '#1f2f5a'; x.fillRect(0, 0, 128, 64)
  x.fillStyle = '#e2b25a'; x.font = 'bold 34px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('N° 7', 64, 34)
})
