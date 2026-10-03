import { TAU } from '../../math'
import { canvasTex, rr, seeded } from '../paint'

// Textures du bungalow, dessinées une fois : planches blanchies, lambris, jute, rayures, cannage, et les crêtes des vagues.

/** Plancher : larges lames de chêne blanchi par le sel, avec leurs joints et quelques nœuds. Tuile 1 × 1 unité. */
export const plankTex = canvasTex(512, 512, (x) => {
  const r = seeded(3), rows = 6, h = 512 / rows
  for (let i = 0; i < rows; i++) {
    let px = -r() * 300
    while (px < 512) {
      const w = 260 + r() * 260, tone = 222 - r() * 18
      x.fillStyle = `rgb(${tone},${tone - 18},${tone - 42})`
      x.fillRect(px, i * h, w, h)
      // veinage
      x.strokeStyle = 'rgba(160,130,95,.13)'; x.lineWidth = 1.2
      for (let k = 0; k < 5; k++) {
        const y = i * h + 6 + r() * (h - 12)
        x.beginPath(); x.moveTo(px, y)
        for (let s = 0; s <= w; s += 40) x.lineTo(px + s, y + Math.sin(s * 0.03 + k) * 2)
        x.stroke()
      }
      if (r() < 0.35) { x.fillStyle = 'rgba(150,115,80,.22)'; x.beginPath(); x.ellipse(px + r() * w, i * h + h / 2, 6, 3.5, 0, 0, TAU); x.fill() }
      x.fillStyle = 'rgba(120,95,70,.35)'; x.fillRect(px, i * h, 2, h)
      px += w
    }
    x.fillStyle = 'rgba(120,95,70,.4)'; x.fillRect(0, i * h, 512, 2.5)
  }
  // un peu de sable apporté par les pieds
  for (let k = 0; k < 900; k++) { x.fillStyle = `rgba(220,190,140,${0.15 + r() * 0.25})`; x.fillRect(r() * 512, r() * 512, 1.5, 1.5) }
}, [1, 1])

/** Lambris vertical blanchi à la chaux. Tuile : 1 unité de large (5 planches), toute la hauteur du mur (4.4). */
export const boardTex = canvasTex(256, 512, (x) => {
  const r = seeded(9)
  for (let i = 0; i < 5; i++) {
    const tone = 244 - r() * 8
    x.fillStyle = `rgb(${tone},${tone - 4},${tone - 12})`
    x.fillRect(i * 51.2, 0, 51.2, 512)
    x.fillStyle = 'rgba(150,135,120,.28)'; x.fillRect(i * 51.2, 0, 2, 512)
    x.fillStyle = 'rgba(255,255,255,.5)'; x.fillRect(i * 51.2 + 2, 0, 1.5, 512)
    for (let k = 0; k < 14; k++) { x.fillStyle = 'rgba(190,165,130,.08)'; x.fillRect(i * 51.2 + 4 + r() * 44, r() * 512, 1, 20 + r() * 60) }
  }
}, [1, 1])

/** Tapis de jute tressé en spirale, bordé de corail. */
export const juteTex = canvasTex(512, 512, (x) => {
  const r = seeded(5)
  x.fillStyle = '#d8bd8a'; x.fillRect(0, 0, 512, 512)
  for (let rad = 10; rad < 250; rad += 9) {
    x.strokeStyle = rad % 18 ? '#c9a970' : '#e3cb9c'; x.lineWidth = 5
    x.beginPath(); x.arc(256, 256, rad, 0, TAU); x.stroke()
    x.strokeStyle = 'rgba(140,105,60,.25)'; x.lineWidth = 1
    for (let a = 0; a < TAU; a += 0.35 / (rad / 60 + 1)) { x.beginPath(); x.arc(256, 256, rad, a, a + 0.05); x.stroke() }
  }
  x.strokeStyle = '#ef8f7a'; x.lineWidth = 10; x.beginPath(); x.arc(256, 256, 236, 0, TAU); x.stroke()
  x.strokeStyle = '#f6efe4'; x.lineWidth = 4; x.beginPath(); x.arc(256, 256, 222, 0, TAU); x.stroke()
  for (let k = 0; k < 600; k++) { x.fillStyle = `rgba(110,80,40,${r() * 0.15})`; x.fillRect(r() * 512, r() * 512, 2, 2) }
})

/** Rayures de toile (coussins, serviette de plage). */
export function stripes(a: string, b: string, n: number, repeat: [number, number] = [1, 1]) {
  return canvasTex(128, 128, (x) => {
    for (let i = 0; i < n; i++) { x.fillStyle = i % 2 ? b : a; x.fillRect(0, (i * 128) / n, 128, 128 / n + 1) }
  }, repeat)
}

/** Cannage de rotin : un tressage serré, clair et miel. */
export const weaveTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#d9b27c'; x.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 8; i++) for (let j = 0; j < 8; j++) {
    x.fillStyle = (i + j) % 2 ? '#e8c894' : '#c99a5e'
    rr(x, i * 16 + 1, j * 16 + 1, 14, 14, 5); x.fill()
  }
}, [3, 3])

/**
 * Une crête de vague, en clair sur transparent : on la teinte avec la couleur de la mer. `foam` : l'écume du bord,
 * plus épaisse et festonnée. La texture se répète en largeur, elle peut défiler.
 */
export function crestTex(seed: number, foam = false) {
  return canvasTex(512, 64, (x) => {
    const r = seeded(seed)
    const top = foam ? 18 : 26
    // le corps de la vague, qui s'efface vers le bas
    const g = x.createLinearGradient(0, top, 0, 64)
    g.addColorStop(0, 'rgba(255,255,255,.95)'); g.addColorStop(foam ? 0.5 : 0.25, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g
    x.beginPath(); x.moveTo(0, 64)
    for (let px = 0; px <= 512; px += 8) x.lineTo(px, top + Math.sin((px / 512) * TAU * (foam ? 6 : 3)) * (foam ? 5 : 7) + Math.sin((px / 512) * TAU * 11) * 2)
    x.lineTo(512, 64); x.closePath(); x.fill()
    // des moutons d'écume
    for (let k = 0; k < (foam ? 60 : 18); k++) {
      const px = r() * 512, py = top - 2 + r() * 10
      x.fillStyle = `rgba(255,255,255,${0.5 + r() * 0.5})`
      x.beginPath(); x.ellipse(px, py, 4 + r() * (foam ? 14 : 9), 2 + r() * 3, 0, 0, TAU); x.fill()
    }
  }, [1.4, 1])
}
