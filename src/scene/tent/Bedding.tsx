import { Part, SPH, cyl, rbox, worldUV, type V3 } from '../parts'
import { Static } from '../Static'
import { T } from './materials'

/**
 * Le couchage, le long de la toile à gauche : un matelas gonflable à boudins, un sac de couchage matelassé ocre et vert dont le
 * rabat est replié (on voit la doublure verte), un oreiller, un plaid à carreaux plié au pied, un livre ouvert à plat sur la
 * couette, une lampe frontale et un bonnet de laine sur l'oreiller, un thermos au sol. Le grand décor immobile de la tente.
 * Le long axe suit z ; `position` est le sol, au milieu du matelas.
 */
export function Bedding({ position, ry = 0 }: { position: V3; ry?: number }) {
  return (
    <group position={position} rotation-y={ry}>
      <Static>
        {/* le matelas et ses boudins cousus en travers */}
        <Part geo={rbox(1.0, 0.1, 2.1, 0.045)} m={T.mat} p={[0, 0.05, 0]} />
        {Array.from({ length: 9 }, (_, i) => <Part key={i} geo={rbox(0.96, 0.008, 0.014, 0.002)} m={T.matDark} p={[0, 0.102, -0.84 + i * 0.21]} castShadow={false} />)}
        {/* l'oreiller, creusé au milieu, et son liseré */}
        <Part geo={rbox(0.56, 0.11, 0.34, 0.05)} m={T.pillow} p={[0.02, 0.155, -0.84]} rotation-y={0.06} />
        <Part geo={SPH} m={T.pillow} scale={[0.2, 0.05, 0.1]} p={[0.02, 0.2, -0.84]} castShadow={false} />
        {/* le sac de couchage : le corps matelassé, trois bosses de couette, la fermeture éclair le long du flanc */}
        <Part geo={worldUV(rbox(0.88, 0.15, 1.66, 0.07), 1)} m={T.quilt} p={[0, 0.175, 0.2]} />
        {[[-0.14, 0.62, 0.34], [0.12, 0.2, 0.42], [-0.08, -0.12, 0.3]].map(([x, z, s], i) => (
          <Part key={i} geo={SPH} m={T.quilt} scale={[s, 0.045, s * 0.9]} p={[x, 0.25, z]} rotation-y={i} castShadow={false} />
        ))}
        <Part geo={rbox(0.014, 0.01, 1.4, 0.003)} m={T.brass} p={[0.3, 0.256, 0.22]} castShadow={false} />
        {/* le rabat replié au chevet : la doublure verte */}
        <Part geo={rbox(0.86, 0.04, 0.42, 0.018)} m={T.bagGreen} p={[0, 0.268, -0.5]} rotation-x={0.12} />
        <Part geo={rbox(0.86, 0.018, 0.05, 0.008)} m={T.quilt} p={[0, 0.292, -0.32]} rotation-x={0.12} castShadow={false} />
        {/* le plaid plié au pied : trois couches un peu décalées */}
        {[0, 1, 2].map((i) => (
          <Part key={i} geo={worldUV(rbox(0.7 - i * 0.04, 0.04, 0.46, 0.016), 0.5)} m={T.plaid} p={[0.02 * i, 0.275 + i * 0.04, 0.82]} rotation-y={0.05 * (i - 1)} castShadow={i === 2} />
        ))}
        {/* le livre ouvert, à plat sur la couette, un marque-page rouge */}
        <group position={[0.12, 0.255, 0.18]} rotation-y={-0.35}>
          <Part geo={rbox(0.4, 0.014, 0.27, 0.006)} m={T.leatherDark} p={[0, 0.007, 0]} castShadow={false} />
          <Part geo={rbox(0.18, 0.012, 0.25, 0.005)} m={T.paper} p={[-0.1, 0.02, 0]} rotation-z={0.07} castShadow={false} />
          <Part geo={rbox(0.18, 0.012, 0.25, 0.005)} m={T.paper} p={[0.1, 0.02, 0]} rotation-z={-0.07} castShadow={false} />
          <Part geo={rbox(0.012, 0.004, 0.2, 0.002)} m={T.match} p={[0.02, 0.03, 0.05]} castShadow={false} />
        </group>
        {/* la lampe frontale sur l'oreiller : sangle, boîtier, lentille */}
        <group position={[0.15, 0.215, -0.78]} rotation-y={0.5}>
          <Part m={T.sole} rotation-x={Math.PI / 2} scale={[1, 1, 0.5]} castShadow={false}>
            <torusGeometry args={[0.085, 0.009, 6, 22]} />
          </Part>
          <Part geo={rbox(0.07, 0.035, 0.045, 0.012)} m={T.iron} p={[0.085, 0.012, 0]} castShadow={false} />
          <Part geo={cyl(0.016, 0.016, 0.01, 12)} m={T.jar} p={[0.123, 0.012, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        </group>
        {/* le bonnet de laine rouille, retourné sur le coin de l'oreiller, son pompon crème */}
        <group position={[-0.17, 0.215, -0.83]} rotation-y={0.3}>
          <Part geo={SPH} m={T.wool} scale={[0.1, 0.075, 0.1]} p={[0, 0.03, 0]} castShadow={false} />
          <Part m={T.woolCream} p={[0, 0.003, 0]} rotation-x={Math.PI / 2} castShadow={false}>
            <torusGeometry args={[0.092, 0.024, 8, 20]} />
          </Part>
          <Part geo={SPH} m={T.woolCream} scale={0.034} p={[0, 0.105, 0]} castShadow={false} />
        </group>
        {/* le thermos, au pied du lit, et son gobelet-bouchon renversé à côté */}
        <Part geo={cyl(0.055, 0.058, 0.3, 18)} m={T.enamelBlue} p={[0.66, 0.15, -0.52]} />
        <Part geo={cyl(0.057, 0.057, 0.06, 18)} m={T.tin} p={[0.66, 0.32, -0.52]} castShadow={false} />
        <Part geo={cyl(0.012, 0.012, 0.06, 8)} m={T.iron} p={[0.66, 0.2, -0.46]} rotation-z={0} castShadow={false} />
        <Part geo={cyl(0.046, 0.04, 0.06, 16)} m={T.tin} p={[0.62, 0.03, -0.3]} rotation-z={Math.PI / 2 - 0.2} castShadow={false} />
      </Static>
    </group>
  )
}

