import { useRef } from 'react'
import { LatheGeometry, Vector2, type Group } from 'three'
import { reduceMotion } from '../anim'
import { canvasTex } from '../paint'
import { gummy } from '../materials'
import { Part, SPH, cyl, rbox, worldUV, type V3 } from '../parts'
import { Static } from '../Static'
import { useBeat } from '../objects/useBeat'
import { D } from './materials'

/** Le dos de l'oud : des douelles de deux bois, en bandes serrées qui suivent la coque (u autour, v du bord au fond). */
const ribs = canvasTex(256, 64, (x) => {
  const cols = ['#a8602a', '#c98644', '#8a4a20', '#d9a060']
  for (let i = 0; i < 24; i++) { x.fillStyle = cols[i % 4]; x.fillRect((i * 256) / 24, 0, 256 / 24 + 1, 64) }
  x.strokeStyle = 'rgba(40,20,8,.55)'; x.lineWidth = 1.4
  for (let i = 0; i < 24; i++) { x.beginPath(); x.moveTo((i * 256) / 24, 0); x.lineTo((i * 256) / 24, 64); x.stroke() }
})
const bowlMat = gummy(0xffffff, { map: ribs, roughness: 0.38, clearcoat: 0.75 })

/** Une demi-coque : un demi-ellipsoïde creux (bord à y = 0, fond à y = -1 avant l'échelle), tourné autour de y. */
const BOWL = new LatheGeometry(Array.from({ length: 13 }, (_, i) => {
  const t = (i / 12) * (Math.PI / 2)
  return new Vector2(Math.max(0.001, Math.cos(t)), -Math.sin(t))
}), 36)

const SC = 1.9 // l'oud est agrandi : un jouet de la pièce, pas la taille réelle
const CUSHION_TOP = 0.2

/**
 * L'oud, objet « radio » de l'oasis : posé sur un long coussin d'ikat, le manche vers la gauche. Une caisse en poire (deux demi-coques
 * en douelles de deux bois, une table d'épicéa qui déborde, trois rosaces ajourées, un chevalet), un manche court à touche d'ébène
 * sans frettes avec son sillet d'os, un cheviller coudé en arrière et ses dix chevilles, six cordes ; à côté, une plume d'aigle
 * (le mizrab) sur le coussin et un petit coussin turquoise. Sur le kick : les cordes vibrent, des notes s'envolent. `position` est
 * le sol, au pied du coussin.
 */
export function Oud({ position, ry = 0 }: { position: V3; ry?: number }) {
  const strings = useRef<Group>(null!)
  const { g, notes } = useBeat([position[0], position[1] + CUSHION_TOP, position[2]], 0.55, (on, _t, pulse) => {
    strings.current.scale.y = on && !reduceMotion ? 1 + pulse * 1.8 : 1
  }, 0.03, { vy: 0.4, dx: -0.1 })
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position} rotation-y={ry}>
        <Static>
          {/* le coussin long d'ikat, ses glands aux quatre coins ; un petit coussin turquoise calé derrière */}
          <Part geo={worldUV(rbox(1.95, CUSHION_TOP, 0.8, 0.08), 0.8)} m={D.cushionA} p={[0, CUSHION_TOP / 2, 0]} />
          {[-0.98, 0.98].flatMap((x) => [-0.41, 0.41].map((z) => (
            <group key={`${x}${z}`} position={[x * 1.01, 0.04, z * 1.01]}>
              <Part geo={SPH} m={D.tassel} scale={0.035} castShadow={false} />
              <Part m={D.tassel} p={[0, -0.05, 0]} rotation-x={Math.PI} castShadow={false}><coneGeometry args={[0.032, 0.07, 8]} /></Part>
            </group>
          )))}
          <Part geo={worldUV(rbox(0.5, 0.15, 0.4, 0.07), 0.8)} m={D.cushionB} p={[0.62, 0.17, -0.42]} rotation={[0.18, 0.4, 0]} />
          {/* la plume d'aigle sur le coussin, devant l'oud : la tige, les barbes, la bande sombre */}
          <group position={[0.3, CUSHION_TOP, 0.34]} rotation-y={0.6}>
            <Part geo={cyl(0.005, 0.005, 0.2, 6)} m={D.bone} p={[0, 0.006, 0]} rotation-z={Math.PI / 2} castShadow={false} />
            <Part geo={SPH} m={D.feather} scale={[0.1, 0.004, 0.025]} p={[-0.02, 0.006, 0.0]} castShadow={false} />
            <Part geo={SPH} m={D.featherDark} scale={[0.04, 0.0045, 0.026]} p={[-0.07, 0.0065, 0.0]} castShadow={false} />
          </group>
        </Static>
        {/* l'oud : posé à plat sur le coussin, la coque enfoncée */}
        <group position={[0.02, CUSHION_TOP + 0.02, 0.0]} rotation-y={0.1} scale={SC}>
          <Static>
            {/* la caisse : deux coques en poire (la grande côté chevalet, la petite côté manche) */}
            <mesh geometry={BOWL} material={bowlMat} position={[0.04, 0, 0]} scale={[0.2, 0.11, 0.164]} castShadow />
            <mesh geometry={BOWL} material={bowlMat} position={[-0.1, 0, 0]} scale={[0.138, 0.095, 0.118]} castShadow />
            {/* la table d'épicéa : deux ellipses et un raccord, un petit bord qui déborde */}
            <Part geo={cyl(1, 1, 0.012, 40)} m={D.soundboard} scale={[0.208, 1, 0.172]} p={[0.04, 0.006, 0]} castShadow={false} />
            <Part geo={cyl(1, 1, 0.012, 40)} m={D.soundboard} scale={[0.146, 1, 0.126]} p={[-0.1, 0.006, 0]} castShadow={false} />
            <Part geo={rbox(0.16, 0.01, 0.2, 0.004)} m={D.soundboard} p={[-0.03, 0.005, 0]} castShadow={false} />
            {/* trois rosaces : la grande au centre de la grande coque, deux petites côté manche */}
            <mesh material={D.rosette} position={[0.03, 0.0185, 0]} rotation-x={-Math.PI / 2} renderOrder={2}><planeGeometry args={[0.13, 0.13]} /></mesh>
            {[-0.052, 0.052].map((z) => <mesh key={z} material={D.rosette} position={[-0.125, 0.0185, z]} rotation-x={-Math.PI / 2} renderOrder={2}><planeGeometry args={[0.06, 0.06]} /></mesh>)}
            {/* le chevalet de bois clair et la protection de table, claire, sous les cordes */}
            <Part geo={rbox(0.018, 0.016, 0.13, 0.006)} m={D.woodLight} p={[0.15, 0.022, 0]} castShadow={false} />
            <Part geo={rbox(0.12, 0.003, 0.08, 0.001)} m={D.bone} p={[0.075, 0.0165, 0]} castShadow={false} />
            {/* le manche court, la touche d'ébène (sans frette), le sillet d'os */}
            <Part geo={rbox(0.3, 0.03, 0.062, 0.01)} m={D.woodLight} p={[-0.33, 0.016, 0]} />
            <Part geo={rbox(0.34, 0.008, 0.058, 0.003)} m={D.ebony} p={[-0.3, 0.035, 0]} castShadow={false} />
            <Part geo={rbox(0.008, 0.012, 0.058, 0.002)} m={D.bone} p={[-0.468, 0.04, 0]} castShadow={false} />
            {/* le cheviller coudé en arrière : une boîte qui plonge, dix chevilles de part et d'autre, une volute au bout */}
            <group position={[-0.47, 0.02, 0]} rotation-z={Math.PI + 0.8}>
              <Part geo={rbox(0.19, 0.036, 0.08, 0.012)} m={D.woodLight} p={[0.09, 0, 0]} />
              <Part geo={rbox(0.17, 0.004, 0.05, 0.002)} m={D.ebony} p={[0.09, 0.019, 0]} castShadow={false} />
              {[0.03, 0.07, 0.11, 0.15].flatMap((x, i) => [-1, 1].map((s) => (
                <group key={`${x}${s}`} position={[x, i % 2 ? 0.006 : -0.006, s * 0.056]}>
                  <Part geo={cyl(0.008, 0.01, 0.05, 7)} m={D.ebony} rotation-x={Math.PI / 2} castShadow={false} />
                  <Part geo={SPH} m={D.woodLight} scale={[0.018, 0.012, 0.012]} p={[0, 0, s * 0.032]} castShadow={false} />
                </group>
              )))}
              <Part geo={SPH} m={D.woodLight} scale={[0.04, 0.026, 0.04]} p={[0.2, 0, 0]} castShadow={false} />
            </group>
          </Static>
          {/* les six cordes : du sillet au chevalet, elles vibrent sur le kick */}
          <group ref={strings} position={[0, 0.045, 0]}>
            {[-0.023, -0.0138, -0.0046, 0.0046, 0.0138, 0.023].map((z, i) => (
              <Part key={i} geo={cyl(0.0034, 0.0034, 0.62, 5)} m={D.string} p={[-0.16, -0.003, z]} rotation-z={Math.PI / 2 - 0.034} castShadow={false} />
            ))}
          </group>
        </group>
      </group>
      <group ref={notes.group} />
    </>
  )
}
