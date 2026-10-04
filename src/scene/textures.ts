import { CanvasTexture, RepeatWrapping } from 'three'
import { TAU } from '../math'

// Textures partagées dessinées en canvas : petits sprites (notes, cœurs, vapeur, halos), tricot. Celles d'une pièce sont dans son dossier.

export function makeCanvas(w: number, h: number) {
  const c = document.createElement('canvas')
  c.width = w
  c.height = h
  return [c, c.getContext('2d')!] as const
}

function spriteTex(size: number, draw: (x: CanvasRenderingContext2D) => void) {
  const [c, x] = makeCanvas(size, size)
  draw(x)
  return new CanvasTexture(c)
}

// Note de musique cerclée de blanc.
function drawNote(col: string) {
  return (x: CanvasRenderingContext2D) => {
    x.lineCap = 'round'; x.lineJoin = 'round'
    for (const pass of [0, 1]) {
      x.strokeStyle = pass ? col : '#ffffff'; x.fillStyle = pass ? col : '#ffffff'
      x.lineWidth = pass ? 5 : 11
      x.beginPath(); x.ellipse(24, 46, pass ? 10 : 13, pass ? 7.5 : 10.5, -0.4, 0, TAU); x.fill()
      x.beginPath(); x.moveTo(33, 44); x.lineTo(33, 12); x.quadraticCurveTo(44, 17, 50, 29); x.stroke()
    }
  }
}

/** Braise qui s'envole : un point orange à cœur clair. */
function emberTexture() {
  const [c, x] = makeCanvas(32, 32)
  const g = x.createRadialGradient(16, 16, 0, 16, 16, 15)
  g.addColorStop(0, 'rgba(255,240,190,1)'); g.addColorStop(0.35, 'rgba(255,160,70,.9)'); g.addColorStop(1, 'rgba(255,110,40,0)')
  x.fillStyle = g
  x.fillRect(0, 0, 32, 32)
  return new CanvasTexture(c)
}

export const emberTex = emberTexture()

/** Tricot crème : colonnes de mailles en V (pouf, revers des chaussettes, coussin). */
function knitTexture() {
  const [c, x] = makeCanvas(128, 64)
  x.fillStyle = '#e6d6c0'
  x.fillRect(0, 0, 128, 64)
  for (let col = 0; col < 8; col++) {
    for (let row = -1; row < 5; row++) {
      for (const s of [-1, 1]) {
        x.save()
        x.translate(col * 16 + 8 + s * 3.6, row * 16 + 8)
        x.rotate(s * 0.55)
        x.fillStyle = '#fbf3e7'
        x.beginPath(); x.ellipse(0, 0, 3.5, 8.4, 0, 0, TAU); x.fill()
        x.restore()
      }
    }
  }
  const t = new CanvasTexture(c)
  t.wrapS = t.wrapT = RepeatWrapping
  t.anisotropy = 4
  return t
}

export const noteTexA = spriteTex(64, drawNote('#178f99'))
export const noteTexB = spriteTex(64, drawNote('#e46f9b'))
export const heartTex = spriteTex(64, (x) => {
  const heart = () => {
    x.beginPath(); x.moveTo(32, 52)
    x.bezierCurveTo(10, 38, 8, 20, 22, 16); x.bezierCurveTo(28, 14, 32, 19, 32, 24)
    x.bezierCurveTo(32, 19, 36, 14, 42, 16); x.bezierCurveTo(56, 20, 54, 38, 32, 52); x.closePath()
  }
  x.lineWidth = 7; x.strokeStyle = '#fff'; heart(); x.stroke()
  x.fillStyle = '#f2779f'; heart(); x.fill()
})
export const knitTex = knitTexture()
export const puffTex = spriteTex(64, (x) => {
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 30)
  g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(1, 'rgba(255,255,255,0)')
  x.fillStyle = g; x.fillRect(0, 0, 64, 64)
})
/**
 * Volute de vapeur : un fil en S, effilé aux deux bouts et aux bords fondus, blanc, avec un liseré chaud très léger pour qu'on
 * le voie aussi bien sur un abat-jour crème que sur un mur sombre. `flip` la retourne : deux volutes ne se ressemblent pas.
 */
function wisp(flip: 1 | -1) {
  return spriteTex(128, (x) => {
    if (flip < 0) x.setTransform(-1, 0, 0, 1, 128, 0)
    const N = 90
    const pt = (t: number) => ({ px: 64 + Math.sin(t * Math.PI * 2.4 + 0.4) * 21 * (0.3 + t * 0.7), py: 118 - t * 108, r: 2.5 + 7 * Math.pow(Math.sin(Math.PI * t), 0.9) })
    const dot = (px: number, py: number, r: number, rgb: string, a: number, hard: number) => {
      const g = x.createRadialGradient(px, py, 0, px, py, r)
      g.addColorStop(0, `rgba(${rgb},${a.toFixed(3)})`)
      g.addColorStop(hard, `rgba(${rgb},${(a * 0.9).toFixed(3)})`)
      g.addColorStop(1, `rgba(${rgb},0)`)
      x.fillStyle = g
      x.fillRect(px - r, py - r, 2 * r, 2 * r)
    }
    for (let i = 0; i <= N; i++) {
      const { px, py, r } = pt(i / N)
      dot(px, py, r * 1.7, '150,95,80', 0.018, 0.2)
    }
    for (let i = 0; i <= N; i++) {
      const t = i / N, { px, py, r } = pt(t)
      dot(px, py, r, '255,255,255', 0.07 + 0.05 * Math.sin(Math.PI * t), 0.45)
    }
  })
}
export const wispTexes = [wisp(1), wisp(-1)]
export const wispTex = wispTexes[0]

/**
 * Un nuage de brouillard : une quinzaine de taches douces qui se recouvrent, irrégulières, sans bord net. Trois variantes
 * (graines différentes) pour que la vapeur d'un bassin ou d'une cheminée ne répète pas la même forme.
 */
function mist(seed: number) {
  return spriteTex(128, (x) => {
    let s = seed
    const rnd = () => (s = (s * 16807) % 2147483647) / 2147483647
    for (let i = 0; i < 16; i++) {
      const a = rnd() * TAU, d = Math.sqrt(rnd()) * 34, px = 64 + Math.cos(a) * d, py = 64 + Math.sin(a) * d * 0.8, r = 16 + rnd() * 18
      const g = x.createRadialGradient(px, py, 0, px, py, r)
      g.addColorStop(0, 'rgba(255,255,255,.2)'); g.addColorStop(0.5, 'rgba(255,255,255,.09)'); g.addColorStop(1, 'rgba(255,255,255,0)')
      x.fillStyle = g
      x.fillRect(px - r, py - r, 2 * r, 2 * r)
    }
  })
}
export const mistTex = [mist(7), mist(19), mist(31)]
export const glowTex = spriteTex(128, (x) => {
  const g = x.createRadialGradient(64, 64, 0, 64, 64, 62)
  g.addColorStop(0, 'rgba(255,205,140,.9)'); g.addColorStop(0.35, 'rgba(255,180,110,.35)'); g.addColorStop(1, 'rgba(255,170,100,0)')
  x.fillStyle = g; x.fillRect(0, 0, 128, 128)
})
export const shadowTex = spriteTex(256, (x) => {
  const g = x.createRadialGradient(128, 128, 0, 128, 128, 126)
  g.addColorStop(0, 'rgba(70,45,110,.5)'); g.addColorStop(0.55, 'rgba(70,45,110,.22)'); g.addColorStop(1, 'rgba(70,45,110,0)')
  x.fillStyle = g; x.fillRect(0, 0, 256, 256)
})

/** Petit halo chaud et serré, pour une ampoule ou une bougie. */
export const bulbGlowTex = spriteTex(64, (x) => {
  const g = x.createRadialGradient(32, 32, 0, 32, 32, 31)
  g.addColorStop(0, 'rgba(255,226,160,.95)'); g.addColorStop(0.25, 'rgba(255,190,110,.45)'); g.addColorStop(1, 'rgba(255,170,90,0)')
  x.fillStyle = g; x.fillRect(0, 0, 64, 64)
})
