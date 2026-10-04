import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * La mer. Enregistrée, ou synthétisée : un fond de houle grave, et des vagues qui se suivent sans régularité de machine.
 * Chaque vague enfle (le bruit s'ouvre vers les aigus), se brise, puis se retire en un long chuintement d'écume.
 */
export default function waves(kit: Kit, out: GainNode, { loops, id }: Room): Channel {
  // Au pied du phare, la houle se fracasse sur les rochers : plus grosse, plus rapprochée, avec un coup sourd à chaque choc.
  const rocks = id === 'lighthouse'
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
      if (rocks) {
        // le choc sur la roche : un coup grave qui s'effondre, et l'embrun qui retombe
        const boom = osc('sine', 62), bg = gain(0.0001)
        boom.frequency.setValueAtTime(70, crash)
        boom.frequency.exponentialRampToValueAtTime(34, crash + 0.7)
        bg.gain.setValueAtTime(0.0001, crash)
        bg.gain.exponentialRampToValueAtTime(0.3 * size, crash + 0.04)
        bg.gain.exponentialRampToValueAtTime(0.0001, crash + 0.9)
        boom.connect(bg).connect(pan)
        boom.start(crash)
        boom.stop(crash + 1)
      }
    }

    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.2
      while (next < until) {
        wave(next, rocks ? rand(1, 1.45) : rand(0.65, 1))
        next += rocks ? rand(3.4, 6.2) : rand(4.2, 8)
      }
    }, 200)
  })
}
