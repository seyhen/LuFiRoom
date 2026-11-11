import { useRef } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { AdditiveBlending, Color, LatheGeometry, Vector2, type Sprite, type SpriteMaterial } from 'three'
import { smooth } from '../../math'
import { Part, SPH, noRay } from '../parts'
import { LIVE } from '../Static'
import { clearOf, hex, rgb, seeded, weathered, whiteout } from '../paint'
import { snowTop } from '../snowTop'
import { skyFade } from '../outdoor'
import { Foliage } from '../nature/Foliage'
import { mood } from '../anim'
import { glowTex } from '../textures'
import { O } from './materials'

// Derrière la palissade : la lisière d'une forêt d'automne dont les cimes dépassent, puis deux rangs de montagnes douces qui
// bleuissent dans la brume. Plus bas vers les bords, pour que le diorama garde sa silhouette.
// La lisière : [x, z, bas, demi-largeur, hauteur, essence (0-4 : feuillus roux, 5 : conifère)].
const TREES: [number, number, number, number, number, number][] = (() => {
  const r = seeded(91), out: [number, number, number, number, number, number][] = []
  for (let x = -1.85; x < 3.15; x += 0.3 + r() * 0.12) {
    const edge = Math.min(1, (3.2 - x) / 1.2), conifer = r() < 0.22
    out.push([x, -3.32 - r() * 0.22, 1.55 + r() * 0.2, conifer ? 0.16 + r() * 0.05 : 0.24 + r() * 0.12, (conifer ? 0.95 : 0.6 + r() * 0.35) * (0.6 + 0.4 * edge), conifer ? 5 : (r() * 5) | 0])
  }
  return out
})()
// Les montagnes : de vrais volumes, loin derrière la forêt de cèdres du dehors, sur un arc autour du versant. Chaque sommet est donné
// dans le repère de l'écran : [décalage à droite (s), recul derrière la pièce (k), hauteur, demi-largeur]. Recul k = -(x + z) :
// plus il est grand, plus la montagne monte à l'écran ; sur les côtés (|s| grand) elles descendent derrière le ruisseau et la
// bambouseraie, au fond elles dépassent au-dessus des cimes.
const PEAKS: [number, number, number, number][][] = [
  // le premier rang : plus hautes sur les côtés, basses au fond (au fond, plus loin, elles montent déjà à l'écran)
  [[-13, 5, 3.6, 4.6], [-8, 11, 2.4, 4.2], [-3, 16.5, 2.2, 4], [3, 16.5, 2.4, 4.2], [8, 12.5, 2.6, 4.2], [13, 6.5, 3.6, 4.4]],
  // le second, plus loin et plus pâle, entre les sommets du premier
  [[-11.5, 9.5, 2.0, 4], [-6, 19, 2.2, 4], [6, 19, 2.2, 4], [10.5, 11, 3.2, 4]],
  // le troisième, très loin et très pâle : il remplit les coins du haut d'un écran large, entre et au-dessus des deux autres
  [[-14.5, 15, 3.4, 4.4], [-9, 22, 3.0, 4.2], [0, 26, 2.8, 4.6], [9.5, 22, 3.2, 4.2], [15, 15, 3.6, 4.4]],
]
/** Le pied des montagnes (sous le sol du dehors, qui s'efface dans le ciel à cette distance). */
const BASE = 0.2
/** Un sommet à l'écran → [x, z] au sol. */
const toWorld = (s: number, k: number): [number, number] => [(s * Math.SQRT2 - k) / 2, (-s * Math.SQRT2 - k) / 2]
/**
 * La lune, très loin derrière les montagnes (recul 34, hors du sol du dehors qui la cacherait), posée dans un coin de ciel libre : à gauche au-dessus des crêtes sur un
 * écran large, au-dessus du fond de la forêt sur un écran en hauteur (téléphone). Coordonnées de l'écran : [s, hauteur à l'écran].
 */
const MOON_WIDE = [-11, 4.9], MOON_TALL = [-4.6, 8], MOON_K = 34
const moonAt = ([sx, sy]: number[]): [number, number, number] => {
  const [x, z] = toWorld(sx, MOON_K)
  return [x, (sy - 0.348 * MOON_K) / 0.871 + 1.85, z]
}
/** Les bancs de brume, entre la forêt et les montagnes : [s, k, hauteur]. */
const MISTS = ([[-7, 12, 2.6], [0, 14, 3.0], [7, 12, 2.6]] as const).map(([s, k, y]) => { const [x, z] = toWorld(s, k); return [x, y, z] as const })
const mists: SpriteMaterial[] = []
// Les deux rangs : bleu-vert puis bleu lavande le jour, nuit d'encre le soir.
const DAY = [0x9aa0b4, 0xbab6cc].map((c) => new Color(c)), NIGHT = [0x262c48, 0x323c64].map((c) => new Color(c))
// Sous la neige, les montagnes blanchissent sur leurs pentes douces et leurs cimes, la lisière est poudrée sur le dessus des houppiers.
// Loin, elles se fondent dans le ciel : un voile de brume avec la distance, et leur pied se perd dans le blanc du ciel au-dessus de la
// forêt (pas de bord net là où le sol du dehors s'efface).
O.mountains.slice(1).forEach((m) => skyFade(snowTop(m, 1, -0.1, 0.35), { c: [0, 0], r0: 6, r1: 30, below: 2.4 }))
O.forest.forEach((m) => snowTop(m, 0.85, 0.4, 0.8))
snowTop(O.forestPine, 0.85, 0.3, 0.7)
const tmp = new Color()

/** Une montagne : profil tourné, base large, flancs creusés, sommet arrondi (rien de pointu). Base y = 0, sommet y = 1. */
const mountainGeo = (() => {
  const pts: Vector2[] = []
  for (let i = 0; i <= 28; i++) {
    const y = i / 28
    // pied large, flancs qui se creusent, sommet en dôme (la racine carrée arrondit la cime)
    pts.push(new Vector2(Math.max(0.0005, Math.sqrt(1 - y) * (1 - 0.35 * y) ** 1.5 * (1 - 0.18 * Math.max(0, y - 0.8))), y))
  }
  const g = new LatheGeometry(pts, 28)
  g.computeVertexNormals()
  return g
})()

/** Les montagnes dans la brume au-dessus de la palissade, et la lune qui se lève sur elles le soir. */
export function Mountains() {
  const wide = useThree((st) => st.size.width > st.size.height)
  const halo = useRef<Sprite>(null)
  useFrame(() => {
    const n = smooth(mood.night), w = { n, r: smooth(mood.rain), s: smooth(mood.snow), st: smooth(mood.storm) }
    // les rangs : jour → nuit, puis assombris par l'orage, effacés dans le blanc par la tempête de neige (le second plus loin)
    O.mountains.slice(1).forEach((m, i) => {
      tmp.copy(DAY[i]).lerp(NIGHT[i], n)
      m.color.setStyle(rgb(weathered(hex('#' + tmp.getHexString()), w, 0.5 + i * 0.4)))
    })
    O.moon.opacity = n * clearOf(w) ** 2
    if (halo.current) (halo.current.material as SpriteMaterial).opacity = O.moon.opacity * 0.45
    // la brume entre les rangs s'épaissit dans la tempête de neige
    mists.forEach((m) => (m.opacity = 0.3 - n * 0.24 + whiteout(w) * 0.35))
  })
  return (
    <group raycast={noRay}>
      {PEAKS.map((row, r) =>
        row.map(([sx, k, h, w], i) => {
          const [x, z] = toWorld(sx, k)
          return <Part key={`${r}${i}`} geo={mountainGeo} m={O.mountains[Math.min(2, r + 1)]} p={[x, BASE, z]} scale={[w, h, w * 0.5]} rotation-y={Math.PI / 4} castShadow={false} receiveShadow={false} />
        }),
      )}
      {/* la lisière : feuillus roux et dorés, quelques conifères sombres et élancés */}
      {TREES.map(([x, z, y, w, h, k], i) => (
        <Foliage key={i} v={i} p={[x, y, z]} s={[w, h, w * 0.85]} ry={i} m={k === 5 ? O.forestPine : O.forest[k]} style={k === 5 ? 'clipped' : 'wild'} shadow={false} />
      ))}
      <mesh geometry={SPH} material={O.moon} scale={0.42} position={moonAt(wide ? MOON_WIDE : MOON_TALL)} userData={LIVE} raycast={noRay} />
      {/* le halo de la lune : un voile doux autour du disque, qui s'éteint avec elle */}
      <sprite ref={halo} position={moonAt(wide ? MOON_WIDE : MOON_TALL)} scale={2.6} renderOrder={-1} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0xfff4dc} transparent opacity={0} depthWrite={false} blending={AdditiveBlending} />
      </sprite>
      {/* des bancs de brume entre les rangs */}
      {MISTS.map(([x, y, z], i) => (
        <sprite key={i} position={[x, y, z]} scale={[6, 1.4, 1]} raycast={noRay}>
          <spriteMaterial map={glowTex} color={0xffffff} transparent opacity={0.3} depthWrite={false} blending={AdditiveBlending} ref={(m) => void (m && (mists[i] = m))} />
        </sprite>
      ))}
    </group>
  )
}
