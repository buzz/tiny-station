import { useEffect, useRef, useState } from 'react'

import style from './NavBar.sss'

const getTimeSince = (duration) => {
  let dur = duration
  const portions = []

  const msInHour = 1000 * 60 * 60
  const hours = Math.trunc(dur / msInHour)
  if (hours > 0) {
    portions.push(`${hours} h`)
    dur -= hours * msInHour
  }

  const msInMinute = 1000 * 60
  const minutes = Math.trunc(dur / msInMinute)
  if (minutes > 0) {
    portions.push(`${minutes} min`)
    dur -= minutes * msInMinute
  }

  return portions.length ? portions.join(' ') : 'less than 1 min'
}

const StreamTitle = ({ streamInfo: { streamOnline, streamStart, streamTitle } }) => {
  let statusText
  let timeDiff

  const [timeSince, setTimeSince] = useState('')
  const intervalRef = useRef()

  if (streamOnline === 'online') {
    statusText = streamTitle || 'No name stream'
    timeDiff = Date.now() - streamStart
  } else if (streamOnline === 'offline') {
    statusText = 'Stream offline'
  } else {
    statusText = ''
  }

  useEffect(() => {
    setTimeSince(getTimeSince(timeDiff))
    intervalRef.current = window.setInterval(() => setTimeSince(getTimeSince(timeDiff)), 1000 * 60)
    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [timeDiff])

  return (
    <div>
      {statusText}
      <span className={style.onlineSince}>(online since {timeSince})</span>
    </div>
  )
}

export default StreamTitle
