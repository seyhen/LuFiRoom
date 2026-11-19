import type { Room } from '../../rooms/types'
import { TAU, rand } from '../../math'
import type { Channel, Kit } from '../engine'

/**
 * La douche à effet pluie : une grosse pomme au-dessus d'un bac carrelé. Un son de base, continu et chaud : le souffle large de la
 * pomme (un bruit rose et un bruit clair en bande, qui ondulent à peine), le crépitement des gouttes qui frappent le bac et le carrelage
 * (une boucle de 10 s de petits « tic » ronds, 800 à 2 500 Hz, environ 90 par seconde, jamais audibles un par un), le fond chaud d'une
 * pièce pleine de vapeur (un grave filtré) et, surtout, la réverbération courte d'une pièce de carreaux (une réponse de 1,1 s fabriquée
 * en bruit qui décroît), qui donne à la douche sa cave. Synthèse provisoire (un enregistrement viendra, `loops.shower`).
 */
function makePatter(ctx: BaseAudioContext) {
  const sr = ctx.sampleRate, N = Math.floor(10 * sr), buf = ctx.createBuffer(2, N, sr)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c), n = Math.floor(10 * 90)
    for (let k = 0; k < n; k++) {
      const at = Math.floor(Math.random() * N), f = rand(800, 2500), len = Math.floor(rand(0.008, 0.02) * sr), a = (Math.random() ** 2) * 0.8 + 0.1
      for (let i = 0; i < len; i++) d[(at + i) % N] += Math.sin((TAU * f * i) / sr) * Math.exp((-5 * i) / len) * a
    }
  }
  return buf
}

/** La réponse d'une petite pièce carrelée : du bruit qui décroît en 1,1 s, un peu plus sombre vers la fin. */
function makeRoom(ctx: BaseAudioContext) {
  const sr = ctx.sampleRate, N = Math.floor(1.1 * sr), buf = ctx.createBuffer(2, N, sr)
  for (let c = 0; c < 2; c++) {
    const d = buf.getChannelData(c)
    let lp = 0
    for (let i = 0; i < N; i++) {
      const t = i / sr, k = Math.min(1, 0.9 - t * 0.7)
      lp += (Math.random() * 2 - 1 - lp) * Math.max(0.12, k)
      d[i] = lp * Math.exp(-t / 0.26) * (i < 80 ? i / 80 : 1)
    }
  }
  return buf
}

export default function shower(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.shower, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    const bus = gain(1), dry = gain(0.7), wet = gain(0.55)
    const room = ctx.createConvolver()
    room.buffer = makeRoom(ctx)
    bus.connect(dry).connect(out)
    bus.connect(room).connect(wet).connect(out)
    // le souffle de la pomme
    const spray = gain(0.1)
    loop(noise.pink, 0.7).connect(biq('bandpass', 2600, 0.5)).connect(spray).connect(bus)
    loop(noise.white, 3.1).connect(biq('bandpass', 4200, 0.6)).connect(gain(0.03)).connect(spray)
    const lfo = osc('sine', 0.11)
    lfo.connect(gain(0.02)).connect(spray.gain)
    lfo.start()
    // les gouttes sur le bac
    const patter = gain(0.06)
    loop(makePatter(ctx), rand(0, 10)).connect(patter).connect(bus)
    // le fond chaud
    loop(noise.pink, 1.9).connect(biq('lowpass', 520, 0.6)).connect(gain(0.1)).connect(bus)
  })
}
