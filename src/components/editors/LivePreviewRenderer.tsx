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
 * Handles both HTML content and LaTeX math expressions
 */
export function LivePreviewRenderer({ content, className }: LivePreviewRendererProps) {
  if (!content) return null

  // Process content to extract and render LaTeX math expressions
  const processContent = (htmlContent: string) => {
    console.log('=== LivePreviewRenderer Debug ===')
    console.log('Input content:', htmlContent)
    console.log('Content type:', typeof htmlContent)
    console.log('Contains $:', htmlContent.includes('$'))
    console.log('Contains \\frac:', htmlContent.includes('\\frac'))
    console.log('Contains \\dfrac:', htmlContent.includes('\\dfrac'))
    
    // First, decode HTML entities that might be encoding LaTeX
    const processedContent = htmlContent
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&amp;/g, '&')
      .replace(/&#92;/g, '\\')
      .replace(/&quot;/g, '"')
      .replace(/&#x27;/g, "'")
    
    console.log('After HTML decoding:', processedContent)
    
    // CRITICAL FIX: Handle both HTML content and raw LaTeX expressions
    // First, extract LaTeX expressions from HTML content
    const extractLatexFromHTML = (html: string) => {
      // Remove HTML tags but preserve content
      const textContent = html.replace(/<[^>]*>/g, '')
      console.log('Extracted text content:', textContent)
      return textContent
    }
    
    // Extract text content from HTML
    const textContent = extractLatexFromHTML(processedContent)
    
    // Enhanced LaTeX detection - handle both $...$ and $$...$$
    const latexRegex = /(\$\$[^$]+?\$\$|\$[^$]+?\$)/g
    const parts = textContent.split(latexRegex)
    
    console.log('Split parts:', parts)
    
    // Process each part
    return parts.map((part, index) => {
      // Handle display math $$...$$
      if (part.startsWith('$$') && part.endsWith('$$')) {
        const mathContent = part.slice(2, -2) // Remove $$ delimiters
        console.log('Processing display math:', mathContent)
        return (
          <BlockMath key={index} math={mathContent} />
        )
      }
      
      // Handle inline math $...$ - ALWAYS use InlineMath for inline rendering
      if (part.startsWith('$') && part.endsWith('$')) {
        const mathContent = part.slice(1, -1) // Remove $ delimiters
        console.log('Processing inline math:', mathContent)
        return (
          <InlineMath key={index} math={mathContent} />
        )
      }
      
      // Handle regular text content
      if (part.trim()) {
        return (
          <span key={index}>
            {part}
          </span>
        )
      }
      
      return null
    })
  }

  return (
    <div className={`live-preview-renderer prose prose-sm max-w-none ${className || ''}`}>
      {processContent(content)}
    </div>
  )
}

export default LivePreviewRenderer
