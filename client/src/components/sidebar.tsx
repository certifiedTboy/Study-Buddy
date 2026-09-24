import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import { useTheme } from "next-themes";
import { Plus, Moon, Sun, PanelLeftClose, Bot } from "lucide-react";
import { useChatContext } from "@/features/chat-context";
import { Button } from "@/components/ui/button";

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
  isMobile: boolean;
  onNewChat?: () => void;
}

function AnimatedTopicTitle({ topic }: { topic: string }) {
  const [displayedTopic, setDisplayedTopic] = useState("");

  useEffect(() => {
    let characterIndex = 0;
    const interval = window.setInterval(() => {
      characterIndex += 1;
      setDisplayedTopic(topic.slice(0, characterIndex));

      if (characterIndex >= topic.length) {
        window.clearInterval(interval);
      }
    }, 35);

    return () => window.clearInterval(interval);
  }, [topic]);

  return <span className="truncate">{displayedTopic}</span>;
}

function TopicTitle({
  topic,
  shouldAnimate,
}: {
  topic: string;
  shouldAnimate: boolean;
}) {
  return shouldAnimate ? (
    <AnimatedTopicTitle topic={topic} />
  ) : (
    <span className="truncate">{topic}</span>
  );
}

export function Sidebar({
  isOpen,
  onToggle,
  isMobile,
  onNewChat,
}: SidebarProps) {
  const { theme, setTheme } = useTheme();

  const { topics } = useChatContext();

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  const sidebarVariants = {
    open: {
      x: 0,
      width: isMobile ? "100%" : "260px",
      opacity: 1,
    },
    closed: {
      x: isMobile ? "-100%" : "-100%",
      width: isMobile ? "100%" : "0px",
      opacity: isMobile ? 0 : 1,
    },
  };

  return (
    <>
      {/* Mobile backdrop */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm"
            onClick={onToggle}
          />
        )}
      </AnimatePresence>

      <motion.div
        variants={sidebarVariants}
        initial={isMobile ? "closed" : "open"}
        animate={isOpen ? "open" : "closed"}
        transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
        className={`fixed md:relative z-50 h-[100dvh] flex flex-col bg-sidebar border-r border-sidebar-border overflow-hidden shrink-0`}
      >
        <div className="p-3 pb-2 flex items-center justify-between">
          <Button
            variant="outline"
            onClick={onNewChat}
            className="flex-1 cursor-pointer justify-start gap-2 h-10 px-3 bg-sidebar border-sidebar-border hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg no-default-hover-elevate"
          >
            <Bot size={18} className="text-primary" />
            <span className="font-medium text-sm">New Chat</span>
            <Plus size={16} className="ml-auto text-muted-foreground" />
          </Button>

          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={onToggle}
              className="ml-2 h-10 w-10"
            >
              <PanelLeftClose size={18} />
            </Button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 pt-4 custom-scrollbar">
          <div className="space-y-1">
            {topics.map((topic, index) => (
              <Button
                key={`${topic}-${index}`}
                variant="ghost"
                className="w-full cursor-pointer justify-start h-10 px-3 text-left hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg"
                title={topic}
              >
                <TopicTitle
                  topic={topic?.charAt(0)?.toUpperCase() + topic?.slice(1)}
                  shouldAnimate={index === 0}
                />
              </Button>
            ))}
          </div>
        </div>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          {/* <Button
            variant="ghost"
            className="w-full cursor-pointer justify-start gap-3 h-10 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg"
          >
            <Settings size={16} />
            <span className="text-sm">Settings</span>
          </Button> */}
          <Button
            variant="ghost"
            onClick={toggleTheme}
            className="w-full cursor-pointer justify-start gap-3 h-10 px-3 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground rounded-lg"
          >
            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            <span className="text-sm">
              {theme === "dark" ? "Light mode" : "Dark mode"}
            </span>
          </Button>

          <div className="mt-2 pt-2 border-t border-sidebar-border flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-primary/20 text-primary flex items-center justify-center font-medium text-xs">
              AT
            </div>

            <div className="flex-1 truncate text-sm font-medium">
              Adebisi Tosin
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
