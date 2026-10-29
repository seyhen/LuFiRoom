import { useMemo } from 'react'
import type { BufferGeometry } from 'three'
import { seeded } from '../../math'
import { blob, cone, ell, pair, type Blob } from '../blob'
import { gummy } from '../materials'
import { canvasTex } from '../paint'
import { Part, SPH } from '../parts'
import { I } from './materials'

// Le dessin de la truite est une texture projetée de profil (x le long du corps, y en hauteur) : nette, quelle que soit la finesse du maillage.
const TX = { x0: -0.25, w: 0.5, y0: -0.06, h: 0.12 }, PX = [512, 123] as const
const troutTex = canvasTex(PX[0], PX[1], (c) => {
  const X = (x: number) => ((x - TX.x0) / TX.w) * PX[0], Y = (y: number) => (1 - (y - TX.y0) / TX.h) * PX[1], R = (r: number) => (r / TX.w) * PX[0]
  // le flanc argenté, le dos vert-de-gris, le ventre crème
  const g = c.createLinearGradient(0, Y(0.06), 0, Y(-0.06))
  g.addColorStop(0, '#6a8472'); g.addColorStop(0.3, '#7a937c'); g.addColorStop(0.45, '#b9c8c6'); g.addColorStop(0.62, '#cfd8d8'); g.addColorStop(0.78, '#efe4d6'); g.addColorStop(1, '#f6ebdf')
  c.fillStyle = g
  c.fillRect(0, 0, PX[0], PX[1])
  // la bande rose du flanc, sur la longueur du corps
  const st = c.createLinearGradient(0, Y(0.022), 0, Y(-0.012))
  st.addColorStop(0, 'rgba(232,140,150,0)'); st.addColorStop(0.45, 'rgba(232,140,150,0.9)'); st.addColorStop(1, 'rgba(232,140,150,0)')
  c.fillStyle = st
  for (let i = 0; i < 24; i++) {
    // le début de la bande s'estompe doucement
    c.globalAlpha = Math.min(1, (i + 1) / 10) ** 1.5
    const x0 = -0.12 + (i * 0.32) / 24
    c.fillRect(X(x0), Y(0.022), X(x0 + 0.32 / 24) - X(x0) + 1, Y(-0.012) - Y(0.022))
  }
  c.globalAlpha = 1
  // les mouchetures sombres, du dos jusqu'au flanc
  const rnd = seeded(7)
  c.fillStyle = 'rgba(40,58,52,0.75)'
  for (let i = 0; i < 60; i++) {
    const x = -0.08 + rnd() * 0.27, y = 0.006 + rnd() * 0.036, r = 0.0011 + rnd() * 0.0014
    c.beginPath(); c.arc(X(x), Y(y), R(r), 0, Math.PI * 2); c.fill()
  }
  // la queue et les nageoires du dos : vert plus franc
  c.fillStyle = 'rgba(110,140,112,0.85)'
  c.fillRect(X(0.19), 0, PX[0], PX[1])
  // l'ouïe (un arc derrière la tête) et la bouche
  c.strokeStyle = 'rgba(70,90,86,0.75)'; c.lineWidth = R(0.0022)
  c.beginPath(); c.arc(X(-0.095), Y(0.0), R(0.034), -0.9, 0.9); c.stroke()
  c.strokeStyle = 'rgba(60,40,44,0.85)'; c.lineWidth = R(0.0026); c.lineCap = 'round'
  c.beginPath(); c.moveTo(X(-0.208), Y(-0.01)); c.quadraticCurveTo(X(-0.17), Y(-0.016), X(-0.14), Y(-0.006)); c.stroke()
})
const troutSkin = gummy(0xffffff, { map: troutTex, roughness: 0.28, clearcoat: 0.9, clearcoatRoughness: 0.15 })

/**
 * La truite de la prise du jour, d'une seule peau de gomme : le corps profilé, la tête au museau arrondi, la nageoire du dos, les
 * pectorales et la queue en V arrondi fondues dans le corps. Le corps suit l'axe x (la tête à gauche, la queue à droite), le dos
 * vers +y, le flanc vers ±z.
 */
function troutBlob(): BufferGeometry {
  const parts: (Blob | Blob[])[] = [
    // le corps, plein au milieu, qui s'affine vers la queue
    ell([0.0, 0, 0], [0.13, 0.04, 0.03]),
    ell([0.1, 0.002, 0], [0.07, 0.027, 0.02], { k: 0.05 }),
    // la tête, au museau arrondi, et la mâchoire un peu plus bas
    ell([-0.13, 0.002, 0], [0.065, 0.033, 0.026], { k: 0.05 }),
    ell([-0.17, -0.006, 0], [0.04, 0.02, 0.02], { k: 0.03 }),
    // le pédoncule et la queue : une plaque échancrée au milieu
    cone([0.14, 0.002, 0], [0.19, 0.004, 0], 0.02, 0.014, { k: 0.03 }),
    ell([0.222, 0, 0], [0.03, 0.046, 0.009], { k: 0.03 }),
    ell([0.262, 0, 0], [0.022, 0.014, 0.03], { op: 'sub', k: 0.012 }),
    // la nageoire du dos, les pectorales, la nageoire du ventre
    ell([0.02, 0.046, 0], [0.04, 0.022, 0.009], { rot: [0, 0, 0.35], k: 0.03 }),
    pair(ell([-0.07, -0.022, 0.03], [0.026, 0.011, 0.016], { rot: [0.2, 0, 0.35], k: 0.03 })),
    ell([0.04, -0.04, 0], [0.025, 0.014, 0.009], { rot: [0, 0, -0.3], k: 0.03 }),
  ]
  const geo = blob(parts, { h: 0.0085, k: 0.04 })
  const pos = geo.attributes.position, uv = geo.attributes.uv
  for (let i = 0; i < pos.count; i++) uv.setXY(i, (pos.getX(i) - TX.x0) / TX.w, (pos.getY(i) - TX.y0) / TX.h)
  return geo
}

/** La truite dans le seau : la tête hors de l'eau, en biais, l'œil rond ; le reste sous la surface. Posée par le seau. */
export function Trout() {
  const geo = useMemo(troutBlob, [])
  return (
    <group position={[0, 0.265, 0]} rotation={[0, 0.78, -1.0]} scale={0.85}>
      <mesh geometry={geo} material={troutSkin} castShadow receiveShadow />
      {/* l'œil rond, de chaque côté de la tête */}
      {[-1, 1].map((s) => (
        <group key={s} position={[-0.145, 0.014, s * 0.0235]}>
          <Part geo={SPH} m={I.nose} scale={0.0085} castShadow={false} />
          <Part geo={SPH} m={I.paper} scale={0.0028} p={[-0.003, 0.0035, s * 0.0055]} castShadow={false} />
        </group>
      ))}
    </group>
  )
}
