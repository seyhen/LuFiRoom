import { useEffect, useRef, useState } from 'react'
import { useStore } from '../state/store'
import { useT } from '../i18n'
import { mutedIcon, volumeIcon } from './icons'

/** Volume général : un bouton dans l'en-tête du mixeur, qui ouvre un curseur. Le mélange de chaque son reste tel quel. */
export function MasterVolume() {
  const master = useStore((s) => s.master)
  const t = useT()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  const pct = Math.round(master * 100)

  // Le menu se ferme quand on touche ailleurs ou sur Échap.
  useEffect(() => {
    if (!open) return
    const away = (e: PointerEvent) => {
      if (!root.current?.contains(e.target as Node)) setOpen(false)
    }
    const esc = (e: KeyboardEvent) => e.key === 'Escape' && setOpen(false)
    addEventListener('pointerdown', away)
    addEventListener('keydown', esc)
    return () => {
      removeEventListener('pointerdown', away)
      removeEventListener('keydown', esc)
    }
  }, [open])

  return (
    <div className="pop" ref={root}>
      <button
        className={pct < 100 ? 'pop-btn on' : 'pop-btn'}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={`${t('Volume général')}, ${pct} %`}
        onClick={() => setOpen((o) => !o)}
      >
        {pct === 0 ? mutedIcon : volumeIcon}
        <span className="lbl">{t('Volume')}</span>
      </button>
      {open && (
        <div className="pop-menu volume" role="group" aria-label={t('Volume général')}>
          <input
            type="range"
            min={0}
            max={100}
            value={pct}
            autoFocus
            aria-label={t('Volume général')}
            onChange={(e) => useStore.getState().setMaster(Number(e.target.value) / 100)}
          />
          <output aria-hidden="true">{pct} %</output>
        </div>
      )}
    </div>
  )
}
