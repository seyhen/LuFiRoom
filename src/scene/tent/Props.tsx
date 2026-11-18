import { useEffect, useMemo } from 'react'
import { BufferGeometry, CatmullRomCurve3, CircleGeometry, Color, DoubleSide, ExtrudeGeometry, Float32BufferAttribute, Shape, ShapeGeometry, TubeGeometry, Vector3 } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { Garment } from '../objects/Garment'
import { Part, SPH, cyl, noRay, orient, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { gummy } from '../materials'
import { onCanvas } from './shape'
import { T } from './materials'

const KILIM = new CircleGeometry(1.28, 56)

/** Le kilim rond sous le mât, bords un peu relevés d'usure : un disque à peine au-dessus de la toile de sol. */
export function Kilim({ position }: { position: V3 }) {
  return <mesh geometry={KILIM} material={T.kilim} position={position} rotation-x={-Math.PI / 2} rotation-z={0.4} receiveShadow raycast={noRay} />
}

/**
 * Le sac à dos, adossé à la toile du fond : un corps de toile verte aux coins arrondis, un rabat sur le dessus, une poche avant
 * et deux poches latérales (une gourde dans l'une), deux sangles à boucle de laiton, un rouleau de tapis de sol dessous, un quart
 * émaillé pendu à un mousqueton. Face à la caméra : `ry` = π/4 regarde vers (+x, +z).
 */
export function Rucksack({ position, ry = Math.PI / 4 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Static>
        <Part geo={rbox(0.54, 0.68, 0.34, 0.14)} m={T.pack} p={[0, 0.5, 0]} />
        <Part geo={rbox(0.56, 0.16, 0.37, 0.07)} m={T.packDark} p={[0, 0.88, 0]} />
        <Part geo={rbox(0.44, 0.36, 0.1, 0.05)} m={T.packDark} p={[0, 0.4, 0.2]} />
        <Part geo={rbox(0.15, 0.05, 0.05, 0.02)} m={T.packDark} p={[0, 0.46, 0.26]} castShadow={false} />
        {[-1, 1].map((s) => <Part key={s} geo={rbox(0.12, 0.34, 0.14, 0.05)} m={T.packDark} p={[s * 0.31, 0.3, 0.05]} />)}
        {/* la gourde dans la poche de droite */}
        <Part geo={cyl(0.045, 0.045, 0.2, 14)} m={T.enamelBlue} p={[0.31, 0.5, 0.05]} castShadow={false} />
        <Part geo={cyl(0.03, 0.04, 0.03, 12)} m={T.tin} p={[0.31, 0.615, 0.05]} castShadow={false} />
        {/* les sangles : un ruban rouille, une boucle de laiton */}
        {[-0.12, 0.12].map((x) => (
          <group key={x}>
            <Part geo={rbox(0.04, 0.5, 0.012, 0.004)} m={T.strap} p={[x, 0.58, 0.178]} castShadow={false} />
            <Part geo={rbox(0.05, 0.035, 0.016, 0.005)} m={T.brass} p={[x, 0.62, 0.187]} castShadow={false} />
          </group>
        ))}
        {/* le rouleau de tapis de sol sous le sac, retenu par deux lanières */}
        <Part geo={cyl(0.075, 0.075, 0.52, 18)} m={T.mat} p={[0, 0.085, 0.02]} rotation-z={Math.PI / 2} />
        {[-0.14, 0.14].map((x) => <Part key={x} geo={cyl(0.079, 0.079, 0.03, 18)} m={T.strap} p={[x, 0.085, 0.02]} rotation-z={Math.PI / 2} castShadow={false} />)}
        {/* le quart pendu au mousqueton, sur le flanc */}
        <Part m={T.steel} p={[-0.3, 0.64, 0.04]} castShadow={false}>
          <torusGeometry args={[0.025, 0.005, 6, 14]} />
        </Part>
        <Part geo={cyl(0.04, 0.036, 0.08, 14)} m={T.enamel} p={[-0.3, 0.57, 0.04]} castShadow={false} />
      </Static>
    </group>
  )
}

// La silhouette d'une botte de marche vue de côté (x : vers la pointe, y : vers le haut) : talon, semelle, bout rond, cou-de-pied qui
// monte vers la tige, tige haute ; épaissie sur 7 cm avec des bords arrondis (comme `Garment`, c'est le contour qui fait reconnaître l'objet).
const BOOT = (() => {
  const s = new Shape()
  s.moveTo(-0.15, 0.03)
  s.lineTo(0.12, 0.03)
  s.quadraticCurveTo(0.21, 0.03, 0.21, 0.085)
  s.quadraticCurveTo(0.21, 0.14, 0.12, 0.16)
  s.lineTo(0.03, 0.2)
  s.lineTo(0.03, 0.36)
  s.lineTo(-0.12, 0.36)
  s.lineTo(-0.14, 0.15)
  s.closePath()
  const g = new ExtrudeGeometry(s, { depth: 0.07, bevelEnabled: true, bevelThickness: 0.025, bevelSize: 0.022, bevelSegments: 3, curveSegments: 8 })
  g.translate(0, 0, -0.035)
  return g
})()

/** Une botte de marche, la pointe vers +z : le cuir, la semelle crantée et le talon, les lacets sur le cou-de-pied, une chaussette qui dépasse, de la boue. */
function Boot({ mud = 1, sock = false }: { mud?: number; sock?: boolean }) {
  return (
    <>
      <mesh geometry={BOOT} material={T.leather} rotation-y={-Math.PI / 2} castShadow receiveShadow />
      <Part geo={rbox(0.14, 0.036, 0.42, 0.016)} m={T.sole} p={[0, 0.018, 0.03]} castShadow={false} />
      <Part geo={rbox(0.14, 0.05, 0.1, 0.016)} m={T.sole} p={[0, 0.035, -0.115]} castShadow={false} />
      {[0.1, 0.065, 0.03].map((z) => <Part key={z} geo={rbox(0.085, 0.008, 0.014, 0.003)} m={T.lace} p={[0, 0.186 + (0.12 - z) * 0.444, z]} rotation-x={0.42} castShadow={false} />)}
      <Part geo={rbox(0.09, 0.07, 0.014, 0.006)} m={T.leatherDark} p={[0, 0.31, 0.062]} castShadow={false} />
      {sock && (
        <>
          <Part geo={cyl(0.05, 0.05, 0.13, 14)} m={T.woolCream} p={[0, 0.42, -0.04]} rotation={[0.18, 0, 0.1]} castShadow={false} />
          <Part geo={cyl(0.054, 0.054, 0.03, 14)} m={T.wool} p={[0, 0.465, -0.05]} rotation={[0.18, 0, 0.1]} castShadow={false} />
        </>
      )}
      {mud > 0 && <Part geo={SPH} m={T.earth} scale={[0.05, 0.022, 0.07]} p={[0, 0.045, 0.13]} castShadow={false} />}
    </>
  )
}

/** Deux bottes boueuses près de l'entrée : l'une debout (une chaussette de laine qui en dépasse), l'autre couchée sur le flanc, un peu en avant. */
export function Boots({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Static>
        <group rotation-y={0.3}>
          <Boot sock />
        </group>
        <group position={[0.3, 0.094, 0.1]} rotation={[0, -0.6, Math.PI / 2]}>
          <Boot mud={0} />
        </group>
        {/* la flaque de boue séchée devant */}
        <Part geo={cyl(0.2, 0.2, 0.004, 20)} m={T.earth} scale={[1.5, 1, 1.1]} p={[0.12, 0.008, 0.12]} castShadow={false} />
      </Static>
    </group>
  )
}

/** Le ciré jaune qui sèche au bras de fer du mât : un manteau suspendu, ses poches, sa capuche, et la flaque calme dessous. */
export function RainJacket({ position }: { position: V3 }) {
  const arm: V3 = [0, position[1] + 0.03, 0], hook: V3 = [position[0], position[1] + 0.03, position[2]]
  return (
    <>
      <Part geo={cyl(0.011, 0.011, Math.hypot(position[0], position[2]), 8)} m={T.iron} p={[position[0] / 2, arm[1], position[2] / 2]} rotation={orient([position[0], 0, position[2]])} castShadow={false} />
      <Part geo={cyl(0.06, 0.06, 0.05, 14)} m={T.iron} p={arm} castShadow={false} />
      <Part m={T.iron} p={[hook[0], hook[1] - 0.012, hook[2]]} castShadow={false}>
        <torusGeometry args={[0.022, 0.006, 6, 12]} />
      </Part>
      <Garment kind="coat" p={position} r={[0, Math.PI / 4, 0]} s={0.82} m={T.jacket}>
        <Part geo={rbox(0.12, 0.13, 0.02, 0.008)} m={T.jacketDark} p={[-0.1, -0.5, 0.05]} castShadow={false} />
        <Part geo={rbox(0.12, 0.13, 0.02, 0.008)} m={T.jacketDark} p={[0.1, -0.5, 0.05]} castShadow={false} />
        <Part geo={rbox(0.014, 0.74, 0.02, 0.006)} m={T.jacketDark} p={[0, -0.4, 0.052]} castShadow={false} />
        <Part m={T.jacketDark} p={[0, 0.0, 0.0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.07, 0.03, 8, 16]} />
        </Part>
      </Garment>
      {/* la flaque calme sous le ciré : de l'eau posée sur la toile de sol, un reflet, aucune goutte qui tombe */}
      <Part geo={cyl(0.2, 0.2, 0.004, 24)} m={T.puddle} scale={[1.2, 1, 0.85]} p={[position[0] + 0.05, 0.011, position[2] - 0.05]} castShadow={false} />
    </>
  )
}

/** Un tabouret pliant à trois pieds de bois et une assise de toile, près du couchage. */
export function Stool({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Static>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.4, t = 0.32
          return <Part key={i} geo={cyl(0.017, 0.02, 0.46, 8)} m={T.pole} p={[Math.cos(a) * 0.13, 0.22, Math.sin(a) * 0.13]} rotation={[-Math.sin(a) * t, 0, Math.cos(a) * t]} castShadow={false} />
        })}
        <Part geo={cyl(0.19, 0.19, 0.03, 3)} m={T.pack} p={[0, 0.44, 0]} rotation-y={0.4} />
        <Part geo={cyl(0.2, 0.2, 0.012, 3)} m={T.packDark} p={[0, 0.428, 0]} rotation-y={0.4} castShadow={false} />
        <Part geo={SPH} m={T.iron} scale={0.026} p={[0, 0.41, 0]} castShadow={false} />
      </Static>
    </group>
  )
}

/**
 * La pochette de rangement cousue sur le mur de toile, quatre poches : une lampe de poche rouge, un crayon, un rouleau de carte, un
 * livre de poche. `phi` est l'angle sur la toile, `y` la hauteur du centre ; elle suit le mur droit (sous 1,1 m).
 */
export function WallPocket({ phi, y = 0.82 }: { phi: number; y?: number }) {
  const [x, , z] = onCanvas(phi, y, 0.03)
  return (
    <group position={[x, y, z]} rotation-y={phi + Math.PI}>
      <mesh material={T.pocket} receiveShadow raycast={noRay}>
        <planeGeometry args={[0.68, 0.51]} />
      </mesh>
      <Static>
        {/* les poches débordent : une lampe de poche (corps rouge, tête de laiton), un crayon, une carte roulée, un livre */}
        <Part geo={cyl(0.027, 0.027, 0.22, 12)} m={T.canister} p={[-0.255, 0.0, 0.03]} castShadow={false} />
        <Part geo={cyl(0.04, 0.032, 0.06, 12)} m={T.brass} p={[-0.255, 0.12, 0.03]} castShadow={false} />
        <Part geo={cyl(0.007, 0.007, 0.26, 6)} m={T.pencil} p={[-0.085, 0.01, 0.03]} rotation-z={0.12} castShadow={false} />
        <Part geo={cyl(0.03, 0.03, 0.3, 12)} m={T.paper} p={[0.085, 0.02, 0.03]} rotation-z={-0.1} castShadow={false} />
        <Part geo={rbox(0.12, 0.2, 0.03, 0.008)} m={T.wool} p={[0.255, 0.01, 0.026]} rotation-z={0.06} castShadow={false} />
        <Part geo={rbox(0.1, 0.016, 0.032, 0.006)} m={T.paper} p={[0.255, 0.09, 0.028]} rotation-z={0.06} castShadow={false} />
      </Static>
    </group>
  )
}

/** Une carte du coin pliée, punaisée à la toile par quatre punaises rouges : courbes de niveau, un lac, un sentier pointillé. */
export function PinnedMap({ phi, y = 0.88 }: { phi: number; y?: number }) {
  const [x, , z] = onCanvas(phi, y, 0.02)
  return (
    <group position={[x, y, z]} rotation-y={phi + Math.PI} rotation-z={0.04}>
      <mesh material={T.map} receiveShadow raycast={noRay}>
        <planeGeometry args={[0.5, 0.375]} />
      </mesh>
      {[[-0.22, 0.16], [0.22, 0.16], [-0.22, -0.16], [0.22, -0.16]].map(([px, py], i) => <Part key={i} geo={SPH} m={T.match} scale={[0.014, 0.014, 0.01]} p={[px, py, 0.01]} castShadow={false} />)}
    </group>
  )
}

const FLAG_COLORS = [0xd9a441, 0xb5562e, 0x5f7e4a, 0xefe3c4, 0x3f6f7a, 0xd9a441, 0xb5562e, 0x5f7e4a, 0xefe3c4, 0x3f6f7a, 0xd9a441, 0xb5562e, 0x5f7e4a]
const FLAG_MAT = gummy(0xffffff, { vertexColors: true, roughness: 0.9, clearcoat: 0, side: DoubleSide })

/** La guirlande de fanions cousue : une ficelle en trois festons le long de la toile du fond, treize fanions qui pendent. */
export function Bunting({ from, to }: { from: number; to: number }) {
  const { cord, flags } = useMemo(() => {
    const yAt = (t: number) => 1.78 - 0.2 * Math.abs(Math.sin(3 * Math.PI * t))
    const at = (t: number): V3 => {
      const phi = from + (to - from) * t, y = yAt(t), [x, , z] = onCanvas(phi, y, 0.05)
      return [x, y, z]
    }
    const curve = new CatmullRomCurve3(Array.from({ length: 49 }, (_, i) => new Vector3(...at(i / 48))))
    const cord = new TubeGeometry(curve, 96, 0.009, 5, false)
    const tri = new Shape()
    tri.moveTo(-0.085, 0); tri.lineTo(0.085, 0); tri.lineTo(0, -0.24); tri.closePath()
    const parts: BufferGeometry[] = []
    FLAG_COLORS.forEach((hex, i) => {
      const t = (i + 0.5) / FLAG_COLORS.length, [x, y, z] = at(t), g = new ShapeGeometry(tri)
      const col = new Color(hex), n = g.attributes.position.count, c = new Float32Array(n * 3)
      for (let k = 0; k < n; k++) c.set([col.r, col.g, col.b], k * 3)
      g.setAttribute('color', new Float32BufferAttribute(c, 3))
      g.rotateZ(Math.sin(i * 2.3) * 0.12)
      g.rotateY(from + (to - from) * t + Math.PI + Math.sin(i * 1.7) * 0.08)
      g.translate(x, y - 0.01, z)
      parts.push(g)
    })
    return { cord, flags: mergeGeometries(parts)! }
  }, [from, to])
  useEffect(() => () => { cord.dispose(); flags.dispose() }, [cord, flags])
  return (
    <>
      <mesh geometry={cord} material={T.rope} raycast={noRay} />
      <mesh geometry={flags} material={FLAG_MAT} raycast={noRay} />
    </>
  )
}

