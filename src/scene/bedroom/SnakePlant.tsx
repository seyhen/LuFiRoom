import { CanvasTexture, ExtrudeGeometry, RepeatWrapping, Shape } from 'three'
import { seeded } from '../../math'
import { M, gummy } from '../materials'
import { Part, SPH, cyl, type V3 } from '../parts'
import { makeCanvas } from '../textures'
import { Vessel, innerR } from '../igloo/Vessel'
import { B } from './materials'

// La sansevière : de vraies lames, plates et épaisses comme des feuilles grasses, larges au tiers et arrondies au bout, vert sombre
// barré de vagues plus claires, bordées d'un liseré beurre (une lame un peu plus grande, derrière). Elles se dressent en éventail
// depuis la terre d'un pot ouvert (on voit la terre, rien ne la couvre), quelques galets dessus.
const [cv, x] = makeCanvas(128, 256)
x.fillStyle = '#2f7d5c'
x.fillRect(0, 0, 128, 256)
const rnd = seeded(11)
for (let i = 0; i < 9; i++) {
  const y0 = (i / 9) * 256 + rnd() * 10
  x.strokeStyle = i % 2 ? 'rgba(160,214,170,0.55)' : 'rgba(120,190,140,0.5)'
  x.lineWidth = 5 + rnd() * 5
  x.beginPath()
  for (let u = 0; u <= 128; u += 8) x.lineTo(u, y0 + Math.sin(u / 18 + i) * 6)
  x.stroke()
}
const bands = new CanvasTexture(cv)
bands.wrapS = bands.wrapT = RepeatWrapping
// les UV d'une forme extrudée sont ses coordonnées (en unités) : une période de bandes tous les 0,28 en hauteur
bands.repeat.set(5, 3.6)
const blade = gummy(0xffffff, { map: bands, roughness: 0.5, clearcoat: 0.45 })
const margin = gummy(0xe9d27a, { roughness: 0.55, clearcoat: 0.35 })

function leaf(w: number, h: number, t: number, lean: number) {
  const s = new Shape()
  s.moveTo(-w * 0.32, 0)
  s.bezierCurveTo(-w * 0.62, h * 0.32, -w * 0.5, h * 0.72, -w * 0.14, h * 0.95)
  s.quadraticCurveTo(0, h * 1.02, w * 0.14, h * 0.95)
  s.bezierCurveTo(w * 0.5, h * 0.72, w * 0.62, h * 0.32, w * 0.32, 0)
  s.closePath()
  const g = new ExtrudeGeometry(s, { depth: t, bevelEnabled: true, bevelThickness: t * 0.5, bevelSize: t * 0.45, bevelSegments: 2, curveSegments: 8 })
  g.translate(0, 0, -t / 2)
  // la lame se courbe un peu vers l'avant en montant
  const p = g.attributes.position
  for (let i = 0; i < p.count; i++) {
    const v = p.getY(i) / h
    p.setZ(i, p.getZ(i) + lean * v * v)
  }
  g.computeVertexNormals()
  return g
}

// [hauteur, largeur, azimut, inclinaison vers l'extérieur, décalage du pied]
const BLADES: [number, number, number, number, number][] = [
  [0.92, 0.15, 0.4, 0.06, 0.0],
  [0.8, 0.14, 2.3, 0.12, 0.05],
  [0.74, 0.13, 4.4, 0.14, 0.06],
  [0.66, 0.13, 1.2, 0.2, 0.08],
  [0.6, 0.12, 3.3, 0.22, 0.08],
  [0.55, 0.12, 5.4, 0.24, 0.09],
  [0.42, 0.11, 0.1, 0.3, 0.1],
]
const T = 0.022
const LEAVES = BLADES.map(([h, w, a, tilt, r]) => ({ g: leaf(w, h, T, 0.05 + tilt * 0.2), m: leaf(w + 0.016, h + 0.012, T * 0.6, 0.05 + tilt * 0.2), a, tilt, r }))

const POT = { rt: 0.19, rb: 0.15, h: 0.32 }
const SOIL_Y = 0.27

/** Sansevière dans un pot menthe, au bout du bureau. */
export function SnakePlant({ position = [3.0, 0, -1.7] }: { position?: V3 }) {
  return (
    <group position={position}>
      <Vessel p={[0, 0, 0]} rt={POT.rt} rb={POT.rb} h={POT.h} m={M.mint} inner={B.potInner} rim={B.trim} t={0.016} />
      <Part geo={cyl(innerR(POT.rt, POT.rb, POT.h, SOIL_Y, 0.016), innerR(POT.rt, POT.rb, POT.h, SOIL_Y, 0.016), 0.02, 24)} m={B.soil} p={[0, SOIL_Y, 0]} castShadow={false} />
      {[[0.09, 0.07], [-0.1, 0.06], [0.05, -0.11]].map(([px, pz], i) => (
        <Part key={i} geo={SPH} m={M.cream} scale={[0.028, 0.016, 0.022]} p={[px, SOIL_Y + 0.012, pz]} rotation-y={i} />
      ))}
      {LEAVES.map(({ g, m, a, tilt, r }, i) => (
        <group key={i} position={[Math.cos(a) * r, SOIL_Y - 0.03, Math.sin(a) * r]} rotation-y={-a + Math.PI / 2}>
          <group rotation-x={tilt}>
            <Part geo={g} m={blade} />
            <Part geo={m} m={margin} p={[0, -0.006, 0]} castShadow={false} />
          </group>
        </group>
      ))}
    </group>
  )
}
