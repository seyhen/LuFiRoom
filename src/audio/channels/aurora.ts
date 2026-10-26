import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import type { Kit } from '../engine'

// Un accord ouvert et suspendu (la, mi, si, do#, mi), dans le médium : rien d'aigu qui siffle.
const NOTES = [220, 329.6, 493.9, 554.4, 659.3]

/**
 * L'aurore boréale de l'igloo. Enregistrée, ou synthétisée : le « chant » qu'on prête aux aurores, un voile d'accord très doux qui
 * respire. Chaque note est une paire de sinus à peine désaccordés (un battement lent), qui gonfle et s'efface à son rythme
 * (toutes les dix à trente secondes) ; un souffle de bruit rose, filtré étroit, passe dessus comme le vent sur la neige.
 */
export default function aurora(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  return kit.loopOrChannel(loops.aurora, out, () => {
    const soft = biq('lowpass', 1500, 0.5)
    soft.connect(out)
    for (const f of NOTES) {
      const voice = gain(0.0)
      voice.connect(soft)
      for (const d of [-0.35, 0.35]) {
        const o = osc(f > 500 ? 'sine' : 'triangle', f + d)
        o.connect(gain(0.018)).connect(voice)
        o.start()
      }
      // la note gonfle et s'efface lentement : un LFO très lent, décalé pour chaque note, au-dessus d'un plancher
      const lfo = osc('sine', rand(0.03, 0.09)), depth = gain(0.5)
      voice.gain.value = 0.5
      lfo.connect(depth).connect(voice.gain)
      lfo.start(kit.ctx.currentTime + rand(0, 8))
    }
    // le souffle qui passe, un ton étroit qui glisse lentement entre 700 et 1300 Hz
    const air = biq('bandpass', 950, 6), airLvl = gain(0.05)
    loop(noise.pink, 1.7).connect(air).connect(airLvl).connect(soft)
    const sweep = osc('sine', 0.021)
    sweep.connect(gain(300)).connect(air.frequency)
    sweep.start()
    const breathe = osc('sine', 0.047)
    breathe.connect(gain(0.035)).connect(airLvl.gain)
    breathe.start()
  })
}
