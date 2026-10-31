import { CatmullRomCurve3, LatheGeometry, TubeGeometry, Vector2, Vector3 } from 'three'
import { TAU } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { Vessel } from '../igloo/Vessel'
import { K } from './materials'

// L'entrée est à droite, hors champ : on arrive trempé, on accroche son manteau, on laisse son parapluie s'égoutter.
// Trois parapluies fermés dans le porte-parapluies : [x, inclinaison, matériau].
// Ils descendent jusqu'au fond du porte-parapluies ouvert, assez droits pour ne pas traverser sa paroi (rayon intérieur 0,19).
const UMBRELLAS = [[-0.05, 0.12, K.stewartSmall], [0.03, -0.06, K.navy], [0.07, -0.14, K.burgundy]] as const

/** Portemanteau de bois courbé : une écharpe en tartan, une casquette de tweed (le duffle-coat est dans DripCoat). */
function CoatStand() {
  return (
    <group position={[2.9, 0, 0.98]}>
      {[0, 1, 2, 3].map((i) => (
        <Part key={i} geo={rbox(0.36, 0.04, 0.06, 0.02)} m={K.walnut} p={[0, 0.03, 0]} rotation-y={(i / 4) * Math.PI} />
      ))}
      <Part geo={cyl(0.03, 0.04, 2.0, 12)} m={K.walnut} p={[0, 1.0, 0]} />
      <Part geo={SPH} m={K.walnut} scale={0.05} p={[0, 2.03, 0]} />
      {[0, 1, 2, 3].map((i) => {
        const a = (i / 4) * TAU + 0.4
        return <Part key={i} geo={cyl(0.012, 0.012, 0.2, 6)} m={K.brass} p={[Math.cos(a) * 0.07, 1.88, Math.sin(a) * 0.07]} rotation={[Math.sin(a) * 0.9, 0, -Math.cos(a) * 0.9]} castShadow={false} />
      })}
      {/* le duffle-coat camel accroché devant est dans DripCoat : c'est lui qu'on touche pour l'entendre goutter */}
      {/* l'écharpe en tartan qui pend du crochet */}
      <group position={[0.1, 1.82, -0.06]} rotation-y={0.9}>
        <Part geo={rbox(0.11, 0.62, 0.025, 0.012)} m={K.stewartSmall} p={[0.03, -0.3, 0]} rotation-z={0.06} />
        <Part geo={rbox(0.11, 0.48, 0.025, 0.012)} m={K.stewartSmall} p={[-0.07, -0.23, 0.02]} rotation-z={-0.08} />
      </group>
      {/* la casquette de tweed, au sommet */}
      <group position={[0, 2.08, 0]} rotation={[0.12, 0.6, 0]}>
        <Part geo={SPH} m={K.tweed} scale={[0.12, 0.05, 0.13]} />
        <Part geo={SPH} m={K.tweed} scale={[0.1, 0.015, 0.07]} p={[0.11, -0.02, 0]} />
      </group>
    </group>
  )
}

// Le parapluie ouvert, dans son repère : le manche vers -y, la pointe en haut (y = 0,5). La toile est une coupole tournée (Lathe)
// dont le bord se creuse en festons entre les huit baleines ; les baleines courent dessous, de la noix au bout de chaque pan.
const RIBS = 8, RIM = 0.42, RIM_Y = 0.27, APEX = 0.45
const canopy = (() => {
  const pts = Array.from({ length: 9 }, (_, i) => {
    const u = i / 8
    return new Vector2(0.001 + RIM * Math.sin((u * Math.PI) / 2), APEX - (APEX - RIM_Y) * u * u)
  })
  const g = new LatheGeometry(pts, RIBS * 6)
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), z = p.getZ(i), r = Math.hypot(x, z)
    // les festons : entre deux baleines, le bord remonte un peu
    const a = Math.atan2(x, z), between = 0.5 - 0.5 * Math.cos(a * RIBS)
    p.setY(i, p.getY(i) + 0.035 * between * (r / RIM) ** 3)
  }
  g.computeVertexNormals()
  return g
})()
const ribGeos = Array.from({ length: RIBS }, (_, k) => {
  const a = (k / RIBS) * TAU
  const pts = Array.from({ length: 7 }, (_, i) => {
    const u = i / 6, r = (RIM - 0.012) * Math.sin((u * Math.PI) / 2), y = APEX - 0.012 - (APEX - RIM_Y) * u * u
    return new Vector3(Math.sin(a) * r, y, Math.cos(a) * r)
  })
  return new TubeGeometry(new CatmullRomCurve3(pts), 12, 0.006, 5, false)
})
// la crosse du manche, en noyer
const hook = new TubeGeometry(new CatmullRomCurve3([[0, -0.2, 0], [0, -0.27, 0], [0.015, -0.31, 0], [0.055, -0.32, 0], [0.085, -0.295, 0], [0.088, -0.265, 0]].map(([x, y, z]) => new Vector3(x, y, z))), 20, 0.016, 8, false)

/**
 * Un parapluie en tartan resté ouvert par terre, qui sèche : couché sur le bord de sa toile, la pointe vers le fond, le manche
 * en l'air vers nous ; on voit dedans les baleines et le coulisseau. Sa flaque est dessous.
 */
function OpenUmbrella() {
  // l'axe du manche (de la crosse vers la pointe) part vers l'arrière et un peu vers le bas : rotation-x = -1,93 ; le point le plus
  // bas du bord de la toile est alors à 0,49 sous l'origine du groupe
  return (
    <group position={[1.95, 0.495, 2.75]} rotation-y={1.25}>
      <group rotation-x={-1.93}>
        <Part geo={canopy} m={K.stewartOpen} castShadow />
        {ribGeos.map((g, i) => (
          <Part key={i} geo={g} m={M.plum} castShadow={false} />
        ))}
        {/* la pointe et sa noix, le coulisseau sur le manche */}
        <Part geo={cyl(0.01, 0.004, 0.08, 6)} m={K.brass} p={[0, APEX + 0.04, 0]} castShadow={false} />
        <Part geo={cyl(0.022, 0.022, 0.04, 10)} m={M.plum} p={[0, APEX - 0.03, 0]} castShadow={false} />
        <Part geo={cyl(0.011, 0.011, 0.66, 8)} m={M.plum} p={[0, APEX - 0.33, 0]} castShadow={false} />
        <Part geo={cyl(0.02, 0.02, 0.05, 10)} m={M.plum} p={[0, 0.17, 0]} castShadow={false} />
        <Part geo={hook} m={K.walnut} castShadow={false} />
        {/* le lien de toile, pendant, avec sa pression de laiton */}
        <Part geo={rbox(0.03, 0.12, 0.008, 0.004)} m={K.stewartSmall} p={[0.36, RIM_Y - 0.03, 0.05]} rotation-z={0.5} castShadow={false} />
      </group>
    </group>
  )
}

/** Porte-parapluies et sa flaque, portemanteau, parapluie ouvert, paillasson. */
export function Umbrellas() {
  return (
    <>
      <CoatStand />
      <group position={[2.76, 0, 0.45]}>
        {/* le porte-parapluies est ouvert : on voit les parapluies entrer dedans, et son fond sombre */}
        <Vessel p={[0, 0, 0]} rt={0.2} rb={0.17} h={0.55} m={K.green} inner={K.greenInner} rim={K.brass} t={0.014} />
        <Part m={K.brass} p={[0, 0.53, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.2, 0.018, 8, 28]} />
        </Part>
        <Part m={K.brass} p={[0, 0.06, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.172, 0.014, 8, 28]} />
        </Part>
        {UMBRELLAS.map(([x, tilt, m], i) => (
          <group key={i} position={[x, 0.02, 0]} rotation-z={tilt} rotation-x={i === 1 ? 0.06 : -0.04}>
            <Part geo={cyl(0.012, 0.012, 1.2, 8)} m={M.plum} p={[0, 0.6, 0]} />
            {/* la toile roulée, large vers la poignée, serrée par son lien de laiton */}
            <Part m={m} p={[0, 0.7, 0]} rotation-x={Math.PI}>
              <coneGeometry args={[0.08, 0.6, 8]} />
            </Part>
            <Part geo={cyl(0.066, 0.066, 0.035, 8)} m={K.brass} p={[0, 0.86, 0]} castShadow={false} />
            <Part m={K.walnut} p={[0.05, 1.2, 0]}>
              <torusGeometry args={[0.05, 0.017, 8, 16, Math.PI]} />
            </Part>
          </group>
        ))}
      </group>
      {/* les flaques : sous le porte-parapluies, et devant la porte */}
      <mesh geometry={cyl(0.4, 0.4, 0.008, 28)} material={K.puddle} position={[2.62, 0.006, 0.58]} scale={[1.1, 1, 0.75]} receiveShadow />
      <mesh geometry={cyl(0.3, 0.3, 0.008, 24)} material={K.puddle} position={[1.71, 0.006, 2.67]} scale={[1.4, 1, 1.1]} rotation-y={1.25} receiveShadow />
      <OpenUmbrella />
      {/* le paillasson, devant la porte (hors champ, à droite) */}
      <group position={[2.72, 0, 1.88]} rotation-y={Math.PI / 2}>
        <Part geo={rbox(0.98, 0.022, 0.64, 0.01)} m={K.walnut} p={[0, 0.011, 0]} />
        {/* le coco, 6 mm au-dessus de la bordure (à 0,5 mm, les deux surfaces se disputaient le pixel) */}
        <mesh material={K.coir} position={[0, 0.028, 0]} rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[0.96, 0.62]} />
        </mesh>
      </group>
    </>
  )
}
