import { fallingAsleep, type Store } from '../state/store'
import { rand } from '../math'
import type { Kit } from './engine'

/**
 * Le tonnerre d'un orage lointain, joué dans le bus du son qui porte l'orage (la météo « Orage », la tempête du phare) quand `when` le dit : il suit son volume
 * et le minuteur de sommeil. Un grondement grave sans claquement, qui monte en une seconde, roule deux fois et s'éteint en six,
 * une à trois secondes après l'éclair (la distance). Au plus fort, 2 à 4 dB au-dessus de la pluie, dans le grave seulement.
 * Jamais dans les deux dernières minutes du minuteur de sommeil.
 */
export function thunder(kit: Kit, out: AudioNode, when: (s: Store) => boolean) {
  kit.watch((s, p) => {
    if (s.thunders !== p.thunders && when(s) && !fallingAsleep(s)) rumble(kit, out)
  })
}

function rumble({ ctx, gain, biq, noise }: Kit, out: AudioNode) {
  const t = ctx.currentTime + rand(1, 3), peak = rand(0.35, 0.5), len = rand(5.5, 7)
  const src = ctx.createBufferSource(), g = gain(0.0001)
  src.buffer = noise.brown
  src.start(t, rand(0, 4))
  src.stop(t + len + 0.2)
  g.gain.setValueAtTime(0.0001, t)
  g.gain.exponentialRampToValueAtTime(peak, t + 1.1)
  g.gain.exponentialRampToValueAtTime(peak * 0.45, t + 2.2)
  g.gain.exponentialRampToValueAtTime(peak * 0.8, t + 3)
  g.gain.exponentialRampToValueAtTime(0.0001, t + len)
  // Deux passe-bas en série : presque rien au-dessus de 300 Hz (le grondement d'un orage qui est loin, pas le craquement d'un éclair
  // proche), mais assez pour qu'un petit haut-parleur en laisse passer le roulement.
  src.connect(biq('lowpass', 240, 0.5)).connect(biq('lowpass', 320, 0.5)).connect(g).connect(out)
}

