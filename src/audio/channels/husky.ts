import type { Room } from '../../rooms/types'
import type { Channel, Kit } from '../engine'

/**
 * Le husky qui dort, roulé sur la peau près du réchaud : son souffle lent, long, qui monte et retombe. Enregistré, ou
 * synthétisé : un souffle de bruit rose, filtré mat, gonflé par un balancement de cinq secondes.
 */
export default function husky(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.husky, out, () => {
    const { gain, biq, osc, loop, noise } = kit
    const breath = gain(0.1)
    loop(noise.pink, 0).connect(biq('lowpass', 700, 0.6)).connect(breath).connect(out)
    const lfo = osc('sine', 0.2)
    lfo.connect(gain(0.09)).connect(breath.gain)
    lfo.start()
  })
}
