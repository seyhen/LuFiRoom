import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Kit } from '../engine'

/**
 * Le ruisseau, en contrebas de la cabane perchée. Enregistré, ou synthétisé : un lit d'eau vive (un bruit rose dans le médium, qui
 * respire au gré de trois LFO lents qui ne retombent jamais en phase) et, par-dessus, le babil du courant sur les galets : des
 * dizaines de toutes petites bulles par seconde, des « plip » ronds qui montent un peu, tous différents, jamais un motif qui revient.
 * Rien d'aigu : tout passe sous 3 kHz.
 */
export default function brook(kit: Kit, out: GainNode, { loops }: Room) {
  const { ctx, gain, biq, osc, loop, noise } = kit
  return kit.loopOrChannel(loops.brook, out, () => {
    const soft = biq('lowpass', 2800, 0.5)
    soft.connect(out)
    // le lit d'eau : deux bandes de bruit, l'une sourde, l'autre claire, balancées lentement
    for (const [src, f, q, lvl, rates] of [
      [noise.pink, 700, 0.6, 0.22, [0.13, 0.31]],
      [noise.white, 1700, 1.1, 0.035, [0.21, 0.47]],
    ] as const) {
      const am = gain(lvl)
      loop(src, rand(0, 4)).connect(biq('bandpass', f, q)).connect(am).connect(soft)
      for (const r of rates) {
        const lfo = osc('sine', r)
        lfo.connect(gain(lvl * 0.35)).connect(am.gain)
        lfo.start()
      }
    }
    // le babil : de petites bulles rondes, en grappes irrégulières
    const bus = gain(1)
    bus.connect(soft)
    function plip(t: number, f: number, a: number) {
      const o = osc('sine', f), g = gain(0.0001), len = rand(0.03, 0.07)
      o.frequency.setValueAtTime(f, t)
      o.frequency.exponentialRampToValueAtTime(f * rand(1.25, 1.6), t + len)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(a, t + 0.006)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      o.connect(g).connect(bus)
      o.start(t)
      o.stop(t + len + 0.02)
    }
    let next = 0, swell = 0, swellT = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.05
      while (next < until) {
        // le débit change doucement : par moments le courant se presse, puis se calme
        if (next > swellT) { swell = rand(0.6, 1.4); swellT = next + rand(3, 8) }
        plip(next, rand(420, 1300), rand(0.006, 0.02) * swell)
        if (Math.random() < 0.25) plip(next + rand(0.01, 0.03), rand(700, 1600), rand(0.004, 0.012))
        next += rand(0.025, 0.11) / swell
      }
    }, 100)
  })
}
