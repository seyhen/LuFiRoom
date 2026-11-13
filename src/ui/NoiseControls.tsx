import type { CSSProperties } from 'react'
import { useStore } from '../state/store'
import { useT } from '../i18n'
import { NOISE_CHIPS, NOISE_COLORS, NOISE_NAMES } from '../state/noise'

/** Sous le volume de la carte « Bruit » : quatre pastilles de couleur (blanc, rose, brun, vert) et la tonalité, des graves aux aigus. */
export function NoiseControls() {
  const t = useT()
  const { color, tilt } = useStore((s) => s.noise)
  const pct = Math.round(tilt * 100)
  return (
    <>
      <div className="nz-chips" role="group" aria-label={t('Couleur du bruit')}>
        {NOISE_COLORS.map((c) => (
          <button key={c} type="button" className="nz-chip" aria-pressed={c === color} aria-label={t(NOISE_NAMES[c])} onClick={() => useStore.getState().setNoiseColor(c)}>
            <i style={{ '--dot': `var(--n-${c})` } as CSSProperties} aria-hidden="true" />
            <span aria-hidden="true">{t(NOISE_CHIPS[c])}</span>
          </button>
        ))}
      </div>
      <div className="nz-tone">
        <span aria-hidden="true">{t('Grave')}</span>
        <input
          type="range"
          min={-100}
          max={100}
          step={5}
          value={pct}
          aria-label={t('Tonalité')}
          aria-valuetext={pct === 0 ? t('neutre') : pct < 0 ? t('plus de graves') : t('plus d’aigus')}
          onChange={(e) => useStore.getState().setNoiseTilt(Number(e.target.value) / 100)}
          onDoubleClick={() => useStore.getState().setNoiseTilt(0)}
        />
        <span aria-hidden="true">{t('Aigu')}</span>
      </div>
    </>
  )
}
