import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { pulse, scheduled } from '../events'
import type { Kit } from '../engine'

/**
 * Le thermos de cacao de l'igloo. Enregistré, ou synthétisé : de loin en loin (toutes les dix à vingt secondes), on se ressert. Le
 * cacao coule dans le quart émaillé : un filet de liquide (un bruit filtré qui gargouille un peu) dont la résonance monte à mesure
 * que la tasse se remplit, puis le thermos se repose sur la caisse, un « toc » de bois feutré. La scène verse au même instant.
 */
export default function cocoa(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.shotsOr(loops.cocoa, out, { gap: [10, 20], rate: 0.05, level: 0.2 }, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(6)
    bus.connect(biq('lowpass', 3200, 0.5)).connect(out)
    // le geste que la scène montre (Thermos.tsx) : on lève le thermos (0,8 s), le cacao coule (~2,4 s), on le repose (0,6 s)
    function pour(t0: number) {
      const t = t0 + 0.8, len = rand(2.3, 2.5)
      const s = ctx.createBufferSource(), g = gain(0.0001), body = biq('bandpass', 520, 2.2), gurgle = gain(0.6)
      s.buffer = noise.pink
      s.loop = true
      s.start(t, rand(0, 4))
      s.stop(t + len + 0.1)
      // la tasse se remplit : la résonance monte
      body.frequency.setValueAtTime(480, t)
      body.frequency.linearRampToValueAtTime(rand(1150, 1400), t + len)
      // le liquide gargouille : le niveau tremble vite, irrégulier
      const am = osc('sine', rand(11, 16))
      am.connect(gain(0.35)).connect(gurgle.gain)
      am.start(t)
      am.stop(t + len + 0.1)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.25)
      g.gain.setValueAtTime(0.05, t + len - 0.5)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      s.connect(body).connect(gurgle).connect(g).connect(bus)
      // le thermos reposé sur la caisse
      const tt = t + len + rand(0.55, 0.65), o = osc('sine', rand(140, 170)), k = gain(0.0001)
      k.gain.setValueAtTime(0.0001, tt)
      k.gain.exponentialRampToValueAtTime(0.09, tt + 0.006)
      k.gain.exponentialRampToValueAtTime(0.0001, tt + 0.12)
      o.connect(k).connect(bus)
      o.start(tt)
      o.stop(tt + 0.14)
      pulse(ctx, 'cocoa', t0)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(1, 2.5)
      while (next < until) {
        pour(next)
        next += rand(10, 20)
      }
    }, 200)
  })
}
