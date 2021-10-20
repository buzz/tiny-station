import { useEffect, useRef, useState } from 'react'

import socketIOClient from 'socket.io-client'

const useSocketIO = () => {
  const [listeners, setListeners] = useState()
  const [listenUrl, setListenUrl] = useState()
  const [streamStart, setSteamStart] = useState()
  const [streamTitle, setStreamTitle] = useState()
  const [streamOnline, setStreamOnline] = useState('unknown')
  const io = useRef()

  useEffect(() => {
    io.current = socketIOClient()

    io.current.on('connect', () => {
      io.current.emit('requestStreamInfo')

      io.current.on('streamInfo', (info) => {
        if (info.listenUrl) {
          setListeners(info.listeners)
          setListenUrl(info.listenUrl)
          setSteamStart(new Date(info.streamStart))
          setStreamTitle(info.title)
          setStreamOnline('online')
        } else {
          setListeners(undefined)
          setListenUrl(undefined)
          setSteamStart(undefined)
          setStreamTitle(undefined)
          setStreamOnline('offline')
        }
      })
    })

    return () => {
      if (io.current) {
        io.current.disconnect()
      }
    }
  }, [])

  return {
    listeners,
    listenUrl,
    streamOnline,
    streamStart,
    streamTitle,
  }
}

export default useSocketIO
