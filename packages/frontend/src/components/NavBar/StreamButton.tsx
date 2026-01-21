import {
  faExclamationCircle,
  faFrownOpen,
  faPlayCircle,
  faSpinner,
  faStopCircle,
} from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import clsx from 'clsx'
import type { IconProp } from '@fortawesome/fontawesome-svg-core'

import type { StreamOnlineState } from '#contexts/StreamInfoContext'
import type { StreamState } from '#hooks/useAudioStream'

import style from './NavBar.module.css'
import styleCommon from '#styles/common.module.css'

function PlayIcon({ icon }: PlayIconProps) {
  return <FontAwesomeIcon icon={icon} size="2x" />
}

interface PlayIconProps {
  icon: IconProp
}

function SpinnerIcon() {
  return <FontAwesomeIcon icon={faSpinner} size="2x" spin />
}

function StreamButton({ streamOnline, streamState, startStream, stopStream }: StreamButtonProps) {
  let btnTitle
  let btnIcon

  if (streamOnline === 'online') {
    switch (streamState) {
      case 'stopped': {
        btnTitle = 'Play stream'
        btnIcon = <PlayIcon icon={faPlayCircle} />
        break
      }
      case 'playing': {
        btnTitle = 'Stop stream'
        btnIcon = <PlayIcon icon={faStopCircle} />
        break
      }
      case 'loading': {
        btnTitle = 'Starting stream…'
        btnIcon = <SpinnerIcon />
        break
      }
      case 'error': {
        btnIcon = <PlayIcon icon={faExclamationCircle} />
        break
      }
      // No default
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
      className={clsx(styleCommon.iconButton, style.playButton)}
      disabled={streamState === 'loading' || streamOnline !== 'online'}
      title={btnTitle}
      type="button"
      onClick={onPlayStopClick}
    >
      {btnIcon}
    </button>
  )
}

interface StreamButtonProps {
  streamOnline: StreamOnlineState | undefined
  streamState: StreamState
  startStream: () => void
  stopStream: () => void
}

export default StreamButton
