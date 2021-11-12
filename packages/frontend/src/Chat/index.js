import { useCallback } from 'react'

import Settings from '../Settings'
import { Login, MessageInput, Register } from './chatControls'
import MessagePane from './MessagePane'
import useChatConnection from './useChatConnection'
import style from './Chat.sss'

const Chat = ({ setModal }) => {
  const {
    connectState,
    deleteAccount,
    login,
    logout,
    messages,
    nickname,
    notif,
    register,
    sendMessage,
    showLoginForm,
    showRegisterForm,
    updateNotif,
  } = useChatConnection(setModal)

  let chatControls

  const showSettings = useCallback(() => {
    setModal({
      content: <Settings deleteAccount={deleteAccount} notif={notif} updateNotif={updateNotif} />,
    })
  }, [deleteAccount, notif, setModal, updateNotif])

  switch (connectState) {
    case 'connected':
      chatControls = (
        <MessageInput
          logout={logout}
          nickname={nickname}
          sendMessage={sendMessage}
          showSettings={showSettings}
        />
      )
      break
    case 'disconnected':
    case 'connecting':
      chatControls = (
        <Login
          connectState={connectState}
          login={login}
          nickname={nickname}
          showRegisterForm={showRegisterForm}
        />
      )
      break
    case 'registerForm':
    case 'registering':
      chatControls = (
        <Register showLoginForm={showLoginForm} connectState={connectState} register={register} />
      )
      break
    default:
  }

  return (
    <div className={style.chat}>
      <MessagePane messages={messages} />
      {chatControls}
    </div>
  )
}

export default Chat
