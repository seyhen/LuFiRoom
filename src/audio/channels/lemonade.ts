import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { pulse, scheduled } from '../events'
import type { Kit } from '../engine'

// Les partiels d'un glaçon contre le verre (rapports inharmoniques, comme un petit tube de verre), tous sous 3,5 kHz.
const PARTIALS: [number, number][] = [[1, 1], [2.32, 0.45], [4.25, 0.18]]

/**
 * La citronnade glacée, dans son pichet. Enregistrée, ou synthétisée : le pétillement très doux des bulles qui crèvent à la surface
 * (de tout petits chocs clairsemés, feutrés), et de loin en loin un glaçon qui fond et bouge, et tinte contre le verre : un, deux ou
 * trois « ting » ronds et brefs, à peine plus forts qu'un murmure. La scène fait bouger un glaçon à chaque tintement.
 */
export default function lemonade(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.grainsOr(loops.lemonade, out, { len: [8, 12], fade: 0.6, rate: 0.02, level: 0.2 }, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 3600, 0.5)).connect(out)
    // le pétillement : des chocs minuscules, filtrés dans le haut médium, très bas
    const fizz = gain(1)
    fizz.connect(biq('bandpass', 2600, 0.8)).connect(bus)
    function pop(t: number) {
      const s = ctx.createBufferSource(), g = gain(0.0001)
      s.buffer = noise.white
      s.start(t, rand(0, 4))
      s.stop(t + 0.02)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(rand(0.01, 0.03), t + 0.001)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.012)
      s.connect(g).connect(fizz)
    }
    function ting(t: number, f: number, a: number) {
      for (const [k, l] of PARTIALS) {
        const o = osc('sine', f * k), g = gain(0.0001), len = 0.32 / Math.sqrt(k)
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(a * l, t + 0.003)
        g.gain.exponentialRampToValueAtTime(0.0001, t + len)
        o.connect(g).connect(bus)
        o.start(t)
        o.stop(t + len + 0.02)
      }
    }
    let next = 0, fz = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) { next = now + rand(1, 2.5); fz = now }
      while (fz < until) {
        pop(fz)
        fz += rand(0.03, 0.22)
      }
      while (next < until) {
        const k = 1 + ((Math.random() * 3) | 0), f = rand(760, 980)
        for (let i = 0; i < k; i++) ting(next + i * rand(0.09, 0.18), f * rand(0.96, 1.06), rand(0.06, 0.1) * (1 - i * 0.25))
        pulse(ctx, 'lemonade', next)
        next += rand(5, 11)
      }
    }, 150)
  })
}
