import TimeSince from './TimeSince'
import style from './Chat.sss'

const Message = ({ message: [timestamp, nickname, text], elementRef }) => (
  <tr className={style.message} ref={elementRef}>
    <td className={style.nickname}>{nickname}</td>
    <td className={style.text}>{text}</td>
    <td className={style.time} title={new Date(timestamp).toLocaleString()}>
      <TimeSince timestamp={timestamp} />
    </td>
  </tr>
)

export default Message
