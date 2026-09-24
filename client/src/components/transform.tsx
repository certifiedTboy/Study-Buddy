import React from "react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { oneDark } from "react-syntax-highlighter/dist/esm/styles/prism";
import { languageAliases } from "@/lib/mock-data";

export const transform = (
  node: HTMLElement,
  _children: React.ReactNode[],
): React.ReactNode | undefined => {
  // Interweave provides HTML tag names in uppercase.
  if (node.tagName !== "PRE") {
    return undefined;
  }

  const codeElement = node.querySelector(":scope > code");

  if (!codeElement) {
    return undefined;
  }

  const className = codeElement.getAttribute("class") ?? "";

  const languageMatch = className.match(/(?:^|\s)language-([^\s]+)/i);
  const detectedLanguage = languageMatch?.[1]?.toLowerCase() ?? "text";

  const language = languageAliases[detectedLanguage] ?? detectedLanguage;

  // textContent preserves spaces, indentation and line breaks.
  const code = codeElement.textContent ?? "";

  return (
    <SyntaxHighlighter
      language={language}
      style={oneDark}
      //   showLineNumbers
      wrapLongLines
      PreTag="div"
      customStyle={{
        margin: 0,
        borderRadius: "0.5rem",
        fontSize: "0.9rem",
      }}
      codeTagProps={{
        style: {
          fontFamily:
            '"Fira Code", "Cascadia Code", Consolas, Monaco, monospace',
        },
      }}
    >
      {code.replace(/\n$/, "")}
    </SyntaxHighlighter>
  );
};
