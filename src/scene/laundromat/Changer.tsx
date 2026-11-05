import { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, MeshStandardMaterial, type Group, type Mesh, type Sprite } from 'three'
import { isActive, useStore } from '../../state/store'
import { clamp, smooth } from '../../math'
import { mood, useSquash } from '../anim'
import { glowTex } from '../textures'
import { Part, SPH, cyl, noRay, rbox, type V3 } from '../parts'
import { LIVE, Static } from '../Static'
import { L } from './materials'
import { canvasTex } from '../paint'
import { soapBoxTex } from './textures'

const W = 0.62, D = 0.44, H = 1.72, F = D / 2 // F : la face avant
const TRAY = { y: 0.2, z: F + 0.05 } // le fond du bac de rendu
// Les pièces d'une poignée : les mêmes instants que le son (channels/coins.ts, `COIN_AT`) et leur place au fond du bac.
const COIN_AT = [0.16, 0.29, 0.37, 0.5, 0.57, 0.68]
const REST: [number, number, number][] = [[-0.05, 0, 0.0], [0.03, 0.004, -0.01], [0.07, 0, 0.02], [-0.01, 0.007, 0.015], [-0.07, 0.003, -0.015], [0.01, 0.011, 0.0]]
const HOLD = 4.2 // le temps qu'elles restent dans le bac avant qu'on les ramasse

const SOAPS = [
  soapBoxTex('#3f8ad8', '#2a63b8', 'BLEU'), soapBoxTex('#f08aa8', '#b8466a', 'DOUX'), soapBoxTex('#9fe0c4', '#2f8a5a', 'FRAIS'), soapBoxTex('#f6d77a', '#c07a2a', 'SOLEIL'),
].map((t) => new MeshStandardMaterial({ map: t, roughness: 0.6, emissive: 0xffd8a0, emissiveMap: t, emissiveIntensity: 0.18 }))
const BOX_COLORS = [L.capBlue, L.capPink, L.bottleGreen, L.butter]
const note = new MeshStandardMaterial({
  map: canvasTex(192, 128, (x) => {
    x.fillStyle = '#fff8cc'; x.fillRect(0, 0, 192, 128)
    x.fillStyle = '#2b3a44'; x.font = '700 22px "Nunito", sans-serif'; x.textAlign = 'center'
    ;['ne rend pas', 'les pièces', 'de 2 € !'].forEach((l, i) => x.fillText(l, 96, 38 + i * 30))
    x.fillStyle = 'rgba(200,210,215,.7)'; x.fillRect(70, 0, 52, 14)
  }),
  roughness: 0.9,
})

/**
 * Le distributeur de lessive et de monnaie, contre le mur du fond près de la porte : la caisse bleu lessive, le bandeau lumineux,
 * la vitrine chaude où attendent les boîtes de lessive sur leurs étagères (la touche chaude de la laverie), les boutons de choix,
 * le monnayeur (écran, fente des billets et des pièces), le bac de rendu, le petit mot scotché par un habitué. Quand son son joue,
 * à chaque poignée de monnaie qu'on entend tomber (`pulses.coins`), les pièces tombent dans le bac au même instant, puis on les
 * ramasse.
 */
export function Changer({ position }: { position: V3 }) {
  const g = useRef<Group>(null!), coins = useRef<(Mesh | null)[]>([]), glow = useRef<Sprite>(null!)
  const st = useRef({ seen: useStore.getState().pulses.coins ?? 0, t: 99, n: 0 })
  useSquash('changer', g)
  useFrame((_, delta) => {
    const s = st.current, store = useStore.getState(), p = store.pulses.coins ?? 0, nt = smooth(mood.night)
    glow.current.material.opacity = 0.05 + nt * 0.4
    L.dispenserGlow.emissiveIntensity = 0.55 + nt * 0.4
    if (p !== s.seen) {
      s.seen = p
      if (isActive(store, 'changer')) {
        s.t = 0
        s.n = 3 + ((p - 1) % 4)
      }
    }
    s.t += Math.min(delta, 0.05)
    COIN_AT.forEach((at, i) => {
      const m = coins.current[i]
      if (!m) return
      const k = s.t - at, show = i < s.n && k > -0.12 && s.t < HOLD + 0.3
      m.visible = show
      if (!show) return
      const [rx, ry, rz] = REST[i]
      // la chute (0,12 s avant l'impact), un petit rebond, puis la pièce se couche ; on les ramasse au bout de HOLD secondes
      const fall = clamp(-k / 0.12, 0, 1), bounce = k > 0 ? Math.max(0, Math.sin(clamp(k / 0.14, 0, 1) * Math.PI)) * 0.018 : 0
      m.position.set(rx * (1 - fall), TRAY.y + 0.014 + ry + fall * fall * 0.11 + bounce, TRAY.z - 0.01 + rz * (1 - fall))
      m.rotation.set(fall * 1.4 + (k > 0 ? Math.max(0, 0.3 - k) : 0), i, 0)
      m.scale.setScalar(s.t > HOLD ? Math.max(0.01, 1 - (s.t - HOLD) / 0.3) : 1)
    })
  })
  return (
    <group ref={g} userData={{ id: 'changer' }} position={position}>
      <Static>
        {/* la caisse, son socle, son chapeau */}
        {/* la caisse est creuse à l'endroit de la vitrine : le bas, le haut, le fond et les deux montants */}
        <Part geo={rbox(W, 0.9, D, 0.05)} m={L.dispenserBody} p={[0, 0.45, 0]} />
        <Part geo={rbox(W, H - 1.5, D, 0.05)} m={L.dispenserBody} p={[0, (H + 1.5) / 2, 0]} />
        <Part geo={rbox(W, 0.7, D - 0.18, 0.04)} m={L.dispenserBody} p={[0, 1.2, -0.09]} />
        {[-1, 1].map((sd) => (
          <Part key={sd} geo={rbox(0.07, 0.7, D, 0.03)} m={L.dispenserBody} p={[sd * (W / 2 - 0.035), 1.2, 0]} />
        ))}
        <Part geo={rbox(W + 0.02, 0.06, D + 0.02, 0.02)} m={L.steelDark} p={[0, 0.03, 0]} castShadow={false} />
        <Part geo={rbox(W + 0.03, 0.05, D + 0.03, 0.02)} m={L.steel} p={[0, H + 0.01, 0]} castShadow={false} />
        {/* le bandeau lumineux et son cadre */}
        <Part geo={rbox(W - 0.04, 0.18, 0.02, 0.01)} m={L.steel} p={[0, H - 0.13, F + 0.005]} castShadow={false} />
        <mesh material={L.dispenserHead} position={[0, H - 0.13, F + 0.017]} raycast={noRay}>
          <planeGeometry args={[W - 0.1, (W - 0.1) / 4]} />
        </mesh>
        {/* la vitrine : le fond qui luit, trois étagères de boîtes, le verre, le cadre d'inox */}
        <mesh material={L.dispenserGlow} position={[0, 1.2, F - 0.175]} raycast={noRay}>
          <planeGeometry args={[W - 0.12, 0.62]} />
        </mesh>
        {[0, 1, 2].map((row) => (
          <group key={row} position={[0, 0.93 + row * 0.2, F - 0.1]}>
            <Part geo={rbox(W - 0.12, 0.012, 0.11, 0.004)} m={L.steel} p={[0, 0, 0]} castShadow={false} />
            {/* l'étiquette de prix au bord de l'étagère */}
            <Part geo={rbox(W - 0.12, 0.025, 0.006, 0.003)} m={L.butter} p={[0, -0.01, 0.056]} castShadow={false} />
            {[0, 1, 2, 3].map((k) => {
              const i = (k + row) % 4
              return (
                <group key={k} position={[-0.18 + k * 0.12, 0.072, 0]}>
                  <Part geo={rbox(0.09, 0.12, 0.08, 0.01)} m={BOX_COLORS[i]} castShadow={false} />
                  <mesh material={SOAPS[i]} position={[0, 0, 0.041]} raycast={noRay}>
                    <planeGeometry args={[0.084, 0.11]} />
                  </mesh>
                </group>
              )
            })}
          </group>
        ))}
        {[[0, 1.53, W - 0.06, 0.04], [0, 0.88, W - 0.06, 0.04]].map(([x, y, w, h], i) => (
          <Part key={i} geo={rbox(w, h, 0.03, 0.012)} m={L.steel} p={[x, y, F + 0.008]} castShadow={false} />
        ))}
        {[-1, 1].map((sd) => (
          <Part key={sd} geo={rbox(0.05, 0.69, 0.03, 0.012)} m={L.steel} p={[sd * (W / 2 - 0.055), 1.205, F + 0.008]} castShadow={false} />
        ))}
        <mesh material={L.glass} position={[0, 1.205, F + 0.012]} raycast={noRay}>
          <planeGeometry args={[W - 0.12, 0.62]} />
        </mesh>
        {/* le monnayeur, sous la vitrine : sa plaque, les boutons de choix de la lessive à côté */}
        <mesh material={L.changer} position={[-0.07, 0.58, F + 0.006]} raycast={noRay}>
          <planeGeometry args={[0.34, 0.425]} />
        </mesh>
        {[0, 1, 2, 3].map((k) => (
          <group key={k} position={[0.205, 0.76 - k * 0.1, F]}>
            <Part geo={cyl(0.03, 0.03, 0.03, 16)} m={L.chrome} rotation-x={Math.PI / 2} castShadow={false} />
            <Part geo={cyl(0.022, 0.022, 0.012, 16)} m={BOX_COLORS[k]} p={[0, 0, 0.016]} rotation-x={Math.PI / 2} castShadow={false} />
          </group>
        ))}
        {/* le bac de rendu : son creux sombre, son fond, ses côtés, sa lèvre basse et sa visière */}
        <mesh material={L.rubber} position={[0, TRAY.y + 0.06, F + 0.004]} raycast={noRay}>
          <planeGeometry args={[0.24, 0.13]} />
        </mesh>
        <Part geo={rbox(0.26, 0.014, 0.11, 0.005)} m={L.steel} p={[0, TRAY.y, TRAY.z - 0.005]} castShadow={false} />
        {[-1, 1].map((sd) => (
          <Part key={sd} geo={rbox(0.014, 0.1, 0.11, 0.005)} m={L.steel} p={[sd * 0.13, TRAY.y + 0.045, TRAY.z - 0.005]} castShadow={false} />
        ))}
        <Part geo={rbox(0.27, 0.035, 0.014, 0.006)} m={L.chrome} p={[0, TRAY.y + 0.015, TRAY.z + 0.05]} castShadow={false} />
        <Part geo={rbox(0.28, 0.014, 0.12, 0.006)} m={L.chrome} p={[0, TRAY.y + 0.1, TRAY.z - 0.01]} castShadow={false} />
        {/* le petit mot d'un habitué, scotché sur le flanc visible */}
        <mesh material={note} position={[W / 2 + 0.003, 0.95, 0.06]} rotation={[0, Math.PI / 2, 0.06]} raycast={noRay}>
          <planeGeometry args={[0.2, 0.133]} />
        </mesh>
        {/* une pièce restée dans le bac, et un ticket froissé au pied */}
        <Part geo={cyl(0.022, 0.022, 0.006, 16)} m={L.gold} p={[-0.08, TRAY.y + 0.01, TRAY.z - 0.02]} castShadow={false} />
        <Part geo={SPH} m={L.paper} scale={[0.035, 0.022, 0.03]} p={[0.22, 0.02, F + 0.14]} castShadow={false} />
      </Static>
      {/* la lueur chaude de la vitrine, le soir */}
      <sprite ref={glow} scale={[1.1, 1.0, 1]} position={[0, 1.2, F + 0.1]} raycast={noRay}>
        <spriteMaterial map={glowTex} color={0xffb860} blending={AdditiveBlending} transparent depthWrite={false} opacity={0} />
      </sprite>
      {/* les pièces qui tombent */}
      <group userData={LIVE}>
        {COIN_AT.map((_, i) => (
          <mesh key={i} ref={(m) => (coins.current[i] = m)} geometry={cyl(0.022, 0.022, 0.006, 16)} material={i % 2 ? L.silver : L.gold} visible={false} raycast={noRay} />
        ))}
      </group>
    </group>
  )
}
