import { useStore } from '../../state/store'
import { clamp, rand } from '../../math'
import { crackleBuffer, satCurve } from '../buffers'
import { stationById, type Chord, type Station } from '../stations'
import type { Channel, Kit } from '../engine'

const mtof = (m: number) => 440 * Math.pow(2, (m - 69) / 12)
// Une nappe tient sa note : un peu moins fort qu'un piano qui s'éteint, à vélocité égale.
const PAD = 0.7

/** Grésillement de recherche de station, à l'allumage et quand on change de station : bruit en passe-bande qui glisse de 700 à 2600 Hz. */
export function tuneStatic({ ctx, master, gain, biq, noise }: Kit) {
  const t = ctx.currentTime, s = ctx.createBufferSource(), bp = biq('bandpass', 700, 2.5), g = gain(0)
  s.buffer = noise.white
  s.start(t, Math.random() * 3)
  s.stop(t + 0.55)
  bp.frequency.setValueAtTime(700, t)
  bp.frequency.exponentialRampToValueAtTime(2600, t + 0.45)
  g.gain.setValueAtTime(0, t)
  g.gain.linearRampToValueAtTime(0.3 * useStore.getState().vol.radio, t + 0.04)
  g.gain.linearRampToValueAtTime(0, t + 0.5)
  s.connect(bp).connect(g).connect(master)
}

/**
 * Radio lofi générative : batterie, accords, basse et mélodie, jouées en direct. Chaque station (stations.ts) règle ce petit
 * groupe autrement : tempo, accords, voix, rythmes, couleur du bus. On passe de l'une à l'autre en « tournant le bouton ».
 */
export default function radio(kit: Kit, out: GainNode): Channel {
  const { ctx, gain, biq, osc, loop, noise } = kit
  let st = stationById(useStore.getState().station)
  let sd = 60 / st.bpm / 4 // durée d'une double croche
  const trim = (s: Station) => 0.85 * s.level

  // Bus radio : passe-bas, saturation douce, crépitement de vinyle.
  const pre = gain(trim(st)), lp = biq('lowpass', st.tone.lp, 0.4), sat = ctx.createWaveShaper()
  sat.curve = satCurve(st.tone.sat)
  sat.oversample = '2x'
  pre.connect(lp).connect(sat).connect(gain(0.9)).connect(out)
  // Sidechain : chaque kick baisse le piano et la basse.
  const duck = gain(1)
  duck.connect(pre)
  const keysBus = gain(0.9)
  keysBus.connect(duck)
  const bassBus = gain(0.85)
  bassBus.connect(duck)
  const drumsBus = gain(0.8)
  drumsBus.connect(pre)
  const leadBus = gain(0.55)
  leadBus.connect(pre)
  // Écho de la mélodie : trois doubles croches.
  const dl = ctx.createDelay(1.5), fb = gain(st.tone.echo[0]), dlp = biq('lowpass', 1800, 0.5), wet = gain(st.tone.echo[1])
  dl.delayTime.value = sd * 3
  leadBus.connect(dl)
  dl.connect(dlp)
  dlp.connect(fb)
  fb.connect(dl)
  dlp.connect(wet).connect(pre)
  // Effet cassette : désaccord lent et rapide sur les accords et la mélodie.
  const wob = gain(1), w1 = osc('sine', 0.33), w2 = osc('sine', 5.5), w1g = gain(st.tone.wobble[0]), w2g = gain(st.tone.wobble[1])
  w1.connect(w1g).connect(wob)
  w2.connect(w2g).connect(wob)
  w1.start()
  w2.start()
  const crackle = gain(st.tone.crackle)
  loop(crackleBuffer(ctx), 0).connect(biq('highpass', 250, 0.5)).connect(crackle).connect(out)

  /** Règle le bus et le tempo sur une station. Les notes déjà lancées finissent dans l'ancien réglage. */
  function apply(to: Station) {
    st = to
    sd = 60 / to.bpm / 4
    lp.frequency.value = to.tone.lp
    sat.curve = satCurve(to.tone.sat)
    crackle.gain.value = to.tone.crackle
    w1g.gain.value = to.tone.wobble[0]
    w2g.gain.value = to.tone.wobble[1]
    fb.gain.value = to.tone.echo[0]
    wet.gain.value = to.tone.echo[1]
    dl.delayTime.value = sd * 3
  }

  let step = 0, bar = 0, next = 0, mIdx = 2, ghostOn = false, timer = 0, stopT = 0, switching = false
  let melody: Record<number, { n: number; d: number; v: number }> = {}
  const kicks: number[] = []

  // Ordonnanceur à anticipation : toutes les 25 ms, on programme ce qui tombe dans les 140 ms à venir.
  function tick() {
    if (switching) return
    const now = ctx.currentTime
    if (next < now - 0.05) next = now + 0.05
    const horizon = now + (document.hidden ? 1.6 : 0.14)
    while (next < horizon) {
      sched(step, next)
      next += sd
      if (++step === 16) {
        step = 0
        bar++
      }
    }
    // Publie les kicks joués, pour faire pulser la radio dans la scène.
    let n = 0
    while (kicks.length && kicks[0] <= now) {
      kicks.shift()
      n++
    }
    if (n) useStore.setState((s) => ({ kicks: s.kicks + n }))
  }

  // Mélodie sur certaines mesures d'un cycle de 8 : marche aléatoire dans les notes de l'accord.
  function genMelody(chord: Chord) {
    melody = {}
    const L = st.lead
    if (!L.bars.includes(bar % 8)) return
    const pool = chord.mel, steps = L.rhythms[(Math.random() * L.rhythms.length) | 0]
    let idx = mIdx
    steps.forEach((s, i) => {
      idx = clamp(idx + ((Math.random() * 5) | 0) - 2, 0, pool.length - 1)
      if (Math.random() < L.p) melody[s] = { n: pool[idx], d: i === steps.length - 1 ? 4 : rand(1.5, 2.5), v: rand(L.vel[0], L.vel[1]) }
    })
    mIdx = idx
  }

  function sched(s: number, t: number) {
    const d = st.drums, chord = st.chords[bar % st.chords.length]
    const at = s % 2 ? t + sd * st.swing : t // les doubles croches impaires sont retardées : le swing
    if (s === 0) {
      genMelody(chord)
      ghostOn = Math.random() < (d.ghost?.[2] ?? 0)
    }
    // batterie
    for (const [k, v] of d.kick) if (s === k) kick(at, v)
    if (d.ghost && s === d.ghost[0] && ghostOn) kick(at, d.ghost[1])
    for (const [k, v] of d.snare.hits) if (s === k) snare(at + d.snare.late, v)
    const sg = d.snare.ghost
    if (sg && s === sg[0] && Math.random() < sg[2]) snare(at, sg[1])
    const h = d.hat
    if (h.step && s % h.step === 0) hat(at, s % 4 === 0 ? h.hi : h.lo + Math.random() * h.jit)
    else if (h.extra.includes(s) && Math.random() < h.extraP) hat(at, h.extraV)
    // accords
    for (const [k, which, dur, v] of st.keys.hits) if (s === k) chordHit(which === 'all' ? chord.notes : chord.notes.slice(1), at, sd * dur, v)
    // basse (« next » : note d'approche, un demi-ton sous la fondamentale de l'accord suivant)
    for (const [k, kind, dur, v] of st.bass) {
      if (s !== k) continue
      const m = kind === 'root' ? chord.bass : kind === 'oct' ? chord.bass + 12 : kind === 'fifth' ? chord.bass + 7 : st.chords[(bar + 1) % st.chords.length].bass - 1
      bassNote(m, at, sd * dur, v)
    }
    // mélodie
    const m = melody[s]
    if (m) leadNote(m.n, at, m.d * sd, m.v)
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
    o.connect(g).connect(drumsBus)
    o.start(t)
    o.stop(t + 0.45)
    duck.gain.setTargetAtTime(0.55, t, 0.01)
    duck.gain.setTargetAtTime(1, t + 0.07, 0.16)
    kicks.push(t)
  }

  // Caisse claire, claquement de bois (cross-stick) ou balai.
  function snare(t: number, v: number) {
    const kind = st.drums.snare.kind
    if (kind === 'snare') {
      const s = noiseHit(t, 0.25), g = gain(0.0001)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v * 0.5, t + 0.004)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.2)
      s.connect(biq('bandpass', 1800, 0.8)).connect(g).connect(drumsBus)
      const o = osc('triangle', 190), g2 = gain(0.0001)
      g2.gain.setValueAtTime(0.0001, t)
      g2.gain.exponentialRampToValueAtTime(v * 0.25, t + 0.003)
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.09)
      o.connect(g2).connect(drumsBus)
      o.start(t)
      o.stop(t + 0.1)
    } else if (kind === 'rim') {
      const s = noiseHit(t, 0.06), g = gain(0.0001)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v * 0.45, t + 0.002)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.04)
      s.connect(biq('bandpass', 2600, 1.2)).connect(g).connect(drumsBus)
      const o = osc('sine', 430), g2 = gain(0.0001)
      g2.gain.setValueAtTime(0.0001, t)
      g2.gain.exponentialRampToValueAtTime(v * 0.3, t + 0.002)
      g2.gain.exponentialRampToValueAtTime(0.0001, t + 0.05)
      o.connect(g2).connect(drumsBus)
      o.start(t)
      o.stop(t + 0.06)
    } else {
      const s = noiseHit(t, 0.32), g = gain(0.0001)
      g.gain.setValueAtTime(0.0001, t)
      g.gain.exponentialRampToValueAtTime(v * 0.35, t + 0.05)
      g.gain.exponentialRampToValueAtTime(0.0001, t + 0.3)
      s.connect(biq('bandpass', 4200, 0.6)).connect(g).connect(drumsBus)
    }
  }

  // Grelots de traîneau : une grappe de petites cloches très aiguës, légèrement désaccordées à chaque coup, qui sonnent un instant,
  // et un souffle métallique à l'attaque.
  function sleigh(t: number, v: number) {
    const g = gain(0.0001)
    g.gain.setValueAtTime(0.0001, t)
    g.gain.exponentialRampToValueAtTime(v * 0.055, t + 0.004)
    g.gain.exponentialRampToValueAtTime(0.0003, t + 0.26)
    g.connect(drumsBus)
    ;[[2490, 1], [3320, 0.8], [4160, 0.6], [5380, 0.4], [6710, 0.3]].forEach(([f, a]) => {
      const o = osc('sine', f * (1 + (Math.random() - 0.5) * 0.04))
      o.connect(gain(a)).connect(g)
      o.start(t)
      o.stop(t + 0.3)
    })
    const s = noiseHit(t, 0.09), ng = gain(0.0001)
    ng.gain.setValueAtTime(0.0001, t)
    ng.gain.exponentialRampToValueAtTime(v * 0.1, t + 0.003)
    ng.gain.exponentialRampToValueAtTime(0.0003, t + 0.07)
    s.connect(biq('highpass', 6000, 0.7)).connect(ng).connect(drumsBus)
  }

  // Charley fermé, shaker (attaque plus douce, plus long) ou grelots.
  function hat(t: number, v: number) {
    if (st.drums.hat.kind === 'sleigh') return sleigh(t, v)
    const shaker = st.drums.hat.kind === 'shaker', s = noiseHit(t, shaker ? 0.12 : 0.08), g = gain(0.0001)
    if (shaker) {
      g.gain.setValueAtTime(0.0001, t)
      g.gain.linearRampToValueAtTime(v * 0.3, t + 0.01)
      g.gain.exponentialRampToValueAtTime(0.0005, t + 0.1)
      s.connect(biq('bandpass', 6500, 0.9)).connect(g).connect(drumsBus)
    } else {
      g.gain.setValueAtTime(v * 0.26, t)
      g.gain.exponentialRampToValueAtTime(0.0005, t + 0.045)
      s.connect(biq('highpass', 7000, 0.7)).connect(g).connect(drumsBus)
    }
  }

  // Accord arpégé, avec l'étalement de la station.
  function chordHit(notes: number[], t: number, dur: number, v: number) {
    notes.forEach((m, i) => keyNote(m, t + (i * st.keys.spread) / 1000, dur, v * 0.22))
  }

  // Une note d'accord : piano électrique, nappe ou corde pincée. Le désaccord de la cassette suit les deux premières voix.
  function keyNote(m: number, t: number, dur: number, v: number) {
    const f = mtof(m), g = gain(0)
    let oscs: OscillatorNode[], tail: number
    if (st.keys.voice === 'ep') {
      // Piano électrique : sinus + triangle désaccordé + attaque à 4× la fréquence.
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
      oscs = [o1, o2, o3]
      tail = 1.2
    } else if (st.keys.voice === 'pad') {
      // Nappe : attaque lente, la note se tient, filtre doux.
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(v * PAD, t + 0.35)
      g.gain.setTargetAtTime(v * PAD * 0.8, t + 0.35, 1.2)
      g.gain.setTargetAtTime(0, t + dur, 0.45)
      const o1 = osc('triangle', f), o2 = osc('sine', f * 1.005), soft = biq('lowpass', 1500, 0.5)
      o1.connect(soft)
      o2.connect(gain(0.6)).connect(soft)
      soft.connect(g)
      oscs = [o1, o2]
      tail = 2.6
    } else {
      // Corde pincée : attaque nette, la note retombe vite, les harmoniques s'éteignent avant le fondamental.
      g.gain.setValueAtTime(0, t)
      g.gain.linearRampToValueAtTime(v, t + 0.004)
      g.gain.setTargetAtTime(v * 0.06, t + 0.006, 0.42)
      g.gain.setTargetAtTime(0, t + dur, 0.08)
      const o1 = osc('triangle', f), o2 = osc('sine', f * 2), o3 = osc('sine', f * 3), g3 = gain(0.1), soft = biq('lowpass', 3200, 0.5)
      g3.gain.setValueAtTime(0.1, t)
      g3.gain.setTargetAtTime(0, t + 0.01, 0.08)
      o1.connect(soft)
      o2.connect(gain(0.25)).connect(soft)
      o3.connect(g3).connect(soft)
      soft.connect(g)
      oscs = [o1, o2, o3]
      tail = 1.2
    }
    g.connect(keysBus)
    wob.connect(oscs[0].detune)
    wob.connect(oscs[1].detune)
    for (const o of oscs) {
      o.start(t)
      o.stop(t + dur + tail)
    }
    oscs[0].onended = () => {
      try {
        wob.disconnect(oscs[0].detune)
        wob.disconnect(oscs[1].detune)
      } catch {
        // déjà déconnecté
      }
    }
  }

  // Basse : triangle + sinus, passe-bas 520.
  function bassNote(m: number, t: number, dur: number, v: number) {
    const f = mtof(m), o = osc('triangle', f), o2 = osc('sine', f), soft = biq('lowpass', 520, 0.7), g = gain(0)
    g.gain.setValueAtTime(0, t)
    g.gain.linearRampToValueAtTime(v * 0.5, t + 0.012)
    g.gain.setTargetAtTime(v * 0.32, t + 0.03, 0.25)
    g.gain.setTargetAtTime(0, t + dur, 0.07)
    o.connect(soft)
    o2.connect(soft)
    soft.connect(g).connect(bassBus)
    for (const x of [o, o2]) {
      x.start(t)
      x.stop(t + dur + 0.5)
    }
  }

  // Mélodie : clochette (sinus + 3e harmonique, ça sonne) ou boîte à musique (sinus + octave, attaque sèche, la note meurt vite).
  function leadNote(m: number, t: number, dur: number, v: number) {
    const box = st.lead.voice === 'mbox', f = mtof(m), o = osc('sine', f), o2 = osc('sine', f * (box ? 2 : 3)), g = gain(0), g2 = gain(box ? 0.25 : 0.12)
    g.gain.setValueAtTime(0, t)
    if (box) {
      g.gain.linearRampToValueAtTime(v, t + 0.003)
      g.gain.setTargetAtTime(v * 0.06, t + 0.006, 0.2)
      g.gain.setTargetAtTime(0, t + dur, 0.1)
    } else {
      g.gain.linearRampToValueAtTime(v, t + 0.006)
      g.gain.setTargetAtTime(v * 0.4, t + 0.01, 0.25)
      g.gain.setTargetAtTime(0, t + dur, 0.18)
    }
    o.connect(g)
    o2.connect(g2).connect(g)
    g.connect(leadBus)
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

  // On change de station : à l'arrêt, on règle simplement le bus ; en marche, on « tourne le bouton » (le son se coupe, le
  // grésillement de recherche passe, la nouvelle station repart sur le premier temps).
  let want = st.id
  useStore.subscribe((s, p) => {
    if (s.station === p.station) return
    want = s.station
    if (!timer || !s.on.radio) {
      apply(stationById(want))
      pre.gain.value = trim(st)
      return
    }
    if (switching) return // la station demandée en dernier est prise à la fin du grésillement
    switching = true
    const t = ctx.currentTime
    pre.gain.cancelScheduledValues(t)
    pre.gain.setTargetAtTime(0, t, 0.03)
    tuneStatic(kit)
    window.setTimeout(() => {
      apply(stationById(want))
      step = 0
      bar = 0
      mIdx = 2
      melody = {}
      kicks.length = 0
      const now = ctx.currentTime
      next = now + 0.1
      pre.gain.cancelScheduledValues(now)
      pre.gain.setTargetAtTime(trim(st), now, 0.1)
      switching = false
    }, 300)
  })

  return {
    start() {
      clearTimeout(stopT)
      if (timer) return
      if (st.id !== useStore.getState().station) apply(stationById(useStore.getState().station))
      pre.gain.cancelScheduledValues(ctx.currentTime)
      pre.gain.value = trim(st)
      tuneStatic(kit)
      next = ctx.currentTime + 0.5
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
