import type { Room } from '../../rooms/types'
import { TAU, rand } from '../../math'
import type { Kit } from '../engine'

/**
 * Le percolateur sur son réchaud : l'eau chaude qui monte dans le tube et retombe sur le café, en glouglous ronds qui reviennent par
 * cycles, sous le souffle bas de la flamme. Un son de base, continu et doux. Synthèse provisoire (un enregistrement viendra).
 * La boucle (15 s, stéréo) est calculée une fois : des bulles rondes (un sinus qui monte de 280-620 Hz d'un tiers en 40 à 90 ms,
 * attaque douce, extinction vive), plus nombreuses à chaque montée du café (trois cycles de 5 s : la densité grimpe, s'étale, retombe),
 * un frémissement de l'eau (bruit rose filtré) qui suit les cycles. Tout passe sous 1,6 kHz.
 */
export function percolatorBubbles(ctx: BaseAudioContext, sec = 15) {
  const sr = ctx.sampleRate, N = Math.floor(sec * sr), buf = ctx.createBuffer(2, N, sr)
  const cycle = sec / 3
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    const density = (t: number) => 0.25 + 0.75 * Math.pow(Math.sin((Math.PI * ((t % cycle) / cycle)) ** 1), 2)
    // les bulles
    for (let k = 0; k < sec * 6; k++) {
      const t = Math.random() * sec
      if (Math.random() > density(t)) continue
      const f0 = rand(280, 620), len = Math.floor(rand(0.04, 0.09) * sr), amp = rand(0.1, 0.26), i0 = Math.floor(t * sr)
      let ph = 0
      for (let n = 0; n < len; n++) {
        const k2 = n / len, f = f0 * (1 + 0.35 * Math.min(1, k2 * 1.5))
        ph += (TAU * f) / sr
        const env = Math.min(1, n / (0.006 * sr)) * Math.exp(-4.2 * k2)
        d[(i0 + n) % N] += amp * env * Math.sin(ph)
      }
    }
    // le frémissement : un bruit rose lent, filtré, dont l'amplitude suit les montées ; on le calcule 0,25 s de plus et on fond la queue
    // dans la tête (comme `loopBuffer`) : sans cela, le filtre repart de zéro et la boucle claque à sa couture
    const F = Math.floor(0.25 * sr), tmp = new Float32Array(N + F)
    let lp = 0, lp2 = 0
    for (let i = 0; i < N + F; i++) {
      lp += (Math.random() * 2 - 1 - lp) * 0.2
      lp2 += (lp - lp2) * 0.2
      tmp[i] = lp2 * 0.12 * (0.4 + density((i % N) / sr))
    }
    for (let i = 0; i < N; i++) {
      const a = i < F ? ((i / F) * Math.PI) / 2 : -1
      d[i] += a < 0 ? tmp[i] : tmp[i] * Math.sin(a) + tmp[N + i] * Math.cos(a)
    }
  }
  let pk = 0
  for (let c = 0; c < 2; c++) for (const v of buf.getChannelData(c)) pk = Math.max(pk, Math.abs(v))
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    for (let i = 0; i < d.length; i++) d[i] *= 0.75 / pk
  }
  return buf
}

export default function percolator(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.loopOrChannel(loops.percolator, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 1600, 0.5)).connect(out)
    // la flamme du brûleur : un souffle bas, presque inaudible
    loop(noise.pink, rand(0, 4)).connect(biq('bandpass', 420, 0.5)).connect(gain(0.05)).connect(bus)
    // les glouglous, deux lectures décalées
    const buf = percolatorBubbles(ctx)
    for (const [offset, lvl] of [[0, 0.7], [7.4, 0.35]] as const) loop(buf, offset).connect(gain(lvl)).connect(bus)
    const lfo = osc('sine', 0.06)
    lfo.connect(gain(0.02)).connect(bus.gain)
    lfo.start()
  })
}
