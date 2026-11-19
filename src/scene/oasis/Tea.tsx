import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, LatheGeometry, TubeGeometry, Vector2, Vector3 } from 'three'
import { smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
import { Leaf } from '../nature/Leaf'
import { Part, SPH, cyl, orient, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { Steam } from '../objects/Steam'
import { Vessel, innerR } from '../igloo/Vessel'
import { D } from './materials'

const STAND_H = 0.34 // le dessus du pied pliant
const TRAY_TOP = STAND_H + 0.03 // le plateau posé dessus

// le ventre de la théière : pied, panse, épaule, col (rayon, hauteur)
const POT = new LatheGeometry([[0.0, 0], [0.07, 0], [0.075, 0.012], [0.095, 0.058], [0.092, 0.1], [0.07, 0.14], [0.052, 0.162], [0.054, 0.172]].map(([r, y]) => new Vector2(r, y)), 28)
// le bec : un tube qui monte en s, du ventre vers le haut et dehors
const SPOUT = new TubeGeometry(new CatmullRomCurve3([new Vector3(0.082, 0.05, 0), new Vector3(0.13, 0.085, 0), new Vector3(0.17, 0.16, 0), new Vector3(0.19, 0.225, 0)]), 16, 0.014, 8)
// le bol du brasero : une coupe évasée en terre cuite
const MANGAL = new LatheGeometry([[0.0, 0], [0.12, 0], [0.15, 0.03], [0.19, 0.11], [0.215, 0.2], [0.21, 0.21], [0.185, 0.2], [0.15, 0.11], [0.12, 0.05], [0.0, 0.04]].map(([r, y]) => new Vector2(r, y)), 28)

/** Un verre à thé : le verre ouvert, sa bague dorée, le thé ambré, une brindille de menthe. */
function Glass({ p, mint = false }: { p: V3; mint?: boolean }) {
  const h = 0.07, rt = 0.03, rb = 0.025, y = 0.052
  return (
    <group position={p}>
      <Vessel p={[0, 0, 0]} rt={rt} rb={rb} h={h} m={D.glass} inner={D.glass} rim={D.glassRim} t={0.004} />
      <Part geo={cyl(innerR(rt, rb, h, y, 0.004), innerR(rt, rb, h, y, 0.004), 0.004, 20)} m={D.tea} p={[0, y, 0]} castShadow={false} />
      <Part geo={cyl(rt + 0.001, rt + 0.001, 0.012, 20)} m={D.glassRim} p={[0, h - 0.016, 0]} castShadow={false} />
      {mint && [0, 1, 2].map((i) => (
        <group key={i} position={[0, 0.045, 0]} rotation-y={i * 2.1}>
          <Leaf kind="ovate" w={0.018} l={0.04} m={D.mint} r={[-1.1, 0, 0]} p={[0, 0, 0.005]} />
        </group>
      ))}
    </group>
  )
}

/**
 * Le thé à la menthe, sur un plateau de cuivre gravé posé sur un pied pliant en X : une théière d'argent à long bec (panse, épaule, col,
 * couvercle à bouton, bec en S, anse), trois verres dorés avec de la menthe, un pain de sucre dans son papier bleu, un bouquet de
 * menthe, de la vapeur fine. `position` est le sol sous le plateau.
 */
export function TeaTray({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Static>
        {/* le pied pliant : deux X de bois croisés, une planchette ronde en haut, des petits pieds */}
        {[-0.2, 0.2].map((z) => [-1, 1].map((s) => (
          <Part key={`${z}${s}`} geo={cyl(0.017, 0.017, 0.5, 8)} m={D.woodDark} p={[0, STAND_H / 2 - 0.005, z]} rotation-z={s * 0.5} castShadow={false} />
        )))}
        {[-0.2, 0.2].map((z) => <Part key={z} geo={cyl(0.024, 0.024, 0.02, 10)} m={D.iron} p={[0, STAND_H / 2 - 0.005, z]} rotation-x={Math.PI / 2} castShadow={false} />)}
        <Part geo={cyl(0.31, 0.31, 0.025, 28)} m={D.woodDark} p={[0, STAND_H - 0.0125 + 0.012, 0]} castShadow={false} />
        {/* le plateau : un fond gravé (le dessus porte la texture), un rebord roulé en tube */}
        <Part geo={cyl(0.4, 0.37, 0.025, 40)} m={[D.copper, D.tray, D.copper]} p={[0, STAND_H + 0.012, 0]} />
        <Part m={D.copper} p={[0, STAND_H + 0.027, 0]} rotation-x={Math.PI / 2} castShadow={false}><torusGeometry args={[0.395, 0.013, 8, 44]} /></Part>
        {/* la théière, agrandie un peu pour se lire : panse, couvercle, bouton, bec, anse, une bague de laiton */}
        <group position={[-0.06, TRAY_TOP + 0.013, 0.04]} rotation-y={0.5} scale={1.3}>
          <mesh geometry={POT} material={D.silver} castShadow receiveShadow />
          <Part geo={cyl(0.095, 0.095, 0.014, 28)} m={D.brass} p={[0, 0.04, 0]} castShadow={false} />
          <Part geo={SPH} m={D.silver} scale={[0.054, 0.03, 0.054]} p={[0, 0.176, 0]} />
          <Part geo={cyl(0.018, 0.024, 0.014, 12)} m={D.silverDark} p={[0, 0.2, 0]} castShadow={false} />
          <Part geo={SPH} m={D.brass} scale={0.02} p={[0, 0.218, 0]} castShadow={false} />
          <mesh geometry={SPOUT} material={D.silver} castShadow />
          <Part m={D.brass} p={[0.192, 0.228, 0]} rotation-x={Math.PI / 2} castShadow={false}><torusGeometry args={[0.014, 0.005, 6, 12]} /></Part>
          <Part m={D.silverDark} p={[-0.085, 0.1, 0]} rotation-z={Math.PI * 0.5 + 0.1} castShadow={false}><torusGeometry args={[0.07, 0.009, 8, 20, Math.PI]} /></Part>
          <Part geo={rbox(0.02, 0.026, 0.026, 0.008)} m={D.silverDark} p={[-0.082, 0.165, 0]} castShadow={false} />
        </group>
        {/* les trois verres, sur le plateau, devant la théière */}
        <Glass p={[0.2, TRAY_TOP + 0.013, -0.12]} mint />
        <Glass p={[0.22, TRAY_TOP + 0.013, 0.1]} />
        <Glass p={[0.03, TRAY_TOP + 0.013, 0.24]} mint />
        {/* le pain de sucre dans son papier bleu, debout sur le bord */}
        <Part m={D.sugar} p={[-0.27, TRAY_TOP + 0.013 + 0.055, -0.14]}><coneGeometry args={[0.04, 0.11, 14]} /></Part>
        <Part geo={cyl(0.034, 0.039, 0.045, 14)} m={D.blanketStripe} p={[-0.27, TRAY_TOP + 0.013 + 0.03, -0.14]} castShadow={false} />
        {/* le bouquet de menthe, noué d'une ficelle, couché sur le bord de devant */}
        <group position={[-0.17, TRAY_TOP + 0.018, 0.28]} rotation-y={2.2}>
          {[0, 1, 2, 3, 4, 5].map((i) => <Leaf key={i} kind="ovate" w={0.026} l={0.07} m={D.mint} p={[0.04, 0.005 + (i % 3) * 0.004, 0]} r={[-0.1, (i - 2.5) * 0.17, 0]} />)}
          <Part geo={cyl(0.012, 0.012, 0.012, 8)} m={D.rope} p={[0.045, 0.012, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        </group>
      </Static>
      <Steam at={[-0.06 + 0.2, TRAY_TOP + 0.35, 0.04 - 0.05]} every={1.5} />
    </group>
  )
}

/**
 * Le brasero de terre cuite : une coupe évasée sur trois pieds, deux anses, des braises qui rougeoient (plus la nuit), de la cendre,
 * une bouilloire noircie dessus (sa vapeur), et à côté deux morceaux de charbon et une pince. `position` est le sol.
 */
export function Brazier({ position }: { position: V3 }) {
  useFrame(({ clock }) => {
    const t = clock.elapsedTime, e = smooth(mood.night)
    D.coalGlow.opacity = (0.28 + e * 0.4) * (reduceMotion ? 1 : 0.85 + Math.sin(t * 2.3) * 0.08 + Math.sin(t * 5.1) * 0.05)
  })
  return (
    <group position={position}>
      <Static>
        {[0, 1, 2].map((i) => {
          const a = (i / 3) * Math.PI * 2 + 0.4
          return <Part key={i} geo={cyl(0.02, 0.014, 0.1, 7)} m={D.clayDark} p={[Math.cos(a) * 0.1, 0.05, Math.sin(a) * 0.1]} rotation={[-Math.sin(a) * 0.25, 0, Math.cos(a) * 0.25]} castShadow={false} />
        })}
        <mesh geometry={MANGAL} material={D.clayPlain} position={[0, 0.09, 0]} castShadow receiveShadow />
        <Part m={D.clayDark} p={[0, 0.3, 0]} rotation-x={Math.PI / 2} castShadow={false}><torusGeometry args={[0.2, 0.012, 8, 28]} /></Part>
        {[-1, 1].map((s) => <Part key={s} m={D.clayDark} p={[s * 0.2, 0.24, 0]} rotation-y={Math.PI / 2} castShadow={false}><torusGeometry args={[0.04, 0.01, 8, 14, Math.PI]} /></Part>)}
        {/* la cendre grise et les braises noires, dedans */}
        <Part geo={cyl(0.17, 0.17, 0.01, 22)} m={D.coal} p={[0, 0.25, 0]} castShadow={false} />
        {[[0.05, 0.07, 0.07], [-0.07, 0.03, 0.06], [0.0, -0.08, 0.065], [-0.08, -0.05, 0.05], [0.08, -0.04, 0.05]].map(([x, z, r], i) => <Part key={i} geo={SPH} m={D.coal} scale={[r, r * 0.7, r]} p={[x, 0.27, z]} castShadow={false} />)}
        {/* la bouilloire noircie : panse, couvercle, bouton, bec court, anse de fer */}
        <group position={[0.02, 0.272, 0.0]}>
          <Part geo={SPH} m={D.iron} scale={[0.13, 0.095, 0.13]} p={[0, 0.09, 0]} />
          <Part geo={cyl(0.07, 0.085, 0.02, 20)} m={D.iron} p={[0, 0.172, 0]} castShadow={false} />
          <Part geo={SPH} m={D.brass} scale={0.018} p={[0, 0.196, 0]} castShadow={false} />
          <Part geo={cyl(0.018, 0.03, 0.12, 8)} m={D.iron} p={[0.15, 0.17, 0]} rotation-z={-0.9} castShadow={false} />
          <Part m={D.iron} p={[0, 0.17, 0]} rotation-y={Math.PI / 2} castShadow={false}><torusGeometry args={[0.12, 0.008, 6, 20, Math.PI]} /></Part>
        </group>
      </Static>
      {/* le rougeoiement des braises, sur le dessus (juste au-dessus de la cendre) */}
      <mesh material={D.coalGlow} position={[0, 0.262, 0]} rotation-x={-Math.PI / 2} renderOrder={2}><circleGeometry args={[0.16, 20]} /></mesh>
      <Steam at={[0.2, 0.62, 0]} every={1.7} />
      {/* du charbon à côté et la pince : deux fers croisés, et une poignée de braises éteintes */}
      <Static>
        {[[0.34, 0.12, 0.05, 0.4], [0.4, 0.24, 0.04, 1.0], [0.3, 0.3, 0.035, 2.0]].map(([x, z, r, ry], i) => <Part key={i} geo={rbox(r * 2, r * 1.2, r * 1.6, r * 0.5)} m={D.coal} p={[x, r * 0.6, z]} rotation-y={ry} castShadow={false} />)}
        <Part geo={cyl(0.007, 0.007, 0.42, 5)} m={D.iron} p={[-0.2, 0.012, 0.3]} rotation={orient([1, 0.02, 0.35])} castShadow={false} />
        <Part geo={cyl(0.007, 0.007, 0.42, 5)} m={D.iron} p={[-0.2, 0.026, 0.3]} rotation={orient([1, 0.02, 0.2])} castShadow={false} />
      </Static>
    </group>
  )
}
