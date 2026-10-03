import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

// Carillon de tubes : une gamme pentatonique (do, ré, mi, sol, la), partiels non harmoniques d'un tube libre.
const TUBES = [523.25, 587.33, 659.25, 783.99, 880, 1046.5]
const TUBE_PARTIALS = [[1, 1], [2.76, 0.45], [5.4, 0.22], [8.93, 0.1]]
// Furin, la clochette de verre japonaise : aiguë, brève, avec le petit cliquetis du battant.
const FURIN_PARTIALS = [[1, 1], [2.32, 0.5], [4.25, 0.25], [6.8, 0.12]]

/**
 * Carillon à vent. Enregistré, ou synthétisé : des coups au hasard, par grappes quand le vent forcit puis presque rien.
 * Dans le bungalow, des tubes de métal accordés ; dans l'onsen, un furin de verre, plus aigu et plus rare.
 */
export default function chimes(kit: Kit, out: GainNode, room: Room): Channel {
  return kit.loopOrChannel(room.loops.chimes, out, () => {
    const { ctx, gain, osc } = kit
    const glass = room.id === 'onsen'
    const bus = gain(glass ? 4.4 : 3.6)
    bus.connect(out)
    const verb = ctx.createConvolver()
    verb.buffer = impulse(ctx, 2.2, 3)
    verb.connect(gain(0.28)).connect(bus)

    function strike(t: number, f: number, v: number) {
      const pan = ctx.createStereoPanner()
      pan.pan.value = rand(-0.6, 0.6)
      pan.connect(bus)
      pan.connect(verb)
      const decay = glass ? rand(1.2, 2) : rand(2.5, 4.5)
      for (const [ratio, amp] of glass ? FURIN_PARTIALS : TUBE_PARTIALS) {
        const o = osc('sine', f * ratio), g = gain(0.0001), d = decay / Math.sqrt(ratio)
        o.detune.value = rand(-6, 6)
        g.gain.setValueAtTime(0.0001, t)
        g.gain.exponentialRampToValueAtTime(v * amp, t + 0.004)
        g.gain.exponentialRampToValueAtTime(0.0001, t + d)
        o.connect(g).connect(pan)
        o.start(t)
        o.stop(t + d + 0.05)
      }
    }

    let next = 0, gust = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(0.2, 1)
      while (next < until) {
        // Le vent : par moments une grappe de coups rapprochés, sinon un tintement isolé.
        gust = Math.max(0, gust - 1)
        if (gust === 0 && Math.random() < (glass ? 0.12 : 0.22)) gust = 3 + ((Math.random() * (glass ? 3 : 6)) | 0)
        if (glass) strike(next, rand(2700, 3300), rand(0.035, 0.06))
        else strike(next, TUBES[(Math.random() * TUBES.length) | 0], rand(0.03, 0.065))
        next += gust ? rand(0.12, 0.45) : rand(glass ? 3 : 1.8, glass ? 9 : 5.5)
      }
    })
  })
}
