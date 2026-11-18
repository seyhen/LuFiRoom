import { useStore } from '../state/store'
import { useT } from '../i18n'
import { FAN_CHIPS, FAN_NAMES, FAN_SPEEDS } from '../state/fan'

/** Sous le volume de la carte « Bruit blanc » : trois pastilles, la vitesse du ventilateur (faible, moyen, fort). Choisir une vitesse allume le ventilateur. */
export function FanControls() {
  const t = useT()
  const fan = useStore((s) => s.fan)
  return (
    <div className="nz-chips" role="group" aria-label={t('Vitesse du ventilateur')}>
      {FAN_SPEEDS.map((f, i) => (
        <button key={f} type="button" className="nz-chip" aria-pressed={f === fan} aria-label={t(FAN_NAMES[f])} onClick={() => useStore.getState().setFanSpeed(f)}>
          <b className="fn-bars" data-n={i + 1} aria-hidden="true">
            <i />
            <i />
            <i />
          </b>
          <span aria-hidden="true">{t(FAN_CHIPS[f])}</span>
        </button>
      ))}
    </div>
  )
}
