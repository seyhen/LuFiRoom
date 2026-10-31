import { ExtrudeGeometry, Shape } from 'three'
import { TAU } from '../../math'
import { worldUV, orient, Part, SPH, cyl, rbox } from '../parts'
import { Candle } from '../objects/Candle'
import { B } from './materials'
import { Vessel, innerR } from '../igloo/Vessel'

/** Une coquille Saint-Jacques : un éventail côtelé (des côtes qui rayonnent), ses deux oreilles à la charnière. Posée à plat, charnière vers -z. */
export function Scallop({ p, s = 1, m = B.shell, rot = 0 }: { p: [number, number, number]; s?: number; m?: typeof B.shell; rot?: number }) {
  return (
    <group position={p} rotation-y={rot} scale={s}>
      <Part m={m} p={[0, 0.012, -0.03]} scale={[1, 0.35, 1]} castShadow={false}>
        <sphereGeometry args={[0.06, 16, 8, Math.PI / 2 - 0.9, 1.8, 0, Math.PI / 2]} />
      </Part>
      {[-0.7, -0.35, 0, 0.35, 0.7].map((a) => (
        <group key={a} position={[0, 0.006, -0.03]} rotation-y={a}>
          <Part geo={cyl(0.005, 0.004, 0.062, 5)} m={m} p={[0, 0.011, 0.029]} rotation-x={Math.PI / 2 - 0.35} castShadow={false} />
        </group>
      ))}
      <Part geo={rbox(0.04, 0.012, 0.016, 0.005)} m={m} p={[0, 0.008, -0.032]} castShadow={false} />
    </group>
  )
}

/** Un coquillage en spirale (un petit buccin) : un cône qui s'enroule, sa bouche nacrée. Couché sur le flanc. */
export function Whelk({ p, s = 1, rot = 0 }: { p: [number, number, number]; s?: number; rot?: number }) {
  return (
    <group position={p} rotation={[0, rot, Math.PI / 2 - 0.15]} scale={s}>
      <Part m={B.shell} p={[0, 0.03, 0]} castShadow={false}>
        <coneGeometry args={[0.028, 0.08, 14]} />
      </Part>
      {[0.012, 0.032, 0.05].map((y, i) => (
        <Part key={y} m={B.shellPink} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.026 - i * 0.008, 0.006, 6, 14]} />
        </Part>
      ))}
      <Part geo={SPH} m={B.shellPink} scale={[0.02, 0.012, 0.012]} p={[0.012, -0.004, 0]} castShadow={false} />
    </group>
  )
}

// Pochettes de disques dans la caisse : [décalage, couleur].
const RECORDS = [[-0.3, B.coral], [-0.22, B.turquoise], [-0.15, B.butter], [-0.08, B.navy], [0, B.pink], [0.08, B.seaglass], [0.16, B.coral], [0.24, B.linen]] as const

/** Le cabas : un trapèze (plus large en haut) épaissi, aux bords bien arrondis. Base au sol, ouverture à y = 0,4. */
const totebag = (() => {
  const sh = new Shape()
  sh.moveTo(-0.19, 0)
  sh.lineTo(0.19, 0)
  sh.lineTo(0.25, 0.4)
  sh.lineTo(-0.25, 0.4)
  sh.closePath()
  const g = new ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.035, bevelSegments: 4 })
  g.translate(0, 0.035, -0.06)
  return g
})()

/** Une caisse de bois à lattes, au pied du mur : la radio est posée dessus, et une pile de pochettes de disques à côté. */
export function RecordCrate() {
  return (
    <group position={[-2.45, 0, 1.55]}>
      <Part geo={rbox(0.95, 0.5, 0.52, 0.03)} m={B.wood} p={[0, 0.25, 0]} />
      {/* les lattes : des rainures sur les deux faces vues de la caméra (+z et +x) */}
      {[0.12, 0.25, 0.38].map((y) => (
        <group key={y}>
          <Part geo={rbox(0.9, 0.014, 0.012, 0.005)} m={B.slab} p={[0, y, 0.262]} castShadow={false} />
          <Part geo={rbox(0.012, 0.014, 0.48, 0.005)} m={B.slab} p={[0.477, y, 0]} castShadow={false} />
        </group>
      ))}
      {/* les pochettes, à plat sur le sol */}
      {RECORDS.map(([x, m], i) => (
        <Part key={i} geo={rbox(0.31, 0.012, 0.31, 0.005)} m={m} p={[0.8 + (i % 2) * 0.01, 0.01 + i * 0.013, 0.1 + x * 0.1]} rotation-y={x * 1.1} castShadow={false} />
      ))}
    </group>
  )
}

/** Une planche de surf pastel appuyée contre le mur, et sa dérive. */
export function Surfboard() {
  return (
    <group position={[-2.82, 0, 2.55]} rotation={[0, 0, -0.18]}>
      <group position={[0, 1.15, 0]} rotation-x={0.12}>
        <Part geo={SPH} m={B.shell} scale={[0.05, 1.12, 0.29]} />
        <Part geo={SPH} m={B.coral} scale={[0.052, 1.0, 0.06]} p={[0.002, 0.02, 0]} castShadow={false} />
        <Part geo={SPH} m={B.turquoise} scale={[0.053, 0.08, 0.27]} p={[0, -0.25, 0]} castShadow={false} />
        {/* la dérive sous la queue, côté pièce, et le plot du leash avec son cordon enroulé */}
        <Part m={B.navy} p={[0.075, -0.88, 0]} rotation={[0, Math.PI / 2, 0.15]} castShadow={false}>
          <cylinderGeometry args={[0.012, 0.06, 0.14, 3, 1]} />
        </Part>
        <Part geo={cyl(0.012, 0.012, 0.02, 8)} m={B.ink} p={[0.05, -1.02, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part m={B.navy} p={[0.08, -0.98, 0.06]} rotation-y={0.3} castShadow={false}>
          <torusGeometry args={[0.06, 0.009, 6, 18]} />
        </Part>
      </group>
    </group>
  )
}

/** Deux chapeaux de paille accrochés au mur de gauche, au-dessus du fauteuil paon (loin du filet et de la planche). */
export function Hats() {
  return (
    <>
      {[[-1.95, B.coral], [-1.4, B.turquoise]].map(([z, band], i) => (
        <group key={i} position={[-2.92, 2.45 - i * 0.12, z as number]} rotation-z={-Math.PI / 2 + 0.25}>
          <Part geo={cyl(0.26, 0.26, 0.02, 28)} m={B.cane} />
          <Part geo={SPH} m={B.cane} scale={[0.14, 0.11, 0.14]} p={[0, 0.03, 0]} />
          <Part geo={cyl(0.142, 0.142, 0.035, 22)} m={band as typeof B.coral} p={[0, 0.04, 0]} castShadow={false} />
        </group>
      ))}
      {[-1.95, -1.4].map((z, i) => (
        <Part key={z} geo={cyl(0.015, 0.015, 0.08, 6)} m={B.wood} p={[-2.96, 2.5 - i * 0.12, z]} rotation-z={Math.PI / 2} castShadow={false} />
      ))}
    </>
  )
}

/** L'étagère de bois flotté au-dessus du lit : coquillages, un bateau en bouteille, un pot de sable, une petite plante. */
export function ShellShelf() {
  return (
    <group position={[-2.82, 1.95, -0.3]}>
      <Part geo={rbox(0.3, 0.06, 1.5, 0.02)} m={B.driftwood} />
      {[-0.55, 0.55].map((z) => (
        <Part key={z} geo={rbox(0.24, 0.14, 0.05, 0.02)} m={B.wood} p={[-0.02, -0.09, z]} castShadow={false} />
      ))}
      {/* bateau en bouteille */}
      <group position={[0, 0.1, -0.45]}>
        <Part geo={cyl(0.065, 0.065, 0.3, 16)} m={B.glass} rotation-x={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.025, 0.035, 0.08, 10)} m={B.glass} p={[0, 0, -0.18]} rotation-x={Math.PI / 2} castShadow={false} />
        <Part geo={rbox(0.03, 0.03, 0.16, 0.01)} m={B.wood} p={[0, -0.03, 0]} castShadow={false} />
        <Part m={B.linen} p={[0, 0.02, 0.01]} rotation-y={Math.PI / 2} castShadow={false}>
          <coneGeometry args={[0.045, 0.08, 3]} />
        </Part>
      </group>
      {/* coquillages, une étoile de mer */}
      <Scallop p={[0, 0.03, -0.24]} s={1.1} m={B.shellPink} rot={Math.PI / 2} />
      <Whelk p={[0.02, 0.06, 0.02]} s={1.2} rot={0.4} />
      <Scallop p={[0.02, 0.03, 0.25]} s={0.85} rot={Math.PI / 2 + 0.4} />
      <group position={[0.03, 0.05, 0.38]} rotation-z={Math.PI / 2 - 0.2}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Part key={i} geo={SPH} m={B.coral} scale={[0.018, 0.06, 0.012]} p={[Math.sin((i / 5) * TAU) * 0.04, Math.cos((i / 5) * TAU) * 0.04, 0]} rotation-z={-(i / 5) * TAU} castShadow={false} />
        ))}
      </group>
      <Candle position={[0, 0.03, -0.12]} holder="jar" height={0.09} radius={0.03} />
      {/* pot de sable */}
      {/* pot de sable ouvert : le sable à mi-hauteur, un mini coquillage posé dessus, sa ficelle au col */}
      <Vessel p={[0, 0.03, 0.12]} rt={0.055} rb={0.06} h={0.16} m={B.glass} inner={B.glassIn} t={0.005} />
      <Part geo={cyl(innerR(0.055, 0.06, 0.16, 0.08, 0.005), innerR(0.055, 0.06, 0.16, 0.0, 0.005), 0.08, 16)} m={B.sand} p={[0, 0.07, 0.12]} castShadow={false} />
      <Part geo={SPH} m={B.shellPink} scale={[0.018, 0.01, 0.014]} p={[0, 0.112, 0.12]} castShadow={false} />
      <Part m={B.rope} p={[0, 0.17, 0.12]} rotation-x={Math.PI / 2} castShadow={false}>
        <torusGeometry args={[0.057, 0.004, 5, 18]} />
      </Part>
      {/* une petite succulente */}
      {/* une succulente en rosette : deux couronnes de feuilles pointues qui s'ouvrent, dans un pot à la terre sous le bord */}
      <Vessel p={[0, 0.03, 0.6]} rt={0.06} rb={0.05} h={0.09} m={B.turquoise} inner={B.turquoise} t={0.008} />
      <Part geo={cyl(0.05, 0.05, 0.01, 14)} m={B.sand} p={[0, 0.105, 0.6]} castShadow={false} />
      {Array.from({ length: 13 }, (_, i) => {
        const inner = i >= 8, a = inner ? ((i - 8) / 5) * TAU + 0.3 : (i / 8) * TAU, tilt = inner ? 0.45 : 1.05, r = inner ? 0.012 : 0.022
        return (
          <group key={i} position={[Math.cos(a) * r, 0.11, 0.6 + Math.sin(a) * r]} rotation={[0, -a, 0]}>
            <Part m={inner ? B.leafLight : B.seaglass} p={[0, 0, 0]} rotation-z={-tilt} castShadow={false}>
              <coneGeometry args={[inner ? 0.011 : 0.014, inner ? 0.05 : 0.06, 6]} />
            </Part>
          </group>
        )
      })}
    </group>
  )
}

/** Tenture de macramé au-dessus du lit : une baguette, des cordelettes nouées qui pendent en V, des franges. */
export function Macrame() {
  return (
    <group position={[-2.95, 3.05, -0.3]}>
      <Part geo={cyl(0.022, 0.022, 0.95, 8)} m={B.driftwood} rotation-x={Math.PI / 2} />
      {Array.from({ length: 11 }, (_, i) => {
        const z = -0.4 + i * 0.08, len = 0.75 - Math.abs(z) * 0.9
        return (
          <group key={i}>
            <Part geo={cyl(0.008, 0.008, len, 4)} m={B.rope} p={[0.01, -len / 2, z]} castShadow={false} />
            <Part geo={SPH} m={B.rope} scale={0.018} p={[0.012, -len * 0.4, z]} castShadow={false} />
          </group>
        )
      })}
      <Part geo={SPH} m={B.coral} scale={[0.01, 0.06, 0.06]} p={[0.02, -0.25, 0]} castShadow={false} />
    </group>
  )
}

/** Près de la porte : des tongs, un cabas de paille et sa serviette rayée roulée. */
export function BeachBag() {
  return (
    <>
      {[[1.62, -2.5, 0.2, B.coral], [1.85, -2.4, -0.25, B.coral]].map(([x, z, a, m], i) => (
        <group key={i} position={[x as number, 0.012, z as number]} rotation-y={a as number}>
          <Part geo={SPH} m={m as typeof B.coral} scale={[0.07, 0.012, 0.15]} castShadow={false} />
          <Part m={B.butter} p={[0, 0.015, 0.03]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.045, 0.008, 6, 12, Math.PI]} />
          </Part>
        </group>
      ))}
      {/* le cabas de paille, évasé, posé de face : deux anses de corde, la serviette rayée roulée et un livre qui dépassent */}
      <group position={[2.45, 0, -2.3]} rotation-y={0.75}>
        <Part geo={totebag} m={B.rattan} />
        <Part geo={rbox(0.5, 0.03, 0.2, 0.012)} m={B.cane} p={[0, 0.41, 0]} castShadow={false} />
        {[-1, 1].map((sd) => (
          <Part key={sd} m={B.rope} p={[0, 0.42, sd * 0.085]} castShadow={false}>
            <torusGeometry args={[0.11, 0.012, 6, 18, Math.PI]} />
          </Part>
        ))}
        <Part geo={cyl(0.065, 0.065, 0.36, 16)} m={B.stripeTowel} p={[0.1, 0.46, 0]} rotation-z={0.45} />
        <Part geo={rbox(0.03, 0.2, 0.14, 0.008)} m={B.coral} p={[-0.1, 0.46, 0.01]} rotation-z={-0.2} castShadow={false} />
      </group>
    </>
  )
}

/** Un filet de pêcheur tendu au mur de gauche, ses flotteurs de verre et quelques étoiles de mer. */
export function FishingNet() {
  const knots = Array.from({ length: 7 * 5 }, (_, i) => [(i % 7) * 0.16 - 0.48, -((i / 7) | 0) * 0.15 - Math.sin(((i % 7) / 6) * Math.PI) * 0.12] as const)
  return (
    <group position={[-2.97, 3.3, 1.55]} rotation-y={Math.PI / 2}>
      <Part geo={cyl(0.02, 0.02, 1.15, 8)} m={B.driftwood} rotation-z={Math.PI / 2} castShadow={false} />
      {knots.map(([x, y], i) => (
        <group key={i}>
          {i % 7 < 6 && <Part geo={cyl(0.009, 0.009, 0.17, 5)} m={B.rope} p={[x + 0.08, y - 0.02, 0.01]} rotation-z={Math.PI / 2 + 0.25 * (i % 2 ? 1 : -1)} castShadow={false} />}
          {i < 28 && <Part geo={cyl(0.009, 0.009, 0.16, 5)} m={B.rope} p={[x, y - 0.08, 0.01]} castShadow={false} />}
        </group>
      ))}
      {[[-0.35, -0.35, B.seaglass], [0.1, -0.5, B.turquoise], [0.4, -0.3, B.seaglass]].map(([x, y, m], i) => (
        <Part key={i} geo={SPH} m={m as typeof B.seaglass} scale={0.07} p={[x as number, y as number, 0.05]} castShadow={false} />
      ))}
      <group position={[-0.1, -0.25, 0.04]}>
        {[0, 1, 2, 3, 4].map((i) => (
          <Part key={i} geo={SPH} m={B.coral} scale={[0.02, 0.06, 0.012]} p={[Math.sin((i / 5) * TAU) * 0.04, Math.cos((i / 5) * TAU) * 0.04, 0]} rotation-z={-(i / 5) * TAU} castShadow={false} />
        ))}
      </group>
    </group>
  )
}

/** Une barre ronde entre deux points (montant, traverse). */
function Bar({ a, b, r = 0.02, m = B.wood }: { a: [number, number, number]; b: [number, number, number]; r?: number; m?: typeof B.wood }) {
  const d: [number, number, number] = [b[0] - a[0], b[1] - a[1], b[2] - a[2]], len = Math.hypot(...d)
  return <Part geo={cyl(r, r, len, 8)} m={m} p={[(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]} rotation={orient(d, [0, 0, 1])} castShadow={false} />
}

/**
 * Dehors, sur la terrasse : un vrai transat de plage en bois (les deux cadres qui se croisent, les traverses, la toile rayée qui
 * pend du haut du dossier à la barre de devant) tourné vers la mer, une serviette jetée sur le dossier ; à côté, un tabouret de
 * bois flotté avec un verre, un seau et sa pelle, des tongs dans le sable.
 */
export function DeckChair() {
  const X = 0.25
  return (
    <>
      <group position={[1.6, 0, -3.55]} rotation-y={Math.PI + 0.25}>
        {[-1, 1].map((s) => (
          <group key={s}>
            {/* le grand cadre : du pied arrière au haut du dossier */}
            <Bar a={[s * X, 0, 0.45]} b={[s * X, 0.95, -0.4]} />
            {/* le cadre du siège : du pied avant à l'accoudoir, il croise le grand */}
            <Bar a={[s * (X - 0.04), 0, -0.38]} b={[s * (X - 0.04), 0.52, 0.32]} />
          </group>
        ))}
        {/* les traverses : en haut du dossier, devant le siège, au pied */}
        <Bar a={[-X, 0.95, -0.4]} b={[X, 0.95, -0.4]} r={0.022} />
        <Bar a={[-X + 0.04, 0.52, 0.32]} b={[X - 0.04, 0.52, 0.32]} r={0.022} />
        <Bar a={[-X, 0.04, 0.44]} b={[X, 0.04, 0.44]} r={0.018} />
        {/* la toile rayée : du haut du dossier au creux de l'assise, puis remontée à la barre de devant */}
        <Part geo={worldUV(rbox(0.44, 0.012, 0.72, 0.006), 0.5)} m={B.stripeCoral} p={[0, 0.63, -0.1]} rotation-x={-0.95} castShadow={false} />
        <Part geo={worldUV(rbox(0.44, 0.012, 0.24, 0.006), 0.5)} m={B.stripeCoral} p={[0, 0.4, 0.22]} rotation-x={0.5} castShadow={false} />
        {/* la serviette jetée sur le dossier, qui pend derrière */}
        <Part geo={worldUV(rbox(0.3, 0.012, 0.2, 0.006), 0.5)} m={B.stripeTowel} p={[0.05, 0.97, -0.43]} castShadow={false} />
        <Part geo={worldUV(rbox(0.3, 0.3, 0.012, 0.006), 0.5)} m={B.stripeTowel} p={[0.05, 0.82, -0.53]} rotation-x={0.12} castShadow={false} />
      </group>
      {/* le tabouret de bois flotté, un verre de citronnade dessus */}
      <group position={[2.35, 0, -3.45]}>
        <Part geo={cyl(0.17, 0.18, 0.05, 18)} m={B.driftwood} p={[0, 0.38, 0]} />
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * TAU
          return <Bar key={i} a={[Math.cos(a) * 0.15, 0, Math.sin(a) * 0.15]} b={[Math.cos(a) * 0.1, 0.36, Math.sin(a) * 0.1]} r={0.022} m={B.driftwood} />
        })}
        <Vessel p={[0.03, 0.405, 0]} rt={0.045} rb={0.04} h={0.13} m={B.glass} inner={B.glassIn} t={0.004} />
        <Part geo={cyl(0.04, 0.036, 0.09, 14)} m={B.lemonade} p={[0.03, 0.455, 0]} castShadow={false} />
        <Part geo={cyl(0.005, 0.005, 0.17, 6)} m={B.coral} p={[0.045, 0.5, 0]} rotation-z={-0.25} castShadow={false} />
      </group>
      {/* le seau de plage et sa pelle */}
      <group position={[0.7, 0, -3.4]}>
        <Vessel p={[0, 0, 0]} rt={0.13} rb={0.1} h={0.2} m={B.turquoise} inner={B.turquoise} t={0.01} />
        <Part geo={cyl(innerR(0.13, 0.1, 0.2, 0.13, 0.01), innerR(0.13, 0.1, 0.2, 0.0, 0.01), 0.13, 16)} m={B.sand} p={[0, 0.07, 0]} castShadow={false} />
        <Part m={B.butter} p={[0, 0.2, 0]} rotation-y={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.13, 0.008, 6, 16, Math.PI]} />
        </Part>
        <group position={[0.05, 0.2, 0.02]} rotation-z={-0.45}>
          <Part geo={cyl(0.012, 0.012, 0.26, 8)} m={B.coral} p={[0, 0.1, 0]} castShadow={false} />
          <Part geo={rbox(0.08, 0.1, 0.012, 0.01)} m={B.coral} p={[0, -0.06, 0]} castShadow={false} />
        </group>
      </group>
    </>
  )
}
