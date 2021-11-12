import { useState } from 'react'
import Switch from 'react-switch'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faTrash } from '@fortawesome/free-solid-svg-icons'

import style from './Settings.sss'

const Settings = ({ deleteAccount, notif, updateNotif }) => {
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
        <button type="button" onClick={deleteAccountClick}>
          <FontAwesomeIcon icon={faTrash} fixedWidth />
          {deleteLabel}
        </button>
      </div>
    </>
  )
}

export default Settings
