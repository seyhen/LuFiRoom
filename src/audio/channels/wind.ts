import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/** Vent sur la neige. Enregistré, ou synthétisé : un souffle dont la hauteur et le niveau montent et descendent (rafales), un sifflement fin, un grondement grave. */
export default function wind(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  kit.loopOr(loops.wind, out, () => {
    // Souffle : bruit rose en passe-bande, balayé lentement par deux oscillateurs qui ne retombent jamais en phase.
    const body = biq('bandpass', 520, 0.8), bodyGain = gain(0.55)
    loop(noise.pink, 1.1).connect(body).connect(bodyGain).connect(out)
    // Sifflement fin qui glisse.
    const whistle = biq('bandpass', 1050, 14)
    loop(noise.white, 2.4).connect(whistle).connect(gain(0.05)).connect(out)
    // Grondement.
    loop(noise.brown, 3.3).connect(biq('lowpass', 170, 0.6)).connect(gain(0.5)).connect(out)
    for (const [f, depth, param] of [
      [0.09, 260, body.frequency], [0.23, 110, body.frequency], [0.07, 0.3, bodyGain.gain], [0.05, 220, whistle.frequency], [0.17, 90, whistle.frequency],
    ] as const) {
      const lfo = osc('sine', f)
      lfo.connect(gain(depth)).connect(param)
      lfo.start()
    }
  })
}
