import type { Room } from '../../rooms/types'
import type { Kit } from '../engine'

/**
 * Les machines : un battement sourd et régulier (l'hélice à trois pales, deux fois et demie par seconde), un ronronnement de
 * moteur électrique qui dérive à peine, un cliquetis de bielles. Rassurant, un peu hypnotique. Enregistré, ou synthétisé.
 */
export default function engine(kit: Kit, out: GainNode, { loops }: Room) {
  const { gain, biq, osc, loop, noise } = kit
  kit.loopOr(loops.engine, out, () => {
    // la poussée de l'hélice : un grave triangulaire dont le niveau bat à chaque pale
    const thrust = gain(0.34)
    osc('triangle', 41).connect(thrust).connect(out)
    const blade = osc('sine', 2.4)
    blade.connect(gain(0.3)).connect(thrust.gain)
    blade.start()
    // le moteur : un ronronnement plus aigu, qui dérive lentement
    const motor = osc('sawtooth', 96), motorLp = biq('lowpass', 260, 0.8)
    motor.connect(motorLp).connect(gain(0.05)).connect(out)
    const drift = osc('sine', 0.07)
    drift.connect(gain(1.6)).connect(motor.frequency)
    drift.start()
    // les remous derrière l'hélice, pulsés par les pales
    const wash = gain(0.12)
    loop(noise.pink, 2.9).connect(biq('bandpass', 190, 1.4)).connect(wash).connect(out)
    blade.connect(gain(0.07)).connect(wash.gain)
    // les bielles
    loop(noise.brown, 3.7).connect(biq('lowpass', 420, 0.6)).connect(gain(0.2)).connect(out)
    const rattle = gain(0.012)
    loop(noise.white, 1.3).connect(biq('bandpass', 1600, 2)).connect(rattle).connect(out)
    const tick = osc('sine', 9.6)
    tick.connect(gain(0.01)).connect(rattle.gain)
    tick.start()
    motor.start()
  })
}
