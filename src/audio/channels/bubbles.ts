import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le ballast qui se vide : des chapelets de bulles qui montent d'un évent, chacune un petit « blop » dont la hauteur grimpe
 * (une bulle qui se resserre chante plus aigu), les plus grosses plus graves, avec un gargouillis sourd dessous et un souffle d'air.
 * Enregistré, ou synthétisé.
 */
export default function bubbles(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.bubbles, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(out)
    // le gargouillis du réservoir, qui respire
    const gurgle = gain(0.1)
    loop(noise.pink, 3.1).connect(biq('bandpass', 280, 1.4)).connect(gurgle).connect(bus)
    const slow = osc('sine', 0.19)
    slow.connect(gain(0.06)).connect(gurgle.gain)
    slow.start()
    loop(noise.white, 0.7).connect(biq('bandpass', 4200, 0.6)).connect(gain(0.006)).connect(bus)

    function blop(t: number, size: number, v: number) {
      const f = (380 + (1 - size) * 1500) * rand(0.85, 1.15), o = osc('sine', f), g = gain(0.0001), pan = ctx.createStereoPanner()
      pan.pan.value = rand(-0.6, 0.6)
      o.frequency.setValueAtTime(f, t)
      o.frequency.exponentialRampToValueAtTime(f * rand(1.5, 1.9), t + 0.05 + size * 0.04)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v, t + 0.004)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07 + size * 0.09)
      o.connect(g).connect(pan).connect(bus)
      o.start(t)
      o.stop(t + 0.2)
    }

    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.1
      while (next < until) {
        // un chapelet : 5 à 14 bulles qui se suivent, de plus en plus petites en montant
        const n = 5 + ((Math.random() * 10) | 0)
        let t = next
        for (let i = 0; i < n; i++) {
          blop(t, Math.max(0, 1 - i / n + rand(-0.2, 0.2)), rand(0.05, 0.14))
          t += rand(0.04, 0.16)
        }
        next = t + rand(0.4, 2)
      }
    }, 150)
  })
}
