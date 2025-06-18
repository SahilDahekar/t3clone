// "use client";
// import { useState, useRef, ChangeEvent, FormEvent, useEffect } from "react";
// import { useQuery, useMutation } from "convex/react";
// import { api } from "../../../convex/_generated/api";
// import { Id } from "../../../convex/_generated/dataModel";
// import { FileText, Send, PlusCircle, FolderPlus, File, X } from "lucide-react";

// export default function Example() {
//   const [projectId, setProjectId] = useState("");
//   const [activeThread, setActiveThread] = useState<Id<"threads"> | null>(null);
//   const [parentMessageId, setParentMessageId] = useState<Id<"messages"> | undefined>();
//   const [text, setText] = useState("");
//   const [file, setFile] = useState<File | null>(null);
//   const [isUploading, setIsUploading] = useState(false);
//   const [showApiKeyModal, setShowApiKeyModal] = useState(false);
//   const [apiKeyInput, setApiKeyInput] = useState("");
//   const fileInputRef = useRef<HTMLInputElement>(null);
//   const messagesEndRef = useRef<HTMLDivElement>(null);
  
//   const hardcodedUserId = "j572pt27hbqy8rkdgjydk9tjj97j1y0e" as Id<"users">; 
//   const threads = useQuery(api.threads.getThreads, {tokenIdentifier: hardcodedUserId});
  
//   const fileUploadUrl = useMutation(api.files.generateUploadUrl);
//   const getUrl = useMutation(api.files.getUrl);
//   const messages = useQuery(
//     api.message.getMessages,
//     activeThread ? { threadId: activeThread } : "skip"
//   );

//   const createThread = useMutation(api.threads.create);
//   const send = useMutation(api.message.send);
//   const updateModelProvider = useMutation(api.threads.updateModelProvider);
//   const saveApiKey = useMutation(api.userSettings.saveApiKey);
//   const defaultChatName = "New Chat";

//   const handleSaveApiKey = async () => {
//     if (activeThread && apiKeyInput) {
//       const thread = threads?.find(t => t._id === activeThread);
//       if (thread) {
//         await saveApiKey({
//           tokenIdentifier: thread.userId,
//           apiKey: apiKeyInput,
//           provider: thread.modelProvider || 'gemini'
//         });
//         setShowApiKeyModal(false);
//         setApiKeyInput("");
//       }
//     }
//   };

//   async function handleNewChat() {
//     if (!projectId) {
//       alert("Please enter a project ID first");
//       return;
//     }
//     // const thread = await createThread({ title: projectId, userId: hardcodedUserId });
//     setActiveThread(threads);
//     setParentMessageId(undefined);
//     setProjectId("");
//   }

//   async function handleSend(e: FormEvent) {
//     e.preventDefault();
//     if (!activeThread || (!text && !file)) return;

//     setIsUploading(true);
//     const content: any[] = text ? [{ type: "text", text }] : [];

//     if (file) {
//       try {
//         const postUrl = await fileUploadUrl();
//         const result = await fetch(postUrl, {
//           method: "POST",
//           headers: { "Content-Type": file.type },
//           body: file,
//         });
//         const { storageId } = await result.json();
//         const src = await getUrl({ storageId });

//         content.push({
//           type: "file",
//           fileName: file.name,
//           mimeType: file.type,
//           data: src,
//         });
//       } catch (error) {
//         console.error("File upload failed:", error);
//         alert("File upload failed. Please try again.");
//         setIsUploading(false);
//         return;
//       }
//     }

//     try {
//       await send({ threadId: activeThread, role: "user", content, parentMessageId , tokenIdentifier });
//       postSendCleanup();
//     } catch (error) {
//       console.error("Failed to send message:", error);
//       alert("Failed to send message. Please try again.");
//     } finally {
//       setIsUploading(false);
//     }
//   }

//   function postSendCleanup() {
//     setText("");
//     setFile(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   }

//   function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
//     const selectedFile = e.target.files?.[0];
//     if (selectedFile) {
//       // Basic file type validation
//       const validTypes = ["image/jpeg", "image/png", "application/pdf", "text/plain"];
//       if (!validTypes.includes(selectedFile.type)) {
//         alert("Please select a valid file type (JPEG, PNG, PDF, TXT)");
//         return;
//       }
      
//       // File size limit (5MB)
//       if (selectedFile.size > 5 * 1024 * 1024) {
//         alert("File size exceeds 5MB limit");
//         return;
//       }
      
//       setFile(selectedFile);
//     }
//   }

//   function removeFile() {
//     setFile(null);
//     if (fileInputRef.current) {
//       fileInputRef.current.value = "";
//     }
//   }

//   const [apiKey, setApiKey] = useState("");
//   const [keyStatus, setKeyStatus] = useState<{valid: boolean, message: string} | null>(null);
  
//   const saveApiKey = async () => {
//     if (!apiKey) return;
    
//     try {
//       // In a real app, we would encrypt the key before sending
//       await fetch("/api/saveKey", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ 
//           userId: hardcodedUserId, 
//           apiKey,
//           provider: "google" 
//         })
//       });
//       setKeyStatus({ valid: true, message: "API key saved successfully!" });
//     } catch (error) {
//       console.error("Failed to save API key:", error);
//       setKeyStatus({ valid: false, message: "Failed to save API key" });
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       {/* Sidebar */}
//       <aside className="w-64 bg-gradient-to-b from-blue-50 to-indigo-50 p-4 flex flex-col border-r border-gray-200">
//         {/* API Key Section */}
//         <div className="mb-6">

//         <h2 className="text-lg font-bold text-indigo-800 mb-3">Threads</h2>
//         <div className="flex-1 overflow-y-auto">
//           {threads?.filter(t => t.userId === hardcodedUserId).length === 0 && (
//             <p className="text-gray-500 text-sm italic">No threads yet</p>
//           )}
          
//           {threads
//             ?.filter((t) => t.userId === hardcodedUserId)
//             .map((t) => (
//               <div
//                 key={t._id}
//                 onClick={() => setActiveThread(t._id)}
//                 className={`p-3 mb-2 rounded-lg cursor-pointer transition-colors ${
//                   t._id === activeThread 
//                     ? "bg-indigo-100 border border-indigo-300" 
//                     : "hover:bg-gray-100"
//                 }`}
//               >
//                 <div className="font-medium text-gray-800 truncate">{t.title}</div>
//                 <div className="text-xs text-gray-500">
//                   {new Date(t._creationTime).toLocaleDateString()}
//                 </div>
//               </div>
//             ))}
//         </div>
//       </aside>

//       {/* Main Chat Area */}
//       <main className="flex-1 flex flex-col">
//         {activeThread ? (
//           <>
//             {/* Chat Header */}
//             <div className="bg-white border-b p-4">
//               <h2 className="text-xl font-bold text-gray-800">
//                 {threads?.find(t => t._id === activeThread)?.title || "Chat"}
//               </h2>
//               <div className="flex items-center mt-2 space-x-2">
//                 <label className="text-sm text-gray-600">Model:</label>
//                 <select
//                   value={threads?.find(t => t._id === activeThread)?.modelProvider || 'gemini'}
//                   onChange={(e) => {
//                     if (activeThread) {
//                       updateModelProvider({
//                         threadId: activeThread,
//                         provider: e.target.value
//                       });
//                     }
//                   }}
//                   className="text-sm bg-white border rounded p-1"
//                 >
//                   <option value="gemini">Gemini</option>
//                   <option value="openai">OpenAI</option>
//                 </select>
                
//                 {threads?.find(t => t._id === activeThread)?.modelProvider !== 'gemini' && (
//                   <button
//                     onClick={() => setShowApiKeyModal(true)}
//                     className="ml-2 text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded hover:bg-indigo-200"
//                   >
//                     Set API Key
//                   </button>
//                 )}
//               </div>
              
//               {parentMessageId && (
//                 <div className="text-sm text-indigo-600 mt-1 flex items-center">
//                   <span className="bg-indigo-100 px-2 py-1 rounded">Branched conversation</span>
//                   <button 
//                     onClick={() => setParentMessageId(undefined)}
//                     className="ml-2 text-indigo-400 hover:text-indigo-600"
//                   >
//                     <X size={16} />
//                   </button>
//                 </div>
//               )}
              
//               {/* API Key Modal */}
//               {showApiKeyModal && (
//                 <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//                   <div className="bg-white p-6 rounded-lg w-96">
//                     <h3 className="font-bold text-lg mb-4">Set API Key</h3>
//                     <input
//                       type="password"
//                       value={apiKeyInput}
//                       onChange={(e) => setApiKeyInput(e.target.value)}
//                       placeholder={`Enter ${threads?.find(t => t._id === activeThread)?.modelProvider} API Key`}
//                       className="w-full border rounded p-2 mb-4"
//                     />
//                     <div className="flex justify-end space-x-2">
//                       <button
//                         onClick={() => setShowApiKeyModal(false)}
//                         className="px-4 py-2 border rounded"
//                       >
//                         Cancel
//                       </button>
//                       <button
//                         onClick={handleSaveApiKey}
//                         className="px-4 py-2 bg-indigo-600 text-white rounded"
//                       >
//                         Save
//                       </button>
//                     </div>
//                   </div>
//                 </div>
//               )}
//             </div>

//              {/* Messages */}
//              <div className="flex-1 overflow-y-auto p-4 bg-gradient-to-b from-white to-gray-50">
//                {messages?.length === 0 && (
//                 <div className="flex items-center justify-center h-full">
//                   <div className="text-center text-black">
//                     <FileText className="mx-auto mb-2 text-black" size={40} />
//                     <p>No messages yet. Start a conversation!</p>
//                   </div>
//                 </div>
//               )}
              
//               {messages?.map((m) => (
//                 <div
//                   key={m._id}
//                   className={`flex mb-6 ${
//                     m.role === "assistant" ? "justify-start" : "justify-end"
//                   }`}
//                 >
//                   <div
//                     className={`max-w-[80%] rounded-2xl px-4 py-3 ${
//                       m.role === "assistant"
//                         ? "bg-white border border-gray-200 rounded-tl-none"
//                         : "bg-indigo-600 text-white rounded-br-none"
//                     }`}
//                   >
//                     {m.content.map((c, idx) =>
//                       c.type === "text" ? (
//                         <p key={idx} className="whitespace-pre-wrap">{c.text}</p>
//                       ) : (
//                         <div key={idx} className="mt-2 flex items-center">
//                           <File size={16} className="mr-2" />
//                           <a 
//                             href={c.data} 
//                             target="_blank" 
//                             rel="noopener noreferrer"
//                             className="text-sm underline truncate max-w-xs"
//                           >
//                             {c.fileName}
//                           </a>
//                         </div>
//                       )
//                     )}
//                     <button
//                       onClick={() => setParentMessageId(m._id)}
//                       className={`mt-1 text-xs ${
//                         m.role === "assistant" 
//                           ? "text-indigo-600 hover:text-indigo-800" 
//                           : "text-indigo-200 hover:text-white"
//                       } hover:underline`}
//                     >
//                       Branch from here
//                     </button>
//                   </div>
//                 </div>
//               ))}
//               <div ref={messagesEndRef} />
//             </div>

//             {/* Input Area */}
//             <form onSubmit={handleSend} className="bg-white border-t p-4">
//               {file && (
//                 <div className="flex items-center bg-indigo-50 rounded-lg p-3 mb-3">
//                   <File size={16} className="text-indigo-600 mr-2" />
//                   <span className="text-sm truncate flex-1">{file.name}</span>
//                   <button 
//                     type="button"
//                     onClick={removeFile}
//                     className="text-gray-500 hover:text-gray-700 ml-2"
//                   >
//                     <X size={16} />
//                   </button>
//                 </div>
//               )}
              
//               <div className="flex items-end space-x-2">
//                 <div className="flex-1 relative">
//                   <input
//                     className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-indigo-500"
//                     value={text}
//                     onChange={(e) => setText(e.target.value)}
//                     placeholder="Type a message…"
//                     disabled={isUploading}
//                   />
//                   <label className="absolute right-3 bottom-3 cursor-pointer text-gray-400 hover:text-indigo-600">
//                     <input
//                       type="file"
//                       ref={fileInputRef}
//                       onChange={handleFileChange}
//                       className="hidden"
//                       disabled={isUploading}
//                     />
//                     <File size={20} />
//                   </label>
//                 </div>
//                 <button 
//                   type="submit" 
//                   className="bg-indigo-600 text-white p-3 rounded-lg flex items-center justify-center hover:bg-indigo-700 transition-colors disabled:opacity-50"
//                   disabled={(!text && !file) || isUploading}
//                 >
//                   {isUploading ? (
//                     <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
//                   ) : (
//                     <Send size={20} />
//                   )}
//                 </button>
//               </div>
//             </form>
//           </>
//         ) : (
//           <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50">
//             <div className="text-center max-w-md p-8 bg-white rounded-xl shadow-lg border border-gray-100">
//               <FolderPlus size={48} className="mx-auto text-indigo-600 mb-4" />
//               <h3 className="text-xl font-bold text-gray-800 mb-2">No active chat</h3>
//               <p className="text-gray-600 mb-6">
//                 Select a thread from the sidebar or create a new chat to start a conversation.
//               </p>
//               <button
//                 onClick={handleNewChat}
//                 className="bg-indigo-600 text-white px-6 py-2 rounded-lg flex items-center justify-center mx-auto hover:bg-indigo-700 transition-colors"
//                 disabled={!projectId}
//               >
//                 <PlusCircle className="mr-2" size={18} />
//                 Create New Chat
//               </button>
//             </div>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
