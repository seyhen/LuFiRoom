import { TAU } from '../../../math'
import { canvasTex, seeded } from '../../paint'

// Les textures de la rue (dehors de la laverie) : asphalte rapiécé, dalles du trottoir, pavés du caniveau, plaque d'égout,
// avaloir, grille d'arbre. Tout est dessiné une fois ; les surfaces sont des plans ou des disques, jamais des aplats.

/** L'asphalte : gris anthracite, taches de bitume plus claires et plus sombres, grain, un joint de reprise et une rustine. */
export const roadTex = canvasTex(256, 256, (x) => {
  const r = seeded(11)
  x.fillStyle = '#4a4c52'; x.fillRect(0, 0, 256, 256)
  // de larges plaques un peu plus claires ou plus sombres (l'usure du roulage)
  for (let i = 0; i < 26; i++) {
    const g = x.createRadialGradient(0, 0, 2, 0, 0, 1)
    x.save(); x.translate(r() * 256, r() * 256); x.scale(18 + r() * 40, 10 + r() * 24); x.rotate(r() * 3)
    g.addColorStop(0, r() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.09)'); g.addColorStop(1, 'rgba(0,0,0,0)')
    x.fillStyle = g; x.beginPath(); x.arc(0, 0, 1, 0, TAU); x.fill(); x.restore()
  }
  // la rustine de réfection : un rectangle plus noir au bord net, et le joint de bitume qui le borde
  x.fillStyle = '#3f4147'; x.fillRect(150, 38, 70, 46)
  x.strokeStyle = 'rgba(20,20,24,.7)'; x.lineWidth = 2.5; x.strokeRect(150, 38, 70, 46)
  // une fissure qui serpente, deux branches
  x.strokeStyle = 'rgba(18,18,22,.75)'; x.lineWidth = 1.6; x.lineJoin = 'round'
  for (const [sx, sy, dir] of [[10, 190, 1], [60, 150, -1]] as const) {
    x.beginPath(); x.moveTo(sx, sy)
    let px = sx, py = sy
    for (let k = 0; k < 9; k++) { px += 12 + r() * 10; py += dir * (r() - 0.3) * 14; x.lineTo(px, py) }
    x.stroke()
  }
  // gravillons clairs et sombres
  for (let i = 0; i < 1800; i++) {
    x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.09)' : 'rgba(0,0,0,.14)'
    const s = r() < 0.2 ? 3 : 2
    x.fillRect(r() * 256, r() * 256, s, s)
  }
}, [1, 1])

/** Les dalles du trottoir : des dalles de granit gris-bleu de tons différents, un joint sombre, des taches, quelques chewing-gums. */
export const slabTex = canvasTex(256, 256, (x) => {
  const r = seeded(23)
  x.fillStyle = '#6a6f74'; x.fillRect(0, 0, 256, 256)
  for (let j = 0; j < 2; j++) for (let i = 0; i < 2; i++) {
    const t = r()
    x.fillStyle = `rgb(${158 + t * 22},${162 + t * 20},${166 + t * 18})`
    x.fillRect(i * 128 + 2, j * 128 + 2, 124, 124)
    // un veinage sombre dans la dalle
    x.strokeStyle = 'rgba(80,86,92,.18)'; x.lineWidth = 1.5
    x.beginPath(); x.moveTo(i * 128 + r() * 128, j * 128); x.quadraticCurveTo(i * 128 + r() * 128, j * 128 + 64, i * 128 + r() * 128, j * 128 + 128); x.stroke()
  }
  // les taches d'humidité
  for (let i = 0; i < 6; i++) {
    x.fillStyle = 'rgba(40,46,52,.10)'
    x.beginPath(); x.ellipse(r() * 256, r() * 256, 10 + r() * 16, 6 + r() * 10, r() * 3, 0, TAU); x.fill()
  }
  // les chewing-gums
  for (let i = 0; i < 6; i++) { x.fillStyle = 'rgba(60,60,64,.55)'; x.beginPath(); x.arc(r() * 256, r() * 256, 2.2, 0, TAU); x.fill() }
  for (let i = 0; i < 1200; i++) { x.fillStyle = r() < 0.5 ? 'rgba(255,255,255,.1)' : 'rgba(0,0,0,.09)'; x.fillRect(r() * 256, r() * 256, 2, 2) }
}, [1, 1])

/** Les pavés du caniveau : des pavés de grès disposés en quinconce, de tons gris-bleu, joints sombres. Tuile de 0,8 m (8 pavés). */
export const cobbleTex = canvasTex(256, 256, (x) => {
  const r = seeded(5)
  x.fillStyle = '#34383d'; x.fillRect(0, 0, 256, 256)
  const N = 8, S = 256 / N
  for (let j = 0; j < N; j++) {
    for (let i = 0; i < N; i++) {
      const ox = (j % 2) * S * 0.5, t = r()
      x.fillStyle = `rgb(${120 + t * 40},${126 + t * 38},${134 + t * 36})`
      const X = i * S + ox + 2, Y = j * S + 2
      x.beginPath(); x.roundRect(X, Y, S - 4, S - 4, 6); x.fill()
      x.fillStyle = 'rgba(255,255,255,.1)'; x.beginPath(); x.roundRect(X + 3, Y + 3, S - 14, 6, 3); x.fill()
      if (X + S - 4 > 256) { x.fillStyle = `rgb(${120 + t * 40},${126 + t * 38},${134 + t * 36})`; x.beginPath(); x.roundRect(X - 256, Y, S - 4, S - 4, 6); x.fill() }
    }
  }
}, [1, 1])

/** La plaque d'égout : fonte sombre, anneau, quadrillage en losanges, lettrage « PARIS ». Vue du dessus sur un disque. */
export const manholeTex = canvasTex(256, 256, (x) => {
  x.fillStyle = '#2c3034'; x.fillRect(0, 0, 256, 256)
  x.strokeStyle = '#5a6168'; x.lineWidth = 6; x.beginPath(); x.arc(128, 128, 118, 0, TAU); x.stroke()
  x.lineWidth = 3; x.beginPath(); x.arc(128, 128, 104, 0, TAU); x.stroke()
  x.save(); x.beginPath(); x.arc(128, 128, 96, 0, TAU); x.clip()
  x.strokeStyle = '#444b52'; x.lineWidth = 4
  for (let k = -256; k < 512; k += 22) { x.beginPath(); x.moveTo(k, 0); x.lineTo(k + 256, 256); x.stroke(); x.beginPath(); x.moveTo(k + 256, 0); x.lineTo(k, 256); x.stroke() }
  x.restore()
  x.fillStyle = '#2c3034'; x.fillRect(70, 108, 116, 40)
  x.fillStyle = '#8a929a'; x.font = 'bold 26px Georgia, serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('PARIS', 128, 128)
  x.fillStyle = '#5a6168'; for (const [px, py] of [[128, 20], [128, 236], [20, 128], [236, 128]]) { x.beginPath(); x.arc(px, py, 5, 0, TAU); x.fill() }
})

/** L'avaloir : une grille de fonte à fentes allongées dans un cadre, sur l'eau noire du caniveau. */
export const drainTex = canvasTex(128, 256, (x) => {
  x.fillStyle = '#1b1e21'; x.fillRect(0, 0, 128, 256)
  x.fillStyle = '#4b5258'; x.fillRect(0, 0, 128, 8); x.fillRect(0, 248, 128, 8); x.fillRect(0, 0, 8, 256); x.fillRect(120, 0, 8, 256)
  x.fillStyle = '#3a4046'
  for (let k = 0; k < 7; k++) x.fillRect(14 + k * 15, 14, 8, 228)
  x.fillStyle = 'rgba(255,255,255,.1)'
  for (let k = 0; k < 7; k++) x.fillRect(14 + k * 15, 14, 2, 228)
})

/** La grille d'arbre : une plaque de fonte carrée, trou rond au milieu (la terre), arcs concentriques et quelques feuilles prises dedans. */
export const treeGrateTex = canvasTex(256, 256, (x) => {
  const r = seeded(9)
  x.fillStyle = '#2b3034'; x.fillRect(0, 0, 256, 256)
  x.strokeStyle = '#5a6168'; x.lineWidth = 5; x.strokeRect(6, 6, 244, 244)
  x.fillStyle = '#3a2f28'; x.beginPath(); x.arc(128, 128, 36, 0, TAU); x.fill()
  x.strokeStyle = '#4a5158'; x.lineWidth = 7
  for (const R of [58, 82, 106]) { x.beginPath(); x.arc(128, 128, R, 0, TAU); x.stroke() }
  x.lineWidth = 5
  for (let k = 0; k < 12; k++) { const a = (k / 12) * TAU; x.beginPath(); x.moveTo(128 + Math.cos(a) * 44, 128 + Math.sin(a) * 44); x.lineTo(128 + Math.cos(a) * 112, 128 + Math.sin(a) * 112); x.stroke() }
  // les feuilles de platane tombées : ocre, rouille, olive
  for (let i = 0; i < 16; i++) {
    x.fillStyle = ['#b08a3a', '#9a5a2a', '#7a8a3a', '#c4a04a'][i % 4]
    x.save(); x.translate(20 + r() * 216, 20 + r() * 216); x.rotate(r() * TAU)
    x.beginPath(); x.moveTo(0, -9); x.lineTo(6, -3); x.lineTo(10, 0); x.lineTo(5, 4); x.lineTo(0, 10); x.lineTo(-5, 4); x.lineTo(-10, 0); x.lineTo(-6, -3); x.closePath(); x.fill(); x.restore()
  }
})

/**
 * L'écorce du platane : des plaques qui s'écaillent, crème, vert-de-gris et gris-brun, aux contours irréguliers, sur un fond
 * sombre qui apparaît là où la plaque est tombée. Les plaques se prolongent de l'autre côté du bord (la tuile se raccorde).
 */
export const barkTex = canvasTex(256, 256, (x) => {
  const r = seeded(17)
  x.fillStyle = '#5f5a4a'; x.fillRect(0, 0, 256, 256)
  const tones = ['#d3cab0', '#bdb799', '#a4ab88', '#dcd6bc', '#8f9477', '#c4b98f']
  for (let i = 0; i < 70; i++) {
    const cx = r() * 256, cy = r() * 256, rx = 12 + r() * 22, ry = 9 + r() * 16, rot = (r() - 0.5) * 0.7, n = 7 + ((r() * 3) | 0)
    const pts = Array.from({ length: n }, (_, k) => { const a = (k / n) * TAU, j = 0.72 + r() * 0.5; return [Math.cos(a) * rx * j, Math.sin(a) * ry * j] as const })
    const fill = tones[i % tones.length]
    for (const [ox, oy] of [[0, 0], [-256, 0], [256, 0], [0, -256], [0, 256]] as const) {
      x.save(); x.translate(cx + ox, cy + oy); x.rotate(rot)
      x.beginPath(); pts.forEach(([px, py], k) => (k ? x.lineTo(px, py) : x.moveTo(px, py))); x.closePath()
      x.fillStyle = fill; x.fill()
      x.lineWidth = 2.5; x.strokeStyle = 'rgba(52,48,36,.55)'; x.stroke()
      x.fillStyle = 'rgba(255,255,255,.14)'; x.beginPath(); x.ellipse(-rx * 0.18, -ry * 0.25, rx * 0.5, ry * 0.22, 0, 0, TAU); x.fill()
      x.restore()
    }
  }
}, [1, 1])

/**
 * Le reflet d'une lumière dans l'eau d'une flaque : une raie verticale (à l'écran), fine et très claire au centre, qui s'élargit en
 * halo doux, hachée par les rides de l'eau. L'extrémité du bas (près de la caméra) est la plus vive : c'est l'image de la lanterne ;
 * vers le haut, elle s'efface comme le fût. Neutre (blanc) : la teinte vient du matériau.
 */
export const reflectTex = canvasTex(64, 256, (x) => {
  x.clearRect(0, 0, 64, 256)
  for (let y = 0; y < 256; y++) {
    const t = y / 255 // 0 en haut (loin) → 1 en bas (près)
    const env = t < 0.8 ? Math.pow(t / 0.8, 1.5) : Math.pow(Math.max(0, 1 - (t - 0.8) / 0.2), 0.8)
    const ripple = 0.5 + 0.5 * Math.cos(y * 0.5 + Math.sin(y * 0.13) * 2.2)
    const gap = 0.35 + 0.65 * ripple
    const hw = 2.2 + 2.6 * gap
    const g = x.createLinearGradient(32 - hw * 5, 0, 32 + hw * 5, 0)
    g.addColorStop(0, 'rgba(255,255,255,0)')
    g.addColorStop(0.5 - 0.1, `rgba(255,240,215,${(0.2 * env * gap).toFixed(3)})`)
    g.addColorStop(0.5, `rgba(255,255,250,${Math.min(1, 1.05 * env * gap).toFixed(3)})`)
    g.addColorStop(0.5 + 0.1, `rgba(255,240,215,${(0.2 * env * gap).toFixed(3)})`)
    g.addColorStop(1, 'rgba(255,255,255,0)')
    x.fillStyle = g; x.fillRect(0, y, 64, 1)
  }
})

/**
 * Une flaque : un contour irrégulier (lobes arrondis, jamais une ellipse), l'eau un peu plus claire au centre et un liseré clair
 * sur le bord mouillé. Le même dessin sert de carte et de masque (la teinte vient du matériau).
 */
export const wetTex = canvasTex(128, 128, (x) => {
  const r = seeded(31), N = 14
  const rad = Array.from({ length: N }, () => 0.62 + r() * 0.38)
  const at = (a: number) => { const f = ((a / TAU) % 1 + 1) % 1 * N, i = Math.floor(f), t = f - i, u = t * t * (3 - 2 * t); return rad[i % N] * (1 - u) + rad[(i + 1) % N] * u }
  x.beginPath()
  for (let k = 0; k <= 72; k++) { const a = (k / 72) * TAU, R = at(a) * 58; const px = 64 + Math.cos(a) * R, py = 64 + Math.sin(a) * R * 0.95; k ? x.lineTo(px, py) : x.moveTo(px, py) }
  x.closePath()
  const g = x.createRadialGradient(54, 52, 4, 64, 64, 62)
  g.addColorStop(0, '#f2f6fa'); g.addColorStop(1, '#bcc8d4')
  x.fillStyle = g; x.fill()
  x.lineWidth = 3.5; x.strokeStyle = '#ffffff'; x.stroke()
})
