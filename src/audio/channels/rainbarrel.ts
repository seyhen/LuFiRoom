import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le tonneau d'eau de pluie, sous la gouttière : un filet d'eau qui tombe sans arrêt dans un tonneau déjà plein. Un son de base,
 * continu et doux. Synthèse provisoire (un enregistrement viendra) : le filet (un bruit rose voilé, qui respire au gré de deux
 * houles lentes), la résonance creuse du tonneau (une bande grave, étroite, qui chante un peu), et le tintement rond des gouttes qui
 * s'enfoncent, irrégulier, jamais le même. Tout passe sous 3 kHz.
 */
export default function rainbarrel(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.rainbarrel, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 2800, 0.5)).connect(out)
    // le filet d'eau
    const stream = gain(0.14)
    loop(noise.pink, rand(0, 4)).connect(biq('bandpass', 1100, 0.6)).connect(stream).connect(bus)
    for (const r of [0.11, 0.29]) {
      const lfo = osc('sine', r)
      lfo.connect(gain(0.04)).connect(stream.gain)
      lfo.start()
    }
    // la résonance creuse du tonneau
    const hollow = gain(0.06)
    loop(noise.brown, rand(0, 4)).connect(biq('bandpass', 230, 7)).connect(hollow).connect(bus)
    const swell = osc('sine', 0.07)
    swell.connect(gain(0.02)).connect(hollow.gain)
    swell.start()
    /** Une goutte qui s'enfonce : un sinus rond qui monte, court. */
    function drop(t: number, f: number, a: number) {
      const o = osc('sine', f), g = gain(0.0001), len = rand(0.09, 0.16)
      o.frequency.setValueAtTime(f, t)
      o.frequency.exponentialRampToValueAtTime(f * 1.5, t + len * 0.5)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(a, t + 0.008)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      o.connect(g).connect(bus)
      o.start(t)
      o.stop(t + len + 0.02)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.05
      while (next < until) {
        drop(next, rand(380, 900), rand(0.012, 0.03))
        next += rand(0.12, 0.45)
      }
    }, 150)
  })
}
