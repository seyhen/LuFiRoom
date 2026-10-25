import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, Color, NormalBlending, type Mesh, type MeshBasicMaterial, type Texture } from 'three'
import { smooth } from '../../math'
import { mood, reduceMotion } from '../anim'
import { noRay, type V3 } from '../parts'
import { LIVE } from '../Static'

interface Props {
  /** Texture qui se répète en largeur (RepeatWrapping), dessinée en clair : la couleur la teinte. */
  map: Texture
  position: V3
  size: [number, number]
  /** Teinte de jour, de nuit. */
  color: [number, number]
  /** Défilement, en largeurs de texture par seconde (négatif : vers la gauche). */
  speed?: number
  /** Houle : amplitude (unités) et vitesse du balancement vertical. */
  bob?: [number, number]
  phase?: number
  /** Facteur de vitesse lu à chaque image (le train qui ralentit, par exemple). */
  pace?: () => number
  /** Opacité de jour, de nuit (1 par défaut). */
  opacity?: [number, number]
  /** Lumières (fenêtres allumées) : s'ajoutent à ce qui est derrière. */
  glow?: boolean
  /** La teinte sous l'orage, de jour et de nuit (la mer qui grisonne). */
  storm?: [number, number]
  /** La houle de l'orage : amplitude et vitesse du balancement multipliées par 1 + `swell`, le défilement par 1 + `swell` / 2. */
  swell?: number
  /** La teinte sous la neige, de jour et de nuit (les vagues pâlissent, les collines blanchissent). */
  snow?: [number, number]
  /**
   * La même bande sous la neige (prés blancs, talus enneigés) : un second plan qui défile avec elle et apparaît quand il neige.
   * Un tracé de plus seulement quand il neige.
   */
  snowMap?: Texture
}

/**
 * Un plan transparent dont la texture défile : vagues, collines, poteaux vus d'un train. Plusieurs plans à des vitesses
 * différentes font une parallaxe. Rien n'est redessiné : seul le décalage de la texture change, c'est gratuit.
 */
export function ScrollLayer({ map, position, size, color, speed = 0, bob, phase = 0, pace, opacity, glow, storm, swell = 0, snow, snowMap }: Props) {
  const mesh = useRef<Mesh>(null!), twin = useRef<Mesh>(null!), ph = useRef(phase)
  const [day, night, stD, stN, snD, snN] = useMemo(
    () => [color[0], color[1], storm?.[0] ?? color[0], storm?.[1] ?? color[1], snow?.[0] ?? 0xffffff, snow?.[1] ?? 0xb4bedc].map((c) => new Color(c)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [color[0], color[1], storm?.[0], storm?.[1], snow?.[0], snow?.[1]],
  )
  const tmp = useMemo(() => new Color(), [])
  // La bande enneigée défile sur sa propre copie de la texture (même décalage que l'autre, recopié à chaque image).
  const snowTex = useMemo(() => {
    if (!snowMap) return null
    const t = snowMap.clone()
    t.needsUpdate = true
    return t
  }, [snowMap])
  useFrame((_, delta) => {
    const m = mesh.current, mat = m.material as MeshBasicMaterial
    const n = smooth(mood.night), st = smooth(mood.storm), s = smooth(mood.snow)
    mat.color.copy(day).lerp(night, n)
    if (storm) mat.color.lerp(tmp.copy(stD).lerp(stN, n), st)
    if (snow && !snowMap) mat.color.lerp(tmp.copy(snD).lerp(snN, n), s * 0.7)
    const op = opacity ? opacity[0] + (opacity[1] - opacity[0]) * n : 1
    if (opacity) mat.opacity = op
    const w = twin.current
    if (w) {
      w.visible = s > 0.01
      if (w.visible) {
        const wm = w.material as MeshBasicMaterial
        wm.opacity = op * Math.min(1, s * 1.4)
        wm.color.copy(snD).lerp(snN, n)
        if (storm) wm.color.lerp(tmp.copy(stD).lerp(stN, n), st * 0.5)
      }
    }
    if (reduceMotion) return
    const dt = Math.min(delta, 0.05), tex = mat.map!
    tex.offset.x = (tex.offset.x + speed * dt * (pace ? pace() : 1) * (1 + st * swell * 0.5)) % 1
    if (snowTex) snowTex.offset.x = tex.offset.x
    if (bob) {
      // La phase s'additionne : la houle peut forcir sans que la vague saute.
      ph.current += dt * bob[1] * (1 + st * swell)
      m.position.y = position[1] + Math.sin(ph.current) * bob[0] * (1 + st * swell)
      if (w) w.position.y = m.position.y
    }
  })
  return (
    <>
      <mesh ref={mesh} userData={LIVE} position={position} raycast={noRay}>
        <planeGeometry args={size} />
        <meshBasicMaterial map={map} transparent depthWrite={false} blending={glow ? AdditiveBlending : NormalBlending} />
      </mesh>
      {snowTex && (
        <mesh ref={twin} userData={LIVE} position={[position[0], position[1], position[2] + 0.001]} raycast={noRay} visible={false}>
          <planeGeometry args={size} />
          <meshBasicMaterial map={snowTex} transparent depthWrite={false} opacity={0} />
        </mesh>
      )}
    </>
  )
}
