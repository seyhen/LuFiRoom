import { stationAfter } from '../audio/stations'
import { roomById } from '../rooms'
import { useStore } from '../state/store'
import { useT } from '../i18n'
import { prevIcon, skipIcon } from './icons'

/** Station suivante de la radio générative, à côté de son curseur de volume. Le nom de la station est le sous-titre de la carte. */
export function StationButton({ noun = 'Station suivante' }: { noun?: string }) {
  const t = useT()
  const next = useStore((s) => stationAfter(s.station, 1, roomById(s.room).stations))
  const label = `${t(noun)} : ${t(next.name)}`
  return (
    <button className="skip" type="button" aria-label={label} title={`${label} · ${t(next.about)}`} onClick={() => useStore.getState().nextStation()}>
      {skipIcon}
    </button>
  )
}

/** Morceau suivant de la radio sur pistes enregistrées (le « disque suivant » du tourne-disque), à côté du curseur de volume. */
export function TrackButton({ noun = 'Morceau suivant' }: { noun?: string }) {
  const t = useT()
  return (
    <>
      <button className="skip" type="button" aria-label={t('Morceau précédent')} title={t('Morceau précédent')} onClick={() => useStore.getState().prevTrack()}>
        {prevIcon}
      </button>
      <button className="skip" type="button" aria-label={t(noun)} title={t(noun)} onClick={() => useStore.getState().skipTrack()}>
        {skipIcon}
      </button>
    </>
  )
}
