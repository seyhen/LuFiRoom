import type { Room } from '../../rooms/types'
import { TAU, rand } from '../../math'
import type { Channel, Kit } from '../engine'

/**
 * La pluie sur la toile de la tente : le crépitement sourd et rond de milliers de gouttes sur un tissu tendu, tout près au-dessus de
 * la tête. Un son de base, continu et doux. Synthèse provisoire (un enregistrement viendra), et très différente de la météo : pas de
 * souffle de pluie, mais des impacts : chaque goutte est une petite claque feutrée (un bruit passé sous 1,2 kHz) qui fait chanter la
 * toile (une résonance grave, 140 à 300 Hz, qui s'éteint en une dizaine de millisecondes) ; quelques grosses gouttes de la canopée,
 * plus rondes et plus graves, tombent de loin en loin. Tout passe sous 2,4 kHz : aucun grain aigu.
 * La boucle (14 s, stéréo) est calculée une fois : les impacts s'enroulent sur la fin, donc aucune couture.
 */
export function canvasRain(ctx: BaseAudioContext, sec = 14) {
  const sr = ctx.sampleRate, N = Math.floor(sec * sr), buf = ctx.createBuffer(2, N, sr)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    // un impact de toile : la claque (bruit filtré) + la résonance de la toile
    const hit = (i0: number, amp: number, fres: number, ring: number, tone: number) => {
      const len = Math.floor((ring * 5) * sr), w = (TAU * fres) / sr, tau = ring * sr
      let lp = 0
      for (let n = 0; n < len; n++) {
        lp += (Math.random() * 2 - 1 - lp) * tone
        const env = Math.exp(-n / tau)
        d[(i0 + n) % N] += amp * env * (0.7 * Math.sin(w * n) + (n < 0.012 * sr ? 0.9 * lp * (1 - n / (0.012 * sr)) : 0))
      }
    }
    // les gouttes fines : 150 par seconde en moyenne, plus serrées par rafales (la densité suit deux houles lentes) ; assez serrées
    // pour faire un crépitement continu, sans trou, et d'une force presque égale (pas de claque isolée)
    const swell = (t: number) => 1 + 0.4 * Math.sin((TAU * 3 * t) / sec + c) + 0.2 * Math.sin((TAU * 7 * t) / sec + 1.3)
    for (let k = 0; k < sec * 220; k++) {
      const i0 = (Math.random() * N) | 0
      if (Math.random() > swell(i0 / sr) * 0.7) continue
      hit(i0, Math.pow(Math.random(), 1.3) * 0.3 + 0.05, rand(160, 320), rand(0.006, 0.014), rand(0.18, 0.4))
    }
    // les grosses gouttes de la canopée : rondes, graves, moins d'une par seconde, à peine plus fortes que le reste
    for (let k = 0; k < sec * 0.7; k++) hit((Math.random() * N) | 0, rand(0.22, 0.4), rand(110, 170), rand(0.03, 0.06), 0.1)
  }
  let pk = 0
  for (let c = 0; c < 2; c++) for (const v of buf.getChannelData(c)) pk = Math.max(pk, Math.abs(v))
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < d.length; i++) d[i] *= 0.8 / pk
  }
  return buf
}

export default function canvas(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.canvas, out, () => {
    const { ctx, gain, biq, osc, loop } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 2400, 0.5)).connect(out)
    // la pluie de toile, deux lectures décalées qui ne s'entendent jamais revenir ensemble
    const a = gain(0.5), b = gain(0.35)
    const buf = canvasRain(ctx)
    loop(buf, 0).connect(a).connect(bus)
    loop(buf, 6.1).connect(biq('lowpass', 1500, 0.4)).connect(b).connect(bus)
    // un souffle de pluie très doux qui comble les silences entre les gouttes
    loop(kit.noise.pink, 2.3).connect(biq('lowpass', 900, 0.5)).connect(gain(0.05)).connect(bus)
    // la houle de la pluie : le niveau respire doucement
    for (const [f, depth] of [[0.05, 0.1], [0.13, 0.05]] as const) {
      const lfo = osc('sine', f)
      lfo.connect(gain(depth)).connect(a.gain)
      lfo.start()
    }
  })
}
