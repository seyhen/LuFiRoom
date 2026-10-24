import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Kit } from '../engine'

/**
 * Le fouet à matcha de l'onsen. Enregistré, ou synthétisé : les fines branches de bambou qui battent le thé dans le bol, un
 * bruissement rapide et régulier (une huitaine de battements par seconde) qui dure quelques secondes, puis le calme.
 */
export default function whisk(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.grainsOr(loops.whisk, out, { len: [6, 12], fade: 0.7, rate: 0.02, level: 0.15 }, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(9)
    bus.connect(out)
    function phrase(t: number, dur: number) {
      const s = ctx.createBufferSource(), g = gain(0.0001), gate = gain(0.5), lfo = osc('sine', rand(7, 9))
      s.buffer = noise.white
      s.loop = true
      s.start(t, rand(0, 4))
      s.stop(t + dur + 0.05)
      lfo.connect(gain(0.45)).connect(gate.gain)
      lfo.start(t)
      lfo.stop(t + dur + 0.05)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.06, t + 0.25)
      g.gain.setValueAtTime(0.06, t + dur - 0.4)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      s.connect(biq('bandpass', rand(2800, 3600), 0.8)).connect(gate).connect(g).connect(bus)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.3
      while (next < until) {
        const dur = rand(3, 6)
        phrase(next, dur)
        next += dur + rand(1.5, 4.5)
      }
    }, 200)
  })
}
