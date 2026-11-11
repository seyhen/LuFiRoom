import { useMemo } from 'react'
import { PlaneGeometry, RepeatWrapping } from 'three'
import { far } from '../../materials'
import { canvasTex, rr, seeded } from '../../paint'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../../parts'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'

// Les immeubles de la rue du marché : des « zakkyo », ces petits immeubles de béton à étages de boutiques et de bars qu'on voit
// dans chaque quartier japonais : façade de carrelage beige ou grise, fenêtres coulissantes d'aluminium, balcons étroits où sèchent
// des futons, climatiseurs, rez-de-chaussée de boutiques (rideau de fer, vitrine allumée, enseigne), citerne d'eau sur le toit.

export const F = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5 }
const JP = '"Yu Gothic","Hiragino Sans","Meiryo","Noto Sans JP","Noto Sans CJK JP",sans-serif'
const TW = 6, TH = 8, FL = 3, SHOP_H = 3.0, GROUND = -0.3, BOTTOM = -12

/** Une façade de trois étages sur trois travées (6 × 8 m). `glow` : seulement les fenêtres allumées (le soir). */
function facadeTex(wall: string, trim: string, glow: boolean, seed: number) {
  return canvasTex(384, 512, (x) => {
    const r = seeded(seed), fh = 512 / FL
    x.fillStyle = glow ? '#000' : wall; x.fillRect(0, 0, 384, 512)
    for (let f = 0; f < FL; f++) {
      const y0 = f * fh
      if (!glow) {
        x.fillStyle = 'rgba(0,0,0,.12)'
        for (let k = 0; k < 8; k++) x.fillRect(0, y0 + 6 + k * 20, 384, 1)
        x.fillStyle = trim; x.fillRect(0, y0 + fh - 14, 384, 14)
        x.fillStyle = 'rgba(0,0,0,.3)'; x.fillRect(0, y0 + fh - 14, 384, 2)
        // coulures de pluie sous la dalle
        for (let k = 0; k < 7; k++) { const g = x.createLinearGradient(0, y0 + fh - 12, 0, y0 + fh + 26); g.addColorStop(0, 'rgba(40,36,34,.22)'); g.addColorStop(1, 'rgba(40,36,34,0)'); x.fillStyle = g; x.fillRect(r() * 384, y0 + fh - 12, 3 + r() * 5, 38) }
      }
      for (let b = 0; b < 3; b++) {
        const wx = b * 128 + 14, ww = 100, wy = y0 + 30, wh = 96
        const lit = r() < 0.75, warm = r() < 0.5 ? '#ffdca0' : '#fff0c8', curtain = r() < 0.4, deco = r()
        if (glow) {
          if (lit) { x.fillStyle = warm; x.fillRect(wx + 5, wy + 5, ww / 2 - 7, wh - 10); x.fillRect(wx + ww / 2 + 2, wy + 5, ww / 2 - 7, wh - 10) }
          continue
        }
        x.fillStyle = '#8c9298'; rr(x, wx, wy, ww, wh, 3); x.fill()
        x.fillStyle = '#2c3a4e'; x.fillRect(wx + 5, wy + 5, ww / 2 - 7, wh - 10); x.fillRect(wx + ww / 2 + 2, wy + 5, ww / 2 - 7, wh - 10)
        x.fillStyle = 'rgba(255,255,255,.2)'; x.fillRect(wx + 9, wy + 9, 9, wh - 22)
        if (curtain) { x.fillStyle = ['#e8c8c0', '#c8d8c0', '#f0e0b0'][(b + f) % 3]; x.fillRect(wx + 5, wy + 5, ww / 2 - 7, (wh - 10) * 0.6) }
        // le garde-corps du balcon
        const ry = y0 + fh - 14 - 38
        x.fillStyle = '#34363e'; x.fillRect(wx - 8, ry, ww + 16, 3)
        for (let v = 0; v < 13; v++) x.fillRect(wx - 6 + v * 8.6, ry, 1.6, 38)
        if (deco < 0.24) { x.fillStyle = '#e8eaec'; rr(x, wx + ww - 46, ry + 8, 42, 30, 3); x.fill(); x.fillStyle = '#8c9298'; x.fillRect(wx + ww - 42, ry + 22, 34, 3) }
        else if (deco < 0.46) {
          x.fillStyle = ['#f2cdd6', '#cde0f2', '#f2eab8'][(b + f) % 3]; x.fillRect(wx + 4, ry - 10, ww - 8, 46)
          x.fillStyle = 'rgba(0,0,0,.08)'; for (let v = 0; v < 6; v++) x.fillRect(wx + 4, ry - 6 + v * 8, ww - 8, 2)
        } else if (deco < 0.6) { x.fillStyle = '#4f8a52'; for (let v = 0; v < 4; v++) { x.beginPath(); x.arc(wx + 14 + v * 20, ry + 30, 9, 0, Math.PI * 2); x.fill() } }
      }
    }
  }, [1, 1])
}

/** Le rez-de-chaussée sur 6 × 3 m : deux boutiques. Variante 0 : yakitori éclairé + rideau de fer ; 1 : ramen + distributeurs. */
function shopTex(variant: number, glow: boolean) {
  return canvasTex(384, 192, (x) => {
    x.fillStyle = glow ? '#000' : '#1e1a24'; x.fillRect(0, 0, 384, 192)
    x.textAlign = 'center'; x.textBaseline = 'middle'
    const band = (X: number, bg: string, fg: string, txt: string) => {
      x.fillStyle = glow ? bg : bg; x.fillRect(X, 0, 192, 44)
      x.fillStyle = glow ? '#000' : 'rgba(0,0,0,.2)'; x.fillRect(X, 40, 192, 4)
      x.fillStyle = fg; x.font = `bold 30px ${JP}`; x.fillText(txt, X + 96, 24)
    }
    const lit = (X: number, w: number) => {
      const g = x.createLinearGradient(0, 56, 0, 190); g.addColorStop(0, '#ffe2a8'); g.addColorStop(1, '#ee9a52')
      x.fillStyle = g; x.fillRect(X + 10, 56, w, 126)
      x.fillStyle = glow ? 'rgba(0,0,0,.35)' : 'rgba(80,40,20,.45)'
      for (let i = 0; i < 4; i++) x.fillRect(X + 18 + i * 40, 90 + (i % 2) * 20, 26, 6)
      x.fillStyle = glow ? '#000' : '#4a2a1c'; x.fillRect(X + 10 + w / 2 - 2, 56, 4, 126)
    }
    if (variant === 0) {
      band(0, '#7a1f2c', '#fff0d8', '焼き鳥')
      if (glow) { x.fillStyle = '#000' } 
      lit(0, 172)
      band(192, glow ? '#000' : '#26364f', '#e8e0c8', 'スナック')
      if (!glow) {
        for (let i = 0; i < 14; i++) { x.fillStyle = i % 2 ? '#7d8794' : '#929cab'; x.fillRect(200, 52 + i * 10, 176, 10) }
        x.fillStyle = '#c85a4a'; x.fillRect(268, 70, 40, 14)
      }
    } else {
      band(0, '#17171d', '#ffd24a', 'ラーメン')
      lit(0, 172)
      band(192, glow ? '#000' : '#3a2030', '#f4d6e0', 'たばこ')
      for (const [X, c] of [[206, '#2d6ad0'], [290, '#d8404a']] as const) {
        x.fillStyle = glow ? '#000' : c; rr(x, X, 60, 72, 126, 6); x.fill()
        const g = x.createLinearGradient(0, 70, 0, 150); g.addColorStop(0, '#ffffff'); g.addColorStop(1, '#bfe6ff')
        x.fillStyle = g; x.fillRect(X + 8, 70, 56, 70)
        x.fillStyle = glow ? '#000' : '#202028'; for (let i = 0; i < 6; i++) x.fillRect(X + 10 + (i % 3) * 18, 146 + Math.floor(i / 3) * 12, 12, 8)
      }
    }
  }, [1, 1])
}

const mat = <T extends ReturnType<typeof far>>(m: T, snow = false) => skyFade(snow ? snowTop(m, 1, 0.4, 0.8) : m, F)

// Les teintes de la ruelle sous la pluie : bois brûlé et prune au crépuscule, vert de tôle ; les fenêtres chaudes y ressortent.
const FACADES = [['#5c4a52', '#3a2e38', 5], ['#3e5656', '#26383a', 9]] as const
export const Z = {
  facade: FACADES.map(([w, t, s]) => mat(far(0xffffff, { map: facadeTex(w, t, false, s), emissiveMap: facadeTex(w, t, true, s), emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.75, clearcoat: 0.05 }))),
  shop: [0, 1].map((v) => mat(far(0xffffff, { map: shopTex(v, false), emissiveMap: shopTex(v, true), emissive: 0xffffff, emissiveIntensity: 0.3, roughness: 0.6, clearcoat: 0.1 }))),
  body: [mat(far(0x5c4a52, { roughness: 0.85 })), mat(far(0x3e5656, { roughness: 0.85 }))],
  roof: mat(far(0x3a3642, { roughness: 0.9, clearcoat: 0 }), true),
  parapet: mat(far(0x6a5a60, { roughness: 0.8 }), true),
  steel: mat(far(0x8d96a2, { roughness: 0.4, clearcoat: 0.5 })),
  tank: mat(far(0xa7b4b8, { roughness: 0.4, clearcoat: 0.6 }), true),
  dark: mat(far(0x2c2a34, { roughness: 0.5 })),
  white: mat(far(0xe6e8ea, { roughness: 0.5, clearcoat: 0.4 })),
}
for (const m of [...Z.facade, ...Z.shop]) {
  const t = m.map!, g = m.emissiveMap!
  t.wrapS = t.wrapT = g.wrapS = g.wrapT = RepeatWrapping
}

/** Un plan de façade de `w` × `h`, texture à l'échelle du monde (`tw` × `th` mètres la tuile), commençant en haut. */
function planeGeo(w: number, h: number, tw: number, th: number, shift = 0) {
  const g = new PlaneGeometry(w, h), uv = g.attributes.uv
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (w / tw) + shift, 1 - (1 - uv.getY(i)) * (h / th))
  return g
}

export interface ZakkyoProps {
  x0: number; x1: number; z0: number; z1: number
  /** Le haut du toit. */
  top: number
  /** Le crépi : 0 beige, 1 gris. */
  v?: 0 | 1
  /** Quelle paire de boutiques au rez-de-chaussée. */
  shop?: 0 | 1
  shift?: number
  /** Citerne, antenne et climatiseurs sur le toit. */
  gear?: boolean
}

/** La citerne d'eau du toit : un fût de tôle sur quatre pieds, un couvercle bombé, une échelle. */
function WaterTank({ p }: { p: V3 }) {
  return (
    <group position={p}>
      {[[-0.28, -0.28], [0.28, -0.28], [-0.28, 0.28], [0.28, 0.28]].map(([x, z]) => <Part key={`${x}${z}`} geo={cyl(0.03, 0.03, 0.5, 6)} m={Z.steel} p={[x, 0.25, z]} castShadow={false} />)}
      <Part geo={cyl(0.5, 0.5, 0.06, 18)} m={Z.steel} p={[0, 0.52, 0]} castShadow={false} />
      <Part geo={cyl(0.42, 0.42, 0.8, 18)} m={Z.tank} p={[0, 0.95, 0]} castShadow={false} />
      <Part geo={SPH} m={Z.tank} p={[0, 1.35, 0]} scale={[0.42, 0.2, 0.42]} castShadow={false} />
      <Part geo={cyl(0.012, 0.012, 1.0, 5)} m={Z.steel} p={[0.5, 0.5, 0.1]} castShadow={false} />
    </group>
  )
}

/** Un petit immeuble de rapport : masse, façades vues (+z, +x), boutiques au pied, toit-terrasse et son matériel. */
export function Zakkyo({ x0, x1, z0, z1, top, v = 0, shop = 0, shift = 0, gear = true }: ZakkyoProps) {
  const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2
  const upH = top - GROUND - SHOP_H, upY = top - upH / 2
  const geos = useMemo(() => ({
    up: planeGeo(w, upH, TW, TH, shift), upS: planeGeo(d, upH, TW, TH, shift + 0.37),
    sh: planeGeo(w, SHOP_H, TW, SHOP_H, shift * 2), shS: planeGeo(d, SHOP_H, TW, SHOP_H, shift * 2 + 0.5),
  }), [w, d, upH, shift])
  const shY = GROUND + SHOP_H / 2
  return (
    <group>
      <Part geo={rbox(w, top - BOTTOM, d, 0.05)} m={Z.body[v]} p={[cx, BOTTOM + (top - BOTTOM) / 2, cz]} castShadow={false} />
      <mesh geometry={geos.up} material={Z.facade[v]} position={[cx, upY, z1 + 0.006]} receiveShadow raycast={noRay} />
      <mesh geometry={geos.upS} material={Z.facade[v]} position={[x1 + 0.006, upY, cz]} rotation-y={Math.PI / 2} receiveShadow raycast={noRay} />
      <mesh geometry={geos.sh} material={Z.shop[shop]} position={[cx, shY, z1 + 0.006]} raycast={noRay} />
      <mesh geometry={geos.shS} material={Z.shop[1 - shop]} position={[x1 + 0.006, shY, cz]} rotation-y={Math.PI / 2} raycast={noRay} />
      {/* l'auvent de béton entre les boutiques et les étages */}
      <Part geo={rbox(w + 0.12, 0.12, 0.34, 0.04)} m={Z.parapet} p={[cx, GROUND + SHOP_H + 0.04, z1 + 0.14]} castShadow={false} />
      <Part geo={rbox(0.34, 0.12, d + 0.12, 0.04)} m={Z.parapet} p={[x1 + 0.14, GROUND + SHOP_H + 0.04, cz]} castShadow={false} />
      {/* le toit et son parapet bas */}
      <Part geo={rbox(w - 0.04, 0.03, d - 0.04, 0.01)} m={Z.roof} p={[cx, top + 0.005, cz]} castShadow={false} />
      {([[cx, z0 + 0.1, w, 0.2], [cx, z1 - 0.1, w, 0.2], [x0 + 0.1, cz, 0.2, d], [x1 - 0.1, cz, 0.2, d]] as const).map(([px, pz, pw, pd], i) => (
        <Part key={i} geo={rbox(pw, 0.6, pd, 0.04)} m={Z.parapet} p={[px, top + 0.3, pz]} castShadow={false} />
      ))}
      {gear && (
        <>
          <WaterTank p={[x0 + w * 0.3, top, z0 + d * 0.45]} />
          {[0, 1].map((i) => (
            <group key={i} position={[x1 - 0.8 - i * 0.7, top, z1 - 0.7]}>
              <Part geo={rbox(0.55, 0.5, 0.3, 0.05)} m={Z.white} p={[0, 0.3, 0]} castShadow={false} />
              <Part geo={cyl(0.12, 0.12, 0.04, 14)} m={Z.dark} p={[0, 0.3, 0.16]} rotation-x={Math.PI / 2} castShadow={false} />
            </group>
          ))}
          <group position={[x0 + w * 0.72, top, z0 + d * 0.3]}>
            <Part geo={cyl(0.012, 0.012, 1.7, 5)} m={Z.steel} p={[0, 0.85, 0]} castShadow={false} />
            {[1.1, 1.4, 1.65].map((y, i) => <Part key={y} geo={rbox(0.012, 0.012, 0.5 - i * 0.12, 0.004)} m={Z.steel} p={[0, y, 0]} castShadow={false} />)}
          </group>
        </>
      )}
    </group>
  )
}
