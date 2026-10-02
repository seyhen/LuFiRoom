import { useEffect, useState, type Ref } from 'react'
import { useStore } from '../state/store'
import { moonIcon, sunIcon } from './icons'

const now = () => new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })

/** Titre, phrase d'aide, heure (masquée sur mobile) et bouton jour / nuit. */
export function TopBar({ brandRef }: { brandRef: Ref<HTMLDivElement> }) {
  const night = useStore((s) => s.night)
  const [time, setTime] = useState(now)
  useEffect(() => {
    const id = setInterval(() => setTime(now()), 15000)
    return () => clearInterval(id)
  }, [])
  return (
    <header className="top">
      <div className="brand" ref={brandRef}>
        <h1>Chambre Lofi</h1>
        <p>Touche les objets pour composer ton ambiance. Glisse pour tourner la pièce.</p>
      </div>
      <div className="tools">
        <span className="clock" aria-label="Heure locale">{time}</span>
        <button
          className="mode"
          type="button"
          aria-label={night ? 'Passer en journée' : 'Passer en nuit'}
          onClick={() => useStore.getState().toggleNight()}
        >
          {night ? moonIcon : sunIcon}
        </button>
      </div>
    </header>
  )
}
