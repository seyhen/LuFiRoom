import { useRef } from 'react'
import type { Group } from 'three'
import { M } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { useSquash } from '../anim'
import { Flames } from '../objects/Flames'
import { Static } from '../Static'
import { K } from './materials'
import { Candle } from '../objects/Candle'

// La cheminée est au milieu du mur de gauche (x = -3, face à +x), entre les deux bibliothèques.
// Le groupe est posé à x = -2.7 : dans ses coordonnées, +x va vers la salle et z suit le mur.
const X = -2.7
const COALS = [[-0.16, 0.37], [-0.08, 0.4], [0, 0.38], [0.08, 0.41], [0.16, 0.37], [-0.12, 0.44], [0.04, 0.45], [0.12, 0.44], [-0.03, 0.48]]

/** Petit bouquet de chardons dans un pot bleu : l'emblème de l'Écosse, sur le manteau. */
function Thistles({ z }: { z: number }) {
  return (
    <group position={[0.12, 1.48, z]}>
      <Part geo={cyl(0.045, 0.035, 0.12, 14)} m={K.navy} p={[0, 0.06, 0]} castShadow={false} />
      {[[-0.03, 0.26, 0.2], [0.02, 0.3, -0.1], [0.035, 0.22, 0.45]].map(([dz, h, tilt], i) => (
        <group key={i} position={[0, 0.1, dz]} rotation-x={tilt}>
          <Part geo={cyl(0.005, 0.005, h, 6)} m={K.leafDark} p={[0, h / 2, 0]} castShadow={false} />
          <Part geo={SPH} m={K.leaf} scale={[0.024, 0.02, 0.024]} p={[0, h, 0]} castShadow={false} />
          <Part geo={SPH} m={K.thistle} scale={[0.02, 0.03, 0.02]} p={[0, h + 0.03, 0]} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

/**
 * Cheminée victorienne : conduit de grès, manteau peint crème, joues de carreaux, foyer de fonte à arche de laiton,
 * grille et charbons qui rougeoient, garde-feu de laiton. Au-dessus, un tableau du Château et deux chandeliers.
 */
export function Hearth() {
  const g = useRef<Group>(null!)
  useSquash('fireplace', g)
  return (
    <>
      {/* le conduit, fixe (il ne rebondit pas avec le reste) */}
      <Part geo={rbox(0.3, 4.3, 1.9, 0.06)} m={K.stone} p={[-2.85, 2.15, 0]} />
      <Part geo={rbox(0.36, 0.1, 2.0, 0.04)} m={K.oak} p={[-2.83, 4.24, 0]} />
      <mesh material={K.paper} position={[-2.695, 2.13, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[1.84, 4.1]} />
      </mesh>
      {/* le tableau, cadre doré */}
      <Part geo={rbox(0.06, 0.86, 1.18, 0.03)} m={K.brass} p={[-2.68, 2.38, 0]} />
      <mesh material={K.painting} position={[-2.645, 2.38, 0]} rotation-y={Math.PI / 2} receiveShadow>
        <planeGeometry args={[1.04, 0.72]} />
      </mesh>
      {/* deux appliques de laiton, globes allumés */}
      {[-0.78, 0.78].map((z) => (
        <group key={z} position={[-2.69, 2.5, z]}>
          <Part geo={cyl(0.03, 0.03, 0.02, 10)} m={K.brass} rotation-z={Math.PI / 2} castShadow={false} />
          <Part geo={cyl(0.01, 0.01, 0.12, 6)} m={K.brass} p={[0.06, 0.02, 0]} rotation-z={Math.PI / 2 - 0.5} castShadow={false} />
          <Part geo={cyl(0.03, 0.02, 0.03, 10)} m={K.brass} p={[0.11, 0.06, 0]} castShadow={false} />
          <mesh geometry={SPH} material={K.bulb} scale={[0.055, 0.065, 0.055]} position={[0.11, 0.13, 0]} />
        </group>
      ))}
      <group ref={g} userData={{ id: 'fireplace' }} position={[X, 0, 0]}>
        <Static>
          {/* âtre d'ardoise, jambages et manteau peints */}
          <Part geo={rbox(0.62, 0.06, 1.7, 0.03)} m={K.slate} p={[0.02, 0.03, 0]} />
          {[-0.74, 0.74].map((z) => (
            <Part key={z} geo={rbox(0.16, 1.22, 0.22, 0.04)} m={M.cream} p={[0.1, 0.67, z]} />
          ))}
          <Part geo={rbox(0.18, 0.22, 1.7, 0.04)} m={M.cream} p={[0.1, 1.3, 0]} />
          <Part geo={rbox(0.05, 0.13, 0.34, 0.02)} m={M.pillow} p={[0.2, 1.3, 0]} />
          <Part geo={rbox(0.32, 0.07, 1.94, 0.03)} m={M.cream} p={[0.12, 1.445, 0]} />
          {/* joues de carreaux victoriens */}
          {[-0.53, 0.53].map((z) => (
            <mesh key={z} material={K.tiles} position={[0.035, 0.66, z]} rotation-y={Math.PI / 2} receiveShadow>
              <planeGeometry args={[0.2, 1.0]} />
            </mesh>
          ))}
          {/* foyer de fonte, ouverture en arche, rebord de laiton */}
          <Part geo={rbox(0.08, 1.06, 0.86, 0.03)} m={K.iron} p={[0, 0.63, 0]} />
          <mesh material={K.soot} position={[0.045, 0.38, 0]} rotation-y={Math.PI / 2}>
            <planeGeometry args={[0.5, 0.56]} />
          </mesh>
          <mesh material={K.soot} position={[0.045, 0.66, 0]} rotation-y={Math.PI / 2}>
            <circleGeometry args={[0.25, 24, 0, Math.PI]} />
          </mesh>
          <Part m={K.brass} p={[0.055, 0.66, 0]} rotation-y={Math.PI / 2}>
            <torusGeometry args={[0.265, 0.022, 8, 24, Math.PI]} />
          </Part>
          {/* grille et charbons */}
          {[-0.18, -0.09, 0, 0.09, 0.18].map((z) => (
            <Part key={z} geo={cyl(0.01, 0.01, 0.2, 6)} m={K.brass} p={[0.14, 0.27, z]} castShadow={false} />
          ))}
          {[0.17, 0.36].map((y) => (
            <Part key={y} geo={cyl(0.012, 0.012, 0.44, 6)} m={K.brass} p={[0.14, y, 0]} rotation-x={Math.PI / 2} castShadow={false} />
          ))}
          {COALS.map(([z, y], i) => (
            <mesh key={i} geometry={SPH} material={K.coal} scale={[0.05, 0.04, 0.05]} position={[0.08, y, z]} />
          ))}
          <group rotation-y={Math.PI / 2} position={[0.07, 0.4, 0]}>
            <Flames
              id="fireplace"
              size={0.55}
              light={{ at: [0, 0.4, 0.55], intensity: 1.3, distance: 7 }}
              glow={{ at: [0, 0.22, 0.25], scale: 1.9 }}
              embers={{ spread: 0.14, at: [0, 0.08, 0.06] }}
              onFrame={(k, t) => (K.coal.emissiveIntensity = 0.12 + k * (1.3 + Math.sin(t * 2.7) * 0.25))}
            />
          </group>
          {/* garde-feu de laiton */}
          <Part geo={cyl(0.014, 0.014, 1.52, 8)} m={K.brass} p={[0.32, 0.11, 0]} rotation-x={Math.PI / 2} castShadow={false} />
          {[-0.76, 0.76].map((z) => (
            <Part key={z} geo={cyl(0.014, 0.014, 0.3, 8)} m={K.brass} p={[0.17, 0.11, z]} rotation-z={Math.PI / 2} castShadow={false} />
          ))}
          {/* sur le manteau : chandeliers, chardons, une pile de livres */}
          <Candle position={[0.12, 1.61, -0.7]} holder="brass" height={0.14} />
          <Candle position={[0.12, 1.61, 0.7]} holder="brass" height={0.1} />
          <Thistles z={0.34} />
          {[[0x8e2f3a, 0.035], [0x2c5a4c, 0.03], [0xd9a441, 0.028]].map(([c, h], i) => (
            <mesh key={i} geometry={rbox(0.2, h, 0.15, 0.01)} position={[0.12, 1.5 + i * 0.033, -0.32]} rotation-y={i * 0.2} castShadow receiveShadow>
              <meshPhysicalMaterial color={c} roughness={0.6} clearcoat={0.3} />
            </mesh>
          ))}
        </Static>
      </group>
    </>
  )
}
