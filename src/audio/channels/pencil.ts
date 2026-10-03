import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le crayon sur la table à dessin. Enregistré, ou synthétisé : des traits longs, des hachures rapides, un trait qu'on reprend,
 * parfois la feuille qu'on fait glisser ou une gomme. Le grain du papier : du bruit blanc filtré, qui tremble un peu.
 */
export default function pencil(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.pencil, out, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(4)
    bus.connect(out)
    function stroke(t: number, dur: number, v: number, f: number) {
      const s = ctx.createBufferSource(), bp = biq('bandpass', f, 1.3), g = gain(0.0001), grain = osc('sine', rand(30, 55))
      s.buffer = noise.white
      s.start(t, rand(0, 4))
      s.stop(t + dur + 0.03)
      bp.frequency.setValueAtTime(f, t)
      bp.frequency.linearRampToValueAtTime(f * rand(0.85, 1.2), t + dur)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v, t + Math.min(0.03, dur * 0.3))
      g.gain.setValueAtTime(v * rand(0.7, 1), t + dur * 0.7)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      grain.connect(gain(v * 0.35)).connect(g.gain)
      s.connect(bp).connect(g).connect(bus)
      grain.start(t)
      grain.stop(t + dur + 0.03)
    }
    function hatch(t: number) {
      const n = 6 + ((Math.random() * 10) | 0), period = rand(0.09, 0.14)
      for (let i = 0; i < n; i++) stroke(t + i * period, period * 0.7, rand(0.03, 0.045), rand(3200, 4200))
      return t + n * period
    }
    function lines(t: number) {
      let at = t
      for (let i = 0, n = 1 + ((Math.random() * 3) | 0); i < n; i++) {
        const dur = rand(0.35, 1.2)
        stroke(at, dur, rand(0.035, 0.05), rand(2400, 3400))
        at += dur + rand(0.15, 0.5)
      }
      return at
    }
    function slide(t: number) {
      stroke(t, 0.6, 0.02, 900)
      return t + 0.8
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(0.2, 0.8)
      while (next < until) {
        const r = Math.random()
        const end = r < 0.45 ? lines(next) : r < 0.85 ? hatch(next) : slide(next)
        next = end + (Math.random() < 0.15 ? rand(4, 9) : rand(0.4, 2.2))
      }
    }, 150)
  })
}
