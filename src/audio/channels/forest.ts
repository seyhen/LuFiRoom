import { useStore } from '../../state/store'
import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { pulse, scheduled } from '../events'
import type { Kit } from '../engine'

/**
 * Les oiseaux de la forêt, autour de la cabane perchée. Enregistrés, ou synthétisés. Le jour : un rouge-gorge qui flûte ses phrases lentes
 * depuis le nichoir (des notes rondes et glissées, dans le médium, une phrase toutes les quatre à neuf secondes, jamais deux fois la
 * même), et de loin en loin un pic qui tambourine au fond du bois (un roulement de petits coups de bois qui accélère et s'éteint).
 * La nuit : la chouette hulotte, au loin, son « hou… hou-hou-hou » grave et doux, toutes les vingt à quarante secondes. Tout passe
 * dans un petit écho de sous-bois. La scène fait chanter l'oiseau (ou hululer la chouette) à chaque phrase.
 */
export default function forest(kit: Kit, out: GainNode, { loops }: Room) {
  const { ctx, gain, biq, osc, noise } = kit
  return kit.loopOrChannel(loops.forest, out, () => {
    // l'écho du sous-bois : un retard court, filtré, qui revient deux ou trois fois
    const dry = gain(1), wet = ctx.createDelay(1), fb = gain(0.32), damp = biq('lowpass', 1800, 0.5)
    wet.delayTime.value = 0.23
    dry.connect(biq('lowpass', 4200, 0.5)).connect(out)
    dry.connect(wet)
    wet.connect(damp).connect(fb).connect(wet)
    damp.connect(gain(0.5)).connect(out)
    // une note du rouge-gorge : un sinus qui glisse, un vibrato rapide et léger, une attaque douce
    function note(t: number, f0: number, f1: number, len: number, a: number) {
      const o = osc('sine', f0), g = gain(0.0001), vib = osc('sine', rand(24, 38)), vd = gain(f0 * 0.012)
      o.frequency.setValueAtTime(f0, t)
      o.frequency.exponentialRampToValueAtTime(f1, t + len)
      vib.connect(vd).connect(o.frequency)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(a, t + Math.min(0.04, len * 0.3))
      g.gain.setValueAtTime(a, t + len * 0.7)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      o.connect(g).connect(dry)
      for (const n of [o, vib]) { n.start(t); n.stop(t + len + 0.05) }
    }
    // une phrase : trois à six notes flûtées, puis souvent un petit gazouillis plus aigu et plus bas en volume
    function phrase(t: number) {
      const n = 3 + ((Math.random() * 4) | 0), base = rand(1300, 1900)
      let tt = t
      for (let i = 0; i < n; i++) {
        const f0 = base * rand(0.85, 1.35), len = rand(0.12, 0.32)
        note(tt, f0, f0 * rand(0.8, 1.25), len, rand(0.05, 0.08))
        tt += len + rand(0.03, 0.09)
      }
      if (Math.random() < 0.6) for (let i = 0; i < 4; i++) note(tt + i * 0.06, base * 1.6, base * 1.9, 0.05, 0.018)
      pulse(ctx, 'forest', t)
    }
    // le pic, au loin : 12 à 18 coups de bois, de plus en plus serrés, qui s'éteignent
    const drumBus = gain(1)
    drumBus.connect(biq('lowpass', 1600, 0.5)).connect(dry)
    function drum(t: number) {
      const k = 12 + ((Math.random() * 7) | 0), f = rand(700, 900)
      let tt = t, gap = 0.075
      for (let i = 0; i < k; i++) {
        const s = ctx.createBufferSource(), body = biq('bandpass', f, 6), g = gain(0.0001), a = 0.25 * (1 - (i / k) * 0.6)
        s.buffer = noise.white
        s.start(tt, rand(0, 4))
        s.stop(tt + 0.05)
        g.gain.setValueAtTime(0.0001, tt)
        g.gain.exponentialRampToValueAtTime(a, tt + 0.002)
        g.gain.exponentialRampToValueAtTime(0.0001, tt + 0.04)
        s.connect(body).connect(g).connect(drumBus)
        tt += gap
        gap *= 0.97
      }
    }
    // la hulotte : un « hou » long, un silence, puis trois « hou » tremblés qui glissent vers le bas
    function hoot(t: number, f: number, len: number, a: number, wobble: number) {
      const o = osc('sine', f), o2 = osc('triangle', f), g = gain(0.0001), tr = osc('sine', rand(9, 13)), td = gain(f * wobble)
      o.frequency.setValueAtTime(f * 1.04, t)
      o.frequency.exponentialRampToValueAtTime(f * 0.93, t + len)
      o2.frequency.setValueAtTime(f * 1.04, t)
      o2.frequency.exponentialRampToValueAtTime(f * 0.93, t + len)
      tr.connect(td).connect(o.frequency)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(a, t + len * 0.25)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      o.connect(g)
      o2.connect(gain(0.15)).connect(g)
      g.connect(dry)
      for (const n of [o, o2, tr]) { n.start(t); n.stop(t + len + 0.05) }
    }
    function owl(t: number) {
      const f = rand(420, 470)
      hoot(t, f, 0.75, 0.09, 0.004)
      const t2 = t + rand(2.6, 3.4)
      hoot(t2, f * 0.97, 0.22, 0.06, 0.003)
      for (let i = 0; i < 3; i++) hoot(t2 + 0.45 + i * 0.32, f * (0.98 - i * 0.015), 0.28 + (i === 2 ? 0.5 : 0), 0.075, 0.03)
      pulse(ctx, 'forest', t)
      pulse(ctx, 'forest', t2)
    }
    let next = 0, drumAt = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) { next = now + rand(0.8, 2.2); drumAt = now + rand(10, 22) }
      const night = useStore.getState().night
      while (next < until) {
        if (night) { owl(next); next += rand(20, 40) }
        else { phrase(next); next += rand(4, 9) }
      }
      if (!night && drumAt < until) { drum(Math.max(now, drumAt)); drumAt += rand(25, 45) }
    }, 200)
  })
}
