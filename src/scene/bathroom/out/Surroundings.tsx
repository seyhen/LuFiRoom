import { useCallback, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { useFrame, useThree } from '@react-three/fiber'
import { SphereGeometry, type OrthographicCamera } from 'three'
import { bathroom } from '../../../rooms/bathroom'
import { useStore } from '../../../state/store'
import { mood, reduceMotion } from '../../anim'
import { life } from '../../life'
import { OutdoorPrecip } from '../../objects/OutdoorPrecip'
import { SkyFadeClock } from '../../outdoor'
import { Batch, SPH_LO, SPH_MID, type V3 } from '../../parts'
import { BigBubbles, bigSlots } from './Big'
import { Bubbles, type Keep } from './Bubbles'
import { makeBank, makeCloudlets, toItems } from './foam'
import { viewOf } from './layout'
import { BUB, O } from './materials'
import { Sky } from './Sky'

// Le dehors de la salle de bain : un monde de bulles dans le ciel. La pièce flotte sur un banc de mousse de bain rose (de gros paquets de
// bulles opaques, roses, crème et blanc cassé, qui montent contre son socle et le portent), dans un ciel pastel (rose pâle, lilas et pêche le
// jour, violet étoilé la nuit) rempli de bulles de savon irisées : de toutes tailles, qui dérivent et crèvent de loin en loin, et jusqu'à six
// grosses qui gardent chacune une petite scène (un canard, un monstera, une bougie, des serviettes, un savon, une étoile de mer). Au loin, de petits
// nuages de mousse, un arc-en-ciel pâle le jour par temps clair, la lune la nuit. La pluie et la neige tombent dehors (`covered` : rien sur le
// socle) et s'arrêtent sur la mousse et sur les grosses bulles, où elles crèvent en petites bulles. Tout est en séries instanciées : peu de tracés.

/** La mousse se dessine avec trois finesses de sphère, selon la taille du paquet : 903 sphères de 440 triangles faisaient 400 000 des 690 000 triangles de la pièce. */
const SPH_M16 = new SphereGeometry(1, 16, 10)

/** Où tombe la pluie : autour du banc (le ciel plus loin vient de WeatherSky). */
const AREA: [number, number, number, number] = [-13, 14, -13, 13]

/** Le temps qui passe sur les bulles et sur la mousse : leurs couleurs qui ondulent, l'éclair qui les éclaire, la lueur de la nuit. */
function Weather() {
  useFrame((_, delta) => {
    if (!reduceMotion) BUB.phase.value = (BUB.phase.value + Math.min(delta, 0.05) * 0.03) % 1000
    BUB.flash.value = life.flash
    const n = mood.night
    O.foam.emissiveIntensity = 0.07 + n * 0.07 + life.flash * 0.25
    O.thing.emissiveIntensity = 0.05 + n * 0.16 + life.flash * 0.2
  })
  return null
}

export function Surroundings() {
  const camera = useThree((s) => s.camera) as OrthographicCamera
  const { width, height } = useThree((s) => s.size)
  const { top, bottom } = useStore((s) => s.insets)
  // le champ visible, lu sur la caméra quand l'écran ou l'interface change (le zoom de la main ne déplace pas le décor)
  const [view, setView] = useState(() => viewOf(camera, height, top, bottom))
  useLayoutEffect(() => {
    const v = viewOf(camera, height, top, bottom)
    setView((p) => (p.l === v.l && p.r === v.r && p.t === v.t && p.b === v.b && p.ut === v.ut && p.ub === v.ub ? p : v))
  }, [camera, width, height, top, bottom])
  const bank = useMemo(makeBank, [])
  const foam = useMemo(() => {
    const all = [...toItems(bank.puffs), ...toItems(makeCloudlets(view))]
    // petits paquets (< 0,5 de rayon : 40 px au plus) : 12 x 8 ; moyens : 16 x 10 ; grands : 20 x 12
    return { lo: all.filter((i) => (i.s as number) < 0.5), mid: all.filter((i) => (i.s as number) >= 0.5 && (i.s as number) < 0.95), hi: all.filter((i) => (i.s as number) >= 0.95) }
  }, [bank, view])
  const layout = useMemo(() => bigSlots(view, bank.top), [view, bank])
  const slots = layout.slots
  const keep = useMemo<Keep[]>(() => [...slots.map((s) => ({ sx: s.sx, sy: s.sy, r: s.r })), { sx: layout.moon[0], sy: layout.moon[1], r: 0 }].slice(0, slots.length), [slots, layout])
  // les dessus des grosses bulles (pour les gouttes qui y éclatent), donnés par BigBubbles
  const caps = useRef<() => V3[]>(() => [])
  const onCaps = useCallback((f: () => V3[]) => { caps.current = f }, [])
  const getCaps = useCallback(() => caps.current(), [])
  // le sol de la pluie : le dessus de la mousse, ou le dessus d'une grosse bulle
  const ground = useMemo(() => (x: number, z: number) => {
    let y = bank.top(x, z)
    for (const s of slots) {
      const d2 = (x - s.p[0]) ** 2 + (z - s.p[2]) ** 2
      if (d2 < s.r * s.r) y = Math.max(y, s.p[1] + Math.sqrt(s.r * s.r - d2))
    }
    return y
  }, [bank, slots])
  return (
    <>
      <SkyFadeClock room={bathroom} />
      <Weather />
      <Sky view={view} moon={layout.moon} />
      <Batch geo={SPH_LO} m={O.foam} items={foam.lo} />
      <Batch geo={SPH_M16} m={O.foam} items={foam.mid} />
      <Batch geo={SPH_MID} m={O.foam} items={foam.hi} />
      <Bubbles view={view} spots={bank.spots} caps={getCaps} keep={keep} />
      <BigBubbles slots={slots} onCaps={onCaps} />
      <OutdoorPrecip ground={ground} area={AREA} covered />
    </>
  )
}
