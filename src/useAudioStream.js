import { useCallback, useEffect, useRef, useState } from "react";

// http://localhost:9999/status-json.xsl

const SRC_STOPPED = "about:blank";

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
        console.log("playing");
        setStreamState("playing");
      });
      audioRef.current.addEventListener("loadstart", () => {
        console.log("loadstart");
        setStreamState("loading");
      });
      audioRef.current.addEventListener("stalled", () => {
        console.log("stalled");
        setStreamState("error");
      });
      audioRef.current.addEventListener("error", (event, b) => {
        if (audioRef.current.src === SRC_STOPPED) return;
        if (audioRef.current) {
          console.log("src:", audioRef.current.src);
        }
        console.log("event");
        console.log(event);
        setStreamState("error");
      });
      audioRef.current.addEventListener("ended", () => {
        setStreamState("stopped");
      });
      audioRef.current.addEventListener("abort", () => {
        setStreamState("stopped");
      });
      audioRef.current.addEventListener("pause", () => {
        setStreamState("stopped");
      });
    }
  }, [src, volume, muted]);

  const stopStream = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = undefined;
    }
  }, []);

  useEffect(
    () => () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = undefined;
      }
    },
    []
  );

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
