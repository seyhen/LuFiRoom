import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * La conque du sous-marin. Enregistrée, ou synthétisée : « la mer qu'on entend dans un coquillage », un souffle creux et résonnant
 * (bruit rose passé dans deux filtres étroits) qui monte et redescend comme une houle lointaine.
 */
export default function shell(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  return kit.loopOrChannel(loops.shell, out, () => {
    const am = gain(1), a = biq('bandpass', 420, 3.2), b = biq('bandpass', 760, 4)
    loop(noise.pink, 0).connect(a).connect(gain(0.9)).connect(am)
    loop(noise.pink, 2.7).connect(b).connect(gain(0.5)).connect(am)
    const swell = osc('sine', 0.11), sweep = osc('sine', 0.07)
    swell.connect(gain(0.4)).connect(am.gain)
    sweep.connect(gain(90)).connect(a.frequency)
    swell.start()
    sweep.start()
    am.connect(out)
  })
}
