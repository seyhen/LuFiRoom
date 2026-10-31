import { CanvasTexture } from 'three'
import { M, gummy } from '../materials'
import { Part, SPH, cyl, rbox } from '../parts'
import { makeCanvas } from '../textures'
import { Vessel, innerR } from '../igloo/Vessel'
import { K } from './materials'

// Une page imprimée : un titre de chapitre, une lettrine, des lignes de texte grises (lisibles comme du texte, pas comme du bruit).
const page = (() => {
  const [c, x] = makeCanvas(128, 176)
  x.fillStyle = '#fbf3e4'; x.fillRect(0, 0, 128, 176)
  x.fillStyle = '#7a2e3a'; x.fillRect(14, 16, 22, 22)
  x.fillStyle = '#5b5560'
  x.fillRect(42, 20, 60, 6)
  for (let i = 0; i < 13; i++) {
    const y = 46 + i * 9.5, w = i === 12 ? 52 : 100 - ((i * 37) % 11)
    x.globalAlpha = 0.55
    x.fillRect(14, y, w, 3.5)
  }
  x.globalAlpha = 1
  return gummy(0xffffff, { map: new CanvasTexture(c), roughness: 0.8, clearcoat: 0.05 })
})()
import { Candle } from '../objects/Candle'
import { Steam } from '../objects/Steam'

/** Chaise de bistrot en bois courbé, dossier rond. */
export function BistroChair({ position, rotation = 0, seat = M.pink }: { position: [number, number, number]; rotation?: number; seat?: typeof M.pink }) {
  return (
    <group position={position} rotation-y={rotation}>
      {[[-0.15, -0.15], [0.15, -0.15], [-0.15, 0.15], [0.15, 0.15]].map(([x, z]) => (
        // les pieds s'écartent vers le bas (le haut penche vers le centre) : vérifié de face
        <Part key={`${x}${z}`} geo={cyl(0.02, 0.018, 0.48, 8)} m={K.walnut} p={[x * 1.1, 0.24, z * 1.1]} rotation={[-z * 0.45, 0, x * 0.45]} />
      ))}
      <Part geo={cyl(0.22, 0.22, 0.05, 22)} m={K.walnut} p={[0, 0.49, 0]} />
      <Part geo={cyl(0.19, 0.19, 0.04, 22)} m={seat} p={[0, 0.53, 0]} />
      {[-0.13, 0.13].map((x) => (
        <Part key={x} geo={cyl(0.016, 0.016, 0.46, 8)} m={K.walnut} p={[x, 0.75, -0.19]} />
      ))}
      <Part m={K.walnut} p={[0, 0.98, -0.19]} rotation-x={Math.PI / 2}>
        <torusGeometry args={[0.13, 0.02, 8, 18, Math.PI]} />
      </Part>
    </group>
  )
}

/**
 * Table de lecture, au milieu : plateau de marbre sur pied de fonte, un livre ouvert (on lit le texte), un thé, un scone, une bougie à côté.
 * Quelqu'un vient de se lever : sa chaise est tirée, son pull sur le dossier.
 */
export function ReadingTable() {
  return (
    <group position={[1.1, 0, 1.3]}>
      <Part geo={cyl(0.46, 0.46, 0.05, 32)} m={K.marble} p={[0, 0.78, 0]} />
      <Part geo={cyl(0.48, 0.48, 0.02, 32)} m={K.walnut} p={[0, 0.75, 0]} castShadow={false} />
      <Part geo={cyl(0.04, 0.06, 0.72, 12)} m={K.iron} p={[0, 0.38, 0]} />
      <Part geo={cyl(0.22, 0.26, 0.04, 22)} m={K.iron} p={[0, 0.02, 0]} />
      {/* le livre ouvert : couverture bordeaux, deux blocs de pages qui remontent vers le dos, le texte imprimé, le signet */}
      <group position={[-0.1, 0.805, 0.06]} rotation-y={0.5}>
        <Part geo={rbox(0.48, 0.014, 0.32, 0.006)} m={K.burgundy} p={[0, 0.007, 0]} castShadow={false} />
        {[-1, 1].map((s) => (
          <group key={s} position={[s * 0.115, 0.03, 0]} rotation-z={s * -0.07}>
            <Part geo={rbox(0.215, 0.028, 0.295, 0.008)} m={M.cream} castShadow={false} />
            <mesh position={[0, 0.0205, 0]} rotation-x={-Math.PI / 2} material={page}>
              <planeGeometry args={[0.19, 0.27]} />
            </mesh>
          </group>
        ))}
        <Part geo={rbox(0.012, 0.03, 0.3, 0.005)} m={K.burgundy} p={[0, 0.03, 0]} castShadow={false} />
        <Part geo={rbox(0.014, 0.004, 0.12, 0.002)} m={K.mustard} p={[0.02, 0.003, 0.21]} rotation-y={0.15} castShadow={false} />
      </group>
      {/* le thé, le scone à la confiture */}
      <Part geo={cyl(0.08, 0.075, 0.012, 20)} m={M.cream} p={[0.22, 0.81, -0.12]} castShadow={false} />
      <Vessel p={[0.22, 0.816, -0.12]} rt={0.05} rb={0.04} h={0.07} m={K.teal} inner={K.cupInner} t={0.008} />
      <Part geo={cyl(innerR(0.05, 0.04, 0.07, 0.055, 0.008), innerR(0.05, 0.04, 0.07, 0.055, 0.008), 0.006, 18)} m={K.tea} p={[0.22, 0.816 + 0.055, -0.12]} castShadow={false} />
      <Part m={K.teal} p={[0.275, 0.855, -0.12]} castShadow={false}>
        <torusGeometry args={[0.022, 0.008, 6, 12]} />
      </Part>
      <Steam at={[0.22, 0.9, -0.12]} />
      <Part geo={cyl(0.1, 0.09, 0.012, 22)} m={M.cream} p={[-0.2, 0.81, -0.22]} castShadow={false} />
      <Part geo={SPH} m={K.scone} scale={[0.06, 0.04, 0.06]} p={[-0.2, 0.845, -0.22]} />
      <Part geo={SPH} m={K.berry} scale={[0.035, 0.012, 0.035]} p={[-0.2, 0.882, -0.22]} castShadow={false} />
      <Candle position={[0.3, 0.805, 0.2]} holder="jar" height={0.08} radius={0.035} />
      <BistroChair position={[-0.62, 0, -0.38]} rotation={0.95} seat={M.pink} />
      <group>
        <BistroChair position={[0.72, 0, 0.42]} rotation={-2.3} seat={M.butter} />
        {/* le pull vert laissé sur le dossier */}
        <group position={[0.86, 0.94, 0.56]} rotation-y={-2.3}>
          <Part geo={rbox(0.34, 0.12, 0.08, 0.04)} m={K.jumper} />
          <Part geo={rbox(0.08, 0.3, 0.06, 0.03)} m={K.jumper} p={[-0.13, -0.17, 0.02]} rotation-z={0.15} castShadow={false} />
        </group>
      </group>
    </group>
  )
}
