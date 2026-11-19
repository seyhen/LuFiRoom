import { useFrame } from '@react-three/fiber'
import { Color } from 'three'
import { smooth } from '../../math'
import { mood } from '../anim'
import { Batch, Part, SPH, cyl, noRay, rbox } from '../parts'
import { Static } from '../Static'
import { A, facePlane } from './materials'
import { BIN, IN, ROW_X } from './layout'

const L = 5.5 // la longueur du coffre du flanc (de x = -2,38 à 3,12)
const BX0 = -2.38
const BIN_H = BIN.y1 - BIN.y0

/** Un petit bloc de services au-dessus de chaque rangée, sous le coffre du flanc : la lentille de lecture, la bouche d'air, le bouton d'appel. */
function Psu({ x, lens = true }: { x: number; lens?: boolean }) {
  return (
    <group position={[x, BIN.y0, IN + 0.3]}>
      <Part geo={rbox(0.58, 0.06, 0.32, 0.025)} m={A.psu} p={[0, -0.025, 0]} castShadow={false} />
      {lens && <Part geo={cyl(0.045, 0.045, 0.014, 18)} m={A.lens} p={[-0.17, -0.06, 0]} castShadow={false} />}
      <Part geo={SPH} m={A.nozzle} scale={0.04} p={[0.02, -0.07, 0]} castShadow={false} />
      <Part geo={cyl(0.022, 0.022, 0.012, 12)} m={A.button} p={[0.19, -0.058, 0.04]} castShadow={false} />
      <Part geo={rbox(0.08, 0.008, 0.04, 0.003)} m={A.binDark} p={[0.19, -0.056, -0.06]} castShadow={false} />
    </group>
  )
}

const DAY_LED = new Color(0xfff0d8), NIGHT_LED = new Color(0x8794ff), tmp = new Color()
/** Les points du couloir : des pastilles de 5 cm de large tous les 0,55, de chaque côté de l'allée. */
const FLOOR_LIGHTS = [-0.02, 1.12].flatMap((z) => Array.from({ length: 11 }, (_, i) => ({ p: [-2.5 + i * 0.55, 0.014, z] as [number, number, number], s: 1 })))

/**
 * Le plafond de la cabine, côté flanc et côté cloison arrière : les coffres à bagages (ivoire, portes de 1,2 avec leur poignée creuse),
 * leur bandeau de lumière indirecte (blanc chaud le jour, indigo la nuit, avec sa lueur qui lave le mur), les blocs de services,
 * les écriteaux lumineux (sortie, ceinture), et les pastilles de guidage du couloir qui s'allument pour la nuit.
 */
export function Overhead() {
  useFrame(() => {
    const n = smooth(mood.night)
    A.led.color.copy(tmp.copy(DAY_LED).lerp(NIGHT_LED, n))
    A.ledGlow.color.copy(A.led.color)
    A.ledGlow.opacity = 0.1 + n * 0.5
    A.floorLight.color.setRGB(0.5 + n * 0.45, 0.55 + n * 0.4, 0.7 + n * 0.3)
  })
  return (
    <>
      <Static>
        {/* le coffre du flanc : un corps arrondi, sa face à portes (un plan), le bandeau de lumière, la gorge du haut */}
        <Part geo={rbox(L, BIN_H, BIN.depth, 0.12)} m={A.binPlain} p={[BX0 + L / 2, (BIN.y0 + BIN.y1) / 2, IN + BIN.depth / 2]} />
        <mesh geometry={facePlane(L - 0.3, BIN_H - 0.3, BX0 + 0.15)} material={A.bin} position={[BX0 + L / 2, (BIN.y0 + BIN.y1) / 2, IN + BIN.depth + 0.004]} raycast={noRay} receiveShadow />
        <Part geo={rbox(L - 0.1, 0.028, 0.034, 0.01)} m={A.led} p={[BX0 + L / 2, BIN.y0 + 0.004, IN + BIN.depth - 0.06]} castShadow={false} />
        <mesh material={A.ledGlow} position={[BX0 + L / 2, BIN.y0 - 0.34, IN + 0.012]} raycast={noRay}>
          <planeGeometry args={[L - 0.2, 0.68]} />
        </mesh>
        {/* le coffre de la cloison : même corps, tourné ; on le voit de côté */}
        <Part geo={rbox(BIN.depth, BIN_H, 6.2, 0.12)} m={A.binPlain} p={[IN + BIN.depth / 2, (BIN.y0 + BIN.y1) / 2, 0.1]} />
        <mesh geometry={facePlane(5.9, BIN_H - 0.3, 0)} material={A.bin} position={[IN + BIN.depth + 0.004, (BIN.y0 + BIN.y1) / 2, 0.1]} rotation-y={Math.PI / 2} raycast={noRay} receiveShadow />
        <Part geo={rbox(0.034, 0.028, 6.1, 0.01)} m={A.led} p={[IN + BIN.depth - 0.06, BIN.y0 + 0.004, 0.1]} castShadow={false} />
        <mesh material={A.ledGlow} position={[IN + 0.012, BIN.y0 - 0.34, 0.1]} rotation-y={Math.PI / 2} raycast={noRay}>
          <planeGeometry args={[6.1, 0.68]} />
        </mesh>
        {/* les blocs de services de la rangée 1 (celui de la rangée 2 porte la lampe : ReadingLight) */}
        <Psu x={ROW_X[0]} />
        {/* les écriteaux : la sortie au-dessus du rideau, la ceinture et le tabac sur la face du coffre de la cloison */}
        <mesh material={A.exit} position={[IN + 0.012, 2.88, 0.6]} rotation-y={Math.PI / 2} raycast={noRay}>
          <planeGeometry args={[0.26, 0.26]} />
        </mesh>
        <mesh material={A.beltSign} position={[IN + BIN.depth + 0.012, 3.82, 1.55]} rotation-y={Math.PI / 2} raycast={noRay}>
          <planeGeometry args={[0.2, 0.2]} />
        </mesh>
        <mesh material={A.noSmoke} position={[IN + BIN.depth + 0.012, 3.82, 1.95]} rotation-y={Math.PI / 2} raycast={noRay}>
          <planeGeometry args={[0.2, 0.2]} />
        </mesh>
      </Static>
      <Batch geo={cyl(0.034, 0.034, 0.014, 10)} m={A.floorLight} items={FLOOR_LIGHTS} />
    </>
  )
}
