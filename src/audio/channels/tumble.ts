import type { Room } from '../../rooms/types'
import type { Channel, Kit } from '../engine'

/**
 * Le sèche-linge de la laverie. Enregistré, ou synthétisé : un ronronnement chaud et sourd (le tambour, un bruit brun très grave),
 * le souffle de l'air chaud par-dessus. Un son de base, continu et doux : aucun bruitage ponctuel (ni « toum », ni boutons qui cliquettent).
 */
export default function tumble(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.tumble, out, () => {
    const { gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(out)
    // le tambour qui roule, balancé par le tour (un tour toutes les 1,75 s)
    const roll = gain(0.6)
    loop(noise.brown, 1.3).connect(biq('lowpass', 170, 0.7)).connect(roll).connect(bus)
    const turn = osc('sine', 0.57)
    turn.connect(gain(0.12)).connect(roll.gain)
    turn.start()
    // l'air chaud qui souffle
    const air = gain(0.05)
    loop(noise.pink, 3.1).connect(biq('bandpass', 1000, 0.5)).connect(biq('lowpass', 2200, 0.5)).connect(air).connect(bus)
    // le moteur, très bas
    const m = osc('sine', 58)
    m.connect(gain(0.008)).connect(bus)
    m.start()
  })
}
