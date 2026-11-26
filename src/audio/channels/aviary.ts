import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { impulse } from '../buffers'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

/**
 * La volière de la serre : des oiseaux de forêt tropicale dans l'air humide, un son de base continu et doux pour travailler ou
 * dormir. Synthèse provisoire (un enregistrement viendra) : cinq « oiseaux » aux timbres distincts, chacun avec ses phrases et ses
 * silences irréguliers, jamais deux fois la même :
 *  - la perruche siffle trois ou quatre notes glissées, pures et rondes ;
 *  - le tangara déroule un petit trille qui monte et redescend ;
 *  - le loriot lâche des notes liquides qui plongent (« plu-i-ou ») ;
 *  - la tourterelle roucoule, grave et feutrée, de loin en loin ;
 *  - le colibri pépie, minuscule, très bas.
 * Dessous, de l'air feuillu (bruit rose filtré, une houle de feuilles) ; tout passe dans une réverbération de serre (courte,
 * humide, assombrie) et rien ne dépasse 4,8 kHz. Des creux de calme de temps en temps, pour que l'oreille se repose.
 * Chaque phrase du chœur appelle `pulse`, et la scène fait sautiller un oiseau et pencher sa tête au même instant.
 */
export default function aviary(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.aviary, out, () => {
    const { ctx, gain, biq, osc, loop, noise } = kit
    // la serre : un peu sec devant, une queue de réverbération sombre derrière
    const bus = gain(1), conv = ctx.createConvolver()
    conv.buffer = impulse(ctx, 1.8, 3)
    bus.connect(biq('lowpass', 4800, 0.5)).connect(out)
    bus.connect(biq('highpass', 500, 0.5)).connect(conv)
    conv.connect(biq('lowpass', 2600, 0.5)).connect(gain(0.45)).connect(out)
    // l'air feuillu : un souffle grave, et une houle de feuilles qui monte et redescend très lentement
    loop(noise.pink, rand(0, 3)).connect(biq('lowpass', 620, 0.4)).connect(gain(0.05)).connect(out)
    const leaves = gain(0.012), swell = osc('sine', 0.06), swellD = gain(0.008)
    loop(noise.white, rand(0, 3)).connect(biq('bandpass', 2600, 0.5)).connect(leaves).connect(out)
    swell.connect(swellD).connect(leaves.gain)
    swell.start()

    /** Une note : un sinus (ou un triangle adouci) qui glisse de `f0` à `f1` puis `f2`, enveloppe douce, vibrato léger. */
    function note(t: number, f0: number, f1: number, f2: number, len: number, a: number, o: { pan?: number; type?: OscillatorType; vib?: number; harm?: number; peak?: number } = {}) {
      const { pan = 0, type = 'sine', vib = 0, harm = 0, peak = 0.22 } = o
      const osc1 = osc(type, f0), g = gain(0.0001), p = ctx.createStereoPanner()
      p.pan.value = pan
      osc1.frequency.setValueAtTime(f0, t)
      osc1.frequency.exponentialRampToValueAtTime(f1, t + len * 0.45)
      osc1.frequency.exponentialRampToValueAtTime(f2, t + len)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(a * 4.6, t + len * peak)
      g.gain.exponentialRampToValueAtTime(0.0001, t + len)
      osc1.connect(g)
      if (vib > 0) {
        const lfo = osc('sine', rand(5, 8)), d = gain(Math.max(f0, f1) * vib)
        lfo.connect(d).connect(osc1.frequency)
        lfo.start(t)
        lfo.stop(t + len + 0.05)
      }
      if (harm > 0) {
        const o2 = osc('sine', f0 * 2), g2 = gain(harm)
        o2.frequency.setValueAtTime(f0 * 2, t)
        o2.frequency.exponentialRampToValueAtTime(f1 * 2, t + len * 0.45)
        o2.frequency.exponentialRampToValueAtTime(f2 * 2, t + len)
        o2.connect(g2).connect(g)
        o2.start(t)
        o2.stop(t + len + 0.05)
      }
      g.connect(p).connect(bus)
      osc1.start(t)
      osc1.stop(t + len + 0.05)
    }

    // les phrases : chacune renvoie sa durée
    const phrases = {
      /** La perruche : des sifflements glissés, ronds et purs. */
      whistle(t: number, pan: number) {
        const n = 3 + Math.floor(Math.random() * 3), b = rand(1900, 2500)
        let at = t
        for (let i = 0; i < n; i++) {
          const len = rand(0.2, 0.36), f = b * rand(0.92, 1.12)
          note(at, f, f * rand(1.25, 1.55), f * rand(0.85, 1.1), len, rand(0.026, 0.036), { pan, vib: 0.012 })
          at += len + rand(0.05, 0.16)
        }
        return at - t
      },
      /** Le tangara : un trille qui monte et redescend, en notes très courtes. */
      trill(t: number, pan: number) {
        const n = 7 + Math.floor(Math.random() * 7), b = rand(2900, 3500)
        let at = t
        for (let i = 0; i < n; i++) {
          const arch = Math.sin((i / (n - 1)) * Math.PI), f = b * (1 + arch * 0.22) * rand(0.97, 1.03), len = rand(0.045, 0.07)
          note(at, f, f * 1.06, f * 0.98, len, 0.013 + arch * 0.008, { pan, type: 'triangle', peak: 0.3 })
          at += len + rand(0.012, 0.03)
        }
        return at - t
      },
      /** Le loriot : des notes liquides qui montent un peu puis plongent. */
      liquid(t: number, pan: number) {
        const n = 2 + Math.floor(Math.random() * 3), b = rand(2000, 2600)
        let at = t
        for (let i = 0; i < n; i++) {
          const len = rand(0.15, 0.24), f = b * rand(0.9, 1.1)
          note(at, f, f * 1.28, f * 0.66, len, rand(0.022, 0.03), { pan, harm: 0.25, peak: 0.3 })
          at += len + rand(0.08, 0.22)
        }
        return at - t
      },
      /** La tourterelle : un roucoulement grave et feutré, deux à quatre notes. */
      coo(t: number, pan: number) {
        const n = 2 + Math.floor(Math.random() * 3), b = rand(430, 520)
        let at = t
        for (let i = 0; i < n; i++) {
          const long = i === n - 1 && Math.random() < 0.6, len = long ? rand(0.5, 0.7) : rand(0.2, 0.3), f = b * (i === 0 ? 0.9 : 1)
          note(at, f, f * 1.12, f * 0.94, len, long ? 0.055 : 0.04, { pan, harm: 0.12, peak: 0.4 })
          at += len + rand(0.06, 0.14)
        }
        return at - t
      },
      /** Le colibri : de minuscules pépiements aigus, pressés, très bas. */
      twitter(t: number, pan: number) {
        const n = 4 + Math.floor(Math.random() * 5), b = rand(3900, 4400)
        let at = t
        for (let i = 0; i < n; i++) {
          const f = b * rand(0.92, 1.06), len = rand(0.025, 0.04)
          note(at, f, f * rand(0.88, 1.12), f * 0.92, len, rand(0.005, 0.009), { pan, peak: 0.35 })
          at += len + rand(0.03, 0.09)
        }
        return at - t
      },
    }
    // chaque oiseau : sa phrase, sa place dans le stéréo, l'écart entre deux phrases (secondes) ; `next` : sa prochaine entrée
    const voices = [
      { say: phrases.whistle, pan: -0.5, gap: [5, 13], next: 0, pulses: true },
      { say: phrases.trill, pan: 0.45, gap: [7, 17], next: 0, pulses: true },
      { say: phrases.liquid, pan: -0.15, gap: [6, 15], next: 0, pulses: true },
      { say: phrases.coo, pan: 0.2, gap: [14, 32], next: 0, pulses: false },
      { say: phrases.twitter, pan: 0.6, gap: [6, 14], next: 0, pulses: true },
    ]
    let quietFrom = 0, quietTo = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      // au premier passage, ou au retour après une pause : les oiseaux entrent un par un
      if (voices.every((v) => v.next < now - 2)) {
        voices.forEach((v, i) => { v.next = now + 0.4 + i * rand(0.7, 2.4) })
        quietFrom = now + rand(30, 60)
        quietTo = quietFrom + rand(8, 16)
      }
      // un creux de calme de 8 à 16 s, tous les 40 à 90 s : le fond respire seul
      if (now > quietTo) {
        quietFrom = now + rand(40, 90)
        quietTo = quietFrom + rand(8, 16)
      }
      for (const v of voices) {
        while (v.next < until) {
          if (v.next > quietFrom && v.next < quietTo) { v.next = quietTo + rand(0.5, 3); continue }
          const t = Math.max(v.next, now + 0.02), dur = v.say(t, v.pan + rand(-0.1, 0.1))
          if (v.pulses) pulse(ctx, 'aviary', t)
          v.next = t + dur + rand(v.gap[0], v.gap[1])
        }
      }
    }, 150)
  })
}
