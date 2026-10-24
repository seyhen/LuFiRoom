import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Kit } from '../engine'

/**
 * Le boulier du marchand. Enregistré, ou synthétisé : des perles de bois qu'on pousse d'un trait, une petite grappe de claquements
 * sourds et ronds, un peu plus aigus à mesure que la rangée se remplit, puis une pause, le temps de compter.
 */
export default function abacus(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.grainsOr(loops.abacus, out, { len: [8, 16], fade: 0.8, rate: 0.02, level: 0.15 }, () => {
    const { ctx, gain, biq, osc } = kit
    const bus = gain(8)
    bus.connect(out)
    /** Une perle qui en heurte une autre : un « toc » de bois, bref. */
    function toc(t: number, f: number, v: number) {
      const o = osc('triangle', f), g = gain(0.0001), lp = biq('lowpass', 2600, 0.6)
      o.frequency.setValueAtTime(f * 1.15, t)
      o.frequency.exponentialRampToValueAtTime(f, t + 0.012)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v, t + 0.0015)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
      o.connect(lp).connect(g).connect(bus)
      o.start(t)
      o.stop(t + 0.06)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.3
      while (next < until) {
        const row = 3 + ((Math.random() * 5) | 0), f = rand(900, 1300)
        for (let i = 0; i < row; i++) toc(next + i * rand(0.035, 0.07), f * (1 + i * 0.05), rand(0.05, 0.08))
        next += row * 0.06 + (Math.random() < 0.3 ? rand(0.5, 1) : rand(2, 5))
      }
    }, 200)
  })
}
