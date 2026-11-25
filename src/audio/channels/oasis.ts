import type { Room } from '../../rooms/types'
import { TAU, rand } from '../../math'
import type { Kit } from '../engine'

/**
 * La source de l'oasis : un filet d'eau qui tombe d'une pierre dans la mare, et le clapotis rond de l'eau calme contre les galets.
 * Un son de base, continu et doux. Synthèse provisoire (un enregistrement viendra). Plus grave et plus lent qu'un ruisseau : de gros
 * « bloups » ronds (un sinus de 150 à 420 Hz qui monte d'un quart en 60 à 140 ms, attaque douce, extinction lente) tous les quarts de
 * seconde environ, des gouttes plus fines par-dessus (500 à 1 100 Hz, rares) et le filet lui-même, un bruit rose entre 0,9 et 2,6 kHz
 * qui frétille. La boucle (30 s, stéréo) est calculée une fois ; tout s'enroule sur sa fin, donc aucune couture. Tout passe sous 2,8 kHz.
 */
export function pondLap(ctx: BaseAudioContext, sec = 30) {
  const sr = ctx.sampleRate, N = Math.floor(sec * sr), buf = ctx.createBuffer(2, N, sr)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    // une bulle : un sinus qui monte, attaque douce, extinction lente
    const bloop = (t: number, f0: number, len: number, amp: number, rise: number) => {
      const n0 = Math.floor(t * sr), n = Math.floor(len * sr)
      let ph = 0
      for (let i = 0; i < n; i++) {
        const k = i / n, f = f0 * (1 + rise * Math.min(1, k * 1.6))
        ph += (TAU * f) / sr
        d[(n0 + i) % N] += amp * Math.min(1, i / (0.008 * sr), (n - i) / (0.012 * sr)) * Math.exp(-3.4 * k) * Math.sin(ph) // attaque 8 ms, fin fondue sur 12 ms : aucun cran où la bulle s'arrête
      }
    }
    // la densité des bloups respire (deux houles lentes qui divisent la boucle en nombres entiers)
    const dens = (t: number) => 0.7 + 0.3 * Math.sin((TAU * 2 * t) / sec + c) + 0.15 * Math.sin((TAU * 5 * t) / sec + 1.1)
    for (let k = 0; k < sec * 4.2; k++) {
      const t = Math.random() * sec
      if (Math.random() > dens(t)) continue
      bloop(t, rand(150, 420), rand(0.06, 0.14), rand(0.18, 0.34), 0.25)
    }
    // les gouttes du filet, plus fines et plus rares
    for (let k = 0; k < sec * 2.2; k++) bloop(Math.random() * sec, rand(500, 1100), rand(0.025, 0.05), rand(0.05, 0.12), 0.5)
    // le filet : un bruit rose filtré (deux pôles), dont la force frétille
    const F = Math.floor(0.3 * sr), tmp = new Float32Array(N + F)
    let a = 0, b = 0, hp = 0, lp = 0
    for (let i = 0; i < N + F; i++) {
      const w = Math.random() * 2 - 1
      a += (w - a) * 0.34 // passe-bas ~ 2,6 kHz
      b += (a - b) * 0.34
      hp += (b - hp) * 0.1 // on retire le grave (< 0,9 kHz)
      lp = b - hp
      const t = (i % N) / sr
      tmp[i] = lp * 0.2 * (0.65 + 0.35 * Math.sin((TAU * 9 * t) / sec + c * 2) * Math.sin((TAU * 23 * t) / sec + 0.4))
    }
    for (let i = 0; i < N; i++) {
      const w = i < F ? (i / F) * (Math.PI / 2) : -1
      d[i] += w < 0 ? tmp[i] : tmp[i] * Math.sin(w) + tmp[N + i] * Math.cos(w)
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

export default function oasis(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.loopOrChannel(loops.oasis, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 2800, 0.5)).connect(out)
    // la mare calme : un clapotis très bas sous le reste
    loop(noise.brown, rand(0, 5)).connect(biq('bandpass', 180, 0.8)).connect(gain(0.16)).connect(bus)
    // les bloups et le filet, deux lectures décalées dont le niveau respire à des rythmes différents
    const buf = pondLap(ctx)
    for (const [offset, lvl, rate] of [[0, 0.6, 0.043], [13.3, 0.32, 0.071]] as const) {
      const v = gain(lvl)
      loop(buf, offset).connect(v).connect(bus)
      const lfo = osc('sine', rate)
      lfo.connect(gain(lvl * 0.25)).connect(v.gain)
      lfo.start()
    }
  })
}
