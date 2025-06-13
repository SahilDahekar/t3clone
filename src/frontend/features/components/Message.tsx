import { memo } from "react"
import { Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"

interface MessageProps {
  message: {
    id: number
    sender: string
    content: string
    timestamp: string
    isCode?: boolean
  }
}

const Message = memo(function Message({ message: msg }: MessageProps) {
  return (
    <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
        }`}
      >
        {msg.isCode ? (
          <div className="relative">
            <div className="flex items-center justify-between bg-background px-4 py-2 rounded-t-lg">
              <span className="text-xs text-muted-foreground">julia</span>
              <div className="flex gap-2">
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <pre className="bg-background p-4 rounded-b-lg overflow-x-auto">
              <code className="text-sm text-foreground">{msg.content}</code>
            </pre>
          </div>
        ) : (
          <div className="whitespace-pre-wrap">{msg.content}</div>
        )}
        <div className="text-xs opacity-70 mt-2">{msg.timestamp}</div>
      </div>
    </div>
  )
})

export default Message
