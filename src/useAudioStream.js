import { useCallback, useEffect, useRef, useState } from "react";

const useAudioStream = (src) => {
  const [volume, setVolume] = useState(1.0);
  const [muted, setMuted] = useState(false);
  const [streamState, setStreamState] = useState("stopped");
  const audioRef = useRef();

  const startStream = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio();
      audioRef.current.setAttribute("src", src);
      audioRef.current.volume = volume;
      audioRef.current.muted = muted;
      audioRef.current.play();

      audioRef.current.addEventListener("playing", () => {
        setStreamState("playing");
      });
      audioRef.current.addEventListener("loadstart", () => {
        setStreamState("loading");
      });
      audioRef.current.addEventListener("stalled", () => {
        console.warn("stalled");
        setStreamState("error");
      });
      audioRef.current.addEventListener("error", (event) => {
        if (audioRef.current && audioRef.current.src === "about:dummy") {
          audioRef.current = undefined;
          setStreamState("stopped");
          return;
        }
        console.error(event);
        setStreamState("error");
      });
      audioRef.current.addEventListener("ended", () => {
        console.error("Stream ended");
        setStreamState("stopped");
      });
      audioRef.current.addEventListener("abort", () => {
        console.log("abort");
        setStreamState("stopped");
      });
      audioRef.current.addEventListener("pause", () => {
        setStreamState("stopped");
      });
    }
  }, [src, volume, muted]);

  const stopStream = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.src = "about:dummy";
      audioRef.current.pause();
      setTimeout(() => {
        audioRef.current.load(); // Force streaming to stop
      });
    }
  }, []);

  useEffect(() => () => stopStream(), [stopStream]);

  return {
    setVolume: useCallback((vol) => {
      setVolume(vol);
      if (audioRef.current) {
        audioRef.current.volume = vol;
      }
    }, []),
    setMuted: useCallback((muted) => {
      setMuted(muted);
      if (audioRef.current) {
        audioRef.current.muted = muted;
      }
    }, []),
    streamState,
    startStream,
    stopStream,
    muted,
    volume,
  };
};

export default useAudioStream;
