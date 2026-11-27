import { Part, SPH, SPH_MID, cyl, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { A } from './materials'
import { BIN, IN, ROW_X, SEAT_Z } from './layout'

const SEAT_TOP = 0.512
/** Le plan de la face des coffres (on pose l'ouverture juste devant). */
const FACE = IN + BIN.depth + 0.008

/**
 * Le coffre ouvert au-dessus de la rangée 2 (la porte de x = 0 à 1,2) : l'ouverture sombre et son cadre, la porte relevée, un sac à dos
 * corail qui dépasse, une veste lilas roulée dont une manche pend, la sangle du sac qui retombe.
 */
function OpenBin() {
  const y0 = BIN.y0 + 0.17, y1 = BIN.y1 - 0.17, cx = 0.6, w = 1.12
  return (
    <group>
      <mesh material={A.binIn} position={[cx, (y0 + y1) / 2, FACE]}>
        <planeGeometry args={[w, y1 - y0]} />
      </mesh>
      {/* le cadre de l'ouverture */}
      {[y0 - 0.015, y1 + 0.015].map((y) => <Part key={y} geo={rbox(w + 0.06, 0.035, 0.03, 0.012)} m={A.binPlain} p={[cx, y, FACE + 0.01]} castShadow={false} />)}
      {[-1, 1].map((s) => <Part key={s} geo={rbox(0.035, y1 - y0 + 0.06, 0.03, 0.012)} m={A.binPlain} p={[cx + s * (w / 2 + 0.015), (y0 + y1) / 2, FACE + 0.01]} castShadow={false} />)}
      {/* la porte, relevée autour de sa charnière du haut, sa poignée creuse */}
      <group position={[cx, BIN.y1 - 0.15, FACE + 0.01]} rotation-x={-2.0}>
        <Part geo={rbox(1.14, 0.68, 0.035, 0.015)} m={A.binPlain} p={[0, -0.34, 0.02]} castShadow={false} />
        <Part geo={rbox(0.42, 0.06, 0.012, 0.005)} m={A.binDark} p={[0, -0.6, 0.04]} castShadow={false} />
      </group>
      {/* le sac à dos : un corps, une poche, une poignée, la sangle qui pend hors du coffre et sa boucle */}
      <Part geo={rbox(0.42, 0.46, 0.26, 0.09)} m={A.sock} p={[cx - 0.24, y0 + 0.24, FACE - 0.03]} castShadow={false} />
      <Part geo={rbox(0.3, 0.2, 0.07, 0.03)} m={A.sock} p={[cx - 0.24, y0 + 0.16, FACE + 0.12]} castShadow={false} />
      <Part geo={rbox(0.26, 0.01, 0.012, 0.004)} m={A.binDark} p={[cx - 0.24, y0 + 0.26, FACE + 0.156]} castShadow={false} />
      <Part m={A.strap} p={[cx - 0.24, y0 + 0.47, FACE + 0.02]} castShadow={false}>
        <torusGeometry args={[0.06, 0.012, 6, 12, Math.PI]} />
      </Part>
      <Part geo={rbox(0.05, 0.5, 0.014, 0.006)} m={A.strap} p={[cx - 0.4, y0 - 0.2, FACE + 0.05]} rotation-z={0.06} castShadow={false} />
      <Part geo={rbox(0.065, 0.04, 0.02, 0.008)} m={A.steel} p={[cx - 0.41, y0 - 0.33, FACE + 0.06]} castShadow={false} />
      {/* la veste roulée, sa manche qui retombe par-dessus le bord */}
      <Part geo={cyl(0.13, 0.13, 0.48, 16)} m={A.blanketPlain} p={[cx + 0.24, y0 + 0.14, FACE - 0.02]} rotation-z={Math.PI / 2} castShadow={false} />
      <Part geo={SPH_MID} m={A.blanketPlain} scale={[0.06, 0.12, 0.12]} p={[cx + 0.48, y0 + 0.14, FACE - 0.02]} castShadow={false} />
      <Part geo={rbox(0.12, 0.34, 0.06, 0.03)} m={A.blanketPlain} p={[cx + 0.34, y0 - 0.1, FACE + 0.1]} rotation-z={-0.08} castShadow={false} />
      <Part geo={rbox(0.13, 0.04, 0.065, 0.02)} m={A.coverPlain} p={[cx + 0.35, y0 - 0.27, FACE + 0.1]} rotation-z={-0.08} castShadow={false} />
    </group>
  )
}

/** Un coussin de nuque en U (menthe, sa pression), un masque de nuit corail à élastique, sur un siège. `position` : le dessus de l'assise. */
function NeckPillow({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Part m={A.pillow} p={[-0.04, 0.05, -0.08]} rotation-x={-Math.PI / 2} rotation-z={0.6} castShadow={false}>
        <torusGeometry args={[0.13, 0.055, 10, 22, Math.PI * 1.45]} />
      </Part>
      <Part geo={SPH} m={A.plainWhite} scale={0.016} p={[-0.04 + Math.cos(0.6) * 0.13, 0.1, -0.08 - Math.sin(0.6) * 0.13]} castShadow={false} />
      {/* le masque : un bandeau aux deux coques, le pont du nez, l'élastique en deux brins qui partent sur les côtés */}
      <group position={[0.06, 0.012, 0.2]} rotation-y={0.4}>
        <Part geo={rbox(0.1, 0.018, 0.22, 0.009)} m={A.sock} p={[0, 0.009, 0]} castShadow={false} />
        {[-1, 1].map((s) => <Part key={s} geo={SPH_MID} m={A.sock} scale={[0.05, 0.016, 0.055]} p={[0, 0.016, s * 0.055]} castShadow={false} />)}
        {[-1, 1].map((s) => <Part key={`b${s}`} geo={rbox(0.012, 0.006, 0.07, 0.003)} m={A.cream} p={[-0.02, 0.004, s * 0.14]} rotation-y={s * 0.3} castShadow={false} />)}
      </group>
    </group>
  )
}

/** Le plaid de la compagnie, lilas à bande ivoire, en tas sur l'assise ; un pan retombe devant. `position` : le dessus de l'assise. */
function Blanket({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Part geo={rbox(0.5, 0.06, 0.6, 0.03)} m={A.blanketPlain} p={[0.0, 0.03, 0]} rotation-y={0.08} castShadow={false} />
      <Part geo={rbox(0.34, 0.08, 0.44, 0.04)} m={A.blanketPlain} p={[-0.04, 0.09, 0.05]} rotation-y={-0.3} rotation-z={0.06} castShadow={false} />
      <Part geo={rbox(0.36, 0.088, 0.07, 0.04)} m={A.coverPlain} p={[-0.04, 0.09, 0.05]} rotation-y={-0.3} rotation-z={0.06} castShadow={false} />
      {/* le pan qui glisse par-dessus le bord de l'assise : un rouleau mou sur l'arête, puis un pan qui s'écarte en biais, son bas arrondi */}
      <Part geo={cyl(0.05, 0.05, 0.54, 12)} m={A.blanketPlain} p={[0.3, 0.0, 0.03]} rotation-x={Math.PI / 2} castShadow={false} />
      {/* le pan penche vers l'extérieur en descendant (haut contre le rouleau, bas plus loin) et finit sur l'ourlet roulé, sans jour entre les deux */}
      <Part geo={rbox(0.05, 0.25, 0.5, 0.025)} m={A.blanketPlain} p={[0.365, -0.125, 0.04]} rotation-z={0.42} castShadow={false} />
      <Part geo={cyl(0.034, 0.034, 0.48, 10)} m={A.blanketPlain} p={[0.415, -0.24, 0.04]} rotation-x={Math.PI / 2} castShadow={false} />
    </group>
  )
}

/** Une basket : semelle blanche, tige violette, bout rond, ouverture sombre, lacets crème, languette. `position` : le sol. */
function Sneaker({ position, ry = 0, side = false }: { position: V3; ry?: number; side?: boolean }) {
  return (
    // couchée sur le flanc, la semelle tournée vers le fond (-z) : on en voit la tranche, la tige et ses lacets regardent la caméra
    <group position={position} rotation-y={ry} rotation-x={side ? Math.PI / 2 - 0.1 : 0}>
      <group position={[0, side ? -0.055 : 0, 0]}>
        <Part geo={rbox(0.3, 0.04, 0.11, 0.018)} m={A.plainWhite} p={[0, 0.02, 0]} castShadow={false} />
        <Part geo={rbox(0.19, 0.1, 0.1, 0.045)} m={A.folio} p={[-0.045, 0.085, 0]} castShadow={false} />
        <Part geo={SPH_MID} m={A.folio} scale={[0.09, 0.05, 0.05]} p={[0.06, 0.055, 0]} castShadow={false} />
        <Part geo={SPH_MID} m={A.plainWhite} scale={[0.04, 0.03, 0.052]} p={[0.115, 0.045, 0]} castShadow={false} />
        {/* l'ouverture : un ovale bleu nuit, pas un trou noir (il faisait tache) */}
        <Part geo={SPH_MID} m={A.seatDark} scale={[0.045, 0.008, 0.032]} p={[-0.085, 0.133, 0]} castShadow={false} />
        {[0, 1, 2].map((i) => <Part key={i} geo={rbox(0.012, 0.008, 0.07, 0.003)} m={A.cream} p={[0.0 + i * 0.03, 0.12 - i * 0.017, 0]} rotation-z={-0.5} castShadow={false} />)}
        <Part geo={rbox(0.025, 0.05, 0.05, 0.01)} m={A.cream} p={[-0.14, 0.11, 0]} castShadow={false} />
      </group>
    </group>
  )
}

/**
 * Les affaires des passagers qui dorment : le coffre ouvert de la rangée 2, le coussin de nuque et le masque sur le siège D de la rangée 2,
 * le plaid en tas sur le siège D de la rangée 1, les baskets enlevées sur la moquette devant la rangée 2 (l'une couchée). Décor immobile.
 */
export function Belongings() {
  const [r1, r2] = ROW_X
  return (
    <Static>
      <OpenBin />
      <NeckPillow position={[r2, SEAT_TOP, SEAT_Z.D]} />
      <Blanket position={[r1, SEAT_TOP, SEAT_Z.D]} />
      <group position={[1.78, 0, 1.42]} scale={1.6}>
        <Sneaker position={[0, 0, 0]} ry={0.5} />
        <Sneaker position={[0.06, 0, 0.16]} ry={-0.3} side />
      </group>
    </Static>
  )
}
