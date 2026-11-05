import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { pulse, scheduled } from '../events'
import type { Kit } from '../engine'

/** La période d'un aller-retour du hamac, en secondes : la scène (Hammock.tsx) se balance à ce rythme. */
export const SWING = 4.4

/**
 * Le hamac qui se balance entre le tronc et la branche. Enregistré, ou synthétisé : à chaque aller, la toile qui passe dans l'air (un
 * souffle doux de coton, qui monte et retombe), et au bout de la course, la corde qui se tend autour de l'écorce : un petit
 * « mmh » grave et boisé, très court, jamais un grincement (tout sous 900 Hz). Un aller-retour toutes les 4,4 s, comme un bercement.
 * La scène suit les bouts de course qu'on entend.
 */
export default function hammock(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.grainsOr(loops.hammock, out, { len: [9, 14], fade: 0.8, rate: 0.02, level: 0.2 }, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(1)
    bus.connect(out)
    // la toile dans l'air : un bruit rose filtré, qui gonfle au milieu de la course
    function swish(t: number, len: number) {
      const s = ctx.createBufferSource(), f = biq('bandpass', 700, 0.8), g = gain(0.0001)
      s.buffer = noise.pink
      s.start(t, rand(0, 5))
      s.stop(t + len + 0.1)
      f.frequency.setValueAtTime(520, t)
      f.frequency.linearRampToValueAtTime(rand(850, 1000), t + len * 0.5)
      f.frequency.linearRampToValueAtTime(560, t + len)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.11, t + len * 0.5)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      s.connect(f).connect(g).connect(bus)
    }
    // la corde qui se tend : une note grave, frottée, qui glisse un peu vers le bas, étouffée
    function rope(t: number) {
      const f0 = rand(95, 125), o = osc('sawtooth', f0), lp = biq('lowpass', 520, 0.9), body = biq('bandpass', rand(240, 300), 3), g = gain(0.0001)
      const len = rand(0.28, 0.42)
      o.frequency.setValueAtTime(f0, t)
      o.frequency.linearRampToValueAtTime(f0 * 0.9, t + len)
      // le frottement : le niveau tremble, irrégulier
      const jit = ctx.createBufferSource(), jg = gain(0.4)
      jit.buffer = noise.brown
      jit.start(t, rand(0, 5))
      jit.stop(t + len + 0.05)
      jit.connect(biq('lowpass', 40, 0.7)).connect(jg).connect(g.gain)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.06)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      o.connect(lp).connect(body).connect(g).connect(bus)
      o.start(t)
      o.stop(t + len + 0.05)
    }
    let next = 0, side = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.3
      while (next < until) {
        // un bout de course : la corde (pas à chaque fois), puis la toile repart dans l'autre sens
        if (Math.random() < 0.75) rope(next + 0.02)
        swish(next + 0.15, SWING / 2 - 0.3)
        pulse(ctx, 'hammock', next)
        side = 1 - side
        next += SWING / 2
      }
    }, 200)
  })
}
