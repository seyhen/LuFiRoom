import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * La guitare du voisin de la banquise, sur sa plaque de glace : une guitare nylon qui égrène des accords lents, dans l'air froid.
 * Enregistré (60 s en boucle, de la musique : un morceau calme) ; le repli synthétisé (provisoire) est un accord mineur tenu, très doux,
 * dont chaque note respire à son rythme. Continu et doux : pas de note isolée.
 */
export default function guitar(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, osc, biq } = kit
  return kit.loopOrChannel(loops.guitar, out, () => {
    const lp = biq('lowpass', 900, 0.5)
    lp.connect(out)
    for (const [i, f] of [110, 164.8, 196, 246.9, 329.6].entries()) {
      const o = osc('triangle', f), amp = gain(0.012)
      o.connect(amp).connect(lp)
      const sway = osc('sine', 0.05 + i * 0.027)
      sway.connect(gain(0.009)).connect(amp.gain)
      o.start()
      sway.start()
    }
  })
}
