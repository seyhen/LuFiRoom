import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Les enseignes au néon : le bourdonnement du transformateur (le secteur à 100 Hz et ses harmoniques), un grésillement fin
 * dans le tube, un sifflement très aigu qu'on perçoit plus qu'on ne l'entend. Parfois un tube hésite : le son s'étrangle, claque
 * deux ou trois fois et revient. Enregistré, ou synthétisé.
 */
export default function neon(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.neon, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(out)
    // tout ce qui bourdonne passe par `lit` : c'est lui qui s'étrangle quand le tube hésite
    const lit = gain(1)
    lit.connect(bus)
    const saw = osc('sawtooth', 100)
    saw.connect(biq('lowpass', 640, 0.9)).connect(gain(0.1)).connect(lit)
    const sq = osc('square', 200)
    sq.connect(biq('lowpass', 900, 0.7)).connect(gain(0.018)).connect(lit)
    saw.start()
    sq.start()
    const buzz = gain(0.016)
    loop(noise.white, 1.6).connect(biq('bandpass', 1900, 3)).connect(buzz).connect(lit)
    const flutter = osc('sine', 100)
    flutter.connect(gain(0.012)).connect(buzz.gain)
    flutter.start()
    const whine = osc('sine', 3100)
    whine.connect(gain(0.004)).connect(lit)
    const wob = osc('sine', 0.4)
    wob.connect(gain(40)).connect(whine.frequency)
    whine.start()
    wob.start()

    function tick(t: number, v: number) {
      const s = ctx.createBufferSource(), g = gain(0.0001)
      s.buffer = noise.white
      s.start(t, rand(0, 3))
      s.stop(t + 0.03)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v, t + 0.001)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.02)
      s.connect(biq('bandpass', 3600, 1.5)).connect(g).connect(bus)
    }
    /** Le tube hésite : le bourdonnement tombe, remonte, tombe, claque au rallumage. */
    function flicker(t: number) {
      let at = t
      for (let i = 0, n = 2 + ((Math.random() * 3) | 0); i < n; i++) {
        const off = rand(0.04, 0.12), on = rand(0.05, 0.2)
        lit.gain.setValueAtTime(1, at)
        lit.gain.linearRampToValueAtTime(0.12, at + 0.01)
        lit.gain.setValueAtTime(0.12, at + off)
        lit.gain.linearRampToValueAtTime(1, at + off + 0.012)
        tick(at + off, rand(0.05, 0.12))
        at += off + on
      }
    }

    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(3, 7)
      while (next < until) {
        flicker(next)
        next += rand(7, 16)
      }
    }, 250)
  })
}
