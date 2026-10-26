import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le trou de pêche dans la glace de l'igloo. Enregistré, ou synthétisé : l'eau noire qui clapote doucement sous la glace (un bruit
 * brun très sourd dont le niveau monte et retombe comme de petites vagues), et de loin en loin une bulle qui remonte, un « bloup »
 * grave et rond (la scène fait un rond dans l'eau au même instant).
 */
export default function icehole(kit: Kit, out: GainNode, { loops }: Room): Channel {
  const { ctx, gain, biq, osc, loop, noise } = kit
  return kit.loopOrChannel(loops.icehole, out, () => {
    // le clapotis : deux couches de bruit, chacune balancée par deux LFO lents qui ne retombent jamais en phase
    for (const [src, f, lvl, rates] of [
      [noise.brown, 420, 0.5, [0.31, 0.53]],
      [noise.pink, 900, 0.07, [0.43, 0.19]],
    ] as const) {
      const am = gain(lvl)
      loop(src, rand(0, 4)).connect(biq('lowpass', f, 0.7)).connect(am).connect(out)
      for (const r of rates) {
        const lfo = osc('sine', r)
        lfo.connect(gain(lvl * 0.45)).connect(am.gain)
        lfo.start()
      }
    }
    // les bulles
    const bus = gain(1)
    bus.connect(biq('lowpass', 900, 0.5)).connect(out)
    function bloop(t: number) {
      const f = rand(220, 300), o = osc('sine', f), g = gain(0.0001)
      o.frequency.setValueAtTime(f, t)
      o.frequency.exponentialRampToValueAtTime(f * 1.6, t + 0.09)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(rand(0.08, 0.12), t + 0.02)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
      o.connect(g).connect(bus)
      o.start(t)
      o.stop(t + 0.2)
      pulse(ctx, 'icehole', t)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(2, 6)
      while (next < until) {
        bloop(next)
        if (Math.random() < 0.3) bloop(next + rand(0.25, 0.5)) // parfois deux, coup sur coup
        next += rand(7, 16)
      }
    }, 200)
  })
}
