import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { purrBuffer } from '../buffers'
import type { Channel, Kit } from '../engine'
import { tune } from '../tune'

/**
 * Ronron du chat, enregistré ou synthétisé. Un chat ne ronronne pas sans arrêt : il ronronne 7 à 16 secondes, se tait 14 à 38
 * secondes, recommence (en fondu : le ronron monte en 1 s, s'éteint en 2). Le fichier de 7 secondes n'est jamais rejoué dans le
 * même ordre : on tire des segments de 2 à 3 s à des endroits et des vitesses différents (un ronron un peu plus grave, un peu plus vif).
 * Synthétisé, chaque chat a sa voix (`tune.purr` de la fiche de la pièce) : `pitch` (la cadence du ronron), `tone` (le filtre, Hz),
 * `body` (la résonance de poitrine, Hz), `bout` et `rest` (multiplient la durée du ronron et du silence), `level` (le niveau).
 */
export default function purr(kit: Kit, out: GainNode, room: Room): Channel {
  const { loops } = room
  const { ctx, gain, biq, loop } = kit
  const pitch = tune(room, 'purr', 'pitch', 1), tone = tune(room, 'purr', 'tone', 650), body = tune(room, 'purr', 'body', 170)
  const bout = tune(room, 'purr', 'bout', 1), rest = tune(room, 'purr', 'rest', 1), level = tune(room, 'purr', 'level', 1)
  const gate = gain(0)
  gate.connect(out)
  let timer = 0, halt = 0
  // Une phase de ronron (on) ou de silence (off), puis la suivante.
  const phase = (on: boolean) => {
    const t = ctx.currentTime
    gate.gain.cancelScheduledValues(t)
    gate.gain.setTargetAtTime(on ? 1 : 0, t, on ? 0.9 : 1.8)
    timer = window.setTimeout(() => phase(!on), on ? rand(7000, 16000) * bout : rand(14000, 38000) * rest)
  }
  const rec = kit.grainsOr(loops.purr, gate, { len: [1.8, 3.2], fade: 0.6, rate: 0.07, level: 0.18 }, () => {
    const pk = biq('peaking', body, 0.9)
    pk.gain.value = 5
    loop(purrBuffer(ctx, pitch), 0).connect(biq('lowpass', tone, 0.6)).connect(pk).connect(gain(level)).connect(gate)
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
