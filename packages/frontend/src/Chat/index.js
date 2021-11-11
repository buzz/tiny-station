import { Login, MessageInput, Register } from './chatControls'
import MessagePane from './MessagePane'
import useChatConnection from './useChatConnection'
import style from './Chat.sss'

const Chat = ({ setModalMessage }) => {
  const {
    connectState,
    messages,
    nickname,
    login,
    logout,
    register,
    sendMessage,
    showLoginForm,
    showRegisterForm,
  } = useChatConnection(setModalMessage)

  let chatControls

  switch (connectState) {
    case 'connected':
      chatControls = <MessageInput logout={logout} nickname={nickname} sendMessage={sendMessage} />
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
