import { useMemo } from 'react'
import { BufferGeometry, CylinderGeometry, DoubleSide, Float32BufferAttribute, MeshStandardMaterial, PlaneGeometry, Vector3 } from 'three'
import { Part, SPH, cyl, noRay, rbox } from '../../parts'
import { canvasTex } from '../../paint'
import { skyFade } from '../../outdoor'
import { P } from './materials'

/** Une travée-étage de la façade : 4 travées × 2 étages = 6,9 × 6,4 m. */
const TILE_W = 6.9, TILE_H = 6.4
const BOTTOM = -12
/** La pente du brisis (la partie raide du toit mansardé) : son retrait, sa hauteur. */
const INSET = 0.55, BRISIS = 1.7

/** Le garde-corps filant en fer forgé : un plan découpé (volutes et barreaux), un seul tracé pour toute la ville. */
const railTex = canvasTex(256, 64, (x) => {
  x.clearRect(0, 0, 256, 64)
  x.strokeStyle = '#26262c'; x.lineWidth = 5
  x.beginPath(); x.moveTo(0, 4); x.lineTo(256, 4); x.moveTo(0, 60); x.lineTo(256, 60); x.stroke()
  x.lineWidth = 3
  for (let i = 0; i < 8; i++) {
    const cx = i * 32 + 16
    x.beginPath(); x.moveTo(i * 32, 4); x.lineTo(i * 32, 60); x.stroke()
    x.beginPath(); x.arc(cx, 22, 9, 0, 6.3); x.stroke()
    x.beginPath(); x.arc(cx, 44, 9, 0, 6.3); x.stroke()
  }
}, [1, 1])
const railMat = skyFade(new MeshStandardMaterial({ map: railTex, alphaTest: 0.5, side: DoubleSide, roughness: 0.4 }), { c: [0, 0], r0: 7.5, r1: 12.5, below: -4.6 })

function facadeGeo(w: number, h: number, shift = 0) {
  const g = new PlaneGeometry(w, h)
  const uv = g.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (w / TILE_W) + shift, 1 - (1 - uv.getY(i)) * (h / TILE_H))
  return g
}
function railGeo(len: number) {
  const g = new PlaneGeometry(len, 0.9)
  const uv = g.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setX(i, uv.getX(i) * (len / 1.2))
  return g
}

/**
 * Le brisis d'un toit mansardé : quatre pans trapézoïdaux qui se rejoignent en arêtiers aux coins (quatre plaques droites se
 * croisaient et dépassaient l'une de l'autre en ailerons). Pied à y = 0 sur le rectangle w × d, haut rentré de INSET.
 * Les joints debout du zinc tous les 45 cm (une répétition de la texture = 8 bandes = 3,6 m).
 */
function mansardGeo(w: number, d: number) {
  const x = w / 2, z = d / 2, i = INSET
  const lo: [number, number][] = [[-x, z], [x, z], [x, -z], [-x, -z]]
  const hi: [number, number][] = [[-x + i, z - i], [x - i, z - i], [x - i, -z + i], [-x + i, -z + i]]
  const pos: number[] = [], uv: number[] = []
  const a = new Vector3(), b = new Vector3(), c = new Vector3(), n = new Vector3(), o = new Vector3()
  for (let k = 0; k < 4; k++) {
    const k2 = (k + 1) % 4, len = Math.hypot(lo[k2][0] - lo[k][0], lo[k2][1] - lo[k][1]) / 3.6
    const quad: [number, number, number, number, number][] = [
      [lo[k][0], 0, lo[k][1], 0, 0], [lo[k2][0], 0, lo[k2][1], len, 0], [hi[k2][0], BRISIS, hi[k2][1], len - INSET / 3.6, 1], [hi[k][0], BRISIS, hi[k][1], INSET / 3.6, 1],
    ]
    for (let [p, q, r] of [[0, 1, 2], [0, 2, 3]]) {
      // chaque triangle tourné vers l'extérieur
      a.set(quad[p][0], quad[p][1], quad[p][2]); b.set(quad[q][0], quad[q][1], quad[q][2]); c.set(quad[r][0], quad[r][1], quad[r][2])
      n.subVectors(b, a).cross(o.subVectors(c, a))
      o.set((a.x + b.x + c.x) / 3, 0, (a.z + b.z + c.z) / 3)
      if (n.dot(o) < 0) [q, r] = [r, q]
      for (const t of [p, q, r]) { pos.push(quad[t][0], quad[t][1], quad[t][2]); uv.push(quad[t][3], quad[t][4]) }
    }
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.computeVertexNormals()
  return g
}

/** Le toit bombé d'une lucarne : un demi-cylindre couché, l'arrondi en haut (ouvert dessous, caché par le corps). */
const DORMER_ROOF = new CylinderGeometry(1, 1, 1, 18, 1, false, Math.PI / 2, Math.PI)

/** Un garde-corps filant le long des deux façades vues, à la hauteur `y`, posé sur une dalle de pierre (sauf `onCornice`). */
function Balcony({ x0, x1, z0, z1, y, s, slab = true }: { x0: number; x1: number; z0: number; z1: number; y: number; s: number; slab?: boolean }) {
  const w = x1 - x0, d = z1 - z0, o = slab ? 0.36 : 0.11
  const front = useMemo(() => railGeo(w + o), [w, o]), side = useMemo(() => railGeo(d + o), [d, o])
  return (
    <group>
      {slab && (
        <>
          <Part geo={rbox(w + 0.4, 0.12, 0.42, 0.04)} m={P.stone[s]} p={[(x0 + x1) / 2 + 0.2, y - 0.06, z1 + 0.18]} castShadow={false} />
          <Part geo={rbox(0.42, 0.12, d + 0.4, 0.04)} m={P.stone[s]} p={[x1 + 0.18, y - 0.06, (z0 + z1) / 2 + 0.2]} castShadow={false} />
        </>
      )}
      <mesh geometry={front} material={railMat} position={[(x0 + x1) / 2 + o / 2, y + 0.45, z1 + o]} raycast={noRay} />
      <mesh geometry={side} material={railMat} position={[x1 + o, y + 0.45, (z0 + z1) / 2 + o / 2]} rotation-y={Math.PI / 2} raycast={noRay} />
    </group>
  )
}

/**
 * Une lucarne (chien-assis) posée sur le brisis : joues de zinc, encadrement de pierre (jambages, appui, linteau à clé), fenêtre à
 * petits bois en retrait (elle s'allume le soir), petit toit de zinc bombé qui déborde devant.
 */
function Dormer({ p, ry }: { p: [number, number, number]; ry: number }) {
  return (
    <group position={p} rotation-y={ry}>
      {/* les joues de zinc : le corps, en retrait derrière l'encadrement */}
      <Part geo={rbox(0.56, 0.74, 0.52, 0.04)} m={P.zincFlat} p={[0, 0, -0.02]} castShadow={false} />
      {/* l'encadrement de pierre : deux jambages, l'appui saillant, le linteau et sa clé */}
      {[-1, 1].map((s) => <Part key={s} geo={rbox(0.13, 0.78, 0.08, 0.03)} m={P.trim} p={[s * 0.255, -0.01, 0.29]} castShadow={false} />)}
      <Part geo={rbox(0.6, 0.07, 0.14, 0.025)} m={P.trim} p={[0, -0.36, 0.3]} castShadow={false} />
      <Part geo={rbox(0.64, 0.12, 0.09, 0.03)} m={P.trim} p={[0, 0.3, 0.29]} castShadow={false} />
      <Part geo={rbox(0.09, 0.15, 0.04, 0.015)} m={P.trim} p={[0, 0.275, 0.34]} castShadow={false} />
      {/* la fenêtre en retrait, ses petits bois blancs */}
      <Part geo={rbox(0.38, 0.58, 0.02, 0.008)} m={P.dormerGlass} p={[0, -0.04, 0.255]} castShadow={false} />
      <Part geo={rbox(0.026, 0.58, 0.03, 0.008)} m={P.trim} p={[0, -0.04, 0.275]} castShadow={false} />
      <Part geo={rbox(0.38, 0.026, 0.03, 0.008)} m={P.trim} p={[0, 0.07, 0.275]} castShadow={false} />
      {/* le toit bombé de zinc qui déborde devant, bordé d'un arc de pierre */}
      <Part geo={DORMER_ROOF} m={P.zincFlat} p={[0, 0.36, -0.01]} rotation-x={Math.PI / 2} scale={[0.37, 0.7, 0.4 * 0.42]} castShadow={false} />
      <Part geo={DORMER_ROOF} m={P.trim} p={[0, 0.355, 0.355]} rotation-x={Math.PI / 2} scale={[0.4, 0.04, 0.43 * 0.42]} castShadow={false} />
    </group>
  )
}

/** Une souche de cheminée : un conduit enduit, sa corniche, une rangée de mitrons de terre cuite. */
export function Chimney({ p, pots = 4, ry = 0 }: { p: [number, number, number]; pots?: number; ry?: number }) {
  const w = 0.26 * pots + 0.14
  return (
    <group position={p} rotation-y={ry}>
      <Part geo={rbox(w, 1.1, 0.46, 0.04)} m={P.plaster} p={[0, 0.55, 0]} castShadow={false} />
      <Part geo={rbox(w + 0.1, 0.08, 0.56, 0.03)} m={P.trim} p={[0, 1.12, 0]} castShadow={false} />
      {Array.from({ length: pots }, (_, i) => (
        <group key={i} position={[-0.13 * (pots - 1) + i * 0.26, 1.16, 0]}>
          <Part geo={cyl(0.075, 0.095, 0.3, 12)} m={P.pot} p={[0, 0.15, 0]} castShadow={false} />
          <Part geo={cyl(0.085, 0.075, 0.05, 12)} m={P.pot} p={[0, 0.32, 0]} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

/** Une antenne de télévision : un mât, deux râteaux. */
export function Antenna({ p }: { p: [number, number, number] }) {
  return (
    <group position={p}>
      <Part geo={cyl(0.02, 0.025, 1.6, 6)} m={P.antenna} p={[0, 0.8, 0]} castShadow={false} />
      {[1.2, 1.5].map((y) => (
        <group key={y} position={[0, y, 0]} rotation-y={0.5}>
          <Part geo={cyl(0.012, 0.012, 0.8, 5)} m={P.antenna} rotation-z={Math.PI / 2} castShadow={false} />
          {[-0.3, -0.1, 0.1, 0.3].map((x) => <Part key={x} geo={cyl(0.008, 0.008, 0.3, 4)} m={P.antenna} p={[x, 0, 0]} rotation-x={Math.PI / 2} castShadow={false} />)}
        </group>
      ))}
    </group>
  )
}

/** Des géraniums dans une jardinière, au balcon. */
function Geraniums({ p, ry = 0 }: { p: [number, number, number]; ry?: number }) {
  return (
    <group position={p} rotation-y={ry}>
      <Part geo={rbox(0.7, 0.18, 0.2, 0.04)} m={P.pot} p={[0, 0.09, 0]} castShadow={false} />
      {[-0.24, -0.08, 0.08, 0.24].map((x, i) => (
        <group key={x} position={[x, 0.2, 0]}>
          <Part geo={SPH} m={P.leaf} scale={[0.1, 0.08, 0.09]} castShadow={false} />
          <Part geo={SPH} m={P.geranium} p={[0.02, 0.07 + (i % 2) * 0.02, 0.02]} scale={0.055} castShadow={false} />
        </group>
      ))}
    </group>
  )
}

export interface BlockProps {
  x0: number; x1: number; z0: number; z1: number
  /** Le haut des murs de façade (sous le toit) ; `top` le faîte du toit mansardé (absent : pas de toit, notre immeuble). */
  wall: number
  top?: number
  s: number
  shift?: number
  /** Lucarnes : combien sur le brisis côté +z, côté +x. */
  dormers?: [number, number]
  /** Le garde-corps sur la corniche (pas sous l'atelier : il passerait devant son plancher). */
  topRail?: boolean
  /** Le balcon filant deux étages plus bas (et ses géraniums) : pas quand le rez-de-chaussée est au niveau de la rue. */
  lowBalcony?: boolean
}

/**
 * Un immeuble haussmannien : murs de pierre de taille à hautes fenêtres, corniche, balcons filants en fer forgé au dernier étage et
 * deux étages plus bas, et un toit mansardé de zinc (brisis raide, terrasson presque plat) percé de lucarnes.
 */
export function Block({ x0, x1, z0, z1, wall, top, s, shift = 0, dormers = [2, 2], topRail = true, lowBalcony = true }: BlockProps) {
  const w = x1 - x0, d = z1 - z0, h = wall - BOTTOM
  const front = useMemo(() => facadeGeo(w, h, shift), [w, h, shift])
  const side = useMemo(() => facadeGeo(d, h, shift + 0.37), [d, h, shift])
  const roof = useMemo(() => mansardGeo(w, d), [w, d])
  const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, fy = BOTTOM + h / 2
  return (
    <group>
      <Part geo={rbox(w, h, d, 0.05)} m={P.stone[s]} p={[cx, fy, cz]} castShadow={false} />
      <mesh geometry={front} material={P.facade[s]} position={[cx, fy, z1 + 0.006]} receiveShadow raycast={noRay} />
      <mesh geometry={side} material={P.facade[s]} position={[x1 + 0.006, fy, cz]} rotation-y={Math.PI / 2} receiveShadow raycast={noRay} />
      <Part geo={rbox(w + 0.24, 0.2, d + 0.24, 0.06)} m={P.trim} p={[cx, wall - 0.1, cz]} castShadow={false} />
      {topRail && <Balcony x0={x0} x1={x1} z0={z0} z1={z1} y={wall} s={s} slab={false} />}
      {lowBalcony && <Balcony x0={x0} x1={x1} z0={z0} z1={z1} y={wall - 3.2 * 2 + 0.3} s={s} />}
      {top !== undefined && (
        <>
          {/* le brisis sur les quatre côtés (pans qui se rejoignent aux arêtiers), le terrasson presque plat dessus */}
          <Part geo={roof} m={P.zinc} p={[cx, wall, cz]} castShadow={false} />
          <Part geo={rbox(w - INSET * 2 + 0.1, top - wall - BRISIS + 0.12, d - INSET * 2 + 0.1, 0.04)} m={P.zincFlat} p={[cx, (wall + BRISIS + top) / 2, cz]} castShadow={false} />
          {Array.from({ length: dormers[0] }, (_, i) => (
            <Dormer key={`z${i}`} p={[x0 + (w * (i + 0.5)) / dormers[0], wall + 1.0, z1 - INSET * 0.6]} ry={0} />
          ))}
          {Array.from({ length: dormers[1] }, (_, i) => (
            <Dormer key={`x${i}`} p={[x1 - INSET * 0.6, wall + 1.0, z0 + (d * (i + 0.5)) / dormers[1]]} ry={Math.PI / 2} />
          ))}
        </>
      )}
      {/* des géraniums au balcon du bas */}
      {lowBalcony && (
        <>
          <Geraniums p={[x0 + w * 0.3, wall - 6.1 + 0.02, z1 + 0.22]} />
          <Geraniums p={[x1 + 0.22, wall - 6.1 + 0.02, z0 + d * 0.62]} ry={Math.PI / 2} />
        </>
      )}
    </group>
  )
}
