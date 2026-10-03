import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le verre de thé dans son porte-verre de métal, sur la tablette du compartiment. Enregistré, ou synthétisé : la cuillère
 * qui tinte contre le verre au rythme des secousses, parfois une vraie série quand on tourne le thé, et une gorgée.
 */
export default function tea(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.tea, out, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(3.2)
    bus.connect(out)
    function tink(t: number, v: number) {
      const f = rand(3600, 4400)
      for (const [ratio, amp, d] of [[1, 1, 0.25], [1.48, 0.4, 0.15], [2.6, 0.2, 0.08]]) {
        const o = osc('sine', f * ratio), g = gain(0.0001)
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(v * amp, t + 0.002)
        g.gain.exponentialRampToValueAtTime(0.0001, t + d)
        o.connect(g).connect(bus)
        o.start(t)
        o.stop(t + d + 0.02)
      }
    }
    // une gorgée : un petit souffle grave qui monte
    function sip(t: number) {
      const s = ctx.createBufferSource(), bp = biq('bandpass', 500, 2), g = gain(0.0001)
      s.buffer = noise.pink
      s.start(t, rand(0, 4))
      s.stop(t + 0.5)
      bp.frequency.setValueAtTime(400, t)
      bp.frequency.exponentialRampToValueAtTime(900, t + 0.4)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.15)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.45)
      s.connect(bp).connect(g).connect(bus)
    }
    let next = 0, nextStir = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(0.2, 1)
      if (nextStir < now) nextStir = now + rand(6, 14)
      while (next < until) {
        // les secousses : un, deux ou trois petits coups
        const n = 1 + ((Math.random() * 3) | 0)
        for (let i = 0; i < n; i++) tink(next + i * rand(0.08, 0.16), rand(0.02, 0.05))
        next += rand(1.2, 4.5)
      }
      while (nextStir < until) {
        for (let i = 0; i < 7; i++) tink(nextStir + i * rand(0.13, 0.18), rand(0.04, 0.07))
        if (Math.random() < 0.6) sip(nextStir + rand(2.5, 4))
        nextStir += rand(25, 45)
      }
    })
  })
}
