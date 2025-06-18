import { memo, Fragment } from "react"
import { Star } from "lucide-react"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
} from "@/components/ui/sidebar"
import { api } from "../../../../convex/_generated/api"
import { useQuery, useMutation } from "convex/react"

import { Id } from "../../../../convex/_generated/dataModel"
import type { Thread } from "../launchChat"
interface ThreadListProps {
  threads: Thread[]
  selectedThread: Id<"threads"> | null
  setSelectedThread: (threadId: Id<"threads">) => void
  tokenIdentifier: string
}


const ThreadList = memo(function ThreadList({ 
  threads, 
  selectedThread, 
  setSelectedThread,
  tokenIdentifier 
}: ThreadListProps) {
  const starredThreads = useQuery(api.user.getstarredThreads, { tokenIdentifier });
  const star = useMutation(api.user.starThreads);
  const unstar = useMutation(api.user.unstarThreads);

  return (
    <>
      {starredThreads && starredThreads.length > 0 && (
        <SidebarGroup>
          <SidebarGroupLabel className="text-primary text-sm font-bold mb-2">
            Starred Threads
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {starredThreads.map((threadId) => {
                const thread = threads.find(t => t.id === threadId);
                return thread ? (
                  <SidebarMenuItem key={thread.id}>
                    <SidebarMenuButton
                      className={`hover:bg-accent hover:text-accent-foreground text-muted-foreground ${
                        selectedThread === thread.id ? "bg-accent text-accent-foreground" : ""
                      }`}
                      onClick={() => setSelectedThread(thread.id)}
                      isActive={selectedThread === thread.id}
                    >
                      <span className="flex items-center justify-between w-full">
                        {thread.title}
                        <Star 
                          size={16} 
                          className="ml-2"
                          fill="gold"
                          stroke="currentColor"
                          onClick={(e) => {
                            e.stopPropagation();
                            unstar({ tokenIdentifier, threadId: thread.id });
                          }}
                        />
                      </span>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ) : null;
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      )}
      <SidebarGroup>
        <SidebarGroupLabel className="text-primary text-sm font-bold mb-2">
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
                  <span className="flex items-center justify-between w-full">
                    {thread.title}
                    <Star 
                      size={16} 
                      className="ml-2"
                      fill={starredThreads?.includes(thread.id) ? "gold" : "none"}
                      stroke="currentColor"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (starredThreads?.includes(thread.id)) {
                          unstar({ tokenIdentifier, threadId: thread.id });
                        } else {
                          star({ tokenIdentifier, threadId: thread.id });
                        }
                      }}
                    />
                  </span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </>
  )
})

export default ThreadList
