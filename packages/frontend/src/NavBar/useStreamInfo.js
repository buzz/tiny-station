import { useContext, useEffect, useState } from 'react'
import SocketIOContext from '../SocketIOContext'

const useStreamInfo = () => {
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
            setListenUrl(info.listenUrl)
            setSteamStart(new Date(info.streamStart))
            setStreamTitle(info.name)
            setStreamOnline('online')
          } else {
            setListeners(undefined)
            setListenUrl(undefined)
            setSteamStart(undefined)
            setStreamTitle(undefined)
            setStreamOnline('offline')
          }
        })

        socket.on('stream:listeners', (count) => {
          setListeners(count)
        })
      })
    }
  }, [socket])

  return {
    listeners,
    listenUrl,
    streamOnline,
    streamStart,
    streamTitle,
  }
}

export default useStreamInfo
