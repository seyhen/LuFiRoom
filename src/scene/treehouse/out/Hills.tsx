import { skyFade } from '../../outdoor'
import { Static } from '../../Static'
import { canvasTex, seeded } from '../../paint'
import { far } from '../../materials'
import { snowTop } from '../../snowTop'
import { Part, SPH_MID, type V3 } from '../../parts'
import { GROUND } from '../layout'

// Le lointain de la cabane perchée : des collines boisées qui dépassent derrière la forêt en contrebas et remplissent les coins du
// haut des grands écrans. Des bosses lisses (ni rayures ni côtes de melon) : la texture ne varie que du pied (ombre verte) au
// sommet (vert clair), avec un grain de cimes, donc rien ne se pince au pôle. Deux plans, le second plus pâle. Fondu large et
// tardif (r0 11, r1 22) : elles restent nettes dans les coins du haut au lieu de se noyer dans le ciel.

const F = { c: [0, 0] as [number, number], r0: 11, r1: 22 }
const canopy = canvasTex(64, 128, (x) => {
  const g = x.createLinearGradient(0, 0, 0, 128)
  g.addColorStop(0, '#f2f8e4'); g.addColorStop(0.45, '#cfdfbd'); g.addColorStop(1, '#8fa882')
  x.fillStyle = g; x.fillRect(0, 0, 64, 128)
  const r = seeded(3)
  for (let i = 0; i < 160; i++) { x.fillStyle = r() < 0.5 ? 'rgba(255,255,236,.22)' : 'rgba(80,110,70,.16)'; x.beginPath(); x.arc(r() * 64, 14 + r() * 114, 1 + r() * 1.6, 0, 6.29); x.fill() }
}, [1, 1])
const hill = (c: number) => skyFade(snowTop(far(c, { map: canopy, roughness: 0.9 }), 0.8, 0.45, 0.8), F)
const H = { near: [hill(0x5c9150), hill(0x528a4c), hill(0x699a58)], far: [hill(0x82a876), hill(0x8cb07f)] }

/** Les collines : [pied, demi-tailles, matériau]. Du fond gauche (-x) au fond droit (-z), jamais devant. Chacune : une bosse et deux épaules. */
function hills() {
  const r = seeded(7), out: [V3, V3, (typeof H.near)[number]][] = []
  const ring = (n: number, r0: number, r1: number, a0: number, a1: number, mats: typeof H.near, h: number) => {
    for (let i = 0; i < n; i++) {
      const a = ((a0 + ((a1 - a0) * (i + r() * 0.5)) / n) * Math.PI) / 180, rad = r0 + r() * (r1 - r0)
      const w = 1.8 + r() * 1.0, m = mats[i % mats.length], y = GROUND.y + 0.5
      const x = Math.cos(a) * rad - 0.4, z = Math.sin(a) * rad - 0.4
      out.push([[x, y, z], [w * 1.15, h * (0.85 + r() * 0.4), w], m])
      // deux épaules plus basses, de part et d'autre : la silhouette n'est plus un seul dôme
      for (const s of [-1, 1]) out.push([[x + Math.cos(a + 1.57) * w * 1.0 * s, y - 0.1, z + Math.sin(a + 1.57) * w * 1.0 * s], [w * 0.8, h * (0.55 + r() * 0.25), w * 0.75], m])
    }
  }
  ring(9, 12.4, 14.4, 168, 322, H.near, 1.0)
  ring(9, 16.2, 18.6, 164, 326, H.far, 1.3)
  return out
}
const LIST = hills()

export function Hills() {
  return (
    <Static>
      {LIST.map(([p, s, m], i) => <Part key={i} geo={SPH_MID} m={m} p={p} scale={s} castShadow={false} receiveShadow={false} />)}
    </Static>
  )
}
