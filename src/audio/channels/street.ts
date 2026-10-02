import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * La rue sous la pluie. Enregistrée, ou synthétisée : le bruit de fond de la ville, des voitures qui passent sur la chaussée
 * mouillée (un souffle qui monte puis s'éloigne en glissant d'un côté à l'autre) et, plus rarement, un bus.
 */
export default function street(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.street, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    // Niveau de la synthèse (l'enregistrement, lui, passe tel quel par `out`) : réglé pour valoir les autres sons du mixeur.
    const bus = gain(1.7)
    bus.connect(out)
    // Fond : la ville au loin et le roulement sourd de la circulation.
    loop(noise.pink, 3.7).connect(biq('lowpass', 800, 0.4)).connect(gain(0.22)).connect(bus)
    loop(noise.brown, 5.1).connect(biq('lowpass', 150, 0.6)).connect(gain(0.35)).connect(bus)

    // Un passage : bruit de pneus sur le mouillé (passe-bande qui monte puis redescend) et grondement du moteur, d'un côté à l'autre.
    function pass(t: number, dur: number, v: number, isBus: boolean) {
      const n = ctx.createBufferSource(), bp = biq('bandpass', 400, 0.8), g = gain(0), pan = ctx.createStereoPanner(), dir = Math.random() < 0.5 ? -1 : 1
      n.buffer = noise.pink
      n.loop = true
      n.start(t, rand(0, 4))
      n.stop(t + dur + 0.1)
      bp.frequency.setValueAtTime(isBus ? 300 : 450, t)
      bp.frequency.exponentialRampToValueAtTime(isBus ? 800 : 1500, t + dur * 0.5)
      bp.frequency.exponentialRampToValueAtTime(isBus ? 280 : 400, t + dur)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v, t + dur * 0.5)
      g.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      pan.pan.setValueAtTime(0.8 * dir, t)
      pan.pan.linearRampToValueAtTime(-0.8 * dir, t + dur)
      n.connect(bp).connect(g).connect(pan).connect(bus)
      // Moteur : une scie grave filtrée, qui monte un peu en passant.
      const o = osc('sawtooth', isBus ? 42 : 70), og = gain(0), lp = biq('lowpass', isBus ? 160 : 260, 0.7)
      o.frequency.setValueAtTime(isBus ? 42 : 70, t)
      o.frequency.linearRampToValueAtTime(isBus ? 52 : 90, t + dur * 0.5)
      o.frequency.linearRampToValueAtTime(isBus ? 40 : 66, t + dur)
      og.gain.setValueAtTime(0.0001, t)
      og.gain.exponentialRampToValueAtTime(v * (isBus ? 0.55 : 0.3), t + dur * 0.5)
      og.gain.exponentialRampToValueAtTime(0.0001, t + dur)
      o.connect(lp).connect(og).connect(pan)
      o.start(t)
      o.stop(t + dur + 0.1)
    }

    let nextCar = 0, nextBus = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (nextCar < now) nextCar = now + rand(0.3, 2)
      if (nextBus < now) nextBus = now + rand(8, 25)
      while (nextCar < until) {
        pass(nextCar, rand(2.2, 3.8), rand(0.28, 0.5), false)
        nextCar += rand(3.5, 9)
      }
      while (nextBus < until) {
        pass(nextBus, rand(4.5, 6.5), 0.55, true)
        nextBus += rand(25, 55)
      }
    }, 150)
  })
}
