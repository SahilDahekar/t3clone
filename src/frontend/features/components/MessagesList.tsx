import { memo } from "react"
import Message from "./Message"

interface MessagesListProps {
  messages: Array<{
    id: number
    sender: string
    content: string
    timestamp: string
    isCode?: boolean
  }>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
}

const MessagesList = memo(function MessagesList({ 
  messages, 
  messagesEndRef 
}: MessagesListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((msg) => (
          <Message key={msg.id} message={msg} />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
})

export default MessagesList
