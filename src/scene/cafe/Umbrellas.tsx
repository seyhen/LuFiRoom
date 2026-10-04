import { TAU } from '../../math'
import { M } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { K } from './materials'
import { Garment } from '../objects/Garment'

// L'entrée est à droite, hors champ : on arrive trempé, on accroche son manteau, on laisse son parapluie s'égoutter.
// Trois parapluies fermés dans le porte-parapluies : [x, inclinaison, matériau].
const UMBRELLAS = [[-0.07, 0.22, K.stewartSmall], [0.05, -0.1, K.navy], [0.12, -0.26, K.burgundy]] as const

/** Portemanteau de bois courbé : un caban, une écharpe en tartan, une casquette de tweed. */
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
      {/* le duffle-coat camel, accroché devant : sa capuche retombe dans le dos, brandebourgs et poches plaquées */}
      <Garment p={[0.06, 1.9, 0.08]} r={[0.04, 0.75, 0]} m={K.tweed}>
        <Part geo={SPH} m={K.tweed} scale={[0.12, 0.13, 0.06]} p={[0, -0.13, -0.06]} castShadow={false} />
        {[-0.24, -0.38, -0.52].map((y) => (
          <group key={y}>
            <Part geo={rbox(0.07, 0.014, 0.014, 0.006)} m={K.wool} p={[0.02, y, 0.055]} castShadow={false} />
            <Part geo={cyl(0.009, 0.009, 0.045, 6)} m={K.walnut} p={[-0.025, y, 0.06]} rotation-z={Math.PI / 2} castShadow={false} />
          </group>
        ))}
        {[-1, 1].map((sd) => (
          <Part key={sd} geo={rbox(0.11, 0.1, 0.012, 0.01)} m={K.tweed} p={[sd * 0.1, -0.68, 0.055]} castShadow={false} />
        ))}
      </Garment>
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

/** Un parapluie en tartan resté ouvert par terre, qui sèche : il repose sur le bord de sa toile, le manche en l'air. */
function OpenUmbrella() {
  return (
    <group position={[1.75, 0, 2.3]} rotation-y={-0.9}>
      <group position={[0, 0.33, 0]} rotation-x={0.75}>
        <Part m={K.stewartSmall} castShadow>
          <coneGeometry args={[0.42, 0.2, 8, 1, true]} />
        </Part>
        <Part m={K.stewartSmall} rotation-x={Math.PI} p={[0, -0.002, 0]} castShadow={false}>
          <coneGeometry args={[0.415, 0.2, 8, 1, true]} />
        </Part>
        <Part geo={SPH} m={M.plum} scale={0.022} p={[0, 0.11, 0]} castShadow={false} />
        <Part geo={cyl(0.011, 0.011, 0.5, 6)} m={M.plum} p={[0, -0.15, 0]} castShadow={false} />
        <Part m={M.plum} p={[0.04, -0.4, 0]} rotation-z={Math.PI} castShadow={false}>
          <torusGeometry args={[0.04, 0.012, 8, 14, Math.PI]} />
        </Part>
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
        <Part geo={cyl(0.2, 0.17, 0.55, 22)} m={K.green} p={[0, 0.275, 0]} />
        <Part geo={cyl(0.205, 0.205, 0.035, 22)} m={K.brass} p={[0, 0.54, 0]} />
        {UMBRELLAS.map(([x, tilt, m], i) => (
          <group key={i} position={[x, 0.3, 0]} rotation-z={tilt} rotation-x={i === 1 ? 0.1 : -0.06}>
            <Part geo={cyl(0.012, 0.012, 0.92, 8)} m={M.plum} p={[0, 0.46, 0]} />
            {/* la toile roulée, large vers la poignée, serrée par son lien de laiton */}
            <Part m={m} p={[0, 0.42, 0]} rotation-x={Math.PI}>
              <coneGeometry args={[0.08, 0.6, 8]} />
            </Part>
            <Part geo={cyl(0.066, 0.066, 0.035, 8)} m={K.brass} p={[0, 0.58, 0]} castShadow={false} />
            <Part m={K.walnut} p={[0.05, 0.92, 0]}>
              <torusGeometry args={[0.05, 0.017, 8, 16, Math.PI]} />
            </Part>
          </group>
        ))}
      </group>
      {/* les flaques : sous le porte-parapluies, et devant la porte */}
      <mesh geometry={cyl(0.4, 0.4, 0.008, 28)} material={K.puddle} position={[2.62, 0.006, 0.58]} scale={[1.1, 1, 0.75]} receiveShadow />
      <mesh geometry={cyl(0.3, 0.3, 0.008, 24)} material={K.puddle} position={[1.85, 0.006, 2.1]} scale={[1.4, 1, 0.9]} receiveShadow />
      <OpenUmbrella />
      {/* le paillasson, devant la porte (hors champ, à droite) */}
      <group position={[2.72, 0, 1.5]} rotation-y={Math.PI / 2}>
        <Part geo={rbox(0.98, 0.022, 0.64, 0.01)} m={K.walnut} p={[0, 0.011, 0]} />
        <mesh material={K.coir} position={[0, 0.0225, 0]} rotation-x={-Math.PI / 2} receiveShadow>
          <planeGeometry args={[0.96, 0.62]} />
        </mesh>
      </group>
    </>
  )
}
