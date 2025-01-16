import { useContext, useState } from 'react'
import Switch from 'react-switch'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

import StreamInfoContext from '../contexts/StreamInfoContext'
import UserContext from '../contexts/UserContext'
import style from './Settings.module.css'

const Settings = () => {
  const { deleteAccount, notif, updateNotif } = useContext(UserContext)
  const { listenUrl } = useContext(StreamInfoContext)

  const [settingsNotif, setSettingsNotif] = useState(notif)
  const [deleteConfirm, setDeleteConfirm] = useState(0)

  let deleteLabel = 'Delete my account!'
  if (deleteConfirm === 1) {
    deleteLabel = 'Sure?'
  } else if (deleteConfirm === 2) {
    deleteLabel = 'Really sure?'
  } else if (deleteConfirm === 3) {
    deleteLabel = 'Really really sure?'
  }

  const deleteAccountClick = () => {
    if (deleteConfirm > 2) {
      deleteAccount()
    } else {
      setDeleteConfirm((val) => val + 1)
    }
  }

  const listenUrlLink = listenUrl ? (
    <a href={listenUrl}>{listenUrl}</a>
  ) : (
    <em>Stream currently offline</em>
  )

  return (
    <>
      <h2>Settings</h2>
      <div className={style.settings}>
        <div className={style.row}>
          <Switch
            checked={settingsNotif}
            onChange={(val) => {
              updateNotif(val)
              setSettingsNotif(val)
            }}
          />
          <span>Send me email notifications when the stream starts</span>
        </div>
        <div className={style.row}>
          <div>
            Use this URL directly in your media player:
            <br />
            {listenUrlLink}
          </div>
        </div>
        <button type="button" onClick={deleteAccountClick}>
          <FontAwesomeIcon icon={faTrash} fixedWidth />
          {deleteLabel}
        </button>
      </div>
    </>
  )
}

export default Settings
