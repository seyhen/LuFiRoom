import { useEffect, useRef, useState } from 'react'
import { roomById } from '../rooms'
import { unlockAudio } from '../audio/engine'
import { mixToUrl, type SavedMix } from '../state/mixes'
import { useStore } from '../state/store'
import { closeIcon, mixIcon, saveIcon, shareIcon } from './icons'

/** Mes ambiances : enregistrer celle d'en ce moment, en rejouer une, la partager par un lien. */
export function MixesMenu() {
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
    setNote('Ambiance enregistrée.')
  }
  const share = async () => {
    const mix = useStore.getState().currentMix(), url = mixToUrl(mix)
    try {
      if (navigator.share) await navigator.share({ title: 'Chambre Lofi', text: "Mon ambiance sur Chambre Lofi :", url })
      else {
        await navigator.clipboard.writeText(url)
        setNote('Lien copié : colle-le où tu veux.')
      }
    } catch (e) {
      if ((e as Error).name === 'AbortError') return // la feuille de partage a été fermée
      window.prompt('Copie ce lien :', url) // ni partage ni presse-papiers : on le montre
    }
  }

  return (
    <div className="pop" ref={root}>
      <button className="pop-btn" type="button" aria-haspopup="true" aria-expanded={open} aria-label="Mes ambiances" onClick={toggle}>
        {mixIcon}
        <span className="lbl">Ambiances</span>
      </button>
      {open && (
        <div className="pop-menu mixes" role="group" aria-label="Mes ambiances">
          <div className="pop-actions">
            <button type="button" disabled={silent} onClick={save}>
              {saveIcon}
              Enregistrer celle-ci
            </button>
            <button type="button" disabled={silent} onClick={share}>
              {shareIcon}
              Partager
            </button>
          </div>
          <p className="pop-note" role="status">
            {note || (silent ? 'Allume quelques sons pour enregistrer ou partager une ambiance.' : '')}
          </p>
          {mixes.length > 0 && (
            <ul className="saved">
              {mixes.map((m) => (
                <li key={m.id}>
                  <button type="button" className="play" onClick={() => play(m)}>
                    <span className="nm">{m.name}</span>
                    <span className="sb">{roomById(m.mix.room).name}{m.mix.night ? ' · nuit' : ''}</span>
                  </button>
                  <button type="button" className="del" aria-label={`Supprimer l'ambiance ${m.name}`} onClick={() => useStore.getState().deleteMix(m.id)}>
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
