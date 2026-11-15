import type { Room } from '../../rooms/types'
import type { Channel, Kit } from '../engine'

/**
 * Le réchaud de l'igloo : le gaz qui souffle doucement sous la casserole où fond la neige, et l'eau qui frémit. Enregistré
 * (en grains : la prise est courte), ou synthétisé : un souffle filtré et un petit bouillonnement.
 */
export default function stove(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.grainsOr(loops.stove, out, { len: [12, 20], fade: 2, rate: 0.02, level: 0.1 }, () => {
    const { gain, biq, osc, loop, noise } = kit
    loop(noise.pink, 0).connect(biq('bandpass', 1800, 0.7)).connect(gain(0.2)).connect(out)
    const boil = gain(0.12)
    loop(noise.brown, 1.9).connect(biq('lowpass', 500, 0.6)).connect(boil).connect(out)
    const lfo = osc('sine', 0.23)
    lfo.connect(gain(0.05)).connect(boil.gain)
    lfo.start()
  })
}
