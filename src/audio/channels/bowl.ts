import type { Room } from '../../rooms/types'
import type { Channel, Kit } from '../engine'

/**
 * Le bol chantant de l'atelier : une note longue qui vibre et s'efface, puis une autre. Enregistré, ou synthétisé : deux sinus
 * à peine désaccordés (le battement lent du bol) dont le niveau gonfle et retombe.
 */
export default function bowl(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.bowl, out, () => {
    const { gain, osc } = kit
    const am = gain(0.08)
    am.connect(out)
    for (const f of [261.6, 262.9]) {
      const o = osc('sine', f)
      o.connect(am)
      o.start()
    }
    const lfo = osc('sine', 0.09)
    lfo.connect(gain(0.06)).connect(am.gain)
    lfo.start()
  })
}
