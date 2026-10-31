import { Color } from 'three'
import { Part } from '../parts'
import { blob, ell } from '../blob'
import { C } from './materials'

// Une vraie peau de mouton, d'une seule peau (blob) : le corps ovale, quatre pattes étirées aux coins, le cou devant, une petite
// queue derrière ; tout le pourtour bouffe en touffes de laine, le milieu est plus plat (on s'y couche : le chat y dort).
const CREAM = 0xfffaf3, SHADE = new Color(0xeadfce)
const RX = 0.85, RZ = 0.46
const TUFTS = Array.from({ length: 30 }, (_, i) => {
  const a = (i / 30) * Math.PI * 2, wob = 1 + 0.06 * Math.sin(i * 2.7)
  return ell([Math.cos(a) * RX * wob, 0.05, Math.sin(a) * RZ * wob], [0.1, 0.045, 0.1], { color: CREAM, k: 0.05 })
})
const SKIN = blob(
  [
    ell([0, 0.04, 0], [RX, 0.04, RZ], { color: CREAM, k: 0.08 }),
    ...[[1, 1], [1, -1], [-1, 1], [-1, -1]].map(([sx, sz]) => ell([sx * 0.7, 0.04, sz * 0.44], [0.24, 0.035, 0.12], { rot: [0, -sx * sz * 0.65, 0], color: CREAM, k: 0.08 })),
    ell([0.95, 0.04, 0], [0.18, 0.035, 0.2], { color: CREAM, k: 0.08 }),
    ell([-0.92, 0.04, 0], [0.12, 0.03, 0.09], { color: CREAM, k: 0.06 }),
    ...TUFTS,
  ],
  {
    h: 0.034,
    k: 0.06,
    // la laine un peu plus dorée dans les creux entre les touffes
    paint: (p, c) => c.lerp(SHADE, Math.max(0, Math.min(1, (0.075 - p.y) / 0.05)) * 0.5),
  },
)

/** Peau de mouton devant la cheminée (à 5 cm de l'âtre), qui chevauche le tapis tressé : le chat dort dessus. */
export function Sheepskin() {
  return <Part geo={SKIN} m={C.fleece} p={[-1.75, 0, -1.17]} rotation-y={0.06} />
}
