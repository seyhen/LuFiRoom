import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * Le rinçage du lave-linge de la laverie : le clapotis de l'eau qui va et vient dans le tambour, comme des vaguelettes dans une
 * bassine. Enregistré, ou synthétisé : un souffle d'eau rose (grave et médium) qui monte et retombe tous les six secondes environ,
 * un second plus clair décalé d'un demi-balancement (le va-et-vient), un pétillement très fin d'eau savonneuse, et le fond sourd
 * du tambour qui roule doucement. Continu et doux : aucun bruitage ponctuel.
 */
export default function rinse(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  return kit.loopOrChannel(loops.rinse, out, () => {
    const bus = gain(1)
    bus.connect(biq('lowpass', 3000, 0.5)).connect(out)
    // la vague qui monte contre le hublot
    const swash = gain(0.09)
    loop(noise.pink, 0.4).connect(biq('bandpass', 520, 0.6)).connect(swash).connect(bus)
    const slosh = osc('sine', 0.17)
    slosh.connect(gain(0.07)).connect(swash.gain)
    slosh.start()
    // la vague qui revient, plus claire, à contre-temps (un autre balancement, un peu plus lent)
    const back = gain(0.05)
    loop(noise.pink, 2.7).connect(biq('bandpass', 1500, 0.7)).connect(back).connect(bus)
    const slosh2 = osc('sine', 0.13)
    slosh2.connect(gain(0.04)).connect(back.gain)
    slosh2.start()
    // l'eau savonneuse qui pétille, très fin
    const fizz = gain(0.012)
    loop(noise.white, 1.1).connect(biq('bandpass', 3400, 0.8)).connect(fizz).connect(bus)
    slosh.connect(gain(0.008)).connect(fizz.gain)
    // le tambour qui roule, sourd, balancé par l'eau
    const roll = gain(0.1)
    loop(noise.brown, 3.3).connect(biq('lowpass', 150, 0.7)).connect(roll).connect(bus)
    slosh2.connect(gain(0.04)).connect(roll.gain)
  })
}
