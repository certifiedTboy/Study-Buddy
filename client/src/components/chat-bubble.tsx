import { Bot } from "lucide-react";
import { motion } from "framer-motion";

export default function ChatBubble() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex gap-4 flex-row"
    >
      <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center shrink-0">
        <Bot size={18} />
      </div>
      <div className="flex flex-col items-start">
        <div className="font-medium text-xs text-muted-foreground mb-1 px-1">
          Assistant
        </div>
        <div className="bg-muted/50 px-4 py-3 rounded-2xl rounded-tl-sm flex items-center gap-1">
          <motion.div
            className="w-2 h-2 bg-primary/40 rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              times: [0, 0.5, 1],
            }}
          />
          <motion.div
            className="w-2 h-2 bg-primary/60 rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              times: [0, 0.5, 1],
              delay: 0.2,
            }}
          />
          <motion.div
            className="w-2 h-2 bg-primary rounded-full"
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{
              duration: 1.4,
              repeat: Infinity,
              times: [0, 0.5, 1],
              delay: 0.4,
            }}
          />
        </div>
      </div>
    </motion.div>
  );
}
