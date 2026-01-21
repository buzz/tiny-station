import { use } from 'react'

import ChatContext from '#contexts/ChatContext'
import type { ChatContextValue } from '#contexts/ChatContext'

function useChat(): ChatContextValue {
  const ctx = use(ChatContext)
  if (!ctx) {
    throw new Error('useChat must be used within <ChatProvider>')
  }
  return ctx
}

export default useChat
