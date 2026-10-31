import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { Color, type Group } from 'three'
import { Batch, Part, SPH, cyl, type Item } from '../parts'
import { blob, cone, ell, pair } from '../blob'
import { reduceMotion } from '../anim'
import { LIVE } from '../Static'
import { Vessel } from '../igloo/Vessel'
import { K } from './materials'

// Le skye terrier, d'une seule peau (blob), dans son repère : le museau vers +x, le sol (le dessus du coussin) à y = 0.
// Le plus gros volume d'abord ; le long poil qui tombe jusqu'au coussin, la frange sur les yeux, les oreilles frangées qui
// retombent, la queue en panache enroulée devant, les pattes avant allongées sous le menton.
const SILVER = 0x8d8794, LIGHT = 0xb9b3bd, NOSE = 0x2a2430
const pale = new Color(LIGHT), deep = new Color(0x6f6976)
const DOG = blob(
  [
    ell([-0.03, 0.1, 0], [0.27, 0.11, 0.18], { color: SILVER, k: 0.06 }),
    // la jupe de poil, plus claire, qui s'étale sur le coussin
    ell([-0.03, 0.045, 0], [0.31, 0.045, 0.21], { color: LIGHT, k: 0.06 }),
    ell([-0.15, 0.15, 0], [0.13, 0.07, 0.15], { color: SILVER, k: 0.06 }),
    // la tête posée sur les pattes, le museau, la truffe
    ell([0.24, 0.1, 0.06], [0.1, 0.085, 0.09], { color: SILVER, k: 0.05 }),
    ell([0.33, 0.075, 0.07], [0.065, 0.045, 0.055], { color: LIGHT, k: 0.03 }),
    ell([0.392, 0.087, 0.072], [0.02, 0.017, 0.021], { color: NOSE, k: 0.012 }),
    // la frange qui couvre les yeux
    ell([0.28, 0.15, 0.065], [0.075, 0.035, 0.09], { color: LIGHT, k: 0.03, rot: [0, 0, -0.35] }),
    // les oreilles frangées, tombantes
    ...pair(ell([0.2, 0.1, 0.155], [0.04, 0.085, 0.045], { color: SILVER, k: 0.025, rot: [0.45, 0, 0.1] })).map((b) => (b.t === 'ell' ? { ...b, c: [b.c[0], b.c[1], b.c[2] + 0.06] as [number, number, number] } : b)),
    // les pattes avant, allongées
    cone([0.14, 0.03, 0.0], [0.33, 0.028, -0.01], 0.032, 0.03, { color: LIGHT, k: 0.02 }),
    cone([0.14, 0.03, 0.13], [0.3, 0.028, 0.16], 0.032, 0.03, { color: LIGHT, k: 0.02 }),
    // la queue en panache, enroulée devant le corps
    cone([-0.26, 0.06, 0.1], [-0.12, 0.05, 0.2], 0.045, 0.05, { color: LIGHT, k: 0.03 }),
    cone([-0.12, 0.05, 0.2], [0.04, 0.045, 0.21], 0.05, 0.035, { color: LIGHT, k: 0.03 }),
  ],
  {
    h: 0.014,
    k: 0.05,
    // de longues mèches : des stries qui descendent, plus claires et plus sombres
    paint: (p, c) => {
      if (c.r < 0.2) return c
      const s = Math.sin(p.x * 70 + Math.sin(p.z * 30) * 2) * Math.sin(p.z * 55 + p.x * 9)
      return c.lerp(s > 0 ? pale : deep, Math.abs(s) * 0.22)
    },
  },
)
const KIBBLE: Item[] = [[0.02, 0.01], [-0.025, 0.015], [0.0, -0.025], [0.03, -0.02], [-0.02, -0.01]].map(([x, z], i) => ({ p: [x, 0.055 + (i % 2) * 0.008, z], s: 0.017 }))

/**
 * Un skye terrier qui dort en boule sur son coussin, près du feu : long poil gris argent qui tombe jusqu'au sol,
 * frange sur les yeux, oreilles frangées. Clin d'œil à Greyfriars Bobby, le chien le plus célèbre d'Édimbourg.
 */
export function Terrier() {
  const body = useRef<Group>(null!), ph = useRef(0)
  useFrame((_, delta) => {
    if (reduceMotion) return
    ph.current = (ph.current + Math.min(delta, 0.05) * 1.9) % (Math.PI * 2)
    const b = Math.sin(ph.current) * 0.5 + 0.5
    body.current.scale.set(1 + b * 0.015, 1 + b * 0.035, 1 + b * 0.02)
  })
  return (
    <group position={[-1.82, 0, 0.62]} rotation-y={0.75}>
      {/* le coussin de velours vert, son bourrelet crème */}
      <Part geo={cyl(0.44, 0.46, 0.09, 28)} m={K.velvet} p={[0, 0.045, 0]} />
      <Part m={K.cream} p={[0, 0.1, 0]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.4, 0.07, 10, 28]} />
      </Part>
      {/* à l'échelle du creux du coussin (le bourrelet commence à 0,33 du centre) : ni la jupe de poil ni le museau n'y entrent */}
      <group position={[-0.03, 0.09, -0.02]} scale={0.82}>
        <group ref={body} userData={LIVE}>
          <Part geo={DOG} m={K.fur} />
        </group>
      </group>
      {/* sa gamelle, ouverte, quelques croquettes au fond */}
      <Vessel p={[0.5, 0, -0.32]} rt={0.085} rb={0.1} h={0.07} m={K.burgundy} inner={K.cupInner} t={0.012} />
      <group position={[0.5, 0, -0.32]}>
        <Batch geo={SPH} m={K.scone} items={KIBBLE} />
      </group>
    </group>
  )
}
