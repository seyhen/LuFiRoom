import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, TubeGeometry, Vector3, type Group, type Mesh, type Texture } from 'three'
import { isActive, useStore } from '../../state/store'
import { reduceMotion, useSquash } from '../anim'
import { Part, SPH, cyl, rbox, worldUV, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { BathSteam } from './BathSteam'
import { B } from './materials'
import { Towel } from './Towel'

/** Où est la douche : un bac carré dans l'angle de gauche, le long du mur de gauche (x = -3), entre z = 0,4 et z = 1,9. */
const TRAY = { x0: -2.92, x1: -1.5, z0: 0.4, z1: 1.9, h: 0.08 }
/** L'axe de la pomme : au milieu du bac, la tête à 2,5 de haut. */
export const HEAD: V3 = [-2.3, 2.5, 1.15]
const ARM = HEAD[0] - -2.92 // la longueur du bras, du mur à l'axe de la pomme

/** La flexible de la douchette : un tube de chrome qui descend du support, fait une boucle et rejoint le mitigeur. */
const HOSE = new TubeGeometry(
  new CatmullRomCurve3([[0, 0, 0], [0.03, -0.14, 0.02], [0.1, -0.3, 0.1], [0.04, -0.46, 0.18], [0.01, -0.58, 0.1], [0, -0.66, 0.02]].map(([x, y, z]) => new Vector3(x, y, z)), false, 'centripetal'),
  28, 0.011, 8, false,
)

/** Une bouteille de gel douche ou de shampoing : un flacon, une épaule, un bouchon, une étiquette. `p` est le pied. */
function Bottle({ p, m, h = 0.17, r = 0.036, pump = false }: { p: V3; m: typeof B.bottleRose; h?: number; r?: number; pump?: boolean }) {
  return (
    <group position={p}>
      <Part geo={cyl(r, r * 1.03, h, 16)} m={m} p={[0, h / 2, 0]} castShadow={false} />
      <Part geo={SPH} m={m} scale={[r, r * 0.55, r]} p={[0, h, 0]} castShadow={false} />
      <Part geo={cyl(r * 0.42, r * 0.42, 0.035, 10)} m={B.bottleCap} p={[0, h + r * 0.55 + 0.012, 0]} castShadow={false} />
      {pump && <Part geo={rbox(0.05, 0.016, 0.014, 0.006)} m={B.bottleCap} p={[0.02, h + r * 0.55 + 0.036, 0]} castShadow={false} />}
    </group>
  )
}

/**
 * Le bac et les murs de la douche à l'italienne (le décor immobile) : un bac de porcelaine blanche avec sa bonde de chrome et son
 * caillebotis de chêne, le mur de zellige rose jusqu'à 2,7 m avec une tablette (flacons, savon), le mitigeur à levier et la douchette sur
 * son support, un écran de verre sur le côté de la caméra dans un cadre de chrome, une raclette accrochée à l'écran et une serviette
 * posée sur sa barre.
 */
export function ShowerStall() {
  const { x0, x1, z0, z1, h } = TRAY, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0
  return (
    <>
      {/* le mur de zellige, plus épais que le soubassement qu'il recouvre (il dépasse de 3 cm) */}
      <Part geo={worldUV(rbox(0.08, 2.7, d - 0.04, 0.012), 0.8)} m={B.zellige} p={[-2.96, 1.35, cz]} />
      <Part geo={rbox(0.1, 0.05, d, 0.015)} m={B.trim} p={[-2.95, 2.72, cz]} castShadow={false} />
      {/* le bac : un cadre de porcelaine, un fond en pente douce, la bonde */}
      <Part geo={rbox(w, h, d, 0.03)} m={B.ceramic} p={[cx, h / 2, cz]} />
      <Part geo={cyl(0.075, 0.075, 0.012, 20)} m={B.chrome} p={[-2.2, h + 0.006, cz]} castShadow={false} />
      {[-0.03, 0, 0.03].map((k) => <Part key={k} geo={rbox(0.1, 0.004, 0.01, 0.002)} m={B.ink} p={[-2.2, h + 0.014, cz + k]} castShadow={false} />)}
      {/* le caillebotis : deux tasseaux, huit lattes, un peu de mousse de savon oubliée */}
      {[0.75, 1.55].map((z) => <Part key={z} geo={rbox(0.9, 0.018, 0.05, 0.006)} m={B.woodDark} p={[-2.2, h + 0.009 + 0.001, z]} castShadow={false} />)}
      {Array.from({ length: 8 }, (_, i) => <Part key={i} geo={rbox(0.09, 0.022, 1.0, 0.008)} m={B.woodLight} p={[-2.62 + i * 0.12, h + 0.029, cz]} castShadow={false} />)}
      {/* la tablette de zellige : un support, une planche de porcelaine, les flacons et le savon */}
      <Part geo={rbox(0.17, 0.03, 0.78, 0.01)} m={B.ceramic} p={[-2.83, 1.25, 0.88]} castShadow={false} />
      {[0.58, 1.18].map((z) => <Part key={z} geo={rbox(0.14, 0.04, 0.03, 0.01)} m={B.brass} p={[-2.84, 1.22, z]} castShadow={false} />)}
      <Bottle p={[-2.84, 1.265, 0.62]} m={B.bottleRose} pump />
      <Bottle p={[-2.84, 1.265, 0.78]} m={B.bottleSage} h={0.2} r={0.033} />
      <Bottle p={[-2.83, 1.265, 0.95]} m={B.bottleBlue} h={0.14} r={0.04} />
      <Part geo={rbox(0.09, 0.026, 0.06, 0.012)} m={B.soapGreen} p={[-2.82, 1.28, 1.12]} castShadow={false} />
      {/* le mitigeur : une rosace de chrome, un levier, sa petite goutte de porcelaine */}
      <group position={[-2.9, 1.0, 0.72]} rotation-y={Math.PI / 2}>
        <Part geo={cyl(0.09, 0.1, 0.03, 20)} m={B.chrome} p={[0, 0, 0.02]} rotation-x={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.04, 0.04, 0.06, 12)} m={B.chrome} p={[0, 0, 0.06]} rotation-x={Math.PI / 2} castShadow={false} />
        <Part geo={rbox(0.03, 0.03, 0.15, 0.012)} m={B.chrome} p={[0.05, 0, 0.1]} rotation-y={0.35} castShadow={false} />
        <Part geo={cyl(0.026, 0.026, 0.02, 14)} m={B.ceramicBlue} p={[0, 0, 0.095]} rotation-x={Math.PI / 2} castShadow={false} />
      </group>
      {/* le support de la douchette et la douchette qui y pend, son flexible */}
      <group position={[-2.9, 1.72, 1.12]}>
        <Part geo={rbox(0.05, 0.1, 0.035, 0.012)} m={B.chrome} castShadow={false} />
        <Part geo={cyl(0.05, 0.04, 0.16, 14)} m={B.chrome} p={[0.07, -0.05, 0]} rotation-z={0.12} castShadow={false} />
        <Part geo={cyl(0.07, 0.05, 0.04, 16)} m={B.chrome} p={[0.085, 0.07, 0]} rotation-z={0.12} castShadow={false} />
        <Part geo={HOSE} m={B.chrome} p={[0.07, -0.13, 0]} rotation-z={0} castShadow={false} />
      </group>
      {/* l'écran de verre : un cadre de chrome (rail du bas, rail du haut, deux montants) et un verre à peine teinté, côté caméra */}
      <Part geo={rbox(w, 0.04, 0.04, 0.012)} m={B.chrome} p={[cx, h + 0.04, z1 + 0.02]} castShadow={false} />
      <Part geo={rbox(w, 0.04, 0.04, 0.012)} m={B.chrome} p={[cx, 2.0, z1 + 0.02]} castShadow={false} />
      {[x0 + 0.02, x1 - 0.02].map((x) => <Part key={x} geo={rbox(0.04, 1.96 - h, 0.04, 0.012)} m={B.chrome} p={[x, (2.02 + h + 0.02) / 2, z1 + 0.02]} castShadow={false} />)}
      <mesh material={B.screen} position={[cx, (2.0 + h + 0.04) / 2, z1 + 0.02]} raycast={() => {}} renderOrder={2}>
        <boxGeometry args={[w - 0.1, 2.0 - h - 0.1, 0.012]} />
      </mesh>
      {/* la poignée de la porte : une barre de chrome, à l'extérieur */}
      <Part geo={cyl(0.012, 0.012, 0.5, 8)} m={B.chrome} p={[x1 - 0.14, 1.05, z1 + 0.07]} castShadow={false} />
      {[0.84, 1.26].map((y) => <Part key={y} geo={cyl(0.012, 0.012, 0.05, 6)} m={B.chrome} p={[x1 - 0.14, y, z1 + 0.045]} rotation-x={Math.PI / 2} castShadow={false} />)}
      {/* la raclette : un manche de chrome et sa lame de caoutchouc, accrochées au montant par un crochet */}
      <group position={[x0 + 0.02, 1.7, z1 + 0.07]}>
        <Part geo={cyl(0.01, 0.01, 0.4, 8)} m={B.chrome} p={[0, 0, 0]} castShadow={false} />
        <Part geo={rbox(0.14, 0.03, 0.016, 0.006)} m={B.ceramicBlue} p={[0, -0.21, 0]} castShadow={false} />
        <Part geo={rbox(0.15, 0.012, 0.008, 0.003)} m={B.ink} p={[0, -0.235, 0]} castShadow={false} />
      </group>
      {/* une serviette de bain rose sur le rail du haut, qui retombe sur l'extérieur de l'écran */}
      <Towel position={[cx + 0.3, 2.0, z1 + 0.1]} width={0.42} drop={0.68} m={B.towelRose} />
    </>
  )
}

/**
 * La pomme de douche à effet pluie, objet « douche » : un bras de chrome qui sort du mur à 2,5 m, une large tête ronde (bord, joint de
 * laiton, capot bombé). Quand le son joue, une nappe de pluie fine en tombe sur le caillebotis (un cône ouvert dont la texture défile),
 * la vapeur monte du bac et la buée gagne la fenêtre. `position` est la tête ; le bras part vers le mur de gauche (-x).
 */
export function Shower() {
  const g = useRef<Group>(null!), rainA = useRef<Mesh>(null!), rainB = useRef<Mesh>(null!)
  useSquash('shower', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), on = isActive(useStore.getState(), 'shower')
    ;(B.rain.map as Texture).offset.y -= reduceMotion ? 0 : dt * 2.4
    rainA.current.visible = on
    rainB.current.visible = on
  })
  const drop = HEAD[1] - 0.09 - TRAY.h - 0.04 // la hauteur de la nappe : de la tête au caillebotis
  return (
    <>
      <group ref={g} userData={{ id: 'shower' }} position={HEAD}>
        <Static>
          {/* le bras : une rosace au mur, un tube qui sort et se relève, une rotule sous la tête */}
          <Part geo={cyl(0.06, 0.065, 0.03, 18)} m={B.chrome} p={[-ARM + 0.015, 0.0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.02, 0.02, ARM - 0.12, 10)} m={B.chrome} p={[-ARM / 2 - 0.0, 0.04, 0]} rotation-z={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.02, 0.02, 0.08, 10)} m={B.chrome} p={[-0.04, 0.025, 0]} castShadow={false} />
          <Part geo={SPH} m={B.chrome} scale={0.035} p={[0, 0.02, 0]} castShadow={false} />
          {/* la tête : un disque bombé, son joint de laiton, la cuvette des buses, un anneau en relief sur le dessus */}
          <Part geo={cyl(0.2, 0.19, 0.045, 32)} m={B.chrome} p={[0, -0.02, 0]} />
          <Part geo={cyl(0.205, 0.205, 0.012, 32)} m={B.brass} p={[0, 0.003, 0]} castShadow={false} />
          <Part geo={SPH} m={B.chrome} scale={[0.185, 0.035, 0.185]} p={[0, 0.005, 0]} castShadow={false} />
          <Part m={B.chrome} p={[0, 0.032, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.1, 0.007, 8, 32]} />
          </Part>
          <Part geo={cyl(0.17, 0.17, 0.008, 32)} m={B.ceramic} p={[0, -0.046, 0]} castShadow={false} />
        </Static>
        {/* la pluie : deux nappes ouvertes, l'une dans l'autre, la texture de filets qui défile vers le bas */}
        <mesh ref={rainA} material={B.rain} position={[0, -0.09 - drop / 2, 0]} userData={LIVE} raycast={() => {}} renderOrder={5}>
          <cylinderGeometry args={[0.17, 0.215, drop, 28, 1, true]} />
        </mesh>
        <mesh ref={rainB} material={B.rain} position={[0, -0.09 - drop / 2, 0]} rotation-y={1.3} scale={[0.82, 1, 0.82]} userData={LIVE} raycast={() => {}} renderOrder={5}>
          <cylinderGeometry args={[0.17, 0.215, drop, 24, 1, true]} />
        </mesh>
      </group>
      <BathSteam at={[HEAD[0], TRAY.h + 0.2, HEAD[2]]} every={1.5} only={['shower']} size={0.55} spread={0.3} />
    </>
  )
}
