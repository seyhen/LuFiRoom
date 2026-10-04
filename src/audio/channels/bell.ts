import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

// Les partiels d'une cloche de bronze (rapports de fréquence, niveau, durée) : inharmoniques, c'est ce qui la fait sonner « cloche ».
const PARTIALS: [number, number, number][] = [[0.5, 0.5, 3.4], [1, 1, 2.8], [1.19, 0.6, 2], [1.56, 0.45, 1.6], [2.0, 0.35, 1.2], [2.53, 0.2, 0.8], [3.3, 0.12, 0.5]]

/**
 * La cloche de la bouée, au large : la houle la balance, elle sonne par salves irrégulières de deux à cinq coups (quand la
 * mer creuse), puis se tait un moment. Étouffée par la distance, avec l'écho du large. Enregistrée, ou synthétisée.
 */
export default function bell(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.bell, out, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(0.9)
    bus.connect(out)
    const dist = biq('lowpass', 3200, 0.6)
    dist.connect(bus)
    const open = ctx.createConvolver()
    open.buffer = impulse(ctx, 2.8, 2.8)
    open.connect(gain(0.5)).connect(bus)

    function clang(t: number, f0: number, v: number) {
      const pan = ctx.createStereoPanner()
      pan.pan.value = rand(-0.5, 0.5)
      pan.connect(dist)
      pan.connect(open)
      for (const [ratio, amp, d] of PARTIALS) {
        const o = osc('sine', f0 * ratio * rand(0.998, 1.002)), g = gain(0.0001)
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(v * amp, t + 0.004)
        g.gain.exponentialRampToValueAtTime(0.0001, t + d)
        o.connect(g).connect(pan)
        o.start(t)
        o.stop(t + d + 0.05)
      }
      // le choc du battant
      const s = ctx.createBufferSource(), ng = gain(0.0001)
      s.buffer = noise.white
      s.start(t, rand(0, 3))
      s.stop(t + 0.05)
      ng.gain.setValueAtTime(0.0001, t)
      ng.gain.exponentialRampToValueAtTime(v * 0.4, t + 0.001)
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
      s.connect(biq('bandpass', 2600, 1.2)).connect(ng).connect(pan)
    }

    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(0.4, 1)
      while (next < until) {
        const strikes = 2 + ((Math.random() * 4) | 0), f0 = rand(395, 425)
        let t = next
        for (let i = 0; i < strikes; i++) {
          clang(t, f0 * rand(0.99, 1.01), rand(0.07, 0.13))
          t += rand(1.1, 2.3)
        }
        next = t + rand(5, 11)
      }
    }, 250)
  })
}
