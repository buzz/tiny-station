import AudioPlayer from './AudioPlayer'
import Chat from './Chat'
import useStreamInfo from './useStreamInfo'

const App = () => {
  const { listeners, listenUrl, streamOnline, streamStart, title } = useStreamInfo(
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
