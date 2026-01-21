import 'rc-slider/assets/index.css'

import { faVolumeMute, faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import clsx from 'clsx'
import Slider from 'rc-slider'

import style from './NavBar.module.css'
import styleCommon from '#styles/common.module.css'

function VolumeControl({
  disabled,
  muted,
  volume,
  onToggleMuted,
  onVolumeChange,
}: VolumeControlProps) {
  return (
    <div className={style.volumeControl}>
      <button
        className={clsx(styleCommon.iconButton, style.muteButton)}
        disabled={disabled}
        onClick={onToggleMuted}
        type="button"
      >
        <FontAwesomeIcon icon={volume === 0 || muted ? faVolumeMute : faVolumeUp} />
      </button>
      <Slider
        className={clsx(style.volumeSlider)}
        disabled={disabled || muted}
        min={0}
        max={1}
        defaultValue={1}
        step={0.01}
        onChange={(val) => {
          if (typeof val === 'number') {
            onVolumeChange(val)
          }
        }}
      />
    </div>
  )
}

interface VolumeControlProps {
  disabled: boolean
  muted: boolean
  volume: number
  onToggleMuted: () => void
  onVolumeChange: (vol: number) => void
}

export default VolumeControl
