import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * L'arrosoir du toit. Enregistré, ou synthétisé : le filet d'eau qui sort de la pomme (un souffle clair de bruit blanc filtré, dont
 * le timbre bouge lentement) et le clapotis de l'eau qui tombe sur la terre.
 */
export default function watering(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  return kit.loopOrChannel(loops.watering, out, () => {
    const am = gain(1), bp = biq('bandpass', 2200, 0.6)
    loop(noise.white, 0).connect(bp).connect(gain(0.1)).connect(am)
    loop(noise.pink, 3).connect(biq('bandpass', 700, 0.8)).connect(gain(0.1)).connect(am)
    const drift = osc('sine', 0.27), swell = osc('sine', 0.09)
    drift.connect(gain(500)).connect(bp.frequency)
    swell.connect(gain(0.18)).connect(am.gain)
    drift.start()
    swell.start()
    am.connect(out)
  })
}
