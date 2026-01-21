import IcecastMetadataPlayer from 'icecast-metadata-player'
import { useCallback, useEffect, useRef, useState } from 'react'

import useModal from './useModal'

const audioElement = new Audio()

// Fix protocol mismatch on secure website
function fixListenUrl(listenUrl: string | undefined) {
  if (!listenUrl) {
    return listenUrl
  }

  return globalThis.location.protocol === 'https:'
    ? listenUrl.replace('http://', 'https://')
    : listenUrl
}

function getErrorMessage([primary, secondary]: IcecastErrorEvent['detail']): string {
  if (primary instanceof Error) {
    return primary.message
  }
  if (secondary instanceof Error) {
    return secondary.message
  }
  if (typeof primary === 'string' && typeof secondary === 'string') {
    return `${primary}: ${secondary}`
  }
  if (typeof primary === 'string') {
    return primary
  }
  return 'Unknown audio stream error'
}

function useAudioStream(listenUrl: string | undefined) {
  const { pushModal } = useModal()

  const [volume, setVolume] = useState(1)
  const [muted, setMuted] = useState(false)
  const [streamState, setStreamState] = useState<StreamState>('stopped')

  const playerRef = useRef<IcecastMetadataPlayer | null>(null)
  const fixedListenUrl = fixListenUrl(listenUrl)

  useEffect(() => {
    if (!fixedListenUrl) {
      return
    }

    if (!playerRef.current) {
      const player = new IcecastMetadataPlayer(fixedListenUrl, {
        audioElement,
        bufferLength: 1, // seconds
        metadataTypes: [],
      })

      function handlePlay() {
        setStreamState('playing')
      }

      function handleLoad() {
        setStreamState('loading')
      }

      function handleStreamEnd() {
        setStreamState('stopped')
      }

      function handleStop() {
        setStreamState('stopped')
      }

      function handleError(e: Event) {
        const event = e as IcecastErrorEvent
        const prefix = 'Could not play stream! Error message:'
        const content = `${prefix} "${getErrorMessage(event.detail)}", URL: "${fixedListenUrl}"`
        console.error(content)
        pushModal({ content })
        setStreamState('error')
      }

      player.addEventListener('play', handlePlay)
      player.addEventListener('load', handleLoad)
      player.addEventListener('streamend', handleStreamEnd)
      player.addEventListener('stop', handleStop)
      player.addEventListener('error', handleError)

      playerRef.current = player

      return () => {
        if (playerRef.current === player) {
          playerRef.current = null
        }

        player.removeEventListener('play', handlePlay)
        player.removeEventListener('load', handleLoad)
        player.removeEventListener('streamend', handleStreamEnd)
        player.removeEventListener('stop', handleStop)
        player.removeEventListener('error', handleError)

        void (async () => {
          try {
            await player.stop()
            await player.detachAudioElement()
          } catch (error) {
            const prefix = 'Error cleaning up audio player:'
            console.error(prefix, error)
            const errMsg = error instanceof Error ? error.message : 'Unknown error'
            pushModal({ content: `${prefix} ${errMsg}` })
          }
        })()
      }
    }
    return
  }, [fixedListenUrl, pushModal])

  const startStream = useCallback(() => {
    if (playerRef.current) {
      void playerRef.current.play()
    }
  }, [])

  const stopStream = useCallback(() => {
    if (playerRef.current) {
      void playerRef.current.stop()
    }
  }, [])

  const setStreamVolume = useCallback((volume: number) => {
    setVolume(volume)
    audioElement.volume = volume
  }, [])

  const setStreamMuted = useCallback((mutedNew: boolean) => {
    setMuted(mutedNew)
    audioElement.muted = mutedNew
  }, [])

  return {
    setVolume: setStreamVolume,
    setMuted: setStreamMuted,
    streamState,
    startStream,
    stopStream,
    muted,
    volume,
  }
}

type StreamState = 'playing' | 'loading' | 'stopped' | 'error'

interface IcecastErrorEvent extends CustomEvent {
  detail: [primary: Error | string, secondary?: Error | string | Event]
}

export type { StreamState }
export default useAudioStream
