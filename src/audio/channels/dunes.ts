import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import type { Kit } from '../engine'

/**
 * Le vent des dunes, autour de l'oasis : un souffle long et chaud qui passe sur le sable, avec le chuchotement du sable fin qui file
 * sur les crêtes. Un son de base, continu et doux. Synthèse provisoire (un enregistrement viendra). Rien à voir avec le vent des
 * autres pièces : pas de sifflement ni de grondement, mais trois couches qui respirent très lentement (des houles de 15 à 30 s) :
 * un souffle creux et grave (bruit rose autour de 240 Hz, dont la hauteur glisse un peu), le sable (bruit blanc entre 2 et 4,5 kHz,
 * très bas, qui ne vit que sur le sommet des houles) et un fond sourd. Tout passe sous 4,5 kHz.
 */
export default function dunes(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.loopOrChannel(loops.dunes, out, () => {
    const { gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 4500, 0.5)).connect(out)
    // les houles : des gains lents qui ne retombent jamais en phase (périodes de 14 à 31 s)
    const swell = (target: AudioParam, depth: number, rates: number[]) => {
      for (const r of rates) {
        const lfo = osc('sine', r)
        lfo.connect(gain(depth * (0.5 + r * 2))).connect(target)
        lfo.start()
      }
    }
    // le souffle creux : une bande étroite et grave dont le centre glisse
    const body = biq('bandpass', 240, 1.4), bodyGain = gain(0.42)
    loop(noise.pink, rand(0, 5)).connect(body).connect(bodyGain).connect(bus)
    swell(bodyGain.gain, 0.2, [0.033, 0.047])
    swell(body.frequency, 70, [0.037, 0.083])
    // un second souffle, plus haut et plus voilé, qui accompagne le premier avec du retard
    const veil = biq('bandpass', 620, 0.9), veilGain = gain(0.13)
    loop(noise.pink, rand(0, 5)).connect(veil).connect(veilGain).connect(bus)
    swell(veilGain.gain, 0.08, [0.029, 0.061])
    swell(veil.frequency, 160, [0.043])
    // le sable qui file : un grain très fin, à peine là, qui ne vit que sur le sommet de la houle
    const sand = biq('bandpass', 3000, 0.45), sandGain = gain(0.03)
    loop(noise.white, rand(0, 5)).connect(biq('highpass', 1800, 0.6)).connect(sand).connect(sandGain).connect(bus)
    swell(sandGain.gain, 0.03, [0.033, 0.047])
    swell(sand.frequency, 500, [0.051])
    // le fond sourd de l'air immense
    loop(noise.brown, rand(0, 5)).connect(biq('lowpass', 110, 0.6)).connect(gain(0.3)).connect(bus)
  })
}
