import { useEffect, useRef, useState } from 'react'

import style from './NavBar.sss'

const getTimeSince = (startTime) => {
  let duration = Date.now() - startTime
  const portions = []

  const msInHour = 1000 * 60 * 60
  const hours = Math.trunc(duration / msInHour)
  if (hours > 0) {
    portions.push(`${hours} h`)
    duration -= hours * msInHour
  }

  const msInMinute = 1000 * 60
  const minutes = Math.trunc(duration / msInMinute)
  if (minutes > 0) {
    portions.push(`${minutes} min`)
    duration -= minutes * msInMinute
  }

  return portions.length ? portions.join(' ') : 'less than 1 min'
}

const StreamTitle = ({ streamInfo: { streamOnline, streamStart, streamTitle } }) => {
  let statusText

  const [timeSince, setTimeSince] = useState('')
  const intervalRef = useRef()

  if (streamOnline === 'online') {
    statusText = streamTitle || 'No name stream'
  } else if (streamOnline === 'offline') {
    statusText = 'Stream offline'
  } else {
    statusText = ''
  }

  useEffect(() => {
    setTimeSince(getTimeSince(streamStart))
    intervalRef.current = window.setInterval(() => {
      setTimeSince(getTimeSince(streamStart))
    }, 1000 * 5)

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [streamStart])

  const timeSinceLabel = streamOnline === 'online' ? `(online for ${timeSince})` : undefined

  return (
    <div>
      {statusText}
      <span className={style.onlineSince}>{timeSinceLabel}</span>
    </div>
  )
}

export default StreamTitle
