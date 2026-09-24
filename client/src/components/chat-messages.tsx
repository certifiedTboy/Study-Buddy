import { useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bot } from "lucide-react";
import { useChatContext } from "@/features/chat-context";
import { MarkdownRenderer } from "./markdown-renderer";
import { MessageFilePreview } from "./message-file-preview";

export function ChatMessages() {
  const bottomRef = useRef<HTMLDivElement>(null);

  const { socketMessages, sendMessage, setSocketMessage } = useChatContext();

  const handleSend = (content: string) => {
    sendMessage({
      id: Date.now().toString(),
      sender: "me",
      room: "chat",
      text: content,
      isSender: true,
    });

    const userMessage = {
      id: Date.now().toString(),
      sender: "me",
      room: "chat",
      text: content,
      isSender: true,
    };

    setSocketMessage(userMessage);
  };

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [socketMessages]);

  if (socketMessages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl flex items-center justify-center mb-6 shadow-sm">
          <Bot size={32} className="stroke-[1.5]" />
        </div>
        <h2 className="text-2xl font-medium mb-2">
          What can I help you with today?
        </h2>
        <p className="text-muted-foreground mb-8 max-w-md">
          I can explain complex topics, write code, or help you brainstorm
          ideas.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 w-full max-w-2xl">
          <button
            onClick={() =>
              handleSend?.("Explain quantum computing in simple terms")
            }
            className="text-left p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex flex-col"
          >
            <span className="font-medium text-sm mb-1">
              Explain quantum computing
            </span>
            <span className="text-xs text-muted-foreground">
              in simple terms
            </span>
          </button>
          <button
            onClick={() =>
              handleSend?.("Write a Python script to scrape a website")
            }
            className="text-left p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex flex-col"
          >
            <span className="font-medium text-sm mb-1">
              Write a Python script
            </span>
            <span className="text-xs text-muted-foreground">
              to scrape a website
            </span>
          </button>
          <button
            onClick={() =>
              handleSend?.("Draft an email to decline a meeting politely")
            }
            className="text-left p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex flex-col"
          >
            <span className="font-medium text-sm mb-1">Draft an email</span>
            <span className="text-xs text-muted-foreground">
              to decline a meeting politely
            </span>
          </button>
          <button
            onClick={() => handleSend?.("Help me debug a React useEffect loop")}
            className="text-left p-4 rounded-xl border border-border bg-card hover:bg-muted/50 transition-colors flex flex-col"
          >
            <span className="font-medium text-sm mb-1">Help me debug</span>
            <span className="text-xs text-muted-foreground">
              a React useEffect loop
            </span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
      <div className="max-w-3xl mx-auto space-y-8 pb-12">
        <AnimatePresence initial={false}>
          {socketMessages?.map((message, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-2  ${message?.isSender ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  message?.isSender
                    ? "bg-primary/20 text-primary font-medium text-sm"
                    : "bg-primary text-primary-foreground"
                }`}
              >
                {message?.isSender ? `YU` : <Bot size={18} />}
              </div>

              <div
                className={`flex flex-col justify-center ${message?.isSender ? "items-end" : "items-start"} max-w-[85%]`}
              >
                <div className="font-medium text-xs text-muted-foreground mb-1 px-1">
                  {!message?.isSender ? "Assistant" : "You"}
                </div>
                {message?.isSender ? (
                  <div className="flex flex-col items-end gap-2 rounded-2xl rounded-tr-sm bg-muted px-4 py-3 text-sm leading-relaxed shadow-sm">
                    {message.text && (
                      <div className="whitespace-pre-wrap">{message.text}</div>
                    )}

                    {message.file && <MessageFilePreview file={message.file} />}
                  </div>
                ) : (
                  <div className="w-full text-sm">
                    <MarkdownRenderer content={message?.text} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        <div ref={bottomRef} />
      </div>
    </div>
  );
}
