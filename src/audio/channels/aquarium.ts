import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/** Le temps que met une bulle à monter de la pierre à air à la surface (la scène la fait monter pendant ce temps-là, `Aquarium.tsx`). */
export const BUBBLE_RISE = 1.1

/**
 * L'aquarium de l'étal : le filet du filtre qui retombe en continu dans l'eau, une houle d'eau sourde dessous, et de loin en loin une
 * bulle de la pierre à air qui éclate à la surface, un « bloup » grave et feutré (plus rond et plus rare que les bulles du sous-marin,
 * qui sont un chapelet). Synthèse provisoire (un enregistrement viendra) : tout passe sous 1,8 kHz, comme à travers une vitre épaisse
 * et un mur d'eau. La scène lâche une bulle à l'instant où elle part (`pulse`), et le « bloup » s'entend quand elle arrive en haut.
 */
export default function aquarium(kit: Kit, out: GainNode, _room: Room): Channel {
  const { ctx, gain, biq, osc, loop, noise } = kit
  const bus = gain(1)
  bus.connect(biq('lowpass', 1800, 0.5)).connect(out)
  // la cuve : une réverbération d'eau, courte et voilée
  const verb = ctx.createConvolver()
  verb.buffer = impulse(ctx, 0.7, 2.6)
  const wet = gain(0.18)
  bus.connect(biq('lowpass', 1200, 0.4)).connect(verb).connect(wet).connect(out)

  // le filet du filtre : un bruit rose voilé qui coule, balancé par deux houles lentes qui ne retombent jamais en phase
  const trickle = gain(0.2)
  loop(noise.pink, rand(0, 4)).connect(biq('bandpass', 850, 0.55)).connect(biq('lowpass', 1500, 0.5)).connect(trickle).connect(bus)
  for (const [r, a] of [[0.13, 0.05], [0.31, 0.03]] as const) {
    const lfo = osc('sine', r)
    lfo.connect(gain(a)).connect(trickle.gain)
    lfo.start()
  }
  // la masse d'eau : un grondement très doux, sans machine
  const body = gain(0.1)
  loop(noise.brown, rand(0, 4)).connect(biq('lowpass', 240, 0.6)).connect(body).connect(bus)
  const swell = osc('sine', 0.09)
  swell.connect(gain(0.035)).connect(body.gain)
  swell.start()

  /** Un bloup : un sinus grave qui monte un peu, attaque douce, queue courte. */
  function bloop(t: number, f: number, a: number) {
    const o = osc('sine', f), g = gain(0.0001), len = rand(0.16, 0.24)
    o.frequency.setValueAtTime(f, t)
    o.frequency.exponentialRampToValueAtTime(f * 1.35, t + 0.07)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(a, t + 0.012)
    g.gain.exponentialRampToValueAtTime(0.0001, t + len)
    o.connect(g).connect(bus)
    o.start(t)
    o.stop(t + len + 0.05)
  }

  let next = 0
  return scheduled(ctx, (until) => {
    const now = ctx.currentTime
    if (next < now) next = now + 0.4
    while (next < until) {
      // la bulle part à `next` (la scène la lâche) et éclate en haut une seconde et quelque plus tard
      pulse(ctx, 'aquarium', next)
      bloop(next + BUBBLE_RISE, rand(150, 230), rand(0.07, 0.11))
      // parfois une deuxième, plus petite, sur ses talons
      if (Math.random() < 0.3) {
        pulse(ctx, 'aquarium', next + 0.3)
        bloop(next + 0.3 + BUBBLE_RISE, rand(230, 300), rand(0.04, 0.06))
      }
      next += rand(1.6, 4.2)
    }
  }, 150)
}
