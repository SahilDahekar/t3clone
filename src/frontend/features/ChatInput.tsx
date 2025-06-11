import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Paperclip, Send } from "lucide-react"
import React, { useCallback } from "react"

interface ChatInputProps {
  message: string
  setMessage: (msg: string) => void
  onSend: () => void
}

const ChatInput: React.FC<ChatInputProps> = React.memo(({ message, setMessage, onSend }) => {
  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      onSend()
    }
  }, [onSend])

  return (
    <div className="relative">
      <Input
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        onKeyDown={handleKeyPress}
        placeholder="Type your message here..."
        className="pr-24 pl-4 py-3 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400 rounded-lg"
      />
      <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
        <Button variant="ghost" size="icon" className="h-8 w-8 text-gray-400 hover:text-white">
          <Paperclip className="h-4 w-4" />
        </Button>
        <Button
          size="icon"
          className="h-8 w-8 bg-purple-600 hover:bg-purple-700"
          disabled={!message.trim()}
          onClick={onSend}
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
})

export default ChatInput
