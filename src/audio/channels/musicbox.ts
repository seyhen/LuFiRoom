import type { Room } from '../../rooms/types'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

// Une berceuse à nous, lente, en do majeur, sur 3 temps : les notes sont des degrés de la gamme (0 = do4), -1 = silence.
const MELODY = [4, 2, 0, 2, 4, 7, 9, -1, 7, 4, 2, 4, 5, 4, 2, 0, -1, -1, 4, 2, 0, 2, 4, 7, 9, 12, 9, 7, 4, -1, 2, 0, -1, -1, -1, -1]
const SCALE = [0, 2, 4, 5, 7, 9, 11, 12, 14, 16, 17, 19, 21, 23, 24]
const STEP = 0.62 // la durée d'une note, en secondes

/**
 * La boîte à musique : une berceuse douce, lente, qu'on écoute pour s'endormir. Synthèse provisoire (un enregistrement viendra) :
 * des notes de lame de métal (un fondamental et deux partiels inharmoniques qui s'éteignent vite), jouées une à une, avec un
 * léger écho. La mélodie boucle, et chaque note fait avancer le cylindre dans la scène (`pulse`). Rien d'aigu : tout sous 3 kHz.
 */
export default function musicbox(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.musicbox, out, () => {
    const { ctx, gain, biq, osc } = kit
    const dry = gain(1), wet = ctx.createDelay(1), fb = gain(0.35)
    wet.delayTime.value = 0.34
    dry.connect(biq('lowpass', 3000, 0.5)).connect(out)
    dry.connect(wet)
    wet.connect(biq('lowpass', 1800, 0.5)).connect(fb).connect(wet)
    wet.connect(gain(0.4)).connect(out)
    /** Une lame : fondamental pur, plus deux partiels (×2,76 et ×5,4) qui meurent plus vite. */
    function tine(t: number, semi: number) {
      const f = 261.63 * 2 ** (semi / 12)
      for (const [mult, lvl, len] of [[1, 0.1, 2.6], [2.76, 0.03, 0.9], [5.4, 0.008, 0.35]] as const) {
        const o = osc('sine', f * mult), g = gain(0.0001)
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(lvl, t + 0.004)
        g.gain.exponentialRampToValueAtTime(0.0001, t + len)
        o.connect(g).connect(dry)
        o.start(t)
        o.stop(t + len + 0.05)
      }
    }
    let next = 0, i = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) { next = now + 0.1; i = 0 }
      while (next < until) {
        const d = MELODY[i % MELODY.length]
        if (d >= 0) {
          tine(next, SCALE[Math.min(d, SCALE.length - 1)] ?? d)
          pulse(ctx, 'musicbox', next)
        }
        next += STEP
        i++
      }
    }, 150)
  })
}
