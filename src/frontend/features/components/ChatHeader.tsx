import { memo } from "react"
import { Button } from "@/components/ui/button"
import { Share, Plus, Search } from "lucide-react"
import { SidebarHeader, SidebarInput } from "@/components/ui/sidebar"
import ThemeToggle from "./ThemeToggle"

interface ChatHeaderProps {
  onNewChat: () => void
}

const ChatHeader = memo(function ChatHeader({ onNewChat }: ChatHeaderProps) {
  return (
    <SidebarHeader className="p-4">
      <div className="flex items-center gap-2 mb-4">
        <div className="font-bold text-lg">T3.chat</div>
        <div className="ml-auto flex gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Share className="h-4 w-4" />
          </Button>          <ThemeToggle />
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
