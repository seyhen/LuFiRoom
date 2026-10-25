import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type PointLight } from 'three'
import { smooth } from '../../math'
import { mood } from '../anim'

const SUN = new Color(0xffa877), MOON = new Color(0x8fa0e8), GRAY = new Color(0xb4bccb)

/** La lumière qui entre par la grande porte : orangée au coucher du soleil, bleutée et faible au clair de lune, grise par gros temps. */
export function SunGlow() {
  const light = useRef<PointLight>(null!)
  useFrame(() => {
    const n = smooth(mood.night), gray = smooth(Math.max(mood.rain, mood.storm, mood.snow * 0.9))
    // par gros temps, une lumière grise et plus faible : le ciel couvert n'a plus de couleur
    light.current.color.copy(SUN).lerp(MOON, n).lerp(GRAY, gray * 0.75)
    light.current.intensity = (0.55 - n * 0.35) * (1 - gray * 0.35) * Math.PI // × π : voir materials.ts
  })
  return <pointLight ref={light} intensity={0} distance={9} decay={1.4} position={[1.1, 1.7, -3.55]} />
}
