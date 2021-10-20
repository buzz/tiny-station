import NavBar from './NavBar'
import Chat from './Chat'
import useSocketIO from './useSocketIO'

const App = () => {
  const streamInfo = useSocketIO(process.env.ICECAST_URL)

  return (
    <>
      <NavBar streamInfo={streamInfo} />
      <Chat />
    </>
  )
}

export default App
