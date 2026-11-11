import { PlaneGeometry } from 'three'
import { far } from '../../materials'
import { canvasTex } from '../../paint'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../../parts'
import { skyFade } from '../../outdoor'
import { F } from './Zakkyo'

// La street food autour de la ruelle : des étals de rue (yatai) alignés sur les trottoirs, sous leurs lanternes rouges, avec leur
// auvent à rayures, leurs noren, leur enseigne en kana et ce qu'on y cuit : takoyaki, yakitori, taiyaki, oden.

const JP = '"Yu Gothic","Hiragino Sans","Meiryo","Noto Sans JP","Noto Sans CJK JP",sans-serif'
export type Food = 'takoyaki' | 'yakitori' | 'taiyaki' | 'oden'
const WORDS: [Food, string, string][] = [['takoyaki', 'たこ焼', '#b02a3c'], ['yakitori', '焼き鳥', '#1c1c24'], ['taiyaki', 'たい焼き', '#2a4a8a'], ['oden', 'おでん', '#c8641e']]

/** L'atlas des quatre enseignes (une ligne chacune). `glow` : les lettres seules, sur noir. */
const atlas = (glow: boolean) =>
  canvasTex(256, 4 * 64, (x) => {
    x.fillStyle = '#000'; x.fillRect(0, 0, 256, 256)
    x.textAlign = 'center'; x.textBaseline = 'middle'
    WORDS.forEach(([, w, bg], i) => {
      x.fillStyle = glow ? '#000' : bg; x.fillRect(0, i * 64, 256, 64)
      x.strokeStyle = glow ? '#ffe9b0' : 'rgba(255,240,210,.7)'; x.lineWidth = 3; x.strokeRect(5, i * 64 + 5, 246, 54)
      x.fillStyle = '#fff2d6'; x.font = `bold 40px ${JP}`; x.fillText(w, 128, i * 64 + 34)
    })
  })

export const S = {
  sign: skyFade(far(0xffffff, { map: atlas(false), emissiveMap: atlas(true), emissive: 0xffffff, emissiveIntensity: 0.5, roughness: 0.6 }), F),
  wood: skyFade(far(0x5a3a2a, { roughness: 0.6, clearcoat: 0.2 }), F),
  woodPale: skyFade(far(0xc89a68, { roughness: 0.55, clearcoat: 0.2 }), F),
  steel: skyFade(far(0xb8bec8, { roughness: 0.3, clearcoat: 0.7, metalness: 0.2 }), F),
  iron: skyFade(far(0x26242e, { roughness: 0.5, clearcoat: 0.3 }), F),
  red: skyFade(far(0xd6334f, { roughness: 0.6 }), F),
  indigo: skyFade(far(0x27358c, { roughness: 0.8 }), F),
  cream: skyFade(far(0xf2e8d2, { roughness: 0.7 }), F),
  lantern: skyFade(far(0xe0402e, { roughness: 0.6, emissive: 0xff5a2a, emissiveIntensity: 0.4 }), F),
  coals: skyFade(far(0x3a1a10, { roughness: 0.8, emissive: 0xff5a1e, emissiveIntensity: 0.6 }), F),
  takoyaki: skyFade(far(0xb4722e, { roughness: 0.55, clearcoat: 0.4 }), F),
  batter: skyFade(far(0xe8c878, { roughness: 0.6 }), F),
  taiyaki: skyFade(far(0xd8923a, { roughness: 0.5, clearcoat: 0.4 }), F),
  meat: skyFade(far(0x9a5a30, { roughness: 0.5, clearcoat: 0.4 }), F),
  broth: skyFade(far(0xc98a3c, { roughness: 0.2, clearcoat: 0.9, emissive: 0xc98a3c, emissiveIntensity: 0.25 }), F),
  white: skyFade(far(0xf6f0e4, { roughness: 0.4, clearcoat: 0.5 }), F),
}
const WALK = -0.3
/** Où sont les étals : le trottoir de gauche (face à la rue, +x) et celui du fond à droite (face à +z). */
export const STALLS: { p: V3; ry: number; kind: Food }[] = [
  { p: [-3.15, WALK, 5.5], ry: Math.PI / 2, kind: 'takoyaki' }, { p: [-3.15, WALK, 7.2], ry: Math.PI / 2, kind: 'oden' }, { p: [-3.15, WALK, 8.9], ry: Math.PI / 2, kind: 'taiyaki' },
  { p: [6.3, WALK, -4.3], ry: 0, kind: 'yakitori' }, { p: [8.1, WALK, -4.3], ry: 0, kind: 'takoyaki' },
]
/** Les lanternes des étals dans le monde (pour leurs halos). */
export const stallLanterns = (): V3[] => STALLS.flatMap(({ p, ry }) => [-0.7, 0.7].map((x): V3 => [p[0] + x * Math.cos(ry) + 0.42 * Math.sin(ry), p[1] + 1.78, p[2] - x * Math.sin(ry) + 0.42 * Math.cos(ry)]))

const signGeo = (k: number) => {
  const g = new PlaneGeometry(0.9, 0.24), uv = g.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i), (3 - k + uv.getY(i)) / 4)
  return g
}
const SIGN_GEO = WORDS.map((_, k) => signGeo(k))

function Goods({ kind }: { kind: Food }) {
  if (kind === 'takoyaki') {
    return (
      <>
        {/* la plaque ronde et ses alvéoles, les boulettes dorées, un plat de pâte et le pique */}
        <Part geo={rbox(0.8, 0.06, 0.4, 0.02)} m={S.iron} p={[-0.2, 0.86, 0.0]} />
        {[0, 1, 2, 3, 4].flatMap((i) => [0, 1].map((j) => <Part key={`${i}${j}`} geo={SPH} m={i % 2 ? S.takoyaki : S.batter} scale={0.05} p={[-0.5 + i * 0.15, 0.92, -0.08 + j * 0.16]} castShadow={false} />))}
        <Part geo={rbox(0.26, 0.08, 0.2, 0.02)} m={S.steel} p={[0.45, 0.89, 0.05]} castShadow={false} />
        <Part geo={rbox(0.22, 0.012, 0.16, 0.005)} m={S.batter} p={[0.45, 0.935, 0.05]} castShadow={false} />
        <Part geo={cyl(0.006, 0.006, 0.3, 5)} m={S.woodPale} p={[0.0, 0.95, 0.2]} rotation-z={Math.PI / 2} castShadow={false} />
      </>
    )
  }
  if (kind === 'yakitori') {
    return (
      <>
        {/* le gril au charbon de bois : caisson noir, braises, brochettes en rang */}
        <Part geo={rbox(1.0, 0.16, 0.28, 0.03)} m={S.iron} p={[0, 0.9, 0.05]} />
        <Part geo={rbox(0.9, 0.012, 0.2, 0.004)} m={S.coals} p={[0, 0.985, 0.05]} castShadow={false} />
        {Array.from({ length: 9 }, (_, i) => (
          <group key={i} position={[-0.4 + i * 0.1, 1.0, 0.05]}>
            <Part geo={cyl(0.006, 0.006, 0.36, 5)} m={S.woodPale} rotation-x={Math.PI / 2} castShadow={false} />
            {[-0.1, -0.03, 0.04, 0.11].map((z) => <Part key={z} geo={SPH} m={S.meat} scale={[0.028, 0.026, 0.028]} p={[0, 0.012, z]} castShadow={false} />)}
          </group>
        ))}
      </>
    )
  }
  if (kind === 'taiyaki') {
    return (
      <>
        {/* le moule à poissons et la pile de taiyaki dorés */}
        <Part geo={rbox(0.7, 0.06, 0.36, 0.02)} m={S.iron} p={[-0.25, 0.86, 0.0]} />
        {[0, 1, 2].map((i) => (
          <group key={i} position={[-0.45 + i * 0.2, 0.92, 0]}>
            <Part geo={SPH} m={S.taiyaki} scale={[0.085, 0.03, 0.04]} castShadow={false} />
            <Part geo={SPH} m={S.taiyaki} scale={[0.03, 0.02, 0.04]} p={[0.1, 0, 0]} castShadow={false} />
          </group>
        ))}
        <Part geo={rbox(0.28, 0.1, 0.22, 0.02)} m={S.cream} p={[0.4, 0.9, 0.05]} castShadow={false} />
        {[0, 1].map((i) => <Part key={i} geo={SPH} m={S.taiyaki} scale={[0.07, 0.025, 0.035]} p={[0.4, 0.97 + i * 0.05, 0.05]} rotation-z={i * 0.3} castShadow={false} />)}
      </>
    )
  }
  return (
    <>
      {/* la marmite d'oden, compartiments de bouillon ambré, œufs, radis blancs, tofu */}
      <Part geo={rbox(0.9, 0.2, 0.5, 0.03)} m={S.steel} p={[0, 0.9, 0.0]} />
      <Part geo={rbox(0.82, 0.01, 0.42, 0.004)} m={S.broth} p={[0, 1.0, 0.0]} castShadow={false} />
      {[-0.28, 0, 0.28].flatMap((x) => [-0.1, 0.1].map((z, j) => <Part key={`${x}${z}`} geo={SPH} m={(x + j) % 0.5 ? S.white : S.taiyaki} scale={[0.05, 0.035, 0.05]} p={[x, 1.015, z]} castShadow={false} />))}
      <Part geo={cyl(0.012, 0.012, 0.3, 5)} m={S.woodPale} p={[0.3, 1.0, 0.0]} rotation-z={0.5} castShadow={false} />
    </>
  )
}

/** Un étal de rue, face à +z : comptoir, quatre montants, auvent à rayures, noren, enseigne, deux lanternes, et ce qu'on y cuit. `p` est le sol. */
export function Stall({ p, ry = 0, kind }: { p: V3; ry?: number; kind: Food }) {
  const k = WORDS.findIndex(([f]) => f === kind)
  return (
    <group position={p} rotation-y={ry}>
      {/* le comptoir de bois et son plateau */}
      <Part geo={rbox(1.5, 0.78, 0.8, 0.04)} m={S.wood} p={[0, 0.39, 0]} castShadow={false} />
      <Part geo={rbox(1.58, 0.05, 0.88, 0.02)} m={S.woodPale} p={[0, 0.8, 0.0]} castShadow={false} />
      {[-0.7, 0.7].flatMap((x) => [-0.38, 0.38].map((z) => <Part key={`${x}${z}`} geo={cyl(0.025, 0.025, 1.9, 6)} m={S.wood} p={[x, 0.95, z]} castShadow={false} />))}
      {/* l'auvent incliné, rayé rouge et crème, et sa frange */}
      <Part geo={rbox(1.7, 0.05, 1.0, 0.02)} m={S.red} p={[0, 1.95, 0.02]} rotation-x={0.12} castShadow={false} />
      {[-0.68, -0.34, 0, 0.34, 0.68].map((x) => <Part key={x} geo={rbox(0.17, 0.052, 1.02, 0.01)} m={S.cream} p={[x + 0.17, 1.95, 0.02]} rotation-x={0.12} castShadow={false} />)}
      {[-0.6, -0.2, 0.2, 0.6].map((x, i) => <Part key={x} geo={rbox(0.3, 0.32, 0.012, 0.005)} m={i % 2 ? S.red : S.indigo} p={[x, 1.7, 0.5]} castShadow={false} />)}
      <mesh geometry={SIGN_GEO[k]} material={S.sign} position={[0, 1.37, 0.46]} raycast={noRay} />
      <Part geo={rbox(0.96, 0.3, 0.03, 0.01)} m={S.iron} p={[0, 1.37, 0.44]} castShadow={false} />
      {/* deux lanternes de papier rouges aux coins de l'auvent */}
      {[-0.7, 0.7].map((x) => (
        <group key={x} position={[x, 1.78, 0.42]}>
          <Part geo={cyl(0.004, 0.004, 0.1, 4)} m={S.iron} p={[0, 0.1, 0]} castShadow={false} />
          <Part geo={SPH} m={S.lantern} scale={[0.1, 0.13, 0.1]} castShadow={false} />
          <Part geo={cyl(0.045, 0.045, 0.016, 10)} m={S.iron} p={[0, 0.12, 0]} castShadow={false} />
          <Part geo={cyl(0.045, 0.045, 0.016, 10)} m={S.iron} p={[0, -0.12, 0]} castShadow={false} />
        </group>
      ))}
      <Goods kind={kind} />
    </group>
  )
}
