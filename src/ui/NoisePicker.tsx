import { useRef, useState } from 'react'
import { useStore } from '../state/store'
import { useT } from '../i18n'
import { roomById } from '../rooms'
import { MixerCard } from './MixerCard'
import { soundIcons } from './icons'
import { useDismiss } from './WeatherPicker'

/**
 * La carte « Bruit », sortie du mixeur pour qu'il reste bas (ses pastilles et sa tonalité doublaient la hauteur de toutes les cartes) :
 * un bouton dans la barre du haut, à côté de la météo, qui ouvre la même carte (bascule, volume, couleur, tonalité). Il s'allume quand le bruit joue.
 */
export function NoisePicker() {
  const sound = useStore((s) => roomById(s.room).sounds.find((x) => x.id === 'noise'))
  const on = useStore((s) => !!s.on.noise)
  const t = useT()
  const [open, setOpen] = useState(false)
  const root = useRef<HTMLDivElement>(null)
  useDismiss(open, setOpen, root)
  if (!sound) return null
  return (
    <div className="sky-pick nz-pick" ref={root}>
      <button
        className={on ? 'mode on' : 'mode'}
        type="button"
        aria-haspopup="true"
        aria-expanded={open}
        aria-label={t('Bruit')}
        title={t('Bruit')}
        onClick={() => setOpen((o) => !o)}
      >
        {soundIcons.noise}
      </button>
      {open && (
        <div className="nz-pop" role="group" aria-label={t('Bruit')}>
          <MixerCard sound={sound} />
        </div>
      )}
    </div>
  )
}
