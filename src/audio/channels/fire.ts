import type { Room } from '../../rooms/types'
import { fireBuffer } from '../buffers'
import type { Kit } from '../engine'
import { tune } from '../tune'

/**
 * Feu de cheminée. Enregistré, ou synthétisé : un grondement grave qui respire, des craquements, un souffle de flammes.
 * Chaque foyer a sa voix (`tune.fire` de la fiche) : `roar` (le grondement), `hollow` (sa coupure, Hz : un poêle de fonte
 * creux est plus grave), `flame` (le souffle) et `crackle` (les craquements).
 */
export default function fire(kit: Kit, out: GainNode, room: Room) {
  const { loops } = room
  const { ctx, gain, biq, osc, loop, noise } = kit
  const roarLevel = tune(room, 'fire', 'roar', 0.5), hollow = tune(room, 'fire', 'hollow', 420)
  const flame = tune(room, 'fire', 'flame', 0.05), crackle = tune(room, 'fire', 'crackle', 0.9)
  return kit.loopOrChannel(loops.fire, out, () => {
    // Grondement : le feu qui tire, avec une respiration lente.
    const roar = gain(roarLevel)
    loop(noise.brown, 4.2).connect(biq('lowpass', hollow, 0.5)).connect(roar).connect(out)
    const breath = osc('sine', 0.13)
    breath.connect(gain(roarLevel * 0.24)).connect(roar.gain)
    breath.start()
    // Souffle des flammes.
    loop(noise.pink, 2.2).connect(biq('bandpass', 1500, 0.7)).connect(gain(flame)).connect(out)
    // Craquements.
    loop(fireBuffer(ctx), 0).connect(biq('highpass', 220, 0.5)).connect(gain(crackle)).connect(out)
  })
}
