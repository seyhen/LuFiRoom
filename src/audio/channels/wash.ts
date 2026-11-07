import type { Room } from '../../rooms/types'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

// Un tour de tambour dans un sens (s), puis la pause avant qu'il reparte dans l'autre : la scène tourne au même rythme
// (scene/laundromat/Machines.tsx, `RUN`).
const RUN = 8, REST = 2

/**
 * Le lave-linge de la laverie, en plein lavage. Enregistré, ou synthétisé : un son de base pour dormir, continu et doux : un bruit d'eau
 * (un bruit rose voilé, sans aigu), le grondement sourd du tambour et le ronron grave du moteur quand il tourne (aucun bruitage ponctuel). Le tambour tourne huit secondes, se pose deux secondes (on n'entend
 * plus que l'eau qui se calme), puis repart dans l'autre sens : la scène inverse son tambour au même instant (`pulse`).
 */
export default function wash(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.wash, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 2400, 0.5)).connect(out)
    // l'eau : toujours là, elle respire un peu
    const bed = gain(0.16)
    loop(noise.pink, 0.7).connect(biq('lowpass', 1100, 0.5)).connect(bed).connect(bus)
    const swell = osc('sine', 0.09)
    swell.connect(gain(0.03)).connect(bed.gain)
    swell.start()
    // le tambour qui tourne, et le moteur : ils montent quand il tourne, se taisent pendant la pause
    const drum = gain(0.0)
    loop(noise.brown, 2.1).connect(biq('lowpass', 240, 0.7)).connect(drum).connect(bus)
    const motor = gain(0.0)
    const m1 = osc('sine', 49), m2 = osc('triangle', 98)
    m1.connect(motor)
    m2.connect(gain(0.25)).connect(motor)
    motor.connect(bus)
    m1.start()
    m2.start()
    function run(t0: number) {
      drum.gain.setTargetAtTime(0.55, t0, 0.35)
      motor.gain.setTargetAtTime(0.012, t0, 0.35)
      drum.gain.setTargetAtTime(0.06, t0 + RUN - 0.4, 0.3)
      motor.gain.setTargetAtTime(0.0, t0 + RUN - 0.4, 0.3)
      pulse(ctx, 'wash', t0)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.3
      while (next < until) {
        run(next)
        next += RUN + REST
      }
    }, 200)
  })
}
