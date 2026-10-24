import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Kit } from '../engine'

/**
 * Les cartes de la réussite, dans le train. Enregistrées, ou synthétisées : une carte qu'on retourne et qu'on pose sur le tapis
 * (un petit souffle, un « flap » sourd), à un rythme lent et songeur, et de temps en temps le battement doux d'un paquet qu'on mêle.
 */
export default function cards(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.grainsOr(loops.cards, out, { len: [8, 14], fade: 0.7, rate: 0.02, level: 0.15 }, () => {
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
    /** Une carte : le froissement de son bord, puis le « flap » du carton qui touche le tapis. */
    function flip(t: number, v = 1) {
      const g = gain(0.0001), dur = rand(0.05, 0.09)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.05 * v, t + 0.006)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      burst(t, dur).connect(biq('bandpass', rand(2600, 4200), 0.9)).connect(g).connect(bus)
      const f = gain(0.0001), at = t + dur * 0.8
      f.gain.setValueAtTime(0.0001, at)
      f.gain.exponentialRampToValueAtTime(0.05 * v, at + 0.003)
      f.gain.exponentialRampToValueAtTime(0.0001, at + 0.06)
      burst(at, 0.07).connect(biq('lowpass', 700, 0.6)).connect(f).connect(bus)
    }
    function riffle(t: number) {
      const n = 14 + ((Math.random() * 10) | 0)
      for (let i = 0; i < n; i++) flip(t + i * rand(0.035, 0.05), 0.35)
      return t + n * 0.045
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.3
      while (next < until) {
        if (Math.random() < 0.12) next = riffle(next) + rand(0.8, 1.6)
        flip(next, rand(0.75, 1.1))
        next += Math.random() < 0.2 ? rand(3, 6) : rand(0.9, 2)
      }
    }, 200)
  })
}
