import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * La coque sous la pression : un grondement très grave qui ne s'arrête jamais, des plaintes de tôle qui glissent vers le bas
 * (une dent de scie lente passée dans un filtre étroit, qui tremble), et par moments, quelques rivets qui claquent.
 * Enregistrée, ou synthétisée.
 */
export default function hull(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.hull, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(out)
    const cabin = ctx.createConvolver()
    cabin.buffer = impulse(ctx, 1.6, 3)
    cabin.connect(gain(0.6)).connect(bus)
    // la pression : un grondement à la limite de l'audible
    const press = gain(0.34)
    loop(noise.brown, 2.7).connect(biq('lowpass', 95, 0.6)).connect(press).connect(bus)
    const swell = osc('sine', 0.06)
    swell.connect(gain(0.1)).connect(press.gain)
    swell.start()

    function groan(t: number) {
      const len = rand(1.6, 3.2), f = rand(170, 250), end = f * rand(0.5, 0.75)
      const o = osc('sawtooth', f), bp = biq('bandpass', 420, 9), g = gain(0.0001), trem = gain(0.6), lfo = osc('sine', rand(8, 13))
      o.frequency.setValueAtTime(f, t)
      o.frequency.exponentialRampToValueAtTime(end, t + len)
      bp.frequency.setValueAtTime(rand(380, 520), t)
      bp.frequency.exponentialRampToValueAtTime(rand(220, 300), t + len)
      lfo.connect(gain(0.4)).connect(trem.gain)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(rand(0.05, 0.09), t + len * 0.35)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      o.connect(bp).connect(trem).connect(g)
      g.connect(bus)
      g.connect(cabin)
      o.start(t)
      lfo.start(t)
      o.stop(t + len + 0.1)
      lfo.stop(t + len + 0.1)
    }
    /** Un rivet qui lâche un peu : un claquement sec, une résonance de tôle. */
    function tink(t: number) {
      const f = rand(1500, 3200), o = osc('sine', f), g = gain(0.0001), pan = ctx.createStereoPanner()
      pan.pan.value = rand(-0.7, 0.7)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(rand(0.03, 0.07), t + 0.001)
      g.gain.exponentialRampToValueAtTime(0.0001, t + rand(0.05, 0.12))
      o.connect(g).connect(pan)
      pan.connect(bus)
      pan.connect(cabin)
      o.start(t)
      o.stop(t + 0.2)
    }

    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(0.4, 1.5)
      while (next < until) {
        groan(next)
        if (Math.random() < 0.7) {
          const n = 1 + ((Math.random() * 3) | 0)
          for (let i = 0, t = next + rand(0.2, 1.8); i < n; i++, t += rand(0.1, 0.5)) tink(t)
        }
        next += rand(4.5, 10)
      }
    }, 200)
  })
}
