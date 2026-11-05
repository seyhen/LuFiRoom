import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

// Le geste, en secondes depuis le début (scene/laundromat/FoldingTable.tsx le montre aux mêmes instants) : secouer, poser,
// lisser deux fois, plier.
const SHAKE = 0.05, LAND = 0.62, PATS = [0.95, 1.25], FOLD = 1.55

/**
 * Le linge qu'on plie sur la grande table. Enregistré, ou synthétisé : toutes les huit à douze secondes, une serviette sèche qu'on
 * secoue (un claquement de tissu doux, qui bat vite puis se calme), qu'on pose à plat (un souffle), qu'on lisse du plat de la main
 * deux fois (deux « pff » feutrés), puis qu'on plie (le tissu qui glisse sur lui-même).
 */
export default function fold(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.shotsOr(loops.fold, out, { gap: [7, 11], rate: 0.04, level: 0.15 }, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(2.5)
    bus.connect(biq('lowpass', 3400, 0.5)).connect(out)
    function cloth(t: number, len: number, peak: number, attack: number, f: BiquadFilterNode, src = noise.pink) {
      const s = ctx.createBufferSource(), g = gain(0.0001)
      s.buffer = src
      s.start(t, rand(0, 5))
      s.stop(t + len + 0.05)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(peak, t + attack)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      s.connect(f).connect(g).connect(bus)
      return g
    }
    function gesture(t0: number) {
      // la secousse : le tissu qui claque, battu vite puis de moins en moins
      const t = t0 + SHAKE, flap = gain(1)
      const shake = cloth(t, 0.45, 0.22, 0.03, biq('bandpass', 1100, 0.7), noise.white)
      shake.disconnect()
      shake.connect(flap).connect(bus)
      const am = osc('sine', rand(12, 15))
      am.frequency.setValueAtTime(am.frequency.value, t)
      am.frequency.linearRampToValueAtTime(6, t + 0.45)
      am.connect(gain(0.6)).connect(flap.gain)
      am.start(t)
      am.stop(t + 0.5)
      // posée à plat
      cloth(t0 + LAND, 0.22, 0.12, 0.02, biq('lowpass', 600, 0.7))
      // lissée deux fois du plat de la main
      for (const at of PATS) cloth(t0 + at, 0.12, 0.09, 0.008, biq('lowpass', 800, 0.7))
      // pliée : le tissu qui glisse sur lui-même, sa couleur qui monte un peu
      const f = biq('bandpass', 700, 0.9)
      f.frequency.setValueAtTime(700, t0 + FOLD)
      f.frequency.linearRampToValueAtTime(1400, t0 + FOLD + 0.55)
      cloth(t0 + FOLD, 0.6, 0.1, 0.25, f)
      pulse(ctx, 'fold', t0)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(0.5, 1.5)
      while (next < until) {
        gesture(next)
        next += rand(8, 12)
      }
    }, 200)
  })
}
