import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * Les méduses qui chantent, dans le courant devant le hublot : un chœur très doux et très lointain, comme du verre qu'on frôle. Enregistré
 * (48 s, une nappe lente) ; le repli synthétisé (provisoire) est un accord de quintes pures dont chaque voix gonfle et se retire à son
 * rythme, un peu désaccordée pour scintiller. Continu et doux : pas de note isolée.
 */
export default function jellies(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, osc, biq } = kit
  return kit.loopOrChannel(loops.jellies, out, () => {
    const lp = biq('lowpass', 1800, 0.4)
    lp.connect(out)
    for (const [i, f] of [262, 392, 523, 784].entries()) {
      for (const d of [-1.2, 1.2]) {
        const o = osc('sine', f + d), amp = gain(0.005)
        o.connect(amp).connect(lp)
        const swell = osc('sine', 0.04 + i * 0.023)
        swell.connect(gain(0.004)).connect(amp.gain)
        o.start()
        swell.start()
      }
    }
  })
}
