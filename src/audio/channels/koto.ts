import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

// La gamme hirajoshi sur ré (ré mi fa la si bémol), sur deux octaves : en demi-tons depuis le ré grave (146,8 Hz).
const SCALE = [0, 2, 3, 7, 8, 12, 14, 15, 19, 20, 24]

/**
 * Le koto de la terrasse : des cordes pincées, lentes, dans la gamme hirajoshi, qui résonnent dans l'air du soir. Synthèse
 * provisoire (un enregistrement viendra) : une corde est un fondamental et deux partiels qui s'éteignent à des vitesses
 * différentes, avec un petit clic de plectre, et un écho doux. Des phrases de trois à six notes en marche lente, entrecoupées de
 * silences, parfois un glissando de cordes. Chaque note fait plonger la main dans la scène (`pulse`). Tout sous 3 kHz.
 */
export default function koto(kit: Kit, out: GainNode, { loops }: Room): Channel {
  const rec = kit.loopOrChannel(loops.koto, out, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const dry = gain(1), wet = ctx.createDelay(1), fb = gain(0.38)
    wet.delayTime.value = 0.42
    dry.connect(biq('lowpass', 3000, 0.5)).connect(out)
    dry.connect(wet)
    wet.connect(biq('lowpass', 1700, 0.5)).connect(fb).connect(wet)
    wet.connect(gain(0.45)).connect(out)
    /** Une corde pincée à l'instant `t`, `semi` demi-tons au-dessus du ré grave. */
    function pluck(t: number, semi: number, v = 1) {
      const f = 146.83 * 2 ** (semi / 12)
      for (const [mult, lvl, len] of [[1, 0.12, 3.2], [2, 0.045, 1.4], [3.01, 0.015, 0.5]] as const) {
        const o = osc('sine', f * mult), g = gain(0.0001)
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(lvl * v, t + 0.004)
        g.gain.exponentialRampToValueAtTime(0.0001, t + len)
        o.connect(g).connect(dry)
        o.start(t)
        o.stop(t + len + 0.05)
      }
      // le plectre : un souffle de bruit très bref
      const s = ctx.createBufferSource(), c = gain(0.0001)
      s.buffer = noise.pink
      c.gain.setValueAtTime(0.0001, t)
      c.gain.exponentialRampToValueAtTime(0.03 * v, t + 0.002)
      c.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
      s.connect(biq('bandpass', Math.min(f * 3, 2400), 1.2)).connect(c).connect(dry)
      s.start(t, rand(0, 4))
      s.stop(t + 0.07)
    }
    let next = 0, left = 0, deg = 4
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) { next = now + 0.2; left = 0 }
      while (next < until) {
        if (left <= 0) {
          // une nouvelle phrase : un silence, un glissando de cordes une fois sur quatre, puis trois à six notes
          left = 3 + ((Math.random() * 4) | 0)
          if (Math.random() < 0.25) {
            const top = Math.min(SCALE.length - 1, 4 + ((Math.random() * 6) | 0))
            for (let i = 0; i < 4; i++) { pluck(next + i * 0.09, SCALE[top - 3 + i], 0.5 + i * 0.12); pulse(ctx, 'koto', next + i * 0.09) }
            next += 0.7
            deg = top
          }
        }
        // marche lente : un pas d'une ou deux cordes, le plus souvent vers le bas, rarement un saut
        const r = Math.random()
        deg = Math.max(0, Math.min(SCALE.length - 1, deg + (r < 0.45 ? -1 : r < 0.75 ? 1 : r < 0.88 ? -2 : r < 0.96 ? 2 : -4)))
        pluck(next, SCALE[deg], rand(0.8, 1.1))
        pulse(ctx, 'koto', next)
        left--
        next += left <= 0 ? rand(3, 5.5) : rand(0.6, 1.2)
      }
    }, 150)
  })
  return rec
}
