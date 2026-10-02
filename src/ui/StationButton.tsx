import { stationAfter } from '../audio/stations'
import { useStore } from '../state/store'
import { skipIcon } from './icons'

/** Station suivante de la radio générative, à côté de son curseur de volume. Le nom de la station est le sous-titre de la carte. */
export function StationButton() {
  const next = useStore((s) => stationAfter(s.station))
  const label = `Station suivante : ${next.name}`
  return (
    <button className="skip" type="button" aria-label={label} title={`${label} · ${next.about}`} onClick={() => useStore.getState().nextStation()}>
      {skipIcon}
    </button>
  )
}
