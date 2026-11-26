import { useEffect, useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { MeshPhysicalMaterial, type BufferGeometry, type Group, type Mesh } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { TAU, rand } from '../../math'
import { isActive, useStore } from '../../state/store'
import { reduceMotion, useSquash } from '../anim'
import { blob, cone, ell, pair, type Parts } from '../blob'
import { beads } from '../objects/beads'
import { Leaf } from '../nature/Leaf'
import { Vines } from '../nature/Vines'
import { Part, SPH, cyl, rbox, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { Vessel, innerR } from '../igloo/Vessel'
import { G } from './materials'

// La volière : une cage de fer forgé blanc à toit de pagode vert-de-gris, sur un pied tourné, au fond de la serre à droite. Repère :
// le pied du pied en (0, 0, 0). La porte regarde la caméra (azimut 45°, entre +x et +z).
const R = 0.46 // le rayon de la cage (axe des barreaux)
const FLOOR = 0.52 // le dessus du plateau
const BAR0 = FLOOR + 0.03, H = 0.95, Y0 = BAR0 + H // le bas et le haut des barreaux
const DOME = 0.42 // la hauteur du dôme de nervures au-dessus des barreaux
const LITTER = FLOOR + 0.012 // le dessus du papier du fond
const PA = 0.83, PB = 1.18, PERCH = 0.016 // la hauteur des deux perchoirs (leur axe) et leur rayon
const BARS = Array.from({ length: 8 }, (_, i) => ((22.5 + i * 45) * Math.PI) / 180)
const BIRD_S = 1.3 // les oiseaux sont un peu plus grands que nature, pour se lire de loin

// Les six places où un oiseau se pose : [x, y, z] (ses pieds), l'angle où il fait face une fois posé (toujours le bec vers l'extérieur
// d'un perchoir, la queue vers le milieu, jamais à travers un barreau ; le bec vers la gamelle au sol) et les places où il peut sauter.
type Slot = { p: V3; face: number; reach: number[] }
const SLOTS: Slot[] = [
  { p: [-0.235, PA + PERCH, 0.176], face: Math.PI, reach: [1, 3, 5] }, // 0 : perchoir bas, à gauche
  { p: [0.235, PA + PERCH, 0.176], face: 0, reach: [0, 3, 4] }, // 1 : perchoir bas, à droite
  { p: [-0.176, PB + PERCH, -0.23], face: Math.PI / 2, reach: [3, 4, 5] }, // 2 : perchoir haut, au fond
  { p: [-0.176, PB + PERCH, 0.23], face: -Math.PI / 2, reach: [0, 1, 2] }, // 3 : perchoir haut, devant
  { p: [0.105, LITTER + 0.062, -0.12], face: 0, reach: [1, 2, 5] }, // 4 : le bord de la mangeoire, le bec vers les graines
  { p: [-0.02, LITTER + 0.066, 0.06], face: Math.PI, reach: [0, 2, 4] }, // 5 : le bord de la coupelle d'eau, le bec vers l'eau
]
const FEEDER: V3 = [0.2, 0, -0.12], BATH: V3 = [-0.12, 0, 0.06]

interface Species {
  body: number; belly: number; head: number; wing: number; tail: number; beak: number; leg: number
  cheek?: number; throat?: number
  /** Longueur de la queue, et du bec (1 = parent). */
  tail_?: number; beak_?: number; hook?: boolean
  size: number
}

// Perruche verte à face jaune et joue rose ; tangara bleu au ventre orangé ; tangara écarlate aux ailes noires ; colibri émeraude à gorge rubis.
const SPECIES: Species[] = [
  { body: 0x5bbd4a, belly: 0xa5d95a, head: 0xf2d23c, cheek: 0xf08a8a, wing: 0x2f9a5a, tail: 0x2f78c8, beak: 0xf0663f, leg: 0xe8b8a0, hook: true, size: 1.0 },
  { body: 0x3d7fe0, belly: 0xf29040, head: 0x62d2ea, wing: 0x2658b8, tail: 0x2658b8, beak: 0x35323c, leg: 0x35323c, size: 0.92 },
  { body: 0xe2353c, belly: 0xec4e4a, head: 0xe2353c, wing: 0x23212c, tail: 0x23212c, beak: 0xf0e0b0, leg: 0x6a5a58, size: 0.95 },
  { body: 0x2fb58a, belly: 0xe2efdc, head: 0x1f9a72, throat: 0xe0306a, wing: 0x2a6f5e, tail: 0x1f5f50, beak: 0x2c2a32, leg: 0x2c2a32, beak_: 2.4, tail_: 0.7, size: 0.8 },
]

const FEATHER = [0xf2d23c, 0x62d2ea, 0xe2353c, 0x2fb58a] // la couleur de la plume de chaque oiseau
const HEAD_AT: V3 = [0.045, 0.115, 0] // le pivot de la tête, en bas du cou

function unify(g: BufferGeometry) {
  for (const n of Object.keys(g.attributes)) if (n !== 'position' && n !== 'normal' && n !== 'color' && n !== 'uv') g.deleteAttribute(n)
  return g
}

/** Les deux maillages d'un oiseau d'une seule peau : le corps (ailes repliées, queue, pattes) et la tête (bec, joues, yeux). */
function makeBird(s: Species): { body: BufferGeometry; head: BufferGeometry } {
  const tl = s.tail_ ?? 1, bl = s.beak_ ?? 1
  const body: Parts = [
    ell([0, 0.075, 0], [0.062, 0.055, 0.048], { color: s.body, rot: [0, 0, 0.6] }),
    ell([0.014, 0.06, 0], [0.05, 0.044, 0.043], { color: s.belly, k: 0.04, rot: [0, 0, 0.5] }),
    // les ailes repliées le long des flancs, bout sur la queue
    pair(ell([-0.02, 0.086, 0.037], [0.06, 0.026, 0.014], { color: s.wing, rot: [0, 0, 0.5], k: 0.02 })),
    // la queue : une palette plate qui part vers l'arrière, un peu vers le bas
    ell([-0.075 - 0.025 * tl, 0.062 - 0.012 * tl, 0], [0.04 + 0.04 * tl, 0.011, 0.026], { color: s.tail, rot: [0, 0, 0.28], k: 0.025 }),
    // les pattes, deux orteils posés sur le perchoir
    pair(cone([0, 0.048, 0.022], [0.004, 0.006, 0.022], 0.0105, 0.0095, { color: s.leg, k: 0.012 })),
    pair(ell([0.016, 0.009, 0.022], [0.024, 0.0095, 0.011], { color: s.leg, k: 0.012 })),
  ]
  const head: Parts = [
    ell([0.012, 0.03, 0], [0.05, 0.045, 0.043], { color: s.head, k: 0.04 }),
    // le bec : un cône qui s'effile, crochu pour la perruche
    cone([0.05, 0.03, 0], [0.058 + 0.026 * bl, s.hook ? 0.012 : 0.024, 0], s.hook ? 0.024 : 0.019, 0.0095, { color: s.beak, k: 0.012 }),
    s.cheek ? pair(ell([0.022, 0.02, 0.03], [0.026, 0.02, 0.015], { color: s.cheek, k: 0.02 })) : [],
    s.throat ? ell([0.034, 0.008, 0], [0.026, 0.016, 0.026], { color: s.throat, k: 0.02 }) : [],
  ]
  const eyes = beads([-1, 1].flatMap((z) => [
    { c: [0.03, 0.042, z * 0.034] as V3, r: 0.0125, color: 0x241f2a },
    { c: [0.038, 0.049, z * 0.0375] as V3, r: 0.0042, color: 0xffffff },
  ]), 10)
  const h = blob(head, { h: 0.0075, k: 0.035 })
  const merged = mergeGeometries([unify(h), unify(eyes)], false)
  h.dispose()
  eyes.dispose()
  return { body: blob(body, { h: 0.0075, k: 0.04 }), head: merged }
}

interface Bird {
  slot: number
  from: V3
  to: V3
  t: number
  dur: number
  arc: number
  next: number
  ry: number
  ryT: number
  tilt: number
  tiltT: number
  look: number
  lookT: number
  wait: number
  pitch: number
  song: number
  land: number
  peck: number
}

const wrap = (a: number) => a - TAU * Math.round(a / TAU)

/** Une feuille de lierre : ovale, un peu penchée. */
function Ivy({ at, up = 0 }: { at: V3; up?: number }) {
  return (
    <group position={at} rotation-y={up}>
      <Leaf kind="heart" r={[0.5, 0, 0]} w={0.026} l={0.07} m={G.leaf} />
    </group>
  )
}

/** Le lierre qui grimpe sur un barreau : une tige, des feuilles qui alternent de chaque côté. */
function Climber({ angle }: { angle: number }) {
  const r = R + 0.026, c = Math.cos(angle), s = Math.sin(angle)
  const ys = [0.2, 0.32, 0.44, 0.56, 0.68, 0.8]
  return (
    <group>
      <Part geo={cyl(0.007, 0.009, 0.7, 5)} m={G.leaf} p={[c * r, BAR0 + 0.4, s * r]} castShadow={false} />
      {ys.map((y, i) => {
        const side = i % 2 ? 1 : -1, ry = Math.atan2(-s, c) + Math.PI / 2 + side * (0.9 + (i % 3) * 0.2)
        return <Ivy key={i} at={[c * (r + 0.005), BAR0 + y - 0.1, s * (r + 0.005)]} up={ry} />
      })}
    </group>
  )
}

/**
 * La volière de la serre, objet « oiseaux de la forêt » : une cage ronde de fer forgé blanc (huit barreaux gros comme le doigt, trois
 * anneaux) à toit de pagode vert-de-gris et perles de laiton, sur un pied tourné et un plateau. Dedans : deux perchoirs de bois
 * qui s'appuient aux barreaux, une mangeoire de graines, une coupelle d'eau, un papier de fond avec des plumes tombées, une clochette
 * de laiton ; dehors, un pot de lierre au bord du plateau dont une tige grimpe le long d'un barreau. Quatre oiseaux (perruche,
 * tangara bleu, tangara écarlate, colibri) d'une seule peau, de la taille d'une main.
 * Quand le chœur chante (`pulses.aviary`), un oiseau penche la tête et chante, et ils sautillent de perchoir en perchoir sans jamais
 * décoller ; une plume tombe de temps en temps ; la porte oscille un peu. `position` est le pied du pied.
 */
export function Aviary({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), door = useRef<Group>(null!), feather = useRef<Mesh>(null!)
  const birdRefs = useRef<Group[]>([]), headRefs = useRef<Group[]>([])
  useSquash('aviary', g)
  const geos = useMemo(() => SPECIES.map(makeBird), [])
  useEffect(() => () => geos.forEach((b) => { b.body.dispose(); b.head.dispose() }), [geos])
  const featherGeo = useMemo(() => SPH.clone().scale(0.045, 0.004, 0.013), [])
  useEffect(() => () => featherGeo.dispose(), [featherGeo])
  const featherMat = useMemo(() => new MeshPhysicalMaterial({ color: 0xffffff, roughness: 0.5, clearcoat: 0.3 }), [])
  useEffect(() => () => featherMat.dispose(), [featherMat])

  const st = useRef<{ birds: Bird[]; seen: number; sing: number; ph: number; amp: number; fPh: number; fState: number; fT: number; fNext: number; fPos: V3 }>(null!)
  if (!st.current) {
    const start = [0, 3, 1, 2]
    st.current = {
      birds: SPECIES.map((_, i): Bird => {
        const p = SLOTS[start[i]].p
        return { slot: start[i], from: p, to: p, t: 1, dur: 0.4, arc: 0.08, next: rand(0.5, 2.5), ry: SLOTS[start[i]].face, ryT: SLOTS[start[i]].face, tilt: 0, tiltT: 0, look: 0, lookT: 0, wait: rand(0.5, 2), pitch: 0, song: 0, land: 0, peck: rand(0, 6) }
      }),
      seen: useStore.getState().pulses.aviary ?? 0, sing: 0, ph: 0, amp: 0, fPh: 0, fState: 0, fT: 0, fNext: rand(5, 9), fPos: [0, 0, 0],
    }
  }

  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, store = useStore.getState()
    const on = isActive(store, 'aviary') && !reduceMotion
    const n = store.pulses.aviary ?? 0
    // un chant entendu : un oiseau, au hasard, penche la tête et chante ; parfois il saute sur une autre place
    const heard = n !== s.seen
    if (heard) {
      s.seen = n
      if (on) {
        const b = s.birds[Math.floor(Math.random() * s.birds.length)]
        b.song = 1
        if (b.t >= 1 && Math.random() < 0.45) b.next = 0
      }
    }
    const taken = (k: number) => s.birds.some((b) => b.slot === k)
    s.birds.forEach((b, i) => {
      // où il va : le saut est court et bas, jamais un envol
      if (on && b.t >= 1) {
        b.next -= dt
        if (b.next <= 0) {
          const free = SLOTS[b.slot].reach.filter((k) => !taken(k))
          b.next = rand(2.2, 6)
          if (free.length) {
            const to = free[Math.floor(Math.random() * free.length)]
            b.from = SLOTS[b.slot].p
            b.to = SLOTS[to].p
            b.slot = to
            const d = Math.hypot(b.to[0] - b.from[0], b.to[1] - b.from[1], b.to[2] - b.from[2])
            b.dur = 0.3 + d * 0.7
            b.arc = 0.03 + Math.min(0.07, d * 0.18)
            b.t = 0
            b.ryT = SLOTS[to].face // il se tourne déjà comme il se posera : la queue ne passe jamais dans un barreau
          }
        }
      }
      let k = 1
      if (b.t < 1) {
        b.t = Math.min(1, b.t + dt / b.dur)
        k = b.t * b.t * (3 - 2 * b.t)
        if (b.t >= 1) {
          b.land = 1
          // posé, il se tourne comme la place l'exige
          b.ryT = SLOTS[b.slot].face
        }
      }
      const grp = birdRefs.current[i], head = headRefs.current[i]
      const x = b.from[0] + (b.to[0] - b.from[0]) * k, z = b.from[2] + (b.to[2] - b.from[2]) * k
      const y = b.from[1] + (b.to[1] - b.from[1]) * k + Math.sin(k * Math.PI) * b.arc * (b.t < 1 ? 1 : 0)
      grp.position.set(x, y, z)
      b.ry += Math.max(-dt * 9, Math.min(dt * 9, wrap(b.ryT - b.ry)))
      grp.rotation.y = b.ry
      b.land = Math.max(0, b.land - dt * 4)
      b.song = Math.max(0, b.song - dt * 1.5)
      const song = Math.sin(Math.min(1, b.song * 1.4) * Math.PI)
      const sz = SPECIES[i].size * BIRD_S
      grp.scale.set(sz * (1 + song * 0.03), sz * (1 - Math.sin(b.land * Math.PI) * 0.07 + song * 0.04), sz)
      // la tête : penchée de côté, tournée, relevée pour chanter, qui picore à la mangeoire
      if (on) {
        b.wait -= dt
        if (b.wait <= 0) {
          const calm = Math.random() < 0.3
          b.tiltT = calm ? 0 : rand(-0.55, 0.55)
          b.lookT = calm ? 0 : rand(-0.7, 0.7)
          b.wait = rand(0.9, 2.8)
        }
      } else { b.tiltT = 0; b.lookT = 0 }
      const f = 1 - Math.exp(-dt * 8)
      b.tilt += (b.tiltT - b.tilt) * f
      b.look += (b.lookT - b.look) * f
      b.peck += dt * 9
      const pecking = on && b.t >= 1 && b.slot === 4 ? Math.max(0, Math.sin(b.peck)) : 0
      b.pitch += ((song * 0.5 - pecking * 0.65) - b.pitch) * f
      head.rotation.set(b.tilt, b.look * (1 - song), b.pitch)
    })

    // la porte oscille un peu, quand on écoute
    s.amp += ((on ? 1 : 0) - s.amp) * (1 - Math.exp(-dt * 2))
    s.ph += dt * 0.85
    door.current.rotation.y = -(0.5 + 0.5 * Math.sin(s.ph)) * 0.075 * s.amp

    // une plume tombe de temps en temps d'un oiseau perché sur le perchoir bas ou au fond, et se pose sur le papier
    const fe = feather.current
    if (s.fState === 0) {
      fe.visible = false
      if (on) {
        s.fNext -= dt
        if (s.fNext <= 0) {
          const from = s.birds.filter((b) => b.t >= 1 && b.slot <= 2)
          if (from.length) {
            const b = from[Math.floor(Math.random() * from.length)], i = s.birds.indexOf(b)
            featherMat.color.setHex(FEATHER[i])
            s.fPos = [b.to[0], b.to[1] + 0.07, b.to[2]]
            s.fState = 1
            s.fPh = rand(0, TAU)
            s.fT = 0
            fe.visible = true
          }
          s.fNext = rand(14, 28)
        }
      }
    } else {
      s.fPh += dt * 2.2
      if (s.fState === 1) {
        s.fPos[1] -= dt * 0.11
        const sway = Math.sin(s.fPh) * 0.03
        fe.position.set(s.fPos[0] + sway, s.fPos[1], s.fPos[2] + Math.cos(s.fPh * 0.7) * 0.015)
        fe.rotation.set(Math.sin(s.fPh) * 0.6, s.fPh * 0.4, Math.cos(s.fPh) * 0.9)
        fe.scale.setScalar(1)
        if (s.fPos[1] <= LITTER + 0.008) { s.fState = 2; s.fT = 0 }
      } else {
        // posée à plat sur le papier, elle y reste un moment, puis s'efface en rapetissant
        s.fT += dt
        fe.position.y = LITTER + 0.006
        fe.rotation.set(0, fe.rotation.y, 0)
        fe.scale.setScalar(s.fT < 5 ? 1 : Math.max(0, 1 - (s.fT - 5)))
        if (s.fT > 6) { s.fState = 0; fe.visible = false }
      }
    }
  })

  const ringAt = (a: number, r: number): V3 => [Math.cos(a) * r, 0, Math.sin(a) * r]
  return (
    <group ref={g} userData={{ id: 'aviary' }} position={position}>
      <Static>
        {/* le pied : socle de pierre, bague, bulbe tourné, fût, collerette, plateau de fer */}
        <Part geo={cyl(0.6, 0.64, 0.07, 32)} m={G.stone} p={[0, 0.035, 0]} />
        <Part m={G.verdi} p={[0, 0.082, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[0.56, 0.024, 8, 32]} />
        </Part>
        <Part geo={SPH} m={G.verdi} scale={[0.15, 0.075, 0.15]} p={[0, 0.17, 0]} />
        <Part geo={cyl(0.055, 0.075, 0.2, 14)} m={G.verdi} p={[0, 0.3, 0]} />
        <Part m={G.brass} p={[0, 0.235, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.07, 0.014, 8, 20]} />
        </Part>
        <Part geo={SPH} m={G.verdi} scale={[0.12, 0.045, 0.12]} p={[0, 0.42, 0]} />
        <Part geo={cyl(0.62, 0.6, 0.06, 32)} m={G.verdi} p={[0, FLOOR - 0.03, 0]} />
        <Part m={G.brass} p={[0, FLOOR - 0.03, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[0.617, 0.011, 6, 32]} />
        </Part>

        {/* le fond de la cage : un papier clair, des plumes tombées, un petit tas de graines */}
        <Part geo={cyl(R, R, 0.012, 28)} m={G.cream} p={[0, FLOOR + 0.006, 0]} castShadow={false} />
        <Part geo={SPH} m={G.seed} scale={[0.05, 0.008, 0.012]} p={[0.22, LITTER + 0.004, 0.2]} rotation-y={0.6} castShadow={false} />
        <Part geo={SPH} m={G.cage} scale={[0.04, 0.007, 0.011]} p={[-0.24, LITTER + 0.004, -0.22]} rotation-y={2.2} />
        {[[0.06, 0.14], [0.12, 0.17], [0.03, 0.23]].map(([x, z], i) => (
          <Part key={i} geo={SPH} m={G.seed} scale={[0.02, 0.008, 0.012]} p={[x, LITTER + 0.004, z]} rotation-y={i * 1.7} castShadow={false} />
        ))}

        {/* la cage : l'anneau du bas, huit barreaux, un anneau au milieu, un en haut */}
        <Part m={G.cage} p={[0, BAR0, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[R, 0.026, 8, 40]} />
        </Part>
        {BARS.map((a, i) => (
          <Part key={i} geo={cyl(0.02, 0.02, H, 8)} m={G.cage} p={[Math.cos(a) * R, BAR0 + H / 2, Math.sin(a) * R]} />
        ))}
        <Part m={G.cage} p={[0, BAR0 + 0.4, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[R, 0.017, 6, 40]} />
        </Part>
        <Part m={G.cage} p={[0, Y0, 0]} rotation-x={Math.PI / 2}>
          <torusGeometry args={[R, 0.024, 8, 40]} />
        </Part>
        {/* les perchoirs : du bois clair, d'un barreau à l'autre, bouts de laiton */}
        <Part geo={cyl(PERCH, PERCH, 0.86, 8)} m={G.perch} p={[0, PA, 0.176]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(PERCH, PERCH, 0.86, 8)} m={G.perch} p={[-0.176, PB, 0]} rotation-x={Math.PI / 2} castShadow={false} />
        {/* les barreaux qui recevront les perchoirs : un anneau de laiton à chaque bout */}
        {[[-0.4, PA, 0.176, 'x'], [0.4, PA, 0.176, 'x'], [-0.176, PB, -0.4, 'z'], [-0.176, PB, 0.4, 'z']].map(([x, y, z, ax], i) => (
          <Part key={i} geo={cyl(0.024, 0.024, 0.02, 10)} m={G.brass} p={[x as number, y as number, z as number]} rotation-z={ax === 'x' ? Math.PI / 2 : 0} rotation-x={ax === 'z' ? Math.PI / 2 : 0} castShadow={false} />
        ))}
        {/* la mangeoire et la coupelle d'eau sur le papier */}
        <Vessel p={[FEEDER[0], LITTER, FEEDER[2]]} rt={0.09} rb={0.07} h={0.055} m={G.verdi} inner={G.bowlIn} rim={G.brass} t={0.008} />
        <Part geo={SPH} m={G.seed} scale={[0.068, 0.034, 0.068]} p={[FEEDER[0], LITTER + 0.034, FEEDER[2]]} castShadow={false} />
        <Vessel p={[BATH[0], LITTER, BATH[2]]} rt={0.1} rb={0.08} h={0.06} m={G.cream} inner={G.bowlIn} rim={G.cream} t={0.008} />
        <Part geo={cyl(innerR(0.1, 0.08, 0.06, 0.044, 0.008), innerR(0.1, 0.08, 0.06, 0.044, 0.008), 0.008, 22)} m={G.barrelWater} p={[BATH[0], LITTER + 0.044, BATH[2]]} castShadow={false} />

        {/* la clochette de laiton, pendue sous le toit au bout d'une cordelette */}
        <Part geo={cyl(0.004, 0.004, 0.2, 5)} m={G.perch} p={[0.12, Y0 - 0.1, -0.02]} castShadow={false} />
        <Part geo={SPH} m={G.brass} scale={[0.03, 0.034, 0.03]} p={[0.12, Y0 - 0.22, -0.02]} castShadow={false} />
        <Part geo={SPH} m={G.brass} scale={0.009} p={[0.12, Y0 - 0.255, -0.02]} castShadow={false} />

        {/* le dôme : huit nervures qui se rejoignent au sommet, une couronne de laiton, une perle au bout de chaque barreau ; au sommet, un petit toit de pagode */}
        {BARS.map((a, i) => (
          <group key={i} position={[0, Y0, 0]} rotation-y={-a} scale={[1, DOME / R, 1]}>
            <Part m={G.cage}>
              <torusGeometry args={[R, 0.02, 6, 16, Math.PI / 2]} />
            </Part>
          </group>
        ))}
        <Part m={G.brass} p={[0, Y0 + DOME * 0.62, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[R * 0.785, 0.013, 6, 32]} />
        </Part>
        {BARS.map((a, i) => (
          <Part key={i} geo={SPH} m={G.brass} scale={0.032} p={[Math.cos(a) * R, Y0 + 0.03, Math.sin(a) * R]} castShadow={false} />
        ))}
        <Part geo={cyl(0.02, 0.17, 0.1, 24)} m={G.verdi} p={[0, Y0 + DOME + 0.04, 0]} />
        <Part geo={cyl(0.18, 0.18, 0.016, 24)} m={G.brass} p={[0, Y0 + DOME - 0.004, 0]} castShadow={false} />
        <Part geo={cyl(0.012, 0.03, 0.07, 14)} m={G.verdi} p={[0, Y0 + DOME + 0.115, 0]} />
        <Part geo={SPH} m={G.brass} scale={0.04} p={[0, Y0 + DOME + 0.17, 0]} castShadow={false} />
        <Part geo={cyl(0.004, 0.012, 0.1, 6)} m={G.brass} p={[0, Y0 + DOME + 0.24, 0]} castShadow={false} />

        {/* le pot de lierre au bord du plateau : terre, tiges qui retombent, une tige qui grimpe le long d'un barreau */}
        <group position={[ringAt(BARS[7], 0.555)[0], FLOOR, ringAt(BARS[7], 0.555)[2]]}>
          <Part geo={cyl(0.06, 0.045, 0.075, 16)} m={G.terracotta} p={[0, 0.0375, 0]} castShadow={false} />
          <Part geo={cyl(0.066, 0.066, 0.016, 16)} m={G.terracotta} p={[0, 0.072, 0]} castShadow={false} />
          <Part geo={cyl(0.052, 0.052, 0.006, 16)} m={G.terracotta} p={[0, 0.078, 0]} castShadow={false} />
          <Vines p={[0.03, 0.07, 0.03]} strands={[[0.03, 0.03, 0.42], [0.025, 0.0, 0.3]]} m={G.leaf} m2={G.leafDark} size={0.07} crown={4} seed={7} />
        </group>
        <Climber angle={BARS[7]} />
      </Static>

      {/* la porte : un cadre de fer sur une charnière, entre deux barreaux, face à la caméra ; elle oscille un peu */}
      <group position={[Math.cos(BARS[0]) * R, BAR0, Math.sin(BARS[0]) * R]} rotation-y={-Math.PI * 0.75} userData={LIVE}>
        <group ref={door}>
         <Static>
          <group position={[0, 0, -0.034]}>
            <Part geo={rbox(0.022, 0.56, 0.018, 0.007)} m={G.cage} p={[0.038, 0.4, 0]} />
            <Part geo={rbox(0.022, 0.56, 0.018, 0.007)} m={G.cage} p={[0.314, 0.4, 0]} />
            <Part geo={rbox(0.3, 0.022, 0.018, 0.007)} m={G.cage} p={[0.176, 0.13, 0]} />
            <Part geo={rbox(0.3, 0.022, 0.018, 0.007)} m={G.cage} p={[0.176, 0.67, 0]} />
            <Part geo={cyl(0.012, 0.012, 0.54, 6)} m={G.cage} p={[0.176, 0.4, 0]} />
            {/* le loquet de laiton et les deux charnières */}
            <Part geo={rbox(0.03, 0.05, 0.03, 0.01)} m={G.brass} p={[0.314, 0.4, -0.012]} castShadow={false} />
            {[0.2, 0.6].map((y) => <Part key={y} geo={rbox(0.05, 0.02, 0.024, 0.008)} m={G.brass} p={[0.03, y, 0]} castShadow={false} />)}
          </group>
         </Static>
        </group>
        {/* les colliers de la charnière autour du barreau */}
        <Static>
          {[0.2, 0.6].map((y) => <Part key={y} geo={cyl(0.027, 0.027, 0.03, 10)} m={G.brass} p={[0, y, 0]} castShadow={false} />)}
        </Static>
      </group>

      {/* les quatre oiseaux, d'une seule peau : corps, tête qui bouge */}
      {SPECIES.map((_, i) => (
        <group key={i} ref={(el) => void (el && (birdRefs.current[i] = el))} position={SLOTS[st.current.birds[i].slot].p} rotation-y={st.current.birds[i].ry} scale={SPECIES[i].size * BIRD_S} userData={LIVE}>
          <Part geo={geos[i].body} m={G.bird} castShadow={false} />
          <group ref={(el) => void (el && (headRefs.current[i] = el))} position={HEAD_AT}>
            <Part geo={geos[i].head} m={G.bird} castShadow={false} />
          </group>
        </group>
      ))}

      {/* la plume qui tombe */}
      <mesh ref={feather} geometry={featherGeo} material={featherMat} visible={false} userData={LIVE} raycast={() => {}} />
    </group>
  )
}
