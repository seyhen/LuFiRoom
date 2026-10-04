import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, CatmullRomCurve3, TubeGeometry, Vector3, type Mesh, type MeshBasicMaterial, type Sprite } from 'three'
import { smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { mood, reduceMotion } from '../anim'
import { glowTex } from '../textures'
import { LIVE } from '../Static'
import { Steam } from '../objects/Steam'
import { K } from './materials'
import { YATAI } from './Yatai'

// Les flaques : [x, z, demi-axe x, demi-axe z, couleur du reflet]. Elles prennent les couleurs de ce qui est près d'elles.
const PUDDLES: [number, number, number, number, number][] = [
  [-1.3, -1.45, 0.8, 0.5, 0x4ac8ff], [0.8, 0.95, 0.95, 0.6, 0xff7a5a], [-1.0, -2.1, 0.55, 0.32, 0xff4fb0], [-1.4, 2.25, 0.55, 0.38, 0x7a8cff],
  [2.1, 1.7, 0.7, 0.45, 0xffb36a], [-1.85, 0.35, 0.7, 0.55, 0xffa050], [0.6, -1.95, 0.6, 0.3, 0xff9a5a],
]

/** Les flaques du pavé : un miroir sombre qui reprend les couleurs des lumières voisines (rien ne tombe dedans : la ruelle est couverte). */
function Puddles() {
  const decals = useRef<Mesh[]>([])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, n = smooth(mood.night)
    decals.current.forEach((d, i) => {
      ;(d.material as MeshBasicMaterial).opacity = (0.16 + 0.6 * n) * (0.9 + (reduceMotion ? 0 : Math.sin(t * 0.9 + i) * 0.1))
    })
  })
  return (
    <group userData={LIVE}>
      {PUDDLES.map(([x, z, rx, rz, col], i) => (
        <group key={i} position={[x, 0, z]}>
          <mesh material={K.puddle} position={[0, 0.011, 0]} rotation-x={-Math.PI / 2} scale={[rx, rz, 1]} receiveShadow raycast={noRay}>
            <circleGeometry args={[1, 28]} />
          </mesh>
          <mesh ref={(el) => void (el && (decals.current[i] = el))} position={[0, 0.013, 0]} rotation-x={-Math.PI / 2} scale={[rx * 1.5, rz * 1.5, 1]} raycast={noRay}>
            <circleGeometry args={[1, 28]} />
            <meshBasicMaterial map={glowTex} color={col} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.3} />
          </mesh>
        </group>
      ))}
    </group>
  )
}

/** Un vélo appuyé contre le rideau de fer : deux roues, un cadre, un panier d'osier avec un sac, un ciré jaune sur le guidon. */
function Bicycle() {
  return (
    <group position={[-2.55, 0, -0.95]} rotation-z={-0.1}>
      {[-0.55, 0.55].map((z) => (
        <group key={z} position={[0, 0.38, z]}>
          <Part m={K.iron} rotation-y={Math.PI / 2}>
            <torusGeometry args={[0.38, 0.022, 8, 30]} />
          </Part>
          <Part m={K.steel} rotation-y={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.3, 0.006, 4, 30]} />
          </Part>
          <Part geo={cyl(0.04, 0.04, 0.05, 10)} m={K.steel} rotation-z={Math.PI / 2} castShadow={false} />
          {Array.from({ length: 5 }, (_, i) => (
            <Part key={i} geo={cyl(0.004, 0.004, 0.76, 4)} m={K.steel} rotation-x={(i / 5) * Math.PI} castShadow={false} />
          ))}
        </group>
      ))}
      {/* cadre : tube diagonal, tube de selle, fourche, guidon, selle */}
      <Part geo={cyl(0.017, 0.017, 0.7, 8)} m={K.teal} p={[0, 0.62, 0.05]} rotation-x={-0.95} />
      <Part geo={cyl(0.017, 0.017, 0.55, 8)} m={K.teal} p={[0, 0.65, -0.25]} rotation-x={0.12} />
      <Part geo={cyl(0.017, 0.017, 0.7, 8)} m={K.teal} p={[0, 0.9, -0.14]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.015, 0.015, 0.55, 8)} m={K.teal} p={[0, 0.65, 0.5]} rotation-x={0.35} />
      <Part geo={cyl(0.012, 0.012, 0.5, 6)} m={K.steel} p={[0, 0.98, 0.58]} rotation-x={0.2} rotation-z={Math.PI / 2} castShadow={false} />
      <Part geo={rbox(0.12, 0.05, 0.26, 0.02)} m={K.iron} p={[0, 0.95, -0.36]} />
      {/* panier d'osier à l'avant, avec un sac de courses */}
      <Part geo={rbox(0.3, 0.2, 0.34, 0.04)} m={K.woodPale} p={[0, 0.84, 0.76]} />
      <Part geo={rbox(0.24, 0.16, 0.2, 0.05)} m={K.red} p={[0.0, 0.99, 0.76]} castShadow={false} />
      <Part geo={cyl(0.01, 0.01, 0.2, 5)} m={K.scallion} p={[0.04, 1.12, 0.74]} castShadow={false} />
      {/* le ciré jaune sur le guidon */}
      <Part geo={rbox(0.05, 0.4, 0.36, 0.03)} m={K.yellow} p={[0.08, 0.8, 0.52]} rotation-z={0.06} castShadow={false} />
    </group>
  )
}

/** Deux caisses de bière en plastique, empilées, pleines de bouteilles vertes, et un carton écrasé par la pluie. */
function Crates() {
  return (
    <group position={[2.5, 0, -2.45]} rotation-y={0.18}>
      {[0, 1].map((j) => (
        <group key={j} position={[0, j * 0.32, 0]}>
          <Part geo={rbox(0.7, 0.3, 0.5, 0.04)} m={j ? K.yellow : K.red} p={[0, 0.15, 0]} />
          <Part geo={rbox(0.62, 0.04, 0.42, 0.015)} m={K.iron} p={[0, 0.29, 0]} castShadow={false} />
          {Array.from({ length: 8 }, (_, i) => (
            <Part key={i} geo={cyl(0.035, 0.035, 0.18, 8)} m={K.scallion} p={[-0.25 + (i % 4) * 0.165, 0.38, i < 4 ? -0.1 : 0.1]} castShadow={false} />
          ))}
        </group>
      ))}
      <Part geo={rbox(0.52, 0.2, 0.4, 0.02)} m={K.woodPale} p={[-0.88, 0.1, 0.1]} rotation-y={0.4} />
    </group>
  )
}

/**
 * Le gril à yakitori : braises rougeoyantes dans une caisse de fonte, brochettes en travers, un éventail, de la fumée légère ;
 * à côté un tonneau pour table, deux verres de bière, une assiette de brochettes et deux caisses retournées en guise de tabourets.
 */
function Grill() {
  const coals = useRef<Mesh>(null!), glow = useRef<Sprite>(null!)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, n = smooth(mood.night), f = 0.8 + (reduceMotion ? 0 : Math.sin(t * 5.1) * 0.1 + Math.sin(t * 13.7) * 0.07)
    ;(coals.current.material as MeshBasicMaterial).color.setRGB(1 * f, 0.34 * f, 0.1 * f)
    glow.current.material.opacity = (0.3 + 0.5 * n) * f
  })
  return (
    <>
      <group position={[-1.05, 0, 1.05]} rotation-y={0.3}>
        <Part geo={rbox(0.56, 0.28, 0.4, 0.04)} m={K.red} p={[0, 0.14, 0]} />
        <Part geo={rbox(0.86, 0.17, 0.28, 0.04)} m={K.iron} p={[0, 0.37, 0]} />
        <mesh ref={coals} position={[0, 0.455, 0]} rotation-x={-Math.PI / 2} raycast={noRay} userData={LIVE}>
          <planeGeometry args={[0.76, 0.18]} />
          <meshBasicMaterial color={0xff5a1a} />
        </mesh>
        {Array.from({ length: 6 }, (_, i) => (
          <group key={i} position={[-0.3 + i * 0.12, 0.49, 0]}>
            <Part geo={cyl(0.006, 0.006, 0.36, 4)} m={K.woodPale} rotation-x={Math.PI / 2} castShadow={false} />
            {[0, 1, 2].map((j) => (
              <Part key={j} geo={SPH} m={K.woodDark} scale={[0.026, 0.02, 0.022]} p={[0, 0.012, -0.08 + j * 0.06]} castShadow={false} />
            ))}
          </group>
        ))}
        <Part geo={cyl(0.006, 0.006, 0.9, 4)} m={K.steel} p={[0, 0.5, 0.12]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.006, 0.006, 0.9, 4)} m={K.steel} p={[0, 0.5, -0.12]} rotation-z={Math.PI / 2} castShadow={false} />
        {/* l'éventail posé sur la caisse */}
        <group position={[0.3, 0.3, 0.22]} rotation={[-0.3, 0, 0.2]}>
          <Part geo={cyl(0.1, 0.1, 0.008, 16)} m={K.cream} p={[0, 0.06, 0]} castShadow={false} />
          <Part geo={cyl(0.008, 0.008, 0.12, 5)} m={K.woodDark} p={[0, -0.04, 0]} castShadow={false} />
        </group>
        <sprite ref={glow} scale={1.3} position={[0, 0.55, 0.05]} raycast={noRay}>
          <spriteMaterial map={glowTex} color={0xff7a30} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.3} />
        </sprite>
        <Steam at={[0, 0.7, 0]} every={0.55} />
      </group>
      <group position={[-0.25, 0, 2.15]}>
        <Part geo={cyl(0.33, 0.33, 0.7, 24)} m={K.wood} p={[0, 0.35, 0]} />
        <Part geo={cyl(0.345, 0.345, 0.04, 24)} m={K.woodPale} p={[0, 0.72, 0]} />
        {[0.2, 0.52].map((y) => (
          <Part key={y} geo={cyl(0.34, 0.34, 0.025, 24)} m={K.iron} p={[0, y, 0]} castShadow={false} />
        ))}
        {[-0.12, 0.1].map((x, i) => (
          <group key={x} position={[x, 0.74, i * 0.1 - 0.05]}>
            <Part geo={cyl(0.045, 0.04, 0.12, 12)} m={K.glass} p={[0, 0.06, 0]} castShadow={false} />
            <Part geo={cyl(0.04, 0.04, 0.07, 12)} m={K.yellow} p={[0, 0.035, 0]} castShadow={false} />
            <Part geo={cyl(0.042, 0.042, 0.025, 12)} m={K.cream} p={[0, 0.13, 0]} castShadow={false} />
          </group>
        ))}
        <Part geo={cyl(0.1, 0.09, 0.012, 16)} m={K.bowl} p={[0.05, 0.74, 0.2]} castShadow={false} />
        {[0, 1, 2].map((i) => (
          <Part key={i} geo={cyl(0.004, 0.004, 0.16, 4)} m={K.woodPale} p={[0.05, 0.76 + i * 0.006, 0.2 + (i - 1) * 0.025]} rotation-z={Math.PI / 2} castShadow={false} />
        ))}
      </group>
      {[[-0.85, 2.55, 0.3], [0.45, 2.45, -0.4]].map(([x, z, r], i) => (
        <group key={i} position={[x, 0, z]} rotation-y={r}>
          <Part geo={rbox(0.42, 0.34, 0.32, 0.04)} m={i ? K.red : K.yellow} p={[0, 0.17, 0]} />
          <Part geo={rbox(0.36, 0.03, 0.26, 0.012)} m={K.iron} p={[0, 0.35, 0]} castShadow={false} />
        </group>
      ))}
    </>
  )
}

/** Un bonsaï de rue dans un pot de grès, une poubelle d'acier et ses sacs, un arrosoir. */
function Greenery() {
  return (
    <>
      <group position={[2.75, 0, 2.25]}>
        <Part geo={cyl(0.2, 0.15, 0.3, 18)} m={K.rust} p={[0, 0.15, 0]} />
        <Part geo={cyl(0.19, 0.19, 0.02, 18)} m={K.woodDark} p={[0, 0.3, 0]} castShadow={false} />
        <Part geo={cyl(0.03, 0.04, 0.5, 8)} m={K.woodDark} p={[0, 0.55, 0]} rotation-z={0.15} />
        {[[0, 0.92, 0, 0.3], [-0.2, 0.78, 0.05, 0.2], [0.2, 0.74, -0.05, 0.22]].map(([x, y, z, r], i) => (
          <Part key={i} geo={SPH} m={i % 2 ? K.scallion : K.teal} scale={[r, r * 0.6, r]} p={[x, y, z]} />
        ))}
      </group>
      <group position={[-2.5, 0, -2.65]}>
        <Part geo={cyl(0.24, 0.21, 0.7, 20)} m={K.steel} p={[0, 0.35, 0]} />
        <Part geo={cyl(0.26, 0.26, 0.05, 20)} m={K.steelDark} p={[0, 0.72, 0]} castShadow={false} />
        {[[-0.35, 0.18, 0.1], [-0.3, 0.14, -0.2]].map(([x, y, z], i) => (
          <Part key={i} geo={SPH} m={K.iron} scale={[0.2, 0.17, 0.18]} p={[x, y, z]} />
        ))}
      </group>
    </>
  )
}

const catenary = (a: V3, b: V3, sag: number, n: number): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const u = i / (n - 1)
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - 4 * sag * u * (1 - u), a[2] + (b[2] - a[2]) * u]
  })

const STRANDS: [V3, V3, number, number][] = [
  [[-2.93, 3.35, -0.9], [YATAI.x - 1.12, 2.35, -1.27], 0.34, 9],
  [[YATAI.x - 1.12, 2.35, -1.27], [-0.95, 3.0, -2.9], 0.22, 6],
  [[YATAI.x + 1.12, 2.35, -1.27], [2.92, 3.45, -2.85], 0.28, 7],
]

/** Des guirlandes d'ampoules nues tendues entre la carriole et les murs : elles s'allument et respirent à la nuit. */
function Festoon() {
  const bulbs = useRef<Mesh[]>([]), halos = useRef<Sprite[]>([])
  const all = useMemo(() => STRANDS.flatMap(([a, b, sag, n], s) => catenary(a, b, sag, n).slice(1, -1).map((p, i) => ({ p, s, i }))), [])
  const wires = useMemo(() => STRANDS.map(([a, b, sag]) => new TubeGeometry(new CatmullRomCurve3(catenary(a, b, sag, 14).map((p) => new Vector3(...p))), 28, 0.008, 4)), [])
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, n = smooth(mood.night)
    bulbs.current.forEach((b, i) => {
      const tw = reduceMotion ? 1 : 0.88 + Math.sin(t * 1.3 + i * 1.9) * 0.08 + Math.sin(t * 7.1 + i) * 0.04
      ;(b.material as MeshBasicMaterial).color.setRGB(0.6 + n * 0.4, 0.5 + n * 0.38 * tw, 0.3 + n * 0.1)
      halos.current[i].material.opacity = (0.1 + 0.65 * n) * tw
    })
  })
  return (
    <>
      {wires.map((g, i) => (
        <Part key={i} geo={g} m={K.iron} castShadow={false} />
      ))}
      <group userData={LIVE}>
        {all.map(({ p }, i) => (
          <group key={i} position={p}>
            <mesh position={[0, -0.05, 0]} ref={(el) => void (el && (bulbs.current[i] = el))} raycast={noRay}>
              <sphereGeometry args={[0.04, 10, 8]} />
              <meshBasicMaterial color={0xffe8b0} />
            </mesh>
            <Part geo={cyl(0.014, 0.014, 0.04, 6)} m={K.brass} p={[0, -0.005, 0]} castShadow={false} />
            <sprite ref={(el) => void (el && (halos.current[i] = el))} position={[0, -0.05, 0]} scale={0.5} raycast={noRay}>
              <spriteMaterial map={glowTex} color={0xffc070} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.1} />
            </sprite>
          </group>
        ))}
      </group>
    </>
  )
}

/** Ce qui habille la ruelle : flaques et leurs ronds, gouttes du store, vélo, caisses, bonsaï, poubelle, guirlandes. */
export function Street() {
  return (
    <>
      <Puddles />
      <Bicycle />
      <Crates />
      <Greenery />
      <Grill />
      <Festoon />
    </>
  )
}
