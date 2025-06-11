import { Routes, Route, BrowserRouter } from "react-router";
import Chat from "@/frontend/features/chat";
import LaunchChat from "@/frontend/features/launchChat";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="chat/:threadId" element={<Chat/>} />
        <Route path="chat" element={<LaunchChat/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App;