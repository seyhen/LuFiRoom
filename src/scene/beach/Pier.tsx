import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, PlaneGeometry, TubeGeometry, Vector3, type Sprite } from 'three'
import { smooth } from '../../math'
import { mood } from '../anim'
import { cyl, noRay, rbox, type V3 } from '../parts'
import { Part } from './deco'
import { glowTex } from '../textures'
import { WATER, groundY } from './isle'
import { S } from './surroundMaterials'
import { SittingGull } from './Gulls'

/** L'axe du ponton : il part du côté droit du bungalow, longe le sable, puis file en mer vers le fond droit. */
export const PIER = { x: 5.1, z: -0.6, len: 8.6, w: 1.3, top: -0.12 }
// Le débarcadère s'arrête au bord du ponton (x - w / 2) : avant, les deux planchers se chevauchaient à la même hauteur, planches en travers
// l'une de l'autre, et clignotaient. Le ponton, lui, est prolongé de `JOIN` vers la plage pour fermer l'angle.
const WALK = { x0: 3.45, len: PIER.x - PIER.w / 2 - 3.45 }
const JOIN = PIER.w / 2

/** Un plancher : une boîte et son dessus à planches (texture répétée à l'échelle), centré en x, de 0 à `len` en z. */
function Deck({ len, w }: { len: number; w: number }) {
  const g = useMemo(() => {
    const pl = new PlaneGeometry(w, len), uv = pl.attributes.uv
    for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (w / 1.4), uv.getY(i) * (len / 2.6))
    return pl
  }, [len, w])
  return (
    <>
      <Part geo={rbox(w, 0.1, len, 0.03, 1)} m={S.pierBeam} p={[0, 0, len / 2]} />
      <mesh geometry={g} material={S.pierWood} position={[0, 0.064, len / 2]} rotation-x={-Math.PI / 2} receiveShadow raycast={noRay} />
      {/* les deux longerons qui dépassent un peu au bout */}
      {[-1, 1].map((s) => <Part key={s} geo={rbox(0.1, 0.16, len + 0.1, 0.03, 1)} m={S.pierBeam} p={[s * (w / 2 - 0.02), -0.05, len / 2]} castShadow={false} />)}
    </>
  )
}

/** Un poteau : bois gris, un collier de corde, la partie mouillée plus sombre. `up` : de combien il dépasse le plancher. */
function Post({ p, up, bottom }: { p: V3; up: number; bottom: number }) {
  const h = up + 0.05 - bottom
  return (
    <group position={p}>
      <Part geo={cyl(0.072, 0.085, h, 10)} m={S.pierPost} p={[0, bottom + h / 2, 0]} castShadow={false} />
      <Part geo={cyl(0.076, 0.09, 0.5, 10)} m={S.pierPost} p={[0, WATER - 0.17 - p[1] + 0.05, 0]} castShadow={false} />
      <Part geo={cyl(0.082, 0.082, 0.04, 10)} m={S.pierPost} p={[0, up + 0.05, 0]} castShadow={false} />
      <Part geo={cyl(0.088, 0.088, 0.045, 10)} m={S.rope} p={[0, up - 0.1, 0]} castShadow={false} />
    </group>
  )
}

/** La lanterne au bout du ponton : un bocal de verre sur un crochet, qui s'allume le soir. */
function Lantern({ p }: { p: V3 }) {
  const glow = useRef<Sprite>(null!)
  useFrame(() => {
    const n = smooth(mood.night)
    S.lantern.emissiveIntensity = 0.15 + n * 1.6
    glow.current.material.opacity = n * 0.85
  })
  return (
    <group position={p}>
      <Part geo={rbox(0.2, 0.26, 0.2, 0.06, 2)} m={S.lantern} p={[0, 0.17, 0]} castShadow={false} />
      <Part geo={cyl(0.07, 0.11, 0.07, 10)} m={S.iron} p={[0, 0.34, 0]} castShadow={false} />
      <Part geo={rbox(0.24, 0.04, 0.24, 0.015, 1)} m={S.iron} p={[0, 0.02, 0]} castShadow={false} />
      <sprite ref={glow} position={[0, 0.17, 0]} scale={2.4} raycast={noRay}>
        <spriteMaterial map={glowTex} blending={2} transparent depthWrite={false} opacity={0} />
      </sprite>
    </group>
  )
}

/**
 * Le ponton de bois flotté : un petit débarcadère contre le bungalow, puis le ponton qui traverse le sable et s'enfonce dans la mer
 * (poteaux plantés dans l'eau, corde de rambarde du côté de la caméra, bittes d'amarrage de l'autre côté, lanterne au bout, mouettes
 * sur les poteaux).
 */
export function Pier() {
  const { x, z, len, w, top } = PIER
  const y = top - 0.05
  const L = 1.8, ropes = useMemo(() => {
    // la rambarde : une corde qui pend entre les têtes de poteaux (côté caméra : local -x, devant world +x)
    const out: TubeGeometry[] = []
    for (let k = 0; k < Math.floor(len / L); k++) {
      const a = k * L + 0.3, b = a + L
      out.push(new TubeGeometry(new CatmullRomCurve3([new Vector3(-w / 2 + 0.03, 0.46, a), new Vector3(-w / 2 + 0.03, 0.34, (a + b) / 2), new Vector3(-w / 2 + 0.03, 0.46, b)]), 10, 0.014, 5, false))
    }
    return out
  }, [len, w])
  const posts: number[] = Array.from({ length: Math.floor(len / L) + 1 }, (_, k) => k * L + 0.3)
  const wet = (zz: number) => groundY(x, z - zz) <= WATER + 0.02
  return (
    <>
      {/* le débarcadère contre la coque : de x = 3,45 à la jonction */}
      <group position={[WALK.x0, y, z]} rotation-y={Math.PI / 2}>
        <Deck len={WALK.len} w={w} />
        {[0.2, WALK.len - 0.1].map((zz) => (
          <Post key={zz} p={[-w / 2 + 0.03, 0, zz]} up={0.5} bottom={-0.55} />
        ))}
      </group>
      <group position={[x, y, z]} rotation-y={Math.PI}>
        <group position={[0, 0, -JOIN]}>
          <Deck len={len + JOIN} w={w} />
        </group>
        {posts.map((zz, k) => (
          <group key={zz}>
            <Post p={[-w / 2 + 0.03, 0, zz]} up={0.5} bottom={wet(zz) ? -0.52 : -0.5} />
            {/* pas de bitte d'amarrage dans le passage qui vient du débarcadère */}
            {k > 0 && <Post p={[w / 2 - 0.03, 0, zz]} up={k % 2 ? 0.2 : 0.26} bottom={wet(zz) ? -0.52 : -0.5} />}
          </group>
        ))}
        {ropes.map((g, i) => <mesh key={i} geometry={g} material={S.rope} raycast={noRay} />)}
        <Lantern p={[w / 2 - 0.03, 0.3, len - 0.1]} />
        {/* une caisse de pêche et un seau au bout */}
        <Part geo={rbox(0.42, 0.26, 0.3, 0.05, 2)} m={S.pierBeam} p={[0.15, 0.18, len - 0.7]} rotation-y={0.2} />
        <Part geo={cyl(0.12, 0.1, 0.22, 12)} m={S.canvasCoral} p={[-0.2, 0.16, len - 1.4]} />
        {/* la mouette du ponton, sur le dernier poteau côté caméra */}
        <SittingGull p={[-w / 2 + 0.03, 0.6, len - 0.4]} ry={-1.2} scale={1.5} />
        <SittingGull p={[w / 2 - 0.03, 0.31, 3.9]} ry={2.6} scale={1.4} />
      </group>
    </>
  )
}
