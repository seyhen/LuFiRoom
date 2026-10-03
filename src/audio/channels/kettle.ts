import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * La bouilloire et le thé. Enregistrés, ou synthétisés : l'eau qui chauffe (un souffle qui monte et des bulles de plus en
 * plus serrées), le déclic, puis l'eau versée dans la tasse (un glouglou dont la note monte à mesure qu'elle se remplit)
 * et la cuillère qui tourne. Une tasse de temps en temps, entre deux longs calmes.
 */
export default function kettle(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.kettle, out, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(6)
    bus.connect(out)
    const src = (t: number, dur: number, buf = noise.pink) => {
      const s = ctx.createBufferSource()
      s.buffer = buf
      s.loop = true
      s.start(t, rand(0, 4))
      s.stop(t + dur + 0.05)
      return s
    }
    function boil(t: number, dur: number) {
      // le souffle qui monte, puis retombe au déclic
      const lp = biq('bandpass', 300, 0.7), g = gain(0.0001)
      lp.frequency.setValueAtTime(250, t)
      lp.frequency.exponentialRampToValueAtTime(1600, t + dur)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.09, t + dur)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur + 1.2)
      src(t, dur + 1.3).connect(lp).connect(g).connect(bus)
      // les bulles : de plus en plus nombreuses
      for (let at = t + 2; at < t + dur; at += rand(0.03, 0.4) * (1 - (at - t) / dur) + 0.02) {
        const o = osc('sine', rand(500, 1300)), bg = gain(0.0001), k = (at - t) / dur
        o.frequency.setValueAtTime(o.frequency.value, at)
        o.frequency.exponentialRampToValueAtTime(o.frequency.value * 1.6, at + 0.03)
        bg.gain.setValueAtTime(0.0001, at)
        bg.gain.exponentialRampToValueAtTime(0.012 + k * 0.02, at + 0.004)
        bg.gain.exponentialRampToValueAtTime(0.0001, at + 0.035)
        o.connect(bg).connect(bus)
        o.start(at)
        o.stop(at + 0.05)
      }
      // le déclic
      const c = osc('square', 1800), cg = gain(0.0001), at = t + dur
      cg.gain.setValueAtTime(0.0001, at)
      cg.gain.exponentialRampToValueAtTime(0.05, at + 0.001)
      cg.gain.exponentialRampToValueAtTime(0.0001, at + 0.02)
      c.connect(biq('bandpass', 2500, 2)).connect(cg).connect(bus)
      c.start(at)
      c.stop(at + 0.03)
    }
    function pour(t: number) {
      const dur = rand(2.6, 3.4), bp = biq('bandpass', 380, 5), g = gain(0.0001), wob = osc('sine', 9)
      bp.frequency.setValueAtTime(380, t)
      bp.frequency.exponentialRampToValueAtTime(1100, t + dur)
      wob.connect(gain(60)).connect(bp.frequency)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.22, t + 0.25)
      g.gain.setValueAtTime(0.22, t + dur - 0.3)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      src(t, dur, noise.white).connect(bp).connect(g).connect(bus)
      wob.start(t)
      wob.stop(t + dur)
      // la cuillère
      for (let i = 0; i < 6; i++) {
        const at = t + dur + 1 + i * rand(0.16, 0.2), o = osc('sine', rand(3000, 3500)), sg = gain(0.0001)
        sg.gain.setValueAtTime(0.0001, at)
        sg.gain.exponentialRampToValueAtTime(0.03, at + 0.002)
        sg.gain.exponentialRampToValueAtTime(0.0001, at + 0.2)
        o.connect(sg).connect(bus)
        o.start(at)
        o.stop(at + 0.22)
      }
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(0.3, 1)
      while (next < until) {
        const heat = rand(14, 20)
        boil(next, heat)
        pour(next + heat + rand(1.5, 3))
        next += heat + rand(30, 55)
      }
    }, 200)
  })
}
