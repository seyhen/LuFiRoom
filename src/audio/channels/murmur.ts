import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

// Voyelles : les trois premiers formants (Hz). Une voix = une source de glotte (une scie à 90-240 Hz) passée par ces trois résonances.
const VOWELS = [[800, 1200, 2500], [500, 1900, 2600], [300, 2300, 3000], [500, 900, 2500], [350, 700, 2400], [600, 1800, 2500], [700, 1100, 2600]]

/**
 * Brouhaha de café. Enregistré, ou synthétisé : neuf bavards (trois voix graves, six plus aiguës), chacun sa hauteur de voix,
 * qui enchaînent des syllabes de 0,1 à 0,26 s (voyelle qui glisse, un « s » ou un « t » devant parfois) par phrases de 3 à 9
 * syllabes, puis se taisent un moment. Le tout dans une salle qui résonne un peu, avec le grondement bas des chaises et des tasses.
 * Aucun mot ne se comprend, mais on entend des gens, pas du vent : ce n'est plus un bruit filtré (on aurait dit un train).
 */
export default function murmur(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.murmur, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(5)
    bus.connect(out)
    const room = gain(1), conv = ctx.createConvolver()
    conv.buffer = impulse(ctx, 0.9, 2.6)
    room.connect(biq('lowpass', 4300, 0.5)).connect(bus)
    room.connect(conv)
    conv.connect(gain(0.38)).connect(bus)
    // Le fond de la salle : des chaises, des pas, le souffle de la machine, très bas.
    loop(noise.brown, 1.9).connect(biq('lowpass', 280, 0.5)).connect(gain(0.05)).connect(bus)

    const talkers = Array.from({ length: 9 }, (_, i) => {
      const f0 = i % 3 === 0 ? rand(88, 135) : rand(170, 245)
      const src = osc('sawtooth', f0), amp = gain(0), pan = ctx.createStereoPanner()
      const formants = [0, 1, 2].map((k) => {
        const f = biq('bandpass', VOWELS[0][k], 6)
        src.connect(f)
        f.connect(gain([1, 0.55, 0.3][k])).connect(amp)
        return f
      })
      // Le souffle de la voix : un peu de bruit dans la zone des formants.
      loop(noise.pink, rand(0, 5)).connect(biq('bandpass', 1700, 0.8)).connect(gain(0.25)).connect(amp)
      pan.pan.value = rand(-0.85, 0.85)
      amp.connect(pan).connect(room)
      src.start()
      // `near` : un bavard proche s'entend plus que les autres.
      return { src, formants, amp, f0, near: rand(0.35, 1), t: rand(0, 3), left: 0 }
    })
    const hit = (t: number, f: number, v: number) => {
      const s = ctx.createBufferSource(), g = gain(0)
      s.buffer = noise.white
      g.gain.setValueAtTime(v, t)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.06)
      s.connect(biq('highpass', f, 0.7)).connect(g).connect(room)
      s.start(t, rand(0, 3))
      s.stop(t + 0.08)
    }
    // Une tasse qui tinte, de loin : trois partiels inharmoniques de porcelaine.
    const cup = (t: number) => {
      const base = rand(1900, 3000)
      for (const [m, v, d] of [[1, 0.5, 0.22], [2.32, 0.35, 0.14], [3.9, 0.2, 0.08]] as const) {
        const o = osc('sine', base * m), g = gain(0)
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(0.018 * v, t + 0.002)
        g.gain.exponentialRampToValueAtTime(0.0001, t + d)
        o.connect(g).connect(room)
        o.start(t)
        o.stop(t + d + 0.05)
      }
    }

    let nextCup = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      for (const p of talkers) {
        if (p.t < now) p.t = now + rand(0, 2)
        while (p.t < until) {
          if (p.left <= 0) {
            // un silence entre deux phrases : on écoute l'autre, on boit
            p.t += rand(0.5, 3.2)
            p.left = 3 + Math.floor(Math.random() * 7)
            continue
          }
          const dur = rand(0.1, 0.26), v = VOWELS[Math.floor(Math.random() * VOWELS.length)], t = p.t
          p.formants.forEach((f, k) => f.frequency.setTargetAtTime(v[k] * rand(0.94, 1.06), t, 0.03))
          p.src.frequency.setTargetAtTime(p.f0 * rand(0.86, 1.14), t, 0.05)
          p.amp.gain.setTargetAtTime(p.near * rand(0.05, 0.1), t, 0.02)
          p.amp.gain.setTargetAtTime(0, t + dur, 0.035)
          if (Math.random() < 0.35) hit(t - 0.03, Math.random() < 0.6 ? 5200 : 3200, p.near * 0.05)
          p.t = t + dur + rand(0.02, 0.09)
          p.left--
        }
      }
      if (nextCup < now) nextCup = now + rand(2, 6)
      while (nextCup < until) {
        cup(nextCup)
        nextCup += rand(4, 11)
      }
    }, 150)
  })
}
