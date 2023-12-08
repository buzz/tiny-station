import { useCallback, useContext } from 'react'

import StreamInfoContext from '../contexts/StreamInfoContext'
import useAudioStream from './useAudioStream'
import ListenerCount from './ListenerCount'
import OnlineCounter from './OnlineCounter'
import StreamButton from './StreamButton'
import StreamTitle from './StreamTitle'
import StreamUrl from './StreamUrl'
import VolumeControl from './VolumeControl'
import style from './NavBar.sss'

const NavBar = () => {
  const { listenUrl, streamOnline, streamStart, streamTitle } = useContext(StreamInfoContext)

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
      <div className={style.titleCounter}>
        <StreamTitle streamOnline={streamOnline} streamTitle={streamTitle} />
        <div className={style.counters}>
          {streamOnline === 'online' ? <ListenerCount /> : undefined}
          {streamState === 'playing' ? (
            <OnlineCounter streamOnline={streamOnline} streamStart={streamStart} />
          ) : undefined}
        </div>
      </div>
      <div className={style.fill} />
      {streamOnline === 'online' ? <StreamUrl streamUrl={listenUrl} /> : undefined}
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
