import { faClock } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { useEffect, useRef, useState } from 'react'

import type { StreamOnlineState } from '#contexts/StreamInfoContext'

import style from './NavBar.module.css'

function getTimeSince(startTime: Date): string {
  const durationMs = Date.now() - startTime.getTime()

  const seconds = Math.floor((durationMs / 1000) % 60)
  const minutes = Math.floor((durationMs / (1000 * 60)) % 60)
  const hours = Math.floor(durationMs / (1000 * 60 * 60))

  if (hours > 0) {
    return `${hours}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  if (minutes > 0) {
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`
  }

  return 'less than 1 min'
}

function OnlineCounter({ streamOnline, streamStart }: OnlineCounterProps) {
  const [timeSince, setTimeSince] = useState(() => (streamStart ? getTimeSince(streamStart) : ''))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (!streamStart) {
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
