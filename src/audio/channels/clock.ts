import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * L'horloge à balancier du café : un tic-tac lent et feutré, un battement par seconde (la seconde du balancier), « tic » puis « tac »
 * de timbres différents (le tic plus clair, le tac plus rond), comme deux arrêts de l'échappement dans un coffre de bois. Chaque
 * battement est un petit claquement de bruit voilé, un grain de bois qui sonne court, et la résonance sourde du coffre dessous ;
 * le tout passe sous 2,2 kHz et dans une réverbération courte (la salle de la librairie), à peine plus fort qu'un souffle.
 * Synthèse provisoire (un enregistrement viendra) : le rythme est exact (grille d'une seconde sur l'horloge audio), et chaque battement
 * prévient la scène (`pulse`) : le balancier de l'horloge passe au centre au même instant. Un son continu, doux, qu'on oublie.
 */
export default function clock(kit: Kit, out: GainNode, _room: Room): Channel {
  const { ctx, gain, biq, osc, noise } = kit
  // un battement par seconde : la sonie intégrée d'un son si clairsemé est basse même quand sa crête est franche ; le niveau est calé ici et dans `base`
  const bus = gain(2.6)
  bus.connect(biq('lowpass', 2200, 0.5)).connect(out)
  // la salle : une réverbération courte et sombre
  const verb = ctx.createConvolver()
  verb.buffer = impulse(ctx, 0.55, 3.2)
  const wet = gain(0.22)
  bus.connect(biq('lowpass', 1600, 0.4)).connect(verb).connect(wet).connect(out)

  /** Un battement : n pair = « tic » (clair), impair = « tac » (rond). */
  function beat(t: number, n: number) {
    const tac = n % 2 === 1, k = rand(0.97, 1.03)
    // le claquement : un souffle de bruit court, filtré, doux à l'attaque
    const src = ctx.createBufferSource()
    src.buffer = noise.white
    src.loop = true
    const band = biq('bandpass', (tac ? 1500 : 2100) * k, 1.1), env = gain(0.0001)
    env.gain.setValueAtTime(0.0001, t)
    env.gain.exponentialRampToValueAtTime(tac ? 0.05 : 0.045, t + 0.004)
    env.gain.exponentialRampToValueAtTime(0.0001, t + 0.028)
    src.connect(band).connect(env).connect(bus)
    src.start(t, rand(0, 4))
    src.stop(t + 0.05)
    // le grain de bois : un sinus qui s'affaisse, très court
    const f = (tac ? 720 : 980) * k, o = osc('sine', f), g = gain(0.0001)
    o.frequency.setValueAtTime(f, t)
    o.frequency.exponentialRampToValueAtTime(f * 0.82, t + 0.05)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(tac ? 0.07 : 0.05, t + 0.005)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.07)
    o.connect(g).connect(bus)
    o.start(t)
    o.stop(t + 0.1)
    // le coffre : une résonance grave qui s'éteint plus lentement
    const c = osc('sine', (tac ? 150 : 175) * k), cg = gain(0.0001)
    cg.gain.setValueAtTime(0.0001, t)
    cg.gain.exponentialRampToValueAtTime(0.035, t + 0.01)
    cg.gain.exponentialRampToValueAtTime(0.0001, t + 0.24)
    c.connect(cg).connect(bus)
    c.start(t)
    c.stop(t + 0.3)
    pulse(ctx, 'clock', t)
  }

  let next = 0, n = 0
  return scheduled(ctx, (until) => {
    const now = ctx.currentTime
    if (next < now) next = now + 0.12
    while (next < until) {
      beat(next, n++)
      next += 1
    }
  }, 100)
}
