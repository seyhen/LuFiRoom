// Le strict minimum de navigateur que les modules d'état lisent au chargement (i18n.ts : langue, <html lang>).
const mem = new Map()
globalThis.localStorage = { getItem: (k) => mem.get(k) ?? null, setItem: (k, v) => void mem.set(k, String(v)), removeItem: (k) => void mem.delete(k), clear: () => mem.clear() }
globalThis.document ??= { documentElement: {}, title: '' }
globalThis.location ??= { origin: 'https://example.test', search: '' }
