import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/** La bibliothèque. Enregistrée, ou synthétisée : des pages qu'on tourne, le tic-tac d'une horloge, un parquet qui craque de temps en temps. */
export default function pages(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.grainsOr(loops.pages, out, { len: [6, 12], fade: 0.5, rate: 0.015, level: 0.15 }, () => {
    const { ctx, gain, biq, osc, noise } = kit
    // Niveau de la synthèse : réglé pour valoir les autres sons du mixeur (des évènements brefs et discrets).
    const bus = gain(4.5)
    bus.connect(out)
    const burst = (t: number, dur: number) => {
      const s = ctx.createBufferSource()
      s.buffer = noise.white
      s.start(t, rand(0, 3))
      s.stop(t + dur + 0.05)
      return s
    }
    // Une page qu'on tourne : un souffle d'air quand elle se soulève, puis le froissement du papier (une dizaine à une vingtaine de
    // petits claquements secs de fibres, de plus en plus serrés), et le tassement sourd de la feuille qui retombe sur les autres.
    function turn(t: number) {
      const dur = rand(0.22, 0.42)
      const air = gain(0.0001), ab = biq('bandpass', 700, 0.8)
      ab.frequency.setValueAtTime(700, t)
      ab.frequency.exponentialRampToValueAtTime(2100, t + dur * 0.7)
      air.gain.setValueAtTime(0.0001, t)
      air.gain.exponentialRampToValueAtTime(rand(0.07, 0.11), t + dur * 0.4)
      air.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      burst(t, dur).connect(ab).connect(air).connect(bus)
      const n = 10 + ((Math.random() * 12) | 0)
      for (let i = 0; i < n; i++) {
        const k = i / n, at = t + dur * (0.15 + 0.85 * Math.pow(k, 0.7)) + rand(0, 0.012), g = gain(0.0001), len = rand(0.003, 0.009)
        g.gain.setValueAtTime(0.0001, at)
        g.gain.exponentialRampToValueAtTime(rand(0.05, 0.16) * (0.5 + k * 0.5), at + 0.0008)
        g.gain.exponentialRampToValueAtTime(0.0001, at + len)
        burst(at, len).connect(biq('bandpass', rand(2600, 7200), 1.1)).connect(g).connect(bus)
      }
      const tt = t + dur * 1.02, pg = gain(0.0001)
      pg.gain.setValueAtTime(0.0001, tt)
      pg.gain.exponentialRampToValueAtTime(0.1, tt + 0.008)
      pg.gain.exponentialRampToValueAtTime(0.0001, tt + 0.11)
      burst(tt, 0.12).connect(biq('lowpass', 420, 0.8)).connect(pg).connect(bus)
    }
    // Tic, tac : un petit clic sec, plus grave au « tac ».
    function tick(t: number, tock: boolean) {
      const g = gain(0.0001), o = osc('sine', tock ? 1500 : 1950)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(tock ? 0.025 : 0.03, t + 0.002)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
      o.connect(g).connect(bus)
      o.start(t)
      o.stop(t + 0.06)
      const n = burst(t, 0.03), ng = gain(0.03)
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.03)
      n.connect(biq('highpass', 2500, 0.7)).connect(ng).connect(bus)
    }
    // Un parquet qui craque : une scie grave et très résonante qui glisse vers le bas.
    function creak(t: number) {
      const o = osc('sawtooth', rand(150, 220)), bp = biq('bandpass', 180, 22), g = gain(0.0001), dur = rand(0.25, 0.5)
      o.frequency.setValueAtTime(rand(170, 230), t)
      o.frequency.exponentialRampToValueAtTime(rand(110, 150), t + dur)
      bp.frequency.setValueAtTime(240, t)
      bp.frequency.exponentialRampToValueAtTime(130, t + dur)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.05, t + dur * 0.3)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      o.connect(bp).connect(g).connect(bus)
      o.start(t)
      o.stop(t + dur + 0.05)
    }

    let nextPage = 0, nextTick = 0, nextCreak = 0, tock = false
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (nextPage < now) nextPage = now + rand(0.4, 1.8)
      if (nextTick < now) nextTick = now + 0.1
      if (nextCreak < now) nextCreak = now + rand(6, 14)
      while (nextPage < until) {
        turn(nextPage)
        if (Math.random() < 0.3) turn(nextPage + rand(0.6, 1.1)) // parfois deux pages de suite
        nextPage += rand(2.8, 7)
      }
      while (nextTick < until) {
        tick(nextTick, tock)
        tock = !tock
        nextTick += 1
      }
      while (nextCreak < until) {
        creak(nextCreak)
        nextCreak += rand(15, 32)
      }
    })
  })
}
