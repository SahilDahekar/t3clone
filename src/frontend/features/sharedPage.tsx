import { useParams } from 'react-router';
import { useQuery } from 'convex/react';
import { api } from '../../../convex/_generated/api';
import ReactMarkdown from "react-markdown";


function SharePage() {
  const { sharedId } = useParams();
  
  const data = useQuery(
    api.shareThread.getSharedThread,
    sharedId ? { shareId: sharedId } : "skip"
  );
  
  if (!sharedId) {
    return <div>Invalid share link</div>;
  }
  
  if (!data) {
    return <div>Loading...</div>;
  }
  
  if (data === null) {
    return <div>Chat not found or not shared.</div>;
  }
  const formatTimestamp = (raw: string | number) => {
  const date = new Date(raw);
  return date.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
};
  
  return (
  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-6">
  <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    <h1 className="text-3xl font-bold mb-6 text-gray-900 dark:text-gray-100 text-center">
      <span className="text-indigo-600 dark:text-indigo-400">📤</span> Shared Chat
    </h1>

    <div className="space-y-4">
      {data.messages.map((m) => (
        <div
          key={m._id}
          className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}
        >
          <div
            className={`
              max-w-[85%] rounded-lg px-4 py-3 shadow-sm
              text-sm leading-relaxed
              ${m.role === "user"
                ? "bg-indigo-600 text-white rounded-br-none"
                : "bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-gray-100 rounded-bl-none"}
            `}
          >
            {Array.isArray(m.content) ? (
              m.content.map((item, idx) =>
                item.type === "text" ? (
                  <div key={idx} className="prose prose-sm dark:prose-invert max-w-none">
                    <ReactMarkdown>
                      {item.text}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <div key={idx} className="mt-2">
                    <a
                      href={item.data}
                      download={item.fileName || "file"}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-md text-sm transition-colors ${
                        m.role === "user"
                          ? "bg-indigo-700 hover:bg-indigo-800 text-white"
                          : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300"
                      }`}
                    >
                      📎 {item.fileName || "Download file"}
                    </a>
                  </div>
                )
              )
            ) : (
              <div className="prose prose-sm dark:prose-invert max-w-none">
                <ReactMarkdown>
                  {m.content}
                </ReactMarkdown>
              </div>
            )}

            <div className="text-xs opacity-60 mt-2 text-right">
              {formatTimestamp(m.createdAt)}
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
</div>
);
}

export default SharePage;