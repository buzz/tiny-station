import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faExclamationCircle,
  faFrownOpen,
  faPlayCircle,
  faStopCircle,
  faSpinner,
} from '@fortawesome/free-solid-svg-icons'

import styleCommon from '../styles/_common.sss'
import style from './NavBar.sss'

const PlayIcon = ({ icon }) => <FontAwesomeIcon icon={icon} fixedWidth size="2x" />

const SpinnerIcon = () => <FontAwesomeIcon icon={faSpinner} fixedWidth size="2x" spin />

const StreamButton = ({ streamOnline, streamState, startStream, stopStream }) => {
  let btnTitle
  let btnIcon

  if (streamOnline === 'online') {
    if (streamState === 'stopped') {
      btnTitle = 'Play stream'
      btnIcon = <PlayIcon icon={faPlayCircle} />
    } else if (streamState === 'playing') {
      btnTitle = 'Stop stream'
      btnIcon = <PlayIcon icon={faStopCircle} />
    } else if (streamState === 'loading') {
      btnTitle = 'Starting stream…'
      btnIcon = <SpinnerIcon />
    } else if (streamState === 'error') {
      btnIcon = <PlayIcon icon={faExclamationCircle} />
    }
  } else if (streamOnline === 'offline') {
    btnIcon = <PlayIcon icon={faFrownOpen} />
  } else {
    btnIcon = <SpinnerIcon />
  }

  const onPlayStopClick = () => {
    if (streamState === 'playing') {
      stopStream()
    } else {
      startStream()
    }
  }

  return (
    <button
      className={classNames(styleCommon.iconButton, style.playButton)}
      disabled={streamState === 'loading' || streamOnline !== 'online'}
      title={btnTitle}
      type="button"
      onClick={onPlayStopClick}
    >
      {btnIcon}
    </button>
  )
}

export default StreamButton
