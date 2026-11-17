import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * La musique de la danse bon-odori d'une fête de quartier, au loin, derrière les immeubles du marché : tambour et flûte, étouffés par la distance. Enregistré (60 s en boucle) ; le repli synthétisé (provisoire) est un accord tenu très doux, deux sinus par note
 * dont le niveau respire lentement. Continu et doux : pas de note isolée.
 */
export default function bonodori(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, osc } = kit
  return kit.loopOrChannel(loops.bonodori, out, () => {
    for (const [i, f] of [110, 165, 220].entries()) {
      const o = osc('sine', f), amp = gain(0.02)
      o.connect(amp).connect(out)
      const sway = osc('sine', 0.07 + i * 0.03)
      sway.connect(gain(0.012)).connect(amp.gain)
      o.start()
      sway.start()
    }
  })
}
