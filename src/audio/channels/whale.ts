import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le chant d'une baleine, très loin : trois notes qui montent en glissant, vibrent, puis retombent, dans l'immensité de l'eau
 * (une réverbération de cinq secondes). Une phrase toutes les quinze à trente secondes. Enregistré, ou synthétisé.
 */
export default function whale(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.whale, out, () => {
    const { ctx, gain, biq, osc } = kit
    const bus = gain(1)
    bus.connect(out)
    const deep = ctx.createConvolver()
    deep.buffer = impulse(ctx, 5.4, 2)
    deep.connect(gain(1.1)).connect(bus)

    function note(t: number, base: number, len: number, v: number, pan: number) {
      const lp = biq('lowpass', 1100, 0.7), env = gain(0.0001), p = ctx.createStereoPanner(), vib = osc('sine', rand(4.5, 6))
      p.pan.setValueAtTime(pan, t)
      p.pan.linearRampToValueAtTime(pan * -0.4, t + len)
      const peak = base * rand(1.45, 1.7)
      const fund = osc('sine', base), h2 = osc('sine', base * 2), h3 = osc('sine', base * 3)
      for (const [o, amp] of [[fund, 1], [h2, 0.38], [h3, 0.12]] as const) {
        // monte en glissant, tient, redescend plus bas
        const m = o === fund ? 1 : o === h2 ? 2 : 3
        o.frequency.setValueAtTime(base * m, t)
        o.frequency.exponentialRampToValueAtTime(peak * m, t + len * 0.55)
        o.frequency.exponentialRampToValueAtTime(base * 0.82 * m, t + len)
        vib.connect(gain(3.5 * m)).connect(o.frequency)
        o.connect(gain(amp)).connect(lp)
        o.start(t)
        o.stop(t + len + 0.1)
      }
      vib.start(t)
      vib.stop(t + len + 0.1)
      env.gain.setValueAtTime(0.0001, t)
      env.gain.exponentialRampToValueAtTime(v, t + len * 0.3)
      env.gain.exponentialRampToValueAtTime(v * 0.7, t + len * 0.7)
      env.gain.exponentialRampToValueAtTime(0.0001, t + len)
      lp.connect(env).connect(p)
      p.connect(bus)
      p.connect(deep)
    }

    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(1.5, 4)
      while (next < until) {
        const notes = 2 + ((Math.random() * 2) | 0), base = rand(150, 210), pan = rand(-0.7, 0.7)
        let t = next
        for (let i = 0; i < notes; i++) {
          const len = rand(2.2, 3.6)
          note(t, base * (1 + i * rand(0.04, 0.1)), len, 0.14, pan)
          t += len * rand(0.65, 0.9)
        }
        next = t + rand(14, 28)
      }
    }, 300)
  })
}
