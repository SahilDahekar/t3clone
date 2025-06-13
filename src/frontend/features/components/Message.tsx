import { memo, useState } from "react"
import { Copy, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark } from "react-syntax-highlighter/dist/cjs/styles/prism"
import type { Components } from "react-markdown"

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
  const [copied, setCopied] = useState(false)

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "")
      const inline = !match

      return !inline ? (
        <SyntaxHighlighter
          language={match?.[1] || "text"}
          style={oneDark}
          customStyle={{
            borderRadius: "0.5rem",
          }}
          PreTag="div"
        >
          {String(children).replace(/\n$/, "")}
        </SyntaxHighlighter>
      ) : (
        <code className="bg-background text-foreground px-1.5 py-0.5 rounded" {...props}>
          {children}
        </code>
      )
    },
  }

  return (
    <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[80%] rounded-lg p-4 ${
          msg.sender === "user" ? "bg-primary text-primary-foreground" : "bg-muted"
        }`}
      >
        {msg.isCode ? (
          <div className="relative">
            <div className="flex items-center justify-between bg-background px-4 py-2 rounded-t-lg">
              <span className="text-xs text-muted-foreground">Code</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => handleCopy(msg.content)}
                  title={copied ? "Copied!" : "Copy code"}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button variant="ghost" size="icon" className="h-6 w-6">
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <SyntaxHighlighter
              language="typescript"
              style={oneDark}
              customStyle={{
                margin: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomLeftRadius: "0.5rem",
                borderBottomRightRadius: "0.5rem",
              }}
              PreTag="div"
            >
              {msg.content}
            </SyntaxHighlighter>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown components={components}>{msg.content}</ReactMarkdown>
          </div>
        )}
        <div className="text-xs opacity-70 mt-2">{msg.timestamp}</div>
      </div>
    </div>
  )
})

export default Message
