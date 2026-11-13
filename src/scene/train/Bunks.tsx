import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import type { Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { Part, SPH, cyl, rbox } from '../parts'
import { useSquash } from '../anim'
import { LIVE, Static } from '../Static'
import { T } from './materials'

const X = -2.5, Z0 = -2.85, Z1 = -0.45, ZM = (Z0 + Z1) / 2, LEN = Z1 - Z0

/** Une couchette : son cadre d'acajou, le matelas, les draps, une couverture bleu nuit rabattue, l'oreiller. */
function Berth({ y, top }: { y: number; top?: boolean }) {
  return (
    <group position={[X, y, ZM]}>
      <Part geo={rbox(0.96, 0.16, LEN, 0.04)} m={T.mahogany} p={[0, -0.08, 0]} />
      <Part geo={rbox(0.88, 0.16, LEN - 0.08, 0.07)} m={T.sheet} p={[0.02, 0.08, 0]} />
      <Part geo={rbox(0.9, 0.06, LEN * 0.62, 0.03)} m={T.blanket} p={[0.03, 0.17, LEN * 0.19]} />
      <Part geo={rbox(0.9, 0.05, 0.22, 0.025)} m={T.sheet} p={[0.03, 0.2, LEN * 0.19 - LEN * 0.31 + 0.08]} />
      <Part geo={rbox(0.62, 0.14, 0.36, 0.07)} m={T.sheet} p={[0, 0.22, -LEN / 2 + 0.28]} rotation-x={0.12} />
      {/* têtière et pied */}
      {[-1, 1].map((s) => (
        <Part key={s} geo={rbox(0.96, top ? 0.46 : 0.6, 0.06, 0.03)} m={T.mahogany} p={[0, top ? 0.1 : 0.0, s * (LEN / 2 + 0.03)]} />
      ))}
      {top && (
        <>
          {/* garde-corps de laiton */}
          <Part geo={cyl(0.018, 0.018, LEN - 0.3, 10)} m={T.brass} p={[0.5, 0.34, 0.1]} rotation-x={Math.PI / 2} />
          {[-0.9, 0.2, 1.05].map((z) => (
            <Part key={z} geo={cyl(0.015, 0.015, 0.3, 8)} m={T.brass} p={[0.5, 0.2, z]} castShadow={false} />
          ))}
          {/* un petit lapin en peluche */}
          <group position={[0.1, 0.32, -0.55]} rotation-y={0.9}>
            <Part geo={SPH} m={T.wool} scale={[0.09, 0.08, 0.08]} />
            <Part geo={SPH} m={T.wool} scale={0.065} p={[0, 0.1, 0.02]} />
            {[-1, 1].map((s) => (
              <Part key={s} geo={SPH} m={T.wool} scale={[0.02, 0.07, 0.015]} p={[s * 0.03, 0.2, 0]} rotation-z={s * 0.2} castShadow={false} />
            ))}
          </group>
        </>
      )}
    </group>
  )
}

/**
 * Le livre ouvert sur le plaid de la couchette du bas, grand comme un vrai in-quarto, et ses lunettes de lecture à côté : couvertures de
 * cuir bordeaux, dos, blocs de pages à texte, et une page qui se tourne quand on l'écoute. Il pose sur le plaid (dessus à 0,68).
 */
const BOOK_Y = 0.692
function Book() {
  const g = useRef<Group>(null!), page = useRef<Group>(null!), flip = useRef(0)
  useSquash('book', g)
  useFrame((_, delta) => {
    const on = isActive(useStore.getState(), 'book')
    // la phase avance image après image : un tour de page en 1 s, toutes les 4 s tant que le son joue
    flip.current = on ? (flip.current + Math.min(delta, 0.05) / 4) % 1 : 0
    const ph = flip.current / 0.3
    page.current.rotation.z = 0.075 + (ph < 1 ? Math.sin(ph * Math.PI) * 2.55 : 0)
  })
  return (
    <group ref={g} userData={{ id: 'book' }} position={[X + 0.08, BOOK_Y, -1.68]} rotation-y={0.25}>
      <Static>
        {/* les deux moitiés : couverture, bloc de pages, texte ; elles remontent vers l'extérieur, le dos est au creux */}
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.15, 0.015, 0]} rotation-z={s * 0.07}>
            <Part geo={rbox(0.3, 0.03, 0.42, 0.012)} m={T.velvet} />
            <Part geo={rbox(0.27, 0.026, 0.38, 0.008)} m={T.cream} p={[0, 0.028, 0]} castShadow={false} />
            <Part m={T.pageText} p={[0, 0.0425, 0]} rotation-x={-Math.PI / 2} castShadow={false}>
              <planeGeometry args={[0.25, 0.36]} />
            </Part>
          </group>
        ))}
        <Part geo={cyl(0.02, 0.02, 0.42, 10)} m={T.velvet} p={[0, 0.006, 0]} rotation-x={Math.PI / 2} />
        {/* les lunettes de lecture, branches repliées, posées à côté : deux verres cerclés d'or et le pont */}
        <group position={[0.02, -0.003, 0.4]} rotation-y={-0.25}>
          {[-1, 1].map((s) => (
            <Part key={s} m={T.gold} p={[s * 0.062, 0, 0]} rotation-x={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.046, 0.008, 6, 20]} />
            </Part>
          ))}
          <Part geo={cyl(0.005, 0.005, 0.03, 6)} m={T.gold} rotation-z={Math.PI / 2} castShadow={false} />
          {[-1, 1].map((s) => (
            <Part key={s} geo={cyl(0.004, 0.004, 0.13, 6)} m={T.gold} p={[s * 0.11, 0, 0.055]} rotation-x={Math.PI / 2} castShadow={false} />
          ))}
        </group>
      </Static>
      {/* la page qui se tourne : elle pivote sur le dos du livre */}
      <group ref={page} userData={LIVE} position={[0, 0.047, 0]} rotation-z={0.075}>
        <Part geo={rbox(0.27, 0.004, 0.37, 0.002)} m={T.cream} p={[0.14, 0.004, 0]} castShadow={false} />
      </group>
    </group>
  )
}

/** Petite applique de lecture en laiton au-dessus d'un oreiller (son abat-jour s'allume avec la lampe de table). */
function BerthLamp({ y }: { y: number }) {
  return (
    <group position={[-2.92, y, -2.25]}>
      <Part geo={cyl(0.04, 0.04, 0.02, 12)} m={T.brass} rotation-z={Math.PI / 2} castShadow={false} />
      <Part geo={cyl(0.01, 0.01, 0.16, 6)} m={T.brass} p={[0.07, 0.04, 0]} rotation-z={Math.PI / 2 - 0.6} castShadow={false} />
      <Part geo={cyl(0.04, 0.07, 0.08, 12)} m={T.shade} p={[0.15, 0.08, 0]} castShadow={false} />
    </group>
  )
}

/** Les couchettes superposées contre la paroi, l'échelle de laiton, les appliques. */
export function Bunks() {
  return (
    <>
      <Part geo={rbox(0.96, 0.4, LEN, 0.04)} m={T.mahoganyDark} p={[X, 0.2, ZM]} />
      {[-1.9, -0.95].map((z) => (
        <Part key={z} geo={cyl(0.03, 0.03, 0.02, 10)} m={T.brass} p={[X + 0.49, 0.22, z]} rotation-z={Math.PI / 2} castShadow={false} />
      ))}
      <Berth y={0.48} />
      <Berth y={2.15} top />
      {/* les montants qui portent la couchette du haut */}
      {[Z0 + 0.03, Z1 - 0.03].map((z) => (
        <Part key={z} geo={rbox(0.06, 2.35, 0.06, 0.02)} m={T.mahogany} p={[X + 0.45, 1.17, z]} />
      ))}
      {/* l'échelle, au pied */}
      {/* il s'appuie au bord de la couchette du haut et son pied s'écarte vers la pièce : il ne traverse plus les couchettes */}
      <group position={[X + 0.95, 0, Z1 - 0.12]} rotation-z={0.145}>
        {[-0.15, 0.15].map((z) => (
          <Part key={z} geo={cyl(0.018, 0.018, 2.35, 8)} m={T.brass} p={[0, 1.17, z]} />
        ))}
        {[0.4, 0.85, 1.3, 1.75].map((y) => (
          <Part key={y} geo={cyl(0.014, 0.014, 0.3, 6)} m={T.brass} p={[0, y, 0]} rotation-x={Math.PI / 2} castShadow={false} />
        ))}
      </group>
      <BerthLamp y={1.2} />
      <BerthLamp y={2.9} />
      <Book />
    </>
  )
}
