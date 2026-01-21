import IcecastMetadataPlayer from 'icecast-metadata-player'
import { useCallback, useContext, useEffect, useRef, useState } from 'react'

import ModalContext from '../contexts/ModalContext'

const useAudioStream = (src) => {
  const { pushModal } = useContext(ModalContext)
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
      // Force https, otherwise browser would block request
      const playerSrc =
        window.location.protocol === 'https:' ? src.replace('http://', 'https://') : src

      audioRef.current = new Audio()
      playerRef.current = new IcecastMetadataPlayer(playerSrc, {
        audioElement: audioRef.current,
        metadataTypes: [],
      })

      playerRef.current.addEventListener('play', () => setStreamState('playing'))
      playerRef.current.addEventListener('load', () => setStreamState('loading'))
      playerRef.current.addEventListener('streamEnd', () => setStreamState('stopped'))
      playerRef.current.addEventListener('stop', () => setStreamState('stopped'))
      playerRef.current.addEventListener('error', (ev) => {
        pushModal({
          content: `Could not play stream! Error message: "${ev.detail[0].message}", URL: "${playerSrc}"`,
        })
        setStreamState('error')
      })
    }

    playerRef.current.play()
  }, [pushModal, src])

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
