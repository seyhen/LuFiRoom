// Résout `./x` en x.ts, x.tsx ou x/index.ts (comme Vite), sans dépendance.
import { existsSync, statSync } from 'node:fs'
import { fileURLToPath, pathToFileURL } from 'node:url'

export async function resolve(specifier, context, next) {
  if ((specifier.startsWith('.') || specifier.startsWith('/')) && context.parentURL && !/\.[a-z]+$/i.test(specifier.split('/').pop())) {
    const base = new URL(specifier, context.parentURL)
    const p = fileURLToPath(base)
    for (const cand of [p + '.ts', p + '.tsx', p + '/index.ts', p + '/index.tsx']) {
      if (existsSync(cand) && statSync(cand).isFile()) return next(pathToFileURL(cand).href, context)
    }
  }
  return next(specifier, context)
}
