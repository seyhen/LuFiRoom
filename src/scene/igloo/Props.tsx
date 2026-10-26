import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, ExtrudeGeometry, Shape, type Group, type Mesh } from 'three'
import { TAU } from '../../math'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { LIVE } from '../Static'
import { reduceMotion, useParticles } from '../anim'
import { glowTex, mistTex } from '../textures'
import { rand } from '../../math'
import { I } from './materials'
import { BENCH, along, polar } from './IglooShell'

/** L'angle qui fait regarder un objet vers le centre de l'igloo depuis la direction `a` (degrés). */
export const facing = (a: number) => Math.atan2(-Math.cos((a * Math.PI) / 180), -Math.sin((a * Math.PI) / 180))

/** Le couchage sur la banquette : une peau de mouton étalée, le duvet rouille matelassé, un oreiller de laine, une couverture pliée. */
export function Bedding() {
  const h = BENCH.h
  return (
    <>
      <group position={polar(222, 2.43, h)} rotation-y={along(222)}>
        <Part geo={rbox(2.0, 0.035, 0.86, 0.015)} m={I.fleece} p={[0, 0.018, 0]} />
      </group>
      <group position={polar(234, 2.45, h + 0.035)} rotation-y={along(234)}>
        {/* le duvet, gonflé, un peu ouvert sur le haut */}
        <Part geo={rbox(1.45, 0.17, 0.6, 0.08)} m={I.quilt} p={[0, 0.085, 0]} />
        <Part geo={rbox(0.5, 0.1, 0.56, 0.05)} m={I.rust} p={[0.52, 0.2, 0.0]} rotation-z={-0.12} />
        {/* la capuche du duvet, ronde, son ouverture plus sombre et son cordon à deux arrêts */}
        <Part geo={SPH} m={I.rust} scale={[0.2, 0.13, 0.3]} p={[0.75, 0.13, 0]} />
        <Part geo={SPH} m={I.leatherDark} scale={[0.06, 0.07, 0.17]} p={[0.62, 0.17, 0]} castShadow={false} />
        {[-0.08, 0.08].map((z) => (
          <Part key={z} geo={SPH} m={I.rust} scale={[0.018, 0.012, 0.018]} p={[0.6, 0.245, z]} castShadow={false} />
        ))}
        {/* la fermeture éclair, le long du flanc */}
        <Part geo={rbox(1.2, 0.012, 0.012, 0.004)} m={I.darkSteel} p={[-0.05, 0.17, 0.296]} castShadow={false} />
        {/* l'oreiller de laine, au bout près de la paroi */}
        <Part geo={SPH} m={I.wool} scale={[0.17, 0.08, 0.24]} p={[0.95, 0.12, 0]} />
        {/* un livre ouvert retourné sur le duvet, la frontale à côté */}
        <group position={[-0.15, 0.18, 0.05]} rotation-y={0.4}>
          {[-1, 1].map((sd) => (
            <Part key={sd} geo={rbox(0.16, 0.014, 0.22, 0.006)} m={I.book} p={[sd * 0.08, 0.008 - Math.abs(sd) * 0.0, 0]} rotation-z={sd * -0.18} castShadow={false} />
          ))}
          <Part geo={rbox(0.3, 0.008, 0.2, 0.004)} m={I.paper} p={[0, 0.0, 0]} castShadow={false} />
        </group>
        <group position={[0.35, 0.18, -0.1]}>
          <Part m={I.rubber} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.07, 0.009, 6, 20]} />
          </Part>
          <Part geo={rbox(0.05, 0.035, 0.035, 0.012)} m={I.orange} p={[0.07, 0.01, 0]} castShadow={false} />
        </group>
      </group>
      {/* la couverture de laine rouge pliée, au pied */}
      <group position={polar(206, 2.42, h + 0.035)} rotation-y={along(206)}>
        <Part geo={rbox(0.42, 0.12, 0.5, 0.04)} m={I.woolRed} p={[0.05, 0.06, -0.12]} />
        <Part geo={rbox(0.4, 0.015, 0.48, 0.005)} m={I.wool} p={[0.05, 0.09, -0.12]} castShadow={false} />
      </group>
    </>
  )
}

/** Une peau de renne posée au sol : le corps, le cou et les quatre pattes, découpés dans un seul cuir. */
function hide() {
  const s = new Shape()
  const pts: [number, number][] = [
    [-0.62, 0], [-0.55, 0.22], [-0.78, 0.38], [-0.5, 0.34], [-0.3, 0.42], [0.25, 0.42], [0.45, 0.36], [0.72, 0.46], [0.55, 0.22],
    [0.68, 0.04], [0.92, 0.02], [0.68, -0.06], [0.55, -0.22], [0.72, -0.46], [0.45, -0.36], [0.25, -0.42], [-0.3, -0.42], [-0.5, -0.34],
    [-0.78, -0.38], [-0.55, -0.22],
  ]
  s.moveTo(...pts[0])
  for (let i = 1; i <= pts.length; i++) {
    const [x0, y0] = pts[i - 1], [x1, y1] = pts[i % pts.length]
    s.quadraticCurveTo(x0, y0, (x0 + x1) / 2, (y0 + y1) / 2)
  }
  const g = new ExtrudeGeometry(s, { depth: 0.01, bevelEnabled: true, bevelThickness: 0.01, bevelSize: 0.02, bevelSegments: 2, curveSegments: 8 })
  g.rotateX(-Math.PI / 2)
  // les UV du dessus suivent x et z, pour que le poil garde sa taille
  const p = g.attributes.position, uv = g.attributes.uv
  for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) * 1.2, p.getZ(i) * 1.2)
  return g
}

/** Les peaux au sol : une grande peau de renne au milieu, où dort le chien. */
export function Rugs() {
  const g = useMemo(hide, [])
  return <mesh geometry={g} material={I.reindeer} position={[-1.05, 0.008, 0.25]} rotation-y={0.5} receiveShadow />
}

/**
 * Le réchaud de camp au milieu, sur une planchette : son brûleur, sa petite flamme bleue, la casserole cabossée où fond la neige,
 * son couvercle, et la vapeur qui s'en échappe en brume douce.
 */
export function Stove({ position }: { position: V3 }) {
  const steam = useParticles(), since = useRef(0), flame = useRef<Mesh>(null!), ph = useRef(0)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05)
    if (!reduceMotion) {
      ph.current += dt * 9
      since.current += dt
      if (since.current > 1.3) {
        since.current = 0
        steam.emit(mistTex, position[0] + rand(-0.05, 0.05), position[1] + 0.48, position[2] + rand(-0.04, 0.04), { size: 0.3, life: 3, vy: 0.16, sway: 0.04, grow: 1.4, peak: 0.35, soft: true })
      }
    }
    flame.current.scale.y = 1 + Math.sin(ph.current) * 0.15
  })
  return (
    <>
      <group position={position}>
        <Part geo={rbox(0.5, 0.04, 0.4, 0.015)} m={I.wood} p={[0, 0.02, 0]} />
        {/* le brûleur et ses trois pattes repliées vers le haut */}
        <Part geo={cyl(0.07, 0.09, 0.1, 20)} m={I.steel} p={[0, 0.09, 0]} />
        <Part geo={cyl(0.05, 0.05, 0.02, 16)} m={I.darkSteel} p={[0, 0.15, 0]} castShadow={false} />
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * TAU
          return <Part key={i} geo={rbox(0.12, 0.012, 0.02, 0.004)} m={I.darkSteel} p={[Math.cos(a) * 0.08, 0.17, Math.sin(a) * 0.08]} rotation-y={-a} castShadow={false} />
        })}
        <mesh ref={flame} position={[0, 0.17, 0]} userData={LIVE} raycast={noRay}>
          <cylinderGeometry args={[0.055, 0.04, 0.03, 16, 1, true]} />
          <meshBasicMaterial color={0x6ab0ff} transparent opacity={0.7} />
        </mesh>
        {/* la casserole, son anse repliée, son couvercle et sa poignée */}
        <Part geo={cyl(0.15, 0.14, 0.16, 28)} m={I.darkSteel} p={[0, 0.27, 0]} />
        {/* la neige qui fond dans la casserole, sous le couvercle entrouvert posé de biais sur le bord */}
        <Part geo={cyl(0.135, 0.135, 0.02, 28)} m={I.snow} p={[0, 0.34, 0]} castShadow={false} />
        <Part geo={SPH} m={I.snow} scale={[0.09, 0.03, 0.08]} p={[-0.03, 0.352, 0.02]} castShadow={false} />
        <group position={[0.05, 0.37, -0.06]} rotation-x={-0.35}>
          <Part geo={cyl(0.155, 0.155, 0.015, 28)} m={I.steel} castShadow={false} />
          <Part geo={SPH} m={I.steel} scale={[0.14, 0.03, 0.14]} p={[0, 0.005, 0]} castShadow={false} />
          <Part geo={SPH} m={I.darkSteel} scale={0.025} p={[0, 0.04, 0]} castShadow={false} />
        </group>
        {/* la cuillère de bois, dans la casserole */}
        <Part geo={cyl(0.01, 0.012, 0.32, 8)} m={I.crate} p={[-0.08, 0.43, 0.05]} rotation={[0.3, 0, 0.55]} castShadow={false} />
        {/* la cartouche de gaz bleue, à côté, et son tuyau jusqu'au brûleur */}
        <group position={[0.2, 0.04, 0.08]}>
          <Part geo={cyl(0.055, 0.055, 0.13, 20)} m={I.gas} p={[0, 0.065, 0]} />
          <Part geo={SPH} m={I.gas} scale={[0.055, 0.03, 0.055]} p={[0, 0.13, 0]} castShadow={false} />
          <Part geo={cyl(0.056, 0.056, 0.04, 20)} m={I.paper} p={[0, 0.06, 0]} castShadow={false} />
          <Part geo={cyl(0.015, 0.015, 0.03, 10)} m={I.darkSteel} p={[0, 0.16, 0]} castShadow={false} />
        </group>
        <Part geo={cyl(0.008, 0.008, 0.2, 6)} m={I.rubber} p={[0.11, 0.17, 0.05]} rotation={[0, 0.4, 1.25]} castShadow={false} />
        {/* la boîte d'allumettes sur la planchette */}
        <group position={[-0.17, 0.045, 0.12]} rotation-y={0.4}>
          <Part geo={rbox(0.07, 0.02, 0.045, 0.004)} m={I.rust} p={[0, 0.01, 0]} castShadow={false} />
          <Part geo={rbox(0.072, 0.004, 0.03, 0.001)} m={I.paper} p={[0, 0.021, 0]} castShadow={false} />
        </group>
        <Part m={I.darkSteel} p={[0, 0.3, 0]} rotation-y={0.4} castShadow={false}>
          <torusGeometry args={[0.165, 0.007, 6, 24, Math.PI]} />
        </Part>
      </group>
      <group ref={steam.group} />
    </>
  )
}

/** La caisse de vivres au fond à droite, ses planches et son couvercle de corde : la lampe tempête est posée dessus. */
export function SupplyCrate({ position, ry = 0, top = 0.5 }: { position: V3; ry?: number; top?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Part geo={rbox(0.6, top - 0.02, 0.44, 0.03)} m={I.crate} p={[0, (top - 0.02) / 2, 0]} />
      {[0.12, 0.26, 0.4].filter((y) => y < top - 0.06).map((y) => (
        <Part key={y} geo={rbox(0.62, 0.015, 0.46, 0.006)} m={I.crateDark} p={[0, y, 0]} castShadow={false} />
      ))}
      <Part geo={rbox(0.64, 0.03, 0.48, 0.012)} m={I.crateDark} p={[0, top - 0.015, 0]} castShadow={false} />
      {/* le pochoir, sur la face avant */}
      <mesh material={I.stencil} position={[0, top * 0.5, 0.236]}>
        <planeGeometry args={[0.44, 0.22]} />
      </mesh>
      {/* les poignées de corde sur les flancs */}
      {[-1, 1].map((s) => (
        <Part key={s} m={I.rope} p={[s * 0.31, top * 0.62, 0]} rotation-y={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.06, 0.012, 6, 14, Math.PI]} />
        </Part>
      ))}
    </group>
  )
}

/** Une paire de raquettes à neige appuyée contre la paroi : le cadre de bois ovale, le laçage, la fixation de cuir. */
export function Snowshoes({ a }: { a: number }) {
  return (
    <group position={polar(a, 2.72, 0)} rotation-y={along(a)}>
      {[-0.17, 0.17].map((x, i) => (
        <group key={x} position={[x, 0.42, 0]} rotation={[-0.22, 0, i ? 0.06 : -0.06]} scale={0.85}>
          <Part m={I.wood} scale={[0.15, 0.4, 1]}>
            <torusGeometry args={[1, 0.06, 8, 28]} />
          </Part>
          {/* le laçage de babiche : un treillis serré de brins clairs, bien visible dans le cadre sombre */}
          {[-0.27, -0.18, -0.09, 0, 0.09, 0.18, 0.27].map((y) => (
            <Part key={y} geo={cyl(0.009, 0.009, 0.28 * Math.sqrt(1 - (y / 0.4) ** 2), 4)} m={I.rope} p={[0, y, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          ))}
          {[-0.07, 0, 0.07].map((x2) => (
            <Part key={x2} geo={cyl(0.009, 0.009, 0.74 * Math.sqrt(1 - (x2 / 0.15) ** 2), 4)} m={I.rope} p={[x2, 0, 0]} castShadow={false} />
          ))}
          <Part geo={rbox(0.12, 0.06, 0.03, 0.01)} m={I.leatherDark} p={[0, 0.05, 0.015]} castShadow={false} />
          {/* la queue de la raquette : les deux bois du cadre se rejoignent en bas, liés par une lanière */}
          {[-1, 1].map((s) => (
            <Part key={s} geo={cyl(0.012, 0.012, 0.26, 6)} m={I.wood} p={[s * 0.04, -0.5, 0]} rotation-z={-s * 0.28} castShadow={false} />
          ))}
          <Part geo={rbox(0.05, 0.03, 0.03, 0.01)} m={I.leatherDark} p={[0, -0.61, 0]} castShadow={false} />
          {/* la sangle du talon, en travers */}
          <Part geo={rbox(0.2, 0.02, 0.025, 0.006)} m={I.leatherDark} p={[0, -0.02, 0.02]} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

/** Le sac d'expédition, debout contre la paroi : toile kaki, rabat, sangles de cuir, le tapis de sol roulé sur le dessus. */
export function Backpack({ a }: { a: number }) {
  return (
    <group position={polar(a, 2.55, 0)} rotation-y={along(a) + Math.PI} rotation-x={0}>
      <group rotation-x={0.12}>
        <Part geo={rbox(0.44, 0.58, 0.28, 0.1)} m={I.canvas} p={[0, 0.29, 0]} />
        <Part geo={rbox(0.42, 0.2, 0.3, 0.07)} m={I.canvas} p={[0, 0.52, 0.02]} />
        <Part geo={rbox(0.3, 0.16, 0.08, 0.04)} m={I.canvas} p={[0, 0.2, 0.16]} />
        {[-0.1, 0.1].map((x) => (
          <Part key={x} geo={rbox(0.035, 0.3, 0.02, 0.008)} m={I.leatherDark} p={[x, 0.42, 0.16]} castShadow={false} />
        ))}
        {/* les boucles de laiton des sangles */}
        {[-0.1, 0.1].map((x) => (
          <Part key={x} geo={rbox(0.045, 0.03, 0.02, 0.006)} m={I.brass} p={[x, 0.3, 0.17]} castShadow={false} />
        ))}
        {/* la gourde dans sa poche de côté, le mousqueton accroché à la bretelle */}
        <Part geo={cyl(0.05, 0.05, 0.22, 14)} m={I.thermos} p={[0.25, 0.25, 0.02]} />
        <Part geo={cyl(0.03, 0.03, 0.04, 10)} m={I.darkSteel} p={[0.25, 0.38, 0.02]} castShadow={false} />
        <Part geo={rbox(0.1, 0.12, 0.2, 0.03)} m={I.canvas} p={[0.24, 0.16, 0.02]} castShadow={false} />
        <Part m={I.brass} p={[-0.24, 0.45, 0.05]} rotation-y={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.03, 0.006, 6, 14]} />
        </Part>
        {/* le piolet sanglé dans le dos du sac : son manche, sa tête de métal */}
        <group position={[-0.08, 0.38, 0.2]} rotation-z={0.15}>
          <Part geo={cyl(0.014, 0.016, 0.62, 8)} m={I.wood} castShadow={false} />
          <Part geo={rbox(0.2, 0.035, 0.03, 0.01)} m={I.steel} p={[0, 0.3, 0]} castShadow={false} />
        </group>
        {/* le tapis de sol roulé, sangle autour */}
        <Part geo={cyl(0.09, 0.09, 0.5, 18)} m={I.rust} p={[0, 0.71, 0]} rotation-z={Math.PI / 2} />
        <Part m={I.leatherDark} p={[0.12, 0.71, 0]} rotation-y={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.093, 0.01, 6, 18]} />
        </Part>
      </group>
    </group>
  )
}

/**
 * Une niche creusée dans la paroi au-dessus de la banquette, une bougie dedans : sa petite lueur chaude sur la neige. Pas de
 * lumière (la lampe tempête suffit) : un halo seulement.
 */
export function IceNiche({ a, y }: { a: number; y: number }) {
  const g = useRef<Group>(null!), glow = useRef<{ material: { opacity: number } }>(null!), ph = useRef(rand(0, 9))
  const r = Math.sqrt(3.0 * 3.0 - y * y) - 0.03
  useLayoutEffect(() => g.current.lookAt(0, y * 0.6, 0), [y])
  useFrame((_, delta) => {
    if (!reduceMotion) ph.current += Math.min(delta, 0.05) * 6
    glow.current.material.opacity = 0.55 + Math.sin(ph.current) * 0.06
  })
  return (
    <group ref={g} position={polar(a, r, y)} userData={LIVE}>
      {/* le creux, plus bleu, avec son petit rebord */}
      <mesh material={I.niche} position={[0, 0, 0.03]}>
        <circleGeometry args={[0.2, 24]} />
      </mesh>
      <Part geo={rbox(0.36, 0.04, 0.12, 0.02)} m={I.snow} p={[0, -0.16, 0.08]} castShadow={false} />
      {/* la bougie et sa flamme */}
      <Part geo={cyl(0.035, 0.035, 0.12, 14)} m={I.wool} p={[0, -0.08, 0.09]} castShadow={false} />
      <Part geo={SPH} m={I.flame} scale={[0.014, 0.03, 0.014]} p={[0, 0.0, 0.09]} castShadow={false} />
      <sprite ref={glow as never} scale={0.55} position={[0, 0.0, 0.13]} raycast={noRay}>
        <spriteMaterial map={glowTex} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.5} />
      </sprite>
    </group>
  )
}

/**
 * La patère près de l'entrée : deux chevilles de bois plantées dans la neige, un bonnet de laine bleu à pompon accroché à l'une,
 * une corde d'alpinisme lovée à l'autre.
 */
export function Pegs({ a, y }: { a: number; y: number }) {
  const r = Math.sqrt(3.0 * 3.0 - y * y) - 0.02
  return (
    <group position={polar(a, r, y)} rotation-y={along(a)}>
      {[-0.22, 0.22].map((x) => (
        <Part key={x} geo={cyl(0.022, 0.026, 0.16, 8)} m={I.wood} p={[x, 0, 0.07]} rotation-x={Math.PI / 2 - 0.25} castShadow={false} />
      ))}
      {/* le bonnet : la calotte, le revers côtelé, le pompon */}
      <group position={[-0.22, -0.1, 0.12]}>
        <Part geo={SPH} m={I.hat} scale={[0.11, 0.1, 0.06]} p={[0, -0.02, 0]} />
        <Part geo={cyl(0.1, 0.1, 0.05, 18)} m={I.wool} p={[0, -0.1, 0]} rotation-x={0.25} castShadow={false} />
        <Part geo={SPH} m={I.wool} scale={0.045} p={[0, 0.08, 0]} castShadow={false} />
      </group>
      {/* la corde lovée, pendue à sa cheville */}
      {[0.13, 0.115, 0.1].map((rr, i) => (
        <Part key={rr} m={I.orange} p={[0.22, -0.12 - i * 0.012, 0.12 + i * 0.012]} castShadow={false}>
          <torusGeometry args={[rr, 0.014, 6, 20]} />
        </Part>
      ))}
    </group>
  )
}
