'use client'

import React from 'react'
import { InlineMath, BlockMath } from 'react-katex'
import { sanitizeLatexForRendering } from '@/lib/utils/latex-sanitization'

interface MarkdownLatexRendererProps {
  text: string
  className?: string
}

// Enhanced markdown parser that handles both Markdown and LaTeX
const parseMarkdownToHTML = (text: string): string => {
  if (!text) return ''
  
  let html = text
    // Headers (must be processed first)
    .replace(/^### (.*$)/gim, '<h3 class="text-lg font-semibold mb-2 mt-4 text-gray-800">$1</h3>')
    .replace(/^## (.*$)/gim, '<h2 class="text-xl font-semibold mb-3 mt-5 text-gray-800">$1</h2>')
    .replace(/^# (.*$)/gim, '<h1 class="text-2xl font-bold mb-4 mt-6 text-gray-800">$1</h1>')
    
    // Code blocks (must be processed before inline code)
    .replace(/```([\s\S]*?)```/g, '<pre class="bg-gray-100 p-4 rounded-lg overflow-x-auto my-3 border border-gray-200"><code class="text-sm font-mono text-gray-800">$1</code></pre>')
    
    // Bold and italic (process bold first to avoid conflicts)
    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-bold text-gray-900">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em class="italic text-gray-800">$1</em>')
    
    // Inline code
    .replace(/`(.*?)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800 border border-gray-200">$1</code>')
    
    // Links
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" class="text-blue-600 hover:text-blue-800 hover:underline font-medium" target="_blank" rel="noopener noreferrer">$1</a>')
    
    // Lists (unordered)
    .replace(/^[\s]*[-*+] (.*$)/gim, '<li class="ml-4 mb-1 text-gray-700">$1</li>')
    
    // Lists (ordered)
    .replace(/^[\s]*\d+\. (.*$)/gim, '<li class="ml-4 mb-1 text-gray-700">$1</li>')
    
    // Blockquotes
    .replace(/^> (.*$)/gim, '<blockquote class="border-l-4 border-blue-300 pl-4 py-2 my-2 bg-blue-50 text-gray-700 italic">$1</blockquote>')
    
    // Horizontal rules
    .replace(/^---$/gim, '<hr class="my-4 border-gray-300">')
    
    // Line breaks (convert double newlines to paragraphs)
    .replace(/\n\n/g, '</p><p class="mb-3 text-gray-700 leading-relaxed">')
    
    // Single line breaks
    .replace(/\n/g, '<br>')
  
  // Wrap in paragraph if not already wrapped
  if (!html.startsWith('<')) {
    html = `<p class="mb-3 text-gray-700 leading-relaxed">${html}</p>`
  }
  
  return html
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
    if (token.startsWith('$$') && token.endsWith('$$')) {
      parts.push({ type: 'block', content: token.slice(2, -2) })
    } else if (token.startsWith('$') && token.endsWith('$')) {
      parts.push({ type: 'inline', content: token.slice(1, -1) })
    } else if (token.startsWith('\\[') && token.endsWith('\\]')) {
      parts.push({ type: 'block', content: token.slice(2, -2) })
    } else if (token.startsWith('\\(') && token.endsWith('\\)')) {
      parts.push({ type: 'inline', content: token.slice(2, -2) })
    } else {
      parts.push({ type: 'text', content: token })
    }
    lastIndex = matchEnd
  }
  if (lastIndex < sanitizedInput.length) {
    parts.push({ type: 'text', content: sanitizedInput.slice(lastIndex) })
  }
  return parts
}

export function MarkdownLatexRenderer({ text, className }: MarkdownLatexRendererProps) {
  if (!text) return null

  const parts = splitIntoParts(text)
  
  return (
    <div className={className} style={{ whiteSpace: 'pre-wrap' }}>
      {parts.map((part, index) => {
        if (part.type === 'block') {
          return <BlockMath key={index} math={part.content} />
        } else if (part.type === 'inline') {
          return <InlineMath key={index} math={part.content} />
        } else {
          // Process Markdown in text parts
          const htmlContent = parseMarkdownToHTML(part.content)
          return (
            <span 
              key={index} 
              dangerouslySetInnerHTML={{ __html: htmlContent }}
            />
          )
        }
      })}
    </div>
  )
}

// Helper function to check if text contains LaTeX
export function containsLatex(text: string): boolean {
  return /\$[\s\S]*?\$/.test(text)
}

// Helper function to check if text contains Markdown
export function containsMarkdown(text: string): boolean {
  return /(\*\*.*?\*\*|\*.*?\*|`.*?`|^#{1,6}\s|^[-*+]\s|^\d+\.\s)/m.test(text)
}
