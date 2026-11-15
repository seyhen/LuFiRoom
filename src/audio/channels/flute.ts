import type { Room } from '../../rooms/types'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

// Un air de pâtre, lent, en ré majeur pentatonique : des demi-tons au-dessus du ré4, -1 = un souffle de silence.
const PHRASE = [4, -1, 2, 4, 7, -1, 4, 4, 2, -1, -1, 0, 2, 4, -1, 7, 9, 7, -1, 4, 2, 0, -1, -1, 2, 4, 2, 0, -1, -1]

/**
 * Le joueur de flûte sur sa souche, dans la forêt en contrebas : un air lent qui monte au crépuscule. Enregistré (60 s en boucle),
 * ou synthétisé (provisoire) : des notes de flûte de bois (sinus, un peu de deuxième harmonique et de souffle) au vibrato lent,
 * longues, avec des silences, et un écho de clairière. Rien d'aigu : tout sous 2 kHz.
 */
export default function flute(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.flute, out, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const dry = gain(1), wet = ctx.createDelay(1), fb = gain(0.4)
    dry.connect(biq('lowpass', 2000, 0.5)).connect(out)
    dry.connect(wet)
    wet.delayTime.value = 0.55
    wet.connect(biq('lowpass', 1400, 0.5)).connect(fb).connect(wet)
    wet.connect(gain(0.45)).connect(out)
    function note(t: number, semi: number, len: number) {
      const f = 293.66 * 2 ** (semi / 12), g = gain(0.0001), vib = osc('sine', 4.8)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.linearRampToValueAtTime(0.05, t + 0.22)
      g.gain.setValueAtTime(0.05, t + len - 0.35)
      g.gain.linearRampToValueAtTime(0.0001, t + len)
      const o = osc('sine', f), h = osc('sine', f * 2)
      vib.connect(gain(f * 0.004)).connect(o.frequency)
      o.connect(g)
      h.connect(gain(0.1)).connect(g)
      g.connect(dry)
      // le souffle qui accompagne la note
      const air = ctx.createBufferSource(), ag = gain(0.0001)
      air.buffer = noise.pink; air.loop = true
      air.connect(biq('bandpass', f * 2, 1.5)).connect(ag).connect(dry)
      ag.gain.setValueAtTime(0.0001, t)
      ag.gain.linearRampToValueAtTime(0.012, t + 0.15)
      ag.gain.linearRampToValueAtTime(0.0001, t + len)
      for (const s of [o, h, vib, air]) { s.start(t); s.stop(t + len + 0.05) }
    }
    let next = 0, i = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) { next = now + 0.1; i = 0 }
      while (next < until) {
        const d = PHRASE[i % PHRASE.length], len = 1.6 + ((i * 7) % 3) * 0.7
        if (d >= 0) note(next, d, len)
        next += len
        i++
      }
    }, 200)
  })
}
