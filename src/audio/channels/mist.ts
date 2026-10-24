import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * Le diffuseur d'huiles de la chambre. Enregistré, ou synthétisé : le souffle très doux d'un brumisateur à ultrasons (un voile de
 * bruit rose aigu qui respire lentement) et, dessous, le ronflement sourd de la petite pompe.
 */
export default function mist(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  return kit.loopOrChannel(loops.mist, out, () => {
    const am = gain(1)
    loop(noise.pink, 0).connect(biq('bandpass', 4200, 0.45)).connect(gain(0.1)).connect(am)
    loop(noise.pink, 2.1).connect(biq('lowpass', 700, 0.5)).connect(gain(0.05)).connect(am)
    const lfo = osc('sine', 0.13)
    lfo.connect(gain(0.25)).connect(am.gain)
    lfo.start()
    const hum = osc('sine', 96)
    hum.connect(gain(0.01)).connect(out)
    hum.start()
    am.connect(out)
  })
}
