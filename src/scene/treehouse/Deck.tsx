import { useMemo } from 'react'
import { ExtrudeGeometry, Path, Shape, ShapeGeometry, Vector3 } from 'three'
import { rb } from './box'
import { SPH_MID as SPH } from '../igloo/spheres'
import { Part, cyl, rrPath, worldUV, type V3 } from '../parts'
import { puff } from '../igloo/puff'
import { T } from './materials'
import { BRIDGE, DECK, LADDER, LIMB, POSTS, ROOF, TRUNK, roofY } from './layout'

const HOLE = TRUNK.r + 0.09 // le jour laissé autour du tronc : le chêne grandit, la cabane ne le serre pas

/** Le plancher percé pour le tronc : la dalle (ses chants) et le dessus de planches (un plan, pour que la texture garde sa taille). */
function deckGeos() {
  const { x0, x1, z0, z1, t } = DECK
  // la forme est dans le plan (x, -z) : tournée de -90° autour de x, elle se couche à plat
  const outline = () => {
    const s = rrPath(new Shape(), x0, -z1, x1 - x0, z1 - z0, 0.12)
    s.holes.push(new Path().absarc(TRUNK.x, -TRUNK.z, HOLE, 0, Math.PI * 2, true))
    s.holes.push(new Path().absarc(LIMB.x, -LIMB.z, LIMB.r + 0.1, 0, Math.PI * 2, true))
    return s
  }
  const slab = new ExtrudeGeometry(outline(), { depth: t, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.025, bevelSegments: 2, curveSegments: 24 })
  const top = new ShapeGeometry(outline(), 24)
  // UV du dessus en unités de la pièce : une tuile de planches tous les deux mètres
  const uv = top.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) / 2, uv.getY(i) / 2)
  return { slab, top }
}

/** Une corde qui pend entre deux points, avec sa flèche. */
export function sagRope(a: V3, b: V3, sag: number, r = 0.014, n = 14) {
  const pts = Array.from({ length: n + 1 }, (_, i) => {
    const u = i / n
    return new Vector3(a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u - sag * 4 * u * (1 - u), a[2] + (b[2] - a[2]) * u)
  })
  return puff(pts, () => r, { n: n * 2, radial: 6 })
}

/** Un poteau de garde-corps : bois équarri, chapeau arrondi. */
function Post({ x, z, h = 0.95 }: { x: number; z: number; h?: number }) {
  return (
    <>
      <Part geo={rb(0.12, h, 0.12, 0.03)} m={T.beam} p={[x, h / 2, z]} />
      <Part geo={rb(0.15, 0.04, 0.15, 0.015)} m={T.plankDark} p={[x, h + 0.01, z]} castShadow={false} />
    </>
  )
}

/**
 * La plateforme dans le chêne : le plancher de planches blondes percé pour le tronc, sa rive, les solives dont les bouts dépassent
 * dessous, le garde-corps de planches au fond et à gauche, celui de droite ouvert sur l'échelle de corde, la main courante de corde
 * sur le devant, et le toit en appentis de bardeaux terracotta sur la bande du fond, porté par quatre poteaux et percé pour le tronc.
 */
export function Deck() {
  const { slab, top } = useMemo(deckGeos, [])
  const { x0, x1, z0, z1, t } = DECK
  const ropes = useMemo(() => {
    const y = [0.48, 0.86]
    const front: [V3, V3][] = [
      [[-3.0, 0, 2.9], [-0.05, 0, 2.9]],
      [[-0.05, 0, 2.9], [2.9, 0, 2.9]],
      [[2.9, 0, 2.9], [2.9, 0, LADDER.z1 + 0.05]],
    ]
    return y.flatMap((h) => front.map(([a, b]) => sagRope([a[0], h, a[2]], [b[0], h, b[2]], 0.09)))
  }, [])
  const { yBack, yFront } = ROOF
  const slope = Math.atan2(yBack - yFront, ROOF.z1 - ROOF.z0)
  const along = (ROOF.z1 - ROOF.z0) / Math.cos(slope)
  // le toit en morceaux, autour du tronc : [x0, x1, z0, z1]
  const gapX0 = TRUNK.x - TRUNK.rTop - 0.16, gapX1 = TRUNK.x + TRUNK.rTop + 0.16
  const pieces: [number, number, number, number][] = [
    [ROOF.x0, gapX0, ROOF.z0, ROOF.z1],
    [gapX1, ROOF.x1, ROOF.z0, ROOF.z1],
    [gapX0, gapX1, ROOF.z0, TRUNK.z - TRUNK.rTop - 0.16],
    [gapX0, gapX1, TRUNK.z + TRUNK.rTop + 0.16, ROOF.z1],
  ]
  return (
    <>
      {/* la dalle du plancher et ses chants, le dessus de planches */}
      <Part m={T.plank} geometry={slab} p={[0, -t - 0.025, 0]} rotation-x={-Math.PI / 2} />
      <mesh geometry={top} material={T.deck} position={[0, 0.003, 0]} rotation-x={-Math.PI / 2} receiveShadow />
      {/* la rive : une planche de chant le long des deux bords qu'on voit */}
      <Part geo={worldUV(rb(0.06, 0.2, z1 - z0 - 0.1, 0.02), 1)} m={T.boards} p={[x1 + 0.02, -0.09, (z0 + z1) / 2]} castShadow={false} />
      <Part geo={worldUV(rb(x1 - x0 - 0.1, 0.2, 0.06, 0.02), 1)} m={T.boards} p={[(x0 + x1) / 2, -0.09, z1 + 0.02]} castShadow={false} />
      {/* les solives dessous, le long de z, dont les bouts dépassent du bord de devant ; deux poutres maîtresses le long de x */}
      {[-2.3, -0.8, 0.7, 2.2].map((x) => (
        <Part key={x} geo={rb(0.14, 0.2, z1 - z0 + 0.3, 0.03)} m={T.beam} p={[x, -0.3, (z0 + z1) / 2 + 0.1]} />
      ))}
      {[-1.6, 1.4].map((z) => (
        <Part key={z} geo={rb(x1 - x0 + 0.3, 0.24, 0.18, 0.04)} m={T.beam} p={[(x0 + x1) / 2 + 0.1, -0.52, z]} />
      ))}
      {/* le garde-corps du fond : des planches debout, jointives à un doigt près, sur une lisse ; et sa main courante */}
      {Array.from({ length: 22 }, (_, i) => {
        const x = x0 + 0.2 + i * 0.27
        if (Math.abs(x - TRUNK.x) < TRUNK.r + 0.12) return null
        return <Part key={i} geo={rb(0.22, 0.82 + ((i * 7) % 3) * 0.02, 0.04, 0.015)} m={i % 3 ? T.plank : T.plankDark} p={[x, 0.42, z0 + 0.08]} castShadow={i % 2 === 0} />
      })}
      <Part geo={rb(x1 - x0 - 0.2, 0.08, 0.12, 0.03)} m={T.beam} p={[(x0 + x1) / 2, 0.88, z0 + 0.08]} />
      {/* le garde-corps de gauche : poteaux, deux lisses, la main courante (le hamac pend devant) */}
      {[-1.3, 0.35, 2.0].map((z) => <Post key={z} x={x0 + 0.08} z={z} />)}
      <Part geo={rb(0.12, 0.08, z1 - z0 - 1.6, 0.03)} m={T.beam} p={[x0 + 0.08, 0.95, (z1 + z0) / 2 + 0.55]} />
      {[0.32, 0.62].map((y) => (
        <Part key={y} geo={rb(0.05, 0.07, z1 - z0 - 1.6, 0.02)} m={T.plank} p={[x0 + 0.1, y, (z1 + z0) / 2 + 0.55]} castShadow={false} />
      ))}
      {/* le garde-corps de droite, jusqu'à l'ouverture de l'échelle, ouvert aussi sur le pont de corde (ses deux poteaux le tiennent) */}
      {[z0 + 0.1, BRIDGE.z0, BRIDGE.z1, LADDER.z0 - 0.05].map((z) => <Post key={z} x={x1 - 0.1} z={z} />)}
      {[[z0 + 0.1, BRIDGE.z0], [BRIDGE.z1, LADDER.z0 - 0.05]].map(([a, b]) => (
        <Part key={a} geo={rb(0.12, 0.08, b - a + 0.1, 0.03)} m={T.beam} p={[x1 - 0.1, 0.95, (a + b) / 2]} />
      ))}
      {Array.from({ length: 11 }, (_, i) => {
        const z = z0 + 0.32 + i * 0.315
        if (z + 0.1 > BRIDGE.z0 - 0.06 && z - 0.1 < BRIDGE.z1 + 0.06) return null
        return <Part key={i} geo={rb(0.04, 0.78, 0.2, 0.015)} m={i % 4 ? T.plank : T.plankDark} p={[x1 - 0.1, 0.44, z]} castShadow={false} />
      })}
      {/* l'ouverture de l'échelle : ses deux poteaux, la main courante de corde sur le devant */}
      <Post x={x1 - 0.1} z={LADDER.z1 + 0.05} />
      <Post x={-0.05} z={z1 - 0.1} h={0.92} />
      <Post x={x0 + 0.08} z={z1 - 0.1} h={0.92} />
      <Post x={x1 - 0.1} z={z1 - 0.1} h={0.92} />
      {ropes.map((g, i) => <Part key={i} geometry={g} m={T.rope} castShadow={false} />)}
      {/* le toit : ses poteaux, la panne avant, les morceaux de toit autour du tronc (bardeaux dessus, planches dessous) */}
      {POSTS.map(([x, z]) => (
        <Part key={`${x}${z}`} geo={rb(0.13, roofY(z) - 0.12, 0.13, 0.03)} m={T.beam} p={[x, (roofY(z) - 0.12) / 2, z]} />
      ))}
      <Part geo={rb(ROOF.x1 - ROOF.x0 - 0.1, 0.14, 0.12, 0.03)} m={T.beam} p={[(ROOF.x0 + ROOF.x1) / 2, roofY(-1.42) - 0.08, -1.42]} />
      <Part geo={rb(ROOF.x1 - ROOF.x0 - 0.1, 0.14, 0.12, 0.03)} m={T.beam} p={[(ROOF.x0 + ROOF.x1) / 2, roofY(-3.0) - 0.08, -3.0]} />
      {/* deux chevrons sous le toit, du fond à l'avant */}
      {[-0.8, 1.4].map((x) => (
        <Part key={x} geo={rb(0.1, 0.1, along - 0.2, 0.03)} m={T.beam} p={[x, (yBack + yFront) / 2 - 0.08, (ROOF.z0 + ROOF.z1) / 2]} rotation-x={slope} />
      ))}
      {pieces.map(([a, b, c, d]) => {
        const w = b - a, l = (d - c) / Math.cos(slope), z = (c + d) / 2, y = roofY(z)
        return (
          <group key={`${a}${c}`} position={[(a + b) / 2, y + ROOF.t / 2, z]} rotation-x={slope}>
            <Part geo={rb(w, ROOF.t, l, 0.03)} m={T.plank} />
            <mesh material={T.shingles} position={[0, ROOF.t / 2 + 0.004, 0]} rotation-x={-Math.PI / 2} receiveShadow castShadow>
              <planeGeometry args={[w - 0.02, l - 0.02]} />
            </mesh>
          </group>
        )
      })}
      {/* la planche de rive du toit, devant et à droite, et le faîtage du fond */}
      <Part geo={rb(ROOF.x1 - ROOF.x0 + 0.06, 0.16, 0.05, 0.02)} m={T.ridge} p={[(ROOF.x0 + ROOF.x1) / 2, yFront + 0.05, ROOF.z1 + 0.02]} castShadow={false} />
      <group position={[ROOF.x1 + 0.02, (yBack + yFront) / 2 + 0.05, (ROOF.z0 + ROOF.z1) / 2]} rotation-x={slope}>
        <Part geo={rb(0.05, 0.16, along + 0.06, 0.02)} m={T.ridge} castShadow={false} />
      </group>
      {/* le collier de mousse autour du tronc, là où il sort du toit */}
      <Part geo={cyl(TRUNK.rTop + 0.06, TRUNK.rTop + 0.1, 0.06, 20)} m={T.moss} p={[TRUNK.x, roofY(TRUNK.z) + 0.06, TRUNK.z]} rotation-x={slope} castShadow={false} />
      {/* un nœud de corde au poteau de l'échelle */}
      <Part geo={SPH} m={T.rope} scale={[0.07, 0.05, 0.07]} p={[x1 - 0.1, 0.7, LADDER.z1 + 0.05]} castShadow={false} />
    </>
  )
}

/** L'échelle de corde qui pend du bord de droite, dans l'ouverture du garde-corps : deux cordes, des barreaux de bois rond. */
export function RopeLadder() {
  const x = DECK.x1 + 0.1, zA = LADDER.z0 + 0.2, zB = LADDER.z1 - 0.2
  const sides = useMemo(
    () => [zA, zB].map((z) => puff([new Vector3(x - 0.12, 0.05, z), new Vector3(x + 0.03, -0.12, z), new Vector3(x + 0.06, -1.2, z), new Vector3(x + 0.04, -2.4, z)], () => 0.016, { n: 30, radial: 6 })),
    [x, zA, zB],
  )
  return (
    <>
      {sides.map((g, i) => <Part key={i} geometry={g} m={T.rope} castShadow={false} />)}
      {Array.from({ length: 7 }, (_, i) => {
        const y = -0.35 - i * 0.3
        return (
          <group key={i} position={[x + 0.055, y, (zA + zB) / 2]}>
            <Part geo={cyl(0.03, 0.03, zB - zA + 0.1, 10)} m={i === 3 ? T.plankDark : T.plank} rotation-x={Math.PI / 2} />
            {[zA, zB].map((z) => <Part key={z} geo={SPH} m={T.rope} scale={0.035} p={[0, 0, z - (zA + zB) / 2]} castShadow={false} />)}
          </group>
        )
      })}
    </>
  )
}
