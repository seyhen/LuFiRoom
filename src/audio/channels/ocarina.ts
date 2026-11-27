import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

// Des phrases de valse lente en ré majeur (la tonalité de la berceuse du violoncelle : ils jouent ensemble), en demi-tons au-dessus du
// la4 ; chaque note : [hauteur, durée en temps]. Une valse à trois temps, ~66 à la noire : des phrases de deux ou quatre mesures.
const PHRASES: [number, number][][] = [
  [[5, 2], [4, 1], [2, 3], [0, 2], [2, 1], [4, 3]],
  [[9, 2], [7, 1], [5, 2], [4, 1], [2, 3], [-3, 3]],
  [[0, 1], [2, 1], [4, 1], [5, 3], [7, 2], [5, 1], [4, 3]],
  [[4, 2], [5, 1], [7, 3], [9, 2], [7, 1], [5, 3], [4, 3]],
  [[-3, 2], [0, 1], [2, 3], [4, 2], [2, 1], [0, 3]],
]
const BEAT = 0.9

/**
 * L'ocarina d'un passager, posé sur le siège du couloir : un air de valse lent et rond, des notes presque pures (un sinus, une pointe
 * de troisième harmonique, comme l'argile cuite), liées par un petit glissé, au vibrato qui ne vient qu'en fin de note ; des silences
 * entre les phrases, et la petite réverbération feutrée de la cabine. Autre chose que la flûte de bois de la cabane perchée (souffle,
 * deuxième harmonique, écho de clairière, notes détachées) : ici rien ne souffle, tout chante. Enregistré, ou synthétisé (provisoire :
 * il se remplacera par un enregistrement). Rien d'aigu : tout est filtré sous 2,4 kHz.
 */
export default function ocarina(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.ocarina, out, () => {
    const { ctx, gain, biq, osc } = kit
    const dry = gain(1)
    dry.connect(biq('lowpass', 2400, 0.5)).connect(out)
    const cabin = ctx.createConvolver()
    cabin.buffer = impulse(ctx, 1.8, 3)
    dry.connect(cabin)
    cabin.connect(gain(0.4)).connect(out)

    /** Une phrase jouée legato : une seule voix dont la hauteur glisse d'une note à l'autre. */
    function phrase(t: number, notes: [number, number][]) {
      const total = notes.reduce((a, [, d]) => a + d * BEAT, 0)
      const o = osc('sine', 440), h = osc('sine', 1320), g = gain(0.0001), vib = osc('sine', 5.2), vibD = gain(0)
      vib.connect(vibD).connect(o.frequency)
      o.connect(g)
      h.connect(gain(0.06)).connect(g)
      g.connect(dry)
      let at = t
      for (const [semi, d] of notes) {
        const f = 440 * 2 ** (semi / 12), len = d * BEAT
        // le glissé vers la note, puis l'attaque douce (un léger coup de langue) et le vibrato qui arrive sur la fin
        o.frequency.setTargetAtTime(f, at, 0.025)
        h.frequency.setTargetAtTime(f * 3, at, 0.025)
        g.gain.setTargetAtTime(0.12, at, 0.04)
        g.gain.setTargetAtTime(0.09, at + 0.12, 0.2)
        vibD.gain.setValueAtTime(0, at)
        vibD.gain.linearRampToValueAtTime(f * 0.006, at + len * 0.8)
        if (len > BEAT * 1.5) g.gain.setTargetAtTime(0.064, at + len * 0.6, 0.3)
        pulse(ctx, 'ocarina', at)
        at += len
      }
      g.gain.setTargetAtTime(0.0001, at - 0.15, 0.12)
      for (const s of [o, h, vib]) { s.start(t); s.stop(at + 0.8) }
      return total
    }

    let next = 0, last = -1
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.3
      while (next < until) {
        let k = (Math.random() * PHRASES.length) | 0
        if (k === last) k = (k + 1) % PHRASES.length
        last = k
        next += phrase(next, PHRASES[k]) + rand(3, 7)
      }
    }, 250)
  })
}
