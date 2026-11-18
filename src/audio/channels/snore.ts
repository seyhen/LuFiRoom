import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { INHALE, PERIOD } from '../../state/snore'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

// Une courbe par paramètre : des points (instant du souffle en secondes, valeur) reliés par des rampes linéaires.
type Curve = readonly (readonly [number, number])[]

/**
 * Le chien qui dort sur le tapis, devant la cheminée : sa respiration lente et grave, avec un ronflement très doux. Un son de base,
 * continu, fait pour rester en fond. Provisoire : synthétisé, en attendant un enregistrement.
 *
 * Un souffle dure 4 à 5 secondes (`state/snore.ts`, le même rythme que le flanc du chien). L'inspiration est un souffle d'air qui monte
 * (bruit brun et rose passé au passe-bande, de plus en plus ouvert) ; l'expiration, plus longue, est un souffle plus plein qui retombe,
 * avec dessous un ronflement : un train d'impulsions très grave (dent de scie vers 45 à 65 Hz) filtré sous 420 Hz, qui glisse vers le bas
 * en s'éteignant. Pas de grincement, rien d'aigu, aucune voix : le souffle d'un gros chien repu. D'un souffle à l'autre, la
 * profondeur et la durée varient un peu. À chaque début de souffle, `pulse` prévient la scène (le flanc se recale sur le son).
 */
export default function snore(kit: Kit, out: GainNode, _room: Room): Channel {
  const { ctx, gain, biq, osc, loop, noise } = kit
  const mix = gain(1)
  mix.connect(biq('lowpass', 1500, 0.5)).connect(out)

  // le souffle d'air
  const air = gain(0), band = biq('bandpass', 260, 0.9)
  loop(noise.brown, 0.4).connect(biq('lowpass', 900, 0.5)).connect(band)
  loop(noise.pink, 2.3).connect(biq('lowpass', 1300, 0.6)).connect(gain(0.3)).connect(band)
  band.connect(air).connect(mix)

  // le ronflement : des impulsions graves, un peu inégales (la hauteur tremble de quelques hertz), dans le nez
  const rattle = gain(0), saw = osc('sawtooth', 55), nose = biq('lowpass', 420, 1.1)
  saw.connect(nose).connect(rattle).connect(mix)
  saw.start()
  const shake = osc('sine', 0.9)
  shake.connect(gain(2.5)).connect(saw.frequency)
  shake.start()

  const ramp = (p: AudioParam, t0: number, len: number, curve: Curve, scale = 1) => {
    p.setValueAtTime(curve[0][1] * scale, t0 + curve[0][0] * len)
    for (const [k, v] of curve.slice(1)) p.linearRampToValueAtTime(v * scale, t0 + k * len)
  }
  // Ces points sont des parts du souffle (0 à 1) : `a` = INHALE, la fin de l'inspiration.
  const a = INHALE
  const AIR: Curve = [[0, 0.02], [a * 0.5, 0.2], [a, 0.42], [a + 0.04, 0.3], [a + 0.12, 0.8], [a + 0.34, 0.55], [a + 0.55, 0.22], [1, 0.02]]
  const RATTLE: Curve = [[0, 0], [a * 0.55, 0], [a * 0.8, 0.1], [a, 0.05], [a + 0.05, 0], [a + 0.1, 0.1], [a + 0.2, 0.6], [a + 0.34, 0.5], [a + 0.5, 0.2], [1, 0]]
  const BAND: Curve = [[0, 250], [a, 520], [a + 0.1, 470], [1, 230]]
  const PITCH: Curve = [[0, 60], [a, 64], [a + 0.12, 66], [1, 42]]

  let next = 0
  const cycle = (t0: number) => {
    const depth = rand(0.75, 1.1), len = PERIOD * rand(0.93, 1.07)
    ramp(air.gain, t0, len, AIR, depth * 0.95)
    ramp(rattle.gain, t0, len, RATTLE, depth * 0.155)
    ramp(band.frequency, t0, len, BAND)
    ramp(saw.frequency, t0, len, PITCH, rand(0.95, 1.05))
    pulse(ctx, 'snore', t0)
    return len
  }
  const ch = scheduled(ctx, (until) => {
    while (next < until) next += cycle(next)
  })
  return {
    start() {
      next = Math.max(next, ctx.currentTime + 0.05)
      ch.start()
    },
    stop: () => ch.stop(),
  }
}
