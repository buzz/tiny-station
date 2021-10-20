import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faVolumeMute, faVolumeUp } from '@fortawesome/free-solid-svg-icons'
import Slider from 'rc-slider'
import 'rc-slider/assets/index.css'

const VolumeControl = ({ disabled, muted, volume, onToggleMuted, onVolumeChange }) => {
  const volumeIcon = <FontAwesomeIcon icon={volume === 0.0 || muted ? faVolumeMute : faVolumeUp} />

  return (
    <div className="volumeControl">
      <button
        className={classNames('iconButton', 'muteButton')}
        disabled={disabled}
        onClick={onToggleMuted}
      >
        {volumeIcon}
      </button>
      <Slider
        className="volumeSlider"
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
