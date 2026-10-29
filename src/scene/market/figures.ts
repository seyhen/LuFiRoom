import { Color, DoubleSide, LatheGeometry, Vector2 } from 'three'
import { blob, cone, ell, pair, type Blob } from '../blob'
import { gummy, skin } from '../materials'
import type { V3 } from '../parts'

/**
 * Les figurines du marché (cuisinier, maneki-neko, clients du comptoir) : chacune est faite « d'une seule peau » avec `blob`
 * (voir `scene/blob.ts`), calculée une seule fois au premier usage. Les matériaux à couleur par sommet sont ici ; les
 * accessoires rigides (yeux, louche, pièce d'or) sont des primitives dans les composants de `Chef.tsx`.
 */

const once = <T,>(make: () => T) => {
  let v: T | undefined
  return () => (v ??= make())
}

/** La peau de toutes les figurines : gummy à couleur par sommet. */
export const figSkin = skin({ roughness: 0.55, clearcoat: 0.3 })
/** Les perles des yeux, leur reflet, la bouche, la louche d'acier, le bois du manche. */
export const figEye = gummy(0x1d1218, { roughness: 0.25, clearcoat: 1 })
export const figGlint = gummy(0xffffff, { roughness: 0.2, clearcoat: 1, emissive: 0xffffff, emissiveIntensity: 0.55 })
export const figMouth = gummy(0x8a3340, { roughness: 0.4, clearcoat: 0.6 })
export const figBrow = gummy(0x4a2c20, { roughness: 0.6, clearcoat: 0.2 })
export const figSteel = gummy(0xc5cedc, { roughness: 0.25, clearcoat: 0.8, metalness: 0.3, side: DoubleSide })
export const figHandle = gummy(0x6a4026, { roughness: 0.5, clearcoat: 0.4 })
export const figGold = gummy(0xf2c24a, { roughness: 0.28, clearcoat: 0.9, metalness: 0.25 })
export const figGoldDark = gummy(0xb98a22, { roughness: 0.4, clearcoat: 0.6 })
export const figWhisker = gummy(0x5a4a52, { roughness: 0.6, clearcoat: 0.2 })

/** Une coupelle de louche : un petit bol évasé, ouvert vers +y, visible des deux côtés. */
export const ladleCup = new LatheGeometry([[0, 0], [0.018, 0.003], [0.035, 0.014], [0.048, 0.034], [0.052, 0.046]].map(([r, y]) => new Vector2(r, y)), 20)

const C = { cream: 0xf0e6d0, indigo: 0x27358c, iron: 0x2c2838, skin: 0xf4c7a0, blush: 0xf59a9a, wood: 0x8a5636, nose: 0xe99a82, brass: 0xd9a63a }

const sstep = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}
const tmp = new Color()
const tint = (base: Color, hex: number, t: number) => (t > 0 ? base.lerp(tmp.setHex(hex), t) : base)

/** Un tube continu qui suit des points (une boucle fermée si `closed`) : un cordon, un bandeau, une collerette. */
function chain(pts: V3[], r: number, color: number, closed = false, k = 0.02): Blob[] {
  const out: Blob[] = []
  for (let i = 0; i < pts.length - (closed ? 0 : 1); i++) out.push(cone(pts[i], pts[(i + 1) % pts.length], r, r, { color, k }))
  return out
}
/** Une ellipse horizontale de `n` points, à la hauteur `y`, de demi-axes (`rx`, `rz`), centrée en (`cx`, `cz`). */
const ring = (y: number, rx: number, rz: number, n = 20, cx = 0, cz = 0): V3[] =>
  Array.from({ length: n }, (_, i) => {
    const a = (i / n) * Math.PI * 2
    return [cx + Math.sin(a) * rx, y, cz + Math.cos(a) * rz] as V3
  })

// ───────────────────────────── le cuisinier ─────────────────────────────

/**
 * Le cuisinier est surélevé de `UP` (il se tient sur un caillebotis derrière la carriole) : sa tête passe au-dessus de la traverse
 * du châssis (y = 1,6 de la carriole) et sous le noren, qui cachent sinon son visage.
 */
const UP = 0.155
/** L'épaule de chaque bras, et le point d'attache de leur repère : les bras tournent autour de ces points. */
export const CHEF_SHOULDER = { r: [-0.245, 1.235 + UP, 0.0] as V3, l: [0.245, 1.235 + UP, 0.0] as V3 }
/** La tête : son centre. */
export const CHEF_HEAD_Y = 1.585 + UP
/** Où se ferment les mains : la poignée du wok (à droite du cuisinier), le manche de la louche (à gauche). */
export const CHEF_HAND = { r: [-0.3, 1.455, 0.66] as V3, l: [0.33, 1.52, 0.25] as V3 }
const ELBOW = { r: [-0.37, 1.2, 0.24] as V3, l: [0.41, 1.3, 0.1] as V3 }

/** Le buste, le tablier d'indigo, les jambes courtes et les sabots : immobile. */
export const chefBody = once(() => {
  const y = (v: number) => v + UP
  return blob(
    [
      // les jambes courtes et rondes, les sabots de bois
      ...[-1, 1].flatMap((s) => [
        cone([s * 0.1, y(0.74), 0], [s * 0.105, 0.17, 0.01], 0.11, 0.08, { color: C.iron, k: 0.05 }),
        ell([s * 0.105, 0.075, 0.06], [0.088, 0.075, 0.135], { color: C.wood, k: 0.02 }),
        ell([s * 0.105, 0.14, 0.0], [0.09, 0.05, 0.085], { color: C.iron, k: 0.03 }),
      ]),
      // le ventre rond de la veste blanche, le buste, les épaules, le col
      ell([0, y(0.8), 0.005], [0.28, 0.22, 0.225], { color: C.cream, k: 0.08 }),
      ell([0, y(1.0), 0], [0.26, 0.33, 0.215], { color: C.cream }),
      ...pair(ell([0.232, y(1.235), 0], 0.11, { color: C.cream }), 'x'),
      ell([0, y(1.36), 0], [0.17, 0.065, 0.145], { color: C.cream }),
      // le tablier d'indigo : jupe, plastron, bretelles qui passent sur les épaules, cordon de taille noué dans le dos
      ell([0, y(0.85), 0.2], [0.235, 0.26, 0.04], { color: C.indigo, k: 0.015 }),
      ell([0, y(1.14), 0.18], [0.15, 0.19, 0.04], { color: C.indigo, k: 0.015 }),
      ...chain(ring(y(0.9), 0.256, 0.218), 0.026, C.indigo, true, 0.03),
      ell([0.0, y(0.9), -0.245], [0.04, 0.04, 0.035], { color: C.indigo, k: 0.02 }),
      ...pair(ell([0.065, y(0.915), -0.25], [0.055, 0.04, 0.03], { color: C.indigo, rot: [0, 0, 0.4], k: 0.02 }), 'x'),
      ...pair(cone([0.03, y(0.89), -0.245], [0.07, y(0.72), -0.26], 0.03, 0.024, { color: C.indigo, k: 0.02 }), 'x'),
    ],
    { h: 0.03, k: 0.06, pad: 0.05 },
  )
})

/** Un bras : manche blanche, coude, avant-bras nu (manche retroussée), main ronde. Repère : l'épaule est l'origine. */
function arm(side: 'r' | 'l') {
  const P = CHEF_SHOULDER[side], E0 = ELBOW[side], H0 = CHEF_HAND[side]
  const sub = (a: V3, b: V3): V3 => [a[0] - b[0], a[1] - b[1], a[2] - b[2]]
  const lerp = (a: V3, b: V3, t: number): V3 => [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t, a[2] + (b[2] - a[2]) * t]
  const S: V3 = [0, 0, 0], E = sub(E0, P), H = sub(H0, P)
  const cuff = lerp(E, H, 0.4), wrist = lerp(E, H, 0.86)
  return blob(
    [
      ell(S, 0.1, { color: C.cream, k: 0.03 }),
      cone(S, E, 0.092, 0.07, { color: C.cream, k: 0.04 }),
      cone(E, cuff, 0.07, 0.062, { color: C.cream, k: 0.03 }),
      cone(lerp(cuff, wrist, 0.2), wrist, 0.054, 0.045, { color: C.skin, k: 0.015 }),
      // la main : une moufle ronde
      ell(H, [0.064, 0.06, 0.066], { color: C.skin, k: 0.03 }),
    ],
    { h: 0.024, k: 0.05, pad: 0.05 },
  )
}
export const chefArmR = once(() => arm('r'))
export const chefArmL = once(() => arm('l'))

/** La tête : crâne rond, joues, menton, nez, oreilles, tenugui noué (bandeau, calot, nœud et pans), joues rosées peintes. */
export const chefHead = once(() => {
  const yb = 0.09
  return blob(
    [
      ell([0, 0, 0], [0.25, 0.225, 0.23], { color: C.skin }),
      ...pair(ell([0.13, -0.08, 0.115], [0.115, 0.1, 0.1], { color: C.skin, k: 0.06 }), 'x'),
      ell([0, -0.145, 0.105], [0.12, 0.085, 0.115], { color: C.skin, k: 0.06 }),
      ell([0, -0.05, 0.222], [0.03, 0.027, 0.026], { color: C.nose, k: 0.02 }),
      ...pair(ell([0.245, -0.02, -0.01], [0.04, 0.06, 0.045], { color: C.skin, k: 0.03 }), 'x'),
      ...pair(ell([0.272, -0.02, 0.0], [0.024, 0.034, 0.03], { color: C.skin, op: 'sub', k: 0.015 }), 'x'),
      // le tenugui : calot, bandeau roulé, nœud sur la nuque et ses deux pans
      ell([0, 0.06, -0.01], [0.24, 0.19, 0.222], { color: C.indigo, k: 0.03 }),
      ...chain(ring(yb, 0.224, 0.205, 22, 0, -0.005), 0.027, C.indigo, true, 0.03),
      ell([0, 0.085, -0.245], [0.052, 0.042, 0.036], { color: C.indigo, k: 0.02 }),
      cone([0.02, 0.08, -0.255], [0.07, -0.02, -0.285], 0.034, 0.028, { color: C.indigo, k: 0.02 }),
      cone([-0.02, 0.08, -0.255], [-0.06, -0.03, -0.28], 0.034, 0.028, { color: C.indigo, k: 0.02 }),
    ],
    {
      h: 0.024,
      k: 0.05,
      paint: (p, c) => {
        tint(c, C.indigo, sstep(yb - 0.034, yb - 0.022, p.y))
        if (p.z > 0.05) for (const s of [-1, 1]) tint(c, C.blush, 1 - sstep(0.03, 0.062, Math.hypot(p.x - s * 0.155, (p.y + 0.06) * 1.25)))
        return c
      },
    },
  )
})

// ───────────────────────────── le maneki-neko ─────────────────────────────

const CAT = { white: 0xfff6ea, red: 0xd6334f, pink: 0xf4a3b0, orange: 0xf0a24c, black: 0x2c2430, muzzle: 0xfff0e2 }
/** L'épaule de la patte levée. */
export const CAT_PAW = [0.07, 0.165, 0.035] as V3

/** Le corps assis : socle laqué, panse, cuisses, patte gauche qui tient la pièce, collier, tête ronde aux grandes oreilles, queue. */
export const catBody = once(() =>
  blob(
    [
      ell([0, 0.026, 0], [0.113, 0.036, 0.108], { color: CAT.red, k: 0.006 }),
      ell([0, 0.125, 0], [0.093, 0.105, 0.082], { color: CAT.white, k: 0.05 }),
      ell([0, 0.1, 0.03], [0.078, 0.075, 0.06], { color: CAT.white, k: 0.05 }),
      ...pair(ell([0.065, 0.085, -0.012], [0.052, 0.06, 0.07], { color: CAT.white, k: 0.05 }), 'x'),
      ...pair(ell([0.042, 0.05, 0.075], [0.03, 0.025, 0.04], { color: CAT.white, k: 0.025 }), 'x'),
      // la patte gauche, repliée sur la poitrine, tient la pièce
      cone([-0.062, 0.165, 0.03], [-0.054, 0.108, 0.078], 0.036, 0.031, { color: CAT.white, k: 0.03 }),
      ell([-0.054, 0.1, 0.085], [0.034, 0.033, 0.03], { color: CAT.white, k: 0.03 }),
      ell(CAT_PAW, 0.045, { color: CAT.white, k: 0.04 }),
      // la queue qui monte derrière
      cone([0.0, 0.07, -0.075], [0.045, 0.1, -0.13], 0.03, 0.026, { color: CAT.white, k: 0.03 }),
      cone([0.045, 0.1, -0.13], [0.075, 0.18, -0.125], 0.026, 0.024, { color: CAT.white, k: 0.03 }),
      cone([0.075, 0.18, -0.125], [0.062, 0.235, -0.1], 0.024, 0.021, { color: CAT.white, k: 0.03 }),
      // le collier rouge et son bavoir
      ...chain(ring(0.166, 0.093, 0.084, 18, 0, 0.012), 0.0145, CAT.red, true, 0.006),
      ell([0, 0.137, 0.083], [0.056, 0.04, 0.02], { color: CAT.red, k: 0.006 }),
      // la tête : large, joues rondes, museau, grandes oreilles rondes à creux rose
      ell([0, 0.248, 0.012], [0.108, 0.089, 0.092], { color: CAT.white, k: 0.05 }),
      ...pair(ell([0.07, 0.222, 0.036], [0.05, 0.046, 0.05], { color: CAT.white, k: 0.04 }), 'x'),
      ell([0, 0.221, 0.09], [0.036, 0.026, 0.022], { color: CAT.muzzle, k: 0.03 }),
      ell([0, 0.234, 0.106], [0.013, 0.01, 0.009], { color: CAT.pink, k: 0.015 }),
      ...pair(cone([0.064, 0.295, 0.0], [0.086, 0.34, -0.004], 0.038, 0.028, { color: CAT.white, k: 0.03 }), 'x'),
    ],
    {
      h: 0.012,
      k: 0.035,
      pad: 0.03,
      paint: (p, c) => {
        // trois taches de maneki mi-ke : orange sur l'oreille et le front de gauche, noire sur le dos, orange au flanc
        const blot = (cx: number, cy: number, cz: number, r: number, hex: number) => tint(c, hex, 1 - sstep(r * 0.7, r, Math.hypot(p.x - cx, p.y - cy, p.z - cz)))
        blot(-0.07, 0.31, 0.0, 0.07, CAT.orange)
        blot(0.08, 0.15, -0.065, 0.06, CAT.black)
        blot(-0.085, 0.09, -0.03, 0.05, CAT.orange)
        blot(0.062, 0.222, -0.105, 0.03, CAT.black)
        // le creux rose des oreilles : devant, le long de leur axe
        if (p.z > 0.012) for (const s of [-1, 1]) {
          const ax = s * 0.064, bx = s * 0.086, dx = bx - ax, dy = 0.045, t = Math.min(1, Math.max(0, ((p.x - ax) * dx + (p.y - 0.295) * dy) / (dx * dx + dy * dy)))
          tint(c, CAT.pink, (1 - sstep(0.012, 0.022, Math.hypot(p.x - (ax + dx * t), p.y - (0.295 + dy * t)))) * sstep(0.3, 0.55, t))
        }
        return c
      },
    },
  ),
)

/** La patte levée : repère centré sur l'épaule, le bras monte le long de +y, la paume regarde la salle. */
export const catPaw = once(() =>
  blob(
    [
      ell([0, 0, 0], 0.041, { color: CAT.white, k: 0.03 }),
      cone([0, 0, 0], [0.004, 0.095, 0.002], 0.036, 0.038, { color: CAT.white, k: 0.03 }),
      ell([0.004, 0.12, 0.004], [0.046, 0.05, 0.039], { color: CAT.white, k: 0.03 }),
    ],
    {
      h: 0.011,
      k: 0.03,
      pad: 0.03,
      paint: (p, c) => {
        // la paume rose et trois coussinets, peints sur la face qui regarde la salle
        if (p.z > 0.015) {
          const pad = (cx: number, cy: number, rx: number, ry: number) => tint(c, CAT.pink, 1 - sstep(0.6, 1, Math.hypot((p.x - cx) / rx, (p.y - cy) / ry)))
          pad(0.004, 0.108, 0.024, 0.02)
          pad(-0.017, 0.14, 0.011, 0.012)
          pad(0.004, 0.15, 0.011, 0.012)
          pad(0.025, 0.14, 0.011, 0.012)
        }
        return c
      },
    },
  ),
)

// ───────────────────────────── les clients du comptoir ─────────────────────────────

/** Les gens du comptoir, vus de dos : le coffre, les bras qui s'appuient au comptoir, les jambes qui pendent. */
export const customerLegs = once(() =>
  blob(
    [
      ...[-1, 1].flatMap((s) => [
        cone([s * 0.085, 0.69, -0.02], [s * 0.088, 0.67, -0.3], 0.07, 0.055, { color: 0x2c2a44, k: 0.04 }),
        cone([s * 0.088, 0.67, -0.3], [s * 0.09, 0.28, -0.34], 0.056, 0.046, { color: 0x2c2a44, k: 0.04 }),
        ell([s * 0.09, 0.215, -0.365], [0.058, 0.042, 0.09], { color: C.iron, k: 0.02 }),
      ]),
    ],
    { h: 0.028, k: 0.05, pad: 0.04 },
  ),
)

const bodies = new Map<number, ReturnType<typeof blob>>()
/** Le buste d'un client : son manteau (couleur `coat`), ses bras qui s'appuient vers le comptoir. Repère : le bassin, à la hauteur de l'assise. */
export function customerBody(coat: number) {
  let g = bodies.get(coat)
  if (!g)
    bodies.set(
      coat,
      (g = blob(
        [
          ell([0, 0.11, 0.0], [0.21, 0.1, 0.175], { color: coat, k: 0.05 }),
          ell([0, 0.26, 0.0], [0.185, 0.27, 0.155], { color: coat, k: 0.05 }),
          ell([0, 0.42, 0.0], [0.225, 0.1, 0.145], { color: coat, k: 0.05 }),
          ...pair(cone([0.21, 0.42, -0.02], [0.225, 0.31, -0.26], 0.062, 0.052, { color: coat, k: 0.04 }), 'x'),
          ...pair(ell([0.225, 0.31, -0.26], 0.052, { color: coat, k: 0.03 }), 'x'),
          ...pair(cone([0.225, 0.31, -0.26], [0.13, 0.4, -0.45], 0.05, 0.042, { color: coat, k: 0.03 }), 'x'),
          ...pair(ell([0.125, 0.405, -0.5], [0.055, 0.052, 0.06], { color: C.skin, k: 0.012 }), 'x'),
        ],
        { h: 0.028, k: 0.05, pad: 0.04 },
      )),
    )
  return g
}

const heads = new Map<string, ReturnType<typeof blob>>()
/** La tête d'un client : centrée sur son origine, le visage vers −z ; une capuche (couleur du manteau) ou des cheveux et un chignon. */
export function customerHead(coat: number, hair: number, hood: boolean) {
  const key = `${coat}|${hair}|${hood}`
  let g = heads.get(key)
  if (!g)
    heads.set(
      key,
      (g = blob(
        [
          ell([0, 0, 0], [0.14, 0.14, 0.135], { color: C.skin }),
          ...pair(ell([0.07, -0.05, -0.065], [0.075, 0.07, 0.07], { color: C.skin, k: 0.05 }), 'x'),
          ell([0, -0.035, -0.135], [0.026, 0.022, 0.02], { color: C.nose, k: 0.02 }),
          ...pair(ell([0.14, -0.01, 0.0], [0.026, 0.04, 0.03], { color: C.skin, k: 0.02 }), 'x'),
          ...(hood
            ? [ell([0, 0.01, 0.045], [0.175, 0.165, 0.158], { color: coat, k: 0.04 }), ell([0, -0.105, 0.03], [0.165, 0.055, 0.145], { color: coat, k: 0.04 }), cone([0, 0.16, 0.02], [0, -0.04, 0.2], 0.022, 0.026, { color: coat, k: 0.025 })]
            : [
                ell([0, 0.02, 0.045], [0.15, 0.135, 0.14], { color: hair, k: 0.03 }),
                ell([0, 0.19, 0.03], 0.062, { color: hair, k: 0.015 }),
                ell([0, 0.14, 0.03], [0.05, 0.022, 0.05], { color: coat, k: 0.008 }),
              ]),
        ],
        {
          h: 0.024,
          k: 0.045,
          paint: (p, c) => {
            if (p.z < -0.05) for (const s of [-1, 1]) tint(c, C.blush, 1 - sstep(0.025, 0.05, Math.hypot(p.x - s * 0.085, (p.y + 0.05) * 1.2)))
            return c
          },
        },
      )),
    )
  return g
}
