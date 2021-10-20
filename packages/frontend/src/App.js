import AudioPlayer from './AudioPlayer'
import Chat from './Chat'
import useSocketIO from './useSocketIO'

const App = () => {
  const streamInfo = useSocketIO(process.env.ICECAST_URL)

  return (
    <>
      <AudioPlayer streamInfo={streamInfo} />
      <Chat />
    </>
  )
}

export default App
