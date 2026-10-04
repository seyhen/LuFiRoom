import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le bouillon qui frémit : un bouillonnement sourd et rond, des « blop » épars qui crèvent à la surface, le couvercle qui
 * tinte parfois quand la vapeur le soulève. Enregistré, ou synthétisé.
 */
export default function simmer(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.simmer, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(out)
    // le bouillonnement : un grondement qui roule, plus un clapotis
    const roll = gain(0.55)
    loop(noise.brown, 2.3).connect(biq('lowpass', 280, 0.6)).connect(roll).connect(bus)
    const lap = gain(0.07)
    loop(noise.pink, 1.7).connect(biq('bandpass', 640, 1.1)).connect(lap).connect(bus)
    const slow = osc('sine', 0.23)
    slow.connect(gain(0.04)).connect(lap.gain)
    slow.start()
    loop(noise.white, 0.9).connect(biq('bandpass', 6800, 0.4)).connect(gain(0.008)).connect(bus) // la vapeur

    function blop(t: number) {
      const f = rand(150, 380), o = osc('sine', f), g = gain(0.0001), pan = ctx.createStereoPanner()
      pan.pan.value = rand(-0.4, 0.4)
      o.frequency.setValueAtTime(f, t)
      o.frequency.exponentialRampToValueAtTime(f * 1.45, t + 0.06)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(rand(0.04, 0.12), t + 0.006)
      g.gain.exponentialRampToValueAtTime(0.0001, t + rand(0.07, 0.13))
      o.connect(g).connect(pan).connect(bus)
      o.start(t)
      o.stop(t + 0.2)
    }
    /** Le couvercle soulevé par la vapeur : trois ou quatre petits tintements de métal qui se resserrent. */
    function lid(t: number) {
      const n = 3 + ((Math.random() * 2) | 0), f = rand(1500, 2100)
      let at = t
      for (let i = 0; i < n; i++) {
        const o = osc('sine', f * rand(0.97, 1.03)), g = gain(0.0001)
        g.gain.setValueAtTime(0.0001, at)
        g.gain.exponentialRampToValueAtTime(0.045 * (1 - i * 0.18), at + 0.002)
        g.gain.exponentialRampToValueAtTime(0.0001, at + 0.08)
        o.connect(g).connect(bus)
        o.start(at)
        o.stop(at + 0.1)
        at += 0.11 - i * 0.015
      }
    }

    let next = 0, nextLid = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.1
      if (nextLid < now) nextLid = now + rand(3, 7)
      while (next < until) {
        blop(next)
        next += rand(0.12, 0.5)
      }
      while (nextLid < until) {
        lid(nextLid)
        nextLid += rand(8, 14)
      }
    }, 120)
  })
}
