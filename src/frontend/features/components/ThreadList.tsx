import { memo } from "react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"

import { Thread } from "../launchChat" // Adjust the import path as necessary

interface ThreadListProps {
  threads: Thread[]
  selectedThread: string | null
  setSelectedThread: (threadId: string) => void
}

const ThreadList = memo(function ThreadList({ 
  threads, 
  selectedThread, 
  setSelectedThread 
}: ThreadListProps) {
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="text-muted-foreground text-sm font-medium mb-2">
        Your Threads
      </SidebarGroupLabel>
      <SidebarGroupContent>
        <SidebarMenu>
          {threads.map((thread) => (
            <SidebarMenuItem key={thread.id}>
              <SidebarMenuButton
                className={`hover:bg-accent hover:text-accent-foreground text-muted-foreground ${
                  selectedThread === thread.id ? "bg-accent text-accent-foreground" : ""
                }`}
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

export default ThreadList
