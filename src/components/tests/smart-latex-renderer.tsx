'use client'

import React from 'react'
import { InlineMath, BlockMath } from 'react-katex'
import { sanitizeLatexForRendering } from '@/lib/utils/latex-sanitization'

interface SmartLatexRendererProps {
  text: string
  className?: string
}

// Splits mixed content into text and LaTeX parts (inline: $...$, \(...\); block: $$...$$, \[...\])
function splitIntoParts(input: string): Array<{ type: 'text' | 'inline' | 'block'; content: string }> {
  if (!input) return [{ type: 'text', content: '' }]
  
  // Sanitize the input for rendering (convert \\ to \)
  const sanitizedInput = sanitizeLatexForRendering(input) || ''
  const pattern = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g
  const parts: Array<{ type: 'text' | 'inline' | 'block'; content: string }> = []
  let lastIndex = 0
  let match: RegExpExecArray | null
  const regex = new RegExp(pattern)
  regex.lastIndex = 0
  while ((match = pattern.exec(sanitizedInput)) !== null) {
    const matchStart = match.index
    const matchEnd = match.index + match[0].length
    if (matchStart > lastIndex) {
      parts.push({ type: 'text', content: sanitizedInput.slice(lastIndex, matchStart) })
    }
    const token = match[0]
    if (token.startsWith('$$')) {
      parts.push({ type: 'block', content: token.slice(2, -2) })
    } else if (token.startsWith('$')) {
      parts.push({ type: 'inline', content: token.slice(1, -1) })
    } else if (token.startsWith('\\[')) {
      parts.push({ type: 'block', content: token.slice(2, -2) })
    } else if (token.startsWith('\\(')) {
      parts.push({ type: 'inline', content: token.slice(2, -2) })
    }
    lastIndex = matchEnd
  }
  if (lastIndex < sanitizedInput.length) {
    parts.push({ type: 'text', content: sanitizedInput.slice(lastIndex) })
  }
  return parts
}

export function SmartLatexRenderer({ text, className }: SmartLatexRendererProps) {
  const parts = splitIntoParts(text)
  return (
    <span className={className}>
      {parts.map((p, idx) => {
        if (p.type === 'inline') return <InlineMath key={idx} math={p.content} />
        if (p.type === 'block') return <BlockMath key={idx} math={p.content} />
        return (
          <span key={idx} className="whitespace-pre-wrap">{p.content}</span>
        )
      })}
    </span>
  )
}

export default SmartLatexRenderer


