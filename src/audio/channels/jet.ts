import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import type { Kit } from '../engine'

/**
 * Le souffle des moteurs, entendu depuis la cabine : le fond que tout le monde connaît pour s'endormir en vol. Un son de base, continu, doux et grave,
 * jamais un grondement : un bruit brun filtré très bas (la poussée, ressentie plus qu'entendue), un souffle d'air large et feutré qui monte et descend
 * à peine (la ventilation et le vent sur le fuselage), un ronronnement de deux notes très proches qui battent à 0,6 Hz (les deux réacteurs, jamais
 * tout à fait d'accord), et une fine bande médiane. Rien au-dessus de 1 200 Hz. Synthèse provisoire (un enregistrement viendra, `loops.jet`).
 */
export default function jet(kit: Kit, out: GainNode, { loops }: Room) {
  return kit.loopOrChannel(loops.jet, out, () => {
    const { gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 1200, 0.5)).connect(out)
    // la poussée : un grave de bruit brun, dont la coupure dérive très lentement
    const thrustLp = biq('lowpass', 240, 0.5)
    loop(noise.brown, rand(0, 6)).connect(thrustLp).connect(gain(0.6)).connect(bus)
    const drift = osc('sine', 0.021)
    drift.connect(gain(45)).connect(thrustLp.frequency)
    drift.start()
    // le souffle d'air : large et rond, son niveau respire en 17 secondes environ
    const air = gain(0.12)
    loop(noise.pink, rand(0, 6)).connect(biq('bandpass', 520, 0.4)).connect(air).connect(bus)
    const swell = osc('sine', 0.058)
    swell.connect(gain(0.045)).connect(air.gain)
    swell.start()
    // les deux réacteurs : deux sinus à 0,6 Hz d'écart, une octave au-dessus filtrée dessous
    const hum = gain(0.05)
    hum.connect(biq('lowpass', 190, 0.5)).connect(bus)
    for (const f of [51.8, 52.4, 103.9]) {
      const o = osc(f > 100 ? 'triangle' : 'sine', f)
      o.connect(gain(f > 100 ? 0.4 : 1)).connect(hum)
      o.start()
    }
    // la bande médiane, très fine : le vent sur le fuselage
    const wind = gain(0.04)
    loop(noise.pink, rand(0, 6)).connect(biq('bandpass', 880, 0.7)).connect(wind).connect(bus)
    const gust = osc('sine', 0.037)
    gust.connect(gain(0.022)).connect(wind.gain)
    gust.start()
  })
}
