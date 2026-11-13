import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * La gouttière de la laverie, derrière la vitrine : l'eau de pluie qui court dans le tuyau et se perd au pied de l'immeuble.
 * Enregistré, ou synthétisé : un ruissellement continu et rond (bruit rose resserré autour de 700 Hz) qui se promène lentement,
 * un gargouillis grave et sourd comme dans un tuyau (bruit étroit autour de 380 Hz qui respire), un filet plus clair au-dessus,
 * et la résonance basse du tuyau. Continu et doux : pas de goutte isolée.
 */
export default function gutter(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  return kit.loopOrChannel(loops.gutter, out, () => {
    const bus = gain(1)
    bus.connect(biq('lowpass', 3200, 0.5)).connect(out)
    // le ruissellement
    const run = gain(0.1)
    loop(noise.pink, 0.9).connect(biq('bandpass', 700, 1.1)).connect(run).connect(bus)
    const wander = osc('sine', 0.07)
    wander.connect(gain(0.03)).connect(run.gain)
    wander.start()
    // le gargouillis dans le tuyau
    const gurgle = gain(0.045)
    loop(noise.pink, 3.4).connect(biq('bandpass', 380, 3)).connect(gurgle).connect(bus)
    const chuckle = osc('sine', 0.29)
    chuckle.connect(gain(0.03)).connect(gurgle.gain)
    chuckle.start()
    // le filet clair
    const trickle = gain(0.03)
    loop(noise.pink, 5.2).connect(biq('bandpass', 2300, 0.9)).connect(trickle).connect(bus)
    const lilt = osc('sine', 0.21)
    lilt.connect(gain(0.015)).connect(trickle.gain)
    lilt.start()
    // la résonance du tuyau
    const pipe = gain(0.09)
    loop(noise.brown, 1.7).connect(biq('lowpass', 190, 0.7)).connect(pipe).connect(bus)
  })
}
