import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Kit } from '../engine'

/**
 * Le pinceau sur la toile. Enregistré, ou synthétisé : de longs frottements moelleux (un souffle sourd et large, sans aigus durs),
 * un va-et-vient qui reprend la peinture, entrecoupé de pauses.
 */
export default function brush(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.grainsOr(loops.brush, out, { len: [8, 16], fade: 0.9, rate: 0.02, level: 0.15 }, () => {
    const { ctx, gain, biq, noise } = kit
    const bus = gain(9)
    bus.connect(out)
    function stroke(t: number, dur: number, v: number) {
      const s = ctx.createBufferSource(), bp = biq('bandpass', 1500, 0.7), g = gain(0.0001)
      s.buffer = noise.pink
      s.start(t, rand(0, 4))
      s.stop(t + dur + 0.05)
      bp.frequency.setValueAtTime(rand(1000, 1400), t)
      bp.frequency.linearRampToValueAtTime(rand(1700, 2300), t + dur)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v, t + dur * 0.35)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      s.connect(bp).connect(g).connect(bus)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.3
      while (next < until) {
        for (let i = 0, n = 2 + ((Math.random() * 4) | 0); i < n; i++) {
          const dur = rand(0.7, 1.5)
          stroke(next, dur, rand(0.07, 0.11))
          next += dur * rand(0.8, 1)
        }
        next += rand(1.5, 5)
      }
    }, 200)
  })
}
