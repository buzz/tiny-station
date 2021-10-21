import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeadphonesAlt } from '@fortawesome/free-solid-svg-icons'

import styleCommon from '../styles/_common.sss'
import style from './NavBar.sss'

const ListenerCount = ({ listeners }) => (
  <div title="Current listeners">
    <FontAwesomeIcon className={styleCommon.icon} icon={faHeadphonesAlt} />{' '}
    <strong className={style.listenersLabel}>{listeners}</strong>
  </div>
)

export default ListenerCount
