import React, { useContext, useEffect, useMemo, useState } from 'react'
import SocketIOContext from './SocketIOContext'

const setPageTitle = (streamName) => {
  document.title = streamName || 'Stream offline'
}

const StreamInfoContext = React.createContext()

const StreamInfoProvider = ({ children }) => {
  const [socket] = useContext(SocketIOContext)
  const [listeners, setListeners] = useState()
  const [listenUrl, setListenUrl] = useState()
  const [streamStart, setSteamStart] = useState()
  const [streamTitle, setStreamTitle] = useState()
  const [streamOnline, setStreamOnline] = useState('unknown')

  useEffect(() => {
    if (socket) {
      socket.on('connect', () => {
        socket.emit('stream:request')

        socket.on('stream:info', (info) => {
          if (info && info.listenUrl) {
            setListeners(info.listeners)
            setListenUrl(info.listenUrl)
            setSteamStart(new Date(info.streamStart))
            setStreamTitle(info.name)
            setStreamOnline('online')
            setPageTitle(info.name)
          } else {
            setListeners(undefined)
            setListenUrl(undefined)
            setSteamStart(undefined)
            setStreamTitle(undefined)
            setStreamOnline('offline')
            setPageTitle(undefined)
          }
        })
      })

      socket.on('stream:listeners', (count) => {
        setListeners(count)
      })
    }
  }, [socket])

  const value = useMemo(
    () => ({
      listeners,
      listenUrl,
      streamOnline,
      streamStart,
      streamTitle,
    }),
    [listeners, listenUrl, streamOnline, streamStart, streamTitle]
  )

  return <StreamInfoContext.Provider value={value}>{children}</StreamInfoContext.Provider>
}

export default StreamInfoContext
export { StreamInfoProvider }
