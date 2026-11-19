import type { Room } from '../../rooms/types'
import { TAU, rand } from '../../math'
import type { Channel, Kit } from '../engine'

/**
 * La mousse du bain : le pétillement des milliers de petites bulles qui éclatent, comme une coupe de champagne très douce. Un son de
 * base, continu : une boucle de 12 s (stéréo) de minuscules éclats (3 à 8 ms, 3 à 7 kHz, d'intensités inégales, environ 150 par seconde,
 * repartis au hasard à gauche et à droite) sur un voile de bruit très clair, le tout passé sous 7,5 kHz pour rester rond. Les éclats
 * sont si serrés qu'on n'entend jamais de rythme, ni le retour de la boucle. Synthèse provisoire (un enregistrement viendra,
 * `loops.suds`).
 */
function makeFizz(ctx: BaseAudioContext) {
  const sr = ctx.sampleRate, N = Math.floor(12 * sr), buf = ctx.createBuffer(2, N, sr)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c), n = Math.floor(12 * 150)
    for (let k = 0; k < n; k++) {
      // la plupart sont faibles, quelques-uns plus francs
      const at = Math.floor(Math.random() * N), f = rand(3000, 7000), len = Math.floor(rand(0.003, 0.008) * sr), a = (Math.random() ** 1.6) * 0.7 + 0.2
      const ph = rand(0, TAU)
      for (let i = 0; i < len; i++) d[(at + i) % N] += Math.sin(ph + (TAU * f * i) / sr) * Math.exp((-6 * i) / len) * a
    }
  }
  return buf
}

export default function suds(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.suds, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 7500, 0.5)).connect(biq('highpass', 1800, 0.5)).connect(out)
    // les éclats
    const pops = gain(0.07)
    loop(makeFizz(ctx), rand(0, 12)).connect(pops).connect(bus)
    const swell = osc('sine', 0.09)
    swell.connect(gain(0.015)).connect(pops.gain)
    swell.start()
    // le voile : la mousse qui bruit
    const veil = gain(0.08)
    loop(noise.white, 2.4).connect(biq('bandpass', 5200, 0.5)).connect(veil).connect(bus)
    const breath = osc('sine', 0.15)
    breath.connect(gain(0.025)).connect(veil.gain)
    breath.start()
  })
}
