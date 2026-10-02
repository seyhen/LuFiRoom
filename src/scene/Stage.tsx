import { useEffect, useLayoutEffect, useRef, type MutableRefObject } from 'react'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { Raycaster, Vector2, Vector3, type Group, type Object3D, type OrthographicCamera } from 'three'
import { useStore } from '../state/store'
import { roomById } from '../rooms'
import type { ObjectId, Room as RoomData } from '../rooms/types'
import { clamp } from '../math'
import { pointer, reduceMotion } from './anim'
import { shadowTex } from './textures'
import { Lights } from './Lights'
import { Hotspots } from './Hotspot'
import { scenes } from './scenes'

type Layer = MutableRefObject<HTMLDivElement>

// Caméra orthographique dans la direction (1, 0.8, 1), à 40 unités, qui vise le centre de la pièce.
const LOOK = new Vector3(0, 1.85, 0)
const CAM_POS = LOOK.clone().addScaledVector(new Vector3(1, 0.8, 1).normalize(), 40)

// `legacy linear flat` : rendu de three r128 comme le prototype (couleurs telles quelles, pas de tone mapping).
export function Stage({ hotspotLayer }: { hotspotLayer: Layer }) {
  const room = useStore((s) => roomById(s.room))
  return (
    <Canvas
      className="scene"
      style={{ position: 'fixed', inset: 0 }}
      role="img"
      aria-label={room.description}
      orthographic
      camera={{ manual: true, near: 0.1, far: 120 }}
      shadows
      legacy
      linear
      flat
    >
      <Framing />
      <Ready />
      <Lights room={room} />
      {/* ombre douce sous le diorama, pour l'effet « flotte » */}
      <mesh rotation-x={-Math.PI / 2} position={[-0.2, -1.8, -0.2]}>
        <planeGeometry args={[13, 13]} />
        <meshBasicMaterial map={shadowTex} transparent depthWrite={false} opacity={0.6} />
      </mesh>
      <Room key={room.id} room={room} hotspotLayer={hotspotLayer} />
    </Canvas>
  )
}

/** Prévient l'écran de chargement quand la scène a été dessinée (la première image compile les shaders). */
function Ready() {
  const frames = useRef(0)
  useFrame(() => {
    if (++frames.current === 2) useStore.setState((s) => ({ loading: { ...s.loading, scene: true } }))
  })
  return null
}

/** Cadrage : la pièce tient dans la zone libre entre le titre et le mixeur. */
function Framing() {
  const camera = useThree((s) => s.camera) as OrthographicCamera
  const { width, height } = useThree((s) => s.size)
  const { top, bottom } = useStore((s) => s.insets)
  useLayoutEffect(() => {
    camera.position.copy(CAM_POS)
    camera.lookAt(LOOK)
    const unit = Math.min(width / 10.4, Math.max(180, height - top - bottom) / 9.6) // pixels par unité
    const vw = width / unit, vh = height / unit, shift = (bottom - top) / 2 / unit
    camera.left = -vw / 2
    camera.right = vw / 2
    camera.top = vh / 2 - shift
    camera.bottom = -vh / 2 - shift
    camera.updateProjectionMatrix()
  }, [camera, width, height, top, bottom])
  return null
}

/** La pièce : flotte, tourne quand on la glisse. */
function Room({ room, hotspotLayer }: { room: RoomData; hotspotLayer: Layer }) {
  const group = useRef<Group>(null!)
  const turn = useTapAndTurn(group, room)
  const Scene = scenes[room.id]
  useFrame(({ clock }, delta) => {
    const t = turn.current
    t.angle += (t.target - t.angle) * Math.min(1, Math.min(delta, 0.05) * 6)
    group.current.rotation.y = t.angle
    group.current.position.y = reduceMotion ? 0 : Math.sin(clock.elapsedTime * 0.7) * 0.06
  }, -1)
  return (
    <group ref={group}>
      <Scene />
      <Hotspots room={room} layer={hotspotLayer} />
    </group>
  )
}

/** Tap (moins de 8 px) sur un objet : bascule. Glisser : tourne la pièce sur ±0.6 rad. Souris : survol. */
function useTapAndTurn(group: MutableRefObject<Group>, room: RoomData) {
  const gl = useThree((s) => s.gl), camera = useThree((s) => s.camera)
  const turn = useRef({ angle: 0, target: 0 })
  useEffect(() => {
    const el = gl.domElement, ray = new Raycaster(), ndc = new Vector2()
    // Le premier maillage touché décide ; on remonte jusqu'au groupe de l'objet interactif.
    const pick = (x: number, y: number): ObjectId | null => {
      ndc.set((x / el.clientWidth) * 2 - 1, -(y / el.clientHeight) * 2 + 1)
      ray.setFromCamera(ndc, camera)
      for (let o: Object3D | null = ray.intersectObjects(group.current.children, true)[0]?.object ?? null; o; o = o.parent) {
        if (o.userData.id) return o.userData.id
      }
      return null
    }
    let down: { x: number; y: number; from: number; moved: boolean; id: number } | null = null
    const onDown = (e: PointerEvent) => {
      down = { x: e.clientX, y: e.clientY, from: turn.current.target, moved: false, id: e.pointerId }
      try {
        el.setPointerCapture(e.pointerId)
      } catch {
        // pointeur déjà relâché : on tourne quand même sans capture
      }
    }
    const onMove = (e: PointerEvent) => {
      if (down && e.pointerId === down.id) {
        const dx = e.clientX - down.x, dy = e.clientY - down.y
        if (!down.moved && Math.hypot(dx, dy) > 8) down.moved = true
        if (down.moved) turn.current.target = clamp(down.from + dx * 0.006, -0.6, 0.6)
      } else if (e.pointerType === 'mouse') {
        pointer.hover = pick(e.clientX, e.clientY)
        el.style.cursor = pointer.hover ? 'pointer' : 'grab'
      }
    }
    const onUp = (e: PointerEvent) => {
      if (!down || e.pointerId !== down.id) return
      if (!down.moved) {
        const id = pick(e.clientX, e.clientY)
        const obj = room.objects.find((o) => o.id === id)
        if (obj) useStore.getState().toggle(obj.target)
      }
      down = null
    }
    const onCancel = () => {
      down = null
    }
    const onLeave = () => {
      if (!down) pointer.hover = null
    }
    el.addEventListener('pointerdown', onDown)
    el.addEventListener('pointermove', onMove)
    el.addEventListener('pointerup', onUp)
    el.addEventListener('pointercancel', onCancel)
    el.addEventListener('pointerleave', onLeave)
    return () => {
      el.removeEventListener('pointerdown', onDown)
      el.removeEventListener('pointermove', onMove)
      el.removeEventListener('pointerup', onUp)
      el.removeEventListener('pointercancel', onCancel)
      el.removeEventListener('pointerleave', onLeave)
    }
  }, [gl, camera, group, room])
  return turn
}
