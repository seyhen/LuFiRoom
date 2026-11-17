import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * Le clapotis de l’eau contre la coque de la barque : de petites vagues qui tapotent la coque et le bois, très doucement. Enregistré (24 s, joué
 * en segments tirés au hasard : on n'entend pas la boucle revenir), ou synthétisé : un bruit rose resserré autour de 900 Hz
 * dont le niveau respire au rythme de la houle, et un souffle grave dessous. Continu et doux : pas de claque isolée.
 */
export default function lapping(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  return kit.grainsOr(loops.lapping, out, { len: [7, 12], fade: 2, rate: 0.03, level: 0.15 }, () => {
    const slap = gain(0.08)
    loop(noise.pink, 0.8).connect(biq('bandpass', 900, 0.9)).connect(slap).connect(out)
    const swell = osc('sine', 0.17)
    swell.connect(gain(0.05)).connect(slap.gain)
    swell.start()
    loop(noise.brown, 2.3).connect(biq('lowpass', 240, 0.6)).connect(gain(0.2)).connect(out)
  })
}
