// Les stations de la radio : le même petit groupe (batterie, piano, basse, clochette), réglé autrement à chaque fois.
// Le moteur qui les joue est channels/radio.ts ; `npm run stations` vérifie la musique (accords, notes, rythmes).
// Pour en ajouter une : docs/RADIO.md.

/** Voix des accords : piano électrique, nappe qui gonfle, corde pincée. */
export type Voice = 'ep' | 'pad' | 'pluck'
/** Voix de la mélodie : clochette ou boîte à musique. */
export type Lead = 'bell' | 'mbox'
export type SnareKind = 'snare' | 'rim' | 'brush'
export type HatKind = 'closed' | 'shaker'
/** Note de basse : la fondamentale, son octave, sa quinte, ou une note d'approche sous la fondamentale de l'accord suivant. */
export type BassKind = 'root' | 'oct' | 'fifth' | 'next'
export type Quality = 'maj9' | 'm9' | '13' | '69'

/** Un accord d'une mesure : sa basse, les quatre notes du piano et les notes où la mélodie se promène (MIDI). */
export interface Chord {
  name: string
  /** Fondamentale, en classe de hauteur (0 = do). */
  root: number
  q: Quality
  bass: number
  notes: number[]
  mel: number[]
}

/** Un pas : seize par mesure (doubles croches), de 0 à 15. */
type Step = number
type Hit = [step: Step, velocity: number]

export interface Station {
  /** Identifiant stable : mémorisé, et dans les liens de partage. */
  id: string
  /** Nom affiché sous « Radio lofi » : douze caractères au plus, la carte est étroite. */
  name: string
  about: string
  bpm: number
  /** Retard des doubles croches impaires, en part de pas (0.28 = 28 %). */
  swing: number
  /** Niveau de la station, pour que changer de station ne change pas le volume (mesuré, voir docs/RADIO.md). */
  level: number
  tone: {
    /** Passe-bas du bus (Hz) : plus bas, plus étouffé. */
    lp: number
    /** Saturation douce tanh(k·x). */
    sat: number
    /** Crépitement de vinyle. */
    crackle: number
    /** Désaccord de la cassette, en cents : lent, puis rapide. */
    wobble: [slow: number, fast: number]
    /** Écho de la mélodie : retour, puis niveau. */
    echo: [feedback: number, wet: number]
  }
  /** Une mesure chacun. */
  chords: Chord[]
  keys: {
    voice: Voice
    /** Décalage entre les notes d'un accord, en ms. */
    spread: number
    /** Quand l'accord sonne : pas, toutes les notes ou les trois hautes, durée en pas, vélocité. */
    hits: [step: Step, which: 'all' | 'upper', steps: number, velocity: number][]
  }
  bass: [step: Step, kind: BassKind, steps: number, velocity: number][]
  drums: {
    kick: Hit[]
    /** Kick fantôme : pas, vélocité, chance qu'il joue dans une mesure. */
    ghost?: [step: Step, velocity: number, chance: number]
    snare: { kind: SnareKind; late: number; hits: Hit[]; ghost?: [step: Step, velocity: number, chance: number] }
    /** Charley : un coup tous les `step` pas (0 = aucun), fort sur les temps, plus doux entre ; `extra` : coups en plus, au hasard. */
    hat: { kind: HatKind; step: number; hi: number; lo: number; jit: number; extra: Step[]; extraV: number; extraP: number }
  }
  lead: {
    voice: Lead
    /** Les mesures (d'un cycle de 8) où la mélodie joue. */
    bars: number[]
    /** Rythmes possibles, en pas. */
    rhythms: Step[][]
    /** Chance de jouer chaque note du rythme. */
    p: number
    vel: [min: number, max: number]
  }
}

const NOTE = ['C', 'Db', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B']
const SUFFIX: Record<Quality, string> = { maj9: 'maj9', m9: 'm9', '13': '13', '69': '6/9' }
const chord = (root: number, q: Quality, bass: number, notes: number[], mel: number[]): Chord => ({ name: NOTE[root] + SUFFIX[q], root, q, bass, notes, mel })

// Accords. Les voicings sont choisis pour que les notes bougent peu d'un accord à l'autre.
const Cmaj9 = chord(0, 'maj9', 36, [52, 55, 59, 62], [67, 71, 72, 74, 76, 79])
const Cmaj9b = chord(0, 'maj9', 36, [55, 59, 62, 64], [67, 71, 72, 74, 76, 79])
const C69 = chord(0, '69', 36, [55, 57, 62, 64], [67, 69, 72, 74, 76, 79])
const Dm9 = chord(2, 'm9', 38, [53, 57, 60, 64], [69, 72, 74, 76, 77, 81])
const Am9 = chord(9, 'm9', 33, [55, 59, 60, 64], [67, 69, 71, 72, 76, 79])
const Am9lo = chord(9, 'm9', 33, [52, 55, 59, 60], [67, 69, 71, 72, 76, 79])
const G13 = chord(7, '13', 31, [53, 57, 59, 64], [67, 71, 74, 76, 77, 79])
const Gm9 = chord(7, 'm9', 31, [53, 57, 58, 62], [69, 70, 74, 77, 79, 81])
const Bbmaj9 = chord(10, 'maj9', 34, [53, 57, 60, 62], [69, 72, 74, 77, 79, 81])
const Fmaj9 = chord(5, 'maj9', 29, [52, 55, 57, 60], [69, 72, 76, 77, 79, 81])
const Fmaj9b = chord(5, 'maj9', 29, [55, 57, 60, 64], [67, 69, 72, 76, 77, 79])
const Fmaj9hi = chord(5, 'maj9', 41, [55, 57, 60, 64], [69, 72, 76, 77, 79, 81])

export const STATIONS: Station[] = [
  {
    // La radio d'origine du prototype : rien n'a changé.
    id: 'nuit-douce',
    name: 'Nuit douce',
    about: 'Piano électrique et clochette, 72 bpm.',
    bpm: 72,
    swing: 0.28,
    level: 1,
    tone: { lp: 3200, sat: 1.6, crackle: 0.3, wobble: [9, 2.5], echo: [0.3, 0.35] },
    chords: [Cmaj9, Am9, Dm9, G13],
    keys: { voice: 'ep', spread: 18, hits: [[0, 'all', 9, 0.55], [10, 'upper', 5.5, 0.32]] },
    bass: [[0, 'root', 5, 0.8], [7, 'oct', 1.2, 0.35], [10, 'root', 3, 0.65], [14, 'next', 1.8, 0.45]],
    drums: {
      kick: [[0, 1], [10, 0.85]],
      ghost: [7, 0.45, 0.5],
      snare: { kind: 'snare', late: 0.012, hits: [[4, 0.75], [12, 0.75]], ghost: [15, 0.18, 0.25] },
      hat: { kind: 'closed', step: 2, hi: 0.42, lo: 0.28, jit: 0.08, extra: [3, 11, 13], extraV: 0.16, extraP: 0.35 },
    },
    lead: { voice: 'bell', bars: [4, 5, 6, 7], rhythms: [[0, 3, 6, 10, 14], [2, 6, 8, 11], [0, 4, 7, 10, 12], [3, 6, 10, 13], [0, 2, 6, 8, 12]], p: 0.85, vel: [0.12, 0.18] },
  },
  {
    id: 'petit-matin',
    name: 'Petit matin',
    about: 'Guitare pincée et boîte à musique, 82 bpm.',
    bpm: 82,
    swing: 0.22,
    level: 1.35,
    tone: { lp: 4200, sat: 1.3, crackle: 0.18, wobble: [6, 1.8], echo: [0.28, 0.3] },
    chords: [Bbmaj9, Am9, Gm9, Fmaj9],
    keys: { voice: 'pluck', spread: 28, hits: [[0, 'all', 3, 0.55], [6, 'upper', 2.5, 0.38], [10, 'all', 3, 0.5], [14, 'upper', 2, 0.34]] },
    bass: [[0, 'root', 4, 0.8], [6, 'fifth', 2, 0.5], [10, 'root', 2.5, 0.6], [14, 'next', 1.8, 0.45]],
    drums: {
      kick: [[0, 0.8], [10, 0.6]],
      ghost: [7, 0.3, 0.3],
      snare: { kind: 'rim', late: 0.008, hits: [[4, 0.55], [12, 0.55]], ghost: [15, 0.12, 0.2] },
      hat: { kind: 'shaker', step: 2, hi: 0.4, lo: 0.22, jit: 0.06, extra: [3, 11, 13], extraV: 0.1, extraP: 0.3 },
    },
    lead: { voice: 'mbox', bars: [2, 3, 6, 7], rhythms: [[0, 6, 10], [3, 8, 12], [2, 6, 11, 14], [0, 4, 8, 12]], p: 0.8, vel: [0.1, 0.15] },
  },
  {
    id: 'brume',
    name: 'Brume',
    about: 'Piano voilé, vinyle et écho, 66 bpm.',
    bpm: 66,
    swing: 0.3,
    level: 1.1,
    tone: { lp: 2600, sat: 1.8, crackle: 0.5, wobble: [13, 3.5], echo: [0.42, 0.45] },
    chords: [Am9, Fmaj9b, Cmaj9b, G13],
    keys: { voice: 'ep', spread: 24, hits: [[0, 'all', 13, 0.5], [11, 'upper', 4.5, 0.24]] },
    bass: [[0, 'root', 6, 0.75], [10, 'root', 4, 0.5], [14, 'next', 1.8, 0.4]],
    drums: {
      kick: [[0, 0.8], [10, 0.6]],
      snare: { kind: 'rim', late: 0.01, hits: [[4, 0.4], [12, 0.4]] },
      hat: { kind: 'shaker', step: 2, hi: 0.2, lo: 0.12, jit: 0.04, extra: [], extraV: 0, extraP: 0 },
    },
    lead: { voice: 'bell', bars: [5, 7], rhythms: [[0, 6, 10], [2, 8, 12]], p: 0.75, vel: [0.1, 0.14] },
  },
  {
    id: 'veillee',
    name: 'Veillée',
    about: 'Nappes chaudes et boîte à musique, 62 bpm.',
    bpm: 62,
    swing: 0.2,
    level: 1,
    tone: { lp: 2200, sat: 1.5, crackle: 0.35, wobble: [10, 3], echo: [0.38, 0.4] },
    chords: [Dm9, Bbmaj9, Fmaj9hi, C69],
    keys: { voice: 'pad', spread: 40, hits: [[0, 'all', 16, 0.5]] },
    bass: [[0, 'root', 7, 0.7], [10, 'root', 4, 0.45], [14, 'next', 1.8, 0.35]],
    drums: {
      kick: [[0, 0.7], [10, 0.5]],
      snare: { kind: 'brush', late: 0, hits: [[4, 0.35], [12, 0.35]] },
      hat: { kind: 'closed', step: 0, hi: 0, lo: 0, jit: 0, extra: [], extraV: 0, extraP: 0 },
    },
    lead: { voice: 'mbox', bars: [2, 3, 6, 7], rhythms: [[0, 7, 10], [4, 8, 14], [2, 6, 11]], p: 0.7, vel: [0.1, 0.15] },
  },
  {
    id: 'bureau',
    name: 'Bureau',
    about: 'Piano électrique et batterie sèche, 86 bpm, pour se concentrer.',
    bpm: 86,
    swing: 0.26,
    level: 1,
    tone: { lp: 3000, sat: 1.7, crackle: 0.3, wobble: [7, 2], echo: [0.3, 0.3] },
    chords: [Dm9, G13, Cmaj9, Am9lo],
    keys: { voice: 'ep', spread: 14, hits: [[0, 'all', 7, 0.5], [7, 'upper', 2.5, 0.3], [10, 'upper', 5, 0.32]] },
    bass: [[0, 'root', 4, 0.8], [6, 'oct', 1.5, 0.4], [10, 'root', 3, 0.65], [14, 'next', 1.8, 0.45]],
    drums: {
      kick: [[0, 1], [10, 0.85]],
      ghost: [7, 0.5, 0.6],
      snare: { kind: 'snare', late: 0.01, hits: [[4, 0.85], [12, 0.85]], ghost: [15, 0.2, 0.35] },
      hat: { kind: 'closed', step: 2, hi: 0.4, lo: 0.3, jit: 0.08, extra: [3, 11, 13], extraV: 0.14, extraP: 0.3 },
    },
    lead: { voice: 'bell', bars: [4, 5, 6, 7], rhythms: [[2, 6, 10], [0, 8, 11], [3, 7, 12]], p: 0.55, vel: [0.09, 0.13] },
  },
]

/** La station d'identifiant `id`, ou la première si on ne la connaît pas (un lien ancien, un navigateur qui se souvient d'une station retirée). */
export const stationById = (id: string) => STATIONS.find((s) => s.id === id) ?? STATIONS[0]

/** La station qui suit (ou précède, `dir` = -1), en tournant. */
export const stationAfter = (id: string, dir = 1) => STATIONS[(STATIONS.indexOf(stationById(id)) + dir + STATIONS.length) % STATIONS.length]

/** Sous-titre de la carte « Radio lofi » : la station choisie, ou, avec des pistes enregistrées, la piste en cours. */
export const radioSub = (tracks: number) => (s: { on: Record<string, boolean>; onAir: string; station: string }) =>
  tracks ? (s.on.radio && s.onAir) || `lofi · ${tracks} morceau${tracks > 1 ? 'x' : ''}` : stationById(s.station).name
