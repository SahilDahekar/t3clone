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
import React, { useCallback, useState, memo } from "react"
import { useNavigate } from "react-router"

// Import split components
import QuickActions from "./components/QuickActions"
import SampleQuestions from "./components/SampleQuestions"
import ChatHeader from "./components/ChatHeader"
import ThreadList from "./components/ThreadList"

export interface Thread {
  id: string
  title: string
  date: string
  messages: Message[]
}

export interface Message {
  id: string
  sender: string
  content: string
  timestamp: string
  isCode?: boolean
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

const LaunchChat = () => {
  const [message, setMessage] = useState("")
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash")
  const navigate = useNavigate()

  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) return

    // Create a new thread and navigate to it
    const newThreadId = Math.floor(Math.random() * 1000000)
    navigate(`/chat/${newThreadId}`)
  }, [message, navigate])

  const handleQuestionSelect = useCallback((question: string) => {
    setMessage(question)
  }, [])

  const handleSelectThread = useCallback((threadId: string) => {
    navigate(`/chat/${threadId}`)
  }, [navigate])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="offcanvas" className="border-r border-border">
          <ChatHeader onNewChat={() => setMessage("")} />

          <SidebarContent className="px-4">
            <ThreadList
              threads={initialThreads}
              selectedThread={null}
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
          </header>

          <main className="flex-1 flex flex-col overflow-hidden">
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
