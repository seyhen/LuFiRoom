import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

// Les « unités » d'un chant de mégaptère : [durée min, max], hauteur de départ et d'arrivée (Hz), pulsation (0 : aucune).
// Gémissement long et grave, cri qui monte, grondement qui roule, plainte aiguë qui retombe.
const UNITS = {
  moan: { len: [2.4, 4.2], from: [150, 210], to: [260, 380], pulse: 0 },
  whoop: { len: [0.8, 1.6], from: [260, 380], to: [700, 1100], pulse: 0 },
  groan: { len: [1.6, 2.8], from: [78, 120], to: [64, 100], pulse: 22 },
  cry: { len: [0.9, 1.7], from: [900, 1300], to: [420, 600], pulse: 0 },
} as const
type Unit = keyof typeof UNITS

/**
 * Le chant d'une baleine à bosse, très loin. Une phrase est une suite de 4 à 6 « unités » (gémissements, cris qui montent,
 * grondements qui roulent, plaintes aiguës) qu'elle répète deux ou trois fois en les variant à peine, comme un vrai chant, puis
 * elle se tait quinze à trente secondes. Chaque unité est riche en harmoniques (deux scies légèrement désaccordées, dont le battement
 * donne la chair du son), passées dans deux résonances qui glissent avec la hauteur, sous un léger vibrato, dans cinq secondes
 * de réverbération. Enregistré, ou synthétisé.
 */
export default function whale(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.whale, out, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(1)
    bus.connect(out)
    const deep = ctx.createConvolver()
    deep.buffer = impulse(ctx, 5.4, 2)
    deep.connect(gain(1.2)).connect(bus)

    function unit(t: number, kind: Unit, shift: number, v: number, pan: number) {
      const u = UNITS[kind], len = rand(u.len[0], u.len[1]), f0 = rand(u.from[0], u.from[1]) * shift, f1 = rand(u.to[0], u.to[1]) * shift
      const a = osc('sawtooth', f0), b = osc('sawtooth', f0 * 1.006), vib = osc('sine', rand(3.2, 5.5)), mix = gain(0.5)
      for (const o of [a, b]) {
        o.frequency.setValueAtTime(f0, t)
        o.frequency.exponentialRampToValueAtTime(f1, t + len * 0.6)
        o.frequency.exponentialRampToValueAtTime(Math.max(40, f1 * rand(0.8, 0.95)), t + len)
        vib.connect(gain(f0 * 0.012)).connect(o.frequency)
        o.connect(mix)
        o.start(t)
        o.stop(t + len + 0.1)
      }
      vib.start(t)
      vib.stop(t + len + 0.1)
      // Deux résonances qui suivent la hauteur : la voix « s'ouvre » quand la note monte.
      const r1 = biq('bandpass', f0 * 2.1, 3), r2 = biq('bandpass', f0 * 3.6, 3), lp = biq('lowpass', 1800, 0.6), env = gain(0.0001), p = ctx.createStereoPanner()
      for (const [r, m] of [[r1, 2.1], [r2, 3.6]] as const) {
        r.frequency.setValueAtTime(f0 * m, t)
        r.frequency.exponentialRampToValueAtTime(f1 * m, t + len * 0.6)
        mix.connect(r).connect(lp)
      }
      mix.connect(lp)
      // Le grondement roule : la voix pulse environ vingt fois par seconde.
      if (u.pulse) {
        const lfo = osc('square', u.pulse + rand(-3, 3)), depth = gain(v * 0.45)
        lfo.connect(depth).connect(env.gain)
        lfo.start(t)
        lfo.stop(t + len + 0.1)
      }
      // Un souffle d'eau avec chaque unité, comme le bruit de l'air qui sort.
      const air = ctx.createBufferSource(), ag = gain(0.0001)
      air.buffer = noise.pink
      ag.gain.setValueAtTime(0.0001, t)
      ag.gain.exponentialRampToValueAtTime(v * 0.18, t + len * 0.3)
      ag.gain.exponentialRampToValueAtTime(0.0001, t + len)
      air.connect(biq('bandpass', f0 * 2.5, 1)).connect(ag).connect(lp)
      air.start(t, rand(0, 4))
      air.stop(t + len + 0.1)
      env.gain.setValueAtTime(0.0001, t)
      env.gain.exponentialRampToValueAtTime(v, t + len * 0.35)
      env.gain.exponentialRampToValueAtTime(v * 0.6, t + len * 0.75)
      env.gain.exponentialRampToValueAtTime(0.0001, t + len)
      p.pan.setValueAtTime(pan, t)
      p.pan.linearRampToValueAtTime(pan * -0.5, t + len)
      lp.connect(env).connect(p)
      p.connect(bus)
      p.connect(deep)
      return len
    }

    const THEMES: Unit[][] = [['moan', 'whoop', 'groan', 'moan', 'cry'], ['groan', 'moan', 'cry', 'whoop'], ['moan', 'moan', 'whoop', 'cry', 'groan', 'moan']]
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(1.5, 4)
      while (next < until) {
        const theme = THEMES[Math.floor(Math.random() * THEMES.length)], pan = rand(-0.7, 0.7), shift = rand(0.92, 1.1)
        let t = next
        for (let rep = 0, reps = 2 + Math.floor(Math.random() * 2); rep < reps; rep++) {
          for (const k of theme) {
            const len = unit(t, k, shift * rand(0.97, 1.03), 0.12, pan)
            t += len * rand(0.78, 1.0)
          }
          t += rand(0.8, 2)
        }
        next = t + rand(14, 30)
      }
    }, 300)
  })
}
