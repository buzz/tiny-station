import { useState } from 'react'
import { CookiesProvider } from 'react-cookie'

import Chat from './Chat'
import CheckVerificationToken from './CheckVerificationToken'
import Modal from './Modal'
import NavBar from './NavBar'
import { SocketIOProvider } from './contexts/SocketIOContext'
import { StreamInfoProvider } from './contexts/StreamInfoContext'

const App = () => {
  const [modal, setModal] = useState({})

  return (
    <CookiesProvider>
      <SocketIOProvider>
        <StreamInfoProvider>
          <CheckVerificationToken setModal={setModal}>
            <NavBar />
            <Chat setModal={setModal} />
            <Modal modal={modal} setModal={setModal} />
          </CheckVerificationToken>
        </StreamInfoProvider>
      </SocketIOProvider>
    </CookiesProvider>
  )
}

export default App
