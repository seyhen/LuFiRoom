import { gummy } from '../../materials'
import { canvasTex, seeded } from '../../paint'
import { Part, SPH, cyl, rbox, worldUV } from '../../parts'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'

// La ville au loin, derrière le toit : les mêmes petites tours que celles de la pièce (même échelle, mêmes teintes, même grille de
// fenêtres qui s'allument le soir), en rangées de plus en plus hautes qui se fondent dans le ciel. Rien d'autre : les voisins
// derrière la terrasse sont des toits plus bas, comme à gauche et à droite.

const TONES = ['#a8705e', '#cab89c', '#7d88a6', '#9c8f96'] as const

/** Une façade de tour : grille de fenêtres de 0,4 m (tuile 2,4 m), quelques-unes allumées. `glow` : seulement les allumées. */
const tex = (wall: string, glow: boolean, seed: number) =>
  canvasTex(128, 128, (x) => {
    const r = seeded(seed)
    x.fillStyle = glow ? '#000' : wall; x.fillRect(0, 0, 128, 128)
    for (let j = 0; j < 6; j++) for (let i = 0; i < 6; i++) {
      const lit = r() < 0.5
      if (glow) { if (lit) { x.fillStyle = r() < 0.5 ? '#ffd890' : '#fff0c0'; x.fillRect(i * 21.3 + 4, j * 21.3 + 5, 12, 11) } continue }
      x.fillStyle = 'rgba(40,46,70,.78)'; x.fillRect(i * 21.3 + 4, j * 21.3 + 5, 12, 11)
    }
  }, [1, 1])

export const T = {
  tone: TONES.map((c, i) => skyFade(snowTop(gummy(0xffffff, { map: tex(c, false, i + 40), emissiveMap: tex(c, true, i + 40), emissive: 0xffffff, emissiveIntensity: 0, roughness: 0.8 }), 1, 0.4, 0.8), { c: [0, 0], r0: 7.5, r1: 12.5, below: -4.2 })),
  trim: skyFade(gummy(0xe6dccb, { roughness: 0.6 }), { c: [0, 0], r0: 7.5, r1: 12.5 }),
}

type Kind = 'flat' | 'setback' | 'spire' | 'needle'
/**
 * Les rangées de la ville qui continuent derrière celles de la pièce, **à la même échelle** (environ 1 m de large, 0,6 à 0,9 de
 * profondeur, 3 à 6,5 de haut) : jamais de grande tour qui changerait l'échelle de la ville. Elles restent à l'écart des toits
 * voisins plus bas (derrière eux). [x, z, largeur, profondeur, hauteur du faîte, teinte, forme].
 */
const TOWERS: [number, number, number, number, number, number, Kind][] = (() => {
  const r = seeded(77), out: [number, number, number, number, number, number, Kind][] = []
  for (let row = 0; row < 5; row++) {
    const z = -6.9 - row * 1.35
    for (let x = -10.5; x < 10.8; x += 1.05 + r() * 0.5) {
      // pas dans l'emprise des toits voisins plus bas (BACK dans Surroundings) : derrière eux seulement
      if (x > 3.3 && z > -8.9) continue
      if (x < -3.6 && z > -8.1) continue
      const w = 0.85 + r() * 0.45, d = 0.6 + r() * 0.3
      const top = 3 + row * 0.55 + r() * 2.3, k = r()
      out.push([x + (r() - 0.5) * 0.2, z + (r() - 0.5) * 0.3, w, d, +top.toFixed(2), Math.floor(r() * 4), k < 0.18 ? 'setback' : k < 0.3 ? 'spire' : k < 0.4 ? 'needle' : 'flat'])
    }
  }
  return out
})()
const BOTTOM = -12

/** Le gratte-ciel à gradins et à flèche qui fait le skyline de New York : trois retraits, un mât. Même échelle que les autres tours. */
function Landmark({ x, z }: { x: number; z: number }) {
  const m = T.tone[1], tiers: [number, number, number, number][] = [[1.3, 1.0, -12, 6.2], [0.95, 0.75, 6.2, 7.1], [0.65, 0.55, 7.1, 7.8], [0.4, 0.36, 7.8, 8.3]]
  return (
    <group position={[x, 0, z]}>
      {tiers.map(([w, d, y0, y1], i) => (
        <group key={i}>
          <Part geo={worldUV(rbox(w, y1 - y0, d, 0.03), 3.3)} m={m} p={[0, (y0 + y1) / 2, 0]} castShadow={false} />
          <Part geo={rbox(w + 0.07, 0.07, d + 0.07, 0.025)} m={T.trim} p={[0, y1, 0]} castShadow={false} />
        </group>
      ))}
      <Part geo={cyl(0.02, 0.05, 1.2, 8)} m={T.trim} p={[0, 8.9, 0]} castShadow={false} />
      <Part geo={SPH} m={T.trim} scale={0.05} p={[0, 9.55, 0]} castShadow={false} />
    </group>
  )
}

export function DistantTowers() {
  return (
    <>
      <Landmark x={-1.9} z={-13.2} />
      {TOWERS.map(([x, z, w, d, top, t, kind], i) => {
        const h = top - BOTTOM, m = T.tone[t]
        return (
          <group key={i} position={[x, 0, z]}>
            <Part geo={worldUV(rbox(w, h, d, 0.04), 3.3)} m={m} p={[0, BOTTOM + h / 2, 0]} castShadow={false} />
            <Part geo={rbox(w + 0.08, 0.09, d + 0.08, 0.03)} m={T.trim} p={[0, top, 0]} castShadow={false} />
            {kind === 'setback' && (
              <>
                <Part geo={worldUV(rbox(w * 0.7, 0.7, d * 0.7, 0.04), 3.3)} m={m} p={[0, top + 0.35, 0]} castShadow={false} />
                <Part geo={rbox(w * 0.7 + 0.08, 0.08, d * 0.7 + 0.08, 0.03)} m={T.trim} p={[0, top + 0.7, 0]} castShadow={false} />
              </>
            )}
            {kind === 'spire' && (
              <>
                <Part geo={worldUV(rbox(w * 0.6, 0.5, d * 0.6, 0.04), 3.3)} m={m} p={[0, top + 0.25, 0]} castShadow={false} />
                <Part geo={cyl(0.02, 0.04, 0.7, 8)} m={T.trim} p={[0, top + 0.85, 0]} castShadow={false} />
                <Part geo={SPH} m={T.trim} scale={0.04} p={[0, top + 1.2, 0]} castShadow={false} />
              </>
            )}
            {kind === 'needle' && <Part geo={cyl(0.012, 0.025, 0.9, 6)} m={T.trim} p={[0, top + 0.45, 0]} castShadow={false} />}
          </group>
        )
      })}
    </>
  )
}
