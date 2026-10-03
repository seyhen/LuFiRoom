import { useStore } from '../../state/store'
import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * La ville vue d'un toit. Enregistrée, ou synthétisée : la rumeur continue des avenues, des klaxons lointains qui rebondissent
 * entre les immeubles, et de loin en loin une sirène qui passe. Le jour, plus de klaxons ; la nuit, la rumeur baisse.
 */
export default function city(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.city, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1.6)
    bus.connect(out)
    const canyon = ctx.createConvolver()
    canyon.buffer = impulse(ctx, 2.4, 2.5)
    canyon.connect(gain(0.5)).connect(bus)
    // La rumeur : un fond grave et large, qui ondule lentement ; un peu moins fort la nuit.
    const hum = gain(0.38)
    loop(noise.brown, 2.3).connect(biq('lowpass', 300, 0.5)).connect(hum).connect(bus)
    loop(noise.pink, 5.6).connect(biq('bandpass', 700, 0.5)).connect(gain(0.3)).connect(hum)
    const wave = osc('sine', 0.05)
    wave.connect(gain(0.06)).connect(hum.gain)
    wave.start()
    const level = () => hum.gain.setTargetAtTime(useStore.getState().night ? 0.28 : 0.4, ctx.currentTime, 1)
    level()
    useStore.subscribe((s, p) => s.night !== p.night && level())

    function far(pan: number) {
      const p = ctx.createStereoPanner(), lp = biq('lowpass', rand(1200, 2200), 0.6)
      p.pan.value = pan
      lp.connect(p)
      p.connect(bus)
      p.connect(canyon)
      return lp
    }
    /** Un klaxon : deux notes à la tierce, court ou insistant. */
    function horn(t: number) {
      const dest = far(rand(-0.9, 0.9)), f = rand(330, 440), n = Math.random() < 0.3 ? 2 : 1, v = rand(0.018, 0.04)
      for (let k = 0; k < n; k++) {
        const at = t + k * 0.32, dur = rand(0.15, 0.5)
        for (const ratio of [1, 1.26]) {
          const o = osc('sawtooth', f * ratio), g = gain(0.0001)
          g.gain.setValueAtTime(0.0001, at)
          g.gain.exponentialRampToValueAtTime(v, at + 0.02)
          g.gain.setValueAtTime(v, at + dur - 0.04)
          g.gain.exponentialRampToValueAtTime(0.0001, at + dur)
          o.connect(g).connect(dest)
          o.start(at)
          o.stop(at + dur + 0.02)
        }
      }
    }
    /** Une sirène qui traverse au loin : le hululement monte et descend, le volume enfle et retombe. */
    function siren(t: number) {
      const dur = rand(9, 14), dest = far(rand(-0.5, 0.5)), o = osc('sine', 700), g = gain(0.0001), lfo = osc('sine', rand(0.25, 0.4))
      lfo.connect(gain(330)).connect(o.frequency)
      o.frequency.setValueAtTime(950, t)
      o.frequency.linearRampToValueAtTime(880, t + dur)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.03, t + dur * 0.45)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      o.connect(g).connect(dest)
      for (const n of [o, lfo]) { n.start(t); n.stop(t + dur + 0.05) }
    }
    let nextHorn = 0, nextSiren = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime, night = useStore.getState().night
      if (nextHorn < now) nextHorn = now + rand(0.5, 3)
      if (nextSiren < now) nextSiren = now + rand(15, 40)
      while (nextHorn < until) {
        horn(nextHorn)
        nextHorn += night ? rand(6, 16) : rand(2.5, 8)
      }
      while (nextSiren < until) {
        siren(nextSiren)
        nextSiren += night ? rand(35, 70) : rand(60, 120)
      }
    }, 150)
  })
}
