import { skyFade } from '../../outdoor'
import { Static } from '../../Static'
import { seeded } from '../../paint'
import { farFoliage } from '../../nature/materials'
import { snowTop } from '../../snowTop'
import { Foliage } from '../../nature/Foliage'
import type { V3 } from '../../parts'
import { GROUND } from '../layout'

// Le lointain de la cabane perchée : des collines boisées basses et pâles, qui dépassent derrière la forêt en contrebas et
// remplissent les coins du haut des grands écrans (au-delà de 12,5 du centre, la forêt proche s'est fondue dans le ciel). Un fondu
// large (r0 9,5, r1 17,5) les voile dans la brume au lieu d'écraser la pièce ; deux plans : le premier plus vert, le second plus pâle.

const F = { c: [0, 0] as [number, number], r0: 9.5, r1: 17.5 }
const mist = (c: number) => skyFade(snowTop(farFoliage(c, { roughness: 0.9 }), 0.8, 0.45, 0.8), F)
const H = { near: [mist(0x86a77a), mist(0x7c9d78), mist(0x96b284)], far: [mist(0xa8bf9e), mist(0xb4c8a6)] }

/** Les collines : [forme, pied, demi-tailles, matériau, rotation]. Du fond gauche (-x) au fond droit (-z), jamais devant. */
function hills() {
  const r = seeded(7), out: [number, V3, V3, (typeof H.near)[number], number][] = []
  const ring = (n: number, r0: number, r1: number, a0: number, a1: number, mats: typeof H.near, h: number) => {
    for (let i = 0; i < n; i++) {
      const a = ((a0 + ((a1 - a0) * (i + r() * 0.6)) / n) * Math.PI) / 180, rad = r0 + r() * (r1 - r0)
      const w = 1.8 + r() * 1.2
      out.push([(r() * 6) | 0, [Math.cos(a) * rad - 0.4, GROUND.y + 0.9, Math.sin(a) * rad - 0.4], [w, h * (0.85 + r() * 0.5), w * (0.8 + r() * 0.4)], mats[i % mats.length], r() * 6])
    }
  }
  ring(8, 12.8, 14.6, 172, 318, H.near, 0.8)
  ring(8, 15.4, 16.8, 168, 322, H.far, 1.0)
  return out
}
const LIST = hills()

export function Hills() {
  return (
    <Static>
      {LIST.map(([v, p, s, m, ry], i) => <Foliage key={i} v={v} p={p} s={s} m={m} ry={ry} shadow={false} />)}
    </Static>
  )
}
