import type { Room } from '../../rooms/types'
import { TAU, rand } from '../../math'
import type { Kit } from '../engine'

/**
 * Les grillons d'une nuit d'été, dans les fougères derrière la tente : un chœur lointain et doux, qu'on laisse jouer pour s'endormir.
 * Un son de base, continu. Synthèse provisoire (un enregistrement viendra). Sept grillons, chacun avec sa hauteur (2,0 à 2,7 kHz,
 * volontairement plus bas et plus ronds que dans la nature) et sa cadence : un « tri-li-li » de trois battements, une pause, de
 * nouveau, avec une cadence qui divise la boucle de 24 s en un nombre entier de chants (aucune couture). Ils se chevauchent sans
 * jamais se synchroniser, comme un chœur. Tout est passé sous 4 kHz, avec un souffle d'air nocturne très doux dessous.
 */
export function cricketChorus(ctx: BaseAudioContext, sec = 24) {
  const sr = ctx.sampleRate, N = Math.floor(sec * sr), buf = ctx.createBuffer(2, N, sr)
  // [chants par boucle, hauteur Hz, niveau, panoramique -1..1, phase 0..1]
  const voices: [number, number, number, number, number][] = [
    [19, 2150, 0.22, -0.7, 0.1], [23, 2400, 0.18, 0.6, 0.43], [17, 2050, 0.2, -0.2, 0.71], [29, 2600, 0.12, 0.8, 0.27],
    [21, 2250, 0.17, 0.2, 0.9], [13, 2100, 0.15, -0.9, 0.58], [26, 2700, 0.1, 0.4, 0.05],
  ]
  const L = buf.getChannelData(0), R = buf.getChannelData(1)
  for (const [chants, f, lvl, pan, ph] of voices) {
    const period = sec / chants, w = (TAU * f) / sr
    const pulse = 0.018 * sr, gap = 0.038 * sr // un battement de 18 ms, tous les 38 ms
    for (let k = 0; k < chants; k++) {
      const t0 = ((k + ph) * period + rand(-0.02, 0.02)) * sr
      for (let p = 0; p < 3; p++) {
        const i0 = Math.floor(t0 + p * gap)
        for (let n = 0; n < pulse; n++) {
          const env = Math.sin((Math.PI * n) / pulse) ** 2, v = lvl * env * Math.sin(w * n) * (0.8 + 0.1 * p)
          const i = (i0 + n) % N
          L[i] += v * (1 - Math.max(0, pan) * 0.8)
          R[i] += v * (1 + Math.min(0, pan) * 0.8)
        }
      }
    }
  }
  let pk = 0
  for (let i = 0; i < N; i++) pk = Math.max(pk, Math.abs(L[i]), Math.abs(R[i]))
  for (let i = 0; i < N; i++) { L[i] *= 0.7 / pk; R[i] *= 0.7 / pk }
  return buf
}

export default function crickets(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.loopOrChannel(loops.crickets, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 3800, 0.5)).connect(out)
    // l'air de la nuit, très doux
    loop(noise.brown, rand(0, 4)).connect(biq('lowpass', 380, 0.5)).connect(gain(0.1)).connect(bus)
    // le chœur, deux lectures décalées dont le niveau respire à des rythmes différents
    const buf = cricketChorus(ctx)
    for (const [offset, lvl, swell] of [[0, 0.5, 0.045], [11.3, 0.35, 0.071]] as const) {
      const v = gain(lvl)
      loop(buf, offset).connect(v).connect(bus)
      const lfo = osc('sine', swell)
      lfo.connect(gain(lvl * 0.35)).connect(v.gain)
      lfo.start()
    }
  })
}
