import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CanvasTexture, CatmullRomCurve3, Color, CylinderGeometry, Float32BufferAttribute, Matrix4, Quaternion, TubeGeometry, Vector3, type BufferGeometry, type Group } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { isActive, useStore } from '../../state/store'
import { IDLE_PERIOD, INHALE, PERIOD, breath, toBreathStart } from '../../state/snore'
import { approach } from '../../math'
import { blob, cone, ell, pair } from '../blob'
import { M, skin } from '../materials'
import { Part, SPH, type V3 } from '../parts'
import { reduceMotion, useParticles, useSquash } from '../anim'
import { makeCanvas } from '../textures'
import { Static } from '../Static'
import { C } from './materials'

// Le chien est dessiné dans son propre repère (x vers l'avant, le museau vers +x, y en haut, z sur le flanc visible), puis tourné pour
// regarder vers la caméra. Il est couché sur le ventre, le menton sur les pattes avant, les pattes arrière repliées sur le flanc visible,
// la queue enroulée devant elles. Le sol est à y = 0.
const AT: V3 = [-0.5, 0.038, 0.5] // posé sur le tapis tressé, devant le fauteuil, en face de la peau de mouton du chat
const TURN = -0.75
// le chien est un gabarit moyen : un peu plus grand que le chat
const SIZE = 1.15
/** Un point du repère du chien (x vers le museau, z sur son flanc visible) dans celui de la pièce. */
const world = (lx: number, lz: number): [number, number] => [AT[0] + SIZE * (lx * Math.cos(TURN) + lz * Math.sin(TURN)), AT[2] + SIZE * (lz * Math.cos(TURN) - lx * Math.sin(TURN))]
const HEAD: V3 = [0.47, 0.115, 0], HEAD_R: V3 = [0.15, 0.105, 0.12]

// les teintes : un golden au poil de miel, crème sous le menton et aux pattes, les oreilles plus foncées
const HONEY = 0xdba868, CREAM = 0xf6e3c0, TAN = 0xb27a40, EAR = 0xa8682f, INK = 0x3b2a30, BRASS = 0xf1c75a, CRANBERRY = 0xc9475f
const cF = new Color(HONEY), cD = new Color(TAN), cC = new Color(CRANBERRY)
const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// Le pelage luit très doucement de sa propre couleur (celle des sommets) : la nuit, sous la lumière bleue, le poil miel ne vire pas
// au vert (règle « une couleur qui vire la nuit », comme le chat).
const FUR = skin({ roughness: 0.78, clearcoat: 0.08, emissive: 0xffffff, emissiveIntensity: 0.05 })
FUR.onBeforeCompile = (sh) => {
  sh.fragmentShader = sh.fragmentShader.replace('#include <emissivemap_fragment>', '#include <emissivemap_fragment>\n#ifdef USE_COLOR\n\ttotalEmissiveRadiance *= vColor.rgb;\n#endif')
}
FUR.customProgramCacheKey = () => 'dog-fur-glow'

/** Trois petits doigts arrondis au bout d'une patte. */
const toes = (a: V3, b: V3) => {
  const dx = b[0] - a[0], dz = b[2] - a[2], l = Math.hypot(dx, dz), fx = dx / l, fz = dz / l
  return [-1, 0, 1].map((i) => ell([b[0] + fx * (0.03 - Math.abs(i) * 0.008) - fz * i * 0.036, 0.043, b[2] + fz * (0.03 - Math.abs(i) * 0.008) + fx * i * 0.036], 0.027, { color: CREAM, k: 0.01 }))
}

/** Donne une couleur de sommet unie à une géométrie (pour la fusionner avec la peau du chien). */
function tinted(g: BufferGeometry, hex: number) {
  const c = new Color(hex), n = g.attributes.position.count, col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3)
  g.setAttribute('color', new Float32BufferAttribute(col, 3))
  return g
}

/** Un œil fermé : un arc épais en « ∪ » posé sur la tête, à l'azimut `phi` (depuis l'avant) et à la hauteur `theta`, du côté `side`. */
function eye(phi: number, theta: number, side: 1 | -1) {
  const R = 0.042, pts: Vector3[] = []
  for (let i = 0; i <= 10; i++) {
    const a = Math.PI * (1.13 + 0.74 * (i / 10))
    pts.push(new Vector3(R * Math.cos(a), R * Math.sin(a) + R * 0.8, 0))
  }
  const d = new Vector3(Math.cos(theta) * Math.cos(phi), Math.sin(theta), side * Math.cos(theta) * Math.sin(phi))
  const p = new Vector3(HEAD[0] + HEAD_R[0] * d.x, HEAD[1] + HEAD_R[1] * d.y, HEAD[2] + HEAD_R[2] * d.z)
  const n = new Vector3(d.x / HEAD_R[0], d.y / HEAD_R[1], d.z / HEAD_R[2]).normalize()
  const up = new Vector3(0, 1, 0)
  const q = new Quaternion().setFromRotationMatrix(new Matrix4().lookAt(n, new Vector3(), up)).multiply(new Quaternion().setFromAxisAngle(new Vector3(0, 0, 1), side * -0.14))
  p.addScaledVector(n, -0.004).addScaledVector(up.clone().applyQuaternion(q), -0.034)
  const m = new Matrix4().compose(p, q, new Vector3(1, 1, 1))
  const parts: BufferGeometry[] = [new TubeGeometry(new CatmullRomCurve3(pts), 20, 0.0105, 8, false).applyMatrix4(m)]
  for (const v of [pts[0], pts[10]]) parts.push(SPH.clone().applyMatrix4(new Matrix4().multiplyMatrices(m, new Matrix4().compose(v, new Quaternion(), new Vector3(0.0105, 0.0105, 0.0105)))))
  return parts.map((g) => tinted(g, INK))
}

let built: BufferGeometry | null = null
/** Le corps entier, d'une seule peau (`blob`) avec les yeux, le collier et sa plaque fusionnés : un seul maillage. */
function buildDog(): BufferGeometry {
  if (built) return built
  const paint = (p: Vector3, c: Color) => {
    const fur = 1 - ss(0.05, 0.22, Math.hypot(c.r - cF.r, c.g - cF.g, c.b - cF.b))
    // la selle : le dos s'assombrit un peu, du garrot à la croupe
    c.lerp(cD, fur * ss(0.19, 0.27, p.y) * ss(0.2, 0.08, Math.abs(p.z)) * ss(-0.32, -0.1, p.x) * 0.5)
    // le collier de feutre canneberge, autour du cou
    c.lerp(cC, fur * ss(0.285, 0.3, p.x) * (1 - ss(0.345, 0.36, p.x)) * ss(0.09, 0.12, p.y))
    return c
  }
  const volumes = [
    // le corps couché : une grande miche, la poitrine, les hanches
    ell([0, 0.15, 0], [0.36, 0.15, 0.2], { color: HONEY, k: 0.06 }),
    ell([0.24, 0.13, 0], [0.17, 0.13, 0.18], { color: HONEY }),
    ell([-0.18, 0.12, -0.15], [0.19, 0.12, 0.11], { color: HONEY }),
    ell([-0.17, 0.12, 0.15], [0.19, 0.12, 0.12], { color: HONEY, rot: [0, 0.15, 0] }),
    // la patte arrière repliée sur le flanc visible, son pied devant la cuisse
    cone([-0.1, 0.05, 0.25], [0.1, 0.044, 0.27], 0.052, 0.045, { color: CREAM, k: 0.03 }),
    ...toes([-0.1, 0.05, 0.25], [0.1, 0.044, 0.27]),
    // les pattes avant allongées, le museau entre elles
    ...[1, -1].flatMap((s) => {
      const a: V3 = [0.22, 0.07, s * 0.145], b: V3 = [0.58, 0.046, s * 0.15]
      return [cone(a, b, 0.062, 0.05, { color: CREAM, k: 0.03 }), ...toes(a, b)]
    }),
    // la tête posée : crâne, joues, museau clair, nez, sourcils
    ell(HEAD, HEAD_R, { color: HONEY, k: 0.05 }),
    ell([0.6, 0.082, 0], [0.11, 0.062, 0.075], { color: CREAM, k: 0.04 }),
    ...pair(ell([0.52, 0.085, 0.075], [0.075, 0.058, 0.05], { color: HONEY, k: 0.04 })),
    ell([0.7, 0.103, 0], [0.028, 0.022, 0.034], { color: INK, k: 0.015 }),
    ...pair(ell([0.54, 0.185, 0.062], [0.05, 0.02, 0.034], { color: TAN, k: 0.03, rot: [0.2, 0, 0.1] })),
    // les oreilles tombantes, couchées de part et d'autre de la tête
    ...[1, -1].map((s) => cone([0.4, 0.175, s * 0.085], [0.32, 0.06, s * 0.215], 0.07, 0.055, { color: EAR, k: 0.035 })),
    // la queue, enroulée sur le flanc visible, bout clair
    cone([-0.3, 0.09, -0.02], [-0.42, 0.075, 0.08], 0.05, 0.047, { color: HONEY, k: 0.03 }),
    cone([-0.42, 0.075, 0.08], [-0.39, 0.058, 0.22], 0.047, 0.043, { color: HONEY, k: 0.03 }),
    cone([-0.39, 0.058, 0.22], [-0.26, 0.05, 0.3], 0.043, 0.036, { color: CREAM, k: 0.03 }),
  ]
  const body = blob(volumes.flat(), { h: 0.018, k: 0.045, paint })
  // la plaque du collier : un disque de laiton qui pend sur le flanc
  const tag = tinted(new CylinderGeometry(0.04, 0.04, 0.016, 18).rotateX(Math.PI / 2).translate(0.315, 0.085, 0.172), BRASS)
  // tous les morceaux ont les mêmes attributs (position, normale, uv, couleur) : ils se fusionnent en un seul maillage
  built = mergeGeometries([body, tag, ...eye(0.78, 0.34, 1), ...eye(0.78, 0.34, -1)])!
  return built
}

// Le « z » du sommeil : il se détache du museau et monte en s'agrandissant.
const zTex = (() => {
  const [c, x] = makeCanvas(64, 64)
  x.font = '800 46px "Gluten", "Nunito", system-ui, sans-serif'
  x.textAlign = 'center'
  x.textBaseline = 'middle'
  x.lineJoin = 'round'
  x.lineWidth = 8
  x.strokeStyle = '#fff'
  x.strokeText('z', 32, 36)
  x.fillStyle = '#8a9be0'
  x.fillText('z', 32, 36)
  return new CanvasTexture(c)
})()

/**
 * Le chien qui dort sur le tapis tressé, entre le fauteuil et le panier de tricot : un golden au poil de miel, couché sur le ventre, le menton sur les pattes,
 * les yeux fermés, un collier canneberge et sa plaque de laiton, la queue enroulée. Son flanc monte et descend avec le ronflement
 * (`state/snore.ts`) : une phase qu'on additionne image après image, recalée en douceur sur chaque souffle du son (`pulses.snore`) ; il
 * respire plus doucement et plus lentement quand le son est éteint. Des « z » montent de son museau à chaque expiration (pas avec
 * `prefers-reduced-motion`, où le flanc respire moins fort). Sa balle rouge est restée contre son museau.
 */
export function Dog() {
  const geo = useMemo(buildDog, [])
  const g = useRef<Group>(null!), body = useRef<Group>(null!)
  const zs = useParticles()
  // phase : en tours de souffle ; amp : amplitude, qui glisse vers sa cible ; fix : correction en cours ; seen : dernier souffle du son vu
  const st = useRef({ phase: 0, amp: 0.035, fix: 0, seen: useStore.getState().pulses.snore ?? 0, prev: 0 })
  useSquash('dog', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = useStore.getState(), a = st.current, snoring = isActive(s, 'dog')
    FUR.emissiveIntensity = 0.05 + 0.09 * (s.night ? 1 : 0)
    // la phase avance au rythme du son quand il joue, plus lentement sinon ; au début de chaque souffle du son, on se recale en douceur
    a.phase += dt / (snoring ? PERIOD : IDLE_PERIOD)
    const beat = s.pulses.snore ?? 0
    if (beat !== a.seen) {
      a.seen = beat
      if (snoring) a.fix = toBreathStart(a.phase)
    }
    const step = a.fix * Math.min(1, dt * 4)
    a.phase += step
    a.fix -= step
    a.amp = approach(a.amp, (snoring ? 0.07 : 0.035) * (reduceMotion ? 0.6 : 1), dt * 0.03)
    const k = a.amp * breath(a.phase)
    body.current.scale.set(1 + k * 0.3, 1 + k, 1 + k * 0.5)
    // un « z » à chaque début d'expiration
    const frac = a.phase - Math.floor(a.phase)
    if (snoring && !reduceMotion && a.prev < INHALE && frac >= INHALE) {
      const [wx, wz] = world(0.72, 0.06)
      zs.emit(zTex, wx, AT[1] + 0.24, wz, { size: 0.17, life: 3.2, vy: 0.2, sway: 0.07, grow: 0.9, peak: 0.9 })
    }
    a.prev = frac
  })
  return (
    <>
      <group ref={g} userData={{ id: 'dog' }} position={AT} rotation-y={TURN}>
        <group scale={SIZE}>
          <group ref={body}>
            <mesh geometry={geo} material={FUR} castShadow receiveShadow />
          </group>
        </group>
      </group>
      <group ref={zs.group} />
      {/* sa balle rouge, restée contre son museau (immobile, fusionnée) */}
      <Static>
        <group position={[world(0.8, 0.12)[0], AT[1], world(0.8, 0.12)[1]]}>
          <Part geo={SPH} m={C.cranberry} scale={0.062} p={[0, 0.062, 0]} />
          <Part m={M.cream} p={[0, 0.062, 0]} rotation={[Math.PI / 2 - 0.5, 0, 0.4]} castShadow={false}>
            <torusGeometry args={[0.0625, 0.0065, 6, 28]} />
          </Part>
        </group>
      </Static>
    </>
  )
}
