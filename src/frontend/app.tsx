import { Routes, Route, BrowserRouter } from "react-router";
import Chat from "@/frontend/features/chat";
import LaunchChat from "@/frontend/features/launchChat";
import { ConvexClientProvider } from "@/app/ConvexClientProvider";
import Example from "@/frontend/features/example";

function App() {
  return (
    <ConvexClientProvider>
      <BrowserRouter>  
        <Routes>
            <Route path="chat/:threadId" element={<Chat/>} />
            <Route path="chat" element={<LaunchChat/>} />
            <Route path="/" element={<Example/>} />
        </Routes>
      </BrowserRouter>
    </ConvexClientProvider>
  )
}

export default App;