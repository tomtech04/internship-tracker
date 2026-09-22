import ReactMarkdown from "react-markdown";

export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="prose-notes text-foreground text-sm">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
