import type { Room } from '../../rooms/types'
import type { Channel, Kit } from '../engine'

/**
 * Le robinet col de cygne de la baignoire : un filet d'eau chaude qui tombe sans fin dans un bain déjà plein. Un son de base, continu
 * et doux. Synthèse provisoire (un enregistrement viendra, `loops.faucet`) : le filet (un bruit rose resserré vers 1,5 kHz qui respire
 * au gré de deux houles lentes), le chatoiement des éclaboussures dessus (une bande claire et très basse), le gargouillis (une bande
 * vers 700 Hz dont la fréquence ondule vite : l'eau qui se replie sur elle-même) et la résonance creuse et chaude de la baignoire
 * (une bande grave et étroite). Tout passe sous 3,4 kHz : jamais de sifflement, aucun coup isolé.
 */
export default function faucet(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.faucet, out, () => {
    const { gain, biq, osc, loop, noise } = kit
    const bus = gain(1)
    bus.connect(biq('lowpass', 3400, 0.5)).connect(out)
    // le filet
    const stream = gain(0.13)
    loop(noise.pink, 0.4).connect(biq('bandpass', 1500, 0.7)).connect(stream).connect(bus)
    for (const r of [0.13, 0.37]) {
      const lfo = osc('sine', r)
      lfo.connect(gain(0.035)).connect(stream.gain)
      lfo.start()
    }
    // les éclaboussures : un voile clair, très bas
    const splash = gain(0.035)
    loop(noise.white, 1.7).connect(biq('bandpass', 2900, 0.8)).connect(splash).connect(bus)
    const sway = osc('sine', 0.21)
    sway.connect(gain(0.012)).connect(splash.gain)
    sway.start()
    // le gargouillis : une bande qui ondule en fréquence, l'eau qui se replie
    const burble = biq('bandpass', 700, 2.2)
    for (const [r, d] of [[2.9, 160], [4.3, 110]]) {
      const lfo = osc('sine', r)
      lfo.connect(gain(d)).connect(burble.frequency)
      lfo.start()
    }
    loop(noise.pink, 3.3).connect(burble).connect(gain(0.1)).connect(bus)
    // la résonance de la baignoire
    const tub = gain(0.07)
    loop(noise.brown, 2.2).connect(biq('bandpass', 170, 4)).connect(tub).connect(bus)
    const swell = osc('sine', 0.06)
    swell.connect(gain(0.025)).connect(tub.gain)
    swell.start()
  })
}
