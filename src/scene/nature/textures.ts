import { ClampToEdgeWrapping, RepeatWrapping } from 'three'
import { TAU } from '../../math'
import { canvasTex, seeded } from '../paint'

// Textures de la nature, claires et presque neutres : la couleur du matériau les teinte (un même feuillage fait un buis,
// un érable rouge ou un olivier).

/** Dessine `f` à sa place et décalé d'une tuile de chaque côté : une tache au bord se raccorde de l'autre côté. */
function wrap(size: number, f: (dx: number, dy: number) => void) {
  for (const dx of [-size, 0, size]) for (const dy of [-size, 0, size]) f(dx, dy)
}

/**
 * Pierre volcanique : marbrures douces, grain fin, quelques pores et des taches de lichen pâle. Claire, pour que la couleur
 * du matériau la teinte (gris chaud, gris bleuté, brun, basalte).
 */
export const stoneTex = canvasTex(256, 256, (x) => {
  const r = seeded(31)
  x.fillStyle = '#dcd8d0'; x.fillRect(0, 0, 256, 256)
  for (let i = 0; i < 46; i++) {
    const cx = r() * 256, cy = r() * 256, rad = 18 + r() * 56, dark = r() < 0.55
    wrap(256, (dx, dy) => {
      const g = x.createRadialGradient(cx + dx, cy + dy, 0, cx + dx, cy + dy, rad)
      g.addColorStop(0, dark ? 'rgba(70,64,58,.16)' : 'rgba(255,253,246,.2)'); g.addColorStop(1, 'rgba(0,0,0,0)')
      x.fillStyle = g; x.fillRect(cx + dx - rad, cy + dy - rad, rad * 2, rad * 2)
    })
  }
  for (let i = 0; i < 2600; i++) {
    const t = r()
    x.fillStyle = t < 0.5 ? 'rgba(50,46,42,.22)' : t < 0.85 ? 'rgba(255,255,250,.28)' : 'rgba(120,96,74,.25)'
    x.fillRect(r() * 256, r() * 256, 1 + (r() < 0.2 ? 1 : 0), 1 + (r() < 0.2 ? 1 : 0))
  }
  for (let i = 0; i < 40; i++) {
    const cx = r() * 256, cy = r() * 256, rad = 1.5 + r() * 2.5
    x.fillStyle = 'rgba(40,36,34,.3)'; x.beginPath(); x.arc(cx, cy, rad, 0, TAU); x.fill()
    x.fillStyle = 'rgba(255,255,255,.25)'; x.beginPath(); x.arc(cx + 0.8, cy + 0.8, rad * 0.6, 0, TAU); x.fill()
  }
  for (let k = 0; k < 7; k++) {
    const cx = r() * 256, cy = r() * 256
    for (let i = 0; i < 9; i++) {
      const px = cx + (r() - 0.5) * 22, py = cy + (r() - 0.5) * 16, rad = 2 + r() * 5
      wrap(256, (dx, dy) => { x.fillStyle = r() < 0.5 ? 'rgba(214,220,160,.45)' : 'rgba(236,232,200,.4)'; x.beginPath(); x.arc(px + dx, py + dy, rad, 0, TAU); x.fill() })
    }
  }
}, [1, 1])

/** Mousse : un velours vert moucheté de clair et de sombre. Claire, teintée par le matériau. */
export const mossTex = canvasTex(128, 128, (x) => {
  const r = seeded(57)
  x.fillStyle = '#d6dccb'; x.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 1400; i++) {
    x.fillStyle = r() < 0.5 ? 'rgba(40,70,20,.22)' : 'rgba(250,255,220,.3)'
    x.beginPath(); x.arc(r() * 128, r() * 128, 0.6 + r() * 1.6, 0, TAU); x.fill()
  }
}, [2, 2])


/**
 * Feuillage vu de près : un dégradé de petites feuilles, de l'ombre (en bas de la texture, v = 0 : le dessous et le cœur
 * d'une masse) au soleil (en haut : les pointes, un peu dorées). Se répète en largeur seulement : v porte la lumière.
 */
export const foliageTex = canvasTex(256, 256, (x) => {
  const r = seeded(77), W = 256, H = 256
  const g = x.createLinearGradient(0, H, 0, 0)
  g.addColorStop(0, '#3e4a52'); g.addColorStop(0.35, '#8a9690'); g.addColorStop(0.75, '#e6ebdc'); g.addColorStop(1, '#fffbe6')
  x.fillStyle = g; x.fillRect(0, 0, W, H)
  for (let i = 0; i < 2600; i++) {
    const px = r() * W, py = r() * H, k = 1 - py / H, rad = 2.2 + r() * 3, a = r() * TAU
    const shade = r() < 0.5 ? `rgba(20,30,30,${0.1 + (1 - k) * 0.16})` : `rgba(255,255,236,${0.08 + k * 0.24})`
    for (const dx of [-W, 0, W]) {
      x.fillStyle = shade
      x.beginPath(); x.ellipse(px + dx, py, rad, rad * 0.7, a, 0, TAU); x.fill()
    }
  }
})
foliageTex.wrapS = RepeatWrapping
foliageTex.wrapT = ClampToEdgeWrapping

/** Nervures d'une feuille : nervure centrale claire, nervures secondaires vers la pointe, bord et base un peu plus sombres. */
export const leafTex = canvasTex(128, 256, (x) => {
  const W = 128, H = 256
  x.fillStyle = '#eef2e6'; x.fillRect(0, 0, W, H)
  const edge = x.createLinearGradient(0, 0, W, 0)
  edge.addColorStop(0, 'rgba(20,40,20,.28)'); edge.addColorStop(0.22, 'rgba(20,40,20,0)'); edge.addColorStop(0.78, 'rgba(20,40,20,0)'); edge.addColorStop(1, 'rgba(20,40,20,.28)')
  x.fillStyle = edge; x.fillRect(0, 0, W, H)
  const base = x.createLinearGradient(0, H, 0, 0)
  base.addColorStop(0, 'rgba(20,40,20,.2)'); base.addColorStop(0.4, 'rgba(20,40,20,0)'); base.addColorStop(1, 'rgba(255,255,230,.12)')
  x.fillStyle = base; x.fillRect(0, 0, W, H)
  x.strokeStyle = 'rgba(255,255,240,.55)'; x.lineCap = 'round'
  for (let y = H - 14; y > 10; y -= 20) {
    x.lineWidth = 1.6
    for (const s of [-1, 1]) { x.beginPath(); x.moveTo(W / 2, y); x.quadraticCurveTo(W / 2 + s * 30, y - 10, W / 2 + s * 58, y - 30); x.stroke() }
  }
  x.lineWidth = 4; x.strokeStyle = 'rgba(255,255,240,.7)'
  x.beginPath(); x.moveTo(W / 2, H); x.lineTo(W / 2, 0); x.stroke()
})
