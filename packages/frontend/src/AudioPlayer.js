import { useCallback } from 'react'
import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faCircle,
  faExclamationCircle,
  faFrownOpen,
  faPlayCircle,
  faSpinner,
  faStopCircle,
  faUsers,
} from '@fortawesome/free-solid-svg-icons'

import useAudioStream from './useAudioStream'
import VolumeControl from './VolumeControl'
import { timeConversion } from './utils'

const SpinnerIcon = () => (
  <span className="fa-layers fa-fw fa-2x">
    <FontAwesomeIcon icon={faCircle} />
    <FontAwesomeIcon icon={faSpinner} inverse spin transform="shrink-6" />
  </span>
)

const PlayIcon = ({ icon }) => <FontAwesomeIcon icon={icon} fixedWidth size="2x" />

const AudioPlayer = ({ listeners, listenUrl, streamOnline, streamStart, title }) => {
  const { setVolume, setMuted, streamState, startStream, stopStream, volume, muted } =
    useAudioStream(listenUrl)

  const onPlayStopClick = () => {
    if (streamState === 'playing') {
      stopStream()
    } else {
      startStream()
    }
  }

  const onToggleMuted = useCallback(() => {
    setMuted(!muted)
  }, [muted, setMuted])

  let btnTitle
  let btnIcon
  let statusText
  let timeDiff

  if (streamOnline === 'online') {
    timeDiff = Date.now() - streamStart

    statusText = title
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
    statusText = 'Stream offline :('
  } else {
    btnIcon = <SpinnerIcon />
    statusText = ''
  }

  return (
    <div className="navbar">
      <div className="player">
        <button
          className={classNames('iconButton', 'playButton')}
          disabled={streamState === 'loading' || streamOnline !== 'online'}
          title={btnTitle}
          type="button"
          onClick={onPlayStopClick}
        >
          {btnIcon}
        </button>
        <div title={`Stream online since ${timeConversion(timeDiff)}.`}>{statusText}</div>
      </div>
      <div className="fill"></div>
      <div className="listeners" title="Current listeners">
        <strong>{listeners}</strong> <FontAwesomeIcon icon={faUsers} />
      </div>
      <VolumeControl
        onToggleMuted={onToggleMuted}
        onVolumeChange={setVolume}
        muted={muted}
        volume={volume}
      />
    </div>
  )
}

export default AudioPlayer
