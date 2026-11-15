import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * Le handpan du musicien de la rue, sous l'auvent du café : des notes rondes et lentes qui résonnent sur les pavés mouillés. Enregistré (60 s en boucle) ; le repli synthétisé (provisoire) est un accord tenu très doux, deux sinus par note
 * dont le niveau respire lentement. Continu et doux : pas de note isolée.
 */
export default function handpan(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, osc } = kit
  return kit.loopOrChannel(loops.handpan, out, () => {
    for (const [i, f] of [196, 247, 294, 392].entries()) {
      const o = osc('sine', f), amp = gain(0.02)
      o.connect(amp).connect(out)
      const sway = osc('sine', 0.07 + i * 0.03)
      sway.connect(gain(0.012)).connect(amp.gain)
      o.start()
      sway.start()
    }
  })
}
