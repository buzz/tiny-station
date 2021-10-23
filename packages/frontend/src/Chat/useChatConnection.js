import { useContext, useEffect, useState } from 'react'
import { useCookies } from 'react-cookie'
import SocketIOContext from '../SocketIOContext'

const COOKIE_NAME = 'listen-app-username'

const useChatConnection = () => {
  const socket = useContext(SocketIOContext)
  const [connectState, setConnectState] = useState('disconnected')
  const [nickname, setNickname] = useState('')
  const [failMessage, setFailMessage] = useState()
  const [messages, setMessages] = useState({})
  const [cookies, setCookie] = useCookies([COOKIE_NAME])

  useEffect(
    () => {
      socket.on('connect', () => {
        socket.on('chat:join-success', (newNickname) => {
          setConnectState('connected')
          setNickname(newNickname)
          setCookie(COOKIE_NAME, newNickname, {
            path: '/',
          })
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

        socket.on('chat:exit-success', () => {
          setConnectState('disconnected')
        })

        socket.on('chat:kick', (errorMsg) => {
          setConnectState('failed')
          setFailMessage(errorMsg)
        })

        socket.on('chat:push-messages', (pushMessages) => {
          const newMessages = pushMessages.reduce(
            (acc, [uuid, timestamp, senderNickname, msg]) => ({
              ...acc,
              [uuid]: [timestamp, senderNickname, msg],
            }),
            {}
          )

          setMessages((oldMessages) => ({
            ...oldMessages,
            ...newMessages,
          }))
        })
      })
    },
    [socket] // eslint-disable-line react-hooks/exhaustive-deps
  )

  useEffect(() => {
    if (['disconnected', 'failed'].includes(connectState)) {
      if (cookies[COOKIE_NAME]) {
        setNickname(cookies[COOKIE_NAME])
      }
    }
  }, [cookies, connectState])

  return {
    connectState,
    exitChat: () => {
      socket.emit('chat:exit')
    },
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
