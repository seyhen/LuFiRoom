import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/** Ventilateur. Enregistré, ou synthétisé : souffle brun et rose modulé à 7.2 Hz, plus le ronflement du moteur. */
export default function fan(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  kit.loopOr(loops.fan, out, () => {
    const am = gain(1)
    loop(noise.brown, 0).connect(biq('lowpass', 950, 0.5)).connect(gain(0.7)).connect(am)
    loop(noise.pink, 1.3).connect(biq('bandpass', 1900, 0.5)).connect(gain(0.18)).connect(am)
    const lfo = osc('sine', 7.2)
    lfo.connect(gain(0.07)).connect(am.gain)
    lfo.start()
    const hum = osc('sine', 110)
    hum.connect(gain(0.016)).connect(out)
    hum.start()
    am.connect(out)
  })
}
