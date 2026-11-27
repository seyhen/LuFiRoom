import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le bain du capybara : un baquet de bois plein d'eau chaude et de yuzus, où il somnole. À chaque longue respiration, son dos se
 * soulève et l'eau roule lentement contre les douelles (une vague grave et feutrée qui monte et redescend), et de temps en temps un
 * yuzu se cogne doucement à la paroi (un petit « bloup » rond). Le tout dans la petite réverbération d'une pièce carrelée. Un son de
 * base, continu et paresseux : plus lent et plus grave que le filet du robinet. Enregistré, ou synthétisé (provisoire : il se
 * remplacera par un enregistrement). Rien d'aigu : tout est filtré sous 1,6 kHz.
 */
export default function capybara(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.capybara, out, () => {
    const { ctx, gain, biq, loop, noise, osc } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 1600, 0.5)).connect(out)
    const room = ctx.createConvolver()
    room.buffer = impulse(ctx, 1.4, 3.5)
    room.connect(gain(0.3)).connect(bus)
    // le corps de l'eau : un bruit brun, grave, à peine présent entre deux vagues
    loop(noise.brown, rand(0, 3)).connect(biq('lowpass', 380, 0.6)).connect(gain(0.12)).connect(bus)
    // la vague contre les douelles : un bruit rose dans la résonance du baquet, dont le niveau suit chaque respiration
    const wash = gain(0.0001), wood = biq('peaking', 300, 1.2)
    wood.gain.value = 4
    loop(noise.pink, rand(0, 3)).connect(biq('bandpass', 520, 0.8)).connect(wood).connect(wash)
    wash.connect(bus)
    wash.connect(room)

    function breath(t: number, len: number, v: number) {
      const g = wash.gain
      g.setValueAtTime(0.0001, t)
      g.exponentialRampToValueAtTime(v, t + len * 0.38)
      g.exponentialRampToValueAtTime(v * 0.35, t + len * 0.62)
      g.exponentialRampToValueAtTime(0.0001, t + len)
    }
    function bloop(t: number, v: number) {
      const o = osc('sine', 300), g = gain(0.0001), f = rand(260, 340)
      o.frequency.setValueAtTime(f, t)
      o.frequency.exponentialRampToValueAtTime(f * 1.7, t + 0.09)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v, t + 0.012)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.16)
      o.connect(g)
      g.connect(bus)
      g.connect(room)
      o.start(t)
      o.stop(t + 0.2)
    }

    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.2
      while (next < until) {
        const len = rand(3.8, 5.2)
        breath(next, len, rand(0.33, 0.48))
        pulse(ctx, 'capybara', next + len * 0.3)
        if (Math.random() < 0.45) bloop(next + rand(0.8, len - 0.6), rand(0.06, 0.1))
        next += len + rand(0.2, 1.4)
      }
    }, 250)
  })
}
