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
import React, { useCallback, useState, useRef, memo } from "react"
import { useNavigate } from "react-router"
import { useQuery, useMutation } from "convex/react"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"

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
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const threads = useQuery(api.threads.list)
  const createThread = useMutation(api.threads.create)
    .withOptimisticUpdate((localStore, args) => {
      const currentThreads = localStore.getQuery(api.threads.list, {});
      if (currentThreads) {
        const newThread = {
          _id: `temp-${Date.now()}` as Id<"threads">,
          _creationTime: Date.now(),
          userId: args.userId,
          title: args.title,
          createdAt: Date.now(),
          mainThreadId: undefined,
        };
        localStore.setQuery(api.threads.list, {}, [...currentThreads, newThread]);
      }
    });
  const send = useMutation(api.message.send)
    .withOptimisticUpdate((localStore, args) => {
      const currentMessages = localStore.getQuery(api.message.getMessages, { threadId: args.threadId });
      const newMessage = {
        _id: `temp-msg-${Date.now()}` as Id<"messages">,
        _creationTime: Date.now(),
        threadId: args.threadId,
        role: args.role,
        content: args.content,
        createdAt: Date.now(),
      };
      localStore.setQuery(api.message.getMessages, { threadId: args.threadId }, 
        [...(currentMessages || []), newMessage]
      );
    });
  const generateUploadUrl = useMutation(api.message.generateUploadUrl)
  const hardcodedUserId = "jh725nd27yxr0pvbsyr77gnek57j09et" as Id<"users">
  
  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) return
    
    try {
      // Create temporary thread ID for optimistic updates
      const tempThreadId = `temp-${Date.now()}` as Id<"threads">;
      
      // Create thread with optimistic update
      const threadId = await createThread({
        userId: hardcodedUserId,
        title: message.substring(0, 50)
      }).catch((error) => {
        // The optimistic update will automatically roll back on error
        throw error;
      });

      // Prepare message content
      const content: Array<{ 
        type: "text", 
        text: string 
      } | { 
        type: "file", 
        data: string, 
        mimeType: string, 
        fileName?: string 
      }> = [{ type: "text", text: message }];

      // Handle file upload if present
      if (file) {
        const url = await generateUploadUrl();
        const response = await fetch(url);
        const blob = await response.blob();
        const base64 = await new Promise((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.readAsDataURL(blob);
        });

        content.push({
          type: "file",
          data: base64?.toString().split(',')[1] || '',
          mimeType: file.type,
          fileName: file.name
        });
      }

      // Send the initial message
      await send({ 
        threadId,
        role: "user",
        content,
        parentMessageId: undefined
      });

      navigate(`/chat/${threadId}`);
    } catch (error) {
      console.error("Error creating thread:", error);
    }
  }, [message, createThread, send, navigate, file, generateUploadUrl, hardcodedUserId]);

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
              threads={(threads || []).map(t => ({
                id: t._id,
                title: t.title,
                date: new Date(t.createdAt).toLocaleDateString(),
                messages: []
              }))}
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
