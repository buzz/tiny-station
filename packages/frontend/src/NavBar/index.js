import { useCallback } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'

import useAudioStream from './useAudioStream'
import useStreamInfo from './useStreamInfo'
import ListenerCount from './ListenerCount'
import OnlineCounter from './OnlineCounter'
import StreamButton from './StreamButton'
import StreamTitle from './StreamTitle'
import VolumeControl from './VolumeControl'
import style from './NavBar.sss'
import styleCommon from '../styles/_common.sss'

const NavBar = () => {
  const { listenUrl, listeners, streamOnline, streamStart, streamTitle } = useStreamInfo()
  const { setVolume, setMuted, streamState, startStream, stopStream, volume, muted } =
    useAudioStream(listenUrl)

  const onToggleMuted = useCallback(() => {
    setMuted(!muted)
  }, [muted, setMuted])

  return (
    <div className={style.navbar}>
      <StreamButton
        streamOnline={streamOnline}
        streamState={streamState}
        startStream={startStream}
        stopStream={stopStream}
      />
      <StreamTitle streamOnline={streamOnline} streamTitle={streamTitle} />
      {streamState === 'playing' ? (
        <OnlineCounter streamOnline={streamOnline} streamStart={streamStart} />
      ) : undefined}
      {streamOnline === 'online' ? <ListenerCount listeners={listeners} /> : undefined}
      <div className={style.fill} />
      <button className={styleCommon.iconButton} onClick={onToggleMuted} type="button">
        <FontAwesomeIcon icon={faCog} />
      </button>
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
