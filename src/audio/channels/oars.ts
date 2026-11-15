import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * Les avirons d’un pêcheur qui rame au large, sur une eau calme : un coup de rame, l’eau qui goutte de la pelle, le glissement.
 * Enregistré (39 s, joué en segments tirés au hasard : on n'entend pas la boucle revenir), ou synthétisé : un souffle d’eau filtré
 * dont le niveau respire au rythme d’un coup de rame (une vingtaine par minute). Continu et doux : pas de claque isolée.
 */
export default function oars(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  return kit.grainsOr(loops.oars, out, { len: [8, 14], fade: 2, rate: 0.03, level: 0.15 }, () => {
    const dip = gain(0.05)
    loop(noise.pink, 0.8).connect(biq('bandpass', 700, 0.8)).connect(dip).connect(out)
    const stroke = osc('sine', 0.33)
    stroke.connect(gain(0.04)).connect(dip.gain)
    stroke.start()
    loop(noise.brown, 2.3).connect(biq('lowpass', 200, 0.6)).connect(gain(0.12)).connect(out)
  })
}
