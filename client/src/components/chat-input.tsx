import React, { useRef, useEffect } from "react";
import { Paperclip, Send } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useChatContext } from "@/features/chat-context";
import ChatBubble from "./chat-bubble";
import FilePreview from "./FilePreview";

export function ChatInput() {
  const [input, setInput] = React.useState("");
  const [file, setFile] = React.useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { isTyping, sendMessage, setSocketMessage } = useChatContext();

  const adjustHeight = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = "auto";
      textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
    }
  };

  useEffect(() => {
    adjustHeight();
  }, [input]);

  const handleSend = () => {
    if ((input.trim() || file) && !isTyping) {
      sendMessage({
        id: Date.now().toString(),
        sender: "me",
        room: "chat",
        text: input.trim(),

        file: file
          ? // @ts-ignore
            { buffer: file, fileName: file.name, mimeType: file.type }
          : undefined,
        isSender: true,
      });

      const userMessage = {
        id: Date.now().toString(),
        sender: "me",
        room: "chat",
        text: input?.trim(),
        file: file ? file : undefined,
        isSender: true,
      };

      console.log(file);
      setSocketMessage(userMessage);

      setInput("");
      setFile(null);
      if (textareaRef.current) {
        textareaRef.current.style.height = "auto";
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
    }
    e.target.value = "";
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="p-4 bg-background">
      {isTyping && (
        <div className="max-w-3xl mx-auto mb-5">
          <ChatBubble />
        </div>
      )}

      {file && <FilePreview file={file} onRemove={() => setFile(null)} />}
      <div className="max-w-3xl mx-auto relative flex items-end shadow-sm border border-border bg-card rounded-2xl p-2 transition-shadow focus-within:ring-1 focus-within:ring-ring focus-within:border-ring">
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          className="hidden"
          disabled={isTyping}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => fileInputRef.current?.click()}
          disabled={isTyping}
          aria-label="Attach a file"
          className="shrink-0 h-10 w-10 rounded-xl text-muted-foreground hover:text-foreground"
        >
          <Paperclip size={18} />
        </Button>
        <textarea
          ref={textareaRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Message Assistant..."
          className="flex-1 max-h-[200px] min-h-[40px] resize-none bg-transparent px-3 py-2.5 text-sm focus:outline-none custom-scrollbar m-0 placeholder:text-muted-foreground/60"
          rows={1}
          disabled={isTyping}
        />

        <Button
          onClick={handleSend}
          disabled={isTyping || (!input.trim() && !file)}
          size="icon"
          className="shrink-0 h-10 w-10 rounded-xl transition-all"
          variant={input.trim() || file ? "default" : "secondary"}
        >
          <Send
            size={18}
            className={input.trim() || file ? "translate-x-0.5" : ""}
          />
        </Button>
      </div>
      <div className="text-center mt-2">
        <span className="text-[10px] text-muted-foreground/60 font-sans">
          Assistant can make mistakes. Consider verifying important information.
        </span>
      </div>
    </div>
  );
}
