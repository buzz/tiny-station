import AudioPlayer from './AudioPlayer'
import Chat from './Chat'
import useSocketIO from './useSocketIO'

const App = () => {
  const { listeners, listenUrl, streamOnline, streamStart, title } = useSocketIO(
    process.env.ICECAST_URL
  )

  return (
    <>
      <AudioPlayer
        listeners={listeners}
        listenUrl={listenUrl}
        streamOnline={streamOnline}
        streamStart={streamStart}
        title={title}
      />
      <Chat />
    </>
  )
}

export default App
