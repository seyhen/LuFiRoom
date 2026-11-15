// Source un son sur Freesound (CC0 uniquement) sans quitter le terminal.
//
//   npm run source -- search greenhouse/frogs "frogs night pond" [--geste]
//       cherche en CC0 (15 à 120 s, les plus téléchargés), télécharge les aperçus de 5 candidats, les mesure
//       (analyze-sound.cjs) et affiche le tableau avec les liens pour les écouter.
//   npm run source -- pick greenhouse/frogs 32654 [--start 5] [--len 60] [--stereo]
//       coupe le candidat choisi vers audio-src/greenhouse/frogs.wav, ajoute sa ligne à public/audio/CREDITS.md
//       et affiche la ligne `loops` à coller ; ensuite `npm run audio`.
//
// La clé FREESOUND_API_KEY est lue dans .env. L'aperçu est un MP3 (le fichier original demande OAuth2) : bon pour un fond
// d'ambiance. Le script ne juge pas le plaisir d'écoute : écoute les finalistes avant de faire `pick`.

import { spawnSync } from 'node:child_process'
import { appendFileSync, existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'

const API = 'https://freesound.org/apiv2'
const CC0 = 'http://creativecommons.org/publicdomain/zero/1.0/'
const CREDITS = join('public', 'audio', 'CREDITS.md')
const SECTION = '## Sons Freesound (CC0, récupérés par `npm run source`)'
// Hors de audio-src/ : encode-audio.mjs encoderait tout ce qu'il y trouve.
const CAND = join(tmpdir(), 'lufiroom-candidats')

const [cmd, target, arg] = process.argv.slice(2).filter((a) => !a.startsWith('--'))
const flag = (name, def) => {
  const i = process.argv.indexOf(`--${name}`)
  return i < 0 ? def : process.argv[i + 1]
}
const has = (name) => process.argv.includes(`--${name}`)
const die = (msg) => (console.error(msg), process.exit(1))

if (!['search', 'pick'].includes(cmd) || !/^[a-z]+\/[a-z0-9-]+$/.test(target ?? '') || !arg)
  die('Usage : npm run source -- search <pièce/son> "<mots anglais>" [--geste]\n        npm run source -- pick <pièce/son> <id Freesound> [--start s] [--len 60] [--stereo]')

const env = existsSync('.env') ? readFileSync('.env', 'utf8') : ''
const token = process.env.FREESOUND_API_KEY || env.match(/^FREESOUND_API_KEY=(\S+)/m)?.[1]
if (!token) die('FREESOUND_API_KEY manquante : mets-la dans .env (clé sur freesound.org/apiv2/apply).')

async function api(path, params = {}) {
  const url = new URL(API + path)
  for (const [k, v] of Object.entries({ ...params, token })) url.searchParams.set(k, v)
  const r = await fetch(url)
  if (!r.ok) die(`Freesound ${r.status} sur ${path} : ${(await r.text()).slice(0, 200)}`)
  return r.json()
}

async function preview(sound) {
  const file = join(CAND, target.replace('/', '-'), `${sound.id}.mp3`)
  mkdirSync(dirname(file), { recursive: true })
  const r = await fetch(sound.previews['preview-hq-mp3'])
  if (!r.ok) die(`Aperçu ${sound.id} indisponible (${r.status})`)
  writeFileSync(file, Buffer.from(await r.arrayBuffer()))
  return file
}

const FIELDS = 'id,name,username,duration,num_downloads,avg_rating,num_ratings,license,tags,previews,url'

if (cmd === 'search') {
  const res = await api('/search/text/', {
    query: arg, sort: 'downloads_desc', page_size: 5, fields: FIELDS,
    filter: 'license:"Creative Commons 0" duration:[15 TO 120]',
  })
  if (!res.results.length) die(`Aucun CC0 de 15 à 120 s pour « ${arg} » : essaie d'autres mots.`)
  console.log(`${res.count} résultats CC0 pour « ${arg} » ; les 5 plus téléchargés :\n`)
  const files = []
  for (const s of res.results) {
    files.push(await preview(s))
    console.log(`${s.id}  ${s.name}  (${s.username}, ${s.duration.toFixed(0)} s, ${s.num_downloads} téléch., note ${s.avg_rating.toFixed(1)}/${s.num_ratings})\n     ${s.url}\n     ${s.tags.slice(0, 8).join(', ')}`)
  }
  console.log('\nMesures (le nom du fichier est l\'id) :')
  spawnSync('node', ['.claude/skills/source-sounds/analyze-sound.cjs', ...(has('geste') ? ['--geste'] : []), ...files], { stdio: 'inherit' })
  console.log(`\nÉcoute les liens, puis : npm run source -- pick ${target} <id>`)
} else {
  const s = await api(`/sounds/${arg}/`, { fields: FIELDS })
  if (s.license !== CC0) die(`Le son ${arg} n'est pas CC0 (${s.license}) : refusé (règle du projet).`)
  const [room, son] = target.split('/')
  const mp3 = await preview(s)
  const out = join('audio-src', room, `${son}.wav`)
  mkdirSync(dirname(out), { recursive: true })
  const start = Number(flag('start', 0)), len = Math.min(Number(flag('len', 60)), 60)
  const ch = has('stereo') ? 2 : 1
  const r = spawnSync('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error', '-ss', start, '-t', len, '-i', mp3, '-ac', ch, '-ar', 48000, out], { encoding: 'utf8' })
  if (r.status !== 0) die(`ffmpeg a échoué : ${r.stderr || r.error}`)

  const cut = `${Math.min(len, s.duration - start).toFixed(0)} s à partir de ${start} s, ${ch === 2 ? 'stéréo' : 'mono'}`
  const row = `| \`${target}\` | ${s.name.replace(/\|/g, '/')} | ${s.username} | <${s.url}> | CC0 | ${cut} | ${new Date().toISOString().slice(0, 10)} |\n`
  const doc = readFileSync(CREDITS, 'utf8')
  if (doc.includes(`\`${target}\` |`)) console.log(`(crédit déjà présent pour ${target} : à mettre à jour à la main)`)
  else if (doc.includes(SECTION)) writeFileSync(CREDITS, doc.replace(/(## Sons Freesound[^\n]*\n(?:[^\n]*\n)*?\|[-| ]+\|\n(?:\|[^\n]*\n)*)/, `$1${row}`))
  else appendFileSync(CREDITS, `\n${SECTION}\n\nLicence **CC0** (domaine public) : aucune mention obligatoire. Aperçu MP3 de Freesound, coupé, ramené à −20 LUFS par \`npm run audio\`.\n\n| Fichier | Titre | Auteur | Source | Licence | Retouches | Ajouté le |\n|---|---|---|---|---|---|---|\n${row}`)

  console.log(`${out}  (${cut})\nCrédit ajouté à ${CREDITS}.\nProchaine étape : npm run audio, puis dans src/rooms/${room}.ts :\n  loops: { ${son}: { src: 'audio/${room}/${son}', gain: 0.8 } }\nPuis un mode de lecture dans le canal (voir skill source-sounds, étape 3) et le niveau (étape 4).`)
}
