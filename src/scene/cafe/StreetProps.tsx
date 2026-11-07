import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, BackSide, BoxGeometry, BufferGeometry, Color, Float32BufferAttribute, type PointsMaterial } from 'three'
import { smooth } from '../../math'
import { seeded } from '../paint'
import { Batch, Part, cyl, noRay, type Item, type V3 } from '../parts'
import { gummy } from '../materials'
import { Foliage } from '../nature/Foliage'
import { Vessel } from '../igloo/Vessel'
import { mood, useWorldPointSize } from '../anim'
import { K } from './materials'
import { B, Box, LAMP_A, LAMP_B, LOW, Link, SW } from './streetKit'
import { S } from './streetMaterials'
import { coldGlowTex } from './textures'

// Le mobilier du trottoir : deux réverbères de fonte, le vélo attaché au premier, la poubelle verte, la boîte aux lettres, le banc, la
// charrette du relieur, l'ardoise du café, les jardinières de bruyère et de chardons, les fûts du pub. Tout reste bas (moins de
// 1,2) devant la salle : le café se voit par-dessus, et rien ne couvre ses boutons.

const wickerInner = gummy(0x8f6040, { roughness: 0.7, side: BackSide })
const LIGHT_DAY = new Color(0xc9d4de), LIGHT_NIGHT = new Color(0xf2f6ff)
const H = 3.2

/** Le verre des deux lanternes : éteint le jour, blanc froid la nuit (et sous la pluie, il fait sombre). */
function tickGlass() {
  const n = smooth(mood.night), wet = mood.rain
  S.glass.color.copy(LIGHT_DAY).lerp(LIGHT_NIGHT, Math.max(n, wet * 0.5))
  return 0.12 + wet * 0.12 + n * 0.55
}

/**
 * Les halos froids des deux réverbères de la rue, en un seul tracé (un nuage de points, comme `GlowPoints`, mais avec la texture
 * froide du café : `GlowPoints` n'a que le halo chaud).
 */
function Halos() {
  const mat = useRef<PointsMaterial>(null!)
  const geo = useMemo(() => {
    const g = new BufferGeometry()
    g.setAttribute('position', new Float32BufferAttribute([LAMP_A, LAMP_B].flatMap(([x, z]) => [x, SW + H + 0.27, z + 0.05]), 3))
    return g
  }, [])
  useWorldPointSize(mat, 2.8)
  useFrame(() => {
    mat.current.opacity = tickGlass()
  })
  return (
    <points geometry={geo} frustumCulled={false} raycast={noRay}>
      <pointsMaterial ref={mat} map={coldGlowTex} size={10} sizeAttenuation={false} transparent depthWrite={false} blending={AdditiveBlending} opacity={0} />
    </points>
  )
}

/** Un réverbère de fonte noire à lanterne, comme celui de la vitre : fût cannelé, échelle de l'allumeur, lanterne à quatre vitres. */
function Post({ at }: { at: [number, number] }) {
  return (
    <group position={[at[0], SW, at[1]]} raycast={noRay}>
      <Part geo={cyl(0.13, 0.18, 0.16, 18)} m={K.iron} p={[0, 0.08, 0]} castShadow={false} raycast={noRay} />
      <Part geo={cyl(0.085, 0.13, 0.46, 18)} m={K.iron} p={[0, 0.38, 0]} castShadow={false} raycast={noRay} />
      <Part geo={cyl(0.1, 0.1, 0.05, 18)} m={K.iron} p={[0, 0.63, 0]} castShadow={false} raycast={noRay} />
      <Part geo={cyl(0.042, 0.06, H - 0.62, 14)} m={K.iron} p={[0, 0.62 + (H - 0.62) / 2, 0]} castShadow={false} raycast={noRay} />
      {[1.4, H - 0.32].map((y) => (
        <Part key={y} geo={cyl(0.07, 0.07, 0.05, 14)} m={K.iron} p={[0, y, 0]} castShadow={false} raycast={noRay} />
      ))}
      {/* la barre de l'allumeur, et ses deux boules */}
      <Part geo={cyl(0.014, 0.014, 0.56, 8)} m={K.iron} p={[0, H - 0.42, 0]} rotation-z={Math.PI / 2} castShadow={false} raycast={noRay} />
      {[-1, 1].map((s) => (
        <Part key={s} geo={LOW} m={K.iron} scale={0.032} p={[s * 0.28, H - 0.42, 0]} castShadow={false} raycast={noRay} />
      ))}
      {/* la lanterne : socle, quatre vitres qui s'évasent, montants, chapeau et fleuron */}
      <Part geo={cyl(0.1, 0.06, 0.08, 4)} m={K.iron} p={[0, H + 0.04, 0]} rotation-y={Math.PI / 4} castShadow={false} raycast={noRay} />
      <mesh geometry={cyl(0.17, 0.1, 0.38, 4)} material={S.glass} position={[0, H + 0.27, 0]} rotation-y={Math.PI / 4} raycast={noRay} />
      {[0, 1, 2, 3].map((i) => {
        const a = Math.PI / 4 + (i / 4) * Math.PI * 2
        return <Part key={i} geo={cyl(0.012, 0.012, 0.39, 6)} m={K.iron} p={[Math.cos(a) * 0.137, H + 0.27, Math.sin(a) * 0.137]} rotation={[Math.sin(a) * 0.17, 0, -Math.cos(a) * 0.17]} castShadow={false} raycast={noRay} />
      })}
      <Part geo={cyl(0.07, 0.23, 0.14, 4)} m={K.iron} p={[0, H + 0.53, 0]} rotation-y={Math.PI / 4} castShadow={false} raycast={noRay} />
      <Part geo={LOW} m={K.iron} scale={0.04} p={[0, H + 0.64, 0]} castShadow={false} raycast={noRay} />
    </group>
  )
}

/** Un petit chardon : tige, collerette verte, fleur violette. */
function ThistleStem({ p, h = 0.3, tilt = 0 }: { p: V3; h?: number; tilt?: number }) {
  return (
    <group position={p} rotation-z={tilt}>
      <Part geo={cyl(0.01, 0.012, h, 6)} m={S.fol} p={[0, h / 2, 0]} castShadow={false} raycast={noRay} />
      <Part geo={LOW} m={S.fol} scale={[0.045, 0.035, 0.045]} p={[0, h, 0]} castShadow={false} raycast={noRay} />
      <Part geo={LOW} m={K.burgundy} scale={[0.04, 0.045, 0.04]} p={[0, h + 0.04, 0]} castShadow={false} raycast={noRay} />
    </group>
  )
}

/** Le vélo du libraire, vert d'eau, cadenassé au premier réverbère : roues, cadre, selle de cuir, guidon, panier de osier et chardons. */
function Bicycle() {
  const wheel = (x: number) => (
    <group position={[x, 0.34, 0]}>
      <Part m={K.soot} castShadow={false} raycast={noRay}>
        <torusGeometry args={[0.31, 0.03, 8, 28]} />
      </Part>
      <Part m={K.base} castShadow={false} raycast={noRay}>
        <torusGeometry args={[0.28, 0.012, 6, 28]} />
      </Part>
      {[0, 1, 2].map((i) => (
        <Part key={i} geo={cyl(0.009, 0.009, 0.56, 5)} m={K.base} rotation-z={(i * Math.PI) / 3} castShadow={false} raycast={noRay} />
      ))}
      <Part geo={cyl(0.03, 0.03, 0.07, 10)} m={K.base} rotation-x={Math.PI / 2} castShadow={false} raycast={noRay} />
    </group>
  )
  const BB: V3 = [0, 0.3, 0], ST: V3 = [-0.14, 0.72, 0], HT: V3 = [0.4, 0.74, 0], HB: V3 = [0.43, 0.6, 0], RA: V3 = [-0.55, 0.34, 0], FA: V3 = [0.55, 0.34, 0]
  return (
    <group position={[-3.8, SW, 4.36]} rotation-y={0.1}>
      {wheel(-0.55)}
      {wheel(0.55)}
      {/* le cadre */}
      <Link a={ST} b={BB} m={K.green} r={0.02} />
      <Link a={BB} b={HB} m={K.green} r={0.022} />
      <Link a={ST} b={HT} m={K.green} r={0.02} />
      <Link a={HT} b={HB} m={K.green} r={0.028} />
      <Link a={ST} b={RA} m={K.green} r={0.014} />
      <Link a={BB} b={RA} m={K.green} r={0.014} />
      <Link a={HB} b={FA} m={K.iron} r={0.016} />
      {/* selle de cuir, tige */}
      <Link a={ST} b={[-0.17, 0.86, 0]} m={K.base} r={0.014} />
      <B s={[0.24, 0.05, 0.13]} p={[-0.18, 0.89, 0]} m={K.oak} r={0.022} ry={0.0} rz={0.05} />
      {/* guidon, potence, poignées, sonnette */}
      <Link a={HT} b={[0.37, 0.88, 0]} m={K.base} r={0.014} />
      <Part geo={cyl(0.012, 0.012, 0.5, 8)} m={K.base} p={[0.37, 0.89, 0]} rotation-x={Math.PI / 2} castShadow={false} raycast={noRay} />
      {[-1, 1].map((s) => (
        <Part key={s} geo={cyl(0.02, 0.02, 0.1, 10)} m={K.oak} p={[0.37, 0.89, s * 0.27]} rotation-x={Math.PI / 2} castShadow={false} raycast={noRay} />
      ))}
      <Part geo={LOW} m={K.mustard} scale={0.028} p={[0.37, 0.93, 0.1]} castShadow={false} raycast={noRay} />
      {/* pédalier, manivelle, pédale */}
      <Part geo={cyl(0.075, 0.075, 0.012, 16)} m={K.base} p={[0, 0.3, 0.04]} rotation-x={Math.PI / 2} castShadow={false} raycast={noRay} />
      <Link a={[0, 0.3, 0.06]} b={[0.1, 0.2, 0.08]} m={K.iron} r={0.012} />
      <B s={[0.12, 0.02, 0.07]} p={[0.1, 0.2, 0.11]} m={K.soot} r={0.008} />
      {/* garde-boue arrière et lampe de phare */}
      <Part m={K.green} p={[-0.55, 0.34, 0]} castShadow={false} raycast={noRay}>
        <torusGeometry args={[0.345, 0.014, 6, 16, 1.7]} />
      </Part>
      <Part geo={LOW} m={K.mustard} scale={[0.04, 0.04, 0.05]} p={[0.46, 0.74, 0]} castShadow={false} raycast={noRay} />
      {/* panier d'osier à l'avant, avec trois chardons */}
      <Vessel p={[0.6, 0.66, 0]} rt={0.17} rb={0.13} h={0.17} m={K.oak} inner={wickerInner} t={0.012} />
      <ThistleStem p={[0.58, 0.72, -0.04]} h={0.26} tilt={0.18} />
      <ThistleStem p={[0.62, 0.72, 0.05]} h={0.3} tilt={-0.14} />
      <ThistleStem p={[0.56, 0.72, 0.03]} h={0.2} tilt={0.05} />
      {/* un galet de béquille */}
      <Link a={[0, 0.28, -0.05]} b={[0.04, 0.0, -0.15]} m={K.iron} r={0.012} />
    </group>
  )
}

/** La chaîne antivol qui attache le vélo au réverbère : un anneau autour du fût, des maillons jusqu'à la roue avant. */
function LockChain() {
  const links = 6, [lx, lz] = LAMP_A
  return (
    <group position={[0, SW, 0]}>
      <Part m={K.soot} p={[lx, 0.78, lz]} rotation-x={Math.PI / 2} castShadow={false} raycast={noRay}>
        <torusGeometry args={[0.085, 0.016, 6, 14]} />
      </Part>
      {Array.from({ length: links }, (_, i) => {
        const t = (i + 0.5) / links, x = lx + (-3.25 - lx) * t, z = lz + (4.36 - lz) * t, y = 0.78 - Math.sin(t * Math.PI) * 0.1 - t * 0.3
        return (
          <Part key={i} m={K.soot} p={[x, y, z]} rotation={[i % 2 ? 0 : Math.PI / 2, (i % 2) * 0.4, 0.8]} castShadow={false} raycast={noRay}>
            <torusGeometry args={[0.034, 0.009, 5, 10]} />
          </Part>
        )
      })}
    </group>
  )
}

/** La poubelle de rue : fût vert bouteille, couvercle bombé, collier de laiton, un journal du matin qui dépasse. */
function Bin() {
  return (
    <group position={[-5.6, SW, 4.6]} rotation-y={0.25}>
      <Part geo={cyl(0.245, 0.215, 0.74, 22)} m={K.green} p={[0, 0.37, 0]} castShadow={false} raycast={noRay} />
      {[0.2, 0.5].map((y) => (
        <Part key={y} geo={cyl(0.25, 0.25, 0.035, 22)} m={K.mustard} p={[0, y, 0]} castShadow={false} raycast={noRay} />
      ))}
      <Part geo={cyl(0.27, 0.26, 0.06, 22)} m={K.green} p={[0, 0.76, 0]} castShadow={false} raycast={noRay} />
      <Part geo={LOW} m={K.green} scale={[0.26, 0.11, 0.26]} p={[0, 0.8, 0]} castShadow={false} raycast={noRay} />
      <Part geo={LOW} m={K.mustard} scale={0.04} p={[0, 0.92, 0]} castShadow={false} raycast={noRay} />
      {/* la fente de la corbeille : un tronc de lumière sombre, de face */}
      <B s={[0.2, 0.09, 0.05]} p={[0.08, 0.62, 0.21]} m={K.soot} r={0.03} ry={0.4} />
      <B s={[0.14, 0.2, 0.025]} p={[-0.07, 0.86, 0.1]} m={K.stone} r={0.01} rx={-0.5} ry={-0.3} rz={0.2} />
    </group>
  )
}

/** La boîte aux lettres : fût rouge, coiffe bombée, fente, écusson d'or. Un peu plus petite qu'une vraie pour ne pas cacher le café. */
function PillarBox() {
  return (
    <group position={[4.25, SW, 2.75]} rotation-y={Math.PI / 4} scale={0.92}>
      <Part geo={cyl(0.26, 0.28, 0.1, 26)} m={S.post} p={[0, 0.05, 0]} castShadow={false} raycast={noRay} />
      <Part geo={cyl(0.22, 0.24, 0.9, 26)} m={S.post} p={[0, 0.55, 0]} castShadow={false} raycast={noRay} />
      <Part geo={cyl(0.265, 0.25, 0.07, 26)} m={S.post} p={[0, 1.0, 0]} castShadow={false} raycast={noRay} />
      <Part geo={LOW} m={S.post} scale={[0.255, 0.12, 0.255]} p={[0, 1.04, 0]} castShadow={false} raycast={noRay} />
      <Part geo={cyl(0.07, 0.07, 0.04, 14)} m={S.post} p={[0, 1.16, 0]} castShadow={false} raycast={noRay} />
      {/* la fente, son rebord, l'écusson */}
      <B s={[0.3, 0.07, 0.06]} p={[0, 0.82, 0.225]} m={K.soot} r={0.03} />
      <B s={[0.36, 0.02, 0.07]} p={[0, 0.875, 0.225]} m={S.post} r={0.01} />
      <Part geo={cyl(0.07, 0.07, 0.02, 16)} m={K.mustard} p={[0, 0.55, 0.235]} rotation-x={Math.PI / 2} castShadow={false} raycast={noRay} />
      <B s={[0.22, 0.06, 0.02]} p={[0, 0.38, 0.238]} m={K.mustard} r={0.01} />
    </group>
  )
}

/** Une jardinière en chêne sur ses pieds : bruyère rose, buis, chardons. Le dessus de la terre reste sous le bord. */
function Planter({ at, ry = 0, len = 1.1 }: { at: V3; ry?: number; len?: number }) {
  const t = 0.035, h = 0.34, d = 0.34
  return (
    <group position={at} rotation-y={ry}>
      {[-1, 1].map((s) => <B key={s} s={[0.07, 0.07, d - 0.06]} p={[s * (len / 2 - 0.1), 0.035, 0]} m={K.iron} r={0.02} />)}
      <B s={[len, t, d]} p={[0, 0.09, 0]} m={K.oak} r={0.012} />
      <B s={[len, h - 0.1, t]} p={[0, 0.09 + (h - 0.1) / 2, d / 2 - t / 2]} m={K.oak} r={0.012} />
      <B s={[len, h - 0.1, t]} p={[0, 0.09 + (h - 0.1) / 2, -d / 2 + t / 2]} m={K.oak} r={0.012} />
      {[-1, 1].map((s) => <B key={s} s={[t, h - 0.1, d - t * 2]} p={[s * (len / 2 - t / 2), 0.09 + (h - 0.1) / 2, 0]} m={K.oak} r={0.012} />)}
      <B s={[len - t * 2, 0.04, d - t * 2]} p={[0, h - 0.07, 0]} m={K.soot} r={0.01} />
      <B s={[len + 0.02, 0.03, 0.035]} p={[0, 0.09 + h - 0.1, d / 2]} m={K.mustard} r={0.01} />
      <Foliage v={3} p={[-len * 0.12, h - 0.06, 0.01]} s={[len * 0.3, 0.24, 0.16]} m={S.fol} style="clipped" shadow={false} ry={1} />
      <ThistleStem p={[-0.08, h - 0.05, 0.03]} h={0.3} tilt={0.1} />
      <ThistleStem p={[0.18, h - 0.05, -0.02]} h={0.22} tilt={-0.12} />
    </group>
  )
}

/** Un banc de fonte et de chêne, dos au mur de la boutique : lattes, accoudoirs, plaque de laiton. */
function Bench() {
  return (
    <group position={[-9.0, SW, 3.8]}>
      {[-0.14, 0.02, 0.18].map((z) => <Box key={z} s={[1.55, 0.04, 0.13]} p={[0, 0.45, z]} m={K.oak} />)}
      {[0.64, 0.8].map((y, i) => <B key={y} s={[1.55, 0.12, 0.035]} p={[0, y, -0.24 - i * 0.03]} m={K.oak} r={0.018} rx={0.12} />)}
      {[-1, 1].map((s) => (
        <group key={s} position={[s * 0.72, 0, 0]}>
          <B s={[0.055, 0.44, 0.055]} p={[0, 0.22, 0.2]} m={K.iron} r={0.02} />
          <B s={[0.055, 0.44, 0.055]} p={[0, 0.22, -0.18]} m={K.iron} r={0.02} />
          <B s={[0.055, 0.3, 0.05]} p={[0, 0.65, -0.26]} m={K.iron} r={0.02} rx={0.12} />
          <B s={[0.055, 0.04, 0.46]} p={[0, 0.6, 0.0]} m={K.iron} r={0.018} />
          <Part geo={LOW} m={K.iron} scale={[0.045, 0.045, 0.06]} p={[0, 0.6, 0.24]} castShadow={false} raycast={noRay} />
          <B s={[0.055, 0.16, 0.05]} p={[0, 0.5, 0.17]} m={K.iron} r={0.02} />
        </group>
      ))}
      <B s={[0.16, 0.05, 0.02]} p={[0, 0.83, -0.285]} m={K.mustard} r={0.01} rx={0.12} />
    </group>
  )
}

const SPINES = [0x7c2634, 0x2a3a5c, 0xd2a03c, 0x234a3c, 0xe9dfc6, 0x37a3b5, 0x8a5a3a, 0xa8689a]
/** La charrette de livres d'occasion du relieur : deux étagères de dos colorés, une bâche transparente jetée sur la moitié, roues et poignée. */
function BookTrolley() {
  const books = useMemo(() => {
    const r = seeded(14), out: Item[] = []
    for (const [y0, x0, x1] of [[0.47, -0.4, 0.4], [0.82, -0.4, 0.4]] as const) {
      for (let x = x0 + 0.03; x < x1 - 0.03; ) {
        const w = 0.035 + r() * 0.035, h = 0.16 + r() * 0.07
        out.push({ p: [x + w / 2, y0 + h / 2, 0.0 + (r() - 0.5) * 0.02], s: [w, h, 0.14], c: SPINES[(r() * SPINES.length) | 0], r: [0, 0, (r() - 0.5) * 0.06] })
        x += w + 0.004
      }
    }
    return out
  }, [])
  return (
    <group position={[-6.8, SW, 4.05]} rotation-y={0.06}>
      {/* les montants, deux étagères et le fond */}
      {[-1, 1].map((sx) => [-1, 1].map((sz) => <B key={`${sx}${sz}`} s={[0.04, 1.05, 0.04]} p={[sx * 0.46, 0.55, sz * 0.12]} m={K.iron} r={0.015} />))}
      {[0.4, 0.75].map((y) => (
        <B key={y} s={[0.96, 0.04, 0.3]} p={[0, y, 0]} m={K.oak} r={0.015} />
      ))}
      <B s={[0.96, 0.4, 0.025]} p={[0, 0.62, -0.14]} m={K.oak} r={0.012} />
      <B s={[0.96, 0.04, 0.3]} p={[0, 1.08, 0]} m={K.oak} r={0.015} rx={-0.08} />
      <Batch geo={BOOK} m={S.tint} items={books} />
      {/* les roues et la poignée */}
      {[-1, 1].map((s) => (
        <Part key={s} m={K.iron} p={[s * 0.46, 0.1, 0.18]} rotation-y={Math.PI / 2} castShadow={false} raycast={noRay}>
          <torusGeometry args={[0.08, 0.025, 6, 14]} />
        </Part>
      ))}
      <Link a={[0.46, 0.3, -0.12]} b={[0.46, 0.46, -0.45]} m={K.iron} r={0.014} />
      <Link a={[-0.46, 0.3, -0.12]} b={[-0.46, 0.46, -0.45]} m={K.iron} r={0.014} />
      <Part geo={cyl(0.014, 0.014, 0.92, 6)} m={K.iron} p={[0, 0.46, -0.45]} rotation-z={Math.PI / 2} castShadow={false} raycast={noRay} />
    </group>
  )
}
const BOOK = new BoxGeometry(1, 1, 1)

/** L'ardoise du café, sur son chevalet à deux pieds : la soupe du jour à la craie. */
function ABoard() {
  return (
    <group position={[1.4, SW, 4.3]} rotation-y={0.08}>
      <B s={[0.56, 0.84, 0.03]} p={[0, 0.43, 0.09]} m={K.oak} r={0.012} rx={-0.2} />
      <B s={[0.56, 0.84, 0.03]} p={[0, 0.43, -0.09]} m={K.oak} r={0.012} rx={0.2} />
      <B s={[0.46, 0.3, 0.02]} p={[0, 0.54, 0.128]} m={K.green} r={0.008} rx={-0.2} />
      <B s={[0.3, 0.025, 0.012]} p={[0, 0.6, 0.14]} m={K.cream} r={0.006} rx={-0.2} />
      <B s={[0.22, 0.02, 0.012]} p={[0, 0.54, 0.142]} m={K.cream} r={0.006} rx={-0.2} />
      <B s={[0.26, 0.02, 0.012]} p={[0, 0.48, 0.144]} m={K.cream} r={0.006} rx={-0.2} />
      <B s={[0.6, 0.04, 0.05]} p={[0, 0.87, 0]} m={K.oak} r={0.015} />
    </group>
  )
}

/** Trois fûts de bière devant la porte du pub : acier brossé, cerclés. */
function Kegs() {
  const keg = (p: V3) => (
    <group position={p}>
      <Part geo={LOW} m={K.base} scale={[0.2, 0.25, 0.2]} p={[0, 0.25, 0]} castShadow={false} raycast={noRay} />
      <Part geo={cyl(0.15, 0.15, 0.06, 18)} m={K.base} p={[0, 0.5, 0]} castShadow={false} raycast={noRay} />
      <Part geo={cyl(0.15, 0.15, 0.06, 18)} m={K.base} p={[0, 0.02, 0]} castShadow={false} raycast={noRay} />
      <Part geo={cyl(0.205, 0.205, 0.03, 18)} m={K.iron} p={[0, 0.25, 0]} castShadow={false} raycast={noRay} />
      <Part geo={cyl(0.04, 0.04, 0.06, 10)} m={K.mustard} p={[0, 0.55, 0]} castShadow={false} raycast={noRay} />
    </group>
  )
  return (
    <group position={[6.6, SW, -3.2]}>
      {keg([0, 0, 0])}
      {keg([0.46, 0, 0.04])}
      {keg([0.22, 0.5, 0.0])}
    </group>
  )
}

export function StreetProps() {
  return (
    <>
      <Post at={LAMP_A} />
      <Post at={LAMP_B} />
      <Halos />
      <LockChain />
      <Bicycle />
      <Bin />
      <PillarBox />
      <Planter at={[-5.0, SW, 3.66]} />
      <Planter at={[-8.0, SW, 3.66]} len={0.9} />
      <Bench />
      <BookTrolley />
      <ABoard />
      <Kegs />
    </>
  )
}
