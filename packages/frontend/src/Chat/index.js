import { Error, Joiner, MessageInput, Register } from './chatControls'
import MessagePane from './MessagePane'
import useChatConnection from './useChatConnection'
import style from './Chat.sss'

const Chat = () => {
  const {
    failMessage,
    connectState,
    exitChat,
    joinChat,
    messages,
    nickname,
    register,
    resetError,
    showRegisterForm,
    sendMessage,
  } = useChatConnection()

  let chatControls

  switch (connectState) {
    case 'connected':
      chatControls = (
        <MessageInput exitChat={exitChat} nickname={nickname} sendMessage={sendMessage} />
      )
      break
    case 'disconnected':
      chatControls = (
        <Joiner joinChat={joinChat} nickname={nickname} showRegisterForm={showRegisterForm} />
      )
      break
    case 'failed':
      chatControls = <Error failMessage={failMessage} resetError={resetError} />
      break
    case 'registerForm':
    case 'registering':
      chatControls = <Register connectState={connectState} register={register} />
      break
    default:
  }

  return (
    <div className={style.chat}>
      <MessagePane messages={messages} />
      <div className={style.chatControls}>{chatControls}</div>
    </div>
  )
}

export default Chat
