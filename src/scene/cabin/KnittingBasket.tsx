import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { BufferGeometry, CatmullRomCurve3, Float32BufferAttribute, Vector3, type Group } from 'three'
import { isActive, useStore } from '../../state/store'
import { approach } from '../../math'
import { Part, SPH, cyl } from '../parts'
import { reduceMotion, useSquash } from '../anim'
import { Static } from '../Static'
import { Vessel, innerR } from '../igloo/Vessel'
import { C } from './materials'

// Le panier est ouvert (Vessel) : on voit dedans un tricot plié au fond, et les pelotes posées dessus, qui dépassent du bord.
const BASKET = { rt: 0.2, rb: 0.16, h: 0.22, t: 0.012 }
const FOLD_Y = 0.12

/**
 * L'écharpe commencée : une bande de tricot souple, épaisse de 1,6 cm, qui part du fond du panier, passe par-dessus le bord et
 * pend dehors, contre la paroi, avec ses franges. `a` : la direction (autour du panier) où elle passe le bord.
 */
function scarfGeo(a: number, w = 0.1, th = 0.016) {
  const out = (r: number, y: number) => new Vector3(Math.cos(a) * r, y, Math.sin(a) * r)
  const curve = new CatmullRomCurve3([out(0.06, FOLD_Y + 0.01), out(0.15, 0.2), out(0.205, 0.245), out(0.232, 0.205), out(0.212, 0.13), out(0.2, 0.075)])
  const side = new Vector3(-Math.sin(a), 0, Math.cos(a)), N = 40
  const pos: number[] = [], uv: number[] = [], idx: number[] = []
  let len = 0, prev = curve.getPoint(0)
  for (let i = 0; i <= N; i++) {
    const p = curve.getPoint(i / N), t = curve.getTangent(i / N), n = new Vector3().crossVectors(side, t).normalize()
    len += p.distanceTo(prev); prev = p
    // quatre coins de la section : dessus gauche, dessus droit, dessous droit, dessous gauche
    for (const [sx, sn] of [[-1, 1], [1, 1], [1, -1], [-1, -1]]) {
      const q = p.clone().addScaledVector(side, (sx * w) / 2).addScaledVector(n, (sn * th) / 2)
      pos.push(q.x, q.y, q.z)
      uv.push(((sx + 1) / 2) * 0.5, len * 5)
    }
  }
  for (let i = 0; i < N; i++) for (let k = 0; k < 4; k++) {
    const a0 = i * 4 + k, a1 = i * 4 + ((k + 1) % 4), b0 = a0 + 4, b1 = a1 + 4
    idx.push(a0, a1, b0, a1, b1, b0)
  }
  const g = new BufferGeometry()
  g.setAttribute('position', new Float32BufferAttribute(pos, 3))
  g.setAttribute('uv', new Float32BufferAttribute(uv, 2))
  g.setIndex(idx)
  g.computeVertexNormals()
  const end = curve.getPoint(1)
  return { g, fringe: [-2, -1, 0, 1, 2].map((i) => end.clone().addScaledVector(side, i * w * 0.2)) }
}
const SCARF = scarfGeo(0.35)

/** Le panier à tricot, à côté du pouf : son pied au sol. */
export const KNIT = { x: -0.2, z: 1.6 }

/**
 * À côté du pouf, le panier à tricot (ouvert : on voit dedans) : une pelote canneberge qui se dévide, deux autres pelotes sur un
 * tricot plié, l'écharpe commencée qui passe par-dessus le bord et pend dehors, et deux longues aiguilles de bois. Quand le son joue, les aiguilles s'entrecroisent lentement, maille après maille, et la
 * pelote roule un peu sur elle-même ; à l'arrêt elles se posent en croix, la pelote immobile.
 */
export function KnittingBasket() {
  const g = useRef<Group>(null!), a = useRef<Group>(null!), b = useRef<Group>(null!), ball = useRef<Group>(null!), st = useRef({ k: 0, ph: 0 })
  useSquash('knit', g)
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), s = st.current, on = isActive(useStore.getState(), 'knit')
    s.k = approach(s.k, on ? 1 : 0, dt * 1.2)
    if (!reduceMotion) s.ph += dt * 2.6 * s.k // la phase s'ajoute image après image
    const w = Math.sin(s.ph) * 0.2 * s.k, v = Math.sin(s.ph * 0.5 + 1) * 0.07 * s.k
    // chaque aiguille bascule en sens inverse de l'autre autour de son point d'appui : elles se croisent puis se séparent
    a.current.rotation.set(-0.35 + v, 0, -0.5 + w)
    b.current.rotation.set(0.2 - v, 0, 0.55 + w)
    ball.current.rotation.set(0, s.ph * 0.35, Math.sin(s.ph * 0.5) * 0.12 * s.k)
  })
  return (
    <group ref={g} userData={{ id: 'knit' }} position={[KNIT.x, 0, KNIT.z]} rotation-y={0.5}>
      <group scale={1.5}>
      <Static>
        <Vessel p={[0, 0, 0]} rt={BASKET.rt} rb={BASKET.rb} h={BASKET.h} m={C.wicker} inner={C.wickerInner} rim={C.log} t={BASKET.t} />
        <Part m={C.log} p={[0, BASKET.h, 0]} rotation-x={Math.PI / 2} castShadow={false}>
          <torusGeometry args={[BASKET.rt - 0.004, 0.015, 6, 28]} />
        </Part>
        {/* au fond, un tricot plié ; dessus, deux pelotes */}
        <Part geo={cyl(innerR(BASKET.rt, BASKET.rb, BASKET.h, FOLD_Y, BASKET.t), innerR(BASKET.rt, BASKET.rb, BASKET.h, 0.09, BASKET.t), 0.03, 24)} m={C.knit} p={[0, FOLD_Y - 0.015, 0]} castShadow={false} />
        {([[0.075, -0.085, C.wool], [-0.075, -0.08, C.pineLight]] as const).map(([x, z, m], i) => (
          <Part key={i} geo={SPH} m={m} scale={0.065} p={[x, FOLD_Y + 0.065, z]} />
        ))}
        {/* l'écharpe commencée, qui passe par-dessus le bord et pend dehors, avec ses franges canneberge */}
        <Part geo={SCARF.g} m={C.knit} castShadow={false} />
        {SCARF.fringe.map((p, i) => (
          <Part key={i} geo={cyl(0.007, 0.006, 0.045, 6)} m={C.cranberry} p={[p.x, p.y - 0.022, p.z]} castShadow={false} />
        ))}
      </Static>
      {/* la pelote qui se dévide : deux bandes de fil la font lire quand elle tourne */}
      <group ref={ball} position={[0.0, FOLD_Y + 0.09, 0.08]}>
        <Part geo={SPH} m={C.cranberry} scale={0.09} />
        {[0, 1].map((i) => (
          <Part key={i} m={C.cranberryLight} rotation={[Math.PI / 2 - 0.5 + i * 1.0, 0, i * 0.7]} castShadow={false}>
            <torusGeometry args={[0.09, 0.008, 6, 24]} />
          </Part>
        ))}
      </group>
      {/* les deux aiguilles, plantées dans le panier : ils se croisent au-dessus du bord */}
      <group ref={a} position={[-0.08, 0.2, 0.02]}>
        <Part geo={cyl(0.014, 0.01, 0.46, 8)} m={C.cut} p={[0, 0.23, 0]} castShadow={false} />
        <Part geo={SPH} m={C.gold} scale={0.017} p={[0, 0.47, 0]} castShadow={false} />
      </group>
      <group ref={b} position={[0.08, 0.2, 0.02]}>
        <Part geo={cyl(0.014, 0.01, 0.46, 8)} m={C.cut} p={[0, 0.23, 0]} castShadow={false} />
        <Part geo={SPH} m={C.gold} scale={0.017} p={[0, 0.47, 0]} castShadow={false} />
      </group>
      </group>
    </group>
  )
}
