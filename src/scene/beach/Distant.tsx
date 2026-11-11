import { CanvasTexture, MeshBasicMaterial, MeshStandardMaterial, RepeatWrapping } from 'three'
import { skyFade } from '../outdoor'
import { SPH, noRay } from '../parts'
import { canvasTex, seeded } from '../paint'
import { farFoliage, farStone } from '../nature/materials'
import { C, WATER } from './isle'

// Le large de la plage : au-delà de l'île, la mer continue (elle prend le rose du ciel) et quelques îlots bas, sable et verdure, se
// voilent dans la brume. Ça remplit les coins du haut des grands écrans, où le fondu de l'île a tout effacé. Fondu large (r0 9,5, r1 17,5).

const F = { c: [C.x, C.z] as [number, number], r0: 9.5, r1: 17.5 }

/** Des traînées de houle douces, claires sur transparent : tuile 1 × 1, répétée. */
const swellTex: CanvasTexture = canvasTex(512, 512, (x) => {
  const r = seeded(404)
  x.lineCap = 'round'
  for (let i = 0; i < 46; i++) {
    const X = r() * 512, Y = r() * 512, w = 30 + r() * 70
    x.strokeStyle = `rgba(255,244,236,${0.1 + r() * 0.16})`; x.lineWidth = 2 + r() * 2.4
    x.beginPath(); x.moveTo(X - w / 2, Y); x.quadraticCurveTo(X, Y - 4 - r() * 4, X + w / 2, Y); x.stroke()
  }
})
swellTex.wrapS = swellTex.wrapT = RepeatWrapping
swellTex.repeat.set(5, 5)

const D = {
  sea: skyFade(new MeshStandardMaterial({ color: 0x58a2b6, roughness: 0.5, metalness: 0 }), F),
  swell: skyFade(new MeshBasicMaterial({ map: swellTex, transparent: true, opacity: 0.8, depthWrite: false }), F),
  sand: skyFade(farStone(0xe3cdae, { roughness: 0.9 }), F),
  green: [0x6fa886, 0x82b690].map((c) => skyFade(farFoliage(c, { roughness: 0.9 }), F)),
}

/** Les îlots : [x, z, demi-largeur, hauteur]. À gauche (-x) et au fond droit (-z), à 11 à 15 du centre. */
const ISLETS: [number, number, number, number][] = [[-14.6, -2.5, 1.7, 0.55], [-13.6, 4.2, 1.2, 0.4], [-12.6, -8.2, 1.4, 0.45], [-4.4, -14.8, 1.8, 0.6], [4.6, -14.2, 1.2, 0.4], [12.4, -10.6, 1.5, 0.5]]

/** Un îlot : une dune de sable, une calotte de verdure, et une seconde touffe plus petite. */
function Islet({ x, z, w, h, i }: { x: number; z: number; w: number; h: number; i: number }) {
  const y = WATER - 0.15
  return (
    <group position={[x, y, z]} rotation-y={i * 1.3}>
      <mesh geometry={SPH} material={D.sand} scale={[w, h, w * 0.7]} raycast={noRay} />
      <mesh geometry={SPH} material={D.green[i % 2]} position={[-w * 0.1, h * 0.55, 0]} scale={[w * 0.62, h * 0.7, w * 0.45]} raycast={noRay} />
      <mesh geometry={SPH} material={D.green[(i + 1) % 2]} position={[w * 0.4, h * 0.45, w * 0.1]} scale={[w * 0.32, h * 0.5, w * 0.28]} raycast={noRay} />
    </group>
  )
}

/** La mer du large et ses îlots (à poser dans le `<Static>` de la pièce). */
export function Distant() {
  return (
    <>
      <mesh material={D.sea} position={[C.x, WATER - 0.03, C.z]} rotation-x={-Math.PI / 2} raycast={noRay}>
        <planeGeometry args={[60, 60]} />
      </mesh>
      <mesh material={D.swell} position={[C.x, WATER - 0.02, C.z]} rotation-x={-Math.PI / 2} renderOrder={1} raycast={noRay}>
        <planeGeometry args={[60, 60]} />
      </mesh>
      {ISLETS.map(([x, z, w, h], i) => <Islet key={i} x={x} z={z} w={w} h={h} i={i} />)}
    </>
  )
}
