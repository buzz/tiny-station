import Controls from './Controls'
import MessagePane from './MessagePane'
import style from './Chat.sss'

const Chat = () => {
  return (
    <div className={style.chat}>
      <MessagePane />
      <Controls />
    </div>
  )
}

export default Chat
