import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * Ventilateur de bureau, à une seule vitesse. Enregistré, ou synthétisé : souffle brun et rose modulé au rythme des pales (7,2 Hz), plus
 * le ronflement du moteur (110 Hz). (Il a eu trois vitesses jusqu'au 2026-11-27 : les pastilles agrandissaient trop le mixeur.)
 */
export default function fan(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  // le moteur : un ronflement grave
  const hum = osc('sine', 110)
  hum.connect(gain(0.016)).connect(out)
  hum.start()
  // la synthèse : le souffle (brun, rose) et le battement des pales
  return kit.grainsOr(loops.fan, out, { len: [8, 14], fade: 1.5, rate: 0.02, level: 0.1 }, () => {
    const am = gain(1)
    loop(noise.brown, 0).connect(biq('lowpass', 950, 0.5)).connect(gain(0.7)).connect(am)
    loop(noise.pink, 1.3).connect(biq('bandpass', 1900, 0.5)).connect(gain(0.18)).connect(am)
    const lfo = osc('sine', 7.2)
    lfo.connect(gain(0.07)).connect(am.gain)
    lfo.start()
    am.connect(out)
  })
}
