import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, LatheGeometry, Vector2, type Group, type PointLight, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach, rand } from '../../math'
import { Batch, Part, cyl, noRay, rbox, worldUV, type Item } from '../parts'
import { useParticles, useSquash } from '../anim'
import { glowTex, mistTex } from '../textures'
import { C } from './materials'
import { emberTex } from './textures'
import { Stockings } from './Stockings'
import { MantelDecor } from './MantelDecor'

// Les flammes : abscisse, profondeur, hauteur, déphasage.
const FLAMES = [{ x: -0.2, z: 0.02, h: 1, p: 0 }, { x: 0.18, z: 0.06, h: 1.15, p: 1.7 }, { x: 0, z: -0.08, h: 1.4, p: 3.1 }]
// Une flamme en goutte : ventre rond en bas, bout arrondi en haut (hauteur 1, rayon 1, base à l'origine).
const DROP = new LatheGeometry(
  [[0.001, 0], [0.6, 0.04], [0.92, 0.16], [1, 0.3], [0.88, 0.47], [0.6, 0.66], [0.3, 0.84], [0.08, 0.97], [0.001, 1]].map(([x, y]) => new Vector2(x, y)),
  18,
)
const POS = [-1.9, 0, -2.69] as const
// Les bûches de l'âtre, couchées : hauteur, profondeur, rayon. Leur bout côté pièce (x > 0) est en bois clair.
const LOGS = [{ y: 0.2, z: -0.06, r: 0.1 }, { y: 0.2, z: 0.2, r: 0.1 }, { y: 0.36, z: 0.07, r: 0.09 }]
const tilt = (i: number) => Math.PI / 2 + (i === 2 ? 0.08 : 0)
const ENDS: Item[] = LOGS.map(({ y, z, r }, i) => ({ p: [0.45 * Math.sin(tilt(i)), y - 0.45 * Math.cos(tilt(i)), z], s: [r * 0.92, 0.012, r * 0.92], r: [0, 0, tilt(i)] }))

/**
 * Cheminée en pierre, manteau en bois habillé pour Noël : le feu s'allume et crépite quand son son joue, la bûche du dessus
 * rougeoie, la pièce s'éclaire de orange, des braises montent.
 */
export function Fireplace() {
  const g = useRef<Group>(null!), flames = useRef<Group[]>([]), light = useRef<PointLight>(null!), glow = useRef<Sprite>(null!), fire = useRef<Group>(null!)
  const embers = useParticles(), smoke = useParticles(), lit = useRef(0), since = useRef(0), puff = useRef(0)
  useSquash('fireplace', g)
  useFrame(({ clock }, delta) => {
    const dt = Math.min(delta, 0.05), t = clock.elapsedTime
    lit.current = approach(lit.current, isActive(useStore.getState(), 'fireplace') ? 1 : 0, dt * 2.2)
    const k = lit.current
    fire.current.visible = k > 0.01
    flames.current.forEach((f, i) => {
      const { h, p } = FLAMES[i], w = Math.sin(t * 9 + p) * 0.12 + Math.sin(t * 14.3 + p * 2) * 0.07
      f.scale.set(1 + w * 0.5, k * h * (1 + w), 1 + w * 0.5)
      f.rotation.z = Math.sin(t * 5 + p) * 0.1
    })
    light.current.intensity = k * (1.5 + Math.sin(t * 11) * 0.12 + Math.sin(t * 17.3) * 0.1) * Math.PI // × π : voir materials.ts
    glow.current.material.opacity = k * (0.62 + Math.sin(t * 9) * 0.06)
    C.charred.emissiveIntensity = k * (0.55 + Math.sin(t * 7.3) * 0.12)
    since.current += dt
    puff.current += dt
    // un filet de fumée sort de la cheminée tant que le feu brûle
    if (k > 0.6 && puff.current > 0.7) {
      puff.current = 0
      smoke.emit(mistTex, POS[0] + rand(-0.12, 0.12), 4.32, POS[2] - 0.07, { size: 0.4, life: 5.5, vy: 0.3, sway: 0.28, grow: 2.2, peak: 0.5, color: 0xb9b2bd, soft: true })
    }
    if (k > 0.6 && since.current > 0.22) {
      since.current = 0
      embers.emit(emberTex, POS[0] + rand(-0.3, 0.3), 0.55, POS[2] + 0.25 + rand(-0.1, 0.1), { size: 0.1, life: 1.9, vy: 0.55, sway: 0.14, peak: 0.95 })
    }
  })
  return (
    <>
      <group ref={g} userData={{ id: 'fireplace' }} position={POS as unknown as [number, number, number]}>
        {/* âtre, piliers et conduit en pierre, manteau en bois */}
        <Part geo={rbox(2.4, 0.14, 1.2, 0.06)} m={C.stoneDark} p={[0, 0.07, 0.22]} />
        {[-0.8, 0.8].map((x) => (
          <Part key={x} geo={worldUV(rbox(0.46, 1.5, 0.74, 0.1), 0.9)} m={C.stone} p={[x, 0.89, 0]} />
        ))}
        <Part geo={rbox(2.4, 0.24, 0.86, 0.08)} m={C.beam} p={[0, 1.78, 0.08]} />
        <Part geo={worldUV(rbox(1.55, 2.3, 0.6, 0.08), 0.9)} m={C.stone} p={[0, 3.05, -0.07]} />
        <Part geo={rbox(1.14, 1.3, 0.1, 0.04)} m={C.soot} p={[0, 0.85, -0.3]} />
        {/* bûches, le bout en bois clair */}
        {LOGS.map(({ y, z, r }, i) => (
          <Part key={i} geo={cyl(r, r, 0.9, 14)} m={i === 2 ? C.charred : C.log} p={[0, y, z]} rotation-z={tilt(i)} />
        ))}
        <Batch geo={cyl(1, 1, 1, 14)} m={C.cut} items={ENDS} />
        <Stockings />
        <MantelDecor />
        {/* le feu : flammes (pied commun, chaque flamme grandit vers le haut), lumière, halo */}
        <group ref={fire} position={[0, 0.43, 0.07]}>
          {FLAMES.map(({ x, z, h }, i) => (
            <group key={i} ref={(el) => void (el && (flames.current[i] = el))} position={[x, 0, z]}>
              <mesh geometry={DROP} material={C.flame} scale={[0.17, 0.6 * h, 0.12]} position={[0, -0.03 * h, 0]} raycast={noRay} />
              <mesh geometry={DROP} material={C.flameCore} scale={[0.09, 0.36 * h, 0.07]} position={[0, -0.017 * h, 0.03]} raycast={noRay} />
            </group>
          ))}
        </group>
        <pointLight ref={light} color={0xff8a3d} intensity={0} distance={9} decay={1.5} position={[0, 0.8, 0.5]} />
        <sprite ref={glow} scale={2.8} position={[0, 0.75, 0.3]} raycast={noRay}>
          <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
        </sprite>
      </group>
      <group ref={embers.group} />
      <group ref={smoke.group} />
    </>
  )
}
