import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * Le hibou de la clairière : une forêt de nuit calme où un hibou appelle de loin en loin. Enregistré (60 s en boucle), ou
 * synthétisé en attendant : un souffle d'air nocturne très doux (bruit brun resserré) qui respire lentement. Continu : pas d'appel isolé.
 */
export default function owl(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  return kit.loopOrChannel(loops.owl, out, () => {
    const air = gain(0.12)
    loop(noise.brown, 1.6).connect(biq('lowpass', 420, 0.5)).connect(air).connect(out)
    const sway = osc('sine', 0.07)
    sway.connect(gain(0.05)).connect(air.gain)
    sway.start()
  })
}
