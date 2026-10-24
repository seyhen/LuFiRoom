import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Kit } from '../engine'

/**
 * La plume du gardien sur le journal de bord. Enregistrée, ou synthétisée : de courts frottements doux (une plume ne crisse pas, elle
 * chuchote), quelques traits d'affilée, puis la plume qu'on retrempe (un tout petit « tic » contre l'encrier), et des silences.
 */
export default function quill(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.shotsOr(loops.quill, out, { gap: [2, 6], rate: 0.05, level: 0.2 }, () => {
    const { ctx, gain, biq, noise } = kit
    const bus = gain(9)
    bus.connect(out)
    const burst = (t: number, dur: number) => {
      const s = ctx.createBufferSource()
      s.buffer = noise.pink
      s.start(t, rand(0, 4))
      s.stop(t + dur + 0.02)
      return s
    }
    function scratch(t: number, dur: number) {
      const g = gain(0.0001), bp = biq('bandpass', rand(1800, 2600), 0.9)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(rand(0.04, 0.06), t + dur * 0.3)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      burst(t, dur).connect(bp).connect(g).connect(bus)
    }
    function dip(t: number) {
      const g = gain(0.0001)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.05, t + 0.002)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
      burst(t, 0.06).connect(biq('bandpass', 900, 3)).connect(g).connect(bus)
    }
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.3
      while (next < until) {
        let at = next
        for (let i = 0, n = 3 + ((Math.random() * 5) | 0); i < n; i++) {
          const dur = rand(0.15, 0.55)
          scratch(at, dur)
          at += dur + rand(0.05, 0.3)
        }
        dip(at + 0.2)
        next = at + rand(3, 8)
      }
    }, 200)
  })
}
