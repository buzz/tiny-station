import { useContext } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeadphonesAlt } from '@fortawesome/free-solid-svg-icons'

import StreamInfoContext from '../contexts/StreamInfoContext'
import style from './NavBar.sss'

const ListenerCount = () => {
  const { listeners } = useContext(StreamInfoContext)

  return (
    <span title="Current listeners">
      <FontAwesomeIcon className={style.counterIcon} icon={faHeadphonesAlt} />
      <span className={style.counterLabel}>{listeners}</span>
    </span>
  )
}

export default ListenerCount
