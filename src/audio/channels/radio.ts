import { useStore } from '../../state/store'
import { clamp, rand } from '../../math'
import { crackleBuffer, satCurve } from '../buffers'
import type { Channel, Kit } from '../engine'

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12)

// Grille d'accords, une mesure chacun (notes MIDI).
const PROG = [
  { name: 'Cmaj9', bass: 36, notes: [52, 55, 59, 62], mel: [67, 71, 72, 74, 76, 79] },
  { name: 'Am9', bass: 33, notes: [55, 59, 60, 64], mel: [67, 69, 71, 72, 76, 79] },
  { name: 'Dm9', bass: 38, notes: [53, 57, 60, 64], mel: [69, 72, 74, 76, 77, 81] },
  { name: 'G13', bass: 31, notes: [53, 57, 59, 64], mel: [67, 71, 74, 76, 77, 79] },
]
// Rythmes possibles de la mélodie, en doubles croches.
const RHYTHMS = [[0, 3, 6, 10, 14], [2, 6, 8, 11], [0, 4, 7, 10, 12], [3, 6, 10, 13], [0, 2, 6, 8, 12]]
const SD = 60 / 72 / 4 // une double croche à 72 bpm

/** Radio lofi générative : batterie, piano électrique, basse et clochette, joués en direct. */
export default function radio({ ctx, master, gain, biq, osc, loop, noise }: Kit, out: GainNode): Channel {
  // Bus radio : passe-bas, saturation douce, crépitement de vinyle.
  const pre = gain(0.85), sat = ctx.createWaveShaper()
  sat.curve = satCurve(1.6)
  sat.oversample = '2x'
  pre.connect(biq('lowpass', 3200, 0.4)).connect(sat).connect(gain(0.9)).connect(out)
  // Sidechain : chaque kick baisse le piano et la basse.
  const duck = gain(1)
  duck.connect(pre)
  const keys = gain(0.9)
  keys.connect(duck)
  const bass = gain(0.85)
  bass.connect(duck)
  const drums = gain(0.8)
  drums.connect(pre)
  const lead = gain(0.55)
  lead.connect(pre)
  // Delay de la clochette : 3 doubles croches, retour 0.3.
  const dl = ctx.createDelay(1.5), fb = gain(0.3), dlp = biq('lowpass', 1800, 0.5)
  dl.delayTime.value = SD * 3
  lead.connect(dl)
  dl.connect(dlp)
  dlp.connect(fb)
  fb.connect(dl)
  dlp.connect(gain(0.35)).connect(pre)
  // Effet cassette : désaccord lent (±9 cents) et rapide (±2.5 cents) sur piano et clochette.
  const wob = gain(1), w1 = osc('sine', 0.33), w2 = osc('sine', 5.5)
  w1.connect(gain(9)).connect(wob)
  w2.connect(gain(2.5)).connect(wob)
  w1.start()
  w2.start()
  loop(crackleBuffer(ctx), 0).connect(biq('highpass', 250, 0.5)).connect(gain(0.3)).connect(out)

  let step = 0, bar = 0, next = 0, mIdx = 2, ghost = false, timer = 0, stopT = 0
  let melody: Record<number, { n: number; d: number; v: number }> = {}
  const kicks: number[] = [], chords: { t: number; name: string }[] = []

  // Ordonnanceur à anticipation : toutes les 25 ms, on programme ce qui tombe dans les 140 ms à venir.
  function tick() {
    const now = ctx.currentTime
    if (next < now - 0.05) next = now + 0.05
    const horizon = now + (document.hidden ? 1.6 : 0.14)
    while (next < horizon) {
      sched(step, next)
      next += SD
      if (++step === 16) {
        step = 0
        bar++
      }
    }
    // Publie les kicks joués et l'accord en cours, pour la scène et le mixeur.
    let n = 0, name = ''
    while (kicks.length && kicks[0] <= now) {
      kicks.shift()
      n++
    }
    for (const c of chords) if (c.t <= now) name = c.name
    const s = useStore.getState()
    if (n || name !== s.chord) useStore.setState({ kicks: s.kicks + n, chord: name })
  }

  // Mélodie seulement sur les mesures 4 à 7 d'un cycle de 8 : marche aléatoire dans les notes de l'accord.
  function genMelody(chord: (typeof PROG)[number]) {
    melody = {}
    if (bar % 8 < 4) return
    const pool = chord.mel, steps = RHYTHMS[(Math.random() * RHYTHMS.length) | 0]
    let idx = mIdx
    steps.forEach((st, i) => {
      idx = clamp(idx + ((Math.random() * 5) | 0) - 2, 0, pool.length - 1)
      if (Math.random() < 0.85) melody[st] = { n: pool[idx], d: i === steps.length - 1 ? 4 : rand(1.5, 2.5), v: rand(0.12, 0.18) }
    })
    mIdx = idx
  }

  function sched(s: number, t: number) {
    const chord = PROG[bar % 4], sw = s % 2 ? t + SD * 0.28 : t // swing de 28 % sur les doubles croches impaires
    if (s === 0) {
      genMelody(chord)
      ghost = Math.random() < 0.5
      chords.push({ t, name: chord.name })
      if (chords.length > 6) chords.shift()
    }
    // batterie
    if (s === 0) kick(t, 1)
    if (s === 10) kick(t, 0.85)
    if (s === 7 && ghost) kick(sw, 0.45)
    if (s === 4 || s === 12) snare(t + 0.012, 0.75)
    if (s === 15 && Math.random() < 0.25) snare(sw, 0.18)
    if (s % 2 === 0) hat(t, s % 4 === 0 ? 0.42 : 0.28 + Math.random() * 0.08)
    else if ((s === 3 || s === 11 || s === 13) && Math.random() < 0.35) hat(sw, 0.16)
    // piano
    if (s === 0) chordHit(chord.notes, t, SD * 9, 0.55)
    if (s === 10) chordHit(chord.notes.slice(1), t, SD * 5.5, 0.32)
    // basse (pas 14 : note d'approche un demi-ton sous la prochaine fondamentale)
    if (s === 0) bassNote(chord.bass, t, SD * 5, 0.8)
    if (s === 7) bassNote(chord.bass + 12, sw, SD * 1.2, 0.35)
    if (s === 10) bassNote(chord.bass, t, SD * 3, 0.65)
    if (s === 14) bassNote(PROG[(bar + 1) % 4].bass - 1, t, SD * 1.8, 0.45)
    // mélodie
    const m = melody[s]
    if (m) bell(m.n, s % 2 ? sw : t, m.d * SD, m.v)
  }

  function noiseHit(t: number, dur: number) {
    const s = ctx.createBufferSource()
    s.buffer = noise.white
    s.start(t, Math.random() * 3)
    s.stop(t + dur)
    return s
  }

  function kick(t: number, v: number) {
    const o = osc('sine', 130), g = gain(0.0001)
    o.frequency.setValueAtTime(130, t)
    o.frequency.exponentialRampToValueAtTime(48, t + 0.11)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(v * 0.9, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.42)
    o.connect(g).connect(drums)
    o.start(t)
    o.stop(t + 0.45)
    duck.gain.setTargetAtTime(0.55, t, 0.01)
    duck.gain.setTargetAtTime(1, t + 0.07, 0.16)
    kicks.push(t)
  }

  function snare(t: number, v: number) {
    const s = noiseHit(t, 0.25), g = gain(0.0001)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(v * 0.5, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
    s.connect(biq('bandpass', 1800, 0.8)).connect(g).connect(drums)
    const o = osc('triangle', 190), g2 = gain(0.0001)
    g2.gain.setValueAtTime(0.0001, t)
    g2.gain.exponentialRampToValueAtTime(v * 0.25, t + 0.003)
    g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
    o.connect(g2).connect(drums)
    o.start(t)
    o.stop(t + 0.1)
  }

  function hat(t: number, v: number) {
    const s = noiseHit(t, 0.08), g = gain(0.0001)
    g.gain.setValueAtTime(v * 0.26, t)
    g.gain.exponentialRampToValueAtTime(0.0005, t + 0.045)
    s.connect(biq('highpass', 7000, 0.7)).connect(g).connect(drums)
  }

  // Accord arpégé de 18 ms.
  function chordHit(notes: number[], t: number, dur: number, v: number) {
    notes.forEach((m, i) => epNote(m, t + i * 0.018, dur, v * 0.22))
  }

  // Piano électrique : sinus + triangle désaccordé + attaque à 4× la fréquence.
  function epNote(m: number, t: number, dur: number, v: number) {
    const f = mtof(m), g = gain(0)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(v, t + 0.01)
    g.gain.setTargetAtTime(v * 0.35, t + 0.012, 0.55)
    g.gain.setTargetAtTime(0, t + dur, 0.2)
    const o1 = osc('sine', f), o2 = osc('triangle', f * 1.002), o3 = osc('sine', f * 4), g3 = gain(0)
    g3.gain.setValueAtTime(0.12, t)
    g3.gain.setTargetAtTime(0, t + 0.005, 0.06)
    o1.connect(g)
    o2.connect(gain(0.22)).connect(g)
    o3.connect(g3).connect(g)
    g.connect(keys)
    wob.connect(o1.detune)
    wob.connect(o2.detune)
    const end = t + dur + 1.2
    for (const o of [o1, o2, o3]) {
      o.start(t)
      o.stop(end)
    }
    o1.onended = () => {
      try {
        wob.disconnect(o1.detune)
        wob.disconnect(o2.detune)
      } catch {
        // déjà déconnecté
      }
    }
  }

  // Basse : triangle + sinus, passe-bas 520.
  function bassNote(m: number, t: number, dur: number, v: number) {
    const f = mtof(m), o = osc('triangle', f), o2 = osc('sine', f), lp = biq('lowpass', 520, 0.7), g = gain(0)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(v * 0.5, t + 0.012)
    g.gain.setTargetAtTime(v * 0.32, t + 0.03, 0.25)
    g.gain.setTargetAtTime(0, t + dur, 0.07)
    o.connect(lp)
    o2.connect(lp)
    lp.connect(g).connect(bass)
    for (const x of [o, o2]) {
      x.start(t)
      x.stop(t + dur + 0.5)
    }
  }

  // Clochette : sinus + 3e harmonique.
  function bell(m: number, t: number, dur: number, v: number) {
    const f = mtof(m), o = osc('sine', f), o2 = osc('sine', f * 3), g = gain(0)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(v, t + 0.006)
    g.gain.setTargetAtTime(v * 0.4, t + 0.01, 0.25)
    g.gain.setTargetAtTime(0, t + dur, 0.18)
    o.connect(g)
    o2.connect(gain(0.12)).connect(g)
    g.connect(lead)
    wob.connect(o.detune)
    for (const x of [o, o2]) {
      x.start(t)
      x.stop(t + dur + 1.2)
    }
    o.onended = () => {
      try {
        wob.disconnect(o.detune)
      } catch {
        // déjà déconnecté
      }
    }
  }

  // Grésillement de recherche de station : bruit en passe-bande qui glisse de 700 à 2600 Hz.
  function tuneStatic(t: number) {
    const s = noiseHit(t, 0.55), bp = biq('bandpass', 700, 2.5), g = gain(0)
    bp.frequency.setValueAtTime(700, t)
    bp.frequency.exponentialRampToValueAtTime(2600, t + 0.45)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(0.3 * useStore.getState().vol.radio, t + 0.04)
    g.gain.linearRampToValueAtTime(0, t + 0.5)
    s.connect(bp).connect(g).connect(master)
  }

  return {
    start() {
      clearTimeout(stopT)
      if (timer) return
      const now = ctx.currentTime
      tuneStatic(now)
      next = now + 0.5
      step = 0
      timer = window.setInterval(tick, 25)
    },
    // On laisse finir les notes déjà programmées pendant le fondu.
    stop() {
      clearTimeout(stopT)
      stopT = window.setTimeout(() => {
        clearInterval(timer)
        timer = 0
        kicks.length = 0
      }, 900)
    },
  }
}
