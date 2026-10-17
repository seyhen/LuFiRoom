import { useEffect, useRef } from 'react'
import { rooms } from '../rooms'
import { useStore } from '../state/store'
import { useT } from '../i18n'

/** Choix de la pièce : une puce par pièce, de vrais boutons, sur une ligne qui défile. Rien à choisir tant qu'il n'y en a qu'une. */
export function RoomPicker() {
  const current = useStore((s) => (s.leaving ?? s.room))
  const t = useT()
  const row = useRef<HTMLDivElement>(null)
  // La pièce choisie reste visible dans la ligne (au chargement, ou si on la choisit à moitié cachée).
  useEffect(() => {
    const el = row.current, chip = el?.querySelector<HTMLElement>('[aria-pressed=true]')
    if (!el || !chip) return
    const left = chip.offsetLeft - el.offsetLeft, right = left + chip.offsetWidth
    if (left < el.scrollLeft || right > el.scrollLeft + el.clientWidth - 24) el.scrollTo({ left: left - 16, behavior: 'smooth' })
  }, [current])
  if (rooms.length < 2) return null
  return (
    <div ref={row} className="rooms" role="group" aria-label={t('Choisir une pièce')}>
      {rooms.map((r) => (
        <button key={r.id} type="button" className="room" aria-pressed={r.id === current} onClick={() => useStore.getState().goto(r.id)}>
          {t(r.name)}
        </button>
      ))}
    </div>
  )
}
