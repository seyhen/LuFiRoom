import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import type { Kit } from '../engine'

/**
 * Brouhaha de café. Enregistré, ou synthétisé : sept « voix » de bruit rose dont le timbre (deux formants) et le rythme de
 * syllabes (3 à 7 par seconde, avec des respirations plus lentes) diffèrent, dans une petite pièce qui résonne un peu.
 */
export default function murmur(kit: Kit, out: GainNode, { loops }: Room) {
  const { ctx, gain, biq, osc, loop, noise } = kit
  kit.loopOr(loops.murmur, out, () => {
    // Niveau de la synthèse (l'enregistrement, lui, passe tel quel par `out`) : réglé pour valoir les autres sons du mixeur.
    const bus = gain(3.8)
    bus.connect(out)
    const room = gain(1), conv = ctx.createConvolver()
    conv.buffer = impulse(ctx, 0.7, 3)
    room.connect(biq('lowpass', 3800, 0.5)).connect(bus)
    room.connect(conv)
    conv.connect(gain(0.25)).connect(bus)
    for (let i = 0; i < 7; i++) {
      const voice = gain(0.5), src = loop(noise.pink, rand(0, 5))
      // Deux formants, comme une voyelle : le premier vers 400-800 Hz, le second vers 1200-2400 Hz.
      const f1 = rand(380, 800), f2 = rand(1200, 2400), pan = ctx.createStereoPanner()
      pan.pan.value = rand(-0.8, 0.8)
      src.connect(biq('bandpass', f1, 2.2)).connect(voice)
      src.connect(biq('bandpass', f2, 2.8)).connect(gain(0.5)).connect(voice)
      // Syllabes et respirations : deux oscillateurs lents qui font monter et descendre la voix.
      const syll = osc('sine', rand(3, 7)), breath = osc('sine', rand(0.12, 0.5))
      syll.connect(gain(0.3)).connect(voice.gain)
      breath.connect(gain(0.18)).connect(voice.gain)
      syll.start()
      breath.start()
      voice.connect(gain(0.2)).connect(pan).connect(room)
    }
    // Le fond de la salle : un grondement très bas.
    loop(noise.brown, 1.9).connect(biq('lowpass', 420, 0.5)).connect(gain(0.12)).connect(bus)
  })
}
