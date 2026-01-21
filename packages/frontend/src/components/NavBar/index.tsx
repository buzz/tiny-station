import { useCallback } from 'react'

import useAudioStream from '#hooks/useAudioStream'
import useStreamInfo from '#hooks/useStreamInfo'

import ListenerCount from './ListenerCount'
import OnlineCounter from './OnlineCounter'
import StreamButton from './StreamButton'
import StreamTitle from './StreamTitle'
import StreamUrl from './StreamUrl'
import VolumeControl from './VolumeControl'

import style from './NavBar.module.css'

function NavBar() {
  const { listeners, listenUrl, streamOnline, streamStart, streamTitle } = useStreamInfo()

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
          {streamOnline === 'online' ? <ListenerCount listeners={listeners} /> : undefined}
          {streamState === 'playing' ? (
            <OnlineCounter streamOnline={streamOnline} streamStart={streamStart} />
          ) : undefined}
        </div>
      </div>
      <div className={style.fill} />
      {streamOnline === 'online' ? <StreamUrl streamUrl={listenUrl} /> : undefined}
      <VolumeControl
        disabled={streamOnline !== 'online'}
        onToggleMuted={onToggleMuted}
        onVolumeChange={setVolume}
        muted={muted}
        volume={volume}
      />
    </div>
  )
}

export default NavBar
