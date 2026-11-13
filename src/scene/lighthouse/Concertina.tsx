import { useRef } from 'react'
import type { Group } from 'three'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { reduceMotion } from '../anim'
import { useBeat } from '../objects/useBeat'
import { L } from './materials'

const HALF = 0.23 // demi-longueur du soufflet au repos
const FOLDS = 12
const SC = 1.25 // l'échelle de l'instrument : assez grand pour se lire depuis la pièce
const R_BIG = 0.185, R_SMALL = 0.166
const APO = 0.2 * Math.sin(Math.PI / 3) // apothème d'un plateau (le rayon du hexagone est 0,2)
const BTN_ROWS: [number, number[]][] = [[0.075, [-0.09, -0.045, 0, 0.045, 0.09]], [0, [-0.105, -0.0525, 0, 0.0525, 0.105]], [-0.075, [-0.09, -0.045, 0, 0.045, 0.09]]]

/**
 * Un concertina de marin posé sur le coffre, dans le sens de la crête du couvercle : deux plateaux hexagonaux d'ébène cerclés de
 * laiton, quinze boutons (laiton et nacre) sur chaque face, un soufflet rouge aux plis crème, ses garde-coins de laiton, une courroie
 * de cuir bouclée autour, un pli remplacé par un tissu moutarde (il a servi). Joué, il s'ouvre et se referme ; il pulse à chaque kick
 * et lâche des notes. À côté, sur le couvercle : une feuille de chants de marin et l'harmonica du gardien. C'est l'objet « radio ».
 */
export function Concertina({ position }: { position: V3 }) {
  const bellows = useRef<Group>(null!), right = useRef<Group>(null!), left = useRef<Group>(null!)
  const { g, notes } = useBeat(position, 0.8, (on, t, pulse) => {
    const s = 1 + (on && !reduceMotion ? Math.sin(t * 1.7) * 0.2 + pulse * 0.1 : 0)
    bellows.current.scale.x = s
    right.current.position.x = HALF * s
    left.current.position.x = -HALF * s
  })
  const [px, py, pz] = position
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position} rotation-y={-1.5}>
        <group position={[0, APO * SC + 0.012, 0]} scale={SC}>
          {/* le soufflet : une pile de plis hexagonaux, larges puis serrés (fusionnés par matière, il respire en bloc) */}
          <group ref={bellows}>
            <Static>
              {Array.from({ length: FOLDS }, (_, i) => (
                <Part key={i} geo={cyl(i % 2 ? R_BIG : R_SMALL, i % 2 ? R_BIG : R_SMALL, (HALF * 2) / FOLDS + 0.004, 6)} m={i === 8 ? L.oilskinDark : i % 2 ? L.cream : L.red} p={[-HALF + ((i + 0.5) * HALF * 2) / FOLDS, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
              ))}
              {/* les garde-coins de laiton, sur les six arêtes des plis larges */}
              {Array.from({ length: 6 }, (_, k) => {
                const a = (k * Math.PI) / 3
                return <Part key={k} geo={cyl(0.007, 0.007, HALF * 2 - 0.02, 6)} m={L.brassDull} p={[0, Math.sin(a) * (R_BIG + 0.001), Math.cos(a) * (R_BIG + 0.001)]} rotation-z={Math.PI / 2} castShadow={false} />
              })}
              {/* la courroie de cuir qui tient le soufflet fermé, et sa boucle de laiton sur le dessus */}
              <Part geo={cyl(0.194, 0.194, 0.03, 6)} m={L.leatherDark} p={[0.05, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
              <Part geo={rbox(0.044, 0.008, 0.036, 0.003)} m={L.brass} p={[0.05, 0.1682 + 0.003, 0]} castShadow={false} />
              <Part geo={rbox(0.012, 0.005, 0.07, 0.002)} m={L.leather} p={[0.05, 0.1682 + 0.003, 0.06]} castShadow={false} />
            </Static>
          </group>
          {([[left, -1], [right, 1]] as const).map(([ref, s]) => (
            <group key={s} ref={ref} position={[s * HALF, 0, 0]}>
              <Static>
                {/* le plateau d'ébène, cerclé de laiton sur ses six côtés */}
                <Part geo={cyl(0.2, 0.2, 0.05, 6)} m={L.navyDark} p={[s * 0.025, 0, 0]} rotation-z={Math.PI / 2} />
                {Array.from({ length: 6 }, (_, k) => {
                  const th = Math.PI / 6 + (k * Math.PI) / 3
                  return (
                    <group key={k} rotation-x={-th}>
                      <Part geo={rbox(0.012, 0.2, 0.014, 0.004)} m={L.brassDull} p={[s * 0.052, 0, APO - 0.005]} castShadow={false} />
                    </group>
                  )
                })}
                {/* la planche de jeu, en cuir sombre : les boutons y sont enfoncés */}
                <Part geo={cyl(0.152, 0.152, 0.012, 6)} m={L.leatherDark} p={[s * 0.0545, 0, 0]} rotation-z={Math.PI / 2} castShadow={false} />
                {/* quinze boutons : laiton, avec une rangée du milieu en nacre */}
                {BTN_ROWS.flatMap(([y, zs]) =>
                  zs.map((z) => <Part key={`${y}${z}`} geo={SPH} m={y === 0 ? L.cream : L.brass} scale={0.018} p={[s * 0.0585, y, z]} castShadow={false} />),
                )}
              </Static>
            </group>
          ))}
        </group>
      </group>
      <group ref={notes.group} />
      {/* sur le couvercle, vers l'avant : une feuille de chants, et l'harmonica posé dessus (usé, le laiton est terni) */}
      <group position={[px, py + 0.0065, pz + 0.45]} scale={1.25}>
        <Static>
          <Part geo={rbox(0.13, 0.006, 0.17, 0.002)} m={L.paper} p={[0, 0.006, 0]} rotation-y={0.3} castShadow={false} />
          {[-0.05, -0.025, 0, 0.025, 0.05].map((z) => (
            <Part key={z} geo={rbox(0.1, 0.0016, 0.003, 0.001)} m={L.navyDark} p={[0, 0.0092, z]} rotation-y={0.3} castShadow={false} />
          ))}
          <group position={[0.015, 0.014, 0.02]} rotation-y={-0.5}>
            <Part geo={rbox(0.13, 0.03, 0.038, 0.008)} m={L.ironLight} p={[0, 0.015, 0]} />
            <Part geo={rbox(0.136, 0.005, 0.042, 0.002)} m={L.brassDull} p={[0, 0.032, 0]} castShadow={false} />
            <Part geo={rbox(0.136, 0.005, 0.042, 0.002)} m={L.brassDull} p={[0, -0.002, 0]} castShadow={false} />
            {[-0.045, -0.027, -0.009, 0.009, 0.027, 0.045].map((x) => (
              <Part key={x} geo={rbox(0.007, 0.016, 0.003, 0.001)} m={L.navyDark} p={[x, 0.015, 0.0195]} castShadow={false} />
            ))}
            <Part geo={rbox(0.012, 0.03, 0.038, 0.004)} m={L.brass} p={[0.07, 0.015, 0]} castShadow={false} />
          </group>
        </Static>
      </group>
    </>
  )
}
