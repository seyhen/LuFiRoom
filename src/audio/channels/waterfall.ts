import type { Room } from '../../rooms/types'
import type { Channel, Kit } from '../engine'

/**
 * La cascade de l'onsen : l'eau de la montagne qui tombe au loin, un grand souffle large et grave. Enregistrée, ou
 * synthétisée : un bruit rose et un bruit brun filtrés, qui respirent très lentement.
 */
export default function waterfall(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.waterfall, out, () => {
    const { gain, biq, osc, loop, noise } = kit
    const body = gain(0.2)
    loop(noise.pink, 0).connect(biq('lowpass', 1400, 0.4)).connect(body).connect(out)
    loop(noise.brown, 2.1).connect(biq('lowpass', 300, 0.5)).connect(gain(0.35)).connect(out)
    const lfo = osc('sine', 0.06)
    lfo.connect(gain(0.05)).connect(body.gain)
    lfo.start()
  })
}
