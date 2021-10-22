import { CookiesProvider } from 'react-cookie'

import NavBar from './NavBar'
import Chat from './Chat'
import SocketIOContext, { socket } from './SocketIOContext'

const App = () => (
  <CookiesProvider>
    <SocketIOContext.Provider value={socket}>
      <NavBar />
      <Chat />
    </SocketIOContext.Provider>
  </CookiesProvider>
)

export default App
