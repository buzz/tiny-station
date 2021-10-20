import { useEffect, useRef, useState } from 'react'

import socketIOClient from 'socket.io-client'

const useSocketIO = () => {
  const [listeners, setListeners] = useState()
  const [listenUrl, setListenUrl] = useState()
  const [streamStart, setSteamStart] = useState()
  const [title, setTitle] = useState()
  const [streamOnline, setStreamOnline] = useState('unknown')
  const io = useRef()

  useEffect(() => {
    io.current = socketIOClient()

    io.current.on('connect', () => {
      console.log('connected')

      io.current.emit('requestStreamInfo')

      io.current.on('streamInfo', (info) => {
        console.log('streamInfo', info)

        if (!info.listenUrl) {
          setListeners(undefined)
          setListenUrl(undefined)
          setSteamStart(undefined)
          setTitle(undefined)
          setStreamOnline('offline')
        }

        setListeners(info.listeners)
        setListenUrl(info.listenUrl)
        setSteamStart(new Date(info.streamStart))
        setTitle(info.title)
        setStreamOnline('online')
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
    title,
  }
}

export default useSocketIO
