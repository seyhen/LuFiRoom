import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { dropletBuffer, impulse } from '../buffers'
import type { Kit } from '../engine'

/**
 * La source chaude qui coule dans le bassin. Enregistrée, ou synthétisée : le filet d'eau qui tombe du bec de bambou
 * (des résonances qui bougent sans cesse, le « glouglou »), le clapotis du bassin, des gouttes, dans un jardin qui résonne à peine.
 */
export default function spring(kit: Kit, out: GainNode, { loops }: Room) {
  const { ctx, gain, biq, osc, loop, noise } = kit
  kit.loopOr(loops.spring, out, () => {
    const bus = gain(2)
    bus.connect(out)
    const garden = ctx.createConvolver()
    garden.buffer = impulse(ctx, 1.4, 3)
    garden.connect(gain(0.3)).connect(bus)
    // Le filet qui tombe : bruit blanc dans cinq résonances étroites, balayées par des oscillateurs lents et rapides.
    const fall = gain(1)
    fall.connect(bus)
    fall.connect(garden)
    for (let i = 0; i < 5; i++) {
      const f = rand(500, 1700), bp = biq('bandpass', f, rand(7, 12)), g = gain(0.09)
      loop(noise.white, rand(0, 4)).connect(bp).connect(g).connect(fall)
      for (const [rate, depth] of [[rand(3, 9), f * 0.25], [rand(0.2, 0.7), f * 0.15]]) {
        const lfo = osc('sine', rate)
        lfo.connect(gain(depth)).connect(bp.frequency)
        lfo.start()
      }
      const amp = osc('sine', rand(5, 13))
      amp.connect(gain(0.06)).connect(g.gain)
      amp.start()
    }
    // L'éclaboussure sous le filet et le clapotis du bassin.
    loop(noise.pink, 1.4).connect(biq('bandpass', 2200, 0.6)).connect(gain(0.12)).connect(fall)
    loop(noise.brown, 3.1).connect(biq('lowpass', 380, 0.6)).connect(gain(0.2)).connect(bus)
    // Des gouttes, plus graves que celles de la pluie sur une vitre.
    const pk = biq('peaking', 1200, 1)
    pk.gain.value = 6
    loop(dropletBuffer(ctx), 1).connect(biq('lowpass', 3000, 0.5)).connect(pk).connect(gain(0.25)).connect(fall)
  })
}
