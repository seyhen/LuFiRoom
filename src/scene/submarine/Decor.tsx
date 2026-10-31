import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, type Sprite } from 'three'
import { TAU, smooth } from '../../math'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { mood } from '../anim'
import { glowTex } from '../textures'
import { LIVE } from '../Static'
import { Fern } from '../nature/Fern'
import { leafy } from '../nature/materials'
import { DOT, S } from './materials'
import { gummy } from '../materials'

const fernDark = leafy(0x3f8a74), fernLight = leafy(0x6fb89a)

/** Le tapis rond, au centre de la pièce. */
const RUG = { x: 0.55, z: -0.1, r: 1.75 }

/** Le verre bombé des hublots du scaphandre : bleu d'eau, très brillant, assez opaque pour se lire comme une vitre. */
const helmetGlass = gummy(0x9fd6dc, { roughness: 0.04, clearcoat: 1, clearcoatRoughness: 0.05, transparent: true, opacity: 0.6, emissive: 0x2a6a74, emissiveIntensity: 0.25 })

/** Un scaphandre de cuivre sur son piédestal : casque rond, trois hublots vitrés et grillagés, collerette, boulons. */
function Helmet() {
  return (
    <group position={[-2.12, 0, 2.72]} rotation-y={0.8}>
      <Part geo={cyl(0.3, 0.34, 0.1, 28)} m={S.woodDark} p={[0, 0.05, 0]} />
      <Part geo={cyl(0.22, 0.26, 0.55, 24)} m={S.wood} p={[0, 0.37, 0]} />
      <Part geo={cyl(0.28, 0.28, 0.05, 28)} m={S.brass} p={[0, 0.66, 0]} castShadow={false} />
      <group position={[0, 0.98, 0]}>
        <Part geo={cyl(0.27, 0.3, 0.1, 28)} m={S.brass} p={[0, -0.22, 0]} />
        <Part geo={SPH} m={S.copper} scale={0.3} />
        <Part m={S.brass} p={[0, -0.14, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.27, 0.018, 8, 36]} />
        </Part>
        {/* les trois hublots : devant et de chaque côté, avec leur grille */}
        {[0, 0.9, -0.9].map((a, i) => (
          <group key={i} rotation-y={a}>
            <group position={[0, 0.02, 0.29]} scale={i ? 0.7 : 1}>
              {/* l'intérieur sombre, le verre bombé qui dépasse de la bague, la bague et sa grille à trois barreaux */}
              <Part geo={SPH} m={S.iron} scale={[0.082, 0.082, 0.03]} p={[0, 0, -0.012]} castShadow={false} />
              <Part geo={SPH} m={helmetGlass} scale={[0.08, 0.08, 0.035]} p={[0, 0, 0.0]} castShadow={false} />
              <Part m={S.brass} castShadow={false}>
                <torusGeometry args={[0.09, 0.022, 8, 24]} />
              </Part>
              {i === 0 && [-0.04, 0, 0.04].map((x) => (
                <Part key={x} geo={cyl(0.008, 0.008, 0.17 - Math.abs(x) * 1.2, 6)} m={S.brassDull} p={[x, 0, 0.04]} castShadow={false} />
              ))}
            </group>
          </group>
        ))}
        <Part geo={cyl(0.03, 0.03, 0.06, 10)} m={S.brass} p={[0, 0.3, 0]} castShadow={false} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * TAU
          return <Part key={i} geo={DOT} m={S.brassDull} scale={0.016} p={[Math.cos(a) * 0.29, -0.2, Math.sin(a) * 0.29]} castShadow={false} />
        })}
      </group>
    </group>
  )
}

/** Une fougère de mer dans un pot de cuivre : des frondes en arc, un peu de sable. */
function FernPot({ position }: { position: V3 }) {
  return (
    <group position={position}>
      <Part geo={cyl(0.19, 0.15, 0.3, 22)} m={S.copperDark} p={[0, 0.15, 0]} />
      <Part geo={cyl(0.2, 0.2, 0.03, 22)} m={S.brass} p={[0, 0.3, 0]} castShadow={false} />
      <Part geo={cyl(0.17, 0.17, 0.02, 22)} m={S.cream} p={[0, 0.29, 0]} castShadow={false} />
      <Fern p={[0, 0.3, 0]} size={0.36} n={8} m={fernDark} m2={fernLight} />
    </group>
  )
}

/** Le globe de verre dépoli des appliques : il s'allume la nuit (voir Sconce). */
const globe = gummy(0xfff2d0, { roughness: 0.35, clearcoat: 0.8, emissive: 0xffd48a, emissiveIntensity: 0.15, transparent: true, opacity: 0.92 })

/**
 * Une applique de coursive : une platine ronde de laiton vissée au mur, un globe de verre dépoli en demi-œuf, une bague et une cage
 * de deux arceaux croisés qui le protège. Elle s'allume la nuit. Repère : la platine contre le mur, le globe vers +z.
 */
function Sconce({ position, rotation = 0 }: { position: V3; rotation?: number }) {
  const glow = useRef<Sprite>(null!)
  useFrame(() => {
    const e = smooth(mood.night)
    glow.current.material.opacity = 0.08 + e * 0.7
    globe.emissiveIntensity = 0.15 + e * 1.1
  })
  return (
    <group position={position} rotation-y={rotation} userData={LIVE}>
      <Part geo={cyl(0.17, 0.17, 0.04, 28)} m={S.brass} p={[0, 0, 0.02]} rotation-x={Math.PI / 2} castShadow={false} />
      {[0, 1, 2, 3].map((i) => (
        <Part key={i} geo={DOT} m={S.brassDull} scale={[0.018, 0.018, 0.012]} p={[Math.cos((i / 4) * TAU + 0.78) * 0.14, Math.sin((i / 4) * TAU + 0.78) * 0.14, 0.042]} castShadow={false} />
      ))}
      <Part m={S.brassDull} p={[0, 0, 0.05]} castShadow={false}>
        <torusGeometry args={[0.115, 0.02, 8, 28]} />
      </Part>
      <Part geo={SPH} m={globe} scale={[0.11, 0.11, 0.1]} p={[0, 0, 0.05]} castShadow={false} />
      {/* la cage : deux arceaux croisés (vertical et horizontal) par-dessus le globe, et leur bouton */}
      <Part m={S.brass} p={[0, 0, 0.05]} rotation={[0, -Math.PI / 2, -Math.PI / 2]} castShadow={false}>
        <torusGeometry args={[0.125, 0.009, 6, 20, Math.PI]} />
      </Part>
      <Part m={S.brass} p={[0, 0, 0.05]} rotation={[-Math.PI / 2, 0, Math.PI]} castShadow={false}>
        <torusGeometry args={[0.125, 0.009, 6, 20, Math.PI]} />
      </Part>
      <Part geo={DOT} m={S.brass} scale={0.02} p={[0, 0, 0.175]} castShadow={false} />
      <sprite ref={glow} scale={0.9} position={[0, 0, 0.22]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0xffd890} blending={AdditiveBlending} transparent depthWrite={false} opacity={0.1} />
      </sprite>
    </group>
  )
}

/**
 * Ce qui habille la pièce autour des objets qui sonnent : le tapis rond à médaillon, un scaphandre de cuivre sur son piédestal,
 * une fougère de mer dans un pot de cuivre, des appliques à cage et une bouée de sauvetage.
 */
export function Decor() {
  return (
    <>
      <Part geo={cyl(RUG.r + 0.03, RUG.r + 0.03, 0.02, 56)} m={S.rugEdge} p={[RUG.x, 0.01, RUG.z]} castShadow={false} />
      <mesh material={S.rug} position={[RUG.x, 0.0215, RUG.z]} rotation-x={-Math.PI / 2} rotation-z={0.4} receiveShadow>
        <circleGeometry args={[RUG.r, 56]} />
      </mesh>
      <Helmet />
      {/* entre la console du sonar et l'orgue, à distance des deux */}
      <FernPot position={[-2.5, 0, -1.56]} />
      <Sconce position={[-1.05, 2.4, -2.93]} />
      <Sconce position={[-2.93, 3.0, -1.2]} rotation={Math.PI / 2} />
      {/* la bouée de sauvetage, accrochée au mur du fond à droite du hublot, sous les tuyaux de cuivre (qui passent au-dessus) :
          une patte de laiton vissée au mur et une cordelette qui la tient */}
      <Part geo={rbox(0.12, 0.07, 0.06, 0.02)} m={S.brass} p={[2.35, 3.68, -2.93]} castShadow={false} />
      <Part geo={cyl(0.012, 0.012, 0.07, 6)} m={S.cream} p={[2.35, 3.64, -2.91]} castShadow={false} />
      <group position={[2.35, 3.26, -2.94]}>
        <Part m={S.red}>
          <torusGeometry args={[0.28, 0.08, 14, 36]} />
        </Part>
        {[0, 1, 2, 3].map((i) => (
          <Part key={i} geo={rbox(0.07, 0.12, 0.17, 0.02)} m={S.cream} p={[Math.cos((i / 4) * TAU) * 0.28, Math.sin((i / 4) * TAU) * 0.28, 0]} rotation-z={(i / 4) * TAU} castShadow={false} />
        ))}
      </group>
    </>
  )
}
