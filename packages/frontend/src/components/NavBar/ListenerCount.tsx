import { faHeadphonesAlt } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'

import style from './NavBar.module.css'

function ListenerCount({ listeners }: ListenerCountProps) {
  return (
    <span title="Current listeners">
      <FontAwesomeIcon className={style.counterIcon} icon={faHeadphonesAlt} />
      <span className={style.counterLabel}>{listeners ?? 0}</span>
    </span>
  )
}

interface ListenerCountProps {
  listeners: number | undefined
}

export default ListenerCount
