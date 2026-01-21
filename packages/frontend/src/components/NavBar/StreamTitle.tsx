import type { StreamOnlineState } from '#contexts/StreamInfoContext'

import style from './NavBar.module.css'

function StreamTitle({ streamTitle, streamOnline }: StreamTitleProps) {
  let titleText

  if (streamOnline === 'online') {
    titleText = streamTitle ?? ''
  } else if (streamOnline === 'offline') {
    titleText = 'Stream offline'
  } else {
    titleText = ''
  }

  return <div className={style.title}>{titleText}</div>
}

interface StreamTitleProps {
  streamTitle: string | undefined
  streamOnline: StreamOnlineState | undefined
}

export default StreamTitle
