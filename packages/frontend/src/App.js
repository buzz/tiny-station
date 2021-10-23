import { useState } from 'react'
import { CookiesProvider } from 'react-cookie'

import Chat from './Chat'
import CheckVerificationToken from './CheckVerificationToken'
import Modal from './Modal'
import NavBar from './NavBar'
import { SocketIOProvider } from './SocketIOContext'

const App = () => {
  const [modalMessage, setModalMessage] = useState()
  const [modalAction, setModalAction] = useState()

  return (
    <CookiesProvider>
      <SocketIOProvider>
        <CheckVerificationToken setModalAction={setModalAction} setModalMessage={setModalMessage}>
          <NavBar />
          <Chat setModalMessage={setModalMessage} />
          <Modal
            modalAction={modalAction}
            modalMessage={modalMessage}
            setModalMessage={setModalMessage}
          />
        </CheckVerificationToken>
      </SocketIOProvider>
    </CookiesProvider>
  )
}

export default App
