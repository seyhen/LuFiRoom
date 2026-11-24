import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { InstancedBufferAttribute, type InstancedMesh } from 'three'
import { clamp, rand } from '../../../math'
import { mood, reduceMotion } from '../../anim'
import { useEvery } from '../../life'
import { SPH_MID, noRay, type V3 } from '../../parts'
import { bubbleMaterial } from './materials'
import { ROOM, S, type View } from './layout'

// Les bulles de savon qui dérivent dans le ciel : une seule série instanciée (un tracé) pour toutes les bulles libres et pour les petites bulles
// des éclats (une bulle qui crève, une goutte de pluie qui touche la mousse). Elles montent lentement (la phase de leur balancement s'additionne
// image après image), crèvent de loin en loin et renaissent plus bas, ailleurs. Leur place est choisie à l'écran : jamais devant la pièce (une
// bulle dans sa silhouette passe forcément derrière elle), jamais sur une grosse bulle. Rien ne bouge avec `prefers-reduced-motion`.

const NB = 84, NP = 46

interface Bub {
  sx: number
  sy: number
  sy0: number
  dz0: number
  r: number
  vy: number
  ph: number
  w: number
  amp: number
  hue: number
  /** 0 : libre ; 1 : elle crève. */
  state: 0 | 1
  t: number
}
interface Drop {
  on: boolean
  p: V3
  v: V3
  r: number
  t: number
  life: number
}

/** Les rayons : beaucoup de petites bulles, des moyennes, quelques grandes. */
function radius() {
  const u = Math.random()
  return u < 0.45 ? rand(0.12, 0.28) : u < 0.85 ? rand(0.3, 0.6) : rand(0.65, 1.1)
}

export interface Keep {
  sx: number
  sy: number
  r: number
}

export function Bubbles({ view, spots, caps, keep }: { view: View; spots: V3[]; caps: () => V3[]; keep: Keep[] }) {
  const n = clamp(Math.round(((view.r - view.l) * (view.t - view.b)) / 9), 36, NB)
  const geo = useMemo(() => {
    const g = SPH_MID.clone()
    g.setAttribute('aLife', new InstancedBufferAttribute(new Float32Array(NB + NP), 1))
    g.setAttribute('aHue', new InstancedBufferAttribute(new Float32Array(NB + NP), 1))
    return g
  }, [])
  const mat = useMemo(() => bubbleMaterial(8.5, 21), [])
  useEffect(() => () => { geo.dispose(); mat.dispose() }, [geo, mat])
  const mesh = useRef<InstancedMesh>(null!)

  const spawn = (b: Bub, anywhere: boolean) => {
    b.r = radius()
    for (let k = 0; k < 8; k++) {
      b.sx = rand(view.l - 1, view.r + 1)
      b.sy = anywhere ? rand(view.b - b.r, view.t + b.r) : view.b - b.r - rand(0.2, 3)
      if (!keep.some((o) => Math.hypot(o.sx - b.sx, o.sy - b.sy) < o.r + b.r + 0.35)) break
    }
    // une bulle qui passe dans la silhouette de la pièce reste derrière elle pendant toute la montée (la profondeur gagne 0,57 par unité d'écran)
    const band = Math.abs(b.sx) < ROOM.half + b.r + 0.25
    b.dz0 = band ? Math.min(-rand(5, 15), -4.8 - 0.571 * Math.max(0, view.t + b.r + 1 - b.sy)) : rand(-14, 5)
    b.sy0 = b.sy
    b.vy = rand(0.09, 0.3) * (b.r > 0.6 ? 0.6 : 1)
    b.ph = rand(0, 6.3)
    b.w = rand(0.25, 0.7)
    b.amp = rand(0.08, 0.3) * (1 + b.r)
    b.hue = Math.random()
    b.state = 0
    b.t = 0
  }
  const st = useMemo(() => {
    const bubs: Bub[] = Array.from({ length: n }, () => ({ sx: 0, sy: 0, sy0: 0, dz0: 0, r: 0, vy: 0, ph: 0, w: 0, amp: 0, hue: 0, state: 0, t: 0 }))
    bubs.forEach((b) => spawn(b, true))
    const pool: Drop[] = Array.from({ length: NP }, () => ({ on: false, p: [0, 0, 0], v: [0, 0, 0], r: 0, t: 0, life: 1 }))
    return { bubs, pool, splash: 0, next: 0 }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [n, view.l, view.r, view.t, view.b, keep])

  const emit = (p: V3, v: V3, r: number, life: number) => {
    for (let k = 0; k < NP; k++) {
      const d = st.pool[(st.next + k) % NP]
      if (d.on) continue
      st.next = (st.next + k + 1) % NP
      d.on = true; d.t = 0; d.life = life; d.r = r
      d.p[0] = p[0]; d.p[1] = p[1]; d.p[2] = p[2]
      d.v[0] = v[0]; d.v[1] = v[1]; d.v[2] = v[2]
      return
    }
  }
  const at = (b: Bub): V3 => S(b.sx + Math.sin(b.ph) * b.amp, b.sy, b.dz0 + 0.571 * (b.sy - b.sy0))

  // de loin en loin, une bulle visible et pas trop grosse crève : un petit éclat de bulles, puis elle renaît plus bas
  useEvery(5, 12, () => {
    const live = st.bubs.filter((b) => b.state === 0 && b.r < 0.9 && b.sy > view.b + 1 && b.sy < view.t - 0.5 && Math.abs(b.sx) < view.r - 0.5)
    if (!live.length) return
    const b = live[Math.floor(Math.random() * live.length)], p = at(b)
    b.state = 1
    b.t = 0
    const k = 5 + Math.floor(b.r * 6)
    for (let i = 0; i < k; i++) {
      const a = (i / k) * 6.283 + Math.random(), s = rand(0.5, 1.2)
      emit(p, [Math.cos(a) * s, rand(-0.2, 0.6), Math.sin(a) * s], rand(0.035, 0.07) + b.r * 0.06, rand(0.45, 0.8))
    }
  })

  useFrame((_, delta) => {
    const dt = reduceMotion ? 0 : Math.min(delta, 0.05), m = mesh.current
    const arr = m.instanceMatrix.array as Float32Array
    const life = geo.attributes.aLife as InstancedBufferAttribute, hue = geo.attributes.aHue as InstancedBufferAttribute
    const put = (i: number, p: V3, s: number) => {
      const o = i * 16
      arr[o] = s; arr[o + 1] = 0; arr[o + 2] = 0; arr[o + 3] = 0
      arr[o + 4] = 0; arr[o + 5] = s; arr[o + 6] = 0; arr[o + 7] = 0
      arr[o + 8] = 0; arr[o + 9] = 0; arr[o + 10] = s; arr[o + 11] = 0
      arr[o + 12] = p[0]; arr[o + 13] = p[1]; arr[o + 14] = p[2]; arr[o + 15] = 1
    }
    for (let i = 0; i < NB; i++) {
      if (i >= st.bubs.length) { life.setX(i, 0); put(i, [0, -90, 0], 0); continue }
      const b = st.bubs[i]
      let a = 1, s = b.r
      if (b.state === 0) {
        b.sy += b.vy * dt
        b.ph += b.w * dt
        if (b.sy > view.t + b.r + 1) spawn(b, false)
      } else {
        b.t += dt / 0.26
        a = Math.max(0, 1 - b.t) ** 1.5
        s = b.r * (1 + 0.4 * b.t)
        if (b.t >= 1) spawn(b, false)
      }
      put(i, at(b), s)
      life.setX(i, a)
      hue.setX(i, b.hue)
    }
    // les petites bulles des éclats : elles montent un peu, s'élargissent, s'éteignent
    for (let k = 0; k < NP; k++) {
      const d = st.pool[k], i = NB + k
      if (!d.on) { life.setX(i, 0); put(i, [0, -90, 0], 0); continue }
      d.t += dt / d.life
      d.p[0] += d.v[0] * dt; d.p[1] += d.v[1] * dt; d.p[2] += d.v[2] * dt
      d.v[0] *= 1 - dt * 1.5; d.v[2] *= 1 - dt * 1.5; d.v[1] = d.v[1] * (1 - dt * 1.2) + dt * 0.25
      if (d.t >= 1) { d.on = false; life.setX(i, 0); put(i, [0, -90, 0], 0); continue }
      put(i, d.p, d.r * (1 + d.t * 0.4))
      life.setX(i, (1 - d.t) ** 1.2)
      hue.setX(i, (k * 0.137) % 1)
    }
    m.instanceMatrix.needsUpdate = true
    life.needsUpdate = true
    hue.needsUpdate = true
    // la pluie qui touche la mousse (ou une grosse bulle) crève en petites bulles : autant d'éclats que la pluie est forte
    const wet = Math.max(mood.rain, mood.storm * 0.9) * (1 - mood.snow)
    if (wet > 0.03 && dt > 0) {
      st.splash += dt * wet * 26
      while (st.splash >= 1) {
        st.splash -= 1
        const c = caps(), p = Math.random() < 0.25 && c.length ? c[Math.floor(Math.random() * c.length)] : spots[Math.floor(Math.random() * spots.length)]
        if (!p) break
        for (let i = 0; i < 2; i++) emit([p[0] + rand(-0.12, 0.12), p[1] + 0.03, p[2] + rand(-0.12, 0.12)], [rand(-0.4, 0.4), rand(0.7, 1.3), rand(-0.4, 0.4)], rand(0.04, 0.09), rand(0.5, 0.85))
      }
    }
  })
  return <instancedMesh ref={mesh} args={[geo, mat, NB + NP]} frustumCulled={false} renderOrder={2} raycast={noRay} />
}
