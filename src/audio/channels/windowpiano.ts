import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * Le piano d'une fenêtre éclairée de l'immeuble d'en face : un air improvisé, lent, qui traverse la rue vide de la nuit. Enregistré (60 s en boucle) ; le repli synthétisé (provisoire) est un accord tenu très doux, deux sinus par note
 * dont le niveau respire lentement. Continu et doux : pas de note isolée.
 */
export default function windowpiano(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, osc } = kit
  return kit.loopOrChannel(loops.windowpiano, out, () => {
    for (const [i, f] of [130.8, 196, 261.6, 329.6].entries()) {
      const o = osc('sine', f), amp = gain(0.02)
      o.connect(amp).connect(out)
      const sway = osc('sine', 0.07 + i * 0.03)
      sway.connect(gain(0.012)).connect(amp.gain)
      o.start()
      sway.start()
    }
  })
}
