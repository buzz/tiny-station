import { use } from 'react'

import StreamInfoContext from '#contexts/StreamInfoContext'
import type { StreamInfoContextValue } from '#contexts/StreamInfoContext'

function useStreamInfo(): StreamInfoContextValue {
  const ctx = use(StreamInfoContext)
  if (!ctx) {
    throw new Error('useStreamInfo must be used within <StreamInfoProvider>')
  }
  return ctx
}

export default useStreamInfo
