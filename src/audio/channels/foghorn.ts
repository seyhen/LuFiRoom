import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * La corne de brume. Une longue note grave, grasse (deux dents de scie à peine désaccordées et une octave dessous, passées dans
 * un filtre sourd), qui monte en quatre cents millisecondes, tient, puis s'éteint dans l'écho de la baie. Une seconde corne,
 * plus loin et plus grave, lui répond. Enregistrée, ou synthétisée.
 */
export default function foghorn(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.foghorn, out, () => {
    const { ctx, gain, biq, osc } = kit
    const bus = gain(1.2)
    bus.connect(out)
    const bay = ctx.createConvolver()
    bay.buffer = impulse(ctx, 4.6, 2.4)
    bay.connect(gain(0.8)).connect(bus)

    /** `far` : 0 tout près, 1 très loin (plus sourde, plus d'écho). */
    function blast(t: number, f: number, len: number, v: number, far: number) {
      const lp = biq('lowpass', 560 - far * 300, 2.4), env = gain(0.0001), dry = gain(1 - far * 0.7)
      for (const [mul, type, amp] of [[1, 'sawtooth', 0.5], [1.007, 'sawtooth', 0.42], [0.5, 'square', 0.3]] as const) {
        const o = osc(type, f * mul)
        // la note part un peu haut et se pose, puis fléchit à la fin du souffle
        o.frequency.setValueAtTime(f * mul * 1.09, t)
        o.frequency.exponentialRampToValueAtTime(f * mul, t + 0.35)
        o.frequency.setValueAtTime(f * mul, t + len)
        o.frequency.exponentialRampToValueAtTime(f * mul * 0.93, t + len + 1)
        o.connect(gain(amp)).connect(lp)
        o.start(t)
        o.stop(t + len + 1.3)
      }
      env.gain.setValueAtTime(0.0001, t)
      env.gain.linearRampToValueAtTime(v, t + 0.45)
      env.gain.setValueAtTime(v, t + len)
      env.gain.exponentialRampToValueAtTime(0.0001, t + len + 1.1)
      lp.connect(env)
      env.connect(dry).connect(bus)
      env.connect(bay)
    }

    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(0.5, 1.2)
      while (next < until) {
        blast(next, rand(90, 96), rand(2.5, 3.1), 0.5, 0.15)
        blast(next + rand(9.5, 13), rand(68, 73), rand(2, 2.6), 0.22, 0.9) // la réponse, au large
        next += rand(26, 36)
      }
    }, 300)
  })
}
