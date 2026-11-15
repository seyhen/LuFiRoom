import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * La fontaine du parc, derrière le verre de la serre : un jet qui retombe dans un bassin de pierre. Enregistrée (60 s en boucle),
 * ou synthétisée : un souffle d'eau clair (bruit rose resserré autour de 2,4 kHz) dont le niveau ondule doucement, et un clapotis
 * plus grave dessous. Continu et doux : pas de goutte isolée.
 */
export default function fountain(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  return kit.loopOrChannel(loops.fountain, out, () => {
    const spray = gain(0.09)
    loop(noise.pink, 0.6).connect(biq('bandpass', 2400, 0.8)).connect(spray).connect(out)
    const sway = osc('sine', 0.13)
    sway.connect(gain(0.03)).connect(spray.gain)
    sway.start()
    loop(noise.pink, 2.7).connect(biq('lowpass', 700, 0.6)).connect(gain(0.08)).connect(out)
  })
}
