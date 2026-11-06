import { Color } from 'three'
import { blob, cone, ell, pair } from '../blob'
import { Part } from '../parts'
import { K } from './materials'
import { SW } from './streetKit'

// Le chat de gouttière du relieur : un tigré gris assis sur l'appui de la fenêtre qui domine le café, la queue enroulée devant les pattes.
// D'une seule peau (blob) dans son repère : le museau vers +x, le pied à y = 0. La queue est un second volume, posé le long du flanc.
const GREY = 0x77798a, DARK = 0x4d4f5e, CREAM = 0xe9dcc6, PINK = 0xd98a8a, AMBER = 0xe5b23c
const dark = new Color(DARK)

const CAT = blob(
  [
    ell([0, 0.115, 0], [0.16, 0.115, 0.105], { color: GREY, k: 0.05 }),
    // les cuisses, repliées sous lui
    ...pair(ell([-0.06, 0.075, 0.085], [0.09, 0.075, 0.04], { color: GREY, k: 0.04 })),
    // la poitrine claire, la tête, le museau, les joues
    ell([0.095, 0.15, 0], [0.075, 0.115, 0.075], { color: CREAM, k: 0.05 }),
    ell([0.14, 0.255, 0], [0.078, 0.068, 0.074], { color: GREY, k: 0.04 }),
    ell([0.2, 0.235, 0], [0.04, 0.032, 0.045], { color: CREAM, k: 0.03 }),
    ell([0.236, 0.243, 0], 0.011, { color: PINK, k: 0.008 }),
    ...pair(ell([0.19, 0.27, 0.04], 0.014, { color: AMBER, k: 0.006 })),
    // les oreilles, bouts ronds
    ...pair(cone([0.115, 0.305, 0.045], [0.105, 0.365, 0.055], 0.028, 0.014, { color: GREY, k: 0.02 })),
    // les pattes avant, droites, claires
    ...pair(cone([0.1, 0.1, 0.045], [0.14, 0.01, 0.045], 0.03, 0.026, { color: CREAM, k: 0.03 })),
  ],
  {
    h: 0.022,
    k: 0.04,
    // les rayures du tigré sur le dos et la tête
    paint: (p, c) => (c.r > 0.35 && c.r < 0.5 && Math.sin(p.z * 70 + p.y * 12) > 0.45 ? c.lerp(dark, 0.55) : c),
  },
)
const TAIL = blob([cone([0, 0.04, 0], [-0.1, 0.04, 0.05], 0.032, 0.026, { color: GREY, k: 0.03 }), cone([-0.1, 0.04, 0.05], [-0.12, 0.05, 0.16], 0.026, 0.022, { color: DARK, k: 0.03 })], { h: 0.022 })

export function GutterCat() {
  // sur l'appui de la fenêtre du mur de brique (x = -3,85, z = 2,1), tourné vers la rue
  return (
    <group position={[-3.74, SW + 5.17, 2.1]} rotation-y={-0.55}>
      <Part geo={CAT} m={K.fur} castShadow={false} />
      <group position={[-0.14, 0, 0.04]}>
        <Part geo={TAIL} m={K.fur} castShadow={false} />
      </group>
    </group>
  )
}
