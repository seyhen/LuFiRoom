import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BackSide, Quaternion, Vector3, type BufferGeometry, type Group, type Mesh } from 'three'
import { mergeGeometries } from 'three/addons/utils/BufferGeometryUtils.js'
import { Vessel, innerR } from '../igloo/Vessel'
import { isActive, useStore } from '../../state/store'
import { TAU, approach, lerp } from '../../math'
import { gummy } from '../materials'
import { Part, SPH, cyl } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { O } from './materials'

/** La table de pierre du matcha, dans la cour de devant : son pied au sol (la table, le bol et le fouet). */
export const MATCHA = { x: -0.55, z: 1.95, top: 0.44 }
const tea = gummy(0x6f9a3c, { roughness: 0.4, clearcoat: 0.9 })
const froth = gummy(0xb4d878, { roughness: 0.9, clearcoat: 0.05 })
const celadonIn = O.celadon.clone()
celadonIn.side = BackSide
// le bol (repère du bol, avant l'échelle 1,4) : rayon en haut, en bas, hauteur de la panse ; le thé à 70 % de sa hauteur
const BOWL = { rt: 0.13, rb: 0.075, h: 0.1 }
const TEA_Y = 0.02 + BOWL.h * 0.7
const TEA_R = innerR(BOWL.rt, BOWL.rb, BOWL.h, BOWL.h * 0.7, 0.008) - 0.002
const REST_Y = 0.055
// les dents du fouet : chacune part de la ligature, s'écarte en bulbe puis se recourbe vers la pointe (deux segments)
const TINES = (() => {
  const parts: BufferGeometry[] = [], up = new Vector3(0, 1, 0)
  const seg = (a: Vector3, b: Vector3, r: number) => {
    const d = b.clone().sub(a), g = cyl(r, r, d.length(), 4).clone()
    g.applyQuaternion(new Quaternion().setFromUnitVectors(up, d.normalize()))
    g.translate((a.x + b.x) / 2, (a.y + b.y) / 2, (a.z + b.z) / 2)
    parts.push(g)
  }
  for (let i = 0; i < 20; i++) {
    const a = (i / 20) * TAU, c = Math.cos(a), sn = Math.sin(a)
    const p0 = new Vector3(c * 0.017, 0.135, sn * 0.017), p1 = new Vector3(c * 0.044, 0.06, sn * 0.044), p2 = new Vector3(c * 0.032, 0.004, sn * 0.032)
    seg(p0, p1, 0.0042)
    seg(p1, p2, 0.0042)
  }
  return mergeGeometries(parts)!
})()

/**
 * La table de pierre où l'on bat le thé : un bol de céladon, du matcha, et le chasen de bambou. Quand le son joue, le fouet décrit de
 * petits cercles dans le bol, la tête penchée, et la mousse verte monte peu à peu ; à l'arrêt la mousse retombe et le fouet se couche
 * à côté du bol. Elle se tient dans la cour de devant, entre le seau et le panier de linge, loin du bassin.
 */
export function MatchaTable() {
  const g = useRef<Group>(null!), whisk = useRef<Group>(null!), foam = useRef<Mesh>(null!), st = useRef({ k: 0, a: 0, foam: 0.15 })
  useSquash('whisk', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'whisk')
    s.k = approach(s.k, on ? 1 : 0, dt * 1.6)
    s.foam = approach(s.foam, on ? 1 : 0.15, dt * (on ? 0.12 : 0.25))
    if (on && !reduceMotion) s.a += dt * 9 // phase image après image (le fouet bat plus vite quand on s'y met)
    const r = 0.045 * s.k
    whisk.current.position.set(lerp(0.22, Math.cos(s.a) * r, s.k), lerp(REST_Y, TEA_Y + 0.012, s.k), lerp(-0.15, Math.sin(s.a) * r, s.k))
    whisk.current.rotation.set(lerp(1.5, 0, s.k) + 0.3 * s.k * Math.cos(s.a - 0.6), 0, 0.3 * s.k * Math.sin(s.a - 0.6))
    foam.current.scale.set(TEA_R * (0.6 + 0.38 * s.foam), 0.004 + 0.012 * s.foam, TEA_R * (0.6 + 0.38 * s.foam))
    foam.current.visible = s.foam > 0.2
  })
  return (
    <group ref={g} userData={{ id: 'whisk' }} position={[MATCHA.x, 0, MATCHA.z]}>
      <Static>
        {/* la table : un fût de pierre et un plateau rond */}
        <Part geo={cyl(0.2, 0.25, 0.06, 20)} m={O.stone[1]} p={[0, 0.03, 0]} />
        <Part geo={cyl(0.13, 0.17, 0.34, 20)} m={O.stone[1]} p={[0, 0.23, 0]} />
        <Part geo={cyl(0.36, 0.33, 0.07, 28)} m={O.stone[0]} p={[0, MATCHA.top - 0.035, 0]} />
        {/* le bol ouvert : un pied, la panse évasée (dehors céladon, dedans plus clair), le bord, et le thé dedans, sous le bord */}
        <group position={[0, MATCHA.top, 0]} scale={1.4}>
          <Part geo={cyl(0.06, 0.06, 0.02, 16)} m={O.ceramic} p={[0, 0.01, 0]} castShadow={false} />
          <Vessel p={[0, 0.02, 0]} rt={BOWL.rt} rb={BOWL.rb} h={BOWL.h} m={O.celadon} inner={celadonIn} t={0.008} />
          <Part geo={cyl(TEA_R, TEA_R, 0.006, 26)} m={tea} p={[0, TEA_Y, 0]} castShadow={false} />
        </group>
      </Static>
      <group position={[0, MATCHA.top, 0]} scale={1.4}>
        {/* la mousse, qui monte sans jamais passer le bord */}
        <mesh ref={foam} geometry={SPH} material={froth} position={[0, TEA_Y + 0.004, 0]} scale={[0.06, 0.004, 0.06]} />
        {/* le chasen : manche de bambou, ligature, et la tête en bulbe de fines dents recourbées ; sa pointe à l'origine du groupe */}
        <group ref={whisk} position={[0.22, REST_Y, -0.15]} rotation-x={1.5}>
          <Part geo={cyl(0.016, 0.019, 0.12, 12)} m={O.bambooDry} p={[0, 0.205, 0]} castShadow={false} />
          <Part geo={cyl(0.0195, 0.0195, 0.008, 12)} m={O.bark} p={[0, 0.235, 0]} castShadow={false} />
          <Part geo={cyl(0.021, 0.021, 0.014, 12)} m={O.rope} p={[0, 0.14, 0]} castShadow={false} />
          <Part geo={SPH} m={O.bambooDry} scale={[0.016, 0.05, 0.016]} p={[0, 0.085, 0]} castShadow={false} />
          <mesh geometry={TINES} material={O.bambooDry} />
        </group>
      </group>
    </group>
  )
}
