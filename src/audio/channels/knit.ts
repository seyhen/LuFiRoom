import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Kit } from '../engine'

/**
 * Le tricot de la cabane. Enregistré, ou synthétisé : les aiguilles de bois qui se croisent, de petits claquements mats et
 * réguliers (deux par maille), le fil de laine qui glisse entre eux, et de temps en temps une pause pour compter les mailles.
 */
export default function knit(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.grainsOr(loops.knit, out, { len: [8, 16], fade: 0.8, rate: 0.02, level: 0.15 }, () => {
    const { ctx, gain, biq, noise } = kit
    const bus = gain(9)
    bus.connect(out)
    const burst = (t: number, dur: number) => {
      const s = ctx.createBufferSource()
      s.buffer = noise.white
      s.start(t, rand(0, 4))
      s.stop(t + dur + 0.02)
      return s
    }
    function click(t: number, v: number) {
      const g = gain(0.0001), len = rand(0.012, 0.022)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v, t + 0.001)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      burst(t, len).connect(biq('bandpass', rand(1300, 1900), 2.2)).connect(g).connect(bus)
    }
    function yarn(t: number, dur: number) {
      const g = gain(0.0001)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.012, t + dur * 0.4)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      burst(t, dur).connect(biq('bandpass', 5200, 0.6)).connect(g).connect(bus)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.2
      while (next < until) {
        const stitches = 8 + ((Math.random() * 14) | 0), pace = rand(0.62, 0.9)
        for (let i = 0; i < stitches; i++) {
          const t = next + i * pace * rand(0.94, 1.06)
          click(t, rand(0.035, 0.05))
          click(t + rand(0.1, 0.17), rand(0.025, 0.04))
          yarn(t + 0.05, rand(0.2, 0.35))
        }
        next += stitches * pace + rand(2, 6)
      }
    }, 200)
  })
}
