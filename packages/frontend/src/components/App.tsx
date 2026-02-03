import { CookiesProvider } from 'react-cookie'

import { ChatProvider } from '#contexts/ChatContext'
import { ModalProvider } from '#contexts/ModalContext'
import { SocketIOProvider } from '#contexts/SocketIOContext'
import { StreamInfoProvider } from '#contexts/StreamInfoContext'
import { UserProvider } from '#contexts/UserContext'
import usePasswordResetTokenCheck from '#hooks/usePasswordResetTokenCheck'
import useVerificationTokenCheck from '#hooks/useVerificationTokenCheck'

import Chat from './Chat'
import Modal from './Modal'
import NavBar from './NavBar'

function InnerApp() {
  useVerificationTokenCheck()
  usePasswordResetTokenCheck()

  return (
    <>
      <NavBar />
      <Chat />
      <Modal />
    </>
  )
}

function App() {
  return (
    <CookiesProvider>
      <ModalProvider>
        <SocketIOProvider>
          <StreamInfoProvider>
            <UserProvider>
              <ChatProvider>
                <InnerApp />
              </ChatProvider>
            </UserProvider>
          </StreamInfoProvider>
        </SocketIOProvider>
      </ModalProvider>
    </CookiesProvider>
  )
}

export default App
