import { useState } from 'react'
import { CookiesProvider } from 'react-cookie'

import Chat from './Chat'
import CheckVerificationToken from './CheckVerificationToken'
import Modal from './Modal'
import NavBar from './NavBar'
import { SocketIOProvider } from './SocketIOContext'

const App = () => {
  const [modal, setModal] = useState({})

  return (
    <CookiesProvider>
      <SocketIOProvider>
        <CheckVerificationToken setModal={setModal}>
          <NavBar />
          <Chat setModal={setModal} />
          <Modal modal={modal} setModal={setModal} />
        </CheckVerificationToken>
      </SocketIOProvider>
    </CookiesProvider>
  )
}

export default App
