import { useMemo, useRef } from 'react'
import { CanvasTexture, MeshBasicMaterial } from 'three'
import { Part, SPH, cyl, rbox } from '../parts'
import { reduceMotion } from '../anim'
import { useBeat } from '../objects/useBeat'
import { makeCanvas } from '../textures'
import { K } from './materials'

/** Le meuble télé : son pied au sol, contre le mur de gauche, tourné vers la caméra. */
export const TV = { x: -2.4, z: 2.3 }
const SW = 96, SH = 72

/**
 * Le vieux poste de télévision, sur son meuble bas : un tube cathodique dans un coffre de bois, deux boutons, des oreilles de
 * lapin. Éteint, l'écran est un verre gris sombre ; allumé, il passe en boucle une émission de nuit (un soleil rose, des collines
 * de pixels, des lignes de balayage), l'image saute sur chaque kick et des notes s'en échappent. C'est l'objet « radio » du marché.
 */
export function TVSet() {
  const { map, mat, ctx } = useMemo(() => {
    const [c, x] = makeCanvas(SW, SH)
    const tex = new CanvasTexture(c)
    return { map: tex, mat: new MeshBasicMaterial({ map: tex, color: 0x20232a }), ctx: x }
  }, [])
  const lastRef = useRef({ t: -1 }), last = lastRef.current
  const { g, notes } = useBeat([TV.x, 1.2, TV.z], 0.55, (on, t, pulse) => {
    const level = on ? 0.8 + pulse * 0.2 : 0.12
    mat.color.setScalar(level)
    if (on && t - last.t > (reduceMotion ? 1 : 0.09)) {
      last.t = t
      const hue = (t * 14) % 360, glitch = !reduceMotion && Math.sin(t * 1.7) > 0.96
      const sky = ctx.createLinearGradient(0, 0, 0, SH)
      sky.addColorStop(0, `hsl(${(hue + 250) % 360},60%,22%)`); sky.addColorStop(1, `hsl(${(hue + 330) % 360},80%,62%)`)
      ctx.fillStyle = sky; ctx.fillRect(0, 0, SW, SH)
      ctx.fillStyle = `hsl(${(hue + 20) % 360},90%,78%)`; ctx.beginPath(); ctx.arc(SW * 0.62, 34 + Math.sin(t * 0.6) * 3, 12 + pulse * 3, 0, Math.PI * 2); ctx.fill()
      ctx.fillStyle = `hsl(${(hue + 260) % 360},40%,16%)`
      ctx.beginPath(); ctx.moveTo(0, SH); for (let px = 0; px <= SW; px += 8) ctx.lineTo(px, 50 + Math.sin(px * 0.13 + t * 0.4) * 6 + Math.sin(px * 0.31) * 3); ctx.lineTo(SW, SH); ctx.fill()
      if (glitch) { ctx.fillStyle = 'rgba(255,255,255,.55)'; ctx.fillRect(0, (t * 40) % SH, SW, 3) }
      ctx.fillStyle = 'rgba(0,0,0,.22)'
      for (let py = 0; py < SH; py += 3) ctx.fillRect(0, py, SW, 1)
      map.needsUpdate = true
    } else if (!on && last.t !== -2) {
      last.t = -2
      ctx.fillStyle = '#262a30'; ctx.fillRect(0, 0, SW, SH)
      ctx.fillStyle = 'rgba(255,255,255,.07)'; ctx.fillRect(8, 6, 30, 3); ctx.fillRect(8, 6, 3, 18)
      map.needsUpdate = true
    }
  }, 0.03)
  return (
    <>
      <group position={[TV.x, 0, TV.z]} rotation-y={Math.PI / 4}>
        {/* le meuble bas : caisson, tablette, cassettes vidéo, pieds */}
        <Part geo={rbox(0.86, 0.5, 0.62, 0.05)} m={K.wood} p={[0, 0.34, 0]} />
        <Part geo={rbox(0.78, 0.2, 0.5, 0.03)} m={K.woodDark} p={[0, 0.31, 0.06]} castShadow={false} />
        {[-0.28, -0.2, -0.13, -0.05].map((x, i) => (
          <Part key={x} geo={rbox(0.05, 0.16, 0.18, 0.008)} m={[K.red, K.teal, K.yellow, K.cream][i]} p={[x, 0.31, 0.18]} castShadow={false} />
        ))}
        {[-0.36, 0.36].flatMap((x) => [-0.24, 0.24].map((z) => <Part key={`${x}${z}`} geo={cyl(0.03, 0.022, 0.1, 8)} m={K.woodDark} p={[x, 0.05, z]} />))}
        <group position={[0, 0.6, 0]}>
          <group ref={g} userData={{ id: 'radio' }}>
            {/* le coffre du poste, son cadre biseauté, l'écran bombé, les deux boutons, la grille du haut-parleur */}
            <Part geo={rbox(0.78, 0.6, 0.56, 0.07)} m={K.woodDark} p={[0, 0.3, 0]} />
            <Part geo={rbox(0.54, 0.44, 0.04, 0.03)} m={K.iron} p={[-0.07, 0.3, 0.28]} />
            <mesh material={mat} position={[-0.07, 0.3, 0.302]}>
              <planeGeometry args={[0.46, 0.35]} />
            </mesh>
            <Part geo={cyl(0.03, 0.03, 0.03, 12)} m={K.steel} p={[0.27, 0.42, 0.285]} rotation-x={Math.PI / 2} castShadow={false} />
            <Part geo={cyl(0.03, 0.03, 0.03, 12)} m={K.steel} p={[0.27, 0.32, 0.285]} rotation-x={Math.PI / 2} castShadow={false} />
            {[0, 1, 2, 3, 4].map((i) => (
              <Part key={i} geo={rbox(0.1, 0.01, 0.01, 0.003)} m={K.iron} p={[0.27, 0.18 + i * 0.022, 0.285]} castShadow={false} />
            ))}
            {/* l'antenne : un socle, deux brins en V */}
            <Part geo={SPH} m={K.iron} scale={[0.07, 0.03, 0.06]} p={[0, 0.62, 0]} castShadow={false} />
            <Part geo={cyl(0.005, 0.005, 0.5, 4)} m={K.steel} p={[-0.12, 0.84, 0]} rotation-z={0.5} castShadow={false} />
            <Part geo={cyl(0.005, 0.005, 0.46, 4)} m={K.steel} p={[0.12, 0.83, 0.02]} rotation-z={-0.5} castShadow={false} />
          </group>
        </group>
      </group>
      <group ref={notes.group} />
    </>
  )
}
