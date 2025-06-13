import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ChatInput from "./components/ChatInput"
import React, { useEffect, useRef, useState, useCallback, memo } from "react"
import { useParams, useNavigate } from "react-router"
import ChatHeader from "./components/ChatHeader"
import MessagesList from "./components/MessagesList"
import ThreadList from "./components/ThreadList"

import { Thread, Message } from "./launchChat" // Adjust the import path as necessary

const models = ["Gemini 2.5 Flash", "GPT-4", "Claude 3.5 Sonnet", "Llama 3.1"]

const initialThreads: Thread[] = [
  {
    id: "d96a40f1-1f5a-4abd-9f05-d9c24bcc04a0",
    title: "What is T3 Stack?",
    date: "Today",
    messages: [
      {
        id: "61734ff1-ccb0-46ab-b5af-5cfff35230a1",
        sender: "user",
        content: "Can you explain what T3 Stack is?",
        timestamp: "10:30 AM",
      },
      {
        id: "274dd225-1608-457a-8c2c-0d7809176089",
        sender: "assistant",
        content: "T3 Stack is a modern web development stack that combines TypeScript, tRPC, and Tailwind CSS. It's designed for building typesafe full-stack applications with excellent developer experience.",
        timestamp: "10:31 AM",
      },
    ],
  },
  {
    id: "f5d2d446-312d-46c3-a6e7-b4fe67ef7667",
    title: "T3 Stack Components",
    date: "Today",
    messages: [
      {
        id: "7500999b-c6c4-463d-b4dc-0c61a1973ace",
        sender: "user",
        content: "What are the main components of T3 Stack?",
        timestamp: "11:15 AM",
      },
      {
        id: "f28ce559-ff28-47c4-8cfd-b4c950c526a6",
        sender: "assistant",
        content: "The main components are:\n- TypeScript for type safety\n- tRPC for end-to-end typesafe APIs\n- Tailwind CSS for styling\n- Next.js for the framework\n- Prisma for database management\n- NextAuth.js for authentication",
        timestamp: "11:16 AM",
      },
    ],
  }
]

const Chat = () => {
  const { threadId } = useParams()
  const navigate = useNavigate()
  const [message, setMessage] = useState("")
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash")
  const [threads, setThreads] = useState<Thread[]>(initialThreads)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const currentThread = threads.find((thread) => thread.id === threadId?.toString())

  const handleStreamingResponse = useCallback(async (response: Response, threadId: string | undefined) => {
    const reader = response.body!.getReader()
    const decoder = new TextDecoder()
    const assistantMessageId = (Date.now() + 1).toString()
    
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

    let buffer = ""
    
    try {
      while (true) {
        const { done, value } = await reader.read()
        if (done) break

        const chunk = decoder.decode(value, { stream: true })
        buffer += chunk
        
        const lines = buffer.split('\n')
        buffer = lines.pop() || ""
        
        for (const line of lines) {
          if (line.trim()) {
            let content = ""
            
            if (line.startsWith('0:')) {
              const quotedContent = line.slice(2)
              
              try {
                content = JSON.parse(quotedContent)
              } catch (e) {
                content = quotedContent
                  .replace(/^"/, '')
                  .replace(/"$/, '')
                  .replace(/\\"/g, '"')
                  .replace(/\\n/g, '\n')
                  .replace(/\\t/g, '\t')
                  .replace(/\\\\/g, '\\')
              }
            }
            else if (line.startsWith('f:') || line.startsWith('e:') || line.startsWith('d:')) {
              continue
            }

            if (content) {
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
      }
      
      if (buffer.trim() && buffer.startsWith('0:')) {
        const quotedContent = buffer.slice(2)
        let content = ""
        
        try {
          content = JSON.parse(quotedContent)
        } catch (e) {
          content = quotedContent
            .replace(/^"/, '')
            .replace(/"$/, '')
            .replace(/\\"/g, '"')
            .replace(/\\n/g, '\n')
            .replace(/\\t/g, '\t')
            .replace(/\\\\/g, '\\')
        }
        
        if (content) {
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
    } catch (error) {
      console.error('Streaming error:', error)
      setThreads((prevThreads: Thread[]) =>
        prevThreads.map((thread: Thread) =>
          thread.id === threadId
            ? {
                ...thread,
                messages: thread.messages.map((msg: Message) =>
                  msg.id === assistantMessageId
                    ? { ...msg, content: msg.content + "\n\n*Error: Failed to load response*" }
                    : msg
                ),
              }
            : thread
        )
      )
    } finally {
      reader.releaseLock()
    }
  }, [])

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !threadId) return
    setMessage("")

    setThreads((prevThreads: Thread[]) =>
      prevThreads.map((thread: Thread) =>
        thread.id === threadId
          ? {
              ...thread,
              messages: [
                ...thread.messages,
                {
                  id: (Date.now()).toString(),
                  sender: "user",
                  content: message,
                  timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                },
              ],
            }
          : thread
      )
    )

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
      await handleStreamingResponse(response, threadId)
    } catch (error) {
      console.error('Streaming error:', error)
    }
  }, [message, threadId, selectedModel, threads, handleStreamingResponse])

  const handleNewChat = useCallback(() => {
    navigate('/chat')
  }, [navigate])

  const handleSelectThread = useCallback((threadId: number) => {
    navigate(`/chat/${threadId}`)
  }, [navigate])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [threads, threadId])

  if (!currentThread) {
    return <div>Thread not found</div>
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="offcanvas" className="border-r border-border">
          <ChatHeader onNewChat={handleNewChat} />

          <SidebarContent className="px-4">
            <ThreadList
              threads={threads}
              selectedThread={Number(threadId)}
              setSelectedThread={handleSelectThread}
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
            <div className="text-lg font-medium">{currentThread.title}</div>
          </header>

          <main className="flex-1 flex flex-col overflow-hidden">
            <MessagesList
              messages={currentThread.messages}
              messagesEndRef={messagesEndRef}
            />

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

export default memo(Chat)

