import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, Color, Matrix4, Quaternion, TubeGeometry, Vector3, type BufferGeometry, type Group, type Material } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { isActive, useStore } from '../../state/store'
import { TAU, rand } from '../../math'
import { blob, cone, ell, pair } from '../blob'
import { M, skin } from '../materials'
import { SPH, cyl, type V3 } from '../parts'
import { useParticles, useSquash } from '../anim'
import { heartTex } from '../textures'

export interface Coat {
  fur: Material
  light: Material
  dark: Material
}

/** Les motifs du pelage : `tabby` (rayures douces sur le dos, la queue et le front) ou `bib` (uni, avec un petit plastron). */
export type CatPattern = 'tabby' | 'bib'

const WHISKER = cyl(0.003, 0.0055, 0.12, 6)
const hexOf = (m: Material) => (m as Material & { color?: Color }).color?.getHex() ?? 0xffffff
const FUR = skin()
const PINK = 0xf6a8bc

// Le chat est dessiné dans son propre repère (x vers l'avant, le visage vers +x, y en haut, z sur le flanc visible), puis tourné d'un
// huitième de tour pour regarder vers la caméra (le visage vers +x +z de la pièce). Le sol est à y = 0, le pivot de la queue à l'arrière.
const TURN = -Math.PI / 4
const HEAD: V3 = [0.3, 0.2, 0], HEAD_R: V3 = [0.17, 0.145, 0.19]
const EAR_A: V3 = [0.2, 0.3, 0.115], EAR_B: V3 = [0.185, 0.435, 0.155]
const TAIL: V3[] = [[-0.4, 0.085, 0.05], [-0.38, 0.062, 0.2], [-0.27, 0.055, 0.31], [-0.1, 0.055, 0.365], [0.07, 0.055, 0.36], [0.2, 0.055, 0.315], [0.275, 0.055, 0.25]]
const TAIL_PIVOT = TAIL[0]

const PAWS: [V3, V3][] = [[[0.12, 0.075, 0.16], [0.5, 0.053, -0.045]], [[0.12, 0.075, -0.14], [0.52, 0.053, 0.075]]]
/** Trois petits doigts arrondis au bout d'une patte. */
const toes = (a: V3, b: V3, color: number) => {
  const dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz), fx = dx / l, fz = dz / l
  return [-1, 0, 1].map((i) => ell([b[0] + fx * (0.034 - Math.abs(i) * 0.008) - fz * i * 0.04, 0.047, b[2] + fz * (0.034 - Math.abs(i) * 0.008) + fx * i * 0.04], 0.029, { color, k: 0.01 }))
}

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

/** Le point de l'ellipsoïde de la tête dans la direction (azimut `phi` depuis l'avant, hauteur `theta`) et sa normale. */
function onHead(phi: number, theta: number) {
  const d = [Math.cos(theta) * Math.cos(phi), Math.sin(theta), Math.cos(theta) * Math.sin(phi)]
  const p = new Vector3(HEAD[0] + HEAD_R[0] * d[0], HEAD[1] + HEAD_R[1] * d[1], HEAD[2] + HEAD_R[2] * d[2])
  const n = new Vector3(d[0] / HEAD_R[0], d[1] / HEAD_R[1], d[2] / HEAD_R[2]).normalize()
  return { p, n }
}

/** Un yeux fermé : arc épais en « ∪ », tracé dans le plan xy local (normale z). */
const eyeArc = (() => {
  const R = 0.04, pts: Vector3[] = []
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * (1.13 + 0.74 * (i / 10))
    pts.push(new Vector3(R * Math.cos(a), R * Math.sin(a) + R * 0.8, 0))
  }
  return { geo: new TubeGeometry(new CatmullRomCurve3(pts), 20, 0.0095, 8, false), ends: [pts[0], pts[10]] }
})()

interface Built {
  body: BufferGeometry
  tail: BufferGeometry
  eyes: BufferGeometry
  whiskers: BufferGeometry
}

const cache = new Map<string, Built>()

export function buildCat(F: number, L: number, D: number, pattern: CatPattern): Built {
  const key = `${F}|${L}|${D}|${pattern}`
  const hit = cache.get(key)
  if (hit) return hit
  const tabby = pattern === 'tabby'
  const cF = new Color(F), cL = new Color(L), cD = new Color(D), cP = new Color(PINK)
  // la part de « pelage de base » d'un sommet : les rayures ne couvrent ni le museau, ni les pattes, ni le plastron
  const furness = (c: Color) => 1 - smooth(0.05, 0.22, Math.hypot(c.r - cF.r, c.g - cF.g, c.b - cF.b))

  const hollow = [1, -1].map((s) => ({ c: [(EAR_A[0] + EAR_B[0]) / 2 + 0.072, (EAR_A[1] + EAR_B[1]) / 2 - 0.005, s * (EAR_A[2] + EAR_B[2]) / 2 * 1.0] as V3, r: [0.034, 0.05, 0.036] as V3 }))
  const paint = (p: Vector3, c: Color) => {
    const fur = furness(c)
    if (tabby && fur > 0) {
      // rayures du dos et des flancs : des bandes qui descendent, fines en bas, un peu courbées
      let a = 0
      if (p.x < 0.24 && p.y > 0.07) {
        const ph = ((((p.x - p.z * 0.12 + 0.5 * Math.sin(p.z * 5) * 0.04) % 0.105) + 0.105) % 0.105) / 0.105
        const d = Math.abs(ph - 0.5), w = 0.12 + 0.12 * smooth(0.1, 0.3, p.y)
        a = (1 - smooth(w - 0.05, w + 0.05, d)) * smooth(0.07, 0.14, p.y) * smooth(0.25, 0.16, p.x)
      }
      // le front : trois traits
      if (p.y > 0.3 && p.x > 0.2 && p.x < 0.44) {
        const dz = Math.min(Math.abs(p.z), Math.abs(p.z - 0.062), Math.abs(p.z + 0.062))
        a = Math.max(a, (1 - smooth(0.009, 0.021, dz)) * smooth(0.3, 0.33, p.y) * smooth(0.46, 0.4, p.x))
      }
      // la cuisse et l'épaule : un trait ou deux
      if (p.z > 0.1 && p.y > 0.06 && p.x < 0.02) {
        const d = Math.abs(((p.y * 1.2 + 10) % 0.09) / 0.09 - 0.5)
        a = Math.max(a, (1 - smooth(0.12, 0.2, d)) * 0.8 * smooth(0.1, 0.2, p.z))
      }
      c.lerp(cD, a * fur * 0.68)
    }
    // creux d'oreille rose, joues rosées
    for (const h of hollow) {
      const e = Math.hypot((p.x - h.c[0]) / (h.r[0] * 1.35), (p.y - h.c[1]) / (h.r[1] * 1.3), (p.z - h.c[2]) / (h.r[2] * 1.35))
      if (e < 1.05) c.lerp(cP, smooth(1.05, 0.8, e))
    }
    for (const s of [1, -1]) {
      const e = Math.hypot(p.x - 0.4, (p.y - 0.15) * 1.2, p.z - s * 0.135)
      if (e < 0.06) c.lerp(cP, 0.38 * smooth(0.06, 0.02, e))
    }
    return c
  }

  const volumes = [
    // le corps en boudin : une grande miche, la hanche ronde, la cuisse repliée sur le flanc visible
    ell([-0.07, 0.172, -0.02], [0.36, 0.172, 0.27], { color: F, k: 0.05 }),
    ell([-0.22, 0.165, -0.08], [0.21, 0.165, 0.2], { color: F }),
    ell([-0.16, 0.105, 0.2], [0.17, 0.1, 0.1], { color: F, rot: [0, 0.18, 0] }),
    cone([-0.03, 0.047, 0.255], [0.13, 0.047, 0.225], 0.049, 0.043, { color: L, k: 0.05 }),
    // les épaules et le poitrail clair sous le menton
    ell([0.2, 0.14, 0], [0.17, 0.14, 0.2], { color: F }),
    ell([0.34, 0.075, 0], [0.14, 0.075, 0.12], { color: L, k: 0.05 }),
    // la tête : crâne large, joues rondes, museau court, menton, nez
    ell(HEAD, HEAD_R, { color: F, k: 0.05 }),
    pair(ell([0.335, 0.145, 0.12], [0.1, 0.085, 0.09], { color: F })),
    ell([0.47, 0.15, 0], [0.076, 0.058, 0.082], { color: L, k: 0.035 }),
    pair(ell([0.45, 0.143, 0.042], [0.052, 0.042, 0.044], { color: L, k: 0.03 })),
    ell([0.435, 0.085, 0], [0.052, 0.04, 0.056], { color: L, k: 0.03 }),
    ell([0.538, 0.18, 0], [0.03, 0.024, 0.038], { color: PINK, k: 0.02 }),
    // les oreilles : larges, au bout rond, creusées devant
    ...[1, -1].map((s) => cone([EAR_A[0], EAR_A[1], s * EAR_A[2]], [EAR_B[0], EAR_B[1], s * EAR_B[2]], 0.09, 0.046, { color: F, k: 0.035 })),
    ...hollow.map(({ c, r }) => ell(c, r, { op: 'sub', k: 0.045 })),
    // les pattes avant croisées sous le menton, avec leurs petits doigts
    ...PAWS.flatMap(([a, b]) => [cone(a, b, 0.057, 0.048, { color: L, k: 0.02 }), ...toes(a, b, L)]),
  ]
  const body = blob(volumes, { h: 0.024, k: 0.045, paint })

  // la queue : un boudin qui s'enroule devant le corps, bout clair, anneaux sombres
  const seg = TAIL.slice(1).map((b, i) => [new Vector3(...TAIL[i]), new Vector3(...b)] as const)
  const lens = seg.map(([a, b]) => a.distanceTo(b)), total = lens.reduce((x, y) => x + y, 0)
  const along = (p: Vector3) => {
    let best = 1e9, s = 0, acc = 0
    seg.forEach(([a, b], i) => {
      const ab = b.clone().sub(a), t = Math.min(1, Math.max(0, p.clone().sub(a).dot(ab) / ab.lengthSq()))
      const d = p.distanceTo(a.clone().addScaledVector(ab, t))
      if (d < best) { best = d; s = acc + t * lens[i] }
      acc += lens[i]
    })
    return s
  }
  const tailPaint = (p: Vector3, c: Color) => {
    const s = along(p)
    if (tabby) {
      const d = Math.abs((((s - 0.03) % 0.1) + 0.1) % 0.1 / 0.1 - 0.5)
      c.lerp(cD, (1 - smooth(0.17, 0.28, d)) * smooth(0.02, 0.06, s) * 0.8)
    }
    c.lerp(cL, smooth(total - 0.12, total - 0.06, s))
    return c
  }
  const tail = blob(TAIL.slice(1).map((b, i) => cone(TAIL[i], b, 0.052 - i * 0.002, 0.05 - i * 0.002, { color: F, k: 0.02 })), { h: 0.021, k: 0.025, paint: tailPaint })
  tail.translate(-TAIL_PIVOT[0], -TAIL_PIVOT[1], -TAIL_PIVOT[2])

  // yeux fermés (arc posé sur la tête) et moustaches
  const up = new Vector3(0, 1, 0), zero = new Vector3()
  const unit = new Vector3(1, 1, 1), eyeParts: BufferGeometry[] = []
  for (const s of [1, -1]) {
    const { p, n } = onHead(0.55, 0.3)
    p.z *= s; n.z *= s
    p.addScaledVector(n, -0.004)
    const q = new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(n, zero, up)).multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), s * -0.1 - 0.04))
    // l'arc part de son centre : on recule de la hauteur de l'arc
    p.addScaledVector(up.clone().applyQuaternion(q), -0.032)
    const m = new Matrix4().compose(p, q, unit)
    eyeParts.push(eyeArc.geo.clone().applyMatrix4(m))
    for (const v of eyeArc.ends) eyeParts.push(SPH.clone().applyMatrix4(new Matrix4().multiplyMatrices(m, new Matrix4().compose(v, new Quaternion(), new Vector3(0.0095, 0.0095, 0.0095)))))
  }
  const whiskerParts: BufferGeometry[] = []
  for (const s of [1, -1]) {
    for (const e of [0.2, -0.02, -0.22]) {
      const d = new Vector3(0.3, e, s).normalize(), c = new Vector3(0.5, 0.145 + e * 0.04, s * 0.08).addScaledVector(d, 0.06)
      whiskerParts.push(WHISKER.clone().applyMatrix4(new Matrix4().compose(c, new Quaternion().setFromUnitVectors(up, d), unit)))
    }
  }
  const eyes = mergeGeometries(eyeParts)!, whiskers = mergeGeometries(whiskerParts)!
  const out = { body, tail, eyes, whiskers }
  cache.set(key, out)
  return out
}

/**
 * Chat roulé en boule (sur le lit par défaut), d'une seule peau (`blob`) : corps en boudin, tête ronde aux joues pleines, oreilles
 * au bout rond, yeux fermés, pattes croisées sous le menton, queue enroulée devant. Qui ronronne : respiration plus ample, queue
 * qui balance, cœurs. Pelage gris-lilas par défaut ; `coat` pour un autre (ses trois matériaux donnent les couleurs : pelage,
 * ventre / pattes / museau, rayures), `pattern` pour choisir le motif (`tabby` avec un `coat`, `bib` sans).
 */
export function Cat({ position = [-1.15, 0.88, -0.55], rotation = -0.25, coat, pattern }: { position?: V3; rotation?: number; coat?: Coat; pattern?: CatPattern } = {}) {
  // la cabane a son chat gris argenté : le pelage par défaut y est plus froid
  const silver = !coat && useStore.getState().room === 'cabin'
  const F = coat ? hexOf(coat.fur) : silver ? 0xa9afc0 : hexOf(M.fur)
  const L = coat ? hexOf(coat.light) : silver ? 0xeef0f6 : hexOf(M.furLight)
  const D = coat ? hexOf(coat.dark) : silver ? 0x6f768b : hexOf(M.furDark)
  const pat = pattern ?? (coat || silver ? 'tabby' : 'bib')
  const cat = useMemo(() => buildCat(F, L, D, pat), [F, L, D, pat])
  const g = useRef<Group>(null!), body = useRef<Group>(null!), tail = useRef<Group>(null!)
  const hearts = useParticles(), since = useRef(0)
  useSquash('cat', g)
  useFrame(({ clock }, delta) => {
    const t = clock.elapsedTime, purr = isActive(useStore.getState(), 'cat')
    const k = (purr ? 0.045 : 0.022) * Math.sin((t * TAU) / (purr ? 2.7 : 3.8))
    body.current.scale.set(1 + k * 0.4, 1 + k, 1 + k * 0.4)
    tail.current.rotation.y = purr ? Math.sin(t * 1.7) * 0.11 : 0
    since.current += Math.min(delta, 0.05)
    if (purr && since.current > 1.3) {
      since.current = 0
      hearts.emit(heartTex, position[0] + 0.3 + rand(-0.1, 0.1), position[1] + 0.37, position[2] + 0.15, { size: 0.2, life: 2.2, vy: 0.4, sway: 0.08 })
    }
  })
  return (
    <>
      <group ref={g} userData={{ id: 'cat' }} position={position} rotation-y={rotation}>
        <group rotation-y={TURN} position={[-0.04, 0, 0]}>
          <group ref={body}>
            <mesh geometry={cat.body} material={FUR} castShadow />
            <mesh geometry={cat.eyes} material={M.ink} />
            <mesh geometry={cat.whiskers} material={M.cream} />
          </group>
          <group ref={tail} position={TAIL_PIVOT}>
            <mesh geometry={cat.tail} material={FUR} castShadow receiveShadow />
          </group>
        </group>
      </group>
      <group ref={hearts.group} />
    </>
  )
}
