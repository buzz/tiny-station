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
  let titleText

  const [timeSince, setTimeSince] = useState('')
  const intervalRef = useRef()

  if (streamOnline === 'online') {
    titleText = streamTitle || 'No name stream'
  } else if (streamOnline === 'offline') {
    titleText = 'Stream offline'
  } else {
    titleText = ''
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
    <>
      <div className={style.title}>{titleText}</div>
      <div className={style.onlineSince}>{timeSinceLabel}</div>
    </>
  )
}

export default StreamTitle
