import { useContext, useEffect, useState } from 'react'
import SocketIOContext from '../SocketIOContext'

const useChatConnection = () => {
  const socket = useContext(SocketIOContext)
  const [connectState, setConnectState] = useState('disconnected')
  const [nickname, setNickname] = useState()
  const [failMessage, setFailMessage] = useState()
  const [messages, setMessages] = useState({})

  useEffect(() => {
    socket.on('connect', () => {
      socket.on('chat:join-success', (newNickname) => {
        setConnectState('connected')
        setNickname(newNickname)
      })

      socket.on('chat:join-fail', (errorMsg) => {
        setConnectState('failed')
        setFailMessage(errorMsg)
      })

      socket.on('chat:message', (uuid, timestamp, senderNickname, msg) => {
        setMessages((oldMessages) => ({
          ...oldMessages,
          [uuid]: [timestamp, senderNickname, msg],
        }))
      })

      socket.on('chat:kick', (errorMsg) => {
        setConnectState('failed')
        setNickname(undefined)
        setFailMessage(errorMsg)
      })
    })
  })

  return {
    connectState,
    failMessage,
    messages,
    nickname,
    joinChat: (chosenNickname) => {
      socket.emit('chat:join', chosenNickname)
      setConnectState('connecting')
    },
    resetError: () => {
      setFailMessage(undefined)
      setConnectState('disconnected')
    },
    sendMessage: (message) => {
      socket.emit('chat:message', message)
    },
  }
}

export default useChatConnection
