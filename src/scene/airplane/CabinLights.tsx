import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type PointLight } from 'three'
import { smooth } from '../../math'
import { mood } from '../anim'
import { PORTS } from './layout'

const SUN = new Color(0xfff0d0), MOON = new Color(0x8fb0ff), tmp = new Color()

/**
 * Les deux autres lumières de la cabine (avec la lampe de lecture, trois en tout) : la lumière du hublot, le soleil le jour et la lune la nuit,
 * qui tombe sur le dormeur et le siège voisin, et un reflet doux venu de l'avant (les faces tournées vers nous seraient sinon dans le noir,
 * comme dans la tente), plus chaud et plus fort la nuit, quand la cabine est dans la pénombre.
 */
export function CabinLights() {
  const port = useRef<PointLight>(null!), bounce = useRef<PointLight>(null!)
  useFrame(() => {
    const n = smooth(mood.night)
    port.current.color.copy(tmp.copy(SUN).lerp(MOON, n))
    port.current.intensity = (0.3 + n * 0.3) * Math.PI
    bounce.current.intensity = (0.16 + n * 0.5) * Math.PI
  })
  return (
    <>
      <pointLight ref={port} color={0xfff0d0} intensity={0} distance={5.5} decay={1.4} position={[PORTS[0].x + 0.35, 1.75, -2.2]} />
      <pointLight ref={bounce} color={0xffe2c4} intensity={0} distance={11} decay={1.3} position={[3.0, 2.2, 3.0]} />
    </>
  )
}
