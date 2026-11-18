import { useLayoutEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, Color, Euler, InstancedMesh, Matrix4, Object3D, Quaternion, SphereGeometry, Vector3, type BufferGeometry } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { TAU } from '../../math'
import { gummy } from '../materials'
import { reduceMotion } from '../anim'

/**
 * Un banc de poissons en deux tracés : tous les corps dans un `InstancedMesh` (corps, nageoires, yeux et taches fusionnés en une seule
 * forme aux couleurs de sommets, teintée par poisson), toutes les queues dans un autre (elles battent chacune à leur rythme). Avant :
 * un maillage par corps, par nageoire, par œil et par queue (20 tracés pour quatre poissons rouges). Les poissons ont le nez vers +x.
 */

const SPH = new SphereGeometry(1, 16, 10)
const white = new Color(0xfaf6ee), red = new Color(0xd9341f), ink = new Color(0x1c1418)

/** Une sphère aplatie, placée, inclinée et peinte : l'unité de base d'un poisson. */
function blob(c: Color, p: [number, number, number], s: [number, number, number], r: [number, number, number] = [0, 0, 0]) {
  const g = SPH.clone()
  const m = new Matrix4().compose(new Vector3(...p), new Quaternion().setFromEuler(new Euler(...r)), new Vector3(...s))
  g.applyMatrix4(m)
  const n = g.attributes.position.count, col = new Float32Array(n * 3)
  for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], i * 3)
  g.setAttribute('color', new BufferAttribute(col, 3))
  return g
}

/** Un koï d'environ 20 cm (en unités de la scène : 0,2) : tête, corps, pédoncule, nageoires, yeux, et trois taches rouges (dont le « tancho » de la tête). */
function koi() {
  return mergeGeometries([
    blob(white, [0, 0, 0], [0.085, 0.037, 0.038]),
    blob(white, [0.07, -0.002, 0], [0.05, 0.03, 0.031]),
    blob(white, [-0.078, 0.002, 0], [0.06, 0.022, 0.018]),
    // les pectorales, écartées vers le bas ; la dorsale, en voile
    blob(white, [0.036, -0.016, 0.04], [0.028, 0.004, 0.014], [0.5, -0.5, 0.3]),
    blob(white, [0.036, -0.016, -0.04], [0.028, 0.004, 0.014], [-0.5, 0.5, 0.3]),
    blob(white, [-0.01, 0.04, 0], [0.045, 0.02, 0.004], [0, 0, 0.1]),
    // les yeux
    blob(ink, [0.088, 0.012, 0.024], [0.0065, 0.0065, 0.0065]),
    blob(ink, [0.088, 0.012, -0.024], [0.0065, 0.0065, 0.0065]),
    // les taches : posées sur le dos, plus grosses que le corps à cet endroit
    blob(red, [0.015, 0.014, 0.004], [0.034, 0.03, 0.036]),
    blob(red, [-0.045, 0.012, -0.006], [0.028, 0.021, 0.027]),
    blob(red, [0.085, 0.014, 0.0], [0.02, 0.02, 0.026]),
  ])!
}

/** Un poisson rouge de fête foraine : ventre rond, dorsale haute, yeux ronds. Sans tache : la teinte de chaque poisson fait la couleur. */
function gold() {
  return mergeGeometries([
    blob(white, [0, 0, 0], [0.06, 0.037, 0.034]),
    blob(white, [0.0, 0.034, 0], [0.02, 0.024, 0.005], [0, 0, 0.15]),
    blob(white, [0.012, -0.018, 0.034], [0.018, 0.004, 0.01], [0.5, -0.5, 0.3]),
    blob(white, [0.012, -0.018, -0.034], [0.018, 0.004, 0.01], [-0.5, 0.5, 0.3]),
    blob(ink, [0.042, 0.009, 0.022], [0.0075, 0.0075, 0.0075]),
    blob(ink, [0.042, 0.009, -0.022], [0.0075, 0.0075, 0.0075]),
  ])!
}

/** Une queue en éventail (deux lobes), qui part de son attache vers -x. */
function tail(len: number, spread: number) {
  return mergeGeometries([
    blob(white, [-len * 0.55, 0, spread * 0.35], [len * 0.62, len * 0.34, 0.004], [0, 0.35, 0]),
    blob(white, [-len * 0.55, 0, -spread * 0.35], [len * 0.62, len * 0.34, 0.004], [0, -0.35, 0]),
  ])!
}

export const fishGeo = { koi: koi(), gold: gold(), koiTail: tail(0.1, 0.05), goldTail: tail(0.07, 0.04) }
// un peu d'émission : sous la lumière de la rampe, à travers l'eau, un poisson blanc doit rester lisible
const fishMat = gummy(0xffffff, { vertexColors: true, roughness: 0.32, clearcoat: 0.9, emissive: 0x4a5560, emissiveIntensity: 0.7 })

export interface Swimmer {
  /** Teinte multipliée aux couleurs de sommets (le blanc prend la couleur, le rouge s'y fond, les yeux restent sombres). */
  tint: number
  /** Échelle du poisson. */
  s?: number
  /** Position et cap au pas de phase `ph` (radians cumulés image après image) : remplit `out` = [x, y, z, cap]. */
  at: (ph: number, out: number[]) => void
  /** Vitesse de la phase (radians par seconde). */
  rate: number
  /** Phase de départ. */
  ph0?: number
}

/**
 * Le banc. `kind` choisit la forme (koï à taches, ou poisson rouge) ; chaque nageur donne son chemin. Le cap suit la tangente du chemin
 * (différence finie), adouci image après image pour que le nez tourne sans à-coup. `speed` (0 → 1.4) est lu à chaque image : le banc ralentit
 * ou s'anime sans que les phases sautent (elles ne font que s'additionner). `reduceMotion` : les poissons restent à leur place de départ.
 */
export function School({ kind, swimmers, speed = () => 1 }: { kind: 'koi' | 'gold'; swimmers: Swimmer[]; speed?: () => number }) {
  const body = useRef<InstancedMesh>(null!), fin = useRef<InstancedMesh>(null!)
  const geo = fishGeo[kind], tailGeo: BufferGeometry = kind === 'koi' ? fishGeo.koiTail : fishGeo.goldTail
  const root = kind === 'koi' ? 0.09 : 0.056 // où la queue s'attache, en arrière du centre
  const st = useMemo(() => swimmers.map((w) => ({ ph: w.ph0 ?? 0, tail: (w.ph0 ?? 0) * 3, yaw: 0, set: false, o: [0, 0, 0, 0] })), [swimmers])
  const tmp = useMemo(() => ({ o: new Object3D(), t: new Object3D(), m: new Matrix4() }), [])
  useLayoutEffect(() => {
    const c = new Color()
    swimmers.forEach((w, i) => body.current.setColorAt(i, c.set(w.tint)))
    swimmers.forEach((w, i) => fin.current.setColorAt(i, c.set(w.tint)))
    if (body.current.instanceColor) body.current.instanceColor.needsUpdate = true
    if (fin.current.instanceColor) fin.current.instanceColor.needsUpdate = true
  }, [swimmers])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), k = speed(), { o, t } = tmp
    swimmers.forEach((w, i) => {
      const s = st[i]
      if (!reduceMotion) {
        s.ph += dt * w.rate * k
        s.tail += dt * (2.2 + 4 * k * w.rate) // le battement de queue : une phase qu'on additionne
      }
      w.at(s.ph, s.o)
      // cap = tangente du chemin
      const ahead = [0, 0, 0, 0]
      w.at(s.ph + 0.05, ahead)
      const target = Math.atan2(-(ahead[2] - s.o[2]), ahead[0] - s.o[0])
      if (!s.set || reduceMotion) { s.yaw = target; s.set = true }
      else {
        let d = target - s.yaw
        d -= TAU * Math.round(d / TAU)
        s.yaw += d * Math.min(1, dt * 3.5)
      }
      const sway = reduceMotion ? 0 : Math.sin(s.tail) * 0.07
      const sc = w.s ?? 1
      o.position.set(s.o[0], s.o[1], s.o[2])
      o.rotation.set(0, s.yaw + sway * 0.6, Math.sin(s.ph * 1.7) * 0.04)
      o.scale.setScalar(sc)
      o.updateMatrix()
      body.current.setMatrixAt(i, o.matrix)
      // la queue : attachée à l'arrière du poisson, elle bat autour de l'axe vertical
      t.position.set(-root, 0, 0)
      t.rotation.set(0, reduceMotion ? 0 : Math.sin(s.tail - 0.7) * 0.5, 0)
      t.updateMatrix()
      fin.current.setMatrixAt(i, tmp.m.multiplyMatrices(o.matrix, t.matrix))
    })
    body.current.instanceMatrix.needsUpdate = true
    fin.current.instanceMatrix.needsUpdate = true
  })
  return (
    <>
      <instancedMesh ref={body} args={[geo, fishMat, swimmers.length]} frustumCulled={false} />
      <instancedMesh ref={fin} args={[tailGeo, fishMat, swimmers.length]} frustumCulled={false} />
    </>
  )
}
