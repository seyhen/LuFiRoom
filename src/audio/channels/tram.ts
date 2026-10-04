import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * Le tram de nuit, au bout de la ruelle : il arrive de loin en grondant, grince dans la courbe, tinte deux fois de sa cloche,
 * passe dans un claquement de joints de rails et s'éloigne de l'autre côté. Du gauche au droit, ou l'inverse. Toutes les
 * trente à quarante secondes. Enregistré, ou synthétisé.
 */
export default function tram(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.tram, out, () => {
    const { ctx, gain, biq, osc, noise } = kit
    const bus = gain(1)
    bus.connect(out)
    const street = ctx.createConvolver()
    street.buffer = impulse(ctx, 1.9, 2.8)
    street.connect(gain(0.45)).connect(bus)

    function pass(t: number, dir: 1 | -1) {
      const len = 8.5, mid = t + len * 0.5
      const pan = ctx.createStereoPanner()
      pan.pan.setValueAtTime(-0.85 * dir, t)
      pan.pan.linearRampToValueAtTime(0.85 * dir, t + len)
      pan.connect(bus)
      pan.connect(street)
      const swell = (g: GainNode, peak: number) => {
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(peak, mid)
        g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      }
      // le grondement des roues
      const rumble = ctx.createBufferSource(), rlp = biq('lowpass', 150, 0.7), rg = gain(0.0001)
      rumble.buffer = noise.brown
      rumble.start(t, rand(0, 5))
      rumble.stop(t + len + 0.1)
      rlp.frequency.setValueAtTime(130, t)
      rlp.frequency.linearRampToValueAtTime(340, mid)
      rlp.frequency.linearRampToValueAtTime(130, t + len)
      swell(rg, 0.5)
      rumble.connect(rlp).connect(rg).connect(pan)
      // la ligne : une plainte électrique qui monte en approchant et retombe en s'éloignant (effet Doppler)
      const whine = osc('sawtooth', 300), wlp = biq('lowpass', 1000, 0.8), wg = gain(0.0001)
      whine.frequency.setValueAtTime(330, t)
      whine.frequency.linearRampToValueAtTime(380, mid - 0.2)
      whine.frequency.linearRampToValueAtTime(285, mid + 0.2)
      whine.frequency.linearRampToValueAtTime(250, t + len)
      swell(wg, 0.03)
      whine.connect(wlp).connect(wg).connect(pan)
      whine.start(t)
      whine.stop(t + len + 0.1)
      // les joints de rails : un double claquement (les deux essieux d'un bogie), plus rapide quand il est tout près
      for (let c = t + 1.4; c < t + len - 1; c += 0.15 + 0.11 * Math.abs(c - mid) / (len * 0.5)) {
        const near = 1 - Math.abs(c - mid) / (len * 0.5)
        for (const off of [0, 0.045]) {
          const s = ctx.createBufferSource(), g = gain(0.0001)
          s.buffer = noise.white
          s.start(c + off, rand(0, 3))
          s.stop(c + off + 0.03)
          g.gain.setValueAtTime(0.0001, c + off)
          g.gain.exponentialRampToValueAtTime(0.02 + near * 0.07, c + off + 0.002)
          g.gain.exponentialRampToValueAtTime(0.0001, c + off + 0.025)
          s.connect(biq('bandpass', 1300, 1.3)).connect(g).connect(pan)
        }
      }
      // la cloche, deux coups
      for (const bt of [mid - 1.8, mid - 1.45]) {
        for (const [f, d, a] of [[1880, 0.4, 0.06], [3790, 0.22, 0.02]] as const) {
          const o = osc('sine', f), g = gain(0.0001)
          g.gain.setValueAtTime(0.0001, bt)
          g.gain.exponentialRampToValueAtTime(a, bt + 0.003)
          g.gain.exponentialRampToValueAtTime(0.0001, bt + d)
          o.connect(g).connect(pan)
          o.start(bt)
          o.stop(bt + d + 0.05)
        }
      }
      // le grincement dans la courbe
      const sq = ctx.createBufferSource(), sbp = biq('bandpass', 2700, 9), sg = gain(0.0001)
      sq.buffer = noise.white
      sq.start(mid + 0.8, rand(0, 3))
      sq.stop(mid + 2.3)
      sbp.frequency.setValueAtTime(2800, mid + 0.8)
      sbp.frequency.exponentialRampToValueAtTime(2000, mid + 2.2)
      sg.gain.setValueAtTime(0.0001, mid + 0.8)
      sg.gain.exponentialRampToValueAtTime(0.03, mid + 1.2)
      sg.gain.exponentialRampToValueAtTime(0.0001, mid + 2.2)
      sq.connect(sbp).connect(sg).connect(pan)
    }

    let next = 0, dir: 1 | -1 = 1
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(1.2, 2.5)
      while (next < until) {
        pass(next, dir)
        dir = dir === 1 ? -1 : 1
        next += rand(30, 42)
      }
    }, 300)
  })
}
