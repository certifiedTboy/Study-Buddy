import { marked } from "marked";
import { useMemo } from "react";
import { Interweave } from "interweave";
import { transform } from "./transform";

interface MarkdownRendererProps {
  content: string;
}

export function MarkdownRenderer({ content }: MarkdownRendererProps) {
  const renderedContent = useMemo(
    () =>
      content
        ? marked.parse(content, {
            gfm: true,
            breaks: true,
          })
        : "",
    [content],
  );

  return (
    <div className="prose prose-slate dark:prose-invert max-w-none prose-p:leading-relaxed prose-pre:p-0">
      <Interweave content={renderedContent as string} transform={transform} />
    </div>
  );
}
