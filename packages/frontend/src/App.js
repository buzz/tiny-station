import NavBar from './NavBar'
import Chat from './Chat'
import SocketIOContext, { socket } from './SocketIOContext'

const App = () => (
  <SocketIOContext.Provider value={socket}>
    <NavBar />
    <Chat />
  </SocketIOContext.Provider>
)

export default App
