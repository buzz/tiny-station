import { useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeadphonesAlt } from '@fortawesome/free-solid-svg-icons'

import useAudioStream from './useAudioStream'
import StreamButton from './StreamButton'
import StreamTitle from './StreamTitle'
import VolumeControl from './VolumeControl'
import style from './NavBar.sss'

const NavBar = ({ streamInfo }) => {
  const { listeners, listenUrl } = streamInfo
  const { setVolume, setMuted, streamState, startStream, stopStream, volume, muted } =
    useAudioStream(listenUrl)

  const onToggleMuted = useCallback(() => {
    setMuted(!muted)
  }, [muted, setMuted])

  return (
    <div className={style.navbar}>
      <div className={style.player}>
        <StreamButton
          streamInfo={streamInfo}
          streamState={streamState}
          startStream={startStream}
          stopStream={stopStream}
        />
        <StreamTitle streamInfo={streamInfo} />
      </div>
      <div className={style.fill} />
      <div className={style.listeners} title="Current listeners">
        <FontAwesomeIcon icon={faHeadphonesAlt} />{' '}
        <strong className={style.listenersLabel}>{listeners}</strong>
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

export default NavBar
