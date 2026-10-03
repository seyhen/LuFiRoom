// Vérifie la musique des stations de la radio (src/audio/stations.ts). On ne peut pas l'écouter dans un script, mais on peut
// vérifier la théorie : notes dans l'accord, basse sur la fondamentale, voix qui bougent peu, rythmes dans la mesure,
// et que la première station est bien la radio du prototype.   npm run stations
import { STATIONS } from '../src/audio/stations.ts'

// Notes permises, en demi-tons au-dessus de la fondamentale.
const TONES = { maj9: [0, 4, 7, 11, 2], m9: [0, 3, 7, 10, 2], 13: [0, 4, 7, 10, 2, 9], 69: [0, 4, 7, 9, 2] }
const MELODY = { maj9: [0, 2, 4, 7, 9, 11], m9: [0, 2, 3, 5, 7, 10], 13: [0, 2, 4, 7, 9, 10], 69: [0, 2, 4, 7, 9] }
const VOICES = ['ep', 'pad', 'pluck'], LEADS = ['bell', 'mbox'], SNARES = ['snare', 'rim', 'brush'], HATS = ['closed', 'shaker', 'sleigh'], BASS = ['root', 'oct', 'fifth', 'next']
// La radio du prototype (docs/PROTOTYPE.md) : la première station doit rester identique.
const PROTO = {
  bpm: 72,
  swing: 0.28,
  chords: [
    { name: 'Cmaj9', bass: 36, notes: [52, 55, 59, 62], mel: [67, 71, 72, 74, 76, 79] },
    { name: 'Am9', bass: 33, notes: [55, 59, 60, 64], mel: [67, 69, 71, 72, 76, 79] },
    { name: 'Dm9', bass: 38, notes: [53, 57, 60, 64], mel: [69, 72, 74, 76, 77, 81] },
    { name: 'G13', bass: 31, notes: [53, 57, 59, 64], mel: [67, 71, 74, 76, 77, 79] },
  ],
}

const errors = []
const bad = (st, msg) => errors.push(`${st.id}: ${msg}`)
const inRange = (v, a, b) => Number.isFinite(v) && v >= a && v <= b
const isStep = (s) => Number.isInteger(s) && s >= 0 && s <= 15
const asc = (a) => a.every((v, i) => !i || v > a[i - 1])
const pc = (n, root) => (((n - root) % 12) + 12) % 12

const seen = new Set()
for (const st of STATIONS) {
  if (!/^[a-z]+(-[a-z]+)*$/.test(st.id)) bad(st, 'identifiant : minuscules et tirets')
  if (seen.has(st.id)) bad(st, 'identifiant en double')
  seen.add(st.id)
  if (!st.name || st.name.length > 12) bad(st, `nom de ${st.name?.length} caractères (12 au plus)`)
  if (!st.about) bad(st, 'description manquante')
  if (!inRange(st.bpm, 50, 100)) bad(st, `tempo ${st.bpm}`)
  if (!inRange(st.swing, 0, 0.4)) bad(st, `swing ${st.swing}`)
  if (!inRange(st.level, 0.3, 2)) bad(st, `niveau ${st.level}`)
  if (!inRange(st.tone.lp, 800, 8000) || !inRange(st.tone.sat, 0.5, 4) || !inRange(st.tone.crackle, 0, 1)) bad(st, 'tone hors limites')
  if (!inRange(st.tone.echo[0], 0, 0.7) || !inRange(st.tone.echo[1], 0, 0.8)) bad(st, "écho hors limites (retour 0.7 au plus : au-delà il s'emballe)")

  // accords
  if (!inRange(st.chords.length, 2, 8)) bad(st, `${st.chords.length} accords`)
  st.chords.forEach((c, i) => {
    const w = `accord ${i + 1} (${c.name})`
    if (!TONES[c.q]) return bad(st, `${w} : qualité ${c.q} inconnue`)
    if (pc(c.bass, c.root) !== 0) bad(st, `${w} : la basse ${c.bass} n'est pas la fondamentale`)
    if (!inRange(c.bass, 26, 46)) bad(st, `${w} : basse ${c.bass} hors de 26-46`)
    if (c.notes.length !== 4 || !asc(c.notes)) bad(st, `${w} : quatre notes croissantes attendues`)
    for (const n of c.notes) {
      if (!TONES[c.q].includes(pc(n, c.root))) bad(st, `${w} : la note ${n} n'est pas dans l'accord`)
      if (!inRange(n, 48, 68)) bad(st, `${w} : note ${n} hors de 48-68`)
    }
    if (c.mel.length < 5 || !asc(c.mel)) bad(st, `${w} : mélodie, cinq notes croissantes au moins`)
    for (const n of c.mel) {
      if (!MELODY[c.q].includes(pc(n, c.root))) bad(st, `${w} : la note de mélodie ${n} sonnerait faux`)
      if (!inRange(n, 64, 84)) bad(st, `${w} : note de mélodie ${n} hors de 64-84`)
    }
  })
  // d'un accord au suivant (et du dernier au premier) : les voix bougent peu, la basse ne saute pas
  st.chords.forEach((c, i) => {
    const d = st.chords[(i + 1) % st.chords.length]
    const move = Math.max(...c.notes.map((n, k) => Math.abs(d.notes[k] - n)))
    if (move > 4) bad(st, `${c.name} -> ${d.name} : une voix saute de ${move} demi-tons (4 au plus)`)
    if (Math.abs(d.bass - c.bass) > 8) bad(st, `${c.name} -> ${d.name} : la basse saute de ${Math.abs(d.bass - c.bass)} demi-tons (8 au plus)`)
  })

  // rythmes
  if (!VOICES.includes(st.keys.voice)) bad(st, `voix ${st.keys.voice}`)
  if (!inRange(st.keys.spread, 0, 80)) bad(st, `étalement ${st.keys.spread}`)
  if (!st.keys.hits.length) bad(st, 'aucun accord joué')
  for (const [s, which, d, v] of st.keys.hits) if (!isStep(s) || !['all', 'upper'].includes(which) || !inRange(d, 0.5, 16) || !inRange(v, 0.01, 1)) bad(st, `accord joué invalide : ${[s, which, d, v]}`)
  for (const [s, kind, d, v] of st.bass) if (!isStep(s) || !BASS.includes(kind) || !inRange(d, 0.5, 16) || !inRange(v, 0.01, 1)) bad(st, `basse invalide : ${[s, kind, d, v]}`)
  const { kick, ghost, snare, hat } = st.drums
  if (!kick.length) bad(st, 'aucun kick')
  for (const [s, v] of [...kick, ...snare.hits]) if (!isStep(s) || !inRange(v, 0.01, 1)) bad(st, `coup de batterie invalide : ${[s, v]}`)
  for (const g of [ghost, snare.ghost]) if (g && (!isStep(g[0]) || !inRange(g[1], 0.01, 1) || !inRange(g[2], 0, 1))) bad(st, `coup fantôme invalide : ${g}`)
  if (kick.some(([s]) => snare.hits.some(([t]) => t === s))) bad(st, 'un kick et une caisse claire sur le même pas')
  if (!SNARES.includes(snare.kind)) bad(st, `caisse claire ${snare.kind}`)
  if (!HATS.includes(hat.kind) || ![0, 2, 4].includes(hat.step) || !hat.extra.every(isStep) || !inRange(hat.extraP, 0, 1)) bad(st, 'charley invalide')
  if (!LEADS.includes(st.lead.voice) || !st.lead.bars.every((b) => Number.isInteger(b) && b >= 0 && b <= 7)) bad(st, 'mélodie : voix ou mesures invalides')
  for (const r of st.lead.rhythms) if (!r.every(isStep) || !asc(r)) bad(st, `rythme de mélodie invalide : ${r}`)
  if (!inRange(st.lead.p, 0.05, 1) || st.lead.vel[0] > st.lead.vel[1] || !inRange(st.lead.vel[1], 0.01, 0.4)) bad(st, 'mélodie : probabilité ou vélocité invalides')
}

// La première station est la radio du prototype.
const first = STATIONS[0]
if (first.bpm !== PROTO.bpm || first.swing !== PROTO.swing) errors.push(`${first.id}: tempo ou swing différent du prototype`)
PROTO.chords.forEach((p, i) => {
  const c = first.chords[i]
  if (!c || c.name !== p.name || c.bass !== p.bass || c.notes.join() !== p.notes.join() || c.mel.join() !== p.mel.join()) errors.push(`${first.id}: accord ${i + 1} différent du prototype`)
})

for (const st of STATIONS) {
  const kicks = st.drums.kick.length + (st.drums.ghost ? st.drums.ghost[2] : 0)
  console.log(`${st.name.padEnd(12)} ${String(st.bpm).padStart(3)} bpm  swing ${Math.round(st.swing * 100)} %  ${st.keys.voice.padEnd(5)} ${st.lead.voice.padEnd(5)}  ${st.chords.map((c) => c.name).join(' - ')}  (${kicks.toFixed(1)} kicks / mesure)`)
}
if (errors.length) {
  console.error(`\n${errors.length} problème${errors.length > 1 ? 's' : ''} :\n- ${errors.join('\n- ')}`)
  process.exit(1)
}
console.log(`\n${STATIONS.length} stations : accords, notes, rythmes et parité avec le prototype vérifiés.`)
