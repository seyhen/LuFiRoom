import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * L'accordéoniste du toit voisin : une valse lente qui monte d'une cour de Paris. Enregistrée (50 s en boucle),
 * ou synthétisée : des anches (dents de scie filtrées) en accord de ré mineur, dont le souffle du soufflet gonfle et retombe.
 */
export default function accordion(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc } = kit
  return kit.loopOrChannel(loops.accordion, out, () => {
    const lp = biq('lowpass', 900, 0.6), bus = gain(0.04)
    lp.connect(bus).connect(out)
    for (const f of [146.8, 174.6, 220, 293.7]) {
      const o = osc('sawtooth', f), det = osc('sawtooth', f * 1.006)
      o.connect(gain(0.16)).connect(lp)
      det.connect(gain(0.16)).connect(lp)
      o.start(); det.start()
    }
    const bellows = osc('sine', 0.11)
    bellows.connect(gain(0.025)).connect(bus.gain)
    bellows.start()
  })
}
