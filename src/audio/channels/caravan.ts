import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

// Les partiels d'une petite cloche de cuivre battue (rapports, niveau, durée) : peu nombreux et courts, un tintement rond et non une volée.
const PARTIALS: [number, number, number][] = [[1, 1, 1.4], [2.32, 0.42, 0.8], [3.9, 0.16, 0.45], [5.4, 0.06, 0.25]]

// Les trois dromadaires : la note de leur clochette, leur pas (secondes), leur niveau et le filtre de la distance. Le premier est celui
// qui est couché près du camp (son tintement fait bouger la cloche de la scène) ; les deux autres marchent plus loin, plus feutrés.
const CAMELS: [number, number, number, number][] = [[760, 1.45, 0.22, 3600], [930, 1.62, 0.14, 2600], [610, 1.3, 0.11, 2100]]

/**
 * Les clochettes de la caravane : au pas lent des dromadaires, chaque clochette tinte à chaque balancement (pas toujours, parfois
 * deux coups du battant), trois notes rondes de cuivre qui ne tombent jamais ensemble, sur un souffle de sable très bas, dans l'air
 * ouvert du désert. La caravane s'approche et s'éloigne lentement. Un son de base, continu et doux. Enregistré, ou synthétisé
 * (provisoire : il se remplacera par un enregistrement). Rien de strident : tout est filtré sous 3,6 kHz.
 */
export default function caravan(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.caravan, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(out)
    // la caravane s'approche et s'éloigne : une houle très lente du niveau des clochettes
    const near = gain(0.8)
    near.connect(bus)
    const lfo = osc('sine', 0.021), lfoD = gain(0.2)
    lfo.connect(lfoD).connect(near.gain)
    lfo.start()
    const open = ctx.createConvolver()
    open.buffer = impulse(ctx, 2.4, 3.2)
    open.connect(gain(0.35)).connect(near)
    // le sable sous les pas, très bas
    loop(noise.pink, rand(0, 3)).connect(biq('lowpass', 420, 0.5)).connect(gain(0.07)).connect(bus)

    const voices = CAMELS.map(([, , , lp]) => {
      const f = biq('lowpass', lp, 0.6)
      f.connect(near)
      f.connect(open)
      return f
    })

    function ting(t: number, dest: BiquadFilterNode, f0: number, v: number) {
      const pan = ctx.createStereoPanner()
      pan.pan.value = rand(-0.4, 0.4)
      pan.connect(dest)
      for (const [ratio, amp, d] of PARTIALS) {
        const o = osc('sine', f0 * ratio * rand(0.997, 1.003)), g = gain(0.0001)
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(v * amp, t + 0.006)
        g.gain.exponentialRampToValueAtTime(0.0001, t + d)
        o.connect(g).connect(pan)
        o.start(t)
        o.stop(t + d + 0.05)
      }
    }

    const next = CAMELS.map(() => 0)
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      CAMELS.forEach(([f0, step, lvl], i) => {
        if (next[i] < now) next[i] = now + rand(0.1, step)
        while (next[i] < until) {
          const t = next[i]
          if (Math.random() < 0.8) {
            const v = lvl * rand(0.6, 1)
            ting(t, voices[i], f0 * rand(0.995, 1.005), v)
            // parfois le battant revient : un second coup, plus doux
            if (Math.random() < 0.3) ting(t + rand(0.09, 0.16), voices[i], f0, v * 0.45)
            if (i === 0) pulse(ctx, 'caravan', t)
          }
          next[i] = t + step * rand(0.9, 1.12)
        }
      })
    }, 150)
  })
}
