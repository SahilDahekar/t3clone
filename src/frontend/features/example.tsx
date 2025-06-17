"use client";
import { useState, useRef, ChangeEvent, FormEvent } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "../../../convex/_generated/api";
import { Id } from "../../../convex/_generated/dataModel";

export default function Example() {
  const [projectId, setProjectId] = useState("");
  const [activeThread, setActiveThread] = useState<Id<"threads"> | null>(null);
  const [parentMessageId, setParentMessageId] = useState<Id<"messages"> | undefined>();
  const [text, setText] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const threads = useQuery(api.threads.list);
  const messages = useQuery(
    api.message.getMessages,
    activeThread ? { threadId: activeThread } : "skip"
  );

  
  const createThread = useMutation(api.threads.create);
  const send = useMutation(api.message.send);

  const hardcodedUserId = "jh725nd27yxr0pvbsyr77gnek57j09et" as Id<"users">; 
  const defaultChatName = "New Chat";

  async function handleNewChat() {
    if (!projectId) return alert("Enter a project ID first");

    
    const thread = await createThread({ title: projectId , userId: hardcodedUserId });
    
    
    

    setActiveThread(thread);
    setParentMessageId(undefined);
  }

  async function handleSend(e: FormEvent) {
  e.preventDefault();
  if (!activeThread) return;

  const content: any[] = [{ type: "text", text }];
  
if (file) {
  const reader = new FileReader();
  reader.onload = async () => {
    const base64 = reader.result as string;
    content.push({
      type: "file",
      fileName: file.name,
      mimeType: file.type,
      data: base64, // safe to send to Convex
    });

    await send({ threadId: activeThread, role: "user", content, parentMessageId });
    setText("");
    setFile(null);
    fileInputRef.current!.value = "";
  };
  reader.readAsDataURL(file); // converts to base64
  return;
}


  await send({ threadId: activeThread, role: "user", content, parentMessageId });
  postSendCleanup();
}

function postSendCleanup() {
  setText("");
  setFile(null);
  fileInputRef.current!.value = "";
}


  return (
    <div className="flex h-screen">
      <aside className="w-72 border-r p-2 overflow-auto">
        <h2 className="font-bold mb-2">Project</h2>
        <input
          className="w-full border p-1 mb-2"
          value={projectId}
          onChange={(e) => setProjectId(e.target.value)}
          placeholder="Enter Project ID"
        />
        <button
          onClick={handleNewChat}
          className="w-full mb-4 bg-green-500 text-white p-2 rounded"
        >
          + New Chat
        </button>

        <h2 className="font-bold mb-2">Threads</h2>
        {threads
          ?.filter((t) => t.userId === hardcodedUserId)
          .map((t) => (
            <div
              key={t._id}
              onClick={() => setActiveThread(t._id)}
              className={`p-1 cursor-pointer ${
                t._id === activeThread ? "bg-blue-200" : ""
              }`}
            >
              {t.title}
            </div>
          ))}
      </aside>

      <main className="flex-1 p-4 flex flex-col">
        <div className="flex-1 overflow-auto space-y-2">
          {messages?.map((m) => (
            <div
              key={m._id}
              className={`flex flex-col ${
                m.role === "assistant" ? "items-start" : "items-end"
              }`}
            >
              <div className="bg-black p-2 rounded-lg">
                {m.content.map((c, idx) =>
                  c.type === "text" ? (
                    <p key={idx}>{c.text}</p>
                  ) : (
                    <div key={idx} className="text-sm text-white">
                      📎 {c.fileName}
                    </div>
                  )
                )}
              </div>
              <button
                onClick={() => setParentMessageId(m._id)}
                className="text-xs text-blue-500 hover:underline mt-1"
              >
                Branch from here
              </button>
            </div>
          ))}
        </div>

        <form onSubmit={handleSend} className="flex space-x-2 p-2 border-t">
          <input
            className="flex-1 border p-2"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type a message…"
          />
          <input
            type="file"
            ref={fileInputRef}
            onChange={(e: ChangeEvent<HTMLInputElement>) =>
              setFile(e.target.files?.[0] ?? null)
            }
          />
          <button type="submit" className="bg-blue-500 text-white p-2 rounded">
            Send
          </button>
        </form>
      </main>
    </div>
  );
}
