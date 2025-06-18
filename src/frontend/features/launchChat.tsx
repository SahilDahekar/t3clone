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
import React, { useCallback, useState, useRef, memo, useEffect } from "react" // Added useEffect
import { useNavigate } from "react-router"
import { useQuery, useMutation } from "convex/react"
import { SignedIn, SignedOut, SignInButton, UserButton, useUser } from "@clerk/clerk-react"
import { useTheme } from "next-themes"
import { dark } from "@clerk/themes"
import { api } from "../../../convex/_generated/api"
import { Id } from "../../../convex/_generated/dataModel"

// Import split components
import QuickActions from "./components/QuickActions"
import SampleQuestions from "./components/SampleQuestions"
import ChatHeader from "./components/ChatHeader"
import ThreadList from "./components/ThreadList"
import { Button } from "@/components/ui/button"
import { LogIn } from "lucide-react"


export interface Thread {
  id: Id<"threads">
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

// Removed initialThreads as it's no longer used, data comes from Convex

const LaunchChat = () => {
  const [message, setMessage] = useState("")
  const [selectedModel, setSelectedModel] = useState("Gemini 2.5 Flash")
  const [file, setFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()
  const { user } = useUser()
  const { theme } = useTheme()


  const threads = useQuery(api.threads.getThreads, { tokenIdentifier: user?.id ?? "" });
  

  const storeUser = useMutation(api.user.store);

  const createThread = useMutation(api.threads.create)
  .withOptimisticUpdate((localStore, args) => {
    const currentThreads = localStore.getQuery(api.threads.getThreads, { tokenIdentifier: user?.id ?? "" });
    if (currentThreads) {
      const newThread = {
        _id: `temp-${Date.now()}` as Id<"threads">,
        userId: user?.id as Id<"users">, // Use Clerk's user ID
        _creationTime: Date.now(),
        title: args.title,
        tokenIdentifier: args.tokenIdentifier, 
        createdAt: Date.now(),
        
      };
      localStore.setQuery(api.threads.getThreads, { tokenIdentifier: user?.id ?? "" }, [...currentThreads, newThread]);
    }
  });

  const send = useMutation(api.message.send)
    .withOptimisticUpdate((localStore, args) => {
      // Note: This optimistic update assumes the messages are only displayed in the chat/:threadId view.
      // If messages for a new thread need to appear here before navigation, more complex state is needed.
      // Given the navigation, this specific optimistic update might not be seen directly in this component.
      // However, it's correctly structured for `messages` query in the other Chat component.
      const currentMessages = localStore.getQuery(api.message.getMessages, { threadId: args.threadId });
      const newMessage = {
        _id: `temp-msg-${Date.now()}` as Id<"messages">,
        _creationTime: Date.now(),
        threadId: args.threadId,
        userId: user?.id as Id<"users">, // Use Clerk's user ID
        // REMOVED: userId as it's not in your `messages` schema for direct storage
        role: args.role,
        content: args.content,
        createdAt: Date.now(),
        // parentMessageId: undefined is usually handled by the mutation itself if optional
      };
      localStore.setQuery(api.message.getMessages, { threadId: args.threadId }, 
        [...(currentMessages || []), newMessage]
      );
    });
  const generateUploadUrl = useMutation(api.message.generateUploadUrl)

  // Effect to store user in Convex when user object is available from Clerk
  useEffect(() => {
    if (user && user.id && user.fullName) {
      storeUser({
        tokenIdentifier: user.id,
        name: user.fullName,
      });
    }
  }, [user, storeUser]);


  const handleSendMessage = useCallback(async () => {
    if (!message.trim() || !user?.id) { // Ensure user is logged in before sending
        console.warn("Message is empty or user is not logged in.");
        return;
    }
    
    try {
      // Create thread. The optimistic update is handled by the `withOptimisticUpdate` above.
      const threadId = await createThread({
        tokenIdentifier: user.id, // Pass Clerk's user ID
        title: message.substring(0, 50) // Use first 50 chars as title
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
        const uploadResponse = await fetch(url);
        const blob = await uploadResponse.blob();
        
        const base64 = await new Promise<string | ArrayBuffer | null>((resolve) => {
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
        tokenIdentifier: user.id, // Pass Clerk's user ID
        threadId,
        role: "user",
        content,
        parentMessageId: undefined
      });

      // Clear message input and file after successful send
      setMessage("");
      setFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }

      // Navigate to the new chat thread
      navigate(`/chat/${threadId}`);
    } catch (error) {
      console.error("Error creating thread or sending message:", error);
      // TODO: Add user-friendly error feedback here
    }
  }, [message, createThread, send, navigate, file, generateUploadUrl, user?.id]); // Added user?.id to dependencies

  const handleQuestionSelect = useCallback((question: string) => {
    setMessage(question)
    // Automatically send the message when a sample question is selected
    // Note: This will trigger handleSendMessage which creates a new thread.
    // If you want to only populate the input, remove the call to handleSendMessage here.
    handleSendMessage(); 
  }, [handleSendMessage]) // Dependency on handleSendMessage

  const handleSelectThread = useCallback((threadId: string) => {
    navigate(`/chat/${threadId}`)
  }, [navigate])

  // Removed messagesEndRef and its useEffect as this component doesn't display messages list

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
                messages: [] // Messages are not loaded here, only thread metadata
              }))}
              selectedThread={null} // No thread selected on this page
              setSelectedThread={handleSelectThread}
              tokenIdentifier={user?.id ?? ""}
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
                <SignInButton mode="modal" forceRedirectUrl={"/chat"}>
                    <Button variant="outline" className='flex items-center justify-start py-6 text-md'><LogIn className="mr-1 ml-2" />Login</Button>
                </SignInButton>
            </SignedOut>
          </SidebarFooter>
        </Sidebar>

        <SidebarInset className="flex flex-col h-screen">
          <header className="flex h-16 items-center gap-2 px-4 border-b border-border sticky top-0 bg-background z-10">
            <SidebarTrigger className="hover:bg-accent text-muted-foreground" />
          </header>

          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-8">
              <div className="flex flex-col items-center justify-center min-h-full">
                {/* Conditionally render welcome message or loading */}
                {user ? (
                  <h1 className="text-3xl font-semibold mb-8 text-center">How can I help you, {user.firstName || user.fullName || "there"}?</h1>
                ) : (
                  <h1 className="text-3xl font-semibold mb-8 text-center">Please log in to start a chat.</h1>
                )}
                
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
