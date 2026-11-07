import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import type { Kit } from '../engine'

/**
 * Les cigales d'une après-midi d'été, dans le chêne : un son de base, continu et doux, pour s'endormir au hamac. Enregistré, ou
 * synthétisé (provisoire : il se remplacera par un enregistrement). Quatre « voix » de bruit filtré dans le haut-médium, chacune
 * gonflée et rentrée par une houle lente (jamais en phase avec les autres), avec un grésillement très rapide dessous ; un fond d'air
 * feuillu, grave, sous le tout. Rien de strident : tout est filtré sous 5 kHz et le niveau reste bas.
 */
export default function cicadas(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.loopOrChannel(loops.cicadas, out, () => {
    const { gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 4800, 0.5)).connect(out)
    // l'air du sous-bois
    loop(noise.pink, rand(0, 3)).connect(biq('lowpass', 800, 0.5)).connect(gain(0.05)).connect(bus)
    for (const [f, q, lvl, swell, trill] of [
      [3100, 7, 0.05, 0.11, 21],
      [3700, 8, 0.04, 0.17, 26],
      [4300, 9, 0.03, 0.23, 18],
      [2700, 6, 0.04, 0.07, 24],
    ] as const) {
      // la voix : un bruit en passe-bande, dont le niveau suit une houle lente et dont l'amplitude grésille
      const voice = gain(lvl)
      loop(noise.white, rand(0, 3)).connect(biq('bandpass', f, q)).connect(voice).connect(bus)
      const slow = osc('sine', swell), slowD = gain(lvl * 0.7)
      slow.connect(slowD).connect(voice.gain)
      slow.start()
      const fast = osc('sine', trill), fastD = gain(lvl * 0.3)
      fast.connect(fastD).connect(voice.gain)
      fast.start()
    }
  })
}
