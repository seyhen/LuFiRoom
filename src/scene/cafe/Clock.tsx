import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferAttribute, BufferGeometry, Color, DynamicDrawUsage, ExtrudeGeometry, Matrix4, Shape, Sphere, Vector3, type Group } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { isActive, useStore } from '../../state/store'
import { TAU, approach } from '../../math'
import { gummy } from '../materials'
import { Part, SPH, SPH_LO, SPH_MID, cyl, rbox, type V3 } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { LIVE, Static } from '../Static'
import { K } from './materials'
import { dialTex } from './textures'

/**
 * L'horloge à balancier du café, un régulateur de bois et de laiton accroché au mur du fond, entre l'ardoise et la baie : une tête
 * en arche avec son cadran émaillé (chiffres romains, chemin de fer, l'horloger et sa ville), un coffre vitré où le balancier de laiton
 * passe, une base à pendeloque. Les aiguilles (heures, minutes, trotteuse) suivent l'heure de l'appareil, que le son joue ou non.
 * Quand il joue, le balancier va et vient, une seconde par demi-oscillation : il passe au centre au moment même de chaque battement
 * entendu (`pulses.clock`, voir audio/channels/clock.ts) ; sans le son, il pend immobile, l'horloge est arrêtée.
 * Voisin : la clef de remontage, pendue à son clou par un ruban bordeaux. L'objet pose son pied de coffre à (x, 2.15, -2.99).
 */
const AT = { x: -0.43, y: 2.15, z: -2.99 }
const AMP = 0.17 // l'élongation du balancier, en radians
const PIVOT = 0.66 // la hauteur de l'axe du balancier, sous la traverse du haut du coffre
const ROD = 0.4

const glass = gummy(0xdcecff, { roughness: 0.05, clearcoat: 1, transparent: true, opacity: 0.13, depthWrite: false })
const dial = gummy(0xffffff, { map: dialTex, emissive: 0xffffff, emissiveMap: dialTex, emissiveIntensity: 0.1, roughness: 0.55, clearcoat: 0.2 })

// la tête en arche : un rectangle de 0,40 de large coiffé d'un demi-cercle, extrudé, ses arêtes adoucies (une seule pièce)
const head = (() => {
  const s = new Shape(), w = 0.185, r = 0.185, h = 0.2
  s.moveTo(-w, 0)
  s.lineTo(w, 0)
  s.lineTo(w, h)
  s.absarc(0, h, r, 0, Math.PI, false)
  s.lineTo(-w, 0)
  return new ExtrudeGeometry(s, { depth: 0.13, bevelEnabled: true, bevelThickness: 0.015, bevelSize: 0.015, bevelSegments: 2, curveSegments: 28 })
})()

/** Fusionne des formes (géométrie, matrice) en une seule : une aiguille ou le balancier. */
function fuse(list: [BufferGeometry, Matrix4][]) {
  return mergeGeometries(list.map(([g, m]) => g.clone().applyMatrix4(m)))!
}
const at = (x: number, y: number, z: number, sx = 1, sy = 1, sz = 1) => new Matrix4().makeScale(sx, sy, sz).setPosition(x, y, z)

// une aiguille de pendule : tige, losange (la « pomme »), contrepoids court ; elle part le long de +y
const spade = (len: number, w: number) => fuse([
  [rbox(w, len, 0.006, w * 0.35), at(0, len / 2 - 0.02, 0)],
  [SPH_LO, at(0, len * 0.62, 0, w * 1.5, len * 0.1, 0.004)],
  [rbox(w * 1.4, 0.05, 0.006, w * 0.5), at(0, -0.04, 0)],
])
// le balancier : tige de laiton, lentille bombée, petit disque au centre, écrou de réglage sous la lentille
const PENDULUM = fuse([
  [cyl(0.005, 0.005, ROD, 8), at(0, -ROD / 2, 0)],
  [SPH_MID, at(0, -ROD - 0.01, 0, 0.062, 0.062, 0.016)],
  [cyl(0.034, 0.034, 0.03, 18).clone().rotateX(Math.PI / 2), at(0, -ROD - 0.01, 0)],
  [cyl(0.012, 0.012, 0.02, 10), at(0, -ROD + 0.07, 0)],
])
const SECOND = fuse([[rbox(0.005, 0.15, 0.004, 0.002), at(0, 0.045, 0)], [SPH_LO, at(0, -0.03, 0, 0.014, 0.014, 0.004)]])

/**
 * Le mouvement : le balancier et les trois aiguilles en UN seul maillage (un tracé au lieu de quatre). Chaque pièce garde ses sommets
 * relatifs à son axe ; `turn(i, angle)` les fait tourner autour de z et les écrit dans le tampon (quelques milliers de sommets : le
 * balancier à chaque image tant qu'il bat, les aiguilles une fois par seconde). Les couleurs sont dans les sommets.
 */
const WORK = (() => {
  const src: [BufferGeometry, Color, V3][] = [
    [PENDULUM, new Color(0xd9a84a), [0, PIVOT, 0.075]],
    [spade(0.1, 0.014), new Color(0x2a2428), [0, 0.93, 0.176]],
    [spade(0.14, 0.01), new Color(0x2a2428), [0, 0.93, 0.182]],
    [SECOND, new Color(0x8e2f3a), [0, 0.93, 0.188]],
  ]
  const flat = src.map(([g, c, p]) => ({ g: g.toNonIndexed(), c, p }))
  const total = flat.reduce((n, f) => n + f.g.attributes.position.count, 0)
  const pos = new Float32Array(total * 3), nor = new Float32Array(total * 3), col = new Float32Array(total * 3)
  let off = 0
  const parts = flat.map(({ g, c, p }) => {
    const n = g.attributes.position.count, lp = new Float32Array(g.attributes.position.array), ln = new Float32Array(g.attributes.normal.array)
    for (let i = 0; i < n; i++) col.set([c.r, c.g, c.b], (off + i) * 3)
    const part = { off, n, p, lp, ln }
    off += n
    return part
  })
  const geo = new BufferGeometry()
  geo.setAttribute('position', new BufferAttribute(pos, 3).setUsage(DynamicDrawUsage))
  geo.setAttribute('normal', new BufferAttribute(nor, 3).setUsage(DynamicDrawUsage))
  geo.setAttribute('color', new BufferAttribute(col, 3))
  geo.boundingSphere = new Sphere(new Vector3(0, 0.6, 0.1), 0.8)
  const turn = (i: number, a: number) => {
    const { off, n, p, lp, ln } = parts[i], c = Math.cos(a), s = Math.sin(a)
    for (let k = 0; k < n; k++) {
      const j = k * 3, o = (off + k) * 3
      pos[o] = p[0] + lp[j] * c - lp[j + 1] * s
      pos[o + 1] = p[1] + lp[j] * s + lp[j + 1] * c
      pos[o + 2] = p[2] + lp[j + 2]
      nor[o] = ln[j] * c - ln[j + 1] * s
      nor[o + 1] = ln[j] * s + ln[j + 1] * c
      nor[o + 2] = ln[j + 2]
    }
    geo.attributes.position.needsUpdate = true
    geo.attributes.normal.needsUpdate = true
  }
  for (let i = 0; i < parts.length; i++) turn(i, 0)
  return { geo, turn }
})()
const workMat = gummy(0xffffff, { vertexColors: true, roughness: 0.34, clearcoat: 0.8 })

export function Clock() {
  const g = useRef<Group>(null!)
  const st = useRef({ ph: 0, amp: 0, n: 0, synced: false, sec: -1, pend: NaN })
  useSquash('clock', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState()
    // l'heure de l'appareil : les aiguilles ne se redessinent qu'une fois par seconde (la trotteuse saute d'un trait, comme un échappement)
    const d = new Date(), sec = d.getSeconds()
    if (sec !== s.sec) {
      s.sec = sec
      const m = d.getMinutes() + sec / 60
      WORK.turn(1, -(((d.getHours() % 12) + m / 60) / 12) * TAU)
      WORK.turn(2, -(m / 60) * TAU)
      WORK.turn(3, -(sec / 60) * TAU)
    }
    // le balancier : sa phase s'ajoute image après image (une demi-oscillation par seconde), puis se cale sur chaque battement entendu
    const on = isActive(store, 'clock') && !reduceMotion
    s.amp = approach(s.amp, on ? 1 : 0, dt * 0.8)
    const n = store.pulses.clock ?? 0
    if (on) {
      s.ph += dt * Math.PI
      if (n !== s.n) {
        // un battement vient de s'entendre : le balancier est au centre, à un multiple de π près
        const near = Math.round(s.ph / Math.PI) * Math.PI
        s.ph += (near - s.ph) * (s.synced ? 0.35 : 1)
        s.synced = true
      }
    } else s.synced = false
    s.n = n
    const a = Math.sin(s.ph) * AMP * s.amp
    if (Math.abs(a - s.pend) > 1e-4 || Number.isNaN(s.pend)) {
      s.pend = a
      WORK.turn(0, a)
    }
  })
  return (
    <group ref={g} userData={{ id: 'clock' }} position={[AT.x, AT.y, AT.z]}>
      <Static>
        {/* la base : plinthe, moulure, plaque de laiton, pendeloque qui pend dessous */}
        <Part geo={rbox(0.4, 0.1, 0.16, 0.025)} m={K.walnut} p={[0, 0.05, 0.08]} />
        <Part geo={rbox(0.44, 0.03, 0.18, 0.012)} m={K.walnut} p={[0, 0.115, 0.09]} />
        <Part geo={rbox(0.14, 0.036, 0.01, 0.006)} m={K.brass} p={[0, 0.05, 0.163]} castShadow={false} />
        <Part geo={SPH} m={K.brass} scale={[0.03, 0.05, 0.03]} p={[0, -0.04, 0.06]} castShadow={false} />
        <Part geo={cyl(0.008, 0.008, 0.03, 8)} m={K.brass} p={[0, -0.005, 0.06]} castShadow={false} />
        {/* le coffre : deux montants, deux traverses, un fond bordeaux où le laiton se détache */}
        {[-0.17, 0.17].map((x) => <Part key={x} geo={rbox(0.04, 0.6, 0.14, 0.015)} m={K.walnut} p={[x, 0.4, 0.07]} />)}
        <Part geo={rbox(0.38, 0.04, 0.14, 0.012)} m={K.walnut} p={[0, 0.68, 0.07]} />
        <Part geo={rbox(0.38, 0.04, 0.14, 0.012)} m={K.walnut} p={[0, 0.14, 0.07]} />
        <Part geo={rbox(0.31, 0.54, 0.02, 0.006)} m={K.burgundy} p={[0, 0.41, 0.03]} castShadow={false} />
        {/* la serrure du coffre : un bouton de laiton sur le montant de droite */}
        <Part geo={SPH} m={K.brass} scale={0.014} p={[0.17, 0.4, 0.148]} castShadow={false} />
        {/* la corniche entre le coffre et la tête, puis la tête en arche */}
        <Part geo={rbox(0.44, 0.03, 0.18, 0.012)} m={K.walnut} p={[0, 0.715, 0.09]} />
        <Part geo={head} m={K.walnut} p={[0, 0.73, 0.012]} />
        {/* le cadran : le disque émaillé, sa lunette de laiton, l'axe des aiguilles ; le fleuron au sommet */}
        <mesh material={dial} position={[0, 0.93, 0.167]} receiveShadow>
          <circleGeometry args={[0.15, 40]} />
        </mesh>
        <Part m={K.brass} p={[0, 0.93, 0.168]} castShadow={false}>
          <torusGeometry args={[0.157, 0.011, 8, 40]} />
        </Part>
        <Part geo={SPH} m={K.brass} scale={[0.026, 0.026, 0.02]} p={[0, 1.15, 0.07]} castShadow={false} />
        <Part geo={SPH} m={K.brass} scale={[0.012, 0.012, 0.012]} p={[0, 1.18, 0.07]} castShadow={false} />
        {/* la clef de remontage, à droite : clou, ruban bordeaux, anneau, tige et panneton */}
        <Part geo={SPH} m={K.brass} scale={0.011} p={[0.33, 0.72, 0.014]} castShadow={false} />
        <Part geo={rbox(0.016, 0.16, 0.004, 0.002)} m={K.burgundy} p={[0.33, 0.64, 0.016]} castShadow={false} />
        <Part m={K.brass} p={[0.33, 0.5, 0.02]} castShadow={false}>
          <torusGeometry args={[0.04, 0.011, 8, 22]} />
        </Part>
        <Part geo={cyl(0.009, 0.009, 0.15, 8)} m={K.brass} p={[0.33, 0.37, 0.02]} castShadow={false} />
        <Part geo={rbox(0.05, 0.03, 0.012, 0.005)} m={K.brass} p={[0.345, 0.3, 0.02]} castShadow={false} />
      </Static>
      {/* la vitre du coffre, devant le balancier (transparente : hors de <Static>) */}
      <mesh material={glass} position={[0, 0.41, 0.136]} renderOrder={4}>
        <planeGeometry args={[0.3, 0.52]} />
      </mesh>
      {/* le mouvement : balancier derrière la vitre, aiguilles devant le cadran, en un seul maillage */}
      <mesh geometry={WORK.geo} material={workMat} frustumCulled={false} userData={LIVE} />
    </group>
  )
}
