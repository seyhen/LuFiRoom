import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/** La bibliothèque. Enregistrée, ou synthétisée : des pages qu'on tourne, le tic-tac d'une horloge, un parquet qui craque de temps en temps. */
export default function pages(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.pages, out, () => {
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
    // Une page : un souffle de papier, d'abord un frottement léger puis le claquement doux de la feuille qui retombe.
    function turn(t: number) {
      const dur = rand(0.22, 0.42), bp = biq('bandpass', rand(1600, 2400), 0.7), g = gain(0.0001)
      bp.frequency.setValueAtTime(rand(1600, 2200), t)
      bp.frequency.exponentialRampToValueAtTime(rand(3200, 4800), t + dur)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(rand(0.07, 0.12), t + dur * 0.35)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      burst(t, dur).connect(bp).connect(g).connect(bus)
      const pat = burst(t + dur * 0.8, 0.09), pg = gain(0.0001)
      pg.gain.setValueAtTime(0.0001, t + dur * 0.8)
      pg.gain.exponentialRampToValueAtTime(0.05, t + dur * 0.8 + 0.01)
      pg.gain.exponentialRampToValueAtTime(0.0001, t + dur * 0.8 + 0.09)
      pat.connect(biq('bandpass', 700, 1.2)).connect(pg).connect(bus)
    }
    // Tic, tac : un petit clic sec, plus grave au « tac ».
    function tick(t: number, tock: boolean) {
      const g = gain(0.0001), o = osc('sine', tock ? 1500 : 1950)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(tock ? 0.07 : 0.085, t + 0.002)
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
      if (nextPage < now) nextPage = now + rand(0.5, 2.5)
      if (nextTick < now) nextTick = now + 0.1
      if (nextCreak < now) nextCreak = now + rand(6, 14)
      while (nextPage < until) {
        turn(nextPage)
        if (Math.random() < 0.25) turn(nextPage + rand(0.5, 0.9)) // parfois deux pages de suite
        nextPage += rand(3.5, 9)
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
