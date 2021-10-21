import { useCallback } from 'react'

import useAudioStream from './useAudioStream'
import ListenerCount from './ListenerCount'
import OnlineCounter from './OnlineCounter'
import StreamButton from './StreamButton'
import StreamTitle from './StreamTitle'
import VolumeControl from './VolumeControl'
import style from './NavBar.sss'

const NavBar = ({ streamInfo }) => {
  const { listenUrl, listeners, streamOnline, streamStart, streamTitle } = streamInfo
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
      <div className={style.fill} />
      {streamOnline === 'online' ? <ListenerCount listeners={listeners} /> : undefined}
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
