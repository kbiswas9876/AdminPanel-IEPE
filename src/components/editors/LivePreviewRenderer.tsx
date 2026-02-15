'use client'

import React from 'react'
import { BlockMath, InlineMath } from 'react-katex'
import 'katex/dist/katex.min.css'

interface LivePreviewRendererProps {
  content: string
  className?: string
}

/**
 * Live Preview Renderer for TipTap HTML content with LaTeX math
 * Uses DOMParser to preserve HTML structure while processing LaTeX expressions
 * Fixes Issue #3: Images and line breaks are now preserved
 */
export function LivePreviewRenderer({ content, className }: LivePreviewRendererProps) {
  if (!content) return null

  // Process content using DOMParser to preserve HTML structure
  const processContent = (htmlContent: string) => {
    console.log('=== LivePreviewRenderer Debug ===')
    console.log('Input content:', htmlContent)
    
    // First, decode HTML entities that might be encoding LaTeX
    const processedContent = htmlContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&#92;/g, '\\')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
    
    console.log('After HTML decoding:', processedContent)
    
    // Use DOMParser to safely parse HTML without destroying structure
    const parser = new DOMParser()
    const doc = parser.parseFromString(processedContent, 'text/html')
    
    // Process the DOM tree to handle LaTeX expressions while preserving other elements
    const processNode = (node: Node, key: number = 0): React.ReactNode => {
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || ''
        
        // Check if this text node contains LaTeX expressions
        const latexRegex = /(\$\$[^$]+?\$\$|\$[^$]+?\$)/g
        const parts = text.split(latexRegex)
        
        if (parts.length === 1) {
          // No LaTeX found, return text as-is
          return text.trim() ? <span key={key}>{text}</span> : null
        }
        
        // LaTeX found, process each part
        return parts.map((part, index) => {
          // Handle display math $$...$$
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const mathContent = part.slice(2, -2) // Remove $$ delimiters
            console.log('Processing display math:', mathContent)
            return (
              <BlockMath key={`${key}-${index}`} math={mathContent} />
            )
          }
          
          // Handle inline math $...$
          if (part.startsWith('$') && part.endsWith('$')) {
            const mathContent = part.slice(1, -1) // Remove $ delimiters
            console.log('Processing inline math:', mathContent)
            return (
              <InlineMath key={`${key}-${index}`} math={mathContent} />
            )
          }
          
          // Handle regular text content
          if (part.trim()) {
            return (
              <span key={`${key}-${index}`}>
                {part}
              </span>
            )
          }
          
          return null
        })
      }
      
      if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as Element
        const tagName = element.tagName.toLowerCase()
        
        // Preserve all HTML elements while processing their children
        const children = Array.from(element.childNodes).map((child, index) => 
          processNode(child, key * 100 + index)
        ).filter(child => child !== null)
        
        // Handle different HTML elements
        switch (tagName) {
          case 'p':
            return <p key={key}>{children}</p>
          case 'div':
            return <div key={key}>{children}</div>
          case 'span':
            return <span key={key}>{children}</span>
          case 'img':
            // Preserve images completely
            const src = element.getAttribute('src') || ''
            const alt = element.getAttribute('alt') || ''
            const title = element.getAttribute('title') || ''
            return (
              <img 
                key={key}
                src={src}
                alt={alt}
                title={title}
                className="max-w-full h-auto"
              />
            )
          case 'br':
            return <br key={key} />
          case 'strong':
            return <strong key={key}>{children}</strong>
          case 'em':
            return <em key={key}>{children}</em>
          case 'u':
            return <u key={key}>{children}</u>
          case 'code':
            return <code key={key}>{children}</code>
          case 'pre':
            return <pre key={key}>{children}</pre>
          case 'blockquote':
            return <blockquote key={key}>{children}</blockquote>
          case 'ul':
            return <ul key={key}>{children}</ul>
          case 'ol':
            return <ol key={key}>{children}</ol>
          case 'li':
            return <li key={key}>{children}</li>
          default:
            // For unknown elements, render as div
            return <div key={key}>{children}</div>
        }
      }
      
      return null
    }
    
    // Process the body content
    const bodyContent = Array.from(doc.body.childNodes).map((child, index) => 
      processNode(child, index)
    ).filter(child => child !== null)
    
    console.log('Processed content:', bodyContent)
    return bodyContent
  }

  return (
    <div className={`live-preview-renderer prose prose-sm max-w-none ${className || ''}`}>
      {processContent(content)}
    </div>
  )
}

export default LivePreviewRenderer
