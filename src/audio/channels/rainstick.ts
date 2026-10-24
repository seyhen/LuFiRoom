import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Kit } from '../engine'

/**
 * Le bâton de pluie de la plage. Enregistré, ou synthétisé : des milliers de petits grains qui dévalent le bambou, un crépitement
 * fin et clair qui enfle et s'éteint (une dizaine de secondes), puis un silence, et le bâton qu'on retourne.
 */
export default function rainstick(kit: Kit, out: GainNode, { loops }: Room) {
  const { ctx, gain, biq, noise } = kit
  return kit.loopOrChannel(loops.rainstick, out, () => {
    const bus = gain(7)
    bus.connect(out)
    function pour(t: number, dur: number) {
      const s = ctx.createBufferSource(), mod = ctx.createBufferSource(), g = gain(0.0001), gate = gain(0.5)
      s.buffer = noise.white
      mod.buffer = noise.white
      s.loop = mod.loop = true
      s.start(t, rand(0, 4))
      mod.start(t, rand(0, 4))
      s.stop(t + dur + 0.1)
      mod.stop(t + dur + 0.1)
      // le crépitement : un bruit lent qui ouvre et ferme le souffle, grain après grain
      mod.connect(biq('lowpass', 70, 0.5)).connect(gain(9)).connect(gate.gain)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.07, t + dur * 0.35)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      s.connect(biq('bandpass', rand(4200, 5400), 0.7)).connect(gate).connect(g).connect(bus)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.2
      while (next < until) {
        const dur = rand(7, 10)
        pour(next, dur)
        next += dur + rand(1.5, 4)
      }
    }, 200)
  })
}
