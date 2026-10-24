import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Kit } from '../engine'

/**
 * Le parapluie qui s'égoutte, près de la porte du café. Enregistré (une goutte tous les 1,5 à 4 s), ou synthétisé : une goutte est un
 * sinus court qui descend de 1 200 à 600 Hz, à l'attaque douce, suivi d'un peu de réverbération de pièce (un écho court et sombre).
 */
export default function drip(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.shotsOr(loops.drip, out, { gap: [1.5, 4], rate: 0.08, level: 0.2 }, () => {
    const { ctx, gain, biq, osc } = kit
    const bus = gain(7)
    bus.connect(out)
    // la « réverbération » : un écho court qui se répète en s'assombrissant
    const echo = ctx.createDelay(0.5), fb = gain(0.32), tone = biq('lowpass', 1800, 0.5)
    echo.delayTime.value = 0.083
    echo.connect(tone).connect(fb).connect(echo)
    tone.connect(bus)
    function plop(t: number) {
      const f = rand(1050, 1300), o = osc('sine', f), g = gain(0.0001)
      o.frequency.setValueAtTime(f, t)
      o.frequency.exponentialRampToValueAtTime(f * 0.5, t + 0.12)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(rand(0.05, 0.075), t + 0.012) // attaque douce
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.12)
      o.connect(g)
      g.connect(bus)
      g.connect(echo)
      o.start(t)
      o.stop(t + 0.14)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(0.2, 0.8)
      while (next < until) {
        plop(next)
        next += rand(1.5, 4)
      }
    }, 200)
  })
}
