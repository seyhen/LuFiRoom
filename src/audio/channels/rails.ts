import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le train. Enregistré, ou synthétisé : le roulement sourd de la voiture, le souffle de l'air, et le « ta-dam ta-dam » des
 * roues sur les joints de rail, à peu près toutes les secondes. De temps en temps, un passage à niveau dont la sonnerie
 * passe et s'éloigne, ou un pont qui résonne.
 */
export default function rails(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.rails, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1.3)
    bus.connect(out)
    // La caisse qui roule : grave, avec un balancement lent ; l'air qui glisse sur la voiture.
    const body = gain(0.5)
    loop(noise.brown, 0.4).connect(biq('lowpass', 140, 0.7)).connect(body).connect(bus)
    const sway = osc('sine', 0.31)
    sway.connect(gain(0.08)).connect(body.gain)
    sway.start()
    loop(noise.pink, 2.9).connect(biq('bandpass', 520, 0.6)).connect(gain(0.07)).connect(bus)
    loop(noise.pink, 4.4).connect(biq('bandpass', 1800, 1.2)).connect(gain(0.012)).connect(bus)

    const burst = (t: number, dur: number) => {
      const s = ctx.createBufferSource()
      s.buffer = noise.white
      s.start(t, rand(0, 3))
      s.stop(t + dur + 0.02)
      return s
    }
    /** Une roue sur un joint : un coup sourd et un claquement métallique bref. */
    function clack(t: number, v: number) {
      const o = osc('sine', rand(52, 64)), g = gain(0.0001)
      o.frequency.setValueAtTime(rand(70, 80), t)
      o.frequency.exponentialRampToValueAtTime(45, t + 0.12)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v, t + 0.006)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
      o.connect(g).connect(bus)
      o.start(t)
      o.stop(t + 0.2)
      const ng = gain(0.0001)
      ng.gain.setValueAtTime(0.0001, t)
      ng.gain.exponentialRampToValueAtTime(v * 0.25, t + 0.003)
      ng.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
      burst(t, 0.07).connect(biq('bandpass', rand(900, 1300), 1.5)).connect(ng).connect(bus)
    }
    /** Passage à niveau : la sonnerie approche, passe, s'éloigne en baissant un peu (effet Doppler). */
    function crossing(t: number) {
      const dur = 6, pan = ctx.createStereoPanner(), lvl = gain(0.0001), dir = Math.random() < 0.5 ? -1 : 1
      pan.pan.setValueAtTime(0.9 * dir, t)
      pan.pan.linearRampToValueAtTime(-0.9 * dir, t + dur)
      lvl.gain.setValueAtTime(0.0001, t)
      lvl.gain.exponentialRampToValueAtTime(1, t + dur * 0.45)
      lvl.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      lvl.connect(biq('lowpass', 2600, 0.6)).connect(pan).connect(bus)
      for (let at = t; at < t + dur; at += 0.42) {
        const k = (at - t) / dur, f = k < 0.45 ? 1250 : 1250 * (1 - (k - 0.45) * 0.12)
        for (const ratio of [1, 2.4]) {
          const o = osc('triangle', f * ratio), g = gain(0.0001)
          g.gain.setValueAtTime(0.0001, at)
          g.gain.exponentialRampToValueAtTime(ratio === 1 ? 0.05 : 0.015, at + 0.005)
          g.gain.exponentialRampToValueAtTime(0.0001, at + 0.35)
          o.connect(g).connect(lvl)
          o.start(at)
          o.stop(at + 0.4)
        }
      }
    }
    /** Un pont : le roulement devient creux et plus fort pendant quelques secondes. */
    function bridge(t: number) {
      const dur = rand(5, 8), g = gain(0.0001), s = ctx.createBufferSource()
      s.buffer = noise.brown
      s.loop = true
      s.start(t, rand(0, 5))
      s.stop(t + dur + 0.1)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.35, t + 0.8)
      g.gain.setValueAtTime(0.35, t + dur - 1)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      s.connect(biq('bandpass', 260, 2.5)).connect(g).connect(bus)
    }

    // Une voiture de 26 m à ~90 km/h : un joint toutes les ~1.05 s. Chaque bogie fait « ta-dam » (deux essieux à 2.5 m).
    let next = 0, period = 1.05, nextEvent = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.1
      if (nextEvent < now) nextEvent = now + rand(25, 50)
      while (next < until) {
        const v = rand(0.16, 0.22)
        clack(next, v)
        clack(next + 0.1, v * 0.85)
        clack(next + 0.62, v * 0.8)
        clack(next + 0.72, v * 0.7)
        period += (1.05 - period) * 0.1 + rand(-0.015, 0.015)
        next += period
      }
      while (nextEvent < until) {
        if (Math.random() < 0.55) crossing(nextEvent)
        else bridge(nextEvent)
        nextEvent += rand(40, 90)
      }
    }, 150)
  })
}
