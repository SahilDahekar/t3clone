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
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react"
import { useParams, useNavigate } from "react-router"
import ChatHeader from "./components/ChatHeader"
import MessagesList from "./components/MessagesList"
import ThreadList from "./components/ThreadList"
import { api } from "../../../convex/_generated/api"
import { useQuery , useMutation } from "convex/react"
import { Id } from "../../../convex/_generated/dataModel"

import { Thread } from "./launchChat" // Adjust the import path as necessary
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"
import { dark } from "@clerk/themes"
import { useTheme } from "next-themes"

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
  const { user } = useUser();
  const { theme } = useTheme();

  // Redirect if user is not logged in (consider placing this outside Chat component or using Clerk's protection methods)
  // This redirect logic should probably be in a layout or a dedicated auth check.
  // For now, moving it slightly to avoid breaking hooks if `user` is null initially.
  if (!user && typeof window !== 'undefined') { // Only redirect on client side
    navigate("/auth/sign-in");
  }

  const threads = useQuery(api.threads.getThreads, { tokenIdentifier: user?.id ?? "" });
  const messages = useQuery(api.message.getMessages, 
    threadId ? { threadId: threadId as Id<"threads"> } : "skip"
  );
  const send = useMutation(api.message.send);
  const generateUploadUrl = useMutation(api.message.generateUploadUrl);
  // NEW: Add the storeUser mutation
  const storeUser = useMutation(api.user.store);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get thread title from query results
  const threadTitle = threads?.find(t => t._id === threadId)?.title ?? "New Chat";

  // NEW: Effect to store user in Convex
  useEffect(() => {
    if (user && user.id && user.fullName) {
      // Call the Convex mutation to store or update user data
      storeUser({
        tokenIdentifier: user.id,
        name: user.fullName, // Clerk's `fullName` property usually provides the display name
      });
    }
  }, [user, storeUser]); // Dependency array: run when `user` or `storeUser` changes

  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !threadId) return
    setMessage("")

    // The fetch to /api/chat is for your backend AI integration, not directly Convex
    // The Convex `send` mutation call is below.
    try {
      // You might still want to send the message to your /api/chat if it interacts with external LLMs
      // const response = await fetch("/api/chat", {
      //   method: "POST",
      //   headers: {
      //     "Content-Type": "application/json",
      //   },
      //   body: JSON.stringify({
      //     messages: message,
      //     selectedModel,
      //   })
      // })
      // console.log("Sending message to external AI:", message)
          
    const content: Array<{ 
      type: "text", 
      text: string 
    } | { 
      type: "file", 
      data: string, 
      mimeType: string, 
      fileName?: string 
    }> = [{ type: "text", text: message }];
    
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
      setFile(null); // Clear the file input after sending
      if (fileInputRef.current) {
        fileInputRef.current.value = ''; // Reset the file input field
      }
    }

    await send({ 
      tokenIdentifier: user?.id ?? "",
      threadId: threadId as Id<"threads">,
      role: "user",
      content,
      parentMessageId: undefined
    });

      // Convex handles the response automatically for the 'send' mutation.
      // If you're still using the /api/chat, you'd handle its response here:
      // if (!response.body) throw new Error('No response body')
    } catch (error) {
      console.error('Error sending message or uploading file:', error)
    }
  }, [message, threadId, generateUploadUrl, send, file, user?.id, setFile, fileInputRef]) // Add fileInputRef to dependencies

  const handleNewChat = useCallback(() => {
    navigate('/chat')
  }, [navigate])

  const handleSelectThread = useCallback((threadId: string) => {
    navigate(`/chat/${threadId}`)
  }, [navigate])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, threadId]) // Changed `threads` to `messages` as scroll depends on message list update

  // Only show loading if messages for the specific thread are not yet loaded
  if (!threadId || messages === undefined) { // Check for undefined for initial loading state
    return <div>Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <SidebarProvider defaultOpen={true}>
        <Sidebar collapsible="offcanvas" className="border-r border-border">
          <ChatHeader onNewChat={handleNewChat} />

          <SidebarContent className="px-4">
            <ThreadList
              threads={(threads || []).map(t => ({
                id: t._id,
                title: t.title,
                date: new Date(t.createdAt).toLocaleDateString(),
                messages: [] // Messages are loaded separately per thread
              }))}
              selectedThread={threadId ?? null}
              setSelectedThread={handleSelectThread}
            />
          </SidebarContent>

          <SidebarFooter className="p-4 border-t border-border">
            <SignedIn>
                <UserButton showName appearance={{
                    baseTheme: theme === "dark" ? dark : undefined,
                    elements: {
                        avatarBox: {
                            width: '2rem',
                            height: '2rem',
                        },
                        userButtonOuterIdentifier : {
                            order: '2',
                        },
                        rootBox: "px-3 py-3",
                    }
                }}/>
            </SignedIn>
            <SignedOut>
                <SignInButton mode="modal" forceRedirectUrl={`/chat/${threadId}`}>
                    <Button variant="outline" className='flex items-center justify-start py-6 text-md'><LogIn className="mr-1 ml-2" />Login</Button>
                </SignInButton>
            </SignedOut>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col h-screen">
          <header className="flex h-16 items-center gap-2 px-4 border-b border-border sticky top-0 bg-background z-10">
            <SidebarTrigger className="hover:bg-accent text-muted-foreground" />
            <div className="text-lg font-medium">{threadTitle}</div>
          </header>

          <main className="flex-1 flex flex-col overflow-hidden">
            <MessagesList
              messages={(messages || []).map(m => ({
                id: m._id,
                sender: m.role,
                content: m.content.filter(c => c.type === "text").map(c => c.text).join(" "),
                timestamp: new Date(m.createdAt).toLocaleTimeString()
              }))}
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