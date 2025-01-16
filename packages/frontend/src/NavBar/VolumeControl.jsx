import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeMute, faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

import styleCommon from '../styles/common.module.css'
import style from './NavBar.module.css'

const VolumeControl = ({ disabled, muted, volume, onToggleMuted, onVolumeChange }) => (
  <div className={style.volumeControl}>
    <button
      className={classNames(styleCommon.iconButton, style.muteButton)}
      disabled={disabled}
      onClick={onToggleMuted}
      type="button"
    >
      <FontAwesomeIcon icon={volume === 0.0 || muted ? faVolumeMute : faVolumeUp} />
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

export default VolumeControl
