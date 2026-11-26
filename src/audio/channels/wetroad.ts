import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { useStore } from '../../state/store'
import type { Kit } from '../engine'
import { pulse, scheduled } from '../events'

/**
 * Les voitures sur la route mouillée, derrière la vitrine de la laverie : le chuintement lointain de pneus sur l'asphalte détrempé,
 * à 2 h du matin. Un son de base, continu et très doux (provisoire : synthèse, en attendant un enregistrement par `loops`). Dessous,
 * un fond de rue qui ne s'arrête jamais (un souffle rose médium et un grave brun, gonflés par deux houles très lentes qui ne se
 * rejoignent jamais). Dessus, un passage de loin en loin : un bruit rose passe-bas dont la coupure monte puis redescend (la voiture
 * qui approche, puis qui s'éloigne), un fin voile d'éclaboussures au plus près, le tout glissant d'un côté à l'autre de l'image
 * stéréo. Les passages durent huit à onze secondes, se chevauchent parfois et se laissent six à douze secondes : rien ne revient au
 * même rythme d'une heure sur l'autre. Pas de moteur, pas de klaxon, rien au-dessus de 2,6 kHz.
 * Chaque passage prévient la scène (`pulse`) : la voiture de la rue entre au même moment. Le sens suit la parité du compteur de la scène (voie de
 * gauche : la voiture file de la droite vers la gauche de l'image, voie de droite : l'inverse) : le panoramique accompagne la voiture.
 */
const N = 48

/** Une courbe d'automation de `N` points sur toute la durée d'un passage (k de 0 à 1). */
const curve = (f: (k: number) => number) => Float32Array.from({ length: N }, (_, i) => f(i / (N - 1)))
const bell = (k: number, p: number) => Math.pow(Math.sin(Math.PI * Math.min(1, Math.max(0, k))), p)
const sstep = (k: number) => k * k * (3 - 2 * k)

export default function wetroad(kit: Kit, out: GainNode, { loops }: Room) {
  const { ctx, gain, biq, osc, loop, noise } = kit
  return kit.loopOrChannel(loops.wetroad, out, () => {
    const bus = gain(1)
    bus.connect(biq('lowpass', 2600, 0.5)).connect(out)
    // le fond de la rue : l'eau chuintante des pneus lointains, et le grave des immeubles qui renvoient la rumeur
    const hiss = gain(0.02)
    loop(noise.pink, rand(0, 5)).connect(biq('bandpass', 950, 0.45)).connect(hiss).connect(bus)
    const body = gain(0.045)
    loop(noise.brown, rand(0, 5)).connect(biq('lowpass', 240, 0.6)).connect(body).connect(bus)
    // deux houles lentes de périodes premières entre elles (une quarantaine de secondes et plus d'une minute)
    for (const [f, depth, to] of [[0.0231, 0.007, hiss], [0.0147, 0.006, hiss], [0.0173, 0.016, body]] as const) {
      const sw = osc('sine', f)
      sw.connect(gain(depth)).connect(to.gain)
      sw.start()
    }

    /** Un passage qui commence à `t` et dure `d` secondes ; `dir` : 1 de gauche à droite, -1 de droite à gauche. */
    function pass(t: number, d: number, dir: 1 | -1) {
      const pan = ctx.createStereoPanner()
      pan.pan.setValueCurveAtTime(curve((k) => dir * 0.78 * (2 * sstep(k) - 1)), t, d)
      pan.connect(bus)
      // la voiture : du rose, dont la coupure monte à l'approche puis retombe (le bruit des pneus s'étouffe en s'éloignant)
      const body = loop(noise.pink, rand(0, 5)), lp = biq('lowpass', 500, 0.5), amp = gain(0)
      lp.frequency.setValueCurveAtTime(curve((k) => 470 + 1500 * bell(k, 1.4)), t, d)
      amp.gain.setValueCurveAtTime(curve((k) => 0.4 * bell(k, 1.7)), t, d)
      body.connect(biq('highpass', 170, 0.5)).connect(lp).connect(amp).connect(pan)
      // l'eau qui jaillit sous les roues, un voile à peine, tout près du milieu du passage
      const spray = loop(noise.pink, rand(0, 5)), spAmp = gain(0)
      spAmp.gain.setValueCurveAtTime(curve((k) => 0.07 * bell(k, 3.2)), t, d)
      spray.connect(biq('bandpass', 2200, 0.7)).connect(spAmp).connect(pan)
      body.stop(t + d + 0.3)
      spray.stop(t + d + 0.3)
    }

    let next = 0, idx = useStore.getState().pulses.wetroad ?? 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) next = now + 0.1
      while (next < until) {
        pass(next, rand(8, 11), (idx++ % 2 ? 1 : -1) as 1 | -1)
        pulse(ctx, 'wetroad', next)
        next += rand(6, 12)
      }
    }, 150)
  })
}
