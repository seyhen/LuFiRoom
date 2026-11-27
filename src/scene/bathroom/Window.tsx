import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, ExtrudeGeometry, Path, Shape, ShapeGeometry, type Group, type PointLight, type Sprite } from 'three'
import { approach, smooth } from '../../math'
import { isActive, useStore } from '../../state/store'
import { mood, useSquash } from '../anim'
import { Candle } from '../objects/Candle'
import { Part, SPH, cyl, rbox } from '../parts'
import { Static } from '../Static'
import { glowTex } from '../textures'
import { B } from './materials'
import { WIN, archPath } from './Shell'

const CX = (WIN.x0 + WIN.x1) / 2, R = (WIN.x1 - WIN.x0) / 2, SPRING = WIN.y1 - R

/** Le cadre : un anneau de bois peint en arche, de 10 cm de large, qui avance de 7 cm dans la pièce. */
const FRAME = (() => {
  const s = archPath(new Shape(), 0.1)
  s.holes.push(archPath(new Path(), 0))
  return new ExtrudeGeometry(s, { depth: 0.06, bevelEnabled: true, bevelThickness: 0.012, bevelSize: 0.012, bevelSegments: 2, curveSegments: 16 })
})()

/** La vitre : une arche pleine, avec des UV qui couvrent l'ouverture (la buée y est dessinée une seule fois). */
const GLASS = (() => {
  const g = new ShapeGeometry(archPath(new Shape(), 0), 20), uv = g.attributes.uv, p = g.attributes.position
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (p.getX(i) - WIN.x0) / (WIN.x1 - WIN.x0), (p.getY(i) - WIN.y0) / (WIN.y1 - WIN.y0))
  return g
})()

const WHITE = new Color(0xffffff), NIGHT = new Color(0xa89ccc), tmp = new Color()

/**
 * La fenêtre en arche au-dessus de la baignoire : cadre blanc, croisillons, tablette de bois, et une vitre embuée (un cœur dessiné
 * au doigt, des coulures). Quand l'eau chaude coule (robinet ou douche), la buée s'épaissit et le monde de bulles derrière s'efface un peu ;
 * la nuit elle prend la teinte violette du ciel. Sur la tablette, un petit vase et un brin d'eucalyptus.
 */
export function ArchWindow() {
  useFrame((_, delta) => {
    const s = useStore.getState(), hot = s.on.faucet || s.on.shower
    B.fog.opacity = approach(B.fog.opacity, hot ? 0.96 : 0.74, Math.min(delta, 0.05) * 0.35)
    B.fog.color.copy(tmp.copy(WHITE).lerp(NIGHT, smooth(mood.night) * 0.75))
  })
  return (
    <>
      <Static>
        <Part geo={FRAME} m={B.trim} p={[0, 0, -3.0]} castShadow={false} />
        {/* la meneau du milieu, les traverses, l'arc : des croisillons de bois blanc dans l'ouverture */}
        <Part geo={rbox(0.045, SPRING - WIN.y0, 0.05, 0.015)} m={B.trim} p={[CX, (WIN.y0 + SPRING) / 2, -2.975]} castShadow={false} />
        {[WIN.y0 + 0.56, SPRING].map((y) => <Part key={y} geo={rbox(WIN.x1 - WIN.x0, 0.045, 0.05, 0.015)} m={B.trim} p={[CX, y, -2.975]} castShadow={false} />)}
        <Part m={B.trim} p={[CX, SPRING, -2.975]} castShadow={false}>
          <torusGeometry args={[R * 0.5, 0.022, 8, 24, Math.PI]} />
        </Part>
        <Part m={B.trim} p={[CX, SPRING, -2.975]} castShadow={false}>
          <torusGeometry args={[R - 0.01, 0.024, 8, 36, Math.PI]} />
        </Part>
        {/* le bouton de l'espagnolette, d'un côté */}
        <Part geo={rbox(0.03, 0.11, 0.03, 0.01)} m={B.brass} p={[CX + 0.04, WIN.y0 + 0.8, -2.935]} castShadow={false} />
        {/* la tablette de bois, avec son nez arrondi */}
        <Part geo={rbox(2.1, 0.06, 0.28, 0.025)} m={B.woodLight} p={[CX, WIN.y0 - 0.13, -2.86]} />
        {/* un vase et un brin d'eucalyptus, dans l'angle droit de la tablette */}
        <group position={[WIN.x1 - 0.12, WIN.y0 - 0.1, -2.88]}>
          <Part geo={cyl(0.04, 0.03, 0.1, 14)} m={B.ceramicRose} p={[0, 0.05, 0]} castShadow={false} />
          <Part geo={cyl(0.015, 0.02, 0.05, 12)} m={B.ceramicRose} p={[0, 0.125, 0]} castShadow={false} />
          {[[-0.05, 0.3], [0.0, 0.0], [0.05, -0.28]].map(([x, tilt], i) => (
            <group key={i} position={[0, 0.14, 0]} rotation-z={tilt}>
              <Part geo={cyl(0.004, 0.004, 0.3 + i * 0.04, 5)} m={B.leafDark} p={[x * 0.2, 0.15, 0]} castShadow={false} />
              {[0.08, 0.15, 0.22, 0.29].map((y, k) => <Part key={k} geo={SPH} m={B.succulent} scale={[0.026, 0.012, 0.02]} p={[x * 0.2 + (k % 2 ? 0.02 : -0.02), y + i * 0.02, 0]} castShadow={false} />)}
            </group>
          ))}
        </group>
      </Static>
      {/* la vitre embuée, dans l'épaisseur du mur, derrière le cadre */}
      <mesh geometry={GLASS} material={B.fog} position={[0, 0, -3.1]} renderOrder={3} raycast={() => {}} />
    </>
  )
}

/**
 * Trois bougies sur la tablette, objet « lampe » (jour / nuit) : un bocal haut, un chandelier de laiton, un petit pot, posés sur un
 * plateau de laiton. Le soir, les flammes s'allument pour de bon : un halo doré plus grand, une lumière chaude sur la fenêtre et le bain.
 * `position` : le pied du plateau, sur la tablette.
 */
export function SillCandles({ position }: { position: [number, number, number] }) {
  const g = useRef<Group>(null!), light = useRef<PointLight>(null!), bounce = useRef<PointLight>(null!), glow = useRef<Sprite>(null!)
  useSquash('lamp', g)
  useFrame(() => {
    const e = smooth(mood.night), on = isActive(useStore.getState(), 'lamp')
    light.current.intensity = (0.2 + e * 1.7) * Math.PI
    bounce.current.intensity = e * 0.8 * Math.PI
    glow.current.material.opacity = on ? 0.25 + e * 0.5 : 0.15
  })
  return (
    <group ref={g} userData={{ id: 'lamp' }} position={position}>
      <Static>
        <Part geo={cyl(0.22, 0.2, 0.02, 28)} m={B.brass} p={[0, 0.01, 0.0]} scale={[1, 1, 0.4]} />
        <Part geo={cyl(0.19, 0.19, 0.006, 28)} m={B.brassDark} p={[0, 0.022, 0]} scale={[1, 1, 0.4]} castShadow={false} />
        {/* le pot de la plus petite : de la cire coulée sur le bord */}
        <Part geo={cyl(0.052, 0.045, 0.05, 14)} m={B.ceramicBlue} p={[0.1, 0.045, 0.03]} castShadow={false} />
      </Static>
      <Candle position={[-0.1, 0.03, 0.0]} height={0.2} radius={0.04} holder="jar" />
      <Candle position={[0.0, 0.165, -0.04]} height={0.15} radius={0.028} holder="brass" />
      <Candle position={[0.1, 0.05, 0.03]} height={0.06} radius={0.034} />
      <sprite ref={glow} position={[0, 0.3, 0.05]} scale={1.2} raycast={() => {}}>
        <spriteMaterial map={glowTex} transparent depthWrite={false} blending={AdditiveBlending} opacity={0.15} />
      </sprite>
      <pointLight ref={light} color={0xffc27a} intensity={0} distance={7} decay={1.4} position={[0, 0.3, 0.2]} />
      {/* le reflet de l'avant, la nuit : sans lui la douche, le lavabo et la plante de gauche restaient dans le noir (monde ≈ [-1, 2.2, 2.6]) */}
      <pointLight ref={bounce} color={0xffd6c8} intensity={0} distance={10} decay={1.3} position={[-2.0, 0.45, 5.43]} />
    </group>
  )
}
