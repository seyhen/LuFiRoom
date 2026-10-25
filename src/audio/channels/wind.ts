import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'
import { thunder } from '../thunder'

/**
 * Vent. Enregistré, ou synthétisé : un souffle dont la hauteur et le niveau montent et descendent (rafales), un sifflement fin,
 * un grondement grave. Sur la neige (la cabane), une tempête ; sur un toit en été, une brise plus douce et sans sifflement.
 */
export default function wind(kit: Kit, out: GainNode, room: Room) {
  const { loops, id } = room
  if (room.storm === 'wind') thunder(kit, out) // au phare, la tempête porte l'orage
  const breeze = id === 'roof'
  // Au phare : la tempête qui s'engouffre dans l'escalier, un sifflement plus fort et un grondement plus plein.
  const storm = id === 'lighthouse'
  const { gain, biq, osc, loop, noise } = kit
  return kit.loopOrChannel(loops.wind, out, () => {
    // Souffle : bruit rose en passe-bande, balayé lentement par deux oscillateurs qui ne retombent jamais en phase.
    const body = biq('bandpass', 520, 0.8), bodyGain = gain(0.55)
    loop(noise.pink, 1.1).connect(body).connect(bodyGain).connect(out)
    // Sifflement fin qui glisse.
    const whistle = biq('bandpass', 1050, 14)
    loop(noise.white, 2.4).connect(whistle).connect(gain(breeze ? 0.008 : storm ? 0.12 : 0.05)).connect(out)
    // Grondement.
    loop(noise.brown, 3.3).connect(biq('lowpass', 170, 0.6)).connect(gain(breeze ? 0.25 : storm ? 0.7 : 0.5)).connect(out)
    for (const [f, depth, param] of [
      [0.09, 260, body.frequency], [0.23, 110, body.frequency], [0.07, 0.3, bodyGain.gain], [0.05, 220, whistle.frequency], [0.17, 90, whistle.frequency],
    ] as const) {
      const lfo = osc('sine', f)
      lfo.connect(gain(depth)).connect(param)
      lfo.start()
    }
  })
}
