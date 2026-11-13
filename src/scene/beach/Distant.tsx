import { useEffect, useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { mood } from '../anim'
import { smooth } from '../../math'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { BufferGeometry, CanvasTexture, Float32BufferAttribute, DoubleSide, MeshBasicMaterial, MeshStandardMaterial, RepeatWrapping } from 'three'
import { skyFade } from '../outdoor'
import { Part, SPH, cyl, noRay } from '../parts'
import { Rock } from '../nature/Rock'
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

/** L'écume : plein dedans, effiloché dehors (u le long de l'anneau, v vers le large). */
const foamTex: CanvasTexture = canvasTex(256, 64, (x) => {
  const r = seeded(77), g = x.createLinearGradient(0, 0, 0, 64)
  g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(0.45, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 256, 64)
  x.globalCompositeOperation = 'destination-out'
  for (let i = 0; i < 150; i++) { x.beginPath(); x.arc(r() * 256, 8 + r() * 56, 2 + r() * 7, 0, 6.3); x.fill() }
})
foamTex.wrapS = RepeatWrapping

const D = {
  sea: skyFade(new MeshStandardMaterial({ color: 0x58a2b6, roughness: 0.5, metalness: 0 }), F),
  swell: skyFade(new MeshBasicMaterial({ map: swellTex, transparent: true, opacity: 0.8, depthWrite: false }), F),
  sand: skyFade(farStone(0xe3cdae, { roughness: 0.9 }), F),
  wet: skyFade(farStone(0xb3a590, { roughness: 0.8 }), F),
  trunk: skyFade(farStone(0x8a6a4c, { roughness: 0.9 }), F),
  frond: skyFade(farFoliage(0x62b080, { roughness: 0.8 }), F),
  foam: skyFade(new MeshBasicMaterial({ map: foamTex, transparent: true, opacity: 0.8, depthWrite: false, side: DoubleSide }), F),
  green: [0x72b584, 0x86c48f].map((c) => skyFade(farFoliage(c, { roughness: 0.9 }), F)),
}

/** Les îlots : [x, z, demi-largeur, hauteur]. À gauche (-x) et au fond droit (-z), à 11 à 15 du centre. */
const ISLETS: [number, number, number, number][] = [[-14.6, -2.5, 1.7, 0.55], [-13.6, 4.2, 1.2, 0.4], [-12.6, -8.2, 1.4, 0.45], [-4.4, -14.8, 1.8, 0.6], [4.6, -14.2, 1.2, 0.4], [12.4, -10.6, 1.5, 0.5], [-10.8, -10.4, 1.6, 0.5], [-8.2, -16.2, 1.6, 0.5]]

/** Un îlot : un socle de roche mouillée qui plonge dans l'eau, une dune de sable qui s'y appuie, une butte de verdure au bord
 *  irrégulier, une touffe voisine et, sur les plus grands, un palmier minuscule qui casse la silhouette. */
function Islet({ x, z, w, h, i }: { x: number; z: number; w: number; h: number; i: number }) {
  const y = WATER - 0.3
  const palm = w > 1.45
  return (
    <group position={[x, y, z]} rotation-y={i * 1.3}>
      <Rock v={i} p={[0, 0, 0]} s={[w * 1.04, 0.42 + h * 0.2, w * 0.78]} m={D.wet} shadow={false} />
      <Rock v={i + 3} p={[w * 0.04, 0.05, 0]} s={[w * 0.9, 0.12 + h * 1.0, w * 0.66]} ry={0.5} m={D.sand} moss={D.green[i % 2]} shadow={false} />
      <Rock v={i + 5} p={[w * 0.62, 0.02, w * 0.18]} s={[w * 0.34, 0.1 + h * 0.6, w * 0.3]} ry={1.7} m={D.sand} moss={D.green[(i + 1) % 2]} shadow={false} />
      {palm && (
        <group position={[-w * 0.25, 0.1 + h * 0.85, 0]} rotation-z={0.18}>
          <Part geo={cyl(0.03, 0.045, 0.62, 6)} m={D.trunk} p={[0, 0.3, 0]} castShadow={false} />
          {[0, 1, 2, 3, 4].map((k) => (
            <Part key={k} geo={SPH} m={D.frond} p={[Math.cos(k * 1.26) * 0.17, 0.62, Math.sin(k * 1.26) * 0.17]} scale={[0.26, 0.04, 0.09]} rotation={[0, -k * 1.26, Math.sin(k) * 0.15 - 0.2]} castShadow={false} />
          ))}
        </group>
      )}
    </group>
  )
}

/** Un anneau irrégulier autour d'un îlot (u le long de l'anneau, v vers le large), à la ligne d'eau. */
function ringGeo(r: number, w: number, seed: number) {
  const M = 40, pos: number[] = [], uv: number[] = [], idx: number[] = []
  for (let m = 0; m <= M; m++) {
    const a = (m / M) * Math.PI * 2, k = 1 + 0.08 * Math.sin(a * 3 + seed) + 0.05 * Math.sin(a * 5 + seed * 2)
    for (const [d, v] of [[r * k - 0.08, 0], [r * k + w, 1]] as const) { pos.push(Math.cos(a) * d, 0, Math.sin(a) * d); uv.push((m / M) * Math.round(r * 3), v) }
  }
  for (let m = 0; m < M; m++) { const a = m * 2; idx.push(a, a + 2, a + 1, a + 1, a + 2, a + 3) }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  return g
}

/** L'écume des îlots : un seul maillage (un tracé), un anneau effiloché à la ligne d'eau de chacun. */
function IsletFoam() {
  const g = useMemo(() => {
    const parts = ISLETS.map(([x, z, w], i) => {
      const geo = ringGeo(w * 0.95, 0.22 + w * 0.1, i * 1.9 + 2)
      geo.scale(1, 1, 0.72)
      geo.rotateY(i * 1.3)
      geo.translate(x, 0, z)
      return geo
    })
    const m = mergeGeometries(parts)
    parts.forEach((q) => q.dispose())
    return m
  }, [])
  useEffect(() => () => g.dispose(), [g])
  useFrame(() => { D.foam.opacity = 0.8 * (1 - smooth(mood.night) * 0.6) })
  return <mesh geometry={g} material={D.foam} position={[0, WATER + 0.005, 0]} renderOrder={3} raycast={noRay} />
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
      <IsletFoam />
    </>
  )
}
