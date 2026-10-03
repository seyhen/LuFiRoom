import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Les mouettes. Enregistrées, ou synthétisées : des cris nasillards qui montent puis retombent (« kyaou »), en séries de deux
 * à cinq, plus ou moins loin, dans l'air ouvert (un peu d'écho). Entre deux, le silence et le vent.
 */
export default function gulls(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.gulls, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(7)
    bus.connect(out)
    const air = ctx.createConvolver()
    air.buffer = impulse(ctx, 1.6, 3.5)
    air.connect(gain(0.35)).connect(bus)
    // un léger souffle d'air marin, pour que les cris ne tombent pas dans le vide
    loop(noise.pink, 2.6).connect(biq('bandpass', 900, 0.4)).connect(gain(0.03)).connect(bus)

    /** Un cri : une scie filtrée (timbre nasal) qui glisse vers l'aigu puis retombe, avec un trémolo rapide. */
    function call(t: number, dur: number, f: number, v: number, pan: StereoPannerNode, far: number) {
      const o = osc('sawtooth', f), bp = biq('bandpass', f * 1.6, 3), bp2 = biq('bandpass', f * 3.1, 4), g = gain(0.0001), trem = osc('sine', rand(28, 40))
      o.frequency.setValueAtTime(f * 0.8, t)
      o.frequency.exponentialRampToValueAtTime(f * 1.35, t + dur * 0.3)
      o.frequency.exponentialRampToValueAtTime(f * 0.85, t + dur)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v, t + dur * 0.15)
      g.gain.setValueAtTime(v, t + dur * 0.55)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      trem.connect(gain(v * 0.3)).connect(g.gain)
      const lp = biq('lowpass', 5200 - far * 3000, 0.6)
      o.connect(bp).connect(g)
      o.connect(bp2).connect(gain(0.4)).connect(g)
      g.connect(lp).connect(pan)
      for (const n of [o, trem]) { n.start(t); n.stop(t + dur + 0.05) }
    }
    function series(t: number) {
      const far = Math.random(), pan = ctx.createStereoPanner(), n = 2 + ((Math.random() * 4) | 0), f = rand(700, 1000), v = 0.09 * (1 - far * 0.6)
      pan.pan.value = rand(-0.85, 0.85)
      pan.connect(bus)
      pan.connect(air)
      let at = t
      for (let i = 0; i < n; i++) {
        const dur = i === 0 ? rand(0.35, 0.5) : rand(0.18, 0.3)
        call(at, dur, f * rand(0.95, 1.05), v * (i ? rand(0.6, 0.9) : 1), pan, far)
        at += dur + rand(0.06, 0.16)
      }
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(0.3, 1.5)
      while (next < until) {
        series(next)
        if (Math.random() < 0.3) series(next + rand(0.4, 1.2)) // une autre lui répond
        next += rand(3.5, 11)
      }
    }, 150)
  })
}
