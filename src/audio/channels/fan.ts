import type { Room } from '../../rooms/types'
import { useStore } from '../../state/store'
import { FAN_SPEEDS, type FanSpeed } from '../../state/fan'
import type { Kit } from '../engine'

/**
 * Ce que change la vitesse (state/fan.ts) : le niveau (`gain`), la brillance du souffle (`cut` : passe-bas, `shelf` : étagère des aigus en dB),
 * le moteur (`hum` : sa hauteur en Hz, `humGain` : son niveau), le battement des pales (`lfo`, Hz) et, pour la synthèse, la part de
 * grave (`lp`) et de souffle (`air`). « Moyen » est le son d'origine, inchangé ; « Faible » est plus bas et plus mat, « Fort » plus
 * plein et plus aérien (de l'ordre de -4 dB et +3 dB autour de « Moyen »).
 */
const SPEED: Record<FanSpeed, { gain: number; cut: number; shelf: number; hum: number; humGain: number; lfo: number; lp: number; air: number }> = {
  low: { gain: 0.62, cut: 2600, shelf: -3, hum: 74, humGain: 0.011, lfo: 4.8, lp: 700, air: 0.1 },
  mid: { gain: 1, cut: 18000, shelf: 0, hum: 110, humGain: 0.016, lfo: 7.2, lp: 950, air: 0.18 },
  high: { gain: 1.5, cut: 18000, shelf: 3, hum: 148, humGain: 0.024, lfo: 10.5, lp: 1400, air: 0.28 },
}
// Un moteur ne change pas de régime d'un coup : la vitesse glisse en un quart de seconde environ.
const SPOOL = 0.12

/**
 * Ventilateur à trois vitesses. Enregistré, ou synthétisé : souffle brun et rose modulé au rythme des pales, plus le ronflement du
 * moteur. La vitesse choisie (faible, moyenne, forte) règle le niveau, le souffle et la hauteur du moteur, enregistrement compris.
 */
export default function fan(kit: Kit, out: GainNode, { loops }: Room) {
  const { ctx, gain, biq, osc, loop, noise, watch } = kit
  const first = SPEED[useStore.getState().fan]
  // La chaîne de vitesse : tout le souffle (enregistré ou synthétisé) passe par un passe-bas, une étagère d'aigus et un niveau.
  const cut = biq('lowpass', first.cut, 0.5), shelf = biq('highshelf', 2500, 0.7), level = gain(first.gain)
  shelf.gain.value = first.shelf
  cut.connect(shelf).connect(level).connect(out)
  // le moteur : un ronflement grave, dont la hauteur suit la vitesse
  const hum = osc('sine', first.hum), humGain = gain(first.humGain)
  hum.connect(humGain).connect(out)
  hum.start()
  // la synthèse : le souffle (brun, rose) et le battement des pales
  let lfo: OscillatorNode | null = null
  const lp = biq('lowpass', first.lp, 0.5), air = gain(first.air)
  const rec = kit.grainsOr(loops.fan, cut, { len: [8, 14], fade: 1.5, rate: 0.02, level: 0.1 }, () => {
    const am = gain(1)
    loop(noise.brown, 0).connect(lp).connect(gain(0.7)).connect(am)
    loop(noise.pink, 1.3).connect(biq('bandpass', 1900, 0.5)).connect(air).connect(am)
    lfo = osc('sine', first.lfo)
    lfo.connect(gain(0.07)).connect(am.gain)
    lfo.start()
    am.connect(cut)
  })
  watch((s, p) => {
    if (s.fan === p.fan || !FAN_SPEEDS.includes(s.fan)) return
    const v = SPEED[s.fan], now = ctx.currentTime
    const params: [AudioParam, number][] = [
      [cut.frequency, v.cut], [shelf.gain, v.shelf], [level.gain, v.gain], [hum.frequency, v.hum], [humGain.gain, v.humGain],
      [lp.frequency, v.lp], [air.gain, v.air],
    ]
    if (lfo) params.push([lfo.frequency, v.lfo])
    for (const [param, value] of params) {
      param.cancelScheduledValues(now)
      param.setTargetAtTime(value, now, SPOOL)
    }
  })
  return rec
}
