import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * La machine à café. Enregistrée, ou synthétisée : de temps en temps un café (la mouture, la pompe, l'écoulement, puis le
 * souffle de la vapeur), et des tasses qui tintent sur leur soucoupe entre deux.
 */
export default function espresso(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.espresso, out, () => {
    const { ctx, gain, biq, osc, noise } = kit
    // Niveau de la synthèse : réglé pour valoir les autres sons du mixeur (des évènements brefs, donc plus forts qu'un fond continu).
    const bus = gain(3.2)
    bus.connect(out)
    const hit = (t: number, dur: number) => {
      const s = ctx.createBufferSource()
      s.buffer = noise.white
      s.start(t, rand(0, 3))
      s.stop(t + dur + 0.05)
      return s
    }
    // Un souffle : bruit en passe-bande, qui monte puis retombe.
    function hiss(t: number, dur: number, f: number, q: number, v: number) {
      const g = gain(0.0001)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v, t + 0.25)
      g.gain.setValueAtTime(v, t + dur - 0.5)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      hit(t, dur).connect(biq('bandpass', f, q)).connect(g).connect(bus)
    }
    // Ronflement grave (moulin, pompe) : une scie filtrée dont l'amplitude tremble.
    function hum(t: number, dur: number, f: number, v: number, wobble: number) {
      const o = osc('sawtooth', f), lp = biq('lowpass', 320, 0.7), g = gain(0.0001), w = osc('square', wobble)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v, t + 0.15)
      g.gain.setValueAtTime(v, t + dur - 0.3)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      w.connect(gain(v * 0.35)).connect(g.gain)
      o.connect(lp).connect(g).connect(bus)
      for (const x of [o, w]) {
        x.start(t)
        x.stop(t + dur + 0.1)
      }
    }
    // Une tasse qui tinte : deux ou trois « pings » de porcelaine.
    function clink(t: number) {
      const base = rand(2300, 4200)
      for (let i = 0; i < 1 + ((Math.random() * 3) | 0); i++) {
        const o = osc('sine', base * (1 + i * 0.42)), g = gain(0.0001), at = t + i * rand(0.05, 0.11)
        g.gain.setValueAtTime(0.0001, at)
        g.gain.exponentialRampToValueAtTime(rand(0.04, 0.09), at + 0.003)
        g.gain.exponentialRampToValueAtTime(0.0001, at + rand(0.18, 0.35))
        o.connect(g).connect(bus)
        o.start(at)
        o.stop(at + 0.4)
      }
    }
    function shot(t: number) {
      hum(t, 2.2, 55, 0.06, 38) // le moulin
      hit(t, 2.2).connect(biq('bandpass', 1300, 1.2)).connect(gain(0.05)).connect(bus)
      hum(t + 2.6, 5, 96, 0.05, 11) // la pompe
      hiss(t + 3.2, 4.2, 2800, 0.9, 0.05) // le café qui coule
      if (Math.random() < 0.6) hiss(t + 8.4, 3.2, 4800, 0.6, 0.11) // la vapeur du lait
    }

    let nextShot = 0, nextClink = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (nextShot < now) nextShot = now + rand(1.2, 4)
      if (nextClink < now) nextClink = now + rand(0.4, 2)
      while (nextShot < until) {
        shot(nextShot)
        nextShot += rand(16, 28)
      }
      while (nextClink < until) {
        clink(nextClink)
        nextClink += rand(2.2, 6.5)
      }
    })
  })
}
