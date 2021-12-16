import { useEffect, useRef, useState } from 'react'
import style from './MessagePane.sss'

const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) {
    const years = Math.floor(interval)
    return `${years} year${years === 1 ? '' : 's'} ago`
  }
  interval = seconds / 2592000
  if (interval > 1) {
    const months = Math.floor(interval)
    return `${months} month${months === 1 ? '' : 's'} ago`
  }
  interval = seconds / 86400
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

const TimeSince = ({ timestamp }) => {
  const [output, setOutput] = useState(timeSince(timestamp))
  const intervalID = useRef()

  useEffect(() => {
    intervalID.current = setInterval(() => setOutput(timeSince(timestamp)), 15 * 1000)

    return () => {
      if (intervalID.current) {
        clearInterval(intervalID.current)
      }
    }
  }, [timestamp])

  return (
    <span className={style.time} title={new Date(timestamp).toLocaleString()}>
      {output}
    </span>
  )
}

export default TimeSince
