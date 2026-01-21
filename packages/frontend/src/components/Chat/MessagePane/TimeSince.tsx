import { useEffect, useRef, useState } from 'react'

import style from './MessagePane.module.css'

function timeSince(timestamp: number) {
  const seconds = Math.floor((Date.now() - timestamp) / 1000)
  let interval = seconds / 31_536_000
  if (interval > 1) {
    const years = Math.floor(interval)
    return `${years} year${years === 1 ? '' : 's'} ago`
  }
  interval = seconds / 2_592_000
  if (interval > 1) {
    const months = Math.floor(interval)
    return `${months} month${months === 1 ? '' : 's'} ago`
  }
  interval = seconds / 86_400
  if (interval > 1) {
    const days = Math.floor(interval)
    return `${days} day${days === 1 ? '' : 's'} ago`
  }
  interval = seconds / 3600
  if (interval > 1) {
    return `${Math.floor(interval)} h ago`
  }
  interval = seconds / 60
  if (interval > 1) {
    return `${Math.floor(interval)} min ago`
  }

  return null
}

function TimeSince({ timestamp }: TimeSinceProps) {
  const [output, setOutput] = useState(() => timeSince(timestamp))
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    intervalRef.current = globalThis.setInterval(() => {
      setOutput(timeSince(timestamp))
    }, 15 * 1000)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [timestamp])

  return (
    <span className={style.time} title={new Date(timestamp).toLocaleString()}>
      {output}
    </span>
  )
}

interface TimeSinceProps {
  timestamp: number
}

export default TimeSince
