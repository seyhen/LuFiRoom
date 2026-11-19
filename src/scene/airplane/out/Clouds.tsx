import { useMemo } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, SphereGeometry } from 'three'
import { smooth } from '../../../math'
import { mood } from '../../anim'
import { seeded } from '../../paint'
import { Batch, type Item } from '../../parts'
import { Static } from '../../Static'
import { O } from './materials'
import { SEA, SLAB } from './layout'

const LUMP = new SphereGeometry(1, 10, 7)
// Les teintes par copie : le dessus clair, le flanc, le ventre bleuté (le matériau lui-même change avec le jour, la nuit, la pluie)
const TOP = 0xf6f8ff, SIDE = 0xe6ecfb, UNDER = 0xc6d2ee, DEEP = 0xaebcdf

/** Un tas de boules sur une demi-ellipse, plus grosses au milieu. */
function heap(out: Item[], r: () => number, c: [number, number, number], w: number, h: number, n: number, size: number, flat = 0.62) {
  for (let i = 0; i < n; i++) {
    const t = n === 1 ? 0.5 : i / (n - 1), x = (t - 0.5) * 2 * w, mid = 1 - Math.abs(t - 0.5) * 1.5
    const s = size * (0.55 + 0.6 * mid) * (0.85 + 0.3 * r())
    const y = h * mid * (0.6 + 0.5 * r()) - s * 0.2
    out.push({ p: [c[0] + x * 0.7071, c[1] + y, c[2] - x * 0.7071 + (r() - 0.5) * 0.6], s: [s, s * flat, s], c: y > h * 0.5 ? TOP : i % 2 ? SIDE : TOP })
  }
}

/**
 * La mer de nuages : une jupe de boules autour du socle (plus basse devant, où l'on voit le sol), trois couronnes qui rétrécissent dessous,
 * puis un champ de nuages à perte de vue, plus haut et plus gonflé à mesure qu'on s'éloigne (des tours de cumulus au loin, qui montent
 * jusqu'au-dessus du flanc), tout dans un seul `Batch`. Les copies lointaines se fondent dans le ciel (`skyFade`).
 */
function cloudItems(): Item[] {
  const r = seeded(41), out: Item[] = []
  const half = SLAB.h + 0.08
  const N = 26
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2 + (r() - 0.5) * 0.14, dx = Math.cos(a), dz = Math.sin(a)
    const edge = half / Math.max(Math.abs(dx), Math.abs(dz))
    const rad = 0.8 + r() * 0.55, d = edge + 0.35 + r() * 0.6
    const front = dx > 0.3 || dz > 0.3
    out.push({ p: [SLAB.c + dx * d, (front ? -1.05 : -0.7) + (r() - 0.5) * 0.24, SLAB.c + dz * d], s: [rad, rad * 0.7, rad], c: i % 3 === 0 ? SIDE : TOP })
  }
  for (const [y, k, n, sz] of [[-1.6, 0.94, 14, 1.3], [-2.4, 0.7, 9, 1.25], [-3.1, 0.42, 5, 1.05]] as const) {
    for (let i = 0; i < n; i++) {
      const a = (i / n) * Math.PI * 2 + y + (r() - 0.5) * 0.2, d = SLAB.h * k + 0.4, rad = sz * (0.85 + r() * 0.35)
      out.push({ p: [SLAB.c + Math.cos(a) * d, y + (r() - 0.5) * 0.2, SLAB.c + Math.sin(a) * d], s: [rad, rad * 0.75, rad], c: i % 2 ? UNDER : DEEP })
    }
  }
  out.push({ p: [SLAB.c, -3.6, SLAB.c], s: [1.6, 0.8, 1.6], c: DEEP })
  // le champ : un quadrillage irrégulier de 1,5, plus haut en s'éloignant derrière (-x, -z), plus plat devant
  const step = 1.2
  for (let gx = -26; gx <= 13; gx += step) {
    for (let gz = -26; gz <= 13; gz += step) {
      const x = gx + (r() - 0.5) * step * 0.9, z = gz + (r() - 0.5) * step * 0.9
      const d = Math.hypot(x - SLAB.c, z - SLAB.c)
      // pas sous le socle ni trop près de ses bords (la jupe s'en charge)
      if (Math.max(Math.abs(x - SLAB.c), Math.abs(z - SLAB.c)) < half + 1.4) continue
      if (d > 21) continue
      const back = Math.max(0, -(x + z) / 2) // vers le fond de l'écran
      const hill = Math.sin(x * 0.31 + 1.7) * Math.cos(z * 0.27 - 0.6) * 0.5 + 0.5
      const rad = 0.7 + r() * 0.6 + back * 0.025
      const y = SEA + hill * (0.5 + back * 0.09) + (r() - 0.5) * 0.25
      out.push({ p: [x, y, z], s: [rad, rad * (0.6 + 0.08 * hill), rad], c: r() < 0.55 ? TOP : r() < 0.7 ? SIDE : UNDER })
    }
  }
  // quelques tours de cumulus, loin derrière, qui font un ciel bosselé (haut gauche et haut droit de l'écran)
  heap(out, r, [-13, SEA + 0.4, -3], 2.6, 1.6, 7, 1.4)
  heap(out, r, [-5, SEA + 0.6, -14], 3.0, 2.0, 8, 1.5)
  heap(out, r, [7, SEA + 0.3, -13], 2.4, 1.4, 6, 1.3)
  heap(out, r, [-15, SEA + 0.2, 7], 2.2, 1.2, 6, 1.2)
  heap(out, r, [-17, SEA + 0.7, -11], 2.6, 1.8, 7, 1.4)
  return out
}

const DAY = new Color(0xeef3fd), NIGHT = new Color(0x7e90cf), RAIN = new Color(0xb5bccb), STORM = new Color(0x6c7488)
const EM_DAY = new Color(0xe2eafb), EM_NIGHT = new Color(0x5568b8)

/** Le matériau des nuages suit le temps : blanc bleuté le jour, lunaire la nuit (avec un éclat propre), plombé sous la pluie, ardoise à l'orage. */
export function CloudSea() {
  const items = useMemo(cloudItems, [])
  useFrame(() => {
    const n = smooth(mood.night), r = Math.max(mood.rain, mood.snow * 0.5)
    for (const m of [O.cloud, O.bank]) {
      m.color.copy(DAY).lerp(RAIN, r * 0.8).lerp(STORM, mood.storm * 0.8).lerp(NIGHT, n)
      m.emissive.copy(EM_DAY).lerp(EM_NIGHT, n)
      m.emissiveIntensity = 0.05 + n * 0.12 - r * 0.03
    }
  })
  return (
    <Static>
      <Batch geo={LUMP} m={O.cloud} items={items} />
    </Static>
  )
}
