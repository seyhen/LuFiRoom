import { useEffect, useRef, useState } from 'react'
import { rooms } from '../rooms'
import { useStore } from '../state/store'
import { useT } from '../i18n'
import { gridIcon } from './icons'

/**
 * Choix de la pièce : une puce par pièce, de vrais boutons, sur une ligne qui défile, et un bouton « toutes les pièces » qui les ouvre en grille
 * (sur téléphone, la ligne n'en montre que quatre sur quinze). Rien à choisir tant qu'il n'y en a qu'une.
 */
export function RoomPicker() {
  const current = useStore((s) => (s.leaving ?? s.room))
  const t = useT()
  const row = useRef<HTMLDivElement>(null), root = useRef<HTMLDivElement>(null)
  const [open, setOpen] = useState(false)
  // La grille se ferme au toucher ailleurs et à Échap.
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => { if (!root.current?.contains(e.target as Node)) setOpen(false) }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('pointerdown', away)
    addEventListener('keydown', esc)
    return () => { removeEventListener('pointerdown', away); removeEventListener('keydown', esc) }
  }, [open])
  // La pièce choisie reste visible dans la ligne (au chargement, ou si on la choisit à moitié cachée).
  useEffect(() => {
    const el = row.current, chip = el?.querySelector<HTMLElement>('[aria-pressed=true]')
    if (!el || !chip) return
    const left = chip.offsetLeft - el.offsetLeft, right = left + chip.offsetWidth
    if (left < el.scrollLeft || right > el.scrollLeft + el.clientWidth - 24) el.scrollTo({ left: left - 6, behavior: 'smooth' }) // 6 px = l'espace entre deux puces : la précédente est entièrement cachée, pas de fragment collé au bouton « toutes les pièces »
  }, [current])
  if (rooms.length < 2) return null
  return (
    <div className="rooms-wrap" ref={root}>
      <button type="button" className="rooms-all" aria-haspopup="true" aria-expanded={open} aria-label={t('Toutes les pièces')} title={t('Toutes les pièces')} onClick={() => setOpen((o) => !o)}>
        {gridIcon}
      </button>
      <div ref={row} className="rooms" role="group" aria-label={t('Choisir une pièce')}>
        {rooms.map((r) => (
          <button key={r.id} type="button" className="room" aria-pressed={r.id === current} onClick={() => useStore.getState().goto(r.id)}>
            {t(r.name)}
          </button>
        ))}
      </div>
      {open && (
        <div className="rooms-sheet" role="group" aria-label={t('Toutes les pièces')}>
          {rooms.map((r) => (
            <button key={r.id} type="button" aria-pressed={r.id === current} onClick={() => { useStore.getState().goto(r.id); setOpen(false) }}>
              <i style={{ background: r.ui?.accent?.[0] ?? 'var(--accent)' }} />
              <span>{t(r.name)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
