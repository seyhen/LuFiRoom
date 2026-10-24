// Contrôle des sons de public/audio/ : sonie, crêtes, paires webm + mp3.
//
//   npm run audio:check
//
// Échec (code 1) : crête vraie au-dessus de PEAK_MAX (craquement possible), ou un format sans son jumeau.
// Avertissement : sonie à plus de LUFS_TOL de la cible (-20 LUFS, voir encode-audio.mjs), boucle de moins de SHORT s.
// Il faut ffmpeg dans le PATH.

import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, statSync } from 'node:fs'
import { extname, join, relative } from 'node:path'

const DIR = join('public', 'audio')
const LUFS = -20, LUFS_TOL = 1.5, PEAK_MAX = -0.5, SHORT = 4

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if (['.webm', '.mp3'].includes(extname(name))) yield p
  }
}

// Sonie intégrée et crête vraie, lues dans le résumé d'ebur128 (écrit en fin de sortie d'erreur).
function measure(file) {
  const r = spawnSync('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', 'ebur128=peak=true', '-f', 'null', '-'], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (r.error?.code === 'ENOENT') {
    console.error('ffmpeg introuvable. Installe ffmpeg (Windows : winget install Gyan.FFmpeg), puis rouvre le terminal.')
    process.exit(1)
  }
  const summary = r.stderr.slice(r.stderr.lastIndexOf('Summary:'))
  const lufs = Number(/I:\s+(-?[\d.]+) LUFS/.exec(summary)?.[1]), peak = Number(/Peak:\s+(-?[\d.]+) dBFS/.exec(summary)?.[1])
  const dur = Number(/time=(\d+):(\d+):([\d.]+)/g.exec(r.stderr.match(/time=\S+/g)?.at(-1) ?? '')?.slice(1).reduce((a, v) => a * 60 + Number(v), 0))
  return { lufs, peak, dur }
}

if (!existsSync(DIR)) {
  console.error(`Pas de dossier ${DIR}/.`)
  process.exit(1)
}

let errors = 0, warns = 0, n = 0
for (const file of walk(DIR)) {
  const rel = relative(DIR, file)
  const twin = file.endsWith('.webm') ? file.replace(/\.webm$/, '.mp3') : file.replace(/\.mp3$/, '.webm')
  const { lufs, peak, dur } = measure(file)
  n++
  const bad = []
  if (!existsSync(twin)) bad.push(`pas de ${extname(twin).slice(1)} jumeau`)
  if (!Number.isFinite(peak) || !Number.isFinite(lufs)) bad.push('mesure illisible')
  else if (peak > PEAK_MAX) bad.push(`crête ${peak.toFixed(1)} dBTP (max ${PEAK_MAX})`)
  if (bad.length) {
    errors++
    console.log(`ERREUR   ${rel}  ${bad.join(', ')}`)
  }
  const soft = []
  if (Number.isFinite(lufs) && Math.abs(lufs - LUFS) > LUFS_TOL) soft.push(`${lufs.toFixed(1)} LUFS (cible ${LUFS} ±${LUFS_TOL})`)
  if (Number.isFinite(dur) && dur < SHORT && !rel.startsWith('radio')) soft.push(`boucle courte (${dur.toFixed(1)} s)`)
  if (soft.length) {
    warns++
    console.log(`attention ${rel}  ${soft.join(', ')}`)
  }
}
console.log(`${n} fichiers : ${errors} erreur${errors > 1 ? 's' : ''}, ${warns} avertissement${warns > 1 ? 's' : ''}.`)
process.exit(errors ? 1 : 0)
