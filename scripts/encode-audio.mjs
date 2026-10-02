// Prépare les sons pour le web : chaque source de audio-src/ devient un .webm (Opus, léger) et un .mp3 (repli pour
// les navigateurs sans Opus) dans public/audio/, au même chemin, tous ramenés à la même sonie (-20 LUFS).
//
//   audio-src/bedroom/rain.wav  ->  public/audio/bedroom/rain.webm + rain.mp3   (dans la chambre : src 'audio/bedroom/rain')
//
// Usage : npm run audio              encode ce qui est nouveau ou modifié
//         npm run audio -- --force   réencode tout
// Il faut ffmpeg dans le PATH (Windows : winget install Gyan.FFmpeg, puis rouvrir le terminal).

import { spawnSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, statSync } from 'node:fs'
import { dirname, extname, join, relative } from 'node:path'

const SRC = 'audio-src', OUT = join('public', 'audio')
const LUFS = -20, TRUE_PEAK = -1.5
const EXTS = new Set(['.wav', '.flac', '.aif', '.aiff', '.mp3', '.ogg', '.opus', '.m4a', '.webm'])
const force = process.argv.includes('--force')

function run(cmd, args) {
  const r = spawnSync(cmd, args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })
  if (r.error?.code === 'ENOENT') {
    console.error(`${cmd} introuvable. Installe ffmpeg (Windows : winget install Gyan.FFmpeg), puis rouvre le terminal.`)
    process.exit(1)
  }
  if (r.status !== 0) throw new Error(`${cmd} a échoué :\n${r.stderr.slice(-2000)}`)
  return r
}

// loudnorm écrit son rapport JSON vers la fin de la sortie d'erreur.
function report(stderr) {
  const i = stderr.lastIndexOf('{')
  return JSON.parse(stderr.slice(i, stderr.indexOf('}', i) + 1))
}

function* walk(dir) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) yield* walk(p)
    else if (EXTS.has(extname(name).toLowerCase())) yield p
  }
}

if (!existsSync(SRC)) {
  console.error(`Pas de dossier ${SRC}/ : mets-y les sons sources (voir docs/ASSETS.md).`)
  process.exit(1)
}

let n = 0
for (const file of walk(SRC)) {
  const rel = relative(SRC, file).slice(0, -extname(file).length)
  const webm = join(OUT, `${rel}.webm`), mp3 = join(OUT, `${rel}.mp3`)
  const since = statSync(file).mtimeMs
  if (!force && [webm, mp3].every((f) => existsSync(f) && statSync(f).mtimeMs > since)) continue
  mkdirSync(dirname(webm), { recursive: true })

  const info = JSON.parse(run('ffprobe', ['-v', 'error', '-select_streams', 'a:0', '-show_entries', 'stream=channels:format=duration', '-of', 'json', file]).stdout)
  const channels = info.streams[0].channels, duration = Number(info.format.duration)

  // 1er passage : mesure. 2e passage : gain fixe vers -20 LUFS (loudnorm « linéaire »), sauf si les crêtes l'interdisent.
  const target = `I=${LUFS}:TP=${TRUE_PEAK}:LRA=20`
  const m = report(run('ffmpeg', ['-hide_banner', '-nostats', '-i', file, '-af', `loudnorm=${target}:print_format=json`, '-f', 'null', '-']).stderr)
  const measured = `measured_I=${m.input_i}:measured_TP=${m.input_tp}:measured_LRA=${m.input_lra}:measured_thresh=${m.input_thresh}:offset=${m.target_offset}`
  const out = report(
    run('ffmpeg', [
      '-hide_banner', '-nostats', '-y', '-i', file, '-map_metadata', '-1',
      '-filter_complex', `[0:a]loudnorm=${target}:${measured}:linear=true:print_format=json,aresample=48000,asplit=2[a][b]`,
      '-map', '[a]', '-c:a', 'libopus', '-b:a', channels > 1 ? '96k' : '64k', webm,
      '-map', '[b]', '-c:a', 'libmp3lame', '-q:a', '5', mp3,
    ]).stderr,
  )

  const ko = (f) => `${Math.round(statSync(f).size / 1024)} Ko`
  const how = out.normalization_type === 'linear' ? 'gain fixe' : 'dynamique (crêtes trop hautes pour un gain fixe)'
  console.log(`${rel}  ${duration.toFixed(1)} s, ${channels > 1 ? 'stéréo' : 'mono'}, ${Number(out.output_i).toFixed(1)} LUFS (${how})  webm ${ko(webm)}  mp3 ${ko(mp3)}`)
  console.log(`  -> src: 'audio/${rel.split('\\').join('/')}'`)
  n++
}
console.log(n ? `${n} fichier${n > 1 ? 's' : ''} encodé${n > 1 ? 's' : ''}.` : 'Rien à encoder : tout est à jour.')
