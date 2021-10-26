import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeadphonesAlt } from '@fortawesome/free-solid-svg-icons'

import style from './NavBar.sss'

const ListenerCount = ({ listeners }) => (
  <span title="Current listeners">
    <FontAwesomeIcon className={style.counterIcon} icon={faHeadphonesAlt} />
    <span className={style.counterLabel}>{listeners}</span>
  </span>
)

export default ListenerCount
