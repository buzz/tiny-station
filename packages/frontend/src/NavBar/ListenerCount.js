import classNames from 'classnames'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faHeadphonesAlt } from '@fortawesome/free-solid-svg-icons'

import styleCommon from '../styles/_common.sss'
import style from './NavBar.sss'

const ListenerCount = ({ listeners }) => (
  <span title="Current listeners">
    <FontAwesomeIcon
      className={classNames(styleCommon.icon, style.labelIcon)}
      icon={faHeadphonesAlt}
    />
    <strong className={style.listenersLabel}>{listeners}</strong>
  </span>
)

export default ListenerCount
