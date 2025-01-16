import { CookiesProvider } from 'react-cookie'

import Chat from './Chat'
import CheckVerificationToken from './CheckVerificationToken'
import Modal from './Modal'
import NavBar from './NavBar'
import { ChatProvider } from './contexts/ChatContext'
import { ModalProvider } from './contexts/ModalContext'
import { SocketIOProvider } from './contexts/SocketIOContext'
import { StreamInfoProvider } from './contexts/StreamInfoContext'
import { UserProvider } from './contexts/UserContext'

const App = () => {
  return (
    <CookiesProvider>
      <ModalProvider>
        <SocketIOProvider>
          <StreamInfoProvider>
            <UserProvider>
              <ChatProvider>
                <CheckVerificationToken>
                  <NavBar />
                  <Chat />
                  <Modal />
                </CheckVerificationToken>
              </ChatProvider>
            </UserProvider>
          </StreamInfoProvider>
        </SocketIOProvider>
      </ModalProvider>
    </CookiesProvider>
  )
}

export default App
