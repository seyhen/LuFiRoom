// Repli du bruit (src/audio/noiseGen.ts) : pentes spectrales, absence de couture, canaux décorrélés.
import test from 'node:test'
import assert from 'node:assert/strict'
import { noiseBuffers } from '../src/audio/noiseGen.ts'

const SR = 16000, SEC = 8, FADE = 1
const ctx = { sampleRate: SR, createBuffer: (ch, n) => { const d = Array.from({ length: ch }, () => new Float32Array(n)); return { length: n, numberOfChannels: ch, getChannelData: (c) => d[c] } } }
const bufs = noiseBuffers(ctx, SEC, FADE)

/** FFT radix-2 en place. */
function fft(re, im) {
  const n = re.length
  for (let i = 1, j = 0; i < n; i++) {
    let bit = n >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]] }
  }
  for (let len = 2; len <= n; len <<= 1) {
    const a = (-2 * Math.PI) / len
    for (let i = 0; i < n; i += len) for (let k = 0; k < len / 2; k++) {
      const wr = Math.cos(a * k), wi = Math.sin(a * k)
      const u = i + k, v = i + k + len / 2
      const xr = re[v] * wr - im[v] * wi, xi = re[v] * wi + im[v] * wr
      re[v] = re[u] - xr; im[v] = im[u] - xi; re[u] += xr; im[u] += xi
    }
  }
}

/** Pente (dB par octave) de la densité de puissance entre 100 Hz et 4 kHz, par moyenne de fenêtres de Hann (Welch) et régression sur log2 f. */
function slope(x, top = 4000) {
  const N = 4096, P = new Float64Array(N / 2)
  let count = 0
  for (let o = 0; o + N <= x.length; o += N) {
    const re = new Float64Array(N), im = new Float64Array(N)
    for (let i = 0; i < N; i++) re[i] = x[o + i] * (0.5 - 0.5 * Math.cos((2 * Math.PI * i) / N))
    fft(re, im)
    for (let k = 0; k < N / 2; k++) P[k] += re[k] ** 2 + im[k] ** 2
    count++
  }
  const pts = []
  for (let k = 1; k < N / 2; k++) {
    const f = (k * SR) / N
    if (f >= 100 && f <= top) pts.push([Math.log2(f), 10 * Math.log10(P[k] / count)])
  }
  const mx = pts.reduce((s, p) => s + p[0], 0) / pts.length, my = pts.reduce((s, p) => s + p[1], 0) / pts.length
  return pts.reduce((s, p) => s + (p[0] - mx) * (p[1] - my), 0) / pts.reduce((s, p) => s + (p[0] - mx) ** 2, 0)
}

test('tampons : cinq couleurs, stéréo, 30 s par défaut = sec × fréquence', () => {
  for (const c of ['white', 'pink', 'brown', 'blue', 'violet']) {
    assert.equal(bufs[c].numberOfChannels, 2)
    assert.equal(bufs[c].length, SEC * SR)
  }
  assert.equal(noiseBuffers(ctx).white.length, 30 * SR)
})

test('pentes spectrales : blanc ≈ 0, rose ≈ -3, brun ≈ -6, bleu ≈ +3, violet ≈ +6 dB/octave', () => {
  for (const c of [0, 1]) {
    // On saute le fondu de la tête (1 s) pour ne mesurer que du bruit pur.
    const tail = (b) => b.getChannelData(c).subarray(FADE * SR)
    assert.ok(Math.abs(slope(tail(bufs.white))) < 0.4, `blanc ${slope(tail(bufs.white))}`)
    assert.ok(Math.abs(slope(tail(bufs.pink)) + 3) < 0.5, `rose ${slope(tail(bufs.pink))}`)
    assert.ok(Math.abs(slope(tail(bufs.brown)) + 6) < 0.7, `brun ${slope(tail(bufs.brown))}`)
    // bleu et violet : dérivées du rose et du blanc ; on mesure jusqu'à 2 kHz, où la différence finie suit encore la pente idéale (fréquence d'échantillonnage du test : 16 kHz)
    assert.ok(Math.abs(slope(tail(bufs.blue), 2000) - 3) < 0.7, `bleu ${slope(tail(bufs.blue), 2000)}`)
    assert.ok(Math.abs(slope(tail(bufs.violet), 2000) - 6) < 0.7, `violet ${slope(tail(bufs.violet), 2000)}`)
  }
})

test('sans couture : le saut fin → début est du même ordre que le pas entre deux échantillons voisins', () => {
  for (const c of ['white', 'pink', 'brown', 'blue', 'violet']) {
    const x = bufs[c].getChannelData(0)
    let s = 0
    for (let i = 1; i < x.length; i++) s += (x[i] - x[i - 1]) ** 2
    const rmsStep = Math.sqrt(s / (x.length - 1))
    assert.ok(Math.abs(x[0] - x[x.length - 1]) < 6 * rmsStep, c)
  }
})

test('fondu à puissance constante : pas de creux ni de bosse sur la tête du tampon', () => {
  const rms = (a) => Math.sqrt(a.reduce((s, v) => s + v * v, 0) / a.length)
  // Blanc seulement : le rose et le brun dérivent lentement, leur puissance par seconde varie d'elle-même.
  for (const c of ['white']) {
    const x = bufs[c].getChannelData(0), F = FADE * SR
    const head = rms(x.subarray(0, F)), body = rms(x.subarray(F, 2 * F))
    assert.ok(head / body > 0.8 && head / body < 1.2, `${c} ${head / body}`)
  }
})

test('stéréo décorrélée, sans silence ni valeur infinie', () => {
  for (const c of ['white', 'pink', 'brown', 'blue', 'violet']) {
    const L = bufs[c].getChannelData(0), R = bufs[c].getChannelData(1)
    // Corrélation des différences : deux marches aléatoires indépendantes (brun) se ressemblent par hasard, pas leurs variations.
    let lr = 0, ll = 0, rr = 0, peak = 0
    for (let i = 1; i < L.length; i++) {
      const dl = L[i] - L[i - 1], dr = R[i] - R[i - 1]
      lr += dl * dr; ll += dl ** 2; rr += dr ** 2
      peak = Math.max(peak, Math.abs(L[i]), Math.abs(R[i]))
    }
    assert.ok(Math.abs(lr / Math.sqrt(ll * rr)) < 0.1, `${c} corrélation`)
    assert.ok(ll > 0 && rr > 0)
    assert.ok(Number.isFinite(peak) && peak > 0.05, `${c} crête ${peak}`)
  }
})
