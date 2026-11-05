import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { pulse, scheduled } from '../events'
import { useStore } from '../../state/store'
import type { Channel, Kit } from '../engine'

/** Les instants où les pièces d'une poignée tombent dans le bac, depuis le déclic (les mêmes que scene/laundromat/Changer.tsx). */
export const COIN_AT = [0.16, 0.29, 0.37, 0.5, 0.57, 0.68]

/**
 * Le monnayeur de la laverie. Enregistré, ou synthétisé : de loin en loin (toutes les quinze à trente secondes), on fait de la
 * monnaie. Le mécanisme compte (un déclic sourd), puis trois à six pièces glissent dans le bac d'inox, l'une après l'autre : de petits
 * tintements ronds et brefs, assourdis (pas de cliquetis vif), puis les pièces se couchent dans un frottement. La scène fait tomber
 * les pièces au même instant ; leur nombre se lit des deux côtés sur le compteur `pulses.coins` (3 + compteur % 4).
 */
export default function coins(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.shotsOr(loops.coins, out, { gap: [15, 30], rate: 0.05, level: 0.15 }, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(2)
    bus.connect(biq('lowpass', 4200, 0.5)).connect(out)
    function burst(t: number, len: number, peak: number, f: BiquadFilterNode) {
      const s = ctx.createBufferSource(), g = gain(0.0001)
      s.buffer = noise.pink
      s.start(t, rand(0, 5))
      s.stop(t + len + 0.05)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(peak, t + 0.004)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      s.connect(f).connect(g).connect(bus)
    }
    /** Une pièce qui tombe dans le bac : trois partiels inharmoniques qui s'éteignent vite, et le petit choc. */
    function coin(t: number, v: number) {
      const f0 = rand(1500, 2100)
      for (const [mul, amp, len] of [[1, 1, 0.22], [2.32, 0.35, 0.12], [3.7, 0.15, 0.07]] as const) {
        const o = osc('sine', f0 * mul * rand(0.99, 1.01)), g = gain(0.0001)
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(0.06 * amp * v, t + 0.002)
        g.gain.exponentialRampToValueAtTime(0.0001, t + len)
        o.connect(g).connect(bus)
        o.start(t)
        o.stop(t + len + 0.02)
      }
      burst(t, 0.04, 0.12 * v, biq('bandpass', 1200, 1.2))
    }
    function handful(t0: number) {
      const n = 3 + ((useStore.getState().pulses.coins ?? 0) % 4)
      // le mécanisme qui compte : un déclic grave et mat
      const o = osc('sine', 120), g = gain(0.0001)
      g.gain.setValueAtTime(0.0001, t0)
      g.gain.exponentialRampToValueAtTime(0.12, t0 + 0.005)
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.09)
      o.connect(g).connect(bus)
      o.start(t0)
      o.stop(t0 + 0.1)
      burst(t0, 0.06, 0.1, biq('lowpass', 700, 0.7))
      for (let i = 0; i < n; i++) coin(t0 + COIN_AT[i], 1 - i * 0.08)
      // les pièces qui se couchent, un frottement doux
      burst(t0 + COIN_AT[n - 1] + 0.08, 0.35, 0.05, biq('bandpass', 2600, 0.8))
      pulse(ctx, 'coins', t0)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(0.8, 2)
      while (next < until) {
        handful(next)
        next += rand(15, 30)
      }
    }, 200)
  })
}
