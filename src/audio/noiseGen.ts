// Repli du bruit (carte « Bruit ») quand l'AudioWorklet manque ou échoue : les mêmes formules que public/noise-worklet.js, écrites
// dans de longs tampons (30 s) sans couture. Garde les deux d'accord.

/** Niveaux de chaque couleur, calés pour une même sonie (voir public/noise-worklet.js). */
export const NOISE_GAIN = { white: 0.3464, pink: 0.134, brown: 0.075 }
/** Le vert : le blanc dans une bande large autour de 500 Hz, remonté pour valoir les autres en sonie. */
export const GREEN = { freq: 500, q: 0.7, makeup: 3.8 }
const LEAK = 0.9995

const rng = (seed: number) => {
  let s = seed | 0 || 1
  return () => {
    s ^= s << 13
    s ^= s >>> 17
    s ^= s << 5
    return (s >>> 0) / 2147483648 - 1
  }
}

/** Trois tampons stéréo (blanc, rose, brun) de `sec` secondes, bouclant sans couture : la queue fond dans la tête (puissance constante). */
export function noiseBuffers(ctx: BaseAudioContext, sec = 30, fade = 1) {
  const sr = ctx.sampleRate, N = Math.floor(sec * sr), F = Math.floor(fade * sr)
  const bufs = { white: ctx.createBuffer(2, N, sr), pink: ctx.createBuffer(2, N, sr), brown: ctx.createBuffer(2, N, sr) }
  const seed = (Math.random() * 2147483647) | 0
  for (let c = 0; c < 2; c++) {
    const r = rng(seed ^ (c ? 0x7f4a7c15 : 0x9e3779b9))
    const w = new Float32Array(N + F), p = new Float32Array(N + F), b = new Float32Array(N + F)
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0, br = 0
    for (let i = 0; i < N + F; i++) {
      const x = r()
      b0 = 0.99886 * b0 + x * 0.0555179
      b1 = 0.99332 * b1 + x * 0.0750759
      b2 = 0.969 * b2 + x * 0.153852
      b3 = 0.8665 * b3 + x * 0.3104856
      b4 = 0.55 * b4 + x * 0.5329522
      b5 = -0.7616 * b5 - x * 0.016898
      const pink = b0 + b1 + b2 + b3 + b4 + b5 + b6 + x * 0.5362
      b6 = x * 0.115926
      br = LEAK * br + x
      w[i] = x * NOISE_GAIN.white
      p[i] = pink * NOISE_GAIN.pink
      b[i] = br * NOISE_GAIN.brown
    }
    for (const [name, tmp] of [['white', w], ['pink', p], ['brown', b]] as const) {
      const out = bufs[name].getChannelData(c)
      out.set(tmp.subarray(0, N))
      for (let i = 0; i < F; i++) {
        const a = ((i / F) * Math.PI) / 2
        out[i] = tmp[i] * Math.sin(a) + tmp[N + i] * Math.cos(a)
      }
    }
  }
  return bufs
}
