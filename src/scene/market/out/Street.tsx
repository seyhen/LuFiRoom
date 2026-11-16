import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, CatmullRomCurve3, MeshBasicMaterial, TubeGeometry, Vector3 } from 'three'
import { mood } from '../../anim'
import { smooth } from '../../../math'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../../parts'
import { far, gummy } from '../../materials'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { reflectTex, wetTex } from '../../laundromat/out/streetTex'
import { F } from './Zakkyo'

// La chaussée du marché : de quoi la lire comme une vraie rue japonaise. Passage piéton, lignes de rive, flèche, plaques d'égout et
// avaloirs, cônes de chantier, miroir de carrefour (カーブミラー), poteau électrique et ses fils, flaques où se reflètent les néons.

const ROAD = -0.42
const tube = (pts: V3[], r: number) => new TubeGeometry(new CatmullRomCurve3(pts.map((p) => new Vector3(...p))), 24, r, 5, false)

const S = {
  paint: skyFade(snowTop(far(0xe8e4f0, { roughness: 0.6, emissive: 0x6a6a98, emissiveIntensity: 0.1 }), 1, 0.4, 0.8), F),
  yellow: skyFade(far(0xf2c84a, { roughness: 0.6, emissive: 0x8a6a1a, emissiveIntensity: 0.1 }), F),
  iron: skyFade(far(0x2e2a36, { roughness: 0.4, metalness: 0.3 }), F),
  grate: skyFade(far(0x14111a, { roughness: 0.5 }), F),
  concrete: skyFade(far(0x8c8796, { roughness: 0.8 }), F),
  cone: skyFade(far(0xff6a2a, { roughness: 0.5, clearcoat: 0.4, emissive: 0xff5a1a, emissiveIntensity: 0.08 }), F),
  coneBand: skyFade(far(0xf4f0f6, { roughness: 0.4, emissive: 0xffffff, emissiveIntensity: 0.12 }), F),
  orange: skyFade(far(0xf08a2a, { roughness: 0.4, clearcoat: 0.5 }), F),
  mirror: skyFade(far(0xaecaf2, { roughness: 0.05, metalness: 0.4, emissive: 0x6a7ab0, emissiveIntensity: 0.25 }), F),
  trafo: skyFade(far(0x77727f, { roughness: 0.55 }), F),
  // l'eau noire des flaques : un masque doux (jamais un autocollant), et les raies de néon qui s'y reflètent
  wet: gummy(0x0e0a18, { map: wetTex, alphaMap: wetTex, roughness: 0.02, clearcoat: 1, transparent: true, opacity: 0.55, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1 }),
  pink: new MeshBasicMaterial({ map: reflectTex, color: 0xff5ab8, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 }),
  cyan: new MeshBasicMaterial({ map: reflectTex, color: 0x5ad8ff, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 }),
  amber: new MeshBasicMaterial({ map: reflectTex, color: 0xffa24a, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -3 }),
}

/** [x, z, largeur, profondeur, rotation, raie de néon]. */
const PUDDLES: [number, number, number, number, number, 'pink' | 'cyan' | 'amber'][] = [
  [1.3, 8.9, 2.3, 1.5, 0.3, 'pink'], [-6.2, 12.0, 2.6, 1.6, 2.2, 'cyan'], [9.8, -0.8, 2.2, 1.4, 0.8, 'amber'], [-0.2, 11.8, 1.5, 1.0, 1.0, 'pink'],
]

/** Le passage piéton, la ligne d'arrêt et les lignes de rive, la flèche, les avaloirs. */
function Paint() {
  const y = ROAD + 0.012
  return (
    <>
      {/* le passage piéton devant le coin gauche : des bandes dans le sens de la circulation, côte à côte */}
      {Array.from({ length: 6 }, (_, i) => <Part key={i} geo={rbox(2.4, 0.02, 0.38, 0.01)} m={S.paint} p={[-2.4, y, 10.1 + i * 0.78]} castShadow={false} />)}
      {/* la ligne d'arrêt, de l'autre côté du passage */}
      <Part geo={rbox(0.28, 0.02, 4.7, 0.01)} m={S.paint} p={[-0.7, y, 11.9]} castShadow={false} />
      {/* la ligne de rive jaune le long du trottoir de gauche, des tirets blancs au milieu de la rue */}
      {Array.from({ length: 5 }, (_, i) => <Part key={i} geo={rbox(0.9, 0.02, 0.12, 0.01)} m={S.paint} p={[-9.6 + i * 1.5, y, 13.6]} castShadow={false} />)}
      <Part geo={rbox(5.6, 0.02, 0.12, 0.01)} m={S.yellow} p={[-7.0, y, 9.78]} castShadow={false} />
      {/* de l'autre côté, le long du trottoir du fond (y compris devant le poteau) */}
      <Part geo={rbox(6.4, 0.02, 0.12, 0.01)} m={S.yellow} p={[6.4, y, -3.0]} castShadow={false} />
      {/* une flèche de voie : hampe et pointe */}
      <group position={[3.4, y, 10.6]} rotation-y={Math.PI / 2}>
        <Part geo={rbox(0.22, 0.02, 1.1, 0.01)} m={S.paint} p={[0, 0, 0.1]} castShadow={false} />
        <Part geo={cyl(0.0, 0.5, 0.02, 3)} m={S.paint} p={[0, 0, -0.65]} rotation-y={Math.PI} castShadow={false} />
      </group>
      {/* les avaloirs au pied des trottoirs, les plaques d'égout (rond de fonte, anneau, damier) */}
      <Part geo={rbox(0.9, 0.025, 0.4, 0.01)} m={S.grate} p={[-3.7, y + 0.003, 10.0]} castShadow={false} />
      <Part geo={rbox(0.9, 0.025, 0.4, 0.01)} m={S.grate} p={[-1.0, y + 0.003, 4.0]} castShadow={false} />
      {([[3.0, 9.0], [-5.2, 11.4], [8.6, 2.4]] as const).map(([x, z]) => (
        <group key={`${x}${z}`} position={[x, y, z]}>
          <Part geo={cyl(0.42, 0.42, 0.024, 24)} m={S.iron} castShadow={false} />
          <Part geo={cyl(0.3, 0.3, 0.03, 24)} m={S.grate} castShadow={false} />
          <Part geo={cyl(0.14, 0.14, 0.034, 6)} m={S.iron} castShadow={false} />
        </group>
      ))}
    </>
  )
}

/** Un cône de chantier : socle carré, corps, deux bandes réfléchissantes. */
function Cone({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, ROAD, z]}>
      <Part geo={rbox(0.36, 0.04, 0.36, 0.015)} m={S.iron} p={[0, 0.02, 0]} castShadow={false} />
      <Part geo={cyl(0.04, 0.14, 0.52, 14)} m={S.cone} p={[0, 0.3, 0]} castShadow={false} />
      <Part geo={cyl(0.082, 0.098, 0.07, 14)} m={S.coneBand} p={[0, 0.34, 0]} castShadow={false} />
      <Part geo={cyl(0.108, 0.122, 0.05, 14)} m={S.coneBand} p={[0, 0.2, 0]} castShadow={false} />
    </group>
  )
}

/** Le miroir de carrefour : un poteau orange, un grand disque bombé de miroir dans un bord orange, le dos de métal. */
function CurveMirror({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, ROAD, z]} rotation-y={-0.8}>
      <Part geo={cyl(0.07, 0.09, 0.2, 10)} m={S.orange} p={[0, 0.1, 0]} castShadow={false} />
      <Part geo={cyl(0.04, 0.04, 2.9, 10)} m={S.concrete} p={[0, 1.55, 0]} castShadow={false} />
      <Part geo={cyl(0.3, 0.3, 0.05, 28)} m={S.orange} p={[0.0, 3.0, 0.02]} rotation-x={Math.PI / 2} castShadow={false} />
      <Part geo={SPH} m={S.mirror} p={[0, 3.0, 0.07]} scale={[0.27, 0.27, 0.07]} castShadow={false} />
      <Part geo={rbox(0.5, 0.05, 0.05, 0.02)} m={S.orange} p={[0, 3.0, -0.02]} castShadow={false} />
    </group>
  )
}

/** Le poteau électrique en béton : fût, deux traverses à isolateurs, transformateurs, étriers, fils qui pendent jusqu'à la façade. */
const WIRES: V3[][] = [
  [[9.1, 5.4, -3.2], [9.3, 5.0, -4.2], [9.2, 4.7, -5.05]],
  [[10.1, 5.4, -3.2], [10.0, 5.0, -4.2], [9.9, 4.6, -5.05]],
  [[10.6, 5.1, -3.2], [10.4, 4.7, -4.2], [10.3, 4.4, -5.05]],
]
function Pole({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, ROAD, z]}>
      <Part geo={cyl(0.08, 0.14, 5.9, 12)} m={S.concrete} p={[0, 2.95, 0]} castShadow={false} />
      {[5.45, 5.0].map((y, i) => <Part key={y} geo={rbox(0.08, 0.08, 1.7 - i * 0.4, 0.02)} m={S.iron} p={[0, y, 0]} castShadow={false} />)}
      {[-0.72, 0, 0.72].map((dz) => <Part key={dz} geo={cyl(0.03, 0.04, 0.12, 8)} m={S.concrete} p={[0, 5.54, dz]} castShadow={false} />)}
      <Part geo={cyl(0.19, 0.19, 0.62, 14)} m={S.trafo} p={[0.28, 4.3, 0]} castShadow={false} />
      <Part geo={cyl(0.2, 0.2, 0.05, 14)} m={S.iron} p={[0.28, 4.62, 0]} castShadow={false} />
      <Part geo={cyl(0.12, 0.12, 0.44, 12)} m={S.trafo} p={[-0.26, 4.2, 0.1]} castShadow={false} />
      {[1.6, 2.2].map((y) => <Part key={y} geo={rbox(0.05, 0.05, 0.3, 0.015)} m={S.iron} p={[0.16, y, 0]} castShadow={false} />)}
    </group>
  )
}

/** Tout ce qui se pose sur la chaussée et au bord : à mettre dans le `<Static>` du dehors. */
export function Street() {
  return (
    <>
      <Paint />
      <Cone x={-1.9} z={13.6} />
      <Cone x={-1.3} z={9.3} />
      <Cone x={10.9} z={-1.8} />
      <CurveMirror x={10.9} z={-2.5} />
      <Pole x={9.6} z={-3.2} />
      {WIRES.map((w, i) => <Part key={i} geo={tube(w, 0.012)} m={S.iron} castShadow={false} />)}
    </>
  )
}

/** Les flaques où se reflètent les néons (hors du `<Static>` : leur reflet s'allume le soir). */
export function StreetPuddles() {
  useFrame(() => {
    const n = smooth(mood.night), k = Math.min(1, n + mood.rain * 0.3), wet = Math.max(0.55, mood.rain)
    S.wet.opacity = 0.5 + wet * 0.2
    S.pink.opacity = Math.min(1, 0.25 + k * 0.95) * wet
    S.cyan.opacity = Math.min(1, 0.2 + k * 0.9) * wet
    S.amber.opacity = Math.min(1, 0.2 + k * 0.85) * wet
  })
  return (
    <>
      {PUDDLES.map(([x, z, w, d, ry, c], i) => (
        <group key={i}>
          <mesh material={S.wet} position={[x, ROAD + 0.012, z]} rotation={[-Math.PI / 2, 0, ry]} raycast={noRay}><planeGeometry args={[w, d]} /></mesh>
          <mesh material={S[c]} position={[x, ROAD + 0.03, z]} rotation={[-Math.PI / 2, 0, Math.PI / 4]} renderOrder={3} raycast={noRay}><planeGeometry args={[Math.min(w, d) * 0.7, Math.min(3.2, Math.max(w, d) * 1.25)]} /></mesh>
        </group>
      ))}
    </>
  )
}
