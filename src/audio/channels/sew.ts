import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { pulse, scheduled } from '../events'
import type { Kit } from '../engine'

/**
 * La moufle qu'on coud dans l'igloo. Enregistrée, ou synthétisée : un point toutes les deux à trois secondes. L'aiguille entre
 * dans la peau (un petit « tok » feutré, très bref), puis le fil glisse et se tend (un souffle de tissu qui monte et s'efface, sans
 * aigu). De temps en temps, une pause plus longue : on regarde son ouvrage.
 */
export default function sew(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.grainsOr(loops.sew, out, { len: [8, 14], fade: 0.8, rate: 0.02, level: 0.15 }, () => {
    const { ctx, gain, biq, noise } = kit
    const bus = gain(45)
    bus.connect(out)
    function burst(t: number, len: number, peak: number, filter: BiquadFilterNode, attack: number) {
      const s = ctx.createBufferSource(), g = gain(0.0001)
      s.buffer = noise.white
      s.start(t, rand(0, 4))
      s.stop(t + len + 0.05)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(peak, t + attack)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      s.connect(filter).connect(g).connect(bus)
    }
    function stitch(t: number) {
      // l'aiguille qui pique : un bruit très court, sourd
      burst(t, 0.05, 0.05, biq('lowpass', 1300, 0.6), 0.004)
      // le fil qui glisse : un souffle dont la couleur monte un peu, comme le fil qui se tend
      const pull = rand(0.55, 0.85), f = biq('bandpass', 1500, 1.4)
      f.frequency.setValueAtTime(1300, t + 0.18)
      f.frequency.linearRampToValueAtTime(rand(2100, 2500), t + 0.18 + pull)
      burst(t + 0.18, pull, 0.035, f, pull * 0.45)
      pulse(ctx, 'sew', t)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.4
      while (next < until) {
        stitch(next)
        next += Math.random() < 0.12 ? rand(5, 8) : rand(2.1, 3.1)
      }
    }, 200)
  })
}
