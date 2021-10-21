import { useEffect, useRef, useState } from 'react'

import style from './NavBar.sss'

const getTimeSince = (startTime) => {
  let duration = Date.now() - startTime
  const parts = []

  const msInHour = 1000 * 60 * 60
  const hours = Math.trunc(duration / msInHour)
  if (hours > 0) {
    parts.push(hours)
    duration -= hours * msInHour
  }

  const msInMinute = 1000 * 60
  const minutes = Math.trunc(duration / msInMinute)
  parts.push(minutes.toString().padStart(2, '0'))
  duration -= minutes * msInMinute

  const msInSeconds = 1000
  const seconds = Math.trunc(duration / msInSeconds)
  if (seconds > 0 || parts.length) {
    parts.push(seconds.toString().padStart(2, '0'))
    duration -= minutes * msInMinute
  }

  return parts.length ? parts.join(':') : 'less than 1 min'
}

const OnlineCounter = ({ streamOnline, streamStart }) => {
  const [timeSince, setTimeSince] = useState('')
  const intervalRef = useRef()

  useEffect(() => {
    setTimeSince(getTimeSince(streamStart))
    intervalRef.current = window.setInterval(() => {
      setTimeSince(getTimeSince(streamStart))
    }, 1000)

    return () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current)
      }
    }
  }, [streamStart])

  const timeSinceText =
    streamOnline === 'online' && streamStart
      ? `Online since ${streamStart.toLocaleTimeString()}`
      : undefined
  const timeSinceLabel = streamOnline === 'online' ? timeSince : undefined

  return (
    <div className={style.onlineSince} title={timeSinceText}>
      {timeSinceLabel}
    </div>
  )
}

export default OnlineCounter
