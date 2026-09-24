import { createRoot } from "react-dom/client";
import { ChatContextProvider } from "./features/chat-context";
import { ThemeProvider } from "next-themes";

import App from "./App";

import "./index.css";

createRoot(document.getElementById("root")!).render(
  <ChatContextProvider>
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
      <App />
    </ThemeProvider>
  </ChatContextProvider>,
);
