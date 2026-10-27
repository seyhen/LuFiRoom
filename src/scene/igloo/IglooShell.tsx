import { useMemo } from 'react'
import { ExtrudeGeometry, Shape, ShapeGeometry } from 'three'
import { Part, SPH, cyl, rbox } from '../parts'
import { I } from './materials'

/** Le dôme : rayon intérieur et extérieur (la neige fait 25 cm d'épaisseur). Centré à l'origine, posé sur le sol (y = 0). */
export const DOME = { r: 3.0, R: 3.25 }
const deg = (d: number) => (d * Math.PI) / 180
/** Un point au sol (ou à la hauteur y) dans la direction `a` (degrés, 0 = +x, 90 = +z), à la distance `r` du centre. */
export const polar = (a: number, r: number, y = 0): [number, number, number] => [Math.cos(deg(a)) * r, y, Math.sin(deg(a)) * r]
/** Tourne un objet pour que son axe x suive la paroi dans la direction `a` (tangente au cercle). */
export const along = (a: number) => -(deg(a) + Math.PI / 2)

/**
 * Le bord de l'île de neige (rayon selon l'angle, en radians) : un rond de 4 m qui ondule doucement, assez grand pour qu'il reste de
 * la place dehors, autour du dôme (le traîneau, les sapins, la lanterne de neige), sans sortir du cadre des pièces carrées.
 */
export const shore = (t: number) => 4.0 + 0.1 * Math.sin(3 * t + 0.6) + 0.06 * Math.sin(5 * t + 2.1)

function islandShape(inset = 0) {
  const s = new Shape(), n = 96
  for (let i = 0; i <= n; i++) {
    const t = (i / n) * Math.PI * 2, r = shore(t) - inset
    // la forme est dessinée dans le plan (x, -z) puis couchée : y de la forme = -z de la pièce
    i ? s.lineTo(Math.cos(t) * r, -Math.sin(t) * r) : s.moveTo(Math.cos(t) * r, -Math.sin(t) * r)
  }
  return s
}

// La banquette de couchage : un arc de neige tassée contre la paroi du fond, de 190° à 250°, 45 cm de haut.
export const BENCH = { a0: 190, a1: 250, r0: 1.95, r1: 2.93, h: 0.45 }
// L'entrée : un tunnel bas, à gauche, vers le devant.
export const DOOR = { a: 160, w: 0.55, h: 0.95 }

function sector(a0: number, a1: number, r0: number, r1: number, h: number) {
  const s = new Shape(), n = 24
  for (let i = 0; i <= n; i++) {
    const a = deg(a0 + ((a1 - a0) * i) / n)
    i ? s.lineTo(Math.cos(a) * r1, -Math.sin(a) * r1) : s.moveTo(Math.cos(a) * r1, -Math.sin(a) * r1)
  }
  for (let i = n; i >= 0; i--) {
    const a = deg(a0 + ((a1 - a0) * i) / n)
    s.lineTo(Math.cos(a) * r0, -Math.sin(a) * r0)
  }
  s.closePath()
  const g = new ExtrudeGeometry(s, { depth: h - 0.08, bevelEnabled: true, bevelThickness: 0.04, bevelSize: 0.04, bevelSegments: 3, curveSegments: 12 })
  g.rotateX(-Math.PI / 2)
  g.translate(0, 0.04, 0)
  return g
}

// Des congères contre le dôme, dehors : [angle, distance, largeur, hauteur].
const DRIFTS: [number, number, number, number][] = [
  [125, 3.3, 0.45, 0.22], [140, 3.35, 0.32, 0.16], [185, 3.38, 0.5, 0.2], [228, 3.36, 0.55, 0.24], [262, 3.36, 0.45, 0.2],
  [300, 3.32, 0.5, 0.22], [322, 3.3, 0.36, 0.17],
]

/**
 * L'igloo : un socle rond de neige, un dôme de blocs taillés (dehors et dedans), coupé net sur le devant pour qu'on voie l'intérieur,
 * avec la tranche de neige bien lisible ; l'entrée en tunnel à gauche, sa peau roulée au-dessus de l'ouverture ; la banquette de
 * couchage contre le fond, et des congères tout autour.
 */
export function IglooShell() {
  const bench = useMemo(() => sector(BENCH.a0, BENCH.a1, BENCH.r0, BENCH.r1, BENCH.h), [])
  const island = useMemo(() => {
    const g = new ExtrudeGeometry(islandShape(0.12), { depth: 0.36, bevelEnabled: true, bevelThickness: 0.1, bevelSize: 0.12, bevelSegments: 4, curveSegments: 96 })
    g.rotateX(-Math.PI / 2)
    g.translate(0, -0.46, 0)
    return g
  }, [])
  const floor = useMemo(() => {
    const g = new ShapeGeometry(islandShape(0.14), 96)
    g.rotateX(-Math.PI / 2)
    // les UV suivent la pièce (1 unité = 1 tuile ; la texture se répète déjà par 2)
    const p = g.attributes.position, uv = g.attributes.uv
    for (let i = 0; i < p.count; i++) uv.setXY(i, p.getX(i) / 4, p.getZ(i) / 4)
    return g
  }, [])
  const { r, R } = DOME
  // Le demi-dôme gardé est derrière le plan x + z = 0 (le côté de la caméra est ouvert) : φ de -135° à 45° dans SphereGeometry.
  const phi0 = -0.75 * Math.PI
  return (
    <>
      {/* le socle, son bord arrondi, et le sol de neige tassée */}
      <mesh geometry={island} material={I.base} castShadow receiveShadow />
      <mesh geometry={floor} material={I.floor} position={[0, 0.004, 0]} receiveShadow />
      {/* le dôme */}
      <mesh material={I.domeOut} castShadow receiveShadow>
        <sphereGeometry args={[R, 56, 24, phi0, Math.PI, 0, Math.PI / 2]} />
      </mesh>
      <mesh material={I.domeIn} receiveShadow>
        <sphereGeometry args={[r, 56, 24, phi0, Math.PI, 0, Math.PI / 2]} />
      </mesh>
      {/* la tranche, sur le devant */}
      <mesh material={I.cut} rotation-y={Math.PI / 4} receiveShadow>
        <ringGeometry args={[r - 0.002, R + 0.002, 64, 1, 0, Math.PI]} />
      </mesh>
      {/* l'entrée : le tunnel dehors (une demi-voûte de neige), l'ouverture sombre dedans, la peau roulée au-dessus */}
      <group rotation-y={-deg(DOOR.a)}>
        <Part m={I.domeOut} p={[R + 0.12, 0, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.72, 0.72, 0.62, 24, 1, true, 0, Math.PI]} />
        </Part>
        <mesh material={I.doorway} position={[3.3, 0.004, 0]} rotation-z={Math.PI / 2}>
          <cylinderGeometry args={[0.6, 0.6, 0.6, 24, 1, true, 0, Math.PI]} />
        </mesh>
        <mesh material={I.cut} position={[R + 0.43, 0, 0]} rotation-y={Math.PI / 2}>
          <ringGeometry args={[0.6, 0.72, 24, 1, 0, Math.PI]} />
        </mesh>
        <mesh material={I.doorway} position={[r - 0.03, 0, 0]} rotation-y={-Math.PI / 2} scale={[DOOR.w, DOOR.h, 1]}>
          <circleGeometry args={[1, 32, 0, Math.PI]} />
        </mesh>
        {/* la peau qui ferme l'entrée la nuit, roulée et nouée au-dessus, sur deux chevilles de bois plantées dans la neige */}
        <Part geo={cyl(0.1, 0.1, 1.15, 16)} m={I.reindeer} p={[r - 0.18, DOOR.h + 0.12, 0]} rotation-x={Math.PI / 2} />
        {[-0.38, 0.38].map((z) => (
          <group key={z}>
            <Part geo={cyl(0.035, 0.035, 0.26, 8)} m={I.wood} p={[r - 0.12, DOOR.h + 0.03, z]} rotation-z={Math.PI / 2} castShadow={false} />
            <Part m={I.rope} p={[r - 0.18, DOOR.h + 0.12, z]} rotation-y={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.112, 0.016, 6, 16]} />
            </Part>
          </group>
        ))}
      </group>
      {/* la banquette de couchage */}
      <mesh geometry={bench} material={I.snow} castShadow receiveShadow />
      {/* les congères dehors */}
      {DRIFTS.map(([a, d, w, h], i) => (
        <Part key={i} geo={SPH} m={i % 2 ? I.snow : I.snowShade} p={polar(a, d, 0)} scale={[w, h, w * 1.3]} rotation-y={along(a)} castShadow={false} />
      ))}
      {/* un bloc de neige taillé, en trop, posé dehors contre le tunnel */}
      <Part geo={rbox(0.5, 0.28, 0.32, 0.06)} m={I.snow} p={polar(118, 3.25, 0.14)} rotation-y={0.6} />
    </>
  )
}
