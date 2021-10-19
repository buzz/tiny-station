import { useCallback } from "react";
import classNames from "classnames";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faCircle,
  faExclamationCircle,
  faPlayCircle,
  faSpinner,
  faStopCircle,
} from "@fortawesome/free-solid-svg-icons";

import useAudioStream from "./useAudioStream";
import VolumeControl from "./VolumeControl";

const AudioPlayer = ({ src }) => {
  const { setVolume, setMuted, streamState, startStream, stopStream, volume, muted } = useAudioStream(src);

  const onPlayStopClick = () => {
    if (streamState === "playing") {
      stopStream();
    } else {
      startStream();
    }
  };

  const onToggleMuted = useCallback(() => {
    setMuted(!muted);
  }, [muted, setMuted]);

  let btnTitle;
  let faIcon;
  let statusText = "";
  if (streamState === "playing") {
    btnTitle = "Stop stream";
    faIcon = <FontAwesomeIcon icon={faStopCircle} fixedWidth size="2x" />;
    statusText = "Playing…";
  } else if (streamState === "stopped") {
    btnTitle = "Play stream";
    faIcon = <FontAwesomeIcon icon={faPlayCircle} fixedWidth size="2x" />;
  } else if (streamState === "loading") {
    btnTitle = "Loading stream…";
    faIcon = (
      <span className="fa-layers fa-fw fa-2x">
        <FontAwesomeIcon icon={faCircle} />
        <FontAwesomeIcon icon={faSpinner} inverse spin transform="shrink-6" />
      </span>
    );
    statusText = "Loading…";
  } else if (streamState === "error") {
    faIcon = <FontAwesomeIcon icon={faExclamationCircle} fixedWidth size="2x" />;
    statusText = "Error: …";
  }

  return (
    <div className="navbar">
      <div className="player">
        <button
          className={classNames("iconButton", "playButton")}
          disabled={streamState === "loading"}
          title={btnTitle}
          type="button"
          onClick={onPlayStopClick}
        >
          {faIcon}
        </button>
        <div>{statusText}</div>
      </div>
      <div className="center"></div>
      <VolumeControl onToggleMuted={onToggleMuted} onVolumeChange={setVolume} muted={muted} volume={volume} />
    </div>
  );
};

export default AudioPlayer;
