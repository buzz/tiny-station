import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeMute, faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import styleCommon from '../styles/common.sss'
import style from './NavBar.sss'

const VolumeControl = ({ disabled, muted, volume, onToggleMuted, onVolumeChange }) => {
  const volumeIcon = <FontAwesomeIcon icon={volume === 0.0 || muted ? faVolumeMute : faVolumeUp} />

  return (
    <div className={style.volumeControl}>
      <button
        className={classNames(styleCommon.iconButton, style.muteButton)}
        disabled={disabled}
        onClick={onToggleMuted}
        type="button"
      >
        {volumeIcon}
      </button>
      <Slider
        className={style.volumeSlider}
        disabled={disabled || muted}
        min={0}
        max={1}
        defaultValue={1}
        step={0.01}
        onChange={onVolumeChange}
      />
    </div>
  )
}

export default VolumeControl
