import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faFileAudio } from '@fortawesome/free-solid-svg-icons'

import style from './NavBar.sss'

const StreamUrl = ({ streamUrl }) => {
  return (
    <a
      className={style.streamUrl}
      href={streamUrl}
      rel="noreferrer"
      target="_blank"
      title="Stream URL"
    >
      <FontAwesomeIcon icon={faFileAudio} />
    </a>
  )
}

export default StreamUrl
