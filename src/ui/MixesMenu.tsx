import { useEffect, useRef, useState } from 'react'
import { roomById } from '../rooms'
import { unlockAudio } from '../audio/engine'
import { mixName, mixToUrl, type SavedMix } from '../state/mixes'
import { useStore } from '../state/store'
import { tr, useLang, useT } from '../i18n'
import { closeIcon, mixIcon, saveIcon, shareIcon } from './icons'

/** Mes ambiances : enregistrer celle d'en ce moment, en rejouer une, la partager par un lien. */
export function MixesMenu() {
  const t = useT(), en = useLang((s) => s.lang) === 'en'
  const mixes = useStore((s) => s.mixes)
  const silent = useStore((s) => !roomById(s.room).sounds.some((x) => s.on[x.id]))
  const [open, setOpen] = useState(false)
  const [note, setNote] = useState('')
  const root = useRef<HTMLDivElement>(null)

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

  const toggle = () => {
    setNote('')
    setOpen((o) => !o)
  }
  const play = (m: SavedMix) => {
    unlockAudio() // on est dans le geste : la pièce peut changer avant que les sons ne démarrent
    useStore.getState().applyMix(m.mix)
    setOpen(false)
  }
  const save = () => {
    useStore.getState().saveMix()
    setNote(tr('Ambiance enregistrée.'))
  }
  const share = async () => {
    const mix = useStore.getState().currentMix(), url = mixToUrl(mix)
    try {
      if (navigator.share) await navigator.share({ title: 'LufiRoom', text: `${mixName(mix)} · ${tr(roomById(mix.room).name)} — ${tr('Mon ambiance sur LufiRoom :')}`, url })
      else {
        await navigator.clipboard.writeText(url)
        setNote(tr('Lien copié : colle-le où tu veux.'))
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return // la feuille de partage a été fermée
      window.prompt(tr('Copie ce lien :'), url) // ni partage ni presse-papiers : on le montre
    }
  }

  return (
    <div className="pop" ref={root}>
      <button className="pop-btn" type="button" aria-haspopup="true" aria-expanded={open} aria-label={t('Mes ambiances')} onClick={toggle}>
        {mixIcon}
        <span className="lbl">{t('Ambiances')}</span>
      </button>
      {open && (
        <div className="pop-menu mixes" role="group" aria-label={t('Mes ambiances')}>
          <div className="pop-actions">
            <button type="button" disabled={silent} onClick={save}>
              {saveIcon}
              {t('Enregistrer celle-ci')}
            </button>
            <button type="button" disabled={silent} onClick={share}>
              {shareIcon}
              {t('Partager')}
            </button>
          </div>
          <p className="pop-note" role="status">
            {note || (silent ? t('Allume quelques sons pour enregistrer ou partager une ambiance.') : '')}
          </p>
          {mixes.length > 0 && (
            <ul className="saved">
              {mixes.map((m) => (
                <li key={m.id}>
                  <button type="button" className="play" onClick={() => play(m)}>
                    <span className="nm">{mixName(m.mix)}</span>
                    <span className="sb">{t(roomById(m.mix.room).name)}{m.mix.night ? ` · ${t('nuit')}` : ''}</span>
                  </button>
                  <button type="button" className="del" aria-label={en ? `Delete the mood ${mixName(m.mix)}` : `Supprimer l’ambiance ${mixName(m.mix)}`} onClick={() => useStore.getState().deleteMix(m.id)}>
                    {closeIcon}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
