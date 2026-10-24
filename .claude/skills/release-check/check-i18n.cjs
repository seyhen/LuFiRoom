// Vérifie que chaque texte visible des pièces et des stations a sa traduction anglaise dans src/i18n.ts.
// Usage (à la racine du dépôt) : node .claude/skills/release-check/check-i18n.cjs
const fs = require('fs')

let d = fs.readFileSync('src/i18n.ts', 'utf8')
d = d.slice(d.indexOf('const EN'), d.indexOf('/** Traduit'))
const EN = eval('(' + d.slice(d.indexOf('{'), d.lastIndexOf('}') + 1) + ')')

let src = ''
for (const f of fs.readdirSync('src/rooms')) src += fs.readFileSync('src/rooms/' + f, 'utf8')
src += fs.readFileSync('src/audio/stations.ts', 'utf8')

const found = new Set()
for (const m of src.matchAll(/(?:label|name|description|skip|about): '((?:[^'\\]|\\.)*)'/g)) found.add(m[1])
for (const m of src.matchAll(/sub: \([^)]*\) => (.*)/g)) for (const s of m[1].matchAll(/'([^']+)'/g)) found.add(s[1])

// Les titres de morceaux (anglais) et les « lofi · 72 bpm » n'ont pas à être traduits.
const playlist = fs.existsSync('src/rooms/playlist.ts') ? fs.readFileSync('src/rooms/playlist.ts', 'utf8') : ''
const miss = [...found].filter((x) => !(x in EN) && !/bpm/.test(x) && !playlist.includes(`'${x}'`))
console.log(`${found.size} textes, ${miss.length} sans traduction`)
if (miss.length) {
  console.log(miss.map((x) => '  - ' + x).join('\n'))
  process.exitCode = 1
}
