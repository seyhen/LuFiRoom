import { useMemo } from 'react'
import { CatmullRomCurve3, TubeGeometry, Vector3 } from 'three'
import { reduceMotion } from '../anim'
import { useBeat } from '../objects/useBeat'
import { Part, cyl, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { A } from './materials'

/**
 * Le casque, objet « radio » de la cabine : un casque à réduction de bruit lilas et crème, debout sur la tablette, le serre-tête en
 * arche et les deux coques dressées sur leur tranche, face à la caméra. Chaque coque a son coussin, sa plaque, une bague et sa bague
 * de réglage d'acier ; le serre-tête porte son coussin de tête ; le cordon file sur la tablette jusqu'à la tablette tactile. Sur le kick
 * les coques s'illuminent et des notes s'envolent. `position` : le point où les coques touchent la tablette.
 */
export function Headphones({ position, ry = Math.PI / 4 }: { position: V3; ry?: number }) {
  const { g, notes } = useBeat([position[0], position[1] + 0.2, position[2]], 0.34, (on, _t, pulse) => {
    A.cup.emissiveIntensity = 0.05 + (on && !reduceMotion ? pulse * 0.38 : 0)
  }, 0.03, { vy: 0.35 })
  const cord = useMemo(() => new TubeGeometry(new CatmullRomCurve3([new Vector3(-0.18, 0.02, 0.0), new Vector3(-0.3, 0.012, 0.1), new Vector3(-0.42, 0.012, 0.06), new Vector3(-0.55, 0.012, 0.22), new Vector3(-0.7, 0.012, 0.16)]), 24, 0.009, 5), [])
  return (
    <>
      <group ref={g} userData={{ id: 'radio' }} position={position} rotation-y={ry}>
        <Static>
          {/* les deux coques : coussin crème côté oreille, coque, plaque et bague au dehors */}
          {[-1, 1].map((s) => (
            <group key={s} position={[s * 0.18, 0.115, 0]}>
              <Part geo={cyl(0.1, 0.1, 0.055, 24)} m={A.cup} rotation-z={Math.PI / 2} p={[s * 0.0, 0, 0]} />
              <Part geo={cyl(0.092, 0.098, 0.045, 24)} m={A.cushion} rotation-z={Math.PI / 2} p={[-s * 0.048, 0, 0]} />
              <Part geo={cyl(0.07, 0.07, 0.012, 20)} m={A.band} rotation-z={Math.PI / 2} p={[s * 0.034, 0, 0]} castShadow={false} />
              <Part m={A.steel} rotation-y={Math.PI / 2} p={[s * 0.043, 0, 0]} castShadow={false}>
                <torusGeometry args={[0.052, 0.006, 6, 20]} />
              </Part>
              {/* la fourche d'acier qui porte la coque : une petite pièce qui monte au serre-tête */}
              <Part geo={rbox(0.022, 0.075, 0.03, 0.01)} m={A.steel} p={[s * 0.0, 0.1, 0]} castShadow={false} />
            </group>
          ))}
          {/* le serre-tête : un demi-anneau, doublé d'un coussin crème sur le dessus */}
          <Part m={A.band} p={[0, 0.115, 0]}>
            <torusGeometry args={[0.18, 0.017, 8, 28, Math.PI]} />
          </Part>
          <Part m={A.cushion} p={[0, 0.115, 0]} rotation-z={Math.PI / 2 - 0.62}>
            <torusGeometry args={[0.162, 0.021, 8, 14, 1.24]} />
          </Part>
          {/* le cordon, posé sur la tablette */}
          <mesh geometry={cord} material={A.cord} position={[0, 0, 0]} castShadow />
        </Static>
      </group>
      <group ref={notes.group} />
    </>
  )
}
