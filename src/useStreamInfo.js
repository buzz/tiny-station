import { useEffect, useState } from "react";

const FETCH_INTERVAL = 10 * 1000;

const fetchStreamInfo = async (url) => {
  const response = await fetch(`${url}status-json.xsl`);
  try {
    let {
      icestats: { source },
    } = await response.json();
    source = Array.isArray(source) ? source[0] : source;
    return source;
  } catch {}
  throw new Error("Failed to parse stream info");
};

const useStreamInfo = (icecastUrl) => {
  const [listeners, setListeners] = useState();
  const [listenUrl, setListenUrl] = useState();
  const [streamStart, setSteamStart] = useState();
  const [title, setTitle] = useState();
  const [streamOnline, setStreamOnline] = useState("unknown");

  useEffect(() => {
    let timer;
    const checkStreamInfo = () => {
      console.log("start");
      fetchStreamInfo(icecastUrl)
        .then((source) => {
          setListeners(source.listeners);
          setListenUrl(source.listenurl);
          setSteamStart(new Date(source.stream_start_iso8601));
          setTitle(source.title);
          document.title = source.title;
          setStreamOnline("online");
        })
        .catch(() => {
          setTitle(undefined);
          setStreamOnline("offline");
        })
        .finally(() => {
          timer = setTimeout(checkStreamInfo, FETCH_INTERVAL);
        });
    };

    checkStreamInfo();

    return () => clearTimeout(timer);
  }, [icecastUrl]);

  return {
    listeners,
    listenUrl,
    streamOnline,
    streamStart,
    title,
  };
};

export default useStreamInfo;
