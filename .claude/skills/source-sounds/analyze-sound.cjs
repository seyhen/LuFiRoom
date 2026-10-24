// Mesure objective d'un ou plusieurs sons candidats (mp3, wav…) pour repérer ce qui rendrait une écoute longue pénible.
// Usage : node .claude/skills/source-sounds/analyze-sound.cjs [--geste] <fichier> [<fichier> …]
// Par défaut le son est un FOND continu (pluie, eau, souffle) : coups isolés et trous sont des défauts. Avec --geste (cartes, pinceau, goutte,
// boulier), des crêtes et des silences entre les gestes sont normaux : seuls les aigus excessifs et le niveau de fond comptent.
// Ne juge pas le plaisir d'écoute (c'est à l'utilisateur) : il écarte les sons stridents, à coups isolés, irréguliers ou troués.
const { spawnSync } = require('child_process')
const path = require('path')

const ff = (file, filter) => spawnSync('ffmpeg', ['-nostats', '-hide_banner', '-i', file, '-af', filter, '-f', 'null', '-'], { encoding: 'utf8' }).stderr || ''
const num = (text, re) => {
  const m = text.match(re)
  return m ? parseFloat(m[1]) : NaN
}
const overall = (text) => text.slice(text.lastIndexOf('Overall'))

function analyze(file, geste) {
  const dur = num(spawnSync('ffprobe', ['-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', file], { encoding: 'utf8' }).stdout, /([\d.]+)/)
  const loud = ff(file, 'ebur128')
  const sum = loud.slice(loud.lastIndexOf('Summary'))
  const lufs = num(sum, /I:\s+(-?[\d.]+) LUFS/), lra = num(sum, /LRA:\s+([\d.]+) LU/)
  const all = overall(ff(file, 'astats')), rms = num(all, /RMS level dB:\s+(-?[\d.]+)/), peak = num(all, /Peak level dB:\s+(-?[\d.]+)/)
  const hf = num(overall(ff(file, 'highpass=f=6000,astats')), /RMS level dB:\s+(-?[\d.]+)/)
  const sil = [...ff(file, 'silencedetect=n=-50dB:d=0.4').matchAll(/silence_duration: ([\d.]+)/g)].reduce((a, m) => a + parseFloat(m[1]), 0)
  const crest = peak - rms, hfGap = hf - rms, silent = sil / dur
  const flags = []
  if (hfGap > -3) flags.push('strident (presque autant d’aigus que de médiums)')
  if (!geste && crest > 30) flags.push('coup isolé (crête très au-dessus du niveau moyen)')
  if (!geste && lra > 15) flags.push('niveau irrégulier')
  if (!geste && silent > 0.3) flags.push('trous de silence')
  if (geste && silent > 0.7) flags.push('presque que du silence')
  if (dur < 3) flags.push('très court (jouer en grains)')
  if (dur > 120) flags.push('long (couper à 60 s)')
  return { fichier: path.basename(file), 'durée s': +dur.toFixed(1), LUFS: +lufs.toFixed(1), 'crête dB': +peak.toFixed(1), 'écart crête-moyenne': +crest.toFixed(1), 'aigus vs moyenne dB': +hfGap.toFixed(1), 'LRA LU': +lra.toFixed(1), 'silence %': Math.round(silent * 100), alertes: flags.length ? flags.join(' ; ') : 'aucune' }
}

const args = process.argv.slice(2), geste = args.includes('--geste'), files = args.filter((a) => !a.startsWith('--'))
if (!files.length) {
  console.log('Usage : node analyze-sound.cjs [--geste] <fichier> [<fichier> …]')
  process.exit(1)
}
console.table(files.map((f) => analyze(f, geste)))
