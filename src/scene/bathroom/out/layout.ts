import type { V3 } from '../../parts'

// Les repères du dehors de la salle de bain : un monde de bulles dans le ciel. On compose en coordonnées d'écran, puis `S` les rend en
// coordonnées du monde : la caméra regarde dans la direction (1, 0,8, 1) le point (0, 1,85, 0) ; `sx` va vers la droite de l'écran, `sy`
// vers le haut, `dz` vers la caméra (négatif : derrière la pièce).
const LOOK: V3 = [0, 1.85, 0]
const RX: V3 = [0.7071, 0, -0.7071]
const UP: V3 = [-0.344, 0.861, -0.344]
const TO: V3 = [0.615, 0.492, 0.615]
export const S = (sx: number, sy: number, dz = 0): V3 => [
  LOOK[0] + RX[0] * sx + UP[0] * sy + TO[0] * dz,
  LOOK[1] + RX[1] * sx + UP[1] * sy + TO[1] * dz,
  LOOK[2] + RX[2] * sx + UP[2] * sy + TO[2] * dz,
]

/** Le champ visible, en unités d'écran : `l`, `r`, `t`, `b` pour toute la fenêtre ; `ut`, `ub` pour la partie que l'interface ne couvre pas. */
export interface View {
  l: number
  r: number
  t: number
  b: number
  ut: number
  ub: number
}

/** Le champ visible lu sur la caméra (réglée par `Framing` de Stage.tsx) et la partie libre entre la barre du haut et le mixeur. */
export function viewOf(cam: { left: number; right: number; top: number; bottom: number }, height: number, top: number, bottom: number): View {
  const unit = height / (cam.top - cam.bottom)
  const r2 = (x: number) => Math.round(x * 100) / 100
  return { l: r2(cam.left), r: r2(cam.right), t: r2(cam.top), b: r2(cam.bottom), ut: r2(cam.top - top / unit), ub: r2(cam.bottom + bottom / unit) }
}

/** Le demi-côté de la silhouette de la pièce à l'écran : rien ne passe devant. */
export const ROOM = { half: 4.9 }

/** La silhouette de la pièce à l'écran : un hexagone (le coin du fond en haut, le coin de devant en bas), dans le sens des aiguilles d'une montre. */
const HEX: [number, number][] = [[0, 4.51], [4.71, 2.22], [4.85, -2.18], [0, -4.54], [-4.85, -2.18], [-4.71, 2.22]]

/** Distance d'un point de l'écran à la silhouette de la pièce (négative dedans). */
export function roomGap(x: number, y: number) {
  let inside = true, best = Infinity
  for (let i = 0; i < HEX.length; i++) {
    const [ax, ay] = HEX[i], [bx, by] = HEX[(i + 1) % HEX.length], ex = bx - ax, ey = by - ay
    if (ex * (y - ay) - ey * (x - ax) > 0) inside = false
    const t = Math.max(0, Math.min(1, ((x - ax) * ex + (y - ay) * ey) / (ex * ex + ey * ey)))
    best = Math.min(best, Math.hypot(x - ax - ex * t, y - ay - ey * t))
  }
  return inside ? -best : best
}
