import AudioPlayer from "./AudioPlayer";
import Chat from "./Chat";

const App = () => (
  <>
    <AudioPlayer src="http://127.0.0.1:9999/stream" />
    <Chat />
  </>
);

export default App;
