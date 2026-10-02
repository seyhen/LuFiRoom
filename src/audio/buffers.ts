import { TAU, rand } from '../math'

// Sons générés une fois en mémoire : bruits en boucle sans couture, gouttes, crépitement, ronron.

/** Ramène la crête de chaque canal à `peak`. */
function normalize(buf: AudioBuffer, peak: number) {
  for (let c = 0; c < buf.numberOfChannels; c++) {
    const d = buf.getChannelData(c)
    let pk = 0
    for (let i = 0; i < d.length; i++) pk = Math.max(pk, Math.abs(d[i]))
    if (pk > 0) {
      const s = peak / pk
      for (let i = 0; i < d.length; i++) d[i] *= s
    }
  }
  return buf
}

/** Boucle stéréo sans couture : on génère N + F échantillons et on fond la queue dans la tête (puissance constante). */
export function loopBuffer(ctx: BaseAudioContext, sec: number, makeGen: () => () => number, fade = 0.25, peak = 0.8) {
  const sr = ctx.sampleRate, N = Math.floor(sec * sr), F = Math.floor(fade * sr)
  const buf = ctx.createBuffer(2, N, sr)
  for (let c = 0; c < 2; c++) {
    const gen = makeGen(), tmp = new Float32Array(N + F)
    for (let i = 0; i < N + F; i++) tmp[i] = gen()
    const out = buf.getChannelData(c)
    out.set(tmp.subarray(0, N))
    for (let i = 0; i < F; i++) {
      const a = ((i / F) * Math.PI) / 2
      out[i] = tmp[i] * Math.sin(a) + tmp[N + i] * Math.cos(a)
    }
  }
  return normalize(buf, peak)
}

export const whiteGen = () => () => Math.random() * 2 - 1

/** Bruit rose, filtre de Paul Kellet. */
export function pinkGen() {
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  return () => {
    const w = Math.random() * 2 - 1
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.969 * b2 + w * 0.153852
    b3 = 0.8665 * b3 + w * 0.3104856
    b4 = 0.55 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.016898
    const out = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11
    b6 = w * 0.115926
    return out
  }
}

export function brownGen() {
  let l = 0
  return () => {
    l = (l + 0.02 * (Math.random() * 2 - 1)) / 1.02
    return l * 3.5
  }
}

/** Gouttes sur la vitre : 60 pings sinus par seconde, aigus et très courts. */
export function dropletBuffer(ctx: BaseAudioContext, sec = 8) {
  const sr = ctx.sampleRate, N = Math.floor(sec * sr), buf = ctx.createBuffer(2, N, sr)
  const L = buf.getChannelData(0), R = buf.getChannelData(1)
  for (let k = 0; k < sec * 60; k++) {
    const t0 = (Math.random() * N) | 0, f = rand(1400, 5400), tau = rand(0.0015, 0.006) * sr
    const amp = Math.pow(Math.random(), 2.2) * 0.7 + 0.02, pan = Math.random(), len = (tau * 5) | 0, w = (TAU * f) / sr
    for (let n = 0; n < len; n++) {
      const v = amp * Math.exp(-n / tau) * Math.sin(w * n * (1 - (n / len) * 0.15))
      const i = (t0 + n) % N
      L[i] += v * (1 - pan * 0.7)
      R[i] += v * (0.3 + pan * 0.7)
    }
  }
  return normalize(buf, 0.8)
}

/** Crépitement de vinyle. */
export function crackleBuffer(ctx: BaseAudioContext, sec = 7) {
  const sr = ctx.sampleRate, N = Math.floor(sec * sr), buf = ctx.createBuffer(2, N, sr)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    let lp = 0
    for (let i = 0; i < N; i++) {
      lp += (Math.random() * 2 - 1 - lp) * 0.25
      d[i] = lp * 0.035
    }
    for (let k = 0; k < sec * 16; k++) {
      const i0 = (Math.random() * N) | 0, a = Math.pow(Math.random(), 3) * 0.9 * (Math.random() < 0.5 ? -1 : 1), len = 2 + ((Math.random() * 30) | 0)
      for (let n = 0; n < len; n++) d[(i0 + n) % N] += a * Math.exp(-n / (len * 0.3))
    }
  }
  return normalize(buf, 0.7)
}

/** Ronron : 2 cycles de 2.7 s (inspiration à 27 Hz, pause, expiration à 23.5 Hz). */
export function purrBuffer(ctx: BaseAudioContext) {
  const sr = ctx.sampleRate, cyc = 2.7, N = Math.floor(cyc * 2 * sr), buf = ctx.createBuffer(2, N, sr)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    let ph = 0, lp = 0, lp2 = 0
    for (let i = 0; i < N; i++) {
      const p = ((i / sr) % cyc) / cyc
      let env = 0, rate = 25
      if (p < 0.4) {
        env = Math.sin((Math.PI * p) / 0.4) * 0.6
        rate = 27
      } else if (p > 0.47 && p < 0.93) {
        env = Math.sin((Math.PI * (p - 0.47)) / 0.46)
        rate = 23.5
      }
      ph += rate / sr
      const pulse = Math.pow(0.5 + 0.5 * Math.sin(TAU * ph), 3)
      lp += (Math.random() * 2 - 1 - lp) * 0.06
      lp2 += (lp - lp2) * 0.08
      d[i] = lp2 * pulse * env
    }
  }
  return normalize(buf, 0.8)
}

/** Réponse impulsionnelle pour la réverbération (bruit qui décroît). */
export function impulse(ctx: BaseAudioContext, sec: number, decay: number) {
  const sr = ctx.sampleRate, N = Math.floor(sec * sr), b = ctx.createBuffer(2, N, sr)
  for (let c = 0; c < 2; c++) {
    const d = b.getChannelData(c)
    for (let i = 0; i < N; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / N, decay)
  }
  return b
}

/** Courbe de saturation douce tanh(kx). */
export function satCurve(k: number) {
  const n = 1024, c = new Float32Array(n)
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1
    c[i] = Math.tanh(k * x) / Math.tanh(k)
  }
  return c
}
