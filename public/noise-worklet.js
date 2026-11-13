// Le bruit de la carte « Bruit » (src/audio/channels/noise.ts), généré en direct : aucune boucle, aucun fichier à télécharger.
// Trois sorties stéréo (0 blanc, 1 rose, 2 brun), deux canaux décorrélés ; le vert, les filtres et le passe-haut sont dans le graphe.
// Les mêmes formules sont dans src/audio/noiseGen.ts (le repli sans AudioWorklet) : garde-les d'accord.
// Niveaux calés pour une même sonie (pondération A, après le passe-haut de 25 Hz) ; le brun garde un peu plus de puissance brute pour ses graves.
const GAIN = { white: 0.3464, pink: 0.134, brown: 0.075 }
const LEAK = 0.9995 // brun : intégrateur à fuite, coupure vers 3,8 Hz (le passe-haut de 25 Hz ôte la dérive)

// xorshift32 : léger, sans coût d'allocation, une graine par canal pour qu'ils ne se ressemblent pas.
const rng = (seed) => {
  let s = seed | 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 2147483648 - 1
  }
}

class Voice {
  constructor(seed) {
    this.r = rng(seed)
    this.b0 = this.b1 = this.b2 = this.b3 = this.b4 = this.b5 = this.b6 = 0
    this.brown = 0
  }
}

class LufiNoise extends AudioWorkletProcessor {
  constructor() {
    super()
    const base = (Math.random() * 2147483647) | 0
    this.v = [new Voice(base ^ 0x9e3779b9), new Voice(base ^ 0x7f4a7c15)]
  }
  process(_in, out) {
    for (let c = 0; c < 2; c++) {
      const v = this.v[c], r = v.r
      const w = out[0][c], p = out[1][c], b = out[2][c]
      if (!w || !p || !b) continue
      for (let i = 0; i < w.length; i++) {
        const x = r()
        // rose : filtre de Paul Kellet (version raffinée), −3 dB par octave
        v.b0 = 0.99886 * v.b0 + x * 0.0555179
        v.b1 = 0.99332 * v.b1 + x * 0.0750759
        v.b2 = 0.969 * v.b2 + x * 0.153852
        v.b3 = 0.8665 * v.b3 + x * 0.3104856
        v.b4 = 0.55 * v.b4 + x * 0.5329522
        v.b5 = -0.7616 * v.b5 - x * 0.016898
        const pink = v.b0 + v.b1 + v.b2 + v.b3 + v.b4 + v.b5 + v.b6 + x * 0.5362
        v.b6 = x * 0.115926
        // brun : intégrale du blanc, −6 dB par octave
        v.brown = LEAK * v.brown + x
        w[i] = x * GAIN.white
        p[i] = pink * GAIN.pink
        b[i] = v.brown * GAIN.brown
      }
    }
    return true
  }
}
registerProcessor('lufi-noise', LufiNoise)
