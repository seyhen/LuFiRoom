import { gummy } from '../../materials'
import { canvasTex, seeded } from '../../paint'
import { Part, SPH, cyl, rbox, worldUV } from '../../parts'
import { skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'

// La ville au loin, derrière le toit : les mêmes tours que celles de la pièce (même teintes, même grille de fenêtres qui s'allument le
// soir), plus hautes et plus fines, qui montent au-dessus des toits voisins et se fondent dans le ciel. Rien d'autre : les voisins
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
/** [x, z, largeur, profondeur, hauteur du faîte, teinte, forme]. */
const TOWERS: [number, number, number, number, number, number, Kind][] = [
  [-8.0, -9.0, 2.2, 2.2, 5.4, 0, 'flat'], [-5.0, -9.5, 2.0, 2.0, 7.2, 1, 'setback'], [-9.5, -12, 2.4, 2.2, 6.5, 2, 'flat'],
  [-2.4, -8.4, 2.4, 2.0, 5.8, 2, 'flat'], [0.4, -9.6, 2.0, 2.0, 8.3, 3, 'spire'], [2.6, -12.5, 2.6, 2.2, 9.0, 0, 'needle'],
  [5.5, -10, 2.2, 2.2, 6.1, 1, 'setback'], [8.5, -9.8, 2.0, 2.0, 4.7, 2, 'flat'],
]
const BOTTOM = -12

export function DistantTowers() {
  return (
    <>
      {TOWERS.map(([x, z, w, d, top, t, kind], i) => {
        const h = top - BOTTOM, m = T.tone[t]
        return (
          <group key={i} position={[x, 0, z]}>
            <Part geo={worldUV(rbox(w, h, d, 0.06), 2.4)} m={m} p={[0, BOTTOM + h / 2, 0]} castShadow={false} />
            <Part geo={rbox(w + 0.1, 0.12, d + 0.1, 0.03)} m={T.trim} p={[0, top, 0]} castShadow={false} />
            {kind === 'setback' && (
              <>
                <Part geo={worldUV(rbox(w * 0.7, 1.4, d * 0.7, 0.05), 2.4)} m={m} p={[0, top + 0.7, 0]} castShadow={false} />
                <Part geo={rbox(w * 0.7 + 0.08, 0.1, d * 0.7 + 0.08, 0.03)} m={T.trim} p={[0, top + 1.4, 0]} castShadow={false} />
              </>
            )}
            {kind === 'spire' && (
              <>
                <Part geo={worldUV(rbox(w * 0.6, 1.0, d * 0.6, 0.05), 2.4)} m={m} p={[0, top + 0.5, 0]} castShadow={false} />
                <Part geo={cyl(0.03, 0.05, 1.3, 8)} m={T.trim} p={[0, top + 1.65, 0]} castShadow={false} />
                <Part geo={SPH} m={T.trim} scale={0.06} p={[0, top + 2.3, 0]} castShadow={false} />
              </>
            )}
            {kind === 'needle' && <Part geo={cyl(0.015, 0.03, 1.6, 6)} m={T.trim} p={[0, top + 0.8, 0]} castShadow={false} />}
          </group>
        )
      })}
    </>
  )
}
