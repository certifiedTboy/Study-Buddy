import { useRef, useState, useEffect, createContext, useContext } from "react";
import { io } from "socket.io-client";

export type Message = {
  text: string;
  file?: File;
  id: string;
  sender: string;
  room: string;
  isSender: boolean;
};

type ChatContextType = {
  socketMessages: Message[];
  sendMessage: (messageData: Message) => void;
  joinRoom: (user: any, room: string) => void;
  leaveRoom?: (userData: any, room: string) => void;
  setSocketMessage: (messageData: Message) => void;
  clearMessages: () => void;
  topics: string[];
  isTyping: boolean;
};

export const ChatContext = createContext<ChatContextType>({
  socketMessages: [],
  sendMessage: () => {},
  joinRoom: () => {},
  leaveRoom: () => {},
  isTyping: false,
  setSocketMessage: () => {},
  clearMessages: () => {},
  topics: [],
});

const API_URL = import.meta.env.VITE_SERVER_SOCKET_URL;

export const ChatContextProvider = ({
  children,
}: React.PropsWithChildren<any>) => {
  const streamIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [socketMessages, setSocketMessages] = useState<Message[]>([]);
  const [topics, setTopics] = useState<string[]>([]);

  const [isTyping, setIsTyping] = useState<boolean>(false);

  const socket = useRef(io(API_URL));

  function joinRoom(user: string, room: string) {
    socket?.current?.emit("joinRoom", { room, user });
  }

  useEffect(() => {
    socket?.current?.on("typing", () => {
      setIsTyping(true);
    });

    socket?.current?.on("stopTyping", () => {
      setIsTyping(false);
    });

    socket?.current?.on("new_topic", (data: { topic: string }) => {
      setTopics((prev) => [...prev, data.topic]);
    });

    return () => {
      socket?.current?.off("typing");
      socket?.current?.off("stopTyping");
    };
  }, [socket]);

  function sendMessage(messageData: Message) {
    socket?.current?.emit("chatMessage", messageData);
  }

  useEffect(() => {
    const handleMessage = (msg: Message) => {
      // Stop previous stream
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }

      const messageId = crypto.randomUUID();

      // Insert an empty AI message
      setSocketMessages((prev) => [
        ...prev,
        {
          ...msg,
          id: messageId,
          text: "",
          isStreaming: true,
        },
      ]);

      let charIndex = 0;

      streamIntervalRef.current = window.setInterval(() => {
        charIndex += 3;

        const revealed = msg?.text.slice(0, charIndex);
        const done = charIndex >= msg?.text.length;

        setSocketMessages((prev) =>
          prev.map((m) =>
            m.id === messageId
              ? {
                  ...m,
                  text: revealed,
                  isStreaming: !done,
                }
              : m,
          ),
        );

        if (done && streamIntervalRef.current) {
          clearInterval(streamIntervalRef.current);
          streamIntervalRef.current = null;
        }
      }, 1);
    };

    socket.current?.on("message", handleMessage);

    return () => {
      socket.current?.off("message", handleMessage);

      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
      }
    };
  }, []);

  const value = {
    sendMessage,
    socketMessages,
    joinRoom,
    isTyping,
    clearMessages: () => {
      if (streamIntervalRef.current) {
        clearInterval(streamIntervalRef.current);
        streamIntervalRef.current = null;
      }
      setSocketMessages([]);
      setIsTyping(false);
    },
    setSocketMessage: (messageData: Message) =>
      setSocketMessages((socketMessage) => [...socketMessage, messageData]),

    topics,
  };

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>;
};

export function useChatContext() {
  return useContext(ChatContext);
}
