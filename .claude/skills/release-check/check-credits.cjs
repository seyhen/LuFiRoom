// Vérifie public/audio/CREDITS.md. Usage (à la racine du dépôt) : node .claude/skills/release-check/check-credits.cjs
// Sans ffmpeg, sans réseau. Code de sortie 1 s'il y a une erreur ; les avertissements ne bloquent pas.
//
// ERREURS (bloquantes) :
//   - un fichier de public/audio/ (.webm) sans ligne dans CREDITS.md ;
//   - une ligne de CREDITS.md dont le fichier n'existe plus ;
//   - une ligne sans licence, ou dont la licence n'est pas dans la liste blanche ci-dessous ;
//   - une ligne sans source (ni lien, ni id Pixabay, ni « fourni par le propriétaire ») ;
//   - des lignes « à confirmer » alors que docs/LICENCES.md ne les liste pas.
// AVERTISSEMENTS (visibles, non bloquants) :
//   - lignes « à confirmer » (la radio : voir docs/LICENCES.md) ;
//   - sons « freesound_community » ou « (Freesound) » relayés par Pixabay : licence d'origine non vérifiée ;
//   - sons Pixabay : clause de non-redistribution « standalone » (voir docs/LICENCES.md).
//
// LISTE BLANCHE des licences. La licence d'une ligne est lue dans sa colonne « Licence » si elle existe
// (« idem » reprend celle de la ligne du dessus), sinon dans le texte de la section qui précède le tableau.
// Chaque entrée : [motif, nom, statut] ; statut « ok » ou « confirmer » (avertissement).
const WHITELIST = [
  [/\bCC0\b|domaine public/i, 'CC0', 'ok'],
  [/Pixabay Content License/i, 'Pixabay Content License', 'ok'],
  [/licence achet[ée]e|re[çc]u/i, 'licence achetée / reçu', 'ok'],
  [/calcul[ée]s?, pas enregistr[ée]s?/i, 'bruit calculé (projet)', 'ok'],
  [/à confirmer/i, 'à confirmer', 'confirmer'],
]

const fs = require('fs')
const path = require('path')

const root = 'public/audio'
const md = fs.readFileSync(path.join(root, 'CREDITS.md'), 'utf8')
const files = []
const walk = (dir) => {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (name.endsWith('.webm')) files.push(path.relative(root, p).replace(/\\/g, '/').replace(/\.webm$/, ''))
  }
}
walk(root)
const fileSet = new Set(files)

const errors = []
const warnings = []

// 1) Chaque fichier a une ligne. `noise/` : bruits calculés, mais ils ont leur ligne aussi.
const miss = files.filter((f) => !md.includes(f) && !md.includes(f.split('/').pop() + '.'))
if (miss.length) errors.push(...miss.map((f) => `fichier sans crédit : ${f}`))

// 2) Lecture des tableaux, section par section.
const sections = md.split(/^## /m).slice(1)
const cells = (line) => line.trim().replace(/^\||\|$/g, '').split('|').map((c) => c.trim())
const rows = []
for (const sec of sections) {
  const lines = sec.split('\n')
  const title = lines[0].trim()
  const prose = lines.filter((l) => !l.trim().startsWith('|')).join('\n')
  let header = null
  let prevLicence = ''
  for (const line of lines.slice(1)) {
    if (!line.trim().startsWith('|')) { header = null; continue }
    if (/^\|\s*-/.test(line)) continue
    const c = cells(line)
    if (!header) { header = c; prevLicence = ''; continue }
    const col = (re) => { const i = header.findIndex((h) => re.test(h)); return i < 0 ? '' : (c[i] || '') }
    const licCol = header.some((h) => /^Licence/i.test(h))
    let licence = licCol ? col(/^Licence/i) : ''
    if (/^idem$/i.test(licence)) licence = prevLicence
    if (licence) prevLicence = licence
    rows.push({
      title, c,
      first: c[0],
      licence: licence || (licCol ? '' : prose),
      licenceFromRow: !!licence,
      author: col(/^(Auteur|Artiste)/i),
      source: [col(/^Source/i), col(/^Id Pixabay/i)].filter(Boolean).join(' '),
      hasSourceCol: header.some((h) => /^(Source|Id Pixabay)/i.test(h)),
      isFile: header.some((h) => /^Fichier/i.test(h)),
    })
  }
}

// 3) Contrôles par ligne.
const used = new Set()
let nToConfirm = 0
const freesound = []
const pixabay = []
for (const r of rows) {
  if (!r.isFile) continue
  // « roof/fire → audio/cafe/fire » : le fichier réel est celui d'après la flèche.
  let first = r.first.replace(/`/g, '')
  const arrow = first.indexOf('→')
  let aliasOf = null
  if (arrow >= 0) { aliasOf = first.slice(0, arrow).trim(); first = first.slice(arrow + 1).replace(/audio\//, '') }
  const ids = (first.match(/[a-z]+\/[a-z0-9-]+/gi) || [])
  if (!ids.length) { errors.push(`ligne sans chemin de fichier reconnaissable : « ${r.first} »`); continue }
  if (aliasOf) warnings.push(`CREDITS.md : « ${aliasOf} » est un alias (${ids.join(', ')}), pas un fichier propre`)
  for (const id of ids) {
    used.add(id)
    if (!fileSet.has(id)) { errors.push(`ligne de CREDITS.md sans fichier : ${id} (public/audio/${id}.webm absent)`); continue }
    const lic = r.licence
    if (!lic.trim()) { errors.push(`${id} : licence vide`); continue }
    const hit = WHITELIST.find(([re]) => re.test(lic))
    if (!hit) { errors.push(`${id} : licence hors liste blanche (« ${lic.slice(0, 60).replace(/\n/g, ' ')} »)`); continue }
    if (r.hasSourceCol && !r.source.trim()) errors.push(`${id} : source vide`)
    if (hit[2] === 'confirmer') nToConfirm++
    if (hit[1] === 'Pixabay Content License') {
      if (!pixabay.includes(id)) pixabay.push(id)
      if (/freesound/i.test(r.author) && !freesound.includes(id)) freesound.push(id)
    }
  }
}
// Les fichiers listés en tableau sans colonne « Fichier » explicite ne comptent pas : ceux qui restent
// ont au moins une ligne (contrôle 1) ; on signale ceux qui n'ont pas pu être lus par le contrôle 2.
for (const f of files) if (!used.has(f) && !miss.includes(f)) warnings.push(`${f} : mentionné dans CREDITS.md mais licence/source non contrôlées (ligne hors tableau ?)`)

// 4) « à confirmer » : toléré tant que docs/LICENCES.md le liste.
if (nToConfirm) {
  let lic = ''
  try { lic = fs.readFileSync('docs/LICENCES.md', 'utf8') } catch {}
  if (!/à confirmer/i.test(lic) || !/radio\//.test(lic)) {
    errors.push(`${nToConfirm} fichiers « à confirmer » mais docs/LICENCES.md ne les liste pas`)
  } else {
    warnings.push(`${nToConfirm} fichiers « à confirmer » (musique de la radio) : licence d'usage commercial non confirmée, voir docs/LICENCES.md`)
  }
}
if (freesound.length) warnings.push(`${freesound.length} sons « freesound_community » / Freesound relayés par Pixabay : licence d'origine non vérifiée (docs/LICENCES.md) : ${freesound.join(', ')}`)
if (pixabay.length) warnings.push(`${pixabay.length} fichiers sous Pixabay Content License : clause « standalone » / robots (docs/LICENCES.md)`)

console.log(`${files.length} fichiers, ${miss.length} sans crédit, ${errors.length} erreur(s), ${warnings.length} avertissement(s)`)
if (warnings.length) console.log('Avertissements :\n' + warnings.map((x) => '  ! ' + x).join('\n'))
if (errors.length) {
  console.log('Erreurs :\n' + errors.map((x) => '  - ' + x).join('\n'))
  process.exitCode = 1
}
