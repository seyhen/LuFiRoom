import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { SphereGeometry } from 'three'
import { TAU, smooth } from '../../math'
import { canvasTex } from '../paint'
import { M, gummy } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { mood } from '../anim'
import { Steam } from '../objects/Steam'

// La chambre, en plus du prototype : un coin pour se poser par terre, de quoi lire, de quoi boire un thé.

/** Tapis tissé à larges rayures pastel, lavande, rose, menthe et beurre, bordé de crème. */
const rugTex = canvasTex(256, 192, (x) => {
  const cols = ['#c7c6f2', '#f6d6e0', '#c7c6f2', '#cfeee4', '#c7c6f2', '#fbe7b0', '#c7c6f2']
  cols.forEach((c, i) => { x.fillStyle = c; x.fillRect(0, (i * 192) / cols.length, 256, 192 / cols.length + 1) })
  x.fillStyle = 'rgba(255,255,255,.18)'; for (let i = 0; i < 256; i += 4) x.fillRect(i, 0, 1.5, 192)
  x.strokeStyle = '#fffaf2'; x.lineWidth = 8; x.strokeRect(6, 6, 244, 180)
})
const B = {
  rug: gummy(0xffffff, { map: rugTex, roughness: 0.92, clearcoat: 0 }),
  mint: gummy(0xa8e0cf, { roughness: 0.8, clearcoat: 0.1 }),
  lilac: gummy(0xcbb8ef, { roughness: 0.8, clearcoat: 0.1 }),
  knit: gummy(0xf6d6e0, { roughness: 0.92, clearcoat: 0 }),
  shade: gummy(0xffe6c4, { roughness: 0.7, emissive: 0xffb36a, emissiveIntensity: 0.05 }),
}
const dome = new SphereGeometry(0.24, 24, 12, 0, TAU, 0, Math.PI / 2)

/** Le tapis à rayures pastel, sous le tapis uni du prototype : ses franges dépassent devant et derrière. */
export function StripedRug() {
  return (
    <>
      <mesh material={B.rug} position={[0.35, 0.065, 1.3]} rotation-x={-Math.PI / 2} receiveShadow>
        <planeGeometry args={[2.8, 1.9]} />
      </mesh>
      {[-1, 1].map((s) =>
        Array.from({ length: 13 }, (_, i) => (
          <mesh key={`${s}${i}`} geometry={cyl(0.012, 0.012, 0.1, 4)} material={M.cream} position={[-1.0 + i * 0.225, 0.02, 1.3 + s * 1.04]} rotation-x={Math.PI / 2} />
        )),
      )}
    </>
  )
}

/** Le coin lecture, devant à droite : un gros pouf poire menthe, un plaid tricoté, un lampadaire champignon, une pile de livres. */
export function ReadingNook() {
  const shade = useRef(B.shade)
  useFrame(() => void (shade.current.emissiveIntensity = 0.05 + smooth(mood.night) * 0.9))
  return (
    <>
      <group position={[2.15, 0, 1.6]} rotation-y={0.75}>
        <Part geo={SPH} m={B.mint} scale={[0.52, 0.46, 0.5]} p={[0, 0.4, -0.05]} rotation-x={-0.25} />
        <Part geo={SPH} m={B.mint} scale={[0.4, 0.14, 0.36]} p={[0, 0.66, 0.12]} rotation-x={-0.2} castShadow={false} />
        <Part geo={rbox(0.5, 0.05, 0.42, 0.025)} m={B.knit} p={[0.1, 0.58, 0.05]} rotation={[0.2, 0.4, -0.15]} />
        <Part geo={rbox(0.05, 0.3, 0.4, 0.02)} m={B.knit} p={[0.42, 0.38, 0.1]} rotation-z={0.25} castShadow={false} />
      </group>
      {/* le lampadaire champignon, son chapeau qui s'allume le soir */}
      <group position={[2.85, 0, 0.55]}>
        <Part geo={cyl(0.18, 0.2, 0.05, 22)} m={M.cream} p={[0, 0.025, 0]} />
        <Part geo={cyl(0.025, 0.03, 1.5, 10)} m={M.cream} p={[0, 0.78, 0]} />
        <Part geo={dome} m={shade.current} p={[0, 1.52, 0]} scale-y={0.7} />
        <Part geo={cyl(0.24, 0.24, 0.02, 24)} m={shade.current} p={[0, 1.52, 0]} castShadow={false} />
      </group>
      {[[0.3, 0.05, M.teal], [0.26, 0.04, M.pink], [0.24, 0.05, M.butter], [0.2, 0.04, M.cream]].map(([w, h, m], i) => (
        <Part key={i} geo={rbox(w as number, h as number, 0.2, 0.012)} m={m as typeof M.teal} p={[2.95, 0.025 + i * 0.046, 1.15]} rotation-y={i * 0.4} />
      ))}
    </>
  )
}

/** Sur le tapis : deux coussins de sol, un plateau avec un thé qui fume, un livre ouvert, des pantoufles au pied du lit. */
export function FloorCushions() {
  return (
    <>
      <Part geo={rbox(0.62, 0.16, 0.62, 0.08)} m={B.lilac} p={[-0.25, 0.14, 1.65]} rotation-y={0.3} />
      <Part geo={rbox(0.55, 0.14, 0.55, 0.07)} m={M.pink} p={[0.45, 0.13, 2.05]} rotation-y={-0.2} />
      <group position={[0.75, 0.08, 1.15]} rotation-y={0.4}>
        <Part geo={rbox(0.5, 0.03, 0.34, 0.015)} m={M.woodLight} />
        <Part geo={cyl(0.05, 0.042, 0.09, 16)} m={M.mug} p={[-0.12, 0.06, 0.02]} />
        <Part geo={cyl(0.045, 0.045, 0.006, 14)} m={M.toffee} p={[-0.12, 0.103, 0.02]} castShadow={false} />
        <Steam at={[-0.12, 0.14, 0.02]} every={1.2} />
        {[-1, 1].map((s) => (
          <Part key={s} geo={rbox(0.12, 0.018, 0.17, 0.008)} m={s > 0 ? M.cream : M.pillow} p={[0.1 + s * 0.06, 0.03, 0]} rotation-z={-s * 0.12} castShadow={false} />
        ))}
        <Part geo={rbox(0.25, 0.012, 0.18, 0.005)} m={M.teal} p={[0.1, 0.02, 0]} castShadow={false} />
      </group>
      {[[-0.05, 0.85, 0.2], [0.12, 0.95, -0.15]].map(([x, z, a], i) => (
        <group key={i} position={[x, 0.07, z]} rotation-y={a}>
          <Part geo={SPH} m={M.pink} scale={[0.07, 0.035, 0.14]} />
          <Part geo={SPH} m={M.pillow} scale={[0.065, 0.04, 0.07]} p={[0, 0.02, 0.06]} castShadow={false} />
        </group>
      ))}
    </>
  )
}

/** Un pothos suspendu dans un pot rose, dans le coin de la fenêtre. */
export function HangingPlant() {
  return (
    <group position={[2.9, 3.95, -2.7]}>
      {[0, 1, 2].map((k) => {
        const a = (k / 3) * TAU
        return <Part key={k} geo={cyl(0.004, 0.004, 0.6, 4)} m={M.plum} p={[Math.cos(a) * 0.06, -0.3, Math.sin(a) * 0.06]} castShadow={false} />
      })}
      <Part geo={SPH} m={M.pink} scale={[0.15, 0.12, 0.15]} p={[0, -0.66, 0]} />
      {Array.from({ length: 18 }, (_, k) => (
        <Part key={k} geo={SPH} m={k % 3 ? M.leaf : M.leaf2} scale={[0.05, 0.014, 0.04]} p={[Math.cos(k * 2.3) * 0.14, -0.6 - (k % 6) * 0.1, Math.sin(k * 2.3) * 0.14]} rotation={[0.5, k, 0.2]} castShadow={false} />
      ))}
    </group>
  )
}
