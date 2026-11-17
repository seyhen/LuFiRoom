import type { Room } from '../../rooms/types'
import type { Channel, Kit } from '../engine'

/**
 * Le sablier du train : le sable fin qui coule d'un bulbe à l'autre, un chuintement doux et régulier. Enregistré, ou
 * synthétisé : un souffle de bruit blanc filtré dans les aigus doux, à peine ondulé.
 */
export default function sand(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.sand, out, () => {
    const { gain, biq, osc, loop, noise } = kit
    const hiss = gain(0.1)
    loop(noise.white, 0).connect(biq('bandpass', 3200, 0.5)).connect(hiss).connect(out)
    const lfo = osc('sine', 0.17)
    lfo.connect(gain(0.03)).connect(hiss.gain)
    lfo.start()
  })
}
