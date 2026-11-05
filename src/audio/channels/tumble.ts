import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le sèche-linge de la laverie. Enregistré, ou synthétisé : un ronronnement chaud et sourd (le tambour, un bruit brun très grave),
 * le souffle de l'air chaud par-dessus ; le linge sec qui retombe deux fois par tour, un « toum » feutré ; et de loin en loin les
 * boutons d'un jean ou une fermeture éclair qui cliquettent doucement contre le tambour (deux ou trois petits « tic » assourdis).
 */
export default function tumble(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.tumble, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(out)
    // le tambour qui roule, balancé par le tour (un tour toutes les 1,75 s)
    const roll = gain(0.6)
    loop(noise.brown, 1.3).connect(biq('lowpass', 170, 0.7)).connect(roll).connect(bus)
    const turn = osc('sine', 0.57)
    turn.connect(gain(0.12)).connect(roll.gain)
    turn.start()
    // l'air chaud qui souffle
    const air = gain(0.05)
    loop(noise.pink, 3.1).connect(biq('bandpass', 1000, 0.5)).connect(biq('lowpass', 2200, 0.5)).connect(air).connect(bus)
    // le moteur, très bas
    const m = osc('sine', 58)
    m.connect(gain(0.008)).connect(bus)
    m.start()
    /** Le linge sec qui retombe : un coup sourd, rond, feutré. */
    function thump(t: number, v: number) {
      const o = osc('sine', rand(62, 80)), g = gain(0.0001)
      o.frequency.setValueAtTime(o.frequency.value * 1.3, t)
      o.frequency.exponentialRampToValueAtTime(o.frequency.value, t + 0.08)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.16 * v, t + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.22)
      o.connect(g).connect(bus)
      o.start(t)
      o.stop(t + 0.25)
      const s = ctx.createBufferSource(), n = gain(0.0001)
      s.buffer = noise.pink
      s.start(t, rand(0, 5))
      s.stop(t + 0.3)
      n.gain.setValueAtTime(0.0001, t)
      n.gain.exponentialRampToValueAtTime(0.12 * v, t + 0.02)
      n.gain.exponentialRampToValueAtTime(0.0001, t + 0.25)
      s.connect(biq('lowpass', 420, 0.7)).connect(n).connect(bus)
    }
    /** Un bouton de jean contre la tôle : un petit « tic » assourdi, sans aigu. */
    function tick(t: number, v: number) {
      const s = ctx.createBufferSource(), g = gain(0.0001)
      s.buffer = noise.white
      s.start(t, rand(0, 4))
      s.stop(t + 0.05)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.05 * v, t + 0.002)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.035)
      s.connect(biq('bandpass', rand(1700, 2300), 2.5)).connect(biq('lowpass', 3000, 0.7)).connect(g).connect(bus)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.2
      while (next < until) {
        if (Math.random() < 0.85) thump(next, rand(0.6, 1))
        if (Math.random() < 0.16) {
          const n = 2 + ((Math.random() * 2) | 0), at = next + rand(0.25, 0.5)
          for (let i = 0; i < n; i++) tick(at + i * rand(0.05, 0.09), 1 - i * 0.25)
        }
        next += 0.875 * rand(0.9, 1.12)
      }
    }, 200)
  })
}
