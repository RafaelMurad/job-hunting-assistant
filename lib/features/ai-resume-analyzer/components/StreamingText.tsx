"use client";

/**
 * Streaming Text Component
 *
 * Displays text with a typewriter effect and blinking cursor.
 *
 * LEARNING EXERCISE: Study how the cursor animation works.
 */

interface StreamingTextProps {
  text: string;
  isStreaming: boolean;
  className?: string;
}

export function StreamingText({
  text,
  isStreaming,
  className = "",
}: StreamingTextProps) {
  return (
    <div className={`prose prose-nordic max-w-none ${className}`}>
      {/* Render markdown-like text */}
      <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
        {text}
        {/* Blinking cursor while streaming */}
        {isStreaming && (
          <span className="ml-0.5 inline-block h-4 w-2 animate-pulse bg-fjord-500" />
        )}
      </div>
    </div>
  );
}

/**
 * TODO Exercise 2: Enhanced Markdown Rendering
 *
 * Upgrade this component to properly render markdown:
 * 1. Install react-markdown: npm install react-markdown
 * 2. Replace the div with <ReactMarkdown>{text}</ReactMarkdown>
 * 3. Add syntax highlighting for code blocks
 *
 * @see https://github.com/remarkjs/react-markdown
 */
