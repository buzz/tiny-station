import { createContext, useCallback, useMemo, useState } from 'react'
import type { PropsWithChildren } from 'react'

import type { StreamInfo } from '@listen-app/common'

import useSocketIO, { useSocketEvent } from '#hooks/useSocketIO'

function setPageTitle(streamName?: string) {
  globalThis.document.title = streamName ?? 'Stream offline'
}

const StreamInfoContext = createContext<StreamInfoContextValue | undefined>(undefined)

function StreamInfoProvider({ children }: PropsWithChildren) {
  const { socket } = useSocketIO()
  const [listeners, setListeners] = useState<number | undefined>()
  const [listenUrl, setListenUrl] = useState<string | undefined>()
  const [streamStart, setStreamStart] = useState<Date | undefined>()
  const [streamTitle, setStreamTitle] = useState<string | undefined>()
  const [streamOnline, setStreamOnline] = useState<StreamOnlineState | undefined>()

  const handleConnect = useCallback(() => {
    socket.emit('stream:request')
  }, [socket])

  const handleStreamInfo = useCallback((info: StreamInfo | null) => {
    if (info === null) {
      setListeners(undefined)
      setListenUrl(undefined)
      setStreamStart(undefined)
      setStreamTitle(undefined)
      setStreamOnline('offline')
      setPageTitle(undefined)
    } else {
      setListeners(info.listeners)
      setListenUrl(info.listenUrl)
      setStreamStart(new Date(info.streamStart))
      setStreamTitle(info.name)
      setStreamOnline('online')
      setPageTitle(info.name)
    }
  }, [])

  const handleStreamListeners = useCallback((newListeners: number) => {
    setListeners(newListeners)
  }, [])

  useSocketEvent('connect', handleConnect)
  useSocketEvent('stream:info', handleStreamInfo)
  useSocketEvent('stream:listeners', handleStreamListeners)

  const value = useMemo(
    () =>
      ({
        listeners,
        listenUrl,
        streamOnline,
        streamStart,
        streamTitle,
      }) satisfies StreamInfoContextValue,
    [listeners, listenUrl, streamOnline, streamStart, streamTitle]
  )

  return <StreamInfoContext value={value}>{children}</StreamInfoContext>
}

interface StreamInfoContextValue {
  listeners: number | undefined
  listenUrl: string | undefined
  streamOnline: StreamOnlineState | undefined
  streamStart: Date | undefined
  streamTitle: string | undefined
}

type StreamOnlineState = 'online' | 'offline'

export type { StreamInfoContextValue, StreamOnlineState }
export { StreamInfoProvider }
export default StreamInfoContext
