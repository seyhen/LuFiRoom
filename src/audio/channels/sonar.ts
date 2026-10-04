import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le sonar : un « ping » pur et rond toutes les cinq secondes et demie, son écho dans la coque, puis deux retours très pâles,
 * ceux du fond marin et d'un banc de roches. Régulier comme une machine, c'est ce qui rassure. Enregistré, ou synthétisé.
 */
export default function sonar(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.sonar, out, () => {
    const { ctx, gain, biq, osc } = kit
    const bus = gain(0.9)
    bus.connect(out)
    const hull = ctx.createConvolver()
    hull.buffer = impulse(ctx, 1.8, 3.4)
    hull.connect(gain(0.5)).connect(bus)
    // l'écho qui revient en s'étouffant
    const delay = ctx.createDelay(2), fb = gain(0.36), tone = biq('lowpass', 2300, 0.5)
    delay.delayTime.value = 0.62
    delay.connect(tone).connect(fb).connect(delay)
    tone.connect(gain(0.55)).connect(bus)

    function ping(t: number, v: number, f: number, soft: number) {
      const lp = biq('lowpass', 5200 * soft, 0.5), env = gain(0.0001)
      for (const [mul, amp, d] of [[1, 1, 1.1], [2, 0.18, 0.35], [3, 0.05, 0.15]] as const) {
        const o = osc('sine', f * mul), g = gain(amp)
        o.frequency.setValueAtTime(f * mul * 1.012, t)
        o.frequency.exponentialRampToValueAtTime(f * mul, t + 0.08)
        o.connect(g).connect(lp)
        g.gain.setValueAtTime(amp, t)
        g.gain.exponentialRampToValueAtTime(0.0001, t + d)
        o.start(t)
        o.stop(t + d + 0.05)
      }
      env.gain.setValueAtTime(0.0001, t)
      env.gain.exponentialRampToValueAtTime(v, t + 0.006)
      env.gain.exponentialRampToValueAtTime(0.0001, t + 1.25)
      lp.connect(env)
      env.connect(bus)
      env.connect(hull)
      env.connect(delay)
    }

    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.3
      while (next < until) {
        ping(next, 0.3, 1290, 1)
        ping(next + 1.4 + rand(0, 0.05), 0.045, 1290, 0.5) // le fond
        ping(next + 2.25, 0.02, 1290, 0.4) // les roches
        next += 5.5 + rand(-0.02, 0.02)
      }
    }, 200)
  })
}
