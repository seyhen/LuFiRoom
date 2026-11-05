import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { pulse, scheduled } from '../events'
import type { Kit } from '../engine'

/** Un tampon de froissement : des milliers de petits chocs de feuilles, serrés ou clairsemés, que l'on filtre ensuite. */
function rustleBuffer(ctx: BaseAudioContext, sec: number) {
  const n = Math.round(ctx.sampleRate * sec), b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0)
  let env = 0
  for (let i = 0; i < n; i++) {
    // des grappes de chocs : la densité monte et descend à quelques hertz, comme les feuilles qui se frôlent par paquets
    const dens = 0.5 + 0.5 * Math.sin(i * 0.00031) * Math.sin(i * 0.000113 + 1)
    if (Math.random() < 0.0016 * (0.3 + dens)) env = 0.4 + Math.random() * 0.6
    env *= 0.9965
    d[i] = (Math.random() * 2 - 1) * (0.12 + env)
  }
  // fondu des deux bouts, pour une boucle sans clic
  const f = Math.round(ctx.sampleRate * 0.05)
  for (let i = 0; i < f; i++) { d[i] *= i / f; d[n - 1 - i] *= i / f }
  return b
}

/**
 * Le vent dans les feuilles du chêne. Enregistré, ou synthétisé : un froissement doux de feuillage (des chocs de feuilles en grappes,
 * filtrés dans le médium, jamais sifflants), et de loin en loin une risée qui gonfle le bruissement puis le laisse retomber, comme une
 * vague dans la cime ; la scène balance le feuillage au même moment. Ce n'est pas le vent qui hurle : c'est l'arbre qui chuchote.
 */
export default function leaves(kit: Kit, out: GainNode, { loops }: Room) {
  const { ctx, gain, biq, osc, loop, noise } = kit
  return kit.loopOrChannel(loops.leaves, out, () => {
    const soft = biq('lowpass', 4200, 0.5), swell = gain(0.55)
    soft.connect(swell).connect(out)
    // le froissement : deux tampons décalés, dans deux bandes, pour une texture qui ne boucle pas à l'oreille
    const a = rustleBuffer(ctx, 7.3), b = rustleBuffer(ctx, 5.9)
    loop(a, rand(0, 5)).connect(biq('bandpass', 1900, 0.7)).connect(gain(0.32)).connect(soft)
    loop(b, rand(0, 5)).connect(biq('bandpass', 3100, 0.9)).connect(gain(0.16)).connect(soft)
    // le souffle qui porte les feuilles, très bas
    loop(noise.pink, rand(0, 4)).connect(biq('lowpass', 500, 0.5)).connect(gain(0.05)).connect(soft)
    // une respiration lente, toujours là
    const lfo = osc('sine', 0.071)
    lfo.connect(gain(0.12)).connect(swell.gain)
    lfo.start()
    // les risées
    let next = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + rand(3, 6)
      while (next < until) {
        const t = next, up = rand(1.6, 2.6), peak = rand(0.95, 1.25)
        swell.gain.setTargetAtTime(peak, t, up / 3)
        swell.gain.setTargetAtTime(0.55, t + up, rand(1.4, 2.2))
        pulse(ctx, 'leaves', t + up * 0.4)
        next += rand(8, 16)
      }
    }, 250)
  })
}
