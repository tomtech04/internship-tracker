import ReactMarkdown from "react-markdown";

export function MarkdownView({ content }: { content: string }) {
  return (
    <div className="prose-notes text-sm text-foreground">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}
