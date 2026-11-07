import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le chœur de grenouilles du bassin, un soir de pluie : un son de base pour s'endormir, continu et doux. Synthèse provisoire (un
 * enregistrement viendra) : une nuée de petits « pip » clairs de rainettes (un sinus de 2,6 à 3,4 kHz qui monte un peu, très court),
 * en grappes irrégulières qui se répondent, et, de loin en loin, le « crrouac » grave et rond d'une grenouille plus grosse. Tout
 * passe dans un petit écho d'étang, sous 4 kHz, à bas niveau. La scène gonfle la gorge d'une grenouille au même instant.
 */
export default function frogs(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.frogs, out, () => {
    const { ctx, gain, biq, osc } = kit
    // l'écho de l'étang : un retard court et filtré qui revient deux fois
    const dry = gain(1), wet = ctx.createDelay(1), fb = gain(0.3)
    wet.delayTime.value = 0.19
    dry.connect(biq('lowpass', 3800, 0.5)).connect(out)
    dry.connect(wet)
    wet.connect(biq('lowpass', 2200, 0.5)).connect(fb).connect(wet)
    wet.connect(gain(0.35)).connect(out)
    /** Un « pip » de rainette. */
    function peep(t: number, f: number, a: number) {
      const o = osc('sine', f), g = gain(0.0001), len = rand(0.045, 0.09)
      o.frequency.setValueAtTime(f, t)
      o.frequency.exponentialRampToValueAtTime(f * rand(1.04, 1.12), t + len * 0.7)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(a, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      o.connect(g).connect(dry)
      o.start(t)
      o.stop(t + len + 0.02)
    }
    /** Le « crrouac » d'une grosse grenouille : deux coups ronds, une octave et demie plus bas, avec un petit tremblement. */
    function croak(t: number, a: number) {
      const f0 = rand(210, 260)
      for (let k = 0; k < 2; k++) {
        const at = t + k * 0.17, o = osc('triangle', f0), lp = biq('lowpass', 900, 0.8), g = gain(0.0001), len = rand(0.12, 0.16), tr = osc('sine', rand(26, 34)), td = gain(0.5)
        o.frequency.setValueAtTime(f0 * 0.9, at)
        o.frequency.exponentialRampToValueAtTime(f0 * 1.15, at + len * 0.4)
        o.frequency.exponentialRampToValueAtTime(f0 * 0.95, at + len)
        tr.connect(td).connect(g.gain)
        g.gain.setValueAtTime(0.0001, at)
        g.gain.exponentialRampToValueAtTime(a, at + 0.02)
        g.gain.exponentialRampToValueAtTime(0.0001, at + len)
        o.connect(lp).connect(g).connect(dry)
        o.start(at)
        tr.start(at)
        o.stop(at + len + 0.02)
        tr.stop(at + len + 0.02)
      }
    }
    let next = 0, nextCroak = 0, burstEnd = 0, burstGap = 0, nextPulse = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) { next = now + 0.05; nextCroak = now + rand(4, 9); nextPulse = now + 2 }
      while (next < until) {
        // des grappes : les pips se pressent pendant 3 à 7 s, puis se calment un instant
        if (next > burstEnd) { burstEnd = next + rand(3, 7); burstGap = next + rand(0.8, 2.2) }
        if (next > burstEnd - 0.01 && next < burstGap) { next = burstGap; continue }
        const dense = next < burstEnd ? rand(0.05, 0.16) : rand(0.2, 0.5)
        peep(next, rand(2600, 3400), rand(0.012, 0.03))
        if (Math.random() < 0.3) peep(next + rand(0.03, 0.08), rand(2700, 3500), rand(0.008, 0.02))
        next += dense
        if (next > nextPulse) { pulse(ctx, 'frogs', next); nextPulse = next + rand(2.5, 5.5) }
      }
      while (nextCroak < until) { croak(nextCroak, rand(0.05, 0.08)); nextCroak += rand(7, 16) }
    }, 120)
  })
}
