import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * La mer. Enregistrée, ou synthétisée : un fond de houle grave, et des vagues qui se suivent sans régularité de machine.
 * Chaque vague enfle (le bruit s'ouvre vers les aigus), se brise, puis se retire en un long chuintement d'écume.
 */
export default function waves(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.waves, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1.5)
    bus.connect(out)
    // Le large : un grondement qui respire très lentement.
    const sea = gain(0.32)
    loop(noise.brown, 1.7).connect(biq('lowpass', 260, 0.5)).connect(sea).connect(bus)
    const swell = osc('sine', 0.07)
    swell.connect(gain(0.1)).connect(sea.gain)
    swell.start()

    function wave(t: number, size: number) {
      const rise = rand(1.6, 2.6), crash = t + rise, wash = rand(3.5, 5.5), end = crash + wash
      const pan = ctx.createStereoPanner()
      pan.pan.setValueAtTime(rand(-0.5, 0.5), t)
      pan.pan.linearRampToValueAtTime(rand(-0.3, 0.3), end)
      pan.connect(bus)
      // le corps de la vague : bruit rose dont le filtre s'ouvre en enflant
      const body = ctx.createBufferSource(), lp = biq('lowpass', 300, 0.6), g = gain(0.0001)
      body.buffer = noise.pink
      body.start(t, rand(0, 5))
      body.stop(end + 0.1)
      lp.frequency.setValueAtTime(280, t)
      lp.frequency.exponentialRampToValueAtTime(1900 * size, crash)
      lp.frequency.exponentialRampToValueAtTime(500, end)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(0.5 * size, crash)
      g.gain.exponentialRampToValueAtTime(0.18 * size, crash + 0.8)
      g.gain.exponentialRampToValueAtTime(0.0001, end)
      body.connect(lp).connect(g).connect(pan)
      // l'écume qui se retire : un chuintement aigu qui s'éteint en glissant
      const foam = ctx.createBufferSource(), hp = biq('bandpass', 4200, 0.6), fg = gain(0.0001)
      foam.buffer = noise.white
      foam.start(crash - 0.2, rand(0, 4))
      foam.stop(end + 0.1)
      hp.frequency.setValueAtTime(3000, crash)
      hp.frequency.exponentialRampToValueAtTime(6500, end)
      fg.gain.setValueAtTime(0.0001, crash - 0.2)
      fg.gain.exponentialRampToValueAtTime(0.09 * size, crash + 0.3)
      fg.gain.exponentialRampToValueAtTime(0.0001, end)
      foam.connect(hp).connect(fg).connect(pan)
    }

    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.2
      while (next < until) {
        wave(next, rand(0.65, 1))
        next += rand(4.2, 8)
      }
    }, 200)
  })
}
