import { useFrame } from '@react-three/fiber'
import { AdditiveBlending, MeshBasicMaterial, SpriteMaterial } from 'three'
import { smooth } from '../../../math'
import { mood } from '../../anim'
import { Static } from '../../Static'
import { Part, SPH, cyl, noRay, rbox } from '../../parts'
import { gummy } from '../../materials'
import { canvasTex } from '../../paint'
import { SkyFadeClock, skyFade } from '../../outdoor'
import { snowTop } from '../../snowTop'
import { glowTex } from '../../textures'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { laundromat } from '../../../rooms/laundromat'
import { Block } from '../../atelier/out/Haussmann'
import { P } from '../../atelier/out/materials'

// Le dehors de la laverie : le coin de rue d'une ville française, la nuit. Le trottoir fait le tour (la vitrine donne sur la rue,
// derrière), une rue de côté à droite avec son passage piéton, le réverbère du coin et sa flaque de lumière, une borne à incendie,
// des sacs-poubelle, un banc, des poubelles dans la cour ; à gauche, l'immeuble voisin et sa boutique éclairée ; en face, de
// l'autre côté de la rue, l'immeuble de la boulangerie et de la pharmacie (celui qu'on voit dans la vitrine).

const SIDEWALK = -0.2, ROAD = -0.34
const F = { c: [0, 0] as [number, number], r0: 7.5, r1: 12.5 }

/** Les dalles du trottoir : un quadrillage clair, un peu taché. */
const slabTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#b9bcbe'; x.fillRect(0, 0, 128, 128)
  x.fillStyle = 'rgba(0,0,0,.12)'; x.fillRect(0, 0, 128, 3); x.fillRect(0, 0, 3, 128); x.fillRect(0, 64, 128, 2); x.fillRect(64, 0, 2, 128)
}, [1, 1])
slabTex.repeat.set(16, 16)
slabTex.wrapS = slabTex.wrapT = 1000

/** L'asphalte : gris anthracite grenu, une ligne blanche discontinue. */
const roadTex = canvasTex(128, 128, (x) => {
  x.fillStyle = '#4a4c52'; x.fillRect(0, 0, 128, 128)
  for (let i = 0; i < 400; i++) { x.fillStyle = Math.random() < 0.5 ? 'rgba(255,255,255,.05)' : 'rgba(0,0,0,.08)'; x.fillRect(Math.random() * 128, Math.random() * 128, 2, 2) }
}, [1, 1])
roadTex.repeat.set(10, 10)
roadTex.wrapS = roadTex.wrapT = 1000

const M = {
  slab: skyFade(snowTop(gummy(0xffffff, { map: slabTex, roughness: 0.85 }), 1, 0.4, 0.8), F),
  road: skyFade(snowTop(gummy(0xffffff, { map: roadTex, roughness: 0.6, clearcoat: 0.3 }), 1, 0.4, 0.8), F),
  curb: skyFade(snowTop(gummy(0xa8acb0, { roughness: 0.7 }), 1, 0.4, 0.8), F),
  stripe: skyFade(snowTop(gummy(0xf2f0e8, { roughness: 0.6 }), 1, 0.4, 0.8), F),
  iron: skyFade(snowTop(gummy(0x2a3a34, { roughness: 0.4, clearcoat: 0.5 }), 0.6, 0.55, 0.9), F),
  red: skyFade(gummy(0xc8403a, { roughness: 0.4, clearcoat: 0.6 }), F),
  bag: skyFade(gummy(0x2a2c34, { roughness: 0.3, clearcoat: 0.8 }), F),
  bagBlue: skyFade(gummy(0x3a5a8a, { roughness: 0.3, clearcoat: 0.8 }), F),
  bin: skyFade(snowTop(gummy(0x3f7a5a, { roughness: 0.5, clearcoat: 0.3 }), 0.9, 0.45, 0.85), F),
  wood: skyFade(snowTop(gummy(0x8a5e3e, { roughness: 0.6 }), 0.9, 0.45, 0.85), F),
  lamp: skyFade(gummy(0xfff2d0, { roughness: 0.2, clearcoat: 0.8, emissive: 0xffd08a, emissiveIntensity: 0.2 }), F),
  shop: skyFade(gummy(0xf6d8a8, { roughness: 0.2, clearcoat: 0.9, emissive: 0xffc078, emissiveIntensity: 0.1 }), F),
  awning: skyFade(snowTop(gummy(0x2f6a5a, { roughness: 0.7 }), 1, 0.4, 0.8), F),
  pool: new MeshBasicMaterial({ map: glowTex, color: 0xffc888, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending, polygonOffset: true, polygonOffsetFactor: -2 }),
  glow: new SpriteMaterial({ map: glowTex, color: 0xffd090, transparent: true, opacity: 0, depthWrite: false, blending: AdditiveBlending }),
}

/** Le réverbère du coin : un fût vert sombre à cannelures, une crosse, une lanterne à quatre vitres. */
function StreetLamp({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, SIDEWALK, z]}>
      <Part geo={cyl(0.12, 0.16, 0.4, 12)} m={M.iron} p={[0, 0.2, 0]} />
      <Part geo={cyl(0.06, 0.08, 3.4, 10)} m={M.iron} p={[0, 1.9, 0]} />
      <Part geo={SPH} m={M.iron} p={[0, 3.62, 0]} scale={0.08} castShadow={false} />
      <group position={[0, 3.55, 0]}>
        <Part geo={cyl(0.03, 0.03, 0.5, 6)} m={M.iron} p={[0.22, 0.02, 0]} rotation-z={Math.PI / 2} castShadow={false} />
        <Part geo={cyl(0.06, 0.2, 0.14, 4)} m={M.iron} p={[0.45, 0.02, 0]} rotation-y={Math.PI / 4} castShadow={false} />
        <Part geo={rbox(0.24, 0.3, 0.24, 0.04)} m={M.lamp} p={[0.45, -0.2, 0]} castShadow={false} />
        <Part geo={cyl(0.12, 0.08, 0.06, 4)} m={M.iron} p={[0.45, -0.38, 0]} rotation-y={Math.PI / 4} castShadow={false} />
      </group>
    </group>
  )
}

/** Le passage piéton sur la rue de droite : des bandes blanches. */
function Crosswalk() {
  return (
    <>
      {Array.from({ length: 7 }, (_, i) => (
        <Part key={i} geo={rbox(4.0, 0.02, 0.38, 0.01)} m={M.stripe} p={[7.9, ROAD + 0.012, -5.2 + i * 0.7]} castShadow={false} />
      ))}
    </>
  )
}

/** Le soir, le réverbère, la boutique voisine et les fenêtres s'allument. */
function Evening() {
  useFrame(() => {
    const n = smooth(mood.night), k = Math.min(1, n + mood.rain * 0.3)
    M.lamp.emissiveIntensity = 0.2 + k * 1.6
    M.glow.opacity = k * 0.9
    M.pool.opacity = k * 0.5
    M.shop.emissiveIntensity = 0.1 + k * 1.1
    for (const m of P.facade) m.emissiveIntensity = 0.04 + n * 1.0
    P.dormerGlass.emissiveIntensity = n * 1.3
  })
  return null
}

export function Surroundings() {
  return (
    <>
      <SkyFadeClock room={laundromat} />
      <Evening />
      {/* la chaussée partout, le trottoir autour de la laverie et de ses voisins */}
      <mesh position={[0, ROAD, 0]} rotation-x={-Math.PI / 2} material={M.road} receiveShadow raycast={noRay}><planeGeometry args={[34, 34]} /></mesh>
      <Static>
        <Part geo={rbox(16.2, 0.16, 9.8, 0.05)} m={M.slab} p={[-1.9, SIDEWALK - 0.08, -0.6]} castShadow={false} />
        <Part geo={rbox(16.3, 0.18, 0.18, 0.05)} m={M.curb} p={[-1.9, SIDEWALK - 0.08, -5.5]} castShadow={false} />
        <Part geo={rbox(0.18, 0.18, 9.9, 0.05)} m={M.curb} p={[6.2, SIDEWALK - 0.08, -0.6]} castShadow={false} />
        <Crosswalk />
        {/* l'immeuble voisin à gauche, sa boutique éclairée au rez-de-chaussée ; l'immeuble d'en face, de l'autre côté de la rue */}
        <Block x0={-9.6} x1={-3.8} z0={-3.6} z1={3.4} wall={6.4} top={8.1} s={1} shift={0.25} dormers={[3, 3]} lowBalcony={false} />
        <Block x0={-8.0} x1={4.6} z0={-16} z1={-9.2} wall={4.6} top={6.3} s={1} shift={0.6} dormers={[4, 3]} lowBalcony={false} />
        <group position={[-6.7, SIDEWALK, 3.42]}>
          <Part geo={rbox(4.2, 2.5, 0.06, 0.03)} m={M.iron} p={[0, 1.25, 0.02]} />
          <Part geo={rbox(3.6, 1.9, 0.04, 0.02)} m={M.shop} p={[0, 1.2, 0.06]} castShadow={false} />
          <Part geo={rbox(4.4, 0.08, 0.9, 0.03)} m={M.awning} p={[0, 2.55, 0.45]} rotation-x={0.25} />
        </group>
        <StreetLamp x={5.5} z={-4.6} />
        {/* la borne à incendie, les sacs-poubelle, le banc, les poubelles de la cour */}
        <group position={[5.4, SIDEWALK, 1.6]}>
          <Part geo={cyl(0.13, 0.15, 0.55, 14)} m={M.red} p={[0, 0.27, 0]} />
          <Part geo={SPH} m={M.red} p={[0, 0.56, 0]} scale={[0.14, 0.1, 0.14]} />
          {[-1, 1].map((s) => <Part key={s} geo={cyl(0.05, 0.05, 0.12, 10)} m={M.red} p={[s * 0.16, 0.35, 0]} rotation-z={Math.PI / 2} castShadow={false} />)}
        </group>
        {[[5.3, 3.0, 0.32, M.bag], [5.0, 3.4, 0.26, M.bagBlue], [5.55, 3.55, 0.24, M.bag]].map(([x, z, s, m], i) => (
          <group key={i} position={[x as number, SIDEWALK, z as number]}>
            <Part geo={SPH} m={m as typeof M.bag} p={[0, (s as number) * 0.8, 0]} scale={[s as number, (s as number) * 0.85, s as number]} />
            <Part geo={SPH} m={m as typeof M.bag} p={[0, (s as number) * 1.6, 0]} scale={(s as number) * 0.25} castShadow={false} />
          </group>
        ))}
        <group position={[5.3, SIDEWALK, -1.6]} rotation-y={-Math.PI / 2}>
          {[-0.18, 0, 0.18].map((dz) => <Part key={dz} geo={rbox(1.5, 0.05, 0.14, 0.02)} m={M.wood} p={[0, 0.45, dz]} />)}
          {[-0.18, 0.18].map((dz) => <Part key={dz + 1} geo={rbox(1.5, 0.14, 0.04, 0.02)} m={M.wood} p={[0, 0.7, -0.28 + dz * 0.2]} />)}
          {[-0.65, 0.65].map((dx) => <Part key={dx} geo={rbox(0.06, 0.45, 0.5, 0.02)} m={M.iron} p={[dx, 0.22, -0.05]} castShadow={false} />)}
        </group>
        {[[-1.4, 4.6], [-0.4, 4.7]].map(([x, z], i) => (
          <group key={i} position={[x, SIDEWALK, z]}>
            <Part geo={rbox(0.7, 0.85, 0.65, 0.06)} m={M.bin} p={[0, 0.42, 0]} />
            <Part geo={rbox(0.74, 0.06, 0.7, 0.03)} m={M.bin} p={[0, 0.88, -0.02]} rotation-x={-0.08} castShadow={false} />
            {[-0.2, 0.2].map((dx) => <Part key={dx} geo={cyl(0.05, 0.05, 0.04, 10)} m={M.iron} p={[dx, 0.05, 0.33]} rotation-x={Math.PI / 2} castShadow={false} />)}
          </group>
        ))}
      </Static>
      <sprite position={[5.95, SIDEWALK + 3.35, -4.6]} scale={1.4} material={M.glow} raycast={noRay} renderOrder={4} />
      <mesh position={[5.95, SIDEWALK + 0.01, -4.6]} rotation-x={-Math.PI / 2} material={M.pool} renderOrder={3} raycast={noRay}><planeGeometry args={[3.6, 3.6]} /></mesh>
      <OutdoorPrecip ground={(x, z) => (x < 6.2 && z > -5.5 && x > -10 ? SIDEWALK : ROAD)} area={[-13, 13, -12, 12]} />
    </>
  )
}
