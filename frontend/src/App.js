import AudioPlayer from "./AudioPlayer";
import Chat from "./Chat";
import useStreamInfo from "./useStreamInfo";

const App = () => {
  const { listeners, listenUrl, streamOnline, streamStart, title } = useStreamInfo("http://127.0.0.1:8000/");

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
  );
};

export default App;
