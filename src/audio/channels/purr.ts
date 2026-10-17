import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { purrBuffer } from '../buffers'
import type { Channel, Kit } from '../engine'

/**
 * Ronron du chat, enregistré ou synthétisé. Un chat ne ronronne pas sans arrêt : il ronronne 7 à 16 secondes, se tait 14 à 38
 * secondes, recommence (en fondu : le ronron monte en 1 s, s'éteint en 2). Le fichier de 7 secondes n'est jamais rejoué dans le
 * même ordre : on tire des segments de 2 à 3 s à des endroits et des vitesses différents (un ronron un peu plus grave, un peu plus vif).
 */
export default function purr(kit: Kit, out: GainNode, { loops }: Room): Channel {
  const { ctx, gain, biq, loop } = kit
  const gate = gain(0)
  gate.connect(out)
  let timer = 0, halt = 0
  // Une phase de ronron (on) ou de silence (off), puis la suivante.
  const phase = (on: boolean) => {
    const t = ctx.currentTime
    gate.gain.cancelScheduledValues(t)
    gate.gain.setTargetAtTime(on ? 1 : 0, t, on ? 0.9 : 1.8)
    timer = window.setTimeout(() => phase(!on), on ? rand(7000, 16000) : rand(14000, 38000))
  }
  const rec = kit.grainsOr(loops.purr, gate, { len: [1.8, 3.2], fade: 0.6, rate: 0.07, level: 0.18 }, () => {
    const pk = biq('peaking', 170, 0.9)
    pk.gain.value = 5
    loop(purrBuffer(ctx), 0).connect(biq('lowpass', 650, 0.6)).connect(pk).connect(gate)
  })
  return {
    start() {
      clearTimeout(halt)
      rec.start()
      clearTimeout(timer)
      phase(true) // le chat ronronne tout de suite quand on le touche
    },
    stop() {
      clearTimeout(timer)
      gate.gain.cancelScheduledValues(ctx.currentTime)
      gate.gain.setTargetAtTime(0, ctx.currentTime, 0.25)
      halt = window.setTimeout(() => rec.stop(), 1500)
    },
  }
}
