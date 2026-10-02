import { useSyncExternalStore } from 'react'
import { installIcon } from './icons'

// Chrome, Edge et Android proposent l'installation par un évènement : on le garde pour l'offrir quand l'utilisateur le veut.
// (Safari sur iPhone n'en a pas : on y passe par « Partager » puis « Sur l'écran d'accueil ».)
interface InstallPrompt extends Event {
  prompt(): Promise<void>
}
let deferred: InstallPrompt | null = null
const listeners = new Set<() => void>()
const emit = () => listeners.forEach((l) => l())

addEventListener('beforeinstallprompt', (e) => {
  e.preventDefault()
  deferred = e as InstallPrompt
  emit()
})
addEventListener('appinstalled', () => {
  deferred = null
  emit()
})

const subscribe = (l: () => void) => {
  listeners.add(l)
  return () => void listeners.delete(l)
}

/** Bouton « Installer l'app » : n'apparaît que si le navigateur sait l'installer, et pas déjà installée. */
export function InstallButton() {
  const available = useSyncExternalStore(subscribe, () => deferred !== null)
  if (!available) return null
  return (
    <button
      className="mode"
      type="button"
      aria-label="Installer l'app"
      title="Installer l'app"
      onClick={async () => {
        const d = deferred
        deferred = null // l'évènement ne sert qu'une fois
        emit()
        await d?.prompt()
      }}
    >
      {installIcon}
    </button>
  )
}
