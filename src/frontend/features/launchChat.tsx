import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ChatInput from "./ChatInput"
import React, { useEffect, useRef, useState, useCallback, memo } from "react"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { type Id } from "../../../convex/_generated/dataModel"

// Import split components
import QuickActions from "./components/QuickActions"
import SampleQuestions from "./components/SampleQuestions"
import ChatHeader from "./components/ChatHeader"
import MessagesList from "./components/MessagesList"
import ThreadList from "./components/ThreadList"

interface Message {
  id: number
  sender: string
  content: string
  timestamp: string
  isCode?: boolean
}

interface Thread {
  id: number
  title: string
  date: string
  messages: Message[]
}

const sampleQuestions = [
  "How does AI work?",
  "Are black holes real?",
  'How many Rs are in the word "strawberry"?',
  "What is the meaning of life?",
]

const models = ["Gemini 2.5 Flash", "GPT-4", "Claude 3.5 Sonnet", "Llama 3.1"]

const initialThreads: Thread[] = [
  {
    id: 1,
    title: "Using V0 for quick UI develo...",
    date: "Today",
    messages: [
      {
        id: 1,
        sender: "user",
        content: "How can I use V0 for quick UI development?",
        timestamp: "10:30 AM",
      },
      {
        id: 2,
        sender: "assistant",
        content: "V0 is a great tool for rapid UI prototyping. You can start by describing what you want to build, and V0 will generate the code for you. Would you like me to show you an example?",
        timestamp: "10:31 AM",
      },
    ],
  },
]

const LaunchChat = () => {
  const [message, setMessage] = useState("")
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash")
  const [selectedThread, setSelectedThread] = useState<number | null>(null)
  const [threads, setThreads] = useState<Thread[]>(initialThreads)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentThread = threads.find((thread: Thread) => thread.id === selectedThread)
  const convex_message = useQuery(api.message.getMessages, { threadId: "jd7e1waat33cb2s9d3yjcf1qqd7hrbyz" as Id<"threads"> })
  console.dir(convex_message);
  const sendMessage = useMutation(api.message.addMessage)

  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) return
    setMessage("")

    if (selectedThread) {
      setThreads((prevThreads: Thread[]) =>
        prevThreads.map((thread: Thread) =>
          thread.id === selectedThread
            ? {
                ...thread,
                messages: [
                  ...thread.messages,
                  {
                    id: Math.max(...thread.messages.map((m: Message) => m.id)) + 1,
                    sender: "user",
                    content: message,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  },
                ],
              }
            : thread
        )
      )
    } else {
      const newThread: Thread = {
        id: Math.max(...threads.map((t: Thread) => t.id)) + 1,
        title: message.length > 25 ? message.substring(0, 25) + "..." : message,
        date: "Today",
        messages: [
          {
            id: 1,
            sender: "user",
            content: message,
            timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          },
        ],
      }

      setThreads((prev: Thread[]) => [...prev, newThread])
      setSelectedThread(newThread.id)
    }

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: message,
          selectedModel,
        })
      })

      if (!response.body) throw new Error('No response body')
      await handleStreamingResponse(response, selectedThread)
    } catch (error) {
      console.error('Streaming error:', error)
    }
  }, [message, selectedThread, selectedModel, threads])

  const handleStreamingResponse = useCallback(async (response: Response, threadId: number | null) => {
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()

    const assistantMessageId = Date.now() + 1
    const assistantMessage: Message = {
      id: assistantMessageId,
      sender: "assistant",
      content: "",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    }

    setThreads((prevThreads: Thread[]) =>
      prevThreads.map((thread: Thread) =>
        thread.id === threadId
          ? { ...thread, messages: [...thread.messages, assistantMessage] }
          : thread
      )
    )

    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      const chunk = decoder.decode(value)
      const lines = chunk.split('\n')

      for (const line of lines) {
        if (line.startsWith('0:')) {
          const content = line.slice(2)
          setThreads((prevThreads: Thread[]) =>
            prevThreads.map((thread: Thread) =>
              thread.id === threadId
                ? {
                    ...thread,
                    messages: thread.messages.map((msg: Message) =>
                      msg.id === assistantMessageId
                        ? { ...msg, content: msg.content + content }
                        : msg
                    ),
                  }
                : thread
            )
          )
        }
      }
    }
  }, [])

  const handleNewChat = useCallback(() => {
    setSelectedThread(null)
    setMessage("")
  }, [])

  const handleQuestionSelect = useCallback((question: string) => {
    setMessage(question)
  }, [])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [threads, selectedThread])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="offcanvas" className="border-r border-border">
          <ChatHeader onNewChat={handleNewChat} />
          
          <SidebarContent className="px-4">
            <ThreadList 
              threads={threads} 
              selectedThread={selectedThread} 
              setSelectedThread={setSelectedThread} 
            />
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-primary text-primary-foreground text-sm">SD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">Sahil Dahekar</div>
                <div className="text-xs text-muted-foreground">Free</div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col h-screen">
          <header className="flex h-16 items-center gap-2 px-4 border-b border-border sticky top-0 bg-background z-10">
            <SidebarTrigger className="hover:bg-accent text-muted-foreground" />
            {currentThread && <div className="text-lg font-medium">{currentThread.title}</div>}
          </header>

          <main className="flex-1 flex flex-col overflow-hidden">
            {!selectedThread ? (
              <div className="flex-1 overflow-y-auto p-8">
                <div className="flex flex-col items-center justify-center min-h-full">
                  <h1 className="text-3xl font-semibold mb-8 text-center">How can I help you, Sahil?</h1>
                  <QuickActions />
                  <SampleQuestions 
                    questions={sampleQuestions}
                    onQuestionSelect={handleQuestionSelect}
                  />
                </div>
              </div>
            ) : currentThread && (
              <MessagesList 
                messages={currentThread.messages}
                messagesEndRef={messagesEndRef}
              />
            )}
            
            <div className="p-4 border-t border-border bg-background sticky bottom-0">
              <div className="max-w-4xl mx-auto">
                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  onSend={handleSendMessage}
                  selectedModel={selectedModel}
                  models={models}
                  onModelSelect={setSelectedModel}
                />
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}

export default memo(LaunchChat)
