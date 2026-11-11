import { ConeGeometry, ExtrudeGeometry, PlaneGeometry, RepeatWrapping, Shape, type BufferGeometry } from 'three'
import { Part, SPH, cyl, rbox } from '../../parts'
import { far } from '../../materials'
import { canvasTex, seeded } from '../../paint'
import { skyFade } from '../../outdoor'

// Le château du fond de la serre : un manoir de campagne en brique rose à chaînages de pierre blonde, toits d'ardoise très pentus,
// hautes cheminées et tourelles à poivrière. Il ne ressemble pas aux immeubles haussmanniens de l'atelier et de la laverie (pierre
// crème, zinc, balcons de fer) : ici, de la brique, de l'ardoise bleue et des cônes. Ses fenêtres s'allument le soir (`chateau.glass`).

export const G = -0.5 // le sol du parc
// Un fondu plus large que celui des haies (le château est à 11 à 16 du centre) : il se voile dans la brume sans disparaître.
const F = { c: [0, 0] as [number, number], r0: 10, r1: 19 }

/** Les briques : un appareil en panneresses décalées, quelques briques plus sombres ou plus claires. */
const brickTex = canvasTex(128, 128, (x) => {
  const r = seeded(31)
  x.fillStyle = '#c9a99a'; x.fillRect(0, 0, 128, 128) // le joint
  for (let j = 0; j < 8; j++) for (let i = -1; i < 4; i++) {
    const X = i * 32 + (j % 2 ? 16 : 0), Y = j * 16, k = r()
    x.fillStyle = k < 0.15 ? '#a8523c' : k > 0.85 ? '#cf7a5c' : '#bb6448'
    x.fillRect(X + 1.5, Y + 1.5, 29, 13)
  }
}, [1, 1])
brickTex.wrapS = brickTex.wrapT = RepeatWrapping

export const C = {
  brick: skyFade(far(0xffffff, { map: brickTex, roughness: 0.85 }), F),
  wall: skyFade(far(0xb7644a, { roughness: 0.85 }), F),
  stone: skyFade(far(0xe6d9bc, { roughness: 0.75 }), F),
  slate: skyFade(far(0x58647a, { roughness: 0.55, clearcoat: 0.3 }), F),
  glass: skyFade(far(0x2f4258, { roughness: 0.2, clearcoat: 0.9, emissive: 0xffc070, emissiveIntensity: 0 }), F),
  gold: skyFade(far(0xd9a84a, { roughness: 0.3, clearcoat: 0.8 }), F),
}

/** Un plan de briques dont les uv suivent la taille (1 m par motif de 2 briques de haut) : pas d'étirement. */
function brickPlane(w: number, h: number) {
  const g = new PlaneGeometry(w, h), uv = g.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, (uv.getX(i) * w) / 1.1, (uv.getY(i) * h) / 1.1)
  return g
}

const prisms = new Map<string, BufferGeometry>()
/** Un toit à deux pans : section triangulaire (largeur d, hauteur h) étirée sur `len` le long de x. */
function prism(d: number, h: number, len: number) {
  const key = `${d}|${h}|${len}`
  let g = prisms.get(key)
  if (!g) {
    const s = new Shape()
    s.moveTo(-d / 2, 0); s.lineTo(d / 2, 0); s.lineTo(0, h); s.closePath()
    g = new ExtrudeGeometry(s, { depth: len, bevelEnabled: false })
    g.translate(0, 0, -len / 2)
    g.rotateY(Math.PI / 2)
    prisms.set(key, g)
  }
  return g
}
const CONE = new ConeGeometry(1, 1, 16)

interface WingProps { x0: number; x1: number; z0: number; z1: number; wall: number; roof: number; floors?: number }

/** Une aile : murs de brique (façade vers +z et flanc vers +x), soubassement et chaînage de pierre, fenêtres, toit d'ardoise, deux cheminées. */
export function Wing({ x0, x1, z0, z1, wall, roof, floors = 2 }: WingProps) {
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2
  const ys = Array.from({ length: floors }, (_, f) => G + 0.8 + f * ((wall - 1.5) / Math.max(1, floors - 1 || 1)))
  const nf = Math.max(1, Math.floor(w / 1.45)), ns = Math.max(1, Math.floor(d / 1.45))
  const win = (key: string, p: [number, number, number], side: boolean) => (
    <group key={key}>
      <Part geo={side ? rbox(0.12, 0.9, 0.68, 0.03) : rbox(0.68, 0.9, 0.12, 0.03)} m={C.stone} p={[p[0] + (side ? 0.05 : 0), p[1], p[2] + (side ? 0 : 0.05)]} castShadow={false} />
      <Part geo={side ? rbox(0.12, 0.72, 0.5, 0.02) : rbox(0.5, 0.72, 0.12, 0.02)} m={C.glass} p={[p[0] + (side ? 0.075 : 0), p[1], p[2] + (side ? 0 : 0.075)]} castShadow={false} />
    </group>
  )
  return (
    <group>
      <Part geo={rbox(w, wall, d, 0.06)} m={C.wall} p={[cx, G + wall / 2, cz]} castShadow={false} />
      {/* la brique : un plan par face vue, un peu en avant du mur */}
      <mesh geometry={brickPlane(w - 0.06, wall - 0.4)} material={C.brick} position={[cx, G + 0.35 + (wall - 0.4) / 2, z1 + 0.02]} />
      <mesh geometry={brickPlane(d - 0.06, wall - 0.4)} material={C.brick} position={[x1 + 0.02, G + 0.35 + (wall - 0.4) / 2, cz]} rotation-y={Math.PI / 2} />
      <Part geo={rbox(w + 0.12, 0.35, d + 0.12, 0.04)} m={C.stone} p={[cx, G + 0.175, cz]} castShadow={false} />
      <Part geo={rbox(w + 0.08, 0.1, d + 0.08, 0.03)} m={C.stone} p={[cx, G + wall * 0.55, cz]} castShadow={false} />
      <Part geo={rbox(w + 0.2, 0.16, d + 0.2, 0.04)} m={C.stone} p={[cx, G + wall + 0.08, cz]} castShadow={false} />
      {/* le chaînage d'angle, côté caméra */}
      <Part geo={rbox(0.3, wall, 0.3, 0.04)} m={C.stone} p={[x1, G + wall / 2, z1]} castShadow={false} />
      {/* le toit : deux pans très pentus, un rebord */}
      <Part geo={prism(d + 0.36, roof, w + 0.24)} m={C.slate} p={[cx, G + wall + 0.16, cz]} castShadow={false} />
      {/* deux hautes cheminées de brique, chapeau de pierre */}
      {[0.22, 0.74].map((t, i) => (
        <group key={i} position={[x0 + w * t, G + wall + roof * 0.45, cz]}>
          <Part geo={rbox(0.46, roof * 0.9 + 0.5, 0.46, 0.04)} m={C.wall} p={[0, (roof * 0.9 + 0.5) / 2, 0]} castShadow={false} />
          <Part geo={rbox(0.6, 0.1, 0.6, 0.03)} m={C.stone} p={[0, roof * 0.9 + 0.55, 0]} castShadow={false} />
        </group>
      ))}
      {/* les fenêtres, sur la façade et sur le flanc */}
      {ys.flatMap((y, f) => Array.from({ length: nf }, (_, i) => win(`f${f}-${i}`, [x0 + ((i + 0.5) * w) / nf, y, z1], false)))}
      {ys.flatMap((y, f) => Array.from({ length: ns }, (_, i) => win(`s${f}-${i}`, [x1, y, z0 + ((i + 0.5) * d) / ns], true)))}
    </group>
  )
}

/** Une tourelle à poivrière : fût de brique, bandeau de pierre, deux fenêtres côté caméra, grand cône d'ardoise et girouette dorée. */
export function Turret({ x, z, r, h, cone }: { x: number; z: number; r: number; h: number; cone: number }) {
  const k = Math.SQRT1_2
  return (
    <group>
      <Part geo={cyl(r, r, h, 20)} m={C.wall} p={[x, G + h / 2, z]} castShadow={false} />
      <mesh geometry={cyl(r + 0.02, r + 0.02, h - 0.5, 20)} material={C.brick} position={[x, G + 0.25 + (h - 0.5) / 2, z]} scale={[1, 1, 1]} />
      <Part geo={cyl(r + 0.1, r + 0.14, 0.3, 20)} m={C.stone} p={[x, G + 0.15, z]} castShadow={false} />
      <Part geo={cyl(r + 0.12, r + 0.12, 0.14, 20)} m={C.stone} p={[x, G + h * 0.58, z]} castShadow={false} />
      <Part geo={cyl(r + 0.18, r + 0.18, 0.16, 20)} m={C.stone} p={[x, G + h + 0.08, z]} castShadow={false} />
      {[0.4, 0.74].map((t, i) => (
        <group key={i} position={[x + k * (r + 0.02), G + h * t, z + k * (r + 0.02)]} rotation-y={Math.PI / 4}>
          <Part geo={rbox(0.6, 0.86, 0.12, 0.03)} m={C.stone} p={[0, 0, 0.02]} castShadow={false} />
          <Part geo={rbox(0.44, 0.7, 0.12, 0.02)} m={C.glass} p={[0, 0, 0.045]} castShadow={false} />
        </group>
      ))}
      <Part geo={CONE} m={C.slate} p={[x, G + h + 0.16 + cone / 2, z]} scale={[r + 0.3, cone, r + 0.3]} castShadow={false} />
      <Part geo={cyl(0.02, 0.02, 0.5, 6)} m={C.gold} p={[x, G + h + 0.16 + cone + 0.2, z]} castShadow={false} />
      <Part geo={SPH} m={C.gold} p={[x, G + h + 0.16 + cone + 0.48, z]} scale={0.07} castShadow={false} />
    </group>
  )
}

/** Le château : l'aile principale au fond, une aile plus basse à droite, deux tourelles aux jonctions, une aile de communs à gauche. */
export function Chateau() {
  return (
    <>
      <Wing x0={-7.5} x1={1.5} z0={-16.2} z1={-11.6} wall={3.0} roof={2.4} />
      <Wing x0={1.5} x1={9.8} z0={-15} z1={-10.6} wall={2.5} roof={1.9} />
      <Wing x0={-15} x1={-12.4} z0={-9.4} z1={-3.8} wall={2.3} roof={1.6} />
      <Turret x={1.5} z={-11.2} r={0.95} h={4.4} cone={2.5} />
      <Turret x={-7.5} z={-11.9} r={0.8} h={3.8} cone={2.2} />
    </>
  )
}
