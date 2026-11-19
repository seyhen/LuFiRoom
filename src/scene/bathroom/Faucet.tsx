import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, TubeGeometry, Vector3, type Group, type Mesh, type Texture } from 'three'
import { approach } from '../../math'
import { isActive, useStore } from '../../state/store'
import { reduceMotion, useSquash } from '../anim'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { BathSteam } from './BathSteam'
import { B } from './materials'
import { TUB } from './tubGeo'

// Où il est : sur le soubassement du mur du fond (sa face est à z = -2,95), à la tête de la baignoire. Le bec s'avance de 54 cm et tombe
// au-dessus de l'eau, sur l'axe du bain.
const MOUNT: V3 = [-0.55, 1.2, -2.95]
const SPOUT_Y = -0.1 // le bout du bec, sous le point de fixation
const REACH = 0.54 // la distance du mur au bec
const FALL = MOUNT[1] + SPOUT_Y - 0.03 - (TUB.water + 0.004) // la hauteur du filet : du bec à la surface de l'eau

/** Le col de cygne : un tube de laiton qui s'avance, monte, s'incurve et plonge vers le bain. */
const SWAN = new TubeGeometry(
  new CatmullRomCurve3([[0, 0, 0], [0, 0, 0.2], [0, 0.05, 0.36], [0, 0.085, 0.47], [0, 0.04, REACH], [0, -0.04, REACH], [0, SPOUT_Y + 0.03, REACH]].map(([x, y, z]) => new Vector3(x, y, z)), false, 'centripetal'),
  36, 0.022, 10, false,
)

/** Une manette en croix : une rosace de laiton au mur, un fût, quatre branches et un cabochon de porcelaine (rose pour le chaud, bleu pour le froid). */
function Cross({ x, ceramic, k }: { x: number; ceramic: typeof B.ceramicRose; k: number }) {
  const g = useRef<Group>(null!)
  useFrame((_, delta) => {
    // un quart de tour quand l'eau coule
    const on = isActive(useStore.getState(), 'faucet')
    g.current.rotation.z = approach(g.current.rotation.z, on ? k * 0.8 : 0, Math.min(delta, 0.05) * 3)
  })
  return (
    <group position={[x, 0, 0]}>
      <Part geo={cyl(0.058, 0.066, 0.02, 20)} m={B.brass} p={[0, 0, 0.022]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.03, 0.03, 0.06, 12)} m={B.brass} p={[0, 0, 0.06]} rotation-x={Math.PI / 2} castShadow={false} />
      <group ref={g} position={[0, 0, 0.1]}>
        <Part geo={rbox(0.15, 0.03, 0.03, 0.012)} m={B.chrome} castShadow={false} />
        <Part geo={rbox(0.03, 0.15, 0.03, 0.012)} m={B.chrome} castShadow={false} />
        <Part geo={cyl(0.034, 0.034, 0.024, 16)} m={ceramic} p={[0, 0, 0.012]} rotation-x={Math.PI / 2} castShadow={false} />
      </group>
    </group>
  )
}

/**
 * Le robinet col de cygne de la baignoire, objet « robinet » : une plaque et deux manettes en croix de porcelaine (chaud rose, froid bleu)
 * sur le mur, un grand bec de laiton qui plonge au-dessus de l'eau. Quand le son joue, les manettes tournent d'un quart, un filet clair
 * tombe du bec (un cylindre dont la texture défile), des ronds s'élargissent sur l'eau, de la vapeur monte. À côté, un crochet de laiton
 * et une éponge luffa.
 */
export function Faucet() {
  const g = useRef<Group>(null!), jet = useRef<Mesh>(null!), foam = useRef<Mesh>(null!), rings = [useRef<Mesh>(null!), useRef<Mesh>(null!)], t = useRef(0)
  // un matériau par rond : chacun s'efface à son rythme
  const mats = useMemo(() => [0, 1].map(() => B.ripple.clone()), [])
  useEffect(() => () => mats.forEach((m) => m.dispose()), [mats])
  useSquash('faucet', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), on = isActive(useStore.getState(), 'faucet')
    if (!reduceMotion) t.current += dt * 0.9
    ;(B.stream.map as Texture).offset.y -= dt * (reduceMotion ? 0 : 1.6)
    jet.current.visible = on
    foam.current.visible = on
    rings.forEach((r, i) => {
      const f = (t.current + i * 0.5) % 1
      r.current.visible = on
      r.current.scale.setScalar(0.03 + f * 0.26)
      mats[i].opacity = (1 - f) * 0.6
    })
    B.ripple.opacity = on ? 0.5 : 0
  })
  // la hauteur de l'eau, dans le repère du robinet
  const yw = TUB.water + 0.006 - MOUNT[1]
  return (
    <>
      <group ref={g} userData={{ id: 'faucet' }} position={MOUNT}>
        <Static>
          {/* la plaque de laiton, le col de cygne, l'embout et son brise-jet */}
          <Part geo={rbox(0.62, 0.11, 0.02, 0.008)} m={B.brassDark} p={[0, 0, 0.012]} castShadow={false} />
          <Part geo={cyl(0.05, 0.058, 0.03, 16)} m={B.brass} p={[0, 0, 0.03]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={SWAN} m={B.brass} castShadow={false} />
          <Part geo={cyl(0.03, 0.026, 0.04, 14)} m={B.chrome} p={[0, SPOUT_Y, REACH]} castShadow={false} />
          {/* le crochet et l'éponge luffa qui sèche */}
          <Part geo={cyl(0.026, 0.03, 0.014, 14)} m={B.brass} p={[0.4, 0.03, 0.015]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.008, 0.008, 0.07, 8)} m={B.brass} p={[0.4, 0.03, 0.05]} rotation-x={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.003, 0.003, 0.1, 5)} m={B.paper} p={[0.4, -0.02, 0.07]} castShadow={false} />
          <Part geo={SPH} m={B.sponge} scale={[0.04, 0.1, 0.034]} p={[0.4, -0.12, 0.07]} castShadow={false} />
          <Part geo={SPH} m={B.sponge} scale={[0.03, 0.06, 0.03]} p={[0.42, -0.12, 0.085]} castShadow={false} />
        </Static>
        <Cross x={-0.25} ceramic={B.ceramicRose} k={1} />
        <Cross x={0.25} ceramic={B.ceramicBlue} k={-1} />
        {/* le filet : un cylindre d'eau, du bec à la surface (sa texture défile vers le bas) */}
        <mesh ref={jet} material={B.stream} position={[0, SPOUT_Y - 0.02 - FALL / 2, REACH]} userData={LIVE} raycast={() => {}} renderOrder={5}>
          <cylinderGeometry args={[0.03, 0.021, FALL, 12, 1, true]} />
        </mesh>
        {/* l'impact : une touffe d'écume et deux ronds qui s'élargissent */}
        <mesh ref={foam} material={B.ripple} position={[0, yw + 0.012, REACH]} userData={LIVE} raycast={() => {}} scale={[0.05, 0.02, 0.05]}>
          <sphereGeometry args={[1, 10, 6]} />
        </mesh>
        {rings.map((r, i) => (
          <mesh key={i} ref={r} material={mats[i]} position={[0, yw, REACH]} rotation-x={-Math.PI / 2} userData={LIVE} raycast={() => {}} renderOrder={5}>
            <ringGeometry args={[0.9, 1, 28]} />
          </mesh>
        ))}
      </group>
      {/* la vapeur de l'eau chaude, au pied du filet */}
      <BathSteam at={[MOUNT[0], TUB.water + 0.12, MOUNT[2] + REACH]} every={2.2} hot={['faucet']} size={0.42} spread={0.12} />
    </>
  )
}

