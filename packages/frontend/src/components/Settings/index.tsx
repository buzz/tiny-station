import { faTrash } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useState } from 'react'
import Switch from 'react-switch'

import useStreamInfo from '#hooks/useStreamInfo'
import useUser from '#hooks/useUser'

import style from './Settings.module.css'

function Settings() {
  const { deleteAccount, notif, updateNotif } = useUser()
  const { listenUrl } = useStreamInfo()

  const [settingsNotif, setSettingsNotif] = useState(notif ?? true)
  const [deleteConfirm, setDeleteConfirm] = useState(0)

  let deleteLabel = 'Delete my account!'
  switch (deleteConfirm) {
    case 1: {
      deleteLabel = 'Sure?'

      break
    }
    case 2: {
      deleteLabel = 'Really sure?'

      break
    }
    case 3: {
      deleteLabel = 'Really really sure?'

      break
    }
    // No default
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
          <FontAwesomeIcon icon={faTrash} />
          {deleteLabel}
        </button>
      </div>
    </>
  )
}

export default Settings
