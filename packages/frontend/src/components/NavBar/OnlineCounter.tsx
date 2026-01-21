import { faClock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'

import type { StreamOnlineState } from '#contexts/StreamInfoContext'

import style from './NavBar.module.css'

function getTimeSince(startTime: Date) {
  let duration = Date.now() - startTime.getTime()
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
  if (seconds > 0 || parts.length > 0) {
    parts.push(seconds.toString().padStart(2, '0'))
    duration -= minutes * msInMinute
  }

  return parts.length > 0 ? parts.join(':') : 'less than 1 min'
}

function OnlineCounter({ streamOnline, streamStart }: OnlineCounterProps) {
  const [timeSince, setTimeSince] = useState(() => (streamStart ? getTimeSince(streamStart) : ''))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (typeof streamStart !== 'string') {
      return
    }

    intervalRef.current = globalThis.setInterval(() => {
      setTimeSince(getTimeSince(streamStart))
    }, 1000)

    return () => {
      if (intervalRef.current) {
        globalThis.clearInterval(intervalRef.current)
      }
    }
  }, [streamStart])

  const timeSinceText =
    streamOnline === 'online' && streamStart
      ? `Online since ${streamStart.toLocaleTimeString()}`
      : undefined

  return (
    <span title={timeSinceText}>
      <FontAwesomeIcon className={style.counterIcon} icon={faClock} />
      <span className={style.counterLabel}>{timeSince}</span>
    </span>
  )
}

interface OnlineCounterProps {
  streamOnline: StreamOnlineState | undefined
  streamStart: Date | undefined
}

export default OnlineCounter
