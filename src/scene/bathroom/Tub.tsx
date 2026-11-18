import { Candle } from '../objects/Candle'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { Static } from '../Static'
import { Steam } from '../objects/Steam'
import { B } from './materials'
import { TUB, tubBandGeo, tubInnerGeo, tubOuterGeo, tubRimGeo, tubWaterGeo } from './tubGeo'

/** Où est la baignoire dans la pièce : le centre du stade, au sol, collée au mur du fond (sa paroi arrière à 7 cm du soubassement). */
export const TUB_AT: V3 = [0.1, 0, -2.4]

const BAND = tubBandGeo(0.34)

/** Un pied de lion : collerette contre le fond, patte qui s'évase vers l'extérieur, boule de laiton, trois orteils. `at` : [x, z] depuis le centre. */
function Foot({ at }: { at: [number, number] }) {
  const a = Math.atan2(at[1], at[0]), t = 0.3
  return (
    <group position={[at[0], 0, at[1]]}>
      <Part geo={cyl(0.085, 0.062, 0.06, 14)} m={B.brassDark} p={[0, 0.2, 0]} castShadow={false} />
      <group position={[0, 0.2, 0]} rotation={[-Math.sin(a) * t, 0, Math.cos(a) * t]}>
        <Part geo={cyl(0.046, 0.03, 0.16, 10)} m={B.brass} p={[0, -0.08, 0]} castShadow={false} />
        <Part geo={SPH} m={B.brass} scale={[0.052, 0.05, 0.052]} p={[0, -0.17, 0]} castShadow={false} />
        {[-0.7, 0.2, 1.1].map((k) => (
          <Part key={k} geo={SPH} m={B.brass} scale={[0.02, 0.016, 0.04]} p={[Math.cos(a + k) * 0.045, -0.2, Math.sin(a + k) * 0.045]} rotation-y={-(a + k)} castShadow={false} />
        ))}
      </group>
    </group>
  )
}

/** Le plateau de bain posé en travers : deux tasseaux sur le bord, trois lattes, un bord relevé ; dessus, les affaires de celui qui se baigne. */
function Caddy({ position }: { position: V3 }) {
  const y = TUB.rim + 0.06 // le dessus du bord roulé
  return (
    <group position={position}>
      {/* les deux tasseaux qui reposent sur le bord, la planche et sa lèvre */}
      {[-0.16, 0.16].map((x) => <Part key={x} geo={rbox(0.05, 0.03, 1.02, 0.01)} m={B.woodDark} p={[x, y + 0.015, 0]} castShadow={false} />)}
      <Part geo={rbox(0.34, 0.03, 0.8, 0.012)} m={B.woodLight} p={[0, y + 0.045, 0]} />
      {[-0.36, 0.36].map((z) => <Part key={z} geo={rbox(0.36, 0.05, 0.03, 0.01)} m={B.wood} p={[0, y + 0.07, z]} castShadow={false} />)}
      {/* un petit pot de succulente, du côté du mur */}
      <group position={[0, y + 0.06, -0.3]}>
        <Part geo={cyl(0.06, 0.045, 0.08, 14)} m={B.ceramicRose} p={[0, 0.04, 0]} castShadow={false} />
        <Part geo={cyl(0.05, 0.05, 0.01, 12)} m={B.soil} p={[0, 0.082, 0]} castShadow={false} />
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <Part key={i} geo={SPH} m={B.succulent} scale={[0.026, 0.05, 0.02]} p={[Math.cos(i * 1.05) * 0.03, 0.11, Math.sin(i * 1.05) * 0.03]} rotation={[Math.sin(i * 1.05) * 0.7, 0, -Math.cos(i * 1.05) * 0.7]} castShadow={false} />
        ))}
      </group>
      {/* la tasse de thé : corps, anse, thé un peu sous le bord */}
      <group position={[-0.02, y + 0.06, -0.06]}>
        <Part geo={cyl(0.052, 0.042, 0.09, 16)} m={B.ceramic} p={[0, 0.045, 0]} castShadow={false} />
        <Part geo={cyl(0.044, 0.044, 0.006, 16)} m={B.wood} p={[0, 0.082, 0]} castShadow={false} />
        <Part m={B.ceramic} p={[0.058, 0.05, 0]} rotation-x={0} castShadow={false}>
          <torusGeometry args={[0.024, 0.008, 8, 14]} />
        </Part>
      </group>
      {/* le livre ouvert, couvert vers le bas, un marque-page rose */}
      <group position={[0, y + 0.065, 0.2]} rotation-y={0.35}>
        <Part geo={rbox(0.27, 0.014, 0.19, 0.005)} m={B.ceramicBlue} p={[0, 0.007, 0]} castShadow={false} />
        <Part geo={rbox(0.12, 0.016, 0.17, 0.005)} m={B.paper} p={[-0.065, 0.021, 0]} rotation-z={0.07} castShadow={false} />
        <Part geo={rbox(0.12, 0.016, 0.17, 0.005)} m={B.paper} p={[0.065, 0.021, 0]} rotation-z={-0.07} castShadow={false} />
        <Part geo={rbox(0.008, 0.004, 0.09, 0.002)} m={B.rail} p={[0.02, 0.036, 0.1]} castShadow={false} />
      </group>
      {/* le savon et son porte-savon */}
      <group position={[0.02, y + 0.06, 0.34]}>
        <Part geo={rbox(0.12, 0.014, 0.08, 0.006)} m={B.ceramic} p={[0, 0.007, 0]} castShadow={false} />
        <Part geo={rbox(0.07, 0.03, 0.05, 0.014)} m={B.soap} p={[0, 0.03, 0]} castShadow={false} />
      </group>
    </group>
  )
}

/**
 * La baignoire à pieds de lion, collée au mur du fond sous la fenêtre : coque bleu givré, ventre cerclé d'un liseré de laiton, émail blanc
 * dedans, bord roulé, quatre pieds de lion (collerette, patte, boule, orteils), la bonde de laiton et son trop-plein, l'eau chaude à
 * 22 cm du bord ; en travers, le plateau de bain avec la tasse de thé, le livre, le savon et la succulente. La vapeur monte du bain.
 */
export function Tub() {
  return (
    <group position={TUB_AT}>
      <Static>
        <Part geo={tubOuterGeo} m={B.tubOuter} />
        <Part geo={tubInnerGeo} m={B.tubInner} castShadow={false} />
        <Part geo={tubRimGeo} m={B.tubInner} />
        <Part geo={BAND} m={B.brass} castShadow={false} />
        <mesh geometry={tubWaterGeo} material={B.water} position={[0, TUB.water, 0]} receiveShadow />
        {[[-0.7, -0.27], [-0.7, 0.27], [0.7, -0.27], [0.7, 0.27]].map(([x, z]) => <Foot key={`${x}${z}`} at={[x, z]} />)}
        {/* le trop-plein de laiton sur la paroi de la tête du bain (un disque et sa vis), et la bonde au fond de l'autre bout */}
        <Part geo={cyl(0.04, 0.04, 0.012, 16)} m={B.brass} p={[-TUB.ax + 0.092, 0.6, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.012, 0.012, 0.016, 8)} m={B.brassDark} p={[-TUB.ax + 0.085, 0.6, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Caddy position={[0.0, 0, 0]} />
      </Static>
      {/* une bougie dans un bocal sur le rebord, côté mur : le halo suffit, pas de lumière */}
      <Candle position={[0.72, TUB.rim + 0.04, -TUB.az + 0.03]} height={0.07} radius={0.025} holder="jar" />
      {/* la vapeur de la tasse de thé */}
      <Steam at={[-0.02, TUB.rim + 0.06 + 0.17, -0.06]} every={1.6} />
    </group>
  )
}
