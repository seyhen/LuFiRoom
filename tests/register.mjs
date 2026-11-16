// Chargeur minimal pour `node --test` : les sources de src/ s'importent sans extension (résolution « bundler »), Node veut l'extension.
import { register } from 'node:module'
register('./resolve-ts.mjs', import.meta.url)
