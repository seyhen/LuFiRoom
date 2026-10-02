// Génère les bruits colorés (blanc, rose, brun, bleu, violet) en stéréo, 20 s chacun, dans audio-src/noise/.
// Puis `npm run audio` les encode dans public/audio/noise/. Un bruit n'a pas de licence : il est calculé ici, sans ffmpeg,
// avec un générateur pseudo-aléatoire à graine (les fichiers sont identiques à chaque exécution).
//
//   blanc : même énergie à toutes les fréquences     rose : -3 dB par octave (le plus « naturel »)
//   brun : -6 dB par octave (grondement, cascade)    bleu : +3 dB par octave     violet : +6 dB par octave (très aigu)
//
// Usage : npm run noises

import { mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const OUT = join('audio-src', 'noise'), SEC = 20, RATE = 48000, PEAK = 0.5

/** Générateur pseudo-aléatoire (mulberry32), valeurs dans [-1, 1[. */
function rng(seed) {
  let a = seed >>> 0
  return () => {
    a = (a + 0x6d2b79f5) >>> 0
    let t = a
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 2147483648 - 1
  }
}

// Chaque générateur renvoie une fonction qui donne l'échantillon suivant.
const white = (seed) => rng(seed)

/** Bruit rose : filtre de Paul Kellet (précis à ±0.05 dB de 10 Hz à Nyquist). */
function pink(seed) {
  const r = rng(seed)
  let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0
  return () => {
    const w = r()
    b0 = 0.99886 * b0 + w * 0.0555179
    b1 = 0.99332 * b1 + w * 0.0750759
    b2 = 0.969 * b2 + w * 0.153852
    b3 = 0.8665 * b3 + w * 0.3104856
    b4 = 0.55 * b4 + w * 0.5329522
    b5 = -0.7616 * b5 - w * 0.016898
    const out = b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362
    b6 = w * 0.115926
    return out
  }
}

/** Bruit brun : le blanc intégré, avec une fuite qui l'empêche de dériver. */
function brown(seed) {
  const r = rng(seed)
  let l = 0
  return () => (l = (l + 0.02 * r()) / 1.02)
}

/** Dérivée première : ajoute +6 dB par octave (blanc -> violet, rose -> bleu). */
function diff(gen) {
  let prev = 0
  return () => {
    const x = gen()
    const d = x - prev
    prev = x
    return d
  }
}

const COLORS = {
  white: (s) => white(s),
  pink: (s) => pink(s),
  brown: (s) => brown(s),
  blue: (s) => diff(pink(s)),
  violet: (s) => diff(white(s)),
}

/** WAV PCM 16 bits stéréo. */
function wav(left, right) {
  const n = left.length, data = Buffer.alloc(n * 4), head = Buffer.alloc(44)
  head.write('RIFF', 0); head.writeUInt32LE(36 + data.length, 4); head.write('WAVEfmt ', 8)
  head.writeUInt32LE(16, 16); head.writeUInt16LE(1, 20); head.writeUInt16LE(2, 22)
  head.writeUInt32LE(RATE, 24); head.writeUInt32LE(RATE * 4, 28); head.writeUInt16LE(4, 32); head.writeUInt16LE(16, 34)
  head.write('data', 36); head.writeUInt32LE(data.length, 40)
  for (let i = 0; i < n; i++) {
    data.writeInt16LE(Math.round(left[i] * 32767), i * 4)
    data.writeInt16LE(Math.round(right[i] * 32767), i * 4 + 2)
  }
  return Buffer.concat([head, data])
}

mkdirSync(OUT, { recursive: true })
let seed = 100
for (const [color, make] of Object.entries(COLORS)) {
  // Deux canaux de graines différentes : un bruit stéréo large, pas un mono dédoublé.
  const ch = [0, 1].map(() => {
    const gen = make(seed++), x = new Float32Array(SEC * RATE)
    for (let i = 0; i < 2000; i++) gen() // on laisse les filtres se stabiliser
    for (let i = 0; i < x.length; i++) x[i] = gen()
    return x
  })
  // Un seul gain pour les deux canaux : crête à PEAK.
  const pk = Math.max(...ch.map((x) => x.reduce((m, v) => Math.max(m, Math.abs(v)), 0)))
  for (const x of ch) for (let i = 0; i < x.length; i++) x[i] *= PEAK / pk
  const file = join(OUT, `${color}.wav`)
  writeFileSync(file, wav(ch[0], ch[1]))
  console.log(file)
}
console.log('Maintenant : npm run audio')
