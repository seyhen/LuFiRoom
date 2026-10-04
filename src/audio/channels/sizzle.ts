import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/** Le crépitement de l'huile : un lit de petites crépitations aiguës, comme des gouttes d'eau jetées dans le wok. */
function sizzleBuffer(ctx: BaseAudioContext, sec = 5) {
  const sr = ctx.sampleRate, N = Math.floor(sec * sr), buf = ctx.createBuffer(2, N, sr)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let k = 0; k < sec * 280; k++) {
      const i0 = (Math.random() * N) | 0, len = 3 + ((Math.random() * 40) | 0), a = Math.pow(Math.random(), 2.5) * 0.9
      let lp = 0
      for (let n = 0; n < len; n++) {
        lp += (Math.random() * 2 - 1 - lp) * 0.7
        d[(i0 + n) % N] += a * Math.exp((-4 * n) / len) * lp
      }
    }
  }
  return buf
}

/**
 * Le wok : le crépitement de l'huile chaude sous les légumes, un coup de flamme qui gronde de temps en temps quand le cuistot
 * fait sauter, et la spatule qui gratte le fond, deux coups de métal sur le bord. Enregistré, ou synthétisé.
 */
export default function sizzle(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.sizzle, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(out)
    const bed = gain(0.34)
    loop(sizzleBuffer(ctx), 0).connect(biq('highpass', 2200, 0.5)).connect(bed).connect(bus)
    // le souffle du brûleur, qui respire
    const hiss = gain(0.014)
    loop(noise.white, 1.9).connect(biq('bandpass', 5400, 0.5)).connect(hiss).connect(bus)
    const breath = osc('sine', 0.31)
    breath.connect(gain(0.008)).connect(hiss.gain)
    breath.start()

    function whoosh(t: number) {
      const s = ctx.createBufferSource(), bp = biq('bandpass', 260, 1.2), g = gain(0.0001)
      s.buffer = noise.pink
      s.start(t, rand(0, 4))
      s.stop(t + 0.7)
      bp.frequency.setValueAtTime(240, t)
      bp.frequency.exponentialRampToValueAtTime(900, t + 0.28)
      bp.frequency.exponentialRampToValueAtTime(380, t + 0.6)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.2, t + 0.12)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.62)
      s.connect(bp).connect(g).connect(bus)
    }
    /** La spatule sur le fond du wok : un grattement, puis un petit coup de métal. */
    function scrape(t: number) {
      const s = ctx.createBufferSource(), bp = biq('bandpass', 2300, 3), g = gain(0.0001)
      s.buffer = noise.white
      s.start(t, rand(0, 3))
      s.stop(t + 0.25)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.03)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
      s.connect(bp).connect(g).connect(bus)
      for (const [f, d] of [[rand(830, 900), 0.16], [rand(1350, 1420), 0.09]] as const) {
        const o = osc('sine', f), og = gain(0.0001)
        og.gain.setValueAtTime(0.0001, t + 0.21)
        og.gain.exponentialRampToValueAtTime(0.05, t + 0.213)
        og.gain.exponentialRampToValueAtTime(0.0001, t + 0.21 + d)
        o.connect(og).connect(bus)
        o.start(t + 0.2)
        o.stop(t + 0.5)
      }
    }

    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(1, 2.5)
      while (next < until) {
        scrape(next)
        scrape(next + rand(0.4, 0.7))
        whoosh(next + rand(1.2, 2.2))
        next += rand(5, 10)
      }
    }, 200)
  })
}
