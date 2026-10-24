// Vérifie que chaque son de public/audio/ (sauf les bruits calculés) apparaît dans public/audio/CREDITS.md.
// Usage (à la racine du dépôt) : node .claude/skills/release-check/check-credits.cjs
const fs = require('fs')
const path = require('path')

const root = 'public/audio'
const credits = fs.readFileSync(path.join(root, 'CREDITS.md'), 'utf8')
const files = []
const walk = (dir) => {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name)
    if (fs.statSync(p).isDirectory()) walk(p)
    else if (name.endsWith('.webm')) files.push(path.relative(root, p).replace(/\\/g, '/').replace(/\.webm$/, ''))
  }
}
walk(root)

// `noise/` : bruits blanc, rose, brun calculés par `npm run noises`, rien à créditer.
// Un fichier est crédité si son chemin (`cafe/murmur`) ou son nom seul suivi d'un point apparaît dans CREDITS.md.
const miss = files.filter((f) => !f.startsWith('noise/') && !credits.includes(f) && !credits.includes(f.split('/').pop() + '.'))
console.log(`${files.length} fichiers, ${miss.length} sans crédit`)
if (miss.length) {
  console.log(miss.map((x) => '  - ' + x).join('\n'))
  process.exitCode = 1
}
