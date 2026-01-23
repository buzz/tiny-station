interface ChatMessage {
  uuid: string
  timestamp: number
  senderNickname: string
  message: string
}

export type { ChatMessage }
