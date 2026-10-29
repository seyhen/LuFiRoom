import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Mesh, MeshBasicMaterial, Quaternion, Raycaster, Vector3, type BufferGeometry, type Group } from 'three'
import { rand } from '../../math'
import { blob, ell } from '../blob'
import { gummy } from '../materials'
import { canvasTex } from '../paint'
import { Part, SPH, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { reduceMotion } from '../anim'
import { I } from './materials'

/** Les deux pelages : rose bonbon, et bleu glacier. Le ventre et le masque crème, le bec et les pattes orange, les joues roses, pour tous les deux. */
const COATS = { pink: 0xf29ac0, blue: 0x6fa8e6 }
const CREAM = '#fff3e4', BEAK = 0xf7a23a

// Le dessin du pelage (ventre, masque, joues) est une texture projetée de face sur la peau : nette, quelle que soit la finesse du maillage.
// x ∈ [-0,2 ; 0,2] sur la largeur, y ∈ [0 ; 0,65] sur la hauteur. Le dos lit la bande du haut de la texture (la couleur du pelage), les côtés sont hors du dessin.
const TEX_W = 0.4, TEX_H = 0.65, TEX_PX = 512
function coatTex(coat: number) {
  const col = '#' + coat.toString(16).padStart(6, '0')
  return canvasTex(TEX_PX, TEX_PX, (c) => {
    const X = (x: number) => ((x + TEX_W / 2) / TEX_W) * TEX_PX, Y = (y: number) => (1 - y / TEX_H) * TEX_PX, R = (r: number) => (r / TEX_W) * TEX_PX
    const blot = (x: number, y: number, rx: number, ry: number, fill: string | CanvasGradient) => {
      c.fillStyle = fill
      c.beginPath()
      c.ellipse(X(x), Y(y), R(rx), R(ry), 0, 0, Math.PI * 2)
      c.fill()
    }
    c.fillStyle = col
    c.fillRect(0, 0, TEX_PX, TEX_PX)
    // le ventre, un peu plus clair au centre et ombré vers le bas, et le masque crème qui couvre tout le devant de la tête
    const bg = c.createLinearGradient(0, Y(0.34), 0, Y(0.04))
    bg.addColorStop(0, CREAM); bg.addColorStop(0.55, '#fff0df'); bg.addColorStop(1, '#f4e2cf')
    blot(0, 0.19, 0.138, 0.15, bg)
    blot(0, 0.475, 0.128, 0.105, CREAM)
    // les joues roses : une tache douce de chaque côté, sous les yeux
    for (const sd of [-1, 1]) {
      const g = c.createRadialGradient(X(sd * 0.092), Y(0.428), 0, X(sd * 0.092), Y(0.428), R(0.036))
      g.addColorStop(0, 'rgba(255,128,168,0.95)'); g.addColorStop(0.6, 'rgba(255,128,168,0.7)'); g.addColorStop(1, 'rgba(255,128,168,0)')
      blot(sd * 0.092, 0.428, 0.036, 0.03, g)
    }
  })
}
const TEXS = { pink: coatTex(COATS.pink), blue: coatTex(COATS.blue) }
// Une petite lueur de leur propre couleur : la nuit, la lumière bleue ferait virer le rose au violet (la texture est aussi l'émission :
// le ventre crème brille crème, le rose rose).
const SKINS = {
  pink: gummy(0xffffff, { map: TEXS.pink, roughness: 0.42, clearcoat: 0.65, emissive: 0xffffff, emissiveMap: TEXS.pink, emissiveIntensity: 0.14 }),
  blue: gummy(0xffffff, { map: TEXS.blue, roughness: 0.42, clearcoat: 0.65, emissive: 0xffffff, emissiveMap: TEXS.blue, emissiveIntensity: 0.1 }),
}
// les ailerons : le pelage seul
const WINGS = {
  pink: gummy(COATS.pink, { roughness: 0.42, clearcoat: 0.65, emissive: COATS.pink, emissiveIntensity: 0.14 }),
  blue: gummy(COATS.blue, { roughness: 0.42, clearcoat: 0.65, emissive: COATS.blue, emissiveIntensity: 0.1 }),
}
const beakMat = gummy(BEAK, { roughness: 0.35, clearcoat: 0.8 })

/** Un corps en œuf et une grosse tête fondue dedans, sans cou, une petite queue : une seule peau, pour les deux manchots. */
function bodyBlob(): BufferGeometry {
  const geo = blob(
    [
      // le corps : un œuf rond, le ventre un peu gonflé devant
      ell([0, 0.245, 0], [0.185, 0.245, 0.17]),
      ell([0, 0.215, 0.062], [0.145, 0.2, 0.125], { k: 0.05 }),
      // la grosse tête, fondue dans le corps
      ell([0, 0.46, 0.012], [0.15, 0.135, 0.14], { k: 0.07 }),
      // la petite queue
      ell([0, 0.075, -0.15], [0.05, 0.035, 0.065], { rot: [0.5, 0, 0], k: 0.04 }),
    ],
    { h: 0.019, k: 0.05 },
  )
  // le dessin est projeté de face ; derrière, on lit la bande du haut de la texture, qui n'est que la couleur du pelage
  const pos = geo.attributes.position, uv = geo.attributes.uv
  for (let i = 0; i < pos.count; i++) {
    if (pos.getZ(i) < 0) {
      // derrière : au milieu du dos, la bande du haut ; sur les côtés, le bord (la couleur du pelage dans les deux cas)
      const x = pos.getX(i), u = (x + TEX_W / 2) / TEX_W
      if (Math.abs(x) > 0.09) uv.setXY(i, x > 0 ? 0.99 : 0.01, pos.getY(i) / TEX_H)
      else uv.setXY(i, u, 0.995)
    }
    else uv.setXY(i, (pos.getX(i) + TEX_W / 2) / TEX_W, pos.getY(i) / TEX_H)
  }
  return geo
}

/** Un aileron effilé au bout rond, accroché à l'épaule (en haut) ; plat, mince en x. Le même pour les deux côtés. */
function wingBlob(color: number): BufferGeometry {
  return blob(
    [
      ell([0, -0.03, 0], [0.017, 0.055, 0.034], { color }),
      ell([0.003, -0.09, 0.002], [0.015, 0.07, 0.03], { color, k: 0.04 }),
      ell([0.007, -0.15, 0.004], [0.011, 0.05, 0.017], { color, k: 0.04 }),
    ],
    { h: 0.01, k: 0.04 },
  )
}

/** Un pied palmé : une semelle et trois doigts reliés, à plat sur la neige. */
function footBlob(): BufferGeometry {
  return blob(
    [
      ell([0, 0.013, 0.012], [0.036, 0.013, 0.03], { color: BEAK }),
      ell([-0.03, 0.013, 0.05], [0.014, 0.011, 0.027], { rot: [0, 0.4, 0], color: BEAK, k: 0.02 }),
      ell([0, 0.013, 0.062], [0.014, 0.011, 0.03], { color: BEAK, k: 0.02 }),
      ell([0.03, 0.013, 0.05], [0.014, 0.011, 0.027], { rot: [0, -0.4, 0], color: BEAK, k: 0.02 }),
    ],
    { h: 0.01, k: 0.02 },
  )
}

/** Le point de la peau de la tête vu de devant (un rayon lancé vers l'arrière) : où poser un œil, et la normale à cet endroit. */
function surfaceAt(geo: BufferGeometry, x: number, y: number) {
  const mesh = new Mesh(geo, new MeshBasicMaterial()), ray = new Raycaster()
  mesh.updateMatrixWorld(true)
  ray.set(new Vector3(x, y, 0.6), new Vector3(0, 0, -1))
  const h = ray.intersectObject(mesh)[0]
  return h ? { p: h.point.clone(), n: h.face!.normal.clone() } : { p: new Vector3(x, y, 0.14), n: new Vector3(0, 0, 1) }
}

const Z = new Vector3(0, 0, 1)
// ce qui se calcule une fois pour les deux manchots (le dessin du pelage est dans la texture, le corps est le même)
const shared: { body?: BufferGeometry; wing?: BufferGeometry; foot?: BufferGeometry } = {}

/**
 * Un manchot tout rond, pour le plaisir des yeux (pas de son) : une seule peau de gomme pour le corps en œuf, la grosse tête fondue
 * dedans, le ventre crème modelé, le masque crème qui couvre tout le visage, les joues roses et le petit bec orange arrondi ; des
 * ailerons effilés et des pieds palmés ; de grands yeux brillants. Il se dandine d'un pied sur l'autre, hoche la tête vers ce
 * qu'il regarde (il se penche un peu en avant, un peu en arrière), et bat des ailerons de loin en loin.
 */
export function Penguin({ position, coat, ry = 0, s = 1 }: { position: V3; coat: keyof typeof COATS; ry?: number; s?: number }) {
  const body = useRef<Group>(null!), wings = useRef<Group[]>([])
  const st = useRef({ ph: rand(0, 6), flap: 0, next: rand(4, 10) })
  const g = useMemo(() => {
    const geo = shared.body ??= bodyBlob()
    // les yeux, posés sur la vraie peau du masque, de chaque côté
    const eyes = [-1, 1].map((sd) => {
      const { p, n } = surfaceAt(geo, sd * 0.055, 0.482)
      return { sd, p: p.addScaledVector(n, 0.003), q: new Quaternion().setFromUnitVectors(Z, n) }
    })
    return { geo, eyes, wing: shared.wing ??= wingBlob(0xffffff), foot: shared.foot ??= footBlob() }
  }, [])
  const m = SKINS[coat]
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), k = st.current
    if (reduceMotion) return
    k.ph += dt * 2.2
    k.next -= dt
    if (k.next <= 0) {
      k.flap = 1
      k.next = rand(6, 14)
    }
    k.flap = Math.max(0, k.flap - dt * 0.9)
    // le dandinement, et le hochement : toute la peau se penche un peu en avant, un peu en arrière
    body.current.rotation.z = Math.sin(k.ph) * 0.06
    body.current.rotation.x = 0.03 + Math.sin(k.ph * 0.5) * 0.05
    body.current.position.y = Math.abs(Math.sin(k.ph)) * 0.008
    const f = Math.sin(k.flap * Math.PI * 6) * k.flap * 0.6
    wings.current.forEach((w, i) => (w.rotation.z = (i ? 1 : -1) * (0.14 + Math.max(0, f))))
  })
  return (
    <group position={position} rotation-y={ry} scale={s} userData={LIVE}>
      {/* les pieds palmés, posés sur la neige (ils ne bougent pas) */}
      <Static>
        {[-0.07, 0.07].map((x) => (
          <mesh key={x} geometry={g.foot} material={beakMat} position={[x, 0, 0.0]} castShadow={false} receiveShadow />
        ))}
      </Static>
      <group ref={body}>
        <Static>
          <mesh geometry={g.geo} material={m} castShadow receiveShadow />
          {/* le bec orange, court et arrondi : le haut, et le bas qui dépasse à peine */}
          <Part geo={SPH} m={beakMat} scale={[0.037, 0.026, 0.046]} p={[0, 0.433, 0.152]} castShadow={false} />
          <Part geo={SPH} m={beakMat} scale={[0.028, 0.013, 0.036]} p={[0, 0.416, 0.15]} castShadow={false} />
          {/* les grands yeux brillants : une bille noire vernie, deux reflets */}
          {g.eyes.map(({ sd, p, q }) => (
            <group key={sd} position={p} quaternion={q}>
              <Part geo={SPH} m={I.nose} scale={[0.03, 0.037, 0.016]} castShadow={false} />
              <Part geo={SPH} m={I.paper} scale={0.0105} p={[0.008, 0.014, 0.012]} castShadow={false} />
              <Part geo={SPH} m={I.paper} scale={0.0052} p={[-0.01, -0.012, 0.013]} castShadow={false} />
            </group>
          ))}
        </Static>
        {/* les ailerons, attachés à l'épaule */}
        {[-1, 1].map((sd, i) => (
          <group key={sd} ref={(el) => void (el && (wings.current[i] = el))} position={[sd * 0.17, 0.35, 0.005]}>
            <mesh geometry={g.wing} material={WINGS[coat]} castShadow receiveShadow />
          </group>
        ))}
      </group>
    </group>
  )
}
