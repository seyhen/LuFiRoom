import { useMemo } from 'react'
import { MeshBasicMaterial } from 'three'
import { rb } from './box'
import { SPH_MID as SPH } from '../igloo/spheres'
import { Part, cyl, noRay, type V3 } from '../parts'
import { Fern } from '../nature/Fern'
import { Leaf } from '../nature/Leaf'
import { seeded } from '../paint'
import { Vessel } from '../igloo/Vessel'
import { T } from './materials'
import { labelTex } from './textures'
import { DECK, LIMB, roofY } from './layout'

/** Le tapis tressé rond, au milieu du plancher, et les deux gros coussins de sol posés dessus. */
export function Lounge() {
  return (
    <>
      <mesh material={T.rug} position={[0.15, 0.008, 0.45]} rotation-x={-Math.PI / 2} receiveShadow>
        <circleGeometry args={[1.3, 48]} />
      </mesh>
      {/* le gros coussin terracotta, capitonné (un bouton au milieu), un peu tassé là où l'on s'assoit */}
      <group position={[-0.8, 0, 1.15]}>
        <Part geo={SPH} m={T.cushion} scale={[0.42, 0.17, 0.38]} p={[0, 0.16, 0]} />
        <Part geo={cyl(0.03, 0.03, 0.02, 10)} m={T.blanket} p={[0.0, 0.325, 0.02]} castShadow={false} />
        <Part geo={SPH} m={T.cushion} scale={[0.3, 0.06, 0.26]} p={[0.04, 0.27, 0.02]} castShadow={false} />
      </group>
      {/* le coussin vert mousse, et un petit coussin moutarde jeté dessus */}
      <group position={[1.0, 0, -0.45]}>
        <Part geo={SPH} m={T.cushion2} scale={[0.36, 0.13, 0.36]} p={[0, 0.12, 0]} />
        <Part geo={rb(0.32, 0.1, 0.26, 0.05)} m={T.cushion3} p={[0.05, 0.27, 0.02]} rotation={[0.2, 0.5, 0.15]} />
      </group>
    </>
  )
}

/**
 * Le coin du naturaliste, sur le tapis : le carnet ouvert (une feuille de chêne aquarellée, des notes), son crayon, une loupe, les
 * jumelles posées sur leur courroie, une boîte d'aquarelle ouverte, et deux trouvailles : un gland et une plume de geai.
 */
export function NaturalistKit({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      {/* le carnet ouvert : la couverture verte, les deux pages (une texture sur un plan), la reliure */}
      <Part geo={rb(0.5, 0.02, 0.32, 0.01)} m={T.cover} p={[0, 0.01, 0]} />
      <Part geo={rb(0.46, 0.022, 0.29, 0.008)} m={T.paper} p={[0, 0.022, 0]} castShadow={false} />
      <mesh material={T.page} position={[0, 0.0345, 0]} rotation-x={-Math.PI / 2} receiveShadow raycast={noRay}>
        <planeGeometry args={[0.45, 0.28]} />
      </mesh>
      {/* le ruban marque-page */}
      <Part geo={rb(0.012, 0.004, 0.2, 0.002)} m={T.blanket} p={[0.0, 0.037, 0.2]} castShadow={false} />
      {/* le crayon, en travers de la page de droite */}
      <group position={[0.16, 0.045, 0.06]} rotation-y={0.7}>
        <Part geo={cyl(0.009, 0.009, 0.2, 6)} m={T.pencil} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.009, 0.001, 0.03, 6)} m={T.chestLight} p={[0.115, 0, 0]} rotation-z={-Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.0095, 0.0095, 0.02, 6)} m={T.cushion} p={[-0.11, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      </group>
      {/* la loupe : son cerclage de laiton, son verre, son manche de bois */}
      <group position={[-0.34, 0.012, 0.12]} rotation-y={-0.5}>
        <Part m={T.brass} p={[0, 0.008, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.055, 0.009, 6, 20]} />
        </Part>
        <Part geo={cyl(0.052, 0.052, 0.006, 20)} m={T.lens} p={[0, 0.008, 0]} castShadow={false} />
        <Part geo={cyl(0.012, 0.014, 0.12, 8)} m={T.walnut} p={[0.12, 0.012, 0]} rotation-z={Math.PI / 2} castShadow={false} />
      </group>
      {/* les jumelles : deux corps, le pont, les oculaires, les objectifs qui brillent, la courroie */}
      <group position={[0.42, 0, -0.18]} rotation-y={-0.4}>
        {[-1, 1].map((k) => (
          <group key={k} position={[0, 0.05, k * 0.05]}>
            <Part geo={cyl(0.042, 0.045, 0.16, 16)} m={T.binocular} rotation-z={Math.PI / 2} />
            <Part geo={cyl(0.047, 0.047, 0.03, 16)} m={T.iron} p={[0.08, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
            <Part geo={cyl(0.038, 0.038, 0.004, 16)} m={T.lens} p={[0.097, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
            <Part geo={cyl(0.026, 0.03, 0.04, 12)} m={T.iron} p={[-0.1, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          </group>
        ))}
        <Part geo={rb(0.06, 0.03, 0.06, 0.01)} m={T.iron} p={[-0.02, 0.07, 0]} castShadow={false} />
        <Part m={T.leather} p={[-0.02, 0.012, 0.0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.13, 0.009, 5, 24]} />
        </Part>
      </group>
      {/* la boîte d'aquarelle ouverte : le fond noir, les godets de couleur, le couvercle relevé */}
      <group position={[-0.15, 0, -0.27]} rotation-y={0.2}>
        <Part geo={rb(0.2, 0.02, 0.1, 0.006)} m={T.iron} p={[0, 0.01, 0]} castShadow={false} />
        {[0x6f8f4a, 0xc9643f, 0xe2a93e, 0x3d6fb0, 0x8a5a3a].map((c, i) => (
          <Part key={c} geo={rb(0.03, 0.006, 0.035, 0.004)} m={PANS[i]} p={[-0.075 + i * 0.037, 0.022, 0.012]} castShadow={false} />
        ))}
        <Part geo={rb(0.2, 0.1, 0.01, 0.005)} m={T.iron} p={[0, 0.06, -0.055]} rotation-x={-0.25} castShadow={false} />
      </group>
      {/* le gland et la plume de geai, rapportés de la forêt */}
      <Part geo={SPH} m={T.acorn} scale={[0.024, 0.024, 0.032]} p={[0.3, 0.024, 0.2]} castShadow={false} />
      <Part geo={SPH} m={T.acornCap} scale={[0.026, 0.016, 0.02]} p={[0.3, 0.03, 0.172]} castShadow={false} />
      <group position={[-0.32, 0.006, -0.1]} rotation-y={0.9}>
        <Part geo={rb(0.14, 0.004, 0.03, 0.002)} m={JAY} castShadow={false} />
        <Part geo={cyl(0.003, 0.003, 0.18, 4)} m={T.paper} rotation-z={Math.PI / 2} p={[0.01, 0.003, 0]} castShadow={false} />
      </group>
    </group>
  )
}
const PANS = [0x6f8f4a, 0xc9643f, 0xe2a93e, 0x3d6fb0, 0x8a5a3a].map((c) => new MeshBasicMaterial({ color: c }))
const JAY = new MeshBasicMaterial({ color: 0x5a8ac8 })

/** Une botte de plantes qui sèche tête en bas : la ficelle, les tiges serrées au lien, les fleurs en bas. */
function Bundle({ x, drop, kind }: { x: number; drop: number; kind: 'lavender' | 'yarrow' | 'oregano' }) {
  const stems = useMemo(() => {
    const r = seeded(Math.round(x * 100) + 7)
    return Array.from({ length: 9 }, (_, i) => ({ a: (i / 9) * Math.PI * 2 + r(), t: 0.1 + r() * 0.12, l: 0.26 + r() * 0.08 }))
  }, [x])
  const head = kind === 'lavender' ? T.lavender : kind === 'yarrow' ? T.yarrow : T.dried
  return (
    <group position={[x, 0, 0]}>
      <Part geo={cyl(0.009, 0.009, drop, 4)} m={T.twine} p={[0, -drop / 2, 0]} castShadow={false} />
      <Part geo={cyl(0.03, 0.03, 0.035, 10)} m={T.twine} p={[0, -drop - 0.01, 0]} castShadow={false} />
      {stems.map((s, i) => {
        const dx = Math.cos(s.a) * Math.sin(s.t), dz = Math.sin(s.a) * Math.sin(s.t), y = -drop - 0.02
        return (
          <group key={i} position={[0, y, 0]} rotation={[dz * 1.2, 0, -dx * 1.2]}>
            <Part geo={cyl(0.006, 0.006, s.l, 4)} m={T.stem} p={[0, -s.l / 2, 0]} castShadow={false} />
            {kind === 'yarrow' ? (
              <Part geo={SPH} m={head} scale={[0.04, 0.018, 0.04]} p={[0, -s.l, 0]} castShadow={false} />
            ) : (
              <Part geo={SPH} m={head} scale={[0.016, kind === 'lavender' ? 0.06 : 0.035, 0.016]} p={[0, -s.l + 0.02, 0]} castShadow={false} />
            )}
          </group>
        )
      })}
    </group>
  )
}

/** Les plantes qui sèchent, pendues à la panne avant du toit, à gauche des lanternes : lavande, achillée, origan. */
export function DryingHerbs() {
  const y = roofY(-1.42) - 0.155
  return (
    <group position={[0, y, -1.42]}>
      <Bundle x={-1.5} drop={0.14} kind="lavender" />
      <Bundle x={-1.12} drop={0.24} kind="yarrow" />
      <Bundle x={-0.48} drop={0.1} kind="oregano" />
      {[-1.5, -1.12, -0.48].map((x) => (
        <Part key={x} m={T.twine} p={[x, 0.07, 0]} rotation-y={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.08, 0.012, 5, 14]} />
        </Part>
      ))}
    </group>
  )
}

const LABELS = ['tilleul', 'menthe', 'sureau'].map((t) => new MeshBasicMaterial({ map: labelTex(t) }))

/** Trois bocaux de plantes séchées sur la main courante du fond, sous le toit : le verre, les feuilles dedans, le couvercle, l'étiquette. */
export function HerbJars() {
  const y = 0.92, z = DECK.z0 + 0.08
  const fills = [T.dried, T.fern, T.yarrow]
  return (
    <>
      {[0.5, 0.82, 1.14].map((x, i) => (
        <group key={x} position={[x, y, z]} scale={i === 1 ? 1.5 : 1.35}>
          <Part geo={cyl(0.04, 0.042, 0.1 - i * 0.015, 14)} m={fills[i]} p={[0, 0.06 - i * 0.008, 0]} castShadow={false} />
          <mesh material={T.jar} position={[0, 0.075, 0]} raycast={noRay}>
            <cylinderGeometry args={[0.05, 0.05, 0.15, 16, 1, true]} />
          </mesh>
          <Part geo={cyl(0.05, 0.05, 0.012, 16)} m={T.lid} p={[0, 0.006, 0]} castShadow={false} />
          <Part geo={cyl(0.046, 0.046, 0.03, 16)} m={i === 1 ? T.cushion2 : T.lid} p={[0, 0.165, 0]} castShadow={false} />
          <mesh material={LABELS[i]} position={[0, 0.075, 0.052]} raycast={noRay}>
            <planeGeometry args={[0.07, 0.035]} />
          </mesh>
        </group>
      ))}
    </>
  )
}

/** La fougère dans son pot de terre cuite, au coin du fond à droite, un peu de mousse sur la terre. */
export function FernPot({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Vessel p={[0, 0, 0]} rt={0.24} rb={0.18} h={0.3} m={T.terracotta} inner={T.terracottaIn} t={0.02} />
      <Part geo={cyl(0.22, 0.22, 0.02, 20)} m={T.soil} p={[0, 0.26, 0]} castShadow={false} />
      <Part geo={SPH} m={T.moss} scale={[0.1, 0.03, 0.08]} p={[0.07, 0.275, 0.06]} castShadow={false} />
      <Fern p={[0, 0.27, 0]} size={0.55} n={9} m={T.fern} m2={T.leafLight} />
    </group>
  )
}

/** Le panier de pommes de pin et de glands, près de l'échelle : l'osier tressé (bandes), l'anse, ce qu'on a ramassé. */
export function ConeBasket({ position }: { position: V3 }) {
  const cones = useMemo<V3[]>(() => [[0.05, 0.2, 0.03], [-0.07, 0.19, -0.04], [0.0, 0.22, -0.08], [-0.04, 0.21, 0.08], [0.09, 0.19, -0.06]], [])
  return (
    <group position={position}>
      <Vessel p={[0, 0, 0]} rt={0.2} rb={0.15} h={0.2} m={T.chestLight} inner={T.terracottaIn} t={0.015} />
      {[0.05, 0.1, 0.15].map((y) => (
        <Part key={y} m={T.plankDark} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.16 + y * 0.25, 0.01, 5, 24]} />
        </Part>
      ))}
      <Part m={T.chestLight} p={[0, 0.2, 0]} castShadow={false}>
        <torusGeometry args={[0.18, 0.014, 6, 20, Math.PI]} />
      </Part>
      {cones.map((p, i) => (
        <group key={i} position={p} rotation={[0.5 * i, i, 0.8]}>
          <Part geo={SPH} m={i % 2 ? T.acornCap : T.beam} scale={[0.045, 0.06, 0.045]} castShadow={false} />
          {[0.02, -0.01, -0.035].map((y) => (
            <Part key={y} m={T.acornCap} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.042 - Math.abs(y) * 0.3, 0.009, 4, 10]} />
            </Part>
          ))}
        </group>
      ))}
    </group>
  )
}

/** Les bottes en caoutchouc laissées près de l'échelle, l'une debout, l'autre couchée ; boue sèche sur les semelles. */
export function Boots({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <group position={[0, 0, 0]}>
        <Part geo={rb(0.11, 0.34, 0.12, 0.05)} m={T.cushion2} p={[0, 0.2, 0]} />
        <Part geo={rb(0.24, 0.1, 0.12, 0.05)} m={T.cushion2} p={[0.06, 0.05, 0]} />
        <Part geo={rb(0.25, 0.025, 0.13, 0.012)} m={T.soil} p={[0.06, 0.012, 0]} castShadow={false} />
        <Part geo={cyl(0.06, 0.06, 0.01, 14)} m={T.iron} p={[0, 0.37, 0]} castShadow={false} />
      </group>
      <group position={[0.1, 0.06, 0.24]} rotation={[Math.PI / 2, 0, 0.5]}>
        <Part geo={rb(0.11, 0.34, 0.12, 0.05)} m={T.cushion2} p={[0, 0.15, 0]} />
        <Part geo={rb(0.24, 0.1, 0.12, 0.05)} m={T.cushion2} p={[0.06, 0.0, 0]} />
        <Part geo={rb(0.25, 0.025, 0.13, 0.012)} m={T.soil} p={[0.06, -0.04, 0]} castShadow={false} />
      </group>
    </group>
  )
}

/** Un coussin de mousse et deux fougères là où la branche traverse le plancher : la cabane fait sa place à l'arbre. */
export function LimbCollar() {
  return (
    <group position={[LIMB.x, 0, LIMB.z]}>
      {[0, 2.1, 4.2].map((a) => (
        <Part key={a} geo={SPH} m={T.moss} scale={[0.14, 0.04, 0.1]} p={[Math.cos(a) * 0.3, 0.02, Math.sin(a) * 0.3]} rotation-y={a} castShadow={false} />
      ))}
      <group position={[0.38, 0, 0.12]}>
        <Fern p={[0, 0.02, 0]} size={0.32} n={6} m={T.fern} m2={T.leafLight} />
      </group>
      {[0, 1.2, 2.5].map((a, i) => (
        <group key={a} position={[0.22 + i * 0.04, 0.03, -0.25 + i * 0.05]} rotation-y={a}>
          <Leaf kind="ovate" r={[-1.3, 0, 0]} w={0.05} l={0.13} m={i ? T.leaf : T.dried} />
        </group>
      ))}
    </group>
  )
}

const BOOKS = [T.cover, T.cushion, T.chestLight, T.cushion3, T.blanket, T.cover]
/**
 * La caisse couchée sur le flanc qui sert d'étagère, près du tronc : son ouverture tournée vers la cabane, des livres debout et un
 * guide des oiseaux couché, et dessus une tasse émaillée et une pomme de pin.
 */
export function BookCrate({ position, ry = 0 }: { position: V3; ry?: number }) {
  const W = 0.62, H = 0.44, D = 0.36
  return (
    <group position={position} rotation-y={ry}>
      {/* le fond, les deux flancs, le dessus et le dessous : une caisse ouverte vers +x */}
      <Part geo={rb(0.03, H, W, 0.01)} m={T.plankDark} p={[-D / 2, H / 2, 0]} />
      {[-1, 1].map((k) => <Part key={k} geo={rb(D, H, 0.03, 0.01)} m={T.plank} p={[0, H / 2, k * (W / 2 - 0.015)]} />)}
      <Part geo={rb(D, 0.03, W, 0.01)} m={T.plank} p={[0, H - 0.015, 0]} />
      <Part geo={rb(D, 0.03, W, 0.01)} m={T.plank} p={[0, 0.015, 0]} />
      {/* les livres debout, de hauteurs et de couleurs différentes, puis un couché */}
      {[0.26, 0.31, 0.24, 0.29, 0.33].map((h, i) => (
        <Part key={i} geo={rb(0.24, h, 0.055, 0.012)} m={BOOKS[i]} p={[0.0, 0.03 + h / 2, -0.24 + i * 0.065]} rotation-x={i === 4 ? -0.12 : 0} castShadow={false} />
      ))}
      <Part geo={rb(0.24, 0.045, 0.18, 0.012)} m={BOOKS[5]} p={[0.0, 0.052, 0.17]} castShadow={false} />
      <Part geo={rb(0.22, 0.035, 0.16, 0.012)} m={T.paper} p={[0.0, 0.092, 0.17]} castShadow={false} />
      {/* sur le dessus : la tasse émaillée et son anse, une pomme de pin */}
      <group position={[0.03, H, -0.12]}>
        <Vessel p={[0, 0, 0]} rt={0.055} rb={0.05} h={0.1} m={T.linen} inner={T.terracottaIn} rim={T.cover} />
        <Part m={T.linen} p={[0.065, 0.055, 0]} castShadow={false}>
          <torusGeometry args={[0.03, 0.009, 6, 14]} />
        </Part>
        <Part geo={cyl(0.048, 0.048, 0.006, 16)} m={T.chest} p={[0, 0.07, 0]} castShadow={false} />
      </group>
      <group position={[0.02, H + 0.05, 0.14]} rotation={[0, 0, 1.4]}>
        <Part geo={SPH} m={T.beam} scale={[0.04, 0.06, 0.04]} castShadow={false} />
        {[0.02, -0.01, -0.035].map((y) => (
          <Part key={y} m={T.acornCap} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.038 - Math.abs(y) * 0.3, 0.009, 4, 10]} />
          </Part>
        ))}
      </group>
    </group>
  )
}

/**
 * La longue-vue du naturaliste, sur son trépied de bois, au coin de devant à gauche, braquée vers la forêt : le tube de laiton et sa
 * gaine de cuir, l'oculaire, le pare-soleil, la rotule ; le capuchon qui pend à sa ficelle.
 */
export function Telescope({ position, ry = 0 }: { position: V3; ry?: number }) {
  const H = 0.95, t = 0.22
  return (
    <group position={position} rotation-y={ry}>
      {/* les trois pieds, qui s'écartent vers le bas, et la tablette */}
      {[0, 2.09, 4.19].map((a) => (
        <Part key={a} geo={cyl(0.018, 0.022, H / Math.cos(t), 8)} m={T.chestLight} p={[Math.cos(a) * Math.tan(t) * H / 2, H / 2, Math.sin(a) * Math.tan(t) * H / 2]} rotation={[-Math.sin(a) * t, 0, Math.cos(a) * t]} />
      ))}
      <Part geo={cyl(0.06, 0.06, 0.04, 14)} m={T.walnut} p={[0, H + 0.01, 0]} castShadow={false} />
      <Part geo={SPH} m={T.brass} scale={0.04} p={[0, H + 0.05, 0]} castShadow={false} />
      {/* le tube, levé vers la forêt (vers -x) */}
      <group position={[0, H + 0.09, 0]} rotation-z={Math.PI / 2 + 0.22}>
        <Part geo={cyl(0.045, 0.05, 0.62, 18)} m={T.brass} p={[0, 0.06, 0]} />
        <Part geo={cyl(0.052, 0.052, 0.2, 18)} m={T.leather} p={[0, 0.0, 0]} castShadow={false} />
        <Part geo={cyl(0.062, 0.056, 0.12, 18)} m={T.brass} p={[0, 0.42, 0]} castShadow={false} />
        <Part geo={cyl(0.052, 0.052, 0.006, 18)} m={T.lens} p={[0, 0.482, 0]} castShadow={false} />
        <Part geo={cyl(0.026, 0.03, 0.1, 12)} m={T.iron} p={[0, -0.3, 0]} castShadow={false} />
        <Part geo={cyl(0.034, 0.034, 0.02, 12)} m={T.iron} p={[0, -0.355, 0]} castShadow={false} />
      </group>
      {/* le capuchon de cuir, qui pend sous le tube */}
      <Part geo={cyl(0.009, 0.009, 0.16, 4)} m={T.twine} p={[-0.32, H + 0.08, 0.03]} castShadow={false} />
      <Part geo={cyl(0.06, 0.06, 0.04, 14)} m={T.leather} p={[-0.32, H - 0.02, 0.03]} castShadow={false} />
    </group>
  )
}

/** Quelques feuilles de chêne tombées sur les planches, sèches ou encore vertes, dans les coins où le vent les pousse. */
export function FallenLeaves() {
  const list = useMemo(() => {
    const r = seeded(31), out: { p: V3; ry: number; k: number }[] = []
    const spots: [number, number][] = [[-2.6, 2.6], [-2.0, 2.75], [2.6, -2.8], [2.2, -1.5], [-1.5, -2.8], [0.6, 2.7], [1.8, 2.6], [-2.85, -0.6]]
    spots.forEach(([x, z]) => out.push({ p: [x + (r() - 0.5) * 0.2, 0.012, z + (r() - 0.5) * 0.2], ry: r() * 6.3, k: (r() * 3) | 0 }))
    return out
  }, [])
  return (
    <>
      {list.map((l, i) => (
        <group key={i} position={l.p} rotation-y={l.ry}>
          <Leaf kind="ovate" r={[-Math.PI / 2 + 0.12, 0, 0]} w={0.06} l={0.15} m={[T.dried, T.leaf, T.acornCap][l.k]} />
        </group>
      ))}
    </>
  )
}
