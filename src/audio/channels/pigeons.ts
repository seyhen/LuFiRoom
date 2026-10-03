import { useStore } from '../../state/store'
import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Les pigeons du château d'eau. Enregistrés, ou synthétisés : des roucoulements graves et ronds (« rou-hou-hou »), parfois
 * un battement d'ailes. La nuit, ils dorment à moitié : quelques roucoulements ensommeillés, plus rares.
 */
export default function pigeons(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.pigeons, out, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(5.5)
    bus.connect(out)
    /** Un roucoulement : trois ou quatre syllabes graves, la deuxième plus longue et qui monte. */
    function coo(t: number, pan: number) {
      const p = ctx.createStereoPanner(), base = rand(380, 460)
      p.pan.value = pan
      p.connect(bus)
      const syl = [[0.12, 1, 0.9], [0.42, 1.12, 1], [0.16, 0.95, 0.7], [0.22, 0.9, 0.6]].slice(0, 3 + (Math.random() < 0.5 ? 1 : 0))
      let at = t
      for (const [dur, k, v] of syl) {
        const o = osc('sine', base * k), o2 = osc('triangle', base * k * 2), g = gain(0.0001), lp = biq('lowpass', 900, 0.7)
        o.frequency.setValueAtTime(base * k * 0.94, at)
        o.frequency.linearRampToValueAtTime(base * k, at + dur * 0.6)
        o.frequency.linearRampToValueAtTime(base * k * 0.92, at + dur)
        o2.frequency.setValueAtTime(base * k * 1.88, at)
        o2.frequency.linearRampToValueAtTime(base * k * 2, at + dur * 0.6)
        const trem = osc('sine', rand(18, 24))
        trem.connect(gain(0.012 * v)).connect(g.gain)
        g.gain.setValueAtTime(0.0001, at)
        g.gain.exponentialRampToValueAtTime(0.05 * v, at + dur * 0.3)
        g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
        o.connect(g)
        o2.connect(gain(0.25)).connect(g)
        g.connect(lp).connect(p)
        for (const n of [o, o2, trem]) { n.start(at); n.stop(at + dur + 0.05) }
        at += dur + rand(0.04, 0.09)
      }
    }
    /** Un envol : une rafale de petits souffles (les ailes), qui s'éloigne. */
    function flap(t: number) {
      const n = 8 + ((Math.random() * 6) | 0), p = ctx.createStereoPanner()
      p.pan.setValueAtTime(rand(-0.5, 0.5), t)
      p.pan.linearRampToValueAtTime(rand(-1, 1), t + n * 0.08)
      p.connect(bus)
      for (let i = 0; i < n; i++) {
        const at = t + i * rand(0.065, 0.085), s = ctx.createBufferSource(), g = gain(0.0001), v = 0.05 * (1 - i / n)
        s.buffer = noise.pink
        s.start(at, rand(0, 4))
        s.stop(at + 0.06)
        g.gain.setValueAtTime(0.0001, at)
        g.gain.exponentialRampToValueAtTime(v, at + 0.01)
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.05)
        s.connect(biq('bandpass', 1100, 0.8)).connect(g).connect(p)
      }
    }
    let next = 0, nextFlap = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime, night = useStore.getState().night
      if (next < now) next = now + rand(0.3, 1.5)
      if (nextFlap < now) nextFlap = now + rand(12, 30)
      while (next < until) {
        coo(next, rand(-0.6, 0.6))
        if (Math.random() < 0.35) coo(next + rand(0.5, 1.4), rand(-0.6, 0.6))
        next += night ? rand(6, 14) : rand(2.5, 7)
      }
      while (nextFlap < until) {
        if (!useStore.getState().night) flap(nextFlap)
        nextFlap += rand(20, 45)
      }
    }, 150)
  })
}
