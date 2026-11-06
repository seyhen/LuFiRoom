import { Static } from '../../Static'
import { SkyFadeClock } from '../../outdoor'
import { submarine } from '../../../rooms/submarine'
import { Seabed } from './Seabed'
import { Bubbles, HullGear, Kelp, Rays, Schools, Whale } from './Life'

/**
 * Le dehors du sous-marin : le fond de la mer. Du sable ridé où dansent les reflets de la surface, des roches et des massifs de
 * corail, une forêt de kelp qui ondule dans le courant, des bancs de poissons qui tournent autour de la coque, une baleine qui passe
 * au loin, des colonnes de bulles, des rais de lumière ; dehors, l'hélice tourne et le projecteur de proue s'allume la nuit.
 * Rien ne tombe ici : ni pluie ni neige sous la mer (la lumière pâlit seulement, voir Rays).
 */
export function Surroundings() {
  return (
    <>
      <SkyFadeClock room={submarine} />
      <Static>
        <Seabed />
      </Static>
      <Kelp />
      <Schools />
      <Whale />
      <Bubbles />
      <Rays />
      <HullGear />
    </>
  )
}
