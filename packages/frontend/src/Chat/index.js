import Error from './Error'
import Joiner from './Joiner'
import MessageInput from './MessageInput'
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
    resetError,
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
      chatControls = <Joiner joinChat={joinChat} />
      break
    case 'failed':
      chatControls = <Error failMessage={failMessage} resetError={resetError} />
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
