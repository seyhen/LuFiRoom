import { useEffect } from 'react'
import { roomById } from '../rooms'
import { unlockAudio } from '../audio/engine'
import { mixName } from '../state/mixes'
import { useStore } from '../state/store'
import { useT } from '../i18n'

/** Une ambiance reçue par un lien : elle attend un geste (l'audio ne démarre pas tout seul) pour être jouée. */
export function SharedMix() {
  const shared = useStore((s) => s.shared)
  const t = useT()
  const bottom = useStore((s) => s.insets.bottom)
  // Raccourci de développement (retiré du build) : `?room=…&mix=…&night=1&go` joue l'ambiance tout de suite, sans geste, pour les captures.
  useEffect(() => {
    if (import.meta.env.DEV && shared && new URLSearchParams(location.search).has('go')) {
      const s = useStore.getState()
      s.applyMix(shared)
      s.dismissShared()
    }
  }, [shared])
  if (!shared) return null
  const listen = () => {
    unlockAudio()
    const s = useStore.getState()
    s.applyMix(shared)
    s.dismissShared()
  }
  return (
    <div className="shared" role="region" aria-label={t('Ambiance partagée')} style={{ bottom: bottom + 8 }}>
      <p>
        <strong>{t("Une ambiance t’attend")}</strong>
        <span>{mixName(shared)} · {t(roomById(shared.room).name)}{shared.night ? `, ${t('de nuit')}` : ''}</span>
      </p>
      <div>
        <button type="button" className="go" onClick={listen}>
          {t('Écouter')}
        </button>
        <button type="button" onClick={() => useStore.getState().dismissShared()}>
          {t('Non merci')}
        </button>
      </div>
    </div>
  )
}
