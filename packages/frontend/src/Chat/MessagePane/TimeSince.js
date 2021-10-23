import { useEffect, useRef, useState } from 'react'

const timeSince = (date) => {
  const seconds = Math.floor((new Date() - date) / 1000)
  let interval = seconds / 31536000
  if (interval > 1) {
    return `${Math.floor(interval)} years ago`
  }
  interval = seconds / 2592000
  if (interval > 1) {
    return `${Math.floor(interval)} months ago`
  }
  interval = seconds / 86400
  if (interval > 1) {
    return `${Math.floor(interval)} days ago`
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

  return output
}

export default TimeSince
