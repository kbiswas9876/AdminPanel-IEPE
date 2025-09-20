import React from 'react'
import { BlockMath, InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface UniversalContentRendererProps {
  text: string
  className?: string
}

/**
 * Universal Content Renderer for LaTeX and plain text
 * Handles both inline math ($...$) and block math ($$...$$)
 * Preserves LaTeX line breaks (\\\) for KaTeX to process
 */
export function UniversalContentRenderer({ text, className }: UniversalContentRendererProps) {
  if (!text) return null

  // Split by block math first ($$...$$)
  const blockMathParts = text.split(/(\$\$[^$]+\$\$)/g)
  
  const renderPart = (part: string, index: number) => {
    // Check if this part is block math
    if (part.startsWith('$$') && part.endsWith('$$')) {
      const mathContent = part.slice(2, -2) // Remove $$ delimiters
      return (
        <div key={index} className="my-4">
          <BlockMath math={mathContent} />
        </div>
      )
    }
    
    // For non-block math parts, handle inline math
    const inlineMathParts = part.split(/(\$[^$]+\$)/g)
    
    return inlineMathParts.map((inlinePart, inlineIndex) => {
      if (inlinePart.startsWith('$') && inlinePart.endsWith('$')) {
        const mathContent = inlinePart.slice(1, -1) // Remove $ delimiters
        return (
          <InlineMath key={`${index}-${inlineIndex}`} math={mathContent} />
        )
      }
      return <span key={`${index}-${inlineIndex}`}>{inlinePart}</span>
    })
  }

  return (
    <div className={className}>
      {blockMathParts.map((part, index) => renderPart(part, index))}
    </div>
  )
}

export default UniversalContentRenderer
