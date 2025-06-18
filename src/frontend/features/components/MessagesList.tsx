import { memo } from "react"
import Message from "./Message"
import type { Id } from "@/../convex/_generated/dataModel"

interface MessagesListProps {
  messages: Array<{
    id: string
    sender: string
    content: string
    timestamp: string
    isCode?: boolean
  }>
  messagesEndRef: React.RefObject<HTMLDivElement | null>
  threadId: Id<"threads">
  tokenIdentifier: string
}

const MessagesList = memo(function MessagesList({ 
  messages, 
  messagesEndRef,
  threadId,
  tokenIdentifier 
}: MessagesListProps) {
  return (
    <div className="flex-1 overflow-y-auto p-4">
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((msg) => (
          <Message 
            key={msg.id} 
            message={msg}
            threadId={threadId}
            tokenIdentifier={tokenIdentifier}
          />
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
})

export default MessagesList
