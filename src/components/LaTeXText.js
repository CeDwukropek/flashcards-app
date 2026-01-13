import React from "react";
import { InlineMath } from "react-katex";
import "katex/dist/katex.min.css";

/**
 * Renders text with inline LaTeX expressions
 * Supports $...$ for inline math
 */
export function LaTeXText({ children }) {
  if (!children || typeof children !== "string") {
    return children;
  }

  // Split by $ to identify math sections
  const parts = children.split(/(\$[^\$]+\$)/);

  return (
    <>
      {parts.map((part, idx) => {
        if (part.match(/^\$[^\$]+\$$/)) {
          // This is a math expression
          const mathContent = part.slice(1, -1); // Remove $ delimiters
          return <InlineMath key={idx} math={mathContent} />;
        }
        // Regular text
        return <span key={idx}>{part}</span>;
      })}
    </>
  );
}
