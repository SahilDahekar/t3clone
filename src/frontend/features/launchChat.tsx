import {
  Search,
  Plus,
  Sparkles,
  BookOpen,
  Code,
  GraduationCap,
  ChevronDown,
  Paperclip,
  Send,
  Sun,
  Share,
  Download,
  Copy,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInput,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import ChatInput from "./ChatInput"
import React, { useEffect, useRef, useState, useCallback, memo } from "react"

// Sample chat threads with messages
const chatThreads = [
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
        content:
          "V0 is a great tool for rapid UI prototyping. You can start by describing what you want to build, and V0 will generate the code for you. Would you like me to show you an example?",
        timestamp: "10:31 AM",
      },
    ],
  },
  {
    id: 2,
    title: "Convex Usage Guide",
    date: "Today",
    messages: [
      {
        id: 1,
        sender: "user",
        content: "how to use convex",
        timestamp: "11:15 AM",
      },
      {
        id: 2,
        sender: "assistant",
        content:
          "Convex.jl is a Julia package for convex optimization. It provides a user-friendly interface to define and solve convex optimization problems. Here's a basic guide on how to use it:",
        timestamp: "11:16 AM",
      },
      {
        id: 3,
        sender: "assistant",
        content:
          "1. Installation\n\nFirst, you need to install the Convex.jl package in Julia. Open your Julia REPL and run:",
        timestamp: "11:16 AM",
      },
      {
        id: 4,
        sender: "assistant",
        content: '```julia\nusing Pkg\nPkg.add("Convex")\n```',
        timestamp: "11:17 AM",
        isCode: true,
      },
      {
        id: 5,
        sender: "assistant",
        content:
          "You might also want to install a solver that Convex.jl can interface with. Popular choices include GLPK, ECOS, SCIP, or Mosek. For example, to install GLPK:",
        timestamp: "11:18 AM",
      },
    ],
  },
]

const quickActions = [
  {
    icon: Sparkles,
    label: "Create",
    description: "Generate content",
  },
  {
    icon: BookOpen,
    label: "Explore",
    description: "Discover topics",
  },
  {
    icon: Code,
    label: "Code",
    description: "Write programs",
  },
  {
    icon: GraduationCap,
    label: "Learn",
    description: "Get explanations",
  },
]

const sampleQuestions = [
  "How does AI work?",
  "Are black holes real?",
  'How many Rs are in the word "strawberry"?',
  "What is the meaning of life?",
]

// Memoized Sidebar Thread List
interface ThreadListProps {
  threads: Array<{
    id: number;
    title: string;
    date: string;
    messages: Array<{
      id: number;
      sender: string;
      content: string;
      timestamp: string;
      isCode?: boolean;
    }>;
  }>;
  selectedThread: number | null;
  setSelectedThread: (threadId: number) => void;
}

const ThreadList = memo(function ThreadList({ threads, selectedThread, setSelectedThread }: ThreadListProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-gray-400 text-sm font-medium mb-2">Today</SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {threads.map((thread) => (
            <SidebarMenuItem key={thread.id}>
              <SidebarMenuButton
                className={`hover:bg-gray-800 hover:text-white text-gray-500 ${selectedThread === thread.id ? "bg-gray-800 text-white" : ""}`}
                onClick={() => setSelectedThread(thread.id)}
                isActive={selectedThread === thread.id}
              >
                {thread.title}
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarGroupContent>
    </SidebarGroup>
  )
})

export default function LaunchChat() {
  const [message, setMessage] = useState("")
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash")
  const [selectedThread, setSelectedThread] = useState<number | null>(null)
  const [threads, setThreads] = useState(chatThreads)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const models = ["Gemini 2.5 Flash", "GPT-4", "Claude 3.5 Sonnet", "Llama 3.1"]

  // Find the selected thread
  const currentThread = threads.find((thread) => thread.id === selectedThread)

  // Function to handle sending a new message
  const handleSendMessage = () => {
    if (!message.trim()) return

    if (selectedThread) {
      // Add message to existing thread
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === selectedThread
            ? {
                ...thread,
                messages: [
                  ...thread.messages,
                  {
                    id: Math.max(...thread.messages.map((m) => m.id)) + 1,
                    sender: "user",
                    content: message,
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  },
                ],
              }
            : thread,
        ),
      )
    } else {
      // Create a new thread
      const newThread = {
        id: Math.max(...threads.map((t) => t.id)) + 1,
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

      setThreads((prev) => [...prev, newThread])
      setSelectedThread(newThread.id)
    }

    // Clear the input
    setMessage("")

    // Simulate assistant response after a delay
    setTimeout(() => {
      setThreads((prevThreads) =>
        prevThreads.map((thread) =>
          thread.id === (selectedThread || Math.max(...prevThreads.map((t) => t.id)))
            ? {
                ...thread,
                messages: [
                  ...thread.messages,
                  {
                    id: Math.max(...thread.messages.map((m) => m.id)) + 1,
                    sender: "assistant",
                    content: "I'm an AI assistant. How can I help you with that?",
                    timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
                  },
                ],
              }
            : thread,
        ),
      )
    }, 1000)
  }

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [threads, selectedThread])

  // Create a new chat
  const handleNewChat = () => {
    setSelectedThread(null)
    setMessage("")
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="offcanvas" className="border-r border-gray-800">
          <SidebarHeader className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="font-bold text-lg">T3.chat</div>
              <div className="ml-auto flex gap-2">
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Share className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8">
                  <Sun className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <Button className="w-full bg-purple-700 hover:bg-purple-600 text-white mb-4" onClick={handleNewChat}>
              <Plus className="h-4 w-4 mr-2" />
              New Chat
            </Button>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <SidebarInput
                placeholder="Search your threads..."
                className="pl-10 bg-gray-800 border-gray-700 text-white placeholder:text-gray-400"
              />
            </div>
          </SidebarHeader>

          <SidebarContent className="px-4">
            <ThreadList threads={threads} selectedThread={selectedThread} setSelectedThread={setSelectedThread} />
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-gray-800">
            <div className="flex items-center gap-3">
              <Avatar className="h-8 w-8">
                <AvatarFallback className="bg-purple-600 text-white text-sm">SD</AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <div className="text-sm font-medium">Sahil Dahekar</div>
                <div className="text-xs text-gray-500">Free</div>
              </div>
            </div>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col">
          <header className="flex h-16 items-center gap-2 px-4 border-b border-gray-800">
            <SidebarTrigger className="hover:bg-gray-800 text-gray-500" />
            {currentThread && <div className="text-lg font-medium">{currentThread.title}</div>}
          </header>

          <main className="flex-1 flex flex-col">
            {!selectedThread ? (
              // Welcome screen when no thread is selected
              <div className="flex-1 flex flex-col items-center justify-center p-8">
                <h1 className="text-3xl font-semibold mb-8 text-center">How can I help you, Sahil?</h1>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 w-full max-w-2xl">
                  {quickActions.map((action) => (
                    <Button
                      key={action.label}
                      variant="outline"
                      className="h-auto p-4 flex flex-col items-center gap-2 bg-gray-800 border-gray-700 hover:bg-gray-700 text-white"
                    >
                      <action.icon className="h-5 w-5" />
                      <span className="text-sm font-medium">{action.label}</span>
                    </Button>
                  ))}
                </div>

                <div className="space-y-3 w-full max-w-2xl">
                  {sampleQuestions.map((question, index) => (
                    <Button
                      key={index}
                      variant="ghost"
                      className="w-full text-left justify-start text-gray-300 hover:bg-gray-800 hover:text-white p-3 h-auto"
                      onClick={() => setMessage(question)}
                    >
                      {question}
                    </Button>
                  ))}
                </div>
              </div>
            ) : (
              // Chat messages when a thread is selected
              <div className="flex-1 overflow-y-auto p-4">
                <div className="max-w-4xl mx-auto space-y-6">
                  {currentThread?.messages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                      <div
                        className={`max-w-[80%] rounded-lg p-4 ${
                          msg.sender === "user" ? "bg-purple-600 text-white" : "bg-gray-800 text-white"
                        }`}
                      >
                        {msg.isCode ? (
                          <div className="relative">
                            <div className="flex items-center justify-between bg-gray-900 px-4 py-2 rounded-t-lg">
                              <span className="text-xs text-gray-400">julia</span>
                              <div className="flex gap-2">
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                                  <Copy className="h-3 w-3" />
                                </Button>
                                <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                                  <Download className="h-3 w-3" />
                                </Button>
                              </div>
                            </div>
                            <pre className="bg-gray-900 p-4 rounded-b-lg overflow-x-auto">
                              <code className="text-sm text-white">{msg.content}</code>
                            </pre>
                          </div>
                        ) : (
                          <div className="whitespace-pre-wrap">{msg.content}</div>
                        )}
                        <div className="text-xs opacity-70 mt-2">{msg.timestamp}</div>
                      </div>
                    </div>
                  ))}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            )}

            <div className="p-4 border-t border-gray-800">
              <div className="max-w-4xl mx-auto">
                <ChatInput
                  message={message}
                  setMessage={setMessage}
                  onSend={handleSendMessage}
                />
                <div className="flex items-center justify-between mt-3 text-sm text-gray-400">
                  <div className="flex items-center gap-4">
                    <DropdownMenu>
                      <DropdownMenuTrigger className="text-gray-500" asChild>
                        <Button variant="ghost" className="text-gray-400 hover:text-white p-0 h-auto">
                          {selectedModel}
                          <ChevronDown className="h-4 w-4 ml-1" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-gray-800 border-gray-700">
                        {models.map((model) => (
                          <DropdownMenuItem
                            key={model}
                            onClick={() => setSelectedModel(model)}
                            className="text-white hover:bg-gray-700"
                          >
                            {model}
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>

                    <Button variant="ghost" size="icon" className="h-6 w-6 text-gray-400 hover:text-white">
                      <Search className="h-4 w-4 text-gray-500" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
