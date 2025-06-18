import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Share, Plus, Search } from "lucide-react"
import { SidebarHeader, SidebarInput } from "@/components/ui/sidebar"
import ThemeToggle from "./ThemeToggle"
import { useMutation } from "convex/react"
// import { api } from "../../../convex/_generated/api"

interface ChatHeaderProps {
  onNewChat: () => void
  threadId?: string
}

const ChatHeader = memo(function ChatHeader({ onNewChat, threadId }: ChatHeaderProps) {
  // const createShareLink = useMutation(api.shareThread.createShareLink)
  
  // const handleShare = async () => {
  //   if (!threadId) return
    
  //   try {
  //     const { shareId } = await createShareLink({ threadId })
  //     const shareUrl = `${window.location.origin}/chat/sharedChat/${shareId}`
  //     await navigator.clipboard.writeText(shareUrl)
  //     alert('Share link copied to clipboard!')
  //   } catch (err) {
  //     console.error('Failed to share thread:', err)
  //     alert('Error generating share link')
  //   }
  // }
  return (
    <SidebarHeader className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="font-bold text-lg">T3.chat</div>
        <div className="ml-auto flex gap-2">
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8"
            // onClick={handleShare}
            disabled={!threadId}
          >
            <Share className="h-4 w-4" />
          </Button>
          <ThemeToggle />
        </div>
      </div>

      <Button className="w-full" onClick={onNewChat}>
        <Plus className="h-4 w-4 mr-2" />
        New Chat
      </Button>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <SidebarInput
          placeholder="Search your threads..."
          className="pl-10 bg-background border-input text-foreground placeholder:text-muted-foreground"
        />
      </div>
    </SidebarHeader>
  )
})

export default ChatHeader
