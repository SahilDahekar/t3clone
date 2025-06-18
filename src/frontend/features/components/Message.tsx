import { memo, useState } from "react"
import { Copy, Download, GitBranch } from "lucide-react"
import { Button } from "@/components/ui/button"
import ReactMarkdown from "react-markdown"
import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneDark as darktheme } from "react-syntax-highlighter/dist/cjs/styles/prism"
import { oneLight as lighttheme } from "react-syntax-highlighter/dist/esm/styles/prism"
import { useTheme } from "next-themes"
import type { Components } from "react-markdown"
import { useMutation } from "convex/react"
import { api } from "@/../convex/_generated/api"

import type { Id } from "@/../convex/_generated/dataModel";

interface MessageProps {
  message: {
    id: string
    sender: string
    content: string
    timestamp: string
    isCode?: boolean
  }
  threadId: Id<"threads">
  tokenIdentifier: string
  onThreadSwitch?: (newThreadId: Id<"threads">) => void
}

const Message = memo(function Message({ 
  message: msg,
  threadId,
  tokenIdentifier,
  onThreadSwitch 
}: MessageProps) {
  const branch = useMutation(api.threads.branch);
  const [copied, setCopied] = useState(false)
  const { theme } = useTheme()

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  // Clean the content - minimal cleaning since streaming should handle most of it
  const cleanContent = (content: string) => {
    return content
      // Just basic cleanup for any remaining artifacts
      .replace(/\*\*\*\*/g, '**') // Fix quadruple asterisks to double
      // .replace(/^f:\{[^}]+\}/, '') // Remove initial f:{...}
      // .replace(/e:\{[^}]+\} d:\{[^}]+\}$/, '') // Remove ending e:{...}d:{...}
      // .replace(/\\n/g, '\n') // Replace \n with actual newlines
      .trim()
  }

  const components: Components = {
    code({ className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || "")
      const inline = !match

      return !inline ? (
        <div className="relative">
          <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg">
            <span className="text-xs text-gray-400">
              {match?.[1] || "text"}
            </span>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-gray-400 hover:text-white"
              onClick={() => handleCopy(String(children))}
              title={copied ? "Copied!" : "Copy code"}
            >
              <Copy className="h-3 w-3" />
            </Button>
          </div>
          <SyntaxHighlighter
            language={match?.[1] || "text"}
            style={theme === "dark" ? darktheme : lighttheme}
            customStyle={{
              marginBottom: "0.75rem",
              marginTop: 0,
              borderTopLeftRadius: 0,
              borderTopRightRadius: 0,
              borderBottomLeftRadius: "0.5rem",
              borderBottomRightRadius: "0.5rem",
            }}
            PreTag="div"
          >
            {String(children).replace(/\n$/, "")}
          </SyntaxHighlighter>
        </div>
      ) : (
        <code className="bg-gray-100 dark:bg-gray-800 text-red-600 dark:text-red-400 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      )
    },
    // Enhanced list rendering
    ul({ children }) {
      return <ul className="list-disc list-inside space-y-1 my-3">{children}</ul>
    },
    ol({ children }) {
      return <ol className="list-decimal list-inside space-y-1 my-3">{children}</ol>
    },
    li({ children }) {
      return <li className="ml-2">{children}</li>
    },
    // Enhanced heading rendering
    h1({ children }) {
      return <h1 className="text-2xl font-bold mb-4 mt-6">{children}</h1>
    },
    h2({ children }) {
      return <h2 className="text-xl font-semibold mb-3 mt-5">{children}</h2>
    },
    h3({ children }) {
      return <h3 className="text-lg font-medium mb-2 mt-4">{children}</h3>
    },
    // Enhanced paragraph rendering
    p({ children }) {
      return <p className="mb-3 leading-relaxed">{children}</p>
    },
    // Enhanced strong/bold rendering
    strong({ children }) {
      return <strong className="font-semibold text-foreground">{children}</strong>
    },
    // Enhanced emphasis rendering
    em({ children }) {
      return <em className="italic text-muted-foreground">{children}</em>
    }
  }

  const processedContent = cleanContent(msg.content)

  return (
    <div className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} mb-4`}>
      <div
        className={`max-w-[85%] rounded-lg p-4 ${
          msg.sender === "user" 
            ? "bg-primary text-primary-foreground" 
            : "bg-muted/50 border border-border"
        }`}
      >
        {msg.isCode ? (
          <div className="relative">
            <div className="flex items-center justify-between bg-gray-800 px-4 py-2 rounded-t-lg">
              <span className="text-xs text-gray-400">Code</span>
              <div className="flex gap-2">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-gray-400 hover:text-white"
                  onClick={() => handleCopy(processedContent)}
                  title={copied ? "Copied!" : "Copy code"}
                >
                  <Copy className="h-3 w-3" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 text-gray-400 hover:text-white"
                  title="Download code"
                >
                  <Download className="h-3 w-3" />
                </Button>
              </div>
            </div>
            <SyntaxHighlighter
              language="typescript"
              style={theme === "dark" ? darktheme : lighttheme}
              customStyle={{
                margin: 0,
                borderTopLeftRadius: 0,
                borderTopRightRadius: 0,
                borderBottomLeftRadius: "0.5rem",
                borderBottomRightRadius: "0.5rem",
              }}
              PreTag="div"
            >
              {processedContent}
            </SyntaxHighlighter>
          </div>
        ) : (
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <ReactMarkdown components={components}>
              {processedContent}
            </ReactMarkdown>
          </div>
        )}
        <div className="text-xs opacity-70 mt-3 text-right">
          {msg.timestamp}
        </div>
        
        {msg.sender === "assistant" && (
          <div className="flex gap-2 mt-2 justify-end">
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-muted-foreground"
              onClick={async () => {
                const newThreadId = await branch({
                  tokenIdentifier,
                  mainThreadId: threadId,
                  title: "Branch" // Title will be auto-generated in the mutation
                });
                onThreadSwitch?.(newThreadId);
              }}
            >
              <GitBranch className="h-4 w-4 mr-2" />
              Branch
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-8 px-3 text-muted-foreground"
              onClick={() => handleCopy(processedContent)}
            >
              <Copy className="h-4 w-4 mr-2" />
              {copied ? "Copied!" : "Copy"}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
})

export default Message
