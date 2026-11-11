import type { RootState } from '@react-three/fiber'

// Compteurs de rendu pour le test de fumée (scripts/smoke.mjs). Ce module n'est téléchargé que si l'adresse porte `?stats` :
// le build normal n'en contient que l'appel (voir `Ready` dans Stage.tsx), et `window.__lofi` reste réservé au dev.
export function exposeStats(get: () => RootState) {
  ;(window as unknown as { __lofiStats?: () => Record<string, number> }).__lofiStats = () => {
    const { render, memory } = get().gl.info
    return { triangles: render.triangles, calls: render.calls, lines: render.lines, points: render.points, geometries: memory.geometries, textures: memory.textures }
  }
}
