import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * Le saxophoniste du toit d'en face : un air lent et doux qui vient de l'autre côté de la rue. Enregistré (60 s en boucle),
 * ou synthétisé : deux notes tenues d'un timbre de bois (triangle filtré) au vibrato lent, un accord de la mineur qui respire.
 */
export default function sax(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc } = kit
  return kit.loopOrChannel(loops.sax, out, () => {
    const lp = biq('lowpass', 1100, 0.7), bus = gain(0.05)
    lp.connect(bus).connect(out)
    for (const f of [220, 261.6, 329.6]) {
      const o = osc('triangle', f), vib = osc('sine', 4.6)
      vib.connect(gain(2.2)).connect(o.frequency)
      o.connect(gain(0.33)).connect(lp)
      o.start(); vib.start()
    }
    const sway = osc('sine', 0.09)
    sway.connect(gain(0.02)).connect(bus.gain)
    sway.start()
  })
}
