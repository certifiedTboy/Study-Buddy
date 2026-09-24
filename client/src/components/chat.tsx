import { useState, useEffect } from "react";
import { Sidebar } from "@/components/sidebar";
import { ChatMessages } from "@/components/chat-messages";
import { ChatInput } from "@/components/chat-input";
import { PanelLeftOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";
import { useChatContext } from "@/features/chat-context";

export default function Chat() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const { joinRoom, clearMessages } = useChatContext();

  useEffect(() => {
    joinRoom("me", "chat");
  }, []);

  // Check for mobile screen size
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
      if (window.innerWidth < 768) {
        setSidebarOpen(false);
      } else {
        setSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  return (
    <div className="flex h-[100dvh] w-full bg-background overflow-hidden">
      <Sidebar
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen(!sidebarOpen)}
        isMobile={isMobile}
        onNewChat={() => {
          clearMessages();
          if (isMobile) setSidebarOpen(false);
        }}
      />

      <main className="flex-1 flex flex-col relative min-w-0">
        <header className="absolute top-0 left-0 right-0 z-10 p-2 flex items-center bg-gradient-to-b from-background via-background/90 to-transparent pb-6 pointer-events-none">
          <div className="pointer-events-auto">
            <AnimatePresence>
              {!sidebarOpen && (
                <motion.div
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                >
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSidebarOpen(true)}
                    className="h-10 w-10 text-muted-foreground hover:text-foreground hover:bg-muted/50 rounded-xl bg-background/50 backdrop-blur-sm"
                  >
                    <PanelLeftOpen size={18} />
                  </Button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </header>

        <ChatMessages />

        <div className="bg-gradient-to-t from-background via-background/95 to-transparent pt-6">
          <ChatInput />
        </div>
      </main>
    </div>
  );
}
