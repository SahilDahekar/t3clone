import { Routes, Route, BrowserRouter } from "react-router";
import Chat from "@/frontend/features/chat";
import LaunchChat from "@/frontend/features/launchChat";
import { ConvexClientProvider, clerk_key } from "@/app/ConvexClientProvider";
// import Example from "@/frontend/features/example";
import { ClerkProvider } from "@clerk/clerk-react";

function App() {
  return (
      <ClerkProvider
        publishableKey={clerk_key || ""}
        afterSignOutUrl="/chat"
      >
      <ConvexClientProvider>
        <BrowserRouter>
          <Routes>
              <Route path="chat/:threadId" element={<Chat/>} />
              <Route path="chat" element={<LaunchChat/>} />
              {/* <Route path="/" element={<Example/>} /> */}
              <Route path="*" element={<div>Page not found</div>} />
          </Routes>
        </BrowserRouter>
      </ConvexClientProvider>
    </ClerkProvider>
  )
}

export default App;
