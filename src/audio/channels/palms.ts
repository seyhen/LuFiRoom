import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import type { Kit } from '../engine'

/**
 * Les palmes du palmier qui bruissent dans la brise du soir : un chuintement long, rond et feutré, qui monte et retombe avec les
 * souffles (houles de 7 à 20 s). Un son de base, continu et doux. Synthèse provisoire (un enregistrement viendra). Pas de froissement :
 * deux bandes de bruit (le bois souple des palmes vers 1,1 kHz, le chuchotement des folioles vers 2,4 kHz) dont le niveau vit au gré
 * des souffles et qui frémissent à peine (un battement de 5 à 8 Hz, très peu profond), sur un souffle grave. Tout passe sous 3,6 kHz.
 */
export default function palms(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.loopOrChannel(loops.palms, out, () => {
    const { gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 3600, 0.5)).connect(out)
    const lfo = (target: AudioParam, rate: number, depth: number) => {
      const o = osc('sine', rate)
      o.connect(gain(depth)).connect(target)
      o.start()
    }
    // [source, centre, Q, niveau, houles (Hz), battement (Hz, profondeur)]
    const layers = [
      [noise.pink, 1100, 0.6, 0.3, [0.05, 0.083], [5.3, 0.05]],
      [noise.white, 2400, 0.55, 0.075, [0.071, 0.137], [7.1, 0.025]],
      [noise.pink, 520, 0.7, 0.2, [0.043, 0.067], [0, 0]],
    ] as const
    for (const [src, f, q, lvl, rates, [flutter, fd]] of layers) {
      const am = gain(lvl)
      loop(src, rand(0, 5)).connect(biq('bandpass', f, q)).connect(am).connect(bus)
      for (const r of rates) lfo(am.gain, r, lvl * 0.55)
      if (flutter > 0) lfo(am.gain, flutter, lvl * fd * 4)
    }
    // le souffle qui porte les palmes, très bas
    loop(noise.brown, rand(0, 5)).connect(biq('lowpass', 160, 0.6)).connect(gain(0.14)).connect(bus)
  })
}
