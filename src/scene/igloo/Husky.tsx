import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { CatmullRomCurve3, Color, Euler, Matrix4, Mesh, MeshBasicMaterial, Quaternion, Raycaster, SphereGeometry, TubeGeometry, Vector3, type BufferGeometry, type Group } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { rand } from '../../math'
import { blob, cone, ell, pair, type Blob } from '../blob'
import { skin } from '../materials'
import { Part, SPH, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { reduceMotion } from '../anim'
import { I } from './materials'
import { Vessel } from './Vessel'
import { SPH_LO } from './spheres'

// Le corps roulé : la colonne suit un arc de 220° (des hanches, à gauche, au poitrail, à droite), le dos dehors, le ventre dedans.
const SPINE = { R: 0.24, y: 0.105, a0: 160, a1: 380 }
// La tête, posée sur les pattes avant, regarde le long de la boucle (vers l'avant gauche du chien) : la caméra la voit de trois
// quarts. F est sa direction, H son centre.
const F = new Vector3(-0.7, 0, 0.71).normalize()
const H: V3 = [0.06, 0.15, 0.3]
const HEAD_RY = Math.atan2(-F.z, F.x)
const HEAD_RZ = -0.1 // le menton un peu baissé
// Le repère de la tête (x vers le museau, y en haut, z sur le côté), dans celui du chien.
const HM = new Matrix4().compose(new Vector3(...H), new Quaternion().setFromEuler(new Euler(0, HEAD_RY, 0)), new Vector3(1, 1, 1)).multiply(new Matrix4().makeRotationZ(HEAD_RZ))
const tp = (p: V3): V3 => {
  const v = new Vector3(...p).applyMatrix4(HM)
  return [v.x, v.y, v.z]
}
// les teintes du pelage (les sommets les portent : le matériau est blanc)
const GREY = 0x747e8a, DARK = 0x535d69, WHITE = 0xf4f5f7, PINK = 0xe3b0ae
const cG = new Color(GREY), cD = new Color(DARK), cW = new Color(WHITE)
const ss = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)))
  return t * t * (3 - 2 * t)
}

// la queue en panache : elle sort du bout de la croupe, tourne sur la gauche et revient devant, à plat sur la peau
const TAIL_PTS = [new Vector3(-0.17, 0.12, -0.02), new Vector3(-0.235, 0.11, 0.085), new Vector3(-0.34, 0.085, 0.24), new Vector3(-0.37, 0.07, 0.4), new Vector3(-0.29, 0.065, 0.53), new Vector3(-0.18, 0.062, 0.59)]
const tailR = (u: number) => 0.042 + 0.046 * Math.sin(Math.PI * Math.pow(u, 0.75))
const TAIL = (() => {
  const c = new CatmullRomCurve3(TAIL_PTS), n = 22
  return Array.from({ length: n + 1 }, (_, i) => ({ u: i / n, p: c.getPointAt(i / n), r: tailR(i / n) }))
})()

/** Le pelage peint du corps : la selle sombre, les flancs gris, le ventre et le poitrail blancs ; la queue. */
function paintBody(p: Vector3, base: Color) {
  // le corps roulé (hors de l'ouverture de la boucle, où sont les pattes, la collerette et la tête)
  const ang = ((Math.atan2(p.z, p.x) * 180) / Math.PI + 360) % 360
  const open = ss(22, 48, ang) * (1 - ss(130, 158, ang))
  const torso = 1 - open
  if (torso > 0) {
    const rr = Math.hypot(p.x, p.z) - SPINE.R, yy = p.y - SPINE.y
    const t = rr * 0.6 + yy * 0.9
    const back = ss(-0.09, -0.03, t), saddle = ss(0.07, 0.125, t)
    const c = new Color().copy(cW).lerp(cG, back).lerp(cD, saddle * 0.8)
    // le poitrail blanc, et le bas des hanches
    const aC = ang < 90 ? ang : ang - 360
    c.lerp(cW, ss(-20, 18, aC) * 0.9)
    base.lerp(c, torso)
  }
  // la queue : grise dessus, blanche dessous et au bout
  let best = 1e9, bu = 0, bp: Vector3 | null = null
  for (const t of TAIL) {
    const d = p.distanceTo(t.p) - t.r
    if (d < best) { best = d; bu = t.u; bp = t.p }
  }
  const tm = (1 - ss(0.0, 0.03, best)) * ss(0.12, 0.3, bu)
  if (tm > 0 && bp) {
    const under = 1 - ss(-0.02, 0.025, p.y - bp.y)
    const w = Math.max(under * 0.95, ss(0.8, 0.92, bu))
    const c = new Color().copy(cG).lerp(cD, ss(0.2, 0.6, bu) * (1 - w) * 0.5).lerp(cW, w)
    base.lerp(c, tm)
  }
  return base
}

/** Le pelage peint de la tête (repère de la tête) : la calotte grise, le masque blanc, la raie claire et les taches au-dessus des yeux. */
function paintHead(p: Vector3, base: Color) {
  // la calotte grise couvre le dessus et l'arrière, le masque blanc le devant ; la raie claire monte entre les yeux
  const s = p.y - 0.5 * p.x + 0.035
  let g = ss(-0.004, 0.03, s)
  g *= 1 - (1 - ss(0.008, 0.045, Math.abs(p.z))) * ss(-0.02, 0.06, p.x)
  // les petites taches claires au-dessus des yeux
  const sp = Math.max(0, 1 - Math.hypot(p.x - 0.07, p.y - 0.062, Math.abs(p.z) - 0.07) / 0.045)
  g *= 1 - 0.75 * ss(0, 1, sp)
  // le museau et les joues restent blancs (volumes), le crâne prend la teinte peinte
  const ee = (p.x / 0.15) ** 2 + (p.y / 0.125) ** 2 + (p.z / 0.14) ** 2
  const hm = 1 - ss(0.85, 1.2, ee)
  return base.lerp(new Color().copy(cW).lerp(cG, g), hm)
}

function huskyBody(): BufferGeometry {
  const { R, a0, a1 } = SPINE
  // le torse : une chaîne d'ellipsoïdes le long de l'arc, couchés dans le sens de la marche
  const torso: Blob[] = []
  const N = 12
  for (let i = 0; i <= N; i++) {
    const t = i / N, a = ((a0 + (a1 - a0) * t) * Math.PI) / 180
    const across = 0.127 + 0.025 * Math.sin(Math.PI * t) + 0.012 * t, ry = across * 0.93
    torso.push(ell([Math.cos(a) * R, ry + 0.006, Math.sin(a) * R], [0.105, ry, across], { rot: [0, Math.atan2(-Math.cos(a), -Math.sin(a)), 0], color: GREY }))
  }
  // le cou : de la collerette à l'arrière de la tête
  const N0: V3 = [0.17, 0.125, 0.2], N1 = tp([-0.055, -0.025, 0])
  const front = [0, 1].map((i): Blob[] => {
    const sx = 0.17 + i * 0.053, sz = 0.2 + i * 0.0525, ex = sx + F.x * 0.27, ez = sz + F.z * 0.27
    return [
      cone([sx, 0.07, sz], [ex, 0.046, ez], 0.052, 0.042, { color: WHITE, k: 0.03 }),
      ell([ex + F.x * 0.01, 0.045, ez + F.z * 0.01], [0.062, 0.04, 0.052], { rot: [0, HEAD_RY, 0], color: WHITE, k: 0.03 }),
    ]
  })
  return blob(
    [
      torso,
      // la hanche ronde, la patte arrière repliée dont le pied dépasse sous la croupe
      ell([-0.21, 0.125, 0.05], [0.125, 0.12, 0.125], { color: GREY, k: 0.06 }),
      cone([-0.19, 0.1, 0.09], [-0.13, 0.05, 0.19], 0.075, 0.05, { color: GREY, k: 0.05 }),
      ell([-0.12, 0.044, 0.215], [0.065, 0.04, 0.1], { rot: [0, 0.4, 0], color: WHITE, k: 0.035 }),
      // la collerette blanche du poitrail, gonflée, et le cou
      ell([0.19, 0.125, 0.2], [0.13, 0.115, 0.115], { color: WHITE, k: 0.06 }),
      ell([0.12, 0.095, 0.255], [0.1, 0.085, 0.09], { color: WHITE, k: 0.06 }),
      ell([0.26, 0.105, 0.165], [0.09, 0.085, 0.085], { color: WHITE, k: 0.06 }),
      cone(N0, N1, 0.105, 0.095, { color: WHITE, k: 0.06 }),
      // les pattes avant tendues sous le menton
      front,
      // la queue en panache
      TAIL.slice(0, -1).map((t, i): Blob => cone(t.p.toArray() as V3, TAIL[i + 1].p.toArray() as V3, t.r, TAIL[i + 1].r, { color: GREY, k: 0.04 })),
    ],
    { h: 0.03, k: 0.05, paint: paintBody },
  )
}

function huskyHead(): BufferGeometry {
  return blob(
    [
    // le crâne, la nuque
    ell([0, 0, 0], [0.12, 0.108, 0.112], { color: GREY }),
    ell([-0.035, 0.015, 0], [0.1, 0.098, 0.105], { color: GREY }),
    // les joues blanches, ébouriffées : une grosse touffe et deux plus petites qui s'échappent vers l'arrière
    pair(ell([0.03, -0.05, 0.082], [0.08, 0.07, 0.05], { color: WHITE, k: 0.045 })),
    pair(ell([-0.03, -0.066, 0.1], [0.055, 0.04, 0.036], { rot: [0, 0.3, 0.2], color: WHITE, k: 0.05 })),
    pair(ell([-0.07, -0.03, 0.09], [0.045, 0.035, 0.032], { rot: [0, 0.5, 0.1], color: WHITE, k: 0.05 })),
    // le museau et son bout, le menton
    ell([0.125, -0.04, 0], [0.085, 0.055, 0.062], { color: WHITE, k: 0.05 }),
    ell([0.19, -0.04, 0], [0.05, 0.044, 0.046], { color: WHITE, k: 0.04 }),
    ell([0.12, -0.078, 0], [0.07, 0.03, 0.045], { color: WHITE, k: 0.04 }),
      // le cou : il s'enfonce dans la collerette
      cone([-0.03, -0.02, 0], [-0.15, -0.03, 0], 0.1, 0.1, { color: WHITE, k: 0.05 }),
    ],
    { h: 0.016, k: 0.05, paint: paintHead },
  )
}

/**
 * Les yeux fermés : deux arcs épais (en ‿) qui épousent le crâne. Chaque point de l'arc est posé sur la vraie peau de la tête
 * (un rayon lancé vers l'intérieur), donc rien ne flotte et rien n'est enfoncé, quelle que soit la forme du blob.
 */
function eyesGeo(head: BufferGeometry): BufferGeometry {
  const mesh = new Mesh(head, new MeshBasicMaterial()), ray = new Raycaster(), parts: BufferGeometry[] = []
  mesh.updateMatrixWorld(true)
  for (const s of [-1, 1]) {
    const n = new Vector3(0.69, 0.12, 0.72 * s).normalize(), e1 = new Vector3(-n.z, 0, n.x).normalize(), c = new Vector3(0.088, 0.024, 0.09 * s)
    const pts: Vector3[] = []
    for (let i = 0; i <= 8; i++) {
      const a = (i / 8 - 0.5) * 0.06, b = 0.014 * (1 - (a / 0.03) ** 2) * -1 + 0.007
      const o = c.clone().addScaledVector(e1, a).addScaledVector(new Vector3(0, 1, 0), b)
      ray.set(o.clone().addScaledVector(n, 0.25), n.clone().negate())
      const hit = ray.intersectObject(mesh)[0]
      pts.push(hit ? hit.point.clone().addScaledVector(hit.face!.normal, -0.002) : o)
    }
    parts.push(new TubeGeometry(new CatmullRomCurve3(pts), 16, 0.0085, 8, false))
    for (const q of [pts[0], pts[8]]) parts.push(new SphereGeometry(0.0085, 10, 8).translate(q.x, q.y, q.z))
  }
  const g = mergeGeometries(parts.map((q) => q.toNonIndexed()), false)
  return g
}

// Une oreille dressée (le bout rond) et son creux rose ; la même pour les deux.
function earBlob(): BufferGeometry {
  return blob(
    [
      ell([0, 0.03, 0], [0.021, 0.047, 0.038], { color: GREY, k: 0.03 }),
      ell([0, 0.068, 0], [0.016, 0.037, 0.026], { color: GREY, k: 0.03 }),
      ell([0.012, 0.04, 0], [0.011, 0.04, 0.019], { color: PINK, k: 0.01 }),
      ell([0.01, 0.064, 0], [0.009, 0.026, 0.014], { color: PINK, k: 0.01 }),
    ],
    { h: 0.008, k: 0.02 },
  )
}

// L'os à ronger, en gomme : un manche et quatre boules aux bouts.
function boneBlob(): BufferGeometry {
  return blob(
    [cone([-0.07, 0, 0], [0.07, 0, 0], 0.017, 0.017, { color: 0xf3e9d2 }), [-1, 1].flatMap((sx) => pair(ell([sx * 0.078, 0, 0.018], 0.025, { color: 0xf3e9d2, k: 0.02 })))],
    { h: 0.008, k: 0.025 },
  )
}

const huskySkin = skin({ roughness: 0.85, clearcoat: 0.05 })
const boneSkin = skin({ roughness: 0.55, clearcoat: 0.4 })

// l'orientation de l'axe de la queue du collier : le long du cou
const NECK_A = new Vector3(0.17, 0.125, 0.2), NECK_B = new Vector3(...tp([-0.055, -0.025, 0]))
const NECK_DIR = NECK_B.clone().sub(NECK_A).normalize()
const COLLAR_C = NECK_A.clone().lerp(NECK_B, 0.8)
const COLLAR_Q = new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), NECK_DIR)
const COLLAR_E = new Euler().setFromQuaternion(COLLAR_Q)
// la médaille pend du collier, du côté de la caméra
const MEDAL_D = new Vector3(0, -0.3, 1).addScaledVector(NECK_DIR, -new Vector3(0, -0.3, 1).dot(NECK_DIR)).normalize()
const MEDAL_P = COLLAR_C.clone().addScaledVector(MEDAL_D, 0.14)
const MEDAL_E = new Euler().setFromQuaternion(new Quaternion().setFromUnitVectors(new Vector3(0, 0, 1), MEDAL_D.clone().multiplyScalar(0.6).add(new Vector3(0, 0.55, 0.8).multiplyScalar(0.4)).normalize()))

/**
 * Le chien de traîneau, un husky gris et blanc roulé en boule sur la peau de renne, qui dort. D'une seule peau : le corps en boudin
 * (la selle gris foncé sur le dos, les flancs gris, le ventre et le poitrail blancs), la hanche ronde et la patte arrière repliée, la
 * collerette blanche, les pattes avant tendues, la queue en panache enroulée devant, et la tête (le masque blanc, la calotte grise et sa
 * raie, les joues ébouriffées, le museau) coulent les uns dans les autres, sans jonction. Les yeux fermés en arcs, la truffe, le collier
 * rouge et sa médaille, les coussinets sont des détails posés dessus ; les oreilles, à part, frémissent.
 * Il respire lentement ; de loin en loin, une oreille frémit. À côté, sa gamelle émaillée et un os à ronger.
 * Il ne fait pas de son (on ne joue pas de respiration : voir le skill room-objects).
 */
export function Husky({ position, ry = 0 }: { position: V3; ry?: number }) {
  const body = useRef<Group>(null!), ears = useRef<Group[]>([])
  const st = useRef({ ph: 0, flick: 0, ear: 0, next: rand(5, 10) })
  const geo = useMemo(() => {
    const head = huskyHead()
    return { body: huskyBody(), head, eyes: eyesGeo(head), ear: earBlob(), bone: boneBlob() }
  }, [])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), k = st.current
    if (reduceMotion) return
    k.ph += dt * 1.3
    body.current.scale.set(1 + Math.sin(k.ph) * 0.015, 1 + Math.sin(k.ph) * 0.035, 1 + Math.sin(k.ph) * 0.015)
    // une oreille frémit : un petit battement amorti
    k.next -= dt
    if (k.next <= 0) {
      k.next = rand(6, 14)
      k.flick = 1
      k.ear = Math.random() < 0.5 ? 0 : 1
    }
    k.flick = Math.max(0, k.flick - dt * 1.8)
    ears.current.forEach((e, i) => {
      const w = i === k.ear ? Math.sin(k.flick * Math.PI * 5) * k.flick * 0.35 : 0
      e.rotation.x = (i ? 1 : -1) * 0.3 + w
    })
  })
  return (
    <group position={position} rotation-y={ry} userData={LIVE}>
      <group ref={body}>
        <Static>
          <mesh geometry={geo.body} material={huskySkin} castShadow receiveShadow />
          {/* le collier autour du cou et sa médaille de laiton */}
          <Part m={I.collar} p={COLLAR_C.toArray() as V3} rotation={[COLLAR_E.x, COLLAR_E.y, COLLAR_E.z]} castShadow={false}>
            <torusGeometry args={[0.128, 0.017, 8, 28]} />
          </Part>
          <Part geo={SPH} m={I.brass} scale={[0.034, 0.034, 0.009]} p={MEDAL_P.toArray() as V3} rotation={[MEDAL_E.x, MEDAL_E.y, MEDAL_E.z]} castShadow={false} />
        </Static>
        {/* la tête : une peau à part, plus fine, posée dans la collerette ; les yeux fermés en arcs, la truffe, les oreilles qui frémissent */}
        <group position={H} rotation-y={HEAD_RY}>
          <group rotation-z={HEAD_RZ}>
            <Static>
              <mesh geometry={geo.head} material={huskySkin} castShadow receiveShadow />
              <Part geo={SPH} m={I.nose} scale={[0.03, 0.024, 0.036]} p={[0.232, -0.022, 0]} castShadow={false} />
              <mesh geometry={geo.eyes} material={I.huskyDark} castShadow={false} />
            </Static>
            {[-1, 1].map((s, i) => (
              <group key={s} ref={(el) => void (el && (ears.current[i] = el))} position={[-0.035, 0.09, s * 0.06]} rotation={[s * 0.3, 0, 0.35]}>
                <mesh geometry={geo.ear} material={huskySkin} castShadow receiveShadow />
              </group>
            ))}
          </group>
        </group>
      </group>
      <Static>
        {/* sa gamelle émaillée, quelques croquettes dedans ; l'os à ronger près des pattes */}
        <Vessel p={[0.55, 0, -0.12]} rt={0.085} rb={0.07} h={0.05} m={I.enamel} inner={I.enamelIn} rim={I.enamelRim} />
        {[[0.02, 0.01], [-0.02, 0.025], [0.01, -0.025], [-0.025, -0.01], [0.03, -0.01]].map(([x, z], i) => (
          <Part key={i} geo={SPH_LO} m={I.crateDark} scale={[0.016, 0.011, 0.016]} p={[0.55 + x, 0.026, -0.12 + z]} castShadow={false} />
        ))}
        <mesh geometry={geo.bone} material={boneSkin} position={[0.33, 0.028, 0.5]} rotation-y={0.5} castShadow receiveShadow />
      </Static>
    </group>
  )
}
