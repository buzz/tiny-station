import { faFileAudio } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import style from './NavBar.module.css'

function StreamUrl({ streamUrl }: StreamUrlProps) {
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

interface StreamUrlProps {
  streamUrl: string | undefined
}

export default StreamUrl
