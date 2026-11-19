import type { Room } from '../../rooms/types'
import { rand } from '../../math'
import { pulse, scheduled } from '../events'
import type { Channel, Kit } from '../engine'

const hz = (midi: number) => 440 * 2 ** ((midi - 69) / 12)
// Une berceuse en ré majeur, quatre accords de six secondes qui reviennent : ré maj7, si m7, sol maj7, la sus. Notes MIDI de la nappe (basse, tierce, quinte, septième).
const CHORDS = [[38, 50, 54, 61], [35, 50, 54, 57], [43, 50, 54, 59], [45, 52, 57, 64]]
// La mélodie du violoncelle : la pentatonique de ré, de ré 3 à si 4 (MIDI), qu'on parcourt par petits pas.
const SCALE = [50, 52, 54, 57, 59, 62, 64, 66, 69, 71]
const BAR = 6

/**
 * La berceuse du violoncelle sanglé sur son siège : une nappe de cordes très lente (trois voix qui montent en deux secondes et six, deux sciés détimbrés,
 * passés par un filtre sombre) sous un violoncelle qui chante des phrases lentes de deux à quatre notes, des notes longues au vibrato timide, des silences.
 * Un son de base, continu et doux. Chaque note du violoncelle fait vibrer ses cordes dans la scène (`pulse`). Synthèse provisoire (un enregistrement viendra).
 */
export default function lullaby(kit: Kit, out: GainNode, { loops }: Room): Channel {
  return kit.loopOrChannel(loops.lullaby, out, () => {
    const { ctx, gain, biq, osc } = kit
    const dry = gain(1), wet = ctx.createDelay(2), fb = gain(0.42)
    wet.delayTime.value = 0.61
    dry.connect(biq('lowpass', 1500, 0.4)).connect(out)
    dry.connect(wet)
    wet.connect(biq('lowpass', 900, 0.4)).connect(fb).connect(wet)
    wet.connect(gain(0.5)).connect(out)

    /** Une voix de nappe : deux dents de scie désaccordées, un filtre qui s'ouvre avec la note, l'enveloppe lente. */
    function padVoice(t: number, f: number, len: number, lvl: number) {
      const g = gain(0.0001), lp = biq('lowpass', 520, 0.3)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.linearRampToValueAtTime(lvl, t + 2.4)
      g.gain.setValueAtTime(lvl, t + len)
      g.gain.linearRampToValueAtTime(0.0001, t + len + 3)
      lp.frequency.setValueAtTime(380, t)
      lp.frequency.linearRampToValueAtTime(760, t + len * 0.6)
      for (const cents of [-7, 7]) {
        const o = osc('sawtooth', f)
        o.detune.value = cents
        o.connect(lp)
        o.start(t)
        o.stop(t + len + 3.1)
      }
      lp.connect(g).connect(dry)
    }

    /** Une note de violoncelle : scie et triangle, vibrato qui s'installe, l'archet qui monte puis retombe. */
    function cello(t: number, midi: number, len: number, v = 1) {
      const f = hz(midi), g = gain(0.0001), lp = biq('lowpass', 700, 0.5)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.linearRampToValueAtTime(0.1 * v, t + 0.7)
      g.gain.setValueAtTime(0.1 * v, t + len * 0.55)
      g.gain.linearRampToValueAtTime(0.0001, t + len + 1.6)
      lp.frequency.setValueAtTime(520, t)
      lp.frequency.linearRampToValueAtTime(1100, t + len * 0.45)
      lp.frequency.linearRampToValueAtTime(600, t + len + 1.4)
      const vib = osc('sine', 5.1), vd = gain(0)
      vd.gain.setValueAtTime(0, t)
      vd.gain.linearRampToValueAtTime(f * 0.0045, t + 1.0)
      vib.connect(vd)
      vib.start(t)
      vib.stop(t + len + 1.7)
      for (const [type, lvl] of [['sawtooth', 0.55], ['triangle', 0.9]] as const) {
        const o = osc(type, f), c = gain(lvl)
        vd.connect(o.frequency)
        // un petit glissé d'attaque : la note vient d'un peu en dessous
        o.frequency.setValueAtTime(f * 0.985, t)
        o.frequency.exponentialRampToValueAtTime(f, t + 0.12)
        o.connect(c).connect(lp)
        o.start(t)
        o.stop(t + len + 1.7)
      }
      lp.connect(g).connect(dry)
    }

    let next = 0, bar = 0, deg = 4, rest = 0
    return scheduled(ctx, (until) => {
      const now = ctx.currentTime
      if (next < now) { next = now + 0.2; rest = 0 }
      while (next < until) {
        const chord = CHORDS[bar % CHORDS.length]
        // la nappe : une voix par note, plus fines en haut
        chord.forEach((m, i) => padVoice(next, hz(m), BAR, [0.05, 0.034, 0.03, 0.02][i]))
        // le violoncelle : une phrase de deux à quatre notes, quand on n'est pas au silence
        if (rest > 0) rest--
        else {
          const notes = 2 + ((Math.random() * 3) | 0)
          let at = next + rand(0.4, 1.2)
          for (let i = 0; i < notes && at < next + BAR * 0.95; i++) {
            const r = Math.random()
            deg = Math.max(0, Math.min(SCALE.length - 1, deg + (r < 0.4 ? -1 : r < 0.75 ? 1 : r < 0.88 ? -2 : r < 0.97 ? 2 : -3)))
            const len = rand(2.2, 3.4)
            cello(at, SCALE[deg], len, rand(0.85, 1))
            pulse(ctx, 'lullaby', at)
            at += len * rand(0.8, 1.0)
          }
          rest = Math.random() < 0.4 ? 1 : 0
        }
        next += BAR
        bar++
      }
    }, 250)
  })
}
