import { useMemo, useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Vector3, type Group } from 'three'
import { rand } from '../../math'
import { Part, SPH, cyl, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { reduceMotion } from '../anim'
import { I } from './materials'
import { Vessel } from './Vessel'
import { arc, puff } from './puff'
import { SPH_LO } from './spheres'

// Le corps roulé : la colonne suit un arc de 220° (des hanches, à gauche, au poitrail, à droite), le dos dehors, le ventre dedans.
// (le rayon de la boucle dépasse celui du corps : sinon le dedans de la boucle se pince en éventail)
const SPINE = { R: 0.24, y: 0.105, a0: 160, a1: 380 }
// La tête, posée sur les pattes avant, regarde le long de la boucle (vers l'avant gauche du chien) : la caméra la voit de trois
// quarts. F est sa direction, H son centre.
const F = new Vector3(-0.7, 0, 0.71).normalize()
const H: V3 = [0.06, 0.15, 0.3]
const HEAD_RY = Math.atan2(-F.z, F.x)
// un cylindre (axe y) couché dans la direction F : basculé de 90° en x, après une rotation en z
const LEG_RZ = Math.atan2(-F.x, F.z)

/**
 * Le chien de traîneau, un husky gris et blanc roulé en boule sur la peau de renne, qui dort. Le corps est un seul boudin courbé
 * au pelage peint (la selle gris foncé sur le dos, les flancs gris, le ventre blanc) ; la hanche ronde et la patte arrière
 * repliée ; la collerette blanche du poitrail ; les pattes avant tendues, où la tête se pose ; la queue en panache, grise dessus,
 * blanche dessous et au bout, enroulée devant. La tête : le masque blanc, la calotte grise et sa raie sur le front, les taches
 * claires au-dessus des yeux fermés, le museau, la truffe, les oreilles à l'intérieur rose, le collier rouge et sa médaille.
 * Il respire lentement ; de loin en loin, une oreille frémit. À côté, sa gamelle émaillée et un os à ronger.
 * Il ne fait pas de son (on ne joue pas de respiration : voir le skill room-objects).
 */
export function Husky({ position, ry = 0 }: { position: V3; ry?: number }) {
  const body = useRef<Group>(null!), ears = useRef<Group[]>([])
  const st = useRef({ ph: 0, flick: 0, ear: 0, next: rand(5, 10) })
  const geo = useMemo(() => {
    const { R, y, a0, a1 } = SPINE
    // le rayon : plus fin aux hanches, plein au milieu, le poitrail large ; les deux bouts s'arrondissent (la croupe, le poitrail)
    // sur le pelage même, sans boule ajoutée d'une autre couleur
    const end = (t: number) => Math.sqrt(Math.max(0.02, 1 - (1 - Math.min(1, t)) ** 2))
    const torso = puff(arc(R, y, a0, a1), (u) => (0.135 + 0.03 * Math.sin(Math.PI * u) + 0.015 * u) * end(u / 0.18) * end((1 - u) / 0.14), {
      n: 48, radial: 22, up: 0.95, down: 0.72,
    })
    // la queue : elle sort du bout de la croupe (et en cache la pointe), tourne sur la gauche et revient devant, à plat sur la peau
    const tail = puff(
      [new Vector3(-0.17, 0.12, -0.02), new Vector3(-0.235, 0.11, 0.085), new Vector3(-0.34, 0.085, 0.24), new Vector3(-0.37, 0.07, 0.4), new Vector3(-0.29, 0.065, 0.53), new Vector3(-0.18, 0.06, 0.59)],
      (u) => 0.045 + 0.05 * Math.sin(Math.PI * Math.pow(u, 0.75)),
      { n: 28, radial: 16, up: 0.85, down: 0.55 },
    )
    return { torso, tail }
  }, [])
  useFrame((_, delta) => {
    const dt = Math.min(delta, 0.05), k = st.current
    if (reduceMotion) return
    k.ph += dt * 1.3
    body.current.scale.set(1 + Math.sin(k.ph) * 0.015, 1 + Math.sin(k.ph) * 0.035, 1 + Math.sin(k.ph) * 0.015)
    // une oreille frémit : un petit battement amorti
    k.next -= dt
    if (k.next <= 0) {
      k.next = rand(6, 14)
      k.flick = 1
      k.ear = Math.random() < 0.5 ? 0 : 1
    }
    k.flick = Math.max(0, k.flick - dt * 1.8)
    ears.current.forEach((e, i) => {
      const w = i === k.ear ? Math.sin(k.flick * Math.PI * 5) * k.flick * 0.35 : 0
      e.rotation.x = (i ? 1 : -1) * 0.3 + w
    })
  })
  return (
    <group position={position} rotation-y={ry} userData={LIVE}>
      <group ref={body}>
        <Static>
          <mesh geometry={geo.torso} material={I.huskyCoat} castShadow receiveShadow />
          {/* la patte arrière repliée qui dépasse sous la croupe */}
          <Part geo={SPH} m={I.huskyLight} scale={[0.06, 0.04, 0.1]} p={[-0.13, 0.04, 0.2]} rotation-y={0.4} castShadow={false} />
          {/* la collerette blanche du poitrail, gonflée, en trois touffes, sous la tête */}
          <Part geo={SPH} m={I.huskyLight} scale={[0.13, 0.11, 0.11]} p={[0.18, 0.12, 0.2]} />
          <Part geo={SPH} m={I.huskyLight} scale={[0.1, 0.08, 0.09]} p={[0.11, 0.09, 0.25]} castShadow={false} />
          <Part geo={SPH} m={I.huskyLight} scale={[0.09, 0.08, 0.08]} p={[0.25, 0.1, 0.17]} castShadow={false} />
        </Static>
      </group>
      <Static>
        {/* la queue en panache et son bout blanc arrondi */}
        <mesh geometry={geo.tail} material={I.huskyTail} castShadow receiveShadow />
        <Part geo={SPH} m={I.huskyLight} scale={[0.05, 0.035, 0.05]} p={[-0.18, 0.06, 0.59]} castShadow={false} />
        {/* les pattes avant tendues sous le menton, blanches, leurs coussinets en trois doigts */}
        {[0, 1].map((i) => {
          const sx = 0.17 + i * 0.053, sz = 0.2 + i * 0.0525, ex = sx + F.x * 0.27, ez = sz + F.z * 0.27
          return (
            <group key={i}>
              <Part geo={cyl(0.042, 0.04, 0.27, 12)} m={I.huskyLight} p={[(sx + ex) / 2, 0.042, (sz + ez) / 2]} rotation={[Math.PI / 2, 0, LEG_RZ]} />
              <Part geo={SPH} m={I.huskyLight} scale={[0.055, 0.04, 0.05]} p={[ex, 0.04, ez]} rotation-y={HEAD_RY} />
              {[-1, 0, 1].map((t) => (
                <Part key={t} geo={SPH_LO} m={I.huskyLight} scale={0.019} p={[ex + F.x * 0.045 + F.z * t * 0.026, 0.024, ez + F.z * 0.045 - F.x * t * 0.026]} castShadow={false} />
              ))}
            </group>
          )
        })}
        {/* sa gamelle émaillée, quelques croquettes dedans ; l'os à ronger près des pattes */}
        <Vessel p={[0.55, 0, -0.12]} rt={0.085} rb={0.07} h={0.05} m={I.enamel} inner={I.enamelIn} rim={I.enamelRim} />
        {[[0.02, 0.01], [-0.02, 0.025], [0.01, -0.025], [-0.025, -0.01], [0.03, -0.01]].map(([x, z], i) => (
          <Part key={i} geo={SPH_LO} m={I.crateDark} scale={[0.016, 0.011, 0.016]} p={[0.55 + x, 0.026, -0.12 + z]} castShadow={false} />
        ))}
        <group position={[0.33, 0.02, 0.5]} rotation-y={0.5}>
          <Part geo={cyl(0.016, 0.016, 0.13, 10)} m={I.wool} rotation-z={Math.PI / 2} />
          {[-1, 1].map((sx) => [-1, 1].map((sz) => <Part key={`${sx}${sz}`} geo={SPH_LO} m={I.wool} scale={0.024} p={[sx * 0.07, 0.002, sz * 0.017]} castShadow={false} />))}
        </group>
      </Static>
      {/* la tête posée sur les pattes, le menton un peu baissé */}
      <group position={H} rotation-y={HEAD_RY}>
        <group rotation-z={-0.1}>
          <Static>
            {/* le masque blanc (la base), la calotte grise posée dessus vers l'arrière, la raie sombre du front */}
            <Part geo={SPH} m={I.huskyLight} scale={[0.13, 0.115, 0.12]} />
            <Part geo={SPH} m={I.husky} scale={[0.122, 0.108, 0.118]} p={[-0.028, 0.03, 0]} />
            <Part geo={SPH} m={I.husky} scale={[0.04, 0.05, 0.016]} p={[0.078, 0.06, 0]} castShadow={false} />
            {/* les joues blanches, ébouriffées, qui débordent sur les côtés */}
            {[-1, 1].map((s) => (
              <Part key={s} geo={SPH} m={I.huskyLight} scale={[0.07, 0.065, 0.05]} p={[0.03, -0.045, s * 0.09]} castShadow={false} />
            ))}
            {/* le museau, en deux volumes, la truffe */}
            <Part geo={SPH} m={I.huskyLight} scale={[0.085, 0.055, 0.065]} p={[0.13, -0.035, 0]} />
            <Part geo={SPH} m={I.huskyLight} scale={[0.05, 0.045, 0.05]} p={[0.19, -0.035, 0]} castShadow={false} />
            <Part geo={SPH} m={I.nose} scale={[0.025, 0.02, 0.032]} p={[0.235, -0.02, 0]} castShadow={false} />
            {[-1, 1].map((s) => (
              <group key={s}>
                {/* l'œil fermé, un trait courbe, et la tache claire au-dessus, sur la calotte */}
                <Part m={I.huskyDark} p={[0.11, 0.018, s * 0.06]} rotation={[0, s > 0 ? 1.0 : 2.14, Math.PI]} castShadow={false}>
                  <torusGeometry args={[0.02, 0.005, 6, 12, Math.PI]} />
                </Part>
                <Part geo={SPH} m={I.huskyLight} scale={[0.025, 0.016, 0.02]} p={[0.07, 0.065, s * 0.055]} castShadow={false} />
              </group>
            ))}
            {/* le collier autour du cou, juste derrière la tête, et sa médaille de laiton */}
            <Part m={I.collar} p={[-0.1, -0.03, 0]} rotation-y={Math.PI / 2} castShadow={false}>
              <torusGeometry args={[0.1, 0.016, 8, 28]} />
            </Part>
            <Part geo={cyl(0.026, 0.026, 0.007, 16)} m={I.brass} p={[-0.095, -0.1, -0.075]} rotation-x={(-3 * Math.PI) / 4} castShadow={false} />
          </Static>
          {/* les oreilles dressées, un peu couchées vers l'arrière (il dort), leur intérieur rose ; elles frémissent parfois */}
          {[-1, 1].map((s, i) => (
            <group key={s} ref={(el) => void (el && (ears.current[i] = el))} position={[-0.035, 0.095, s * 0.06]} rotation={[s * 0.3, 0, 0.35]}>
              {/* (un tronc de cône : le bout de l'oreille reste rond, rien de pointu) */}
              <Part geo={cyl(0.014, 0.054, 0.09, 16)} m={I.husky} p={[0, 0.045, 0]} scale={[0.45, 1, 1]} />
              <Part geo={cyl(0.008, 0.032, 0.07, 12)} m={I.earPink} p={[0.015, 0.04, 0]} scale={[0.3, 1, 1]} castShadow={false} />
            </group>
          ))}
        </group>
      </group>
    </group>
  )
}
