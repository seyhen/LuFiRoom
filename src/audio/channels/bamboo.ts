import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le shishi-odoshi, le « fait-peur-aux-cerfs » du jardin : un tube de bambou se remplit d'un filet d'eau, bascule, se vide,
 * et retombe sur sa pierre avec un « tok » creux qui résonne dans le jardin. Enregistré, ou synthétisé.
 */
export default function bamboo(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.bamboo, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(2.4)
    bus.connect(out)
    const garden = ctx.createConvolver()
    garden.buffer = impulse(ctx, 2.6, 3.2)
    garden.connect(gain(0.55)).connect(bus)
    // le petit filet qui remplit le bambou, très discret
    loop(noise.white, 1.2).connect(biq('bandpass', 2600, 4)).connect(gain(0.01)).connect(bus)

    /** Le coup : un bambou creux qui frappe la pierre, deux résonances de tube et une attaque sèche. */
    function tok(t: number, v: number) {
      for (const [f, d, amp] of [[rand(560, 620), 0.22, 1], [rand(1480, 1600), 0.09, 0.45], [rand(240, 270), 0.16, 0.5]]) {
        const o = osc('sine', f), g = gain(0.0001)
        o.frequency.setValueAtTime(f * 1.04, t)
        o.frequency.exponentialRampToValueAtTime(f, t + 0.02)
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(v * amp, t + 0.002)
        g.gain.exponentialRampToValueAtTime(0.0001, t + d)
        o.connect(g).connect(bus)
        g.connect(garden)
        o.start(t)
        o.stop(t + d + 0.05)
      }
      const s = ctx.createBufferSource(), ng = gain(0.0001)
      s.buffer = noise.white
      s.start(t, rand(0, 3))
      s.stop(t + 0.04)
      ng.gain.setValueAtTime(0.0001, t)
      ng.gain.exponentialRampToValueAtTime(v * 0.5, t + 0.001)
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.025)
      s.connect(biq('bandpass', 1800, 1)).connect(ng).connect(bus)
    }
    /** L'eau qui se déverse quand le bambou bascule. */
    function spill(t: number) {
      const s = ctx.createBufferSource(), bp = biq('bandpass', 900, 1.5), g = gain(0.0001)
      s.buffer = noise.pink
      s.start(t, rand(0, 4))
      s.stop(t + 1)
      bp.frequency.setValueAtTime(700, t)
      bp.frequency.exponentialRampToValueAtTime(1500, t + 0.8)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.12, t + 0.1)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.9)
      s.connect(bp).connect(g).connect(bus)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(1.5, 3)
      while (next < until) {
        spill(next)
        tok(next + 0.75, rand(0.16, 0.2))
        tok(next + 0.98, 0.04) // le petit rebond
        next += rand(9, 14)
      }
    }, 150)
  })
}
