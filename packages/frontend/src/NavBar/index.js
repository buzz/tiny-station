import { useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeadphonesAlt } from '@fortawesome/free-solid-svg-icons'

import useAudioStream from './useAudioStream'
import StreamButton from './StreamButton'
import StreamTitle from './StreamTitle'
import VolumeControl from './VolumeControl'
import styleCommon from '../styles/_common.sss'
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
      <StreamButton
        streamInfo={streamInfo}
        streamState={streamState}
        startStream={startStream}
        stopStream={stopStream}
      />
      <StreamTitle streamInfo={streamInfo} />
      <div className={style.fill} />
      <div title="Current listeners">
        <FontAwesomeIcon className={styleCommon.icon} icon={faHeadphonesAlt} />{' '}
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
