import type { Room } from '../../rooms/types'
import { fireBuffer } from '../buffers'
import type { Kit } from '../engine'

/** Feu de cheminée. Enregistré, ou synthétisé : un grondement grave qui respire, des craquements, un souffle de flammes. */
export default function fire(kit: Kit, out: GainNode, { loops }: Room) {
  const { ctx, gain, biq, osc, loop, noise } = kit
  kit.loopOr(loops.fire, out, () => {
    // Grondement : le feu qui tire, avec une respiration lente.
    const roar = gain(0.5)
    loop(noise.brown, 4.2).connect(biq('lowpass', 420, 0.5)).connect(roar).connect(out)
    const breath = osc('sine', 0.13)
    breath.connect(gain(0.12)).connect(roar.gain)
    breath.start()
    // Souffle des flammes.
    loop(noise.pink, 2.2).connect(biq('bandpass', 1500, 0.7)).connect(gain(0.05)).connect(out)
    // Craquements.
    loop(fireBuffer(ctx), 0).connect(biq('highpass', 220, 0.5)).connect(gain(0.9)).connect(out)
  })
}
