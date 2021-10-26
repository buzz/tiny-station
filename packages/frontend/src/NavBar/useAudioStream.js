import { useCallback, useEffect, useRef, useState } from 'react'
import IcecastMetadataPlayer from 'icecast-metadata-player'

const useAudioStream = (src) => {
  const [volume, setVolume] = useState(1.0)
  const [muted, setMuted] = useState(false)
  const [streamState, setStreamState] = useState('stopped')
  const playerRef = useRef()
  const audioRef = useRef()

  const stopStream = useCallback(() => {
    if (playerRef.current) {
      playerRef.current.stop()
    }
  }, [])

  const startStream = useCallback(() => {
    if (!playerRef.current) {
      audioRef.current = new Audio()
      playerRef.current = new IcecastMetadataPlayer(src, {
        audioElement: audioRef.current,
        metadataTypes: [],
      })

      playerRef.current.addEventListener('play', () => setStreamState('playing'))
      playerRef.current.addEventListener('load', () => setStreamState('loading'))
      playerRef.current.addEventListener('streamEnd', () => setStreamState('stopped'))
      playerRef.current.addEventListener('stop', () => setStreamState('stopped'))
      playerRef.current.addEventListener('error', () => setStreamState('error'))
    }

    playerRef.current.play()
  }, [src])

  useEffect(() => () => stopStream(), [stopStream])

  return {
    setVolume: useCallback((vol) => {
      setVolume(vol)
      if (audioRef.current) {
        audioRef.current.volume = vol
      }
    }, []),
    setMuted: useCallback((mutedNew) => {
      setMuted(mutedNew)
      if (audioRef.current) {
        audioRef.current.muted = mutedNew
      }
    }, []),
    streamState,
    startStream,
    stopStream,
    muted,
    volume,
  }
}

export default useAudioStream
