'use client'

import React, { useEffect, useRef } from 'react'
import 'katex/dist/katex.min.css'

interface EnhancedHTMLRendererProps {
  content: string
  className?: string
}

declare global {
  interface Window {
    katex: {
      renderToString: (formula: string, options: KatexOptions) => string
    }
  }
}

interface KatexOptions {
  displayMode: boolean
  throwOnError: boolean
  errorColor: string
}

export function EnhancedHTMLRenderer({ content, className }: EnhancedHTMLRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    const renderMath = () => {
      if (typeof window !== 'undefined' && window.katex) {
        // Find all math nodes and render them
        const mathNodes = containerRef.current?.querySelectorAll('[data-math]')
        mathNodes?.forEach(node => {
          const formula = node.getAttribute('data-formula')
          const display = node.getAttribute('data-display') === 'true'
          
          if (formula) {
            try {
              const html = window.katex.renderToString(formula, {
                displayMode: display,
                throwOnError: false,
                errorColor: '#cc0000',
              })
              node.innerHTML = html
            } catch (error) {
              console.error('Math rendering error:', error)
              node.innerHTML = `<span class="math-error">Error: ${formula}</span>`
            }
          }
        })
      }
    }

    // Process content to handle LaTeX line breaks and math
    const processContent = (htmlContent: string) => {
      console.log('=== EnhancedHTMLRenderer Data Flow Debug ===')
      console.log('Raw input from Supabase:', htmlContent)
      console.log('Content type:', typeof htmlContent)
      console.log('Content length:', htmlContent.length)
      console.log('Contains \\\\:', htmlContent.includes('\\\\'))
      console.log('Contains \\:', htmlContent.includes('\\'))
      console.log('Contains whitespace:', htmlContent.includes(' '))
      console.log('Contains newlines:', htmlContent.includes('\n'))
      
      let processedContent = htmlContent
      
      // First, process math environments to preserve LaTeX line breaks within them
      // Process display math $$...$$ first (to avoid conflicts with inline math)
      processedContent = processedContent.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
        // Preserve LaTeX syntax exactly as stored in database
        // The formula already has proper LaTeX syntax with \\ for line breaks
        // Let KaTeX handle the line breaks properly
        return `<div data-math data-formula="${formula}" data-display="true" class="math-display"></div>`
      })
      
      // Process inline math $...$
      processedContent = processedContent.replace(/\$([^$]+)\$/g, (match, formula) => {
        // Preserve LaTeX syntax exactly as stored in database
        // The formula already has proper LaTeX syntax with \\ for line breaks
        // Let KaTeX handle the line breaks properly
        return `<span data-math data-formula="${formula}" data-display="false"></span>`
      })
      
      // Handle LaTeX line breaks outside of math environments
      // Only process \\ that are not within math environments
      processedContent = processedContent.replace(/\\\\\[([^\]]+)\]/g, (match, spacing) => {
        const spacingValue = spacing.trim()
        let cssSpacing = '0.5em'
        
        if (spacingValue.includes('pt')) {
          const ptValue = parseFloat(spacingValue.replace('pt', ''))
          cssSpacing = `${ptValue * 0.75}px`
        } else if (spacingValue.includes('em')) {
          cssSpacing = spacingValue
        } else if (spacingValue.includes('ex')) {
          cssSpacing = spacingValue
        }
        
        return `<br class="latex-line-break" style="margin: ${cssSpacing} 0;">`
      })
      
      // Handle simple LaTeX line breaks outside of math environments
      processedContent = processedContent.replace(/\\\\/g, '<br class="latex-line-break">')
      
      console.log('=== EnhancedHTMLRenderer Final Output ===')
      console.log('Final processed content:', processedContent)
      console.log('Final content length:', processedContent.length)
      console.log('Final contains \\\\:', processedContent.includes('\\\\'))
      console.log('Final contains \\:', processedContent.includes('\\'))
      console.log('Final contains <br>:', processedContent.includes('<br>'))
      console.log('Final contains latex-line-break:', processedContent.includes('latex-line-break'))
      console.log('=== End EnhancedHTMLRenderer Debug ===')
      
      return processedContent
    }

    if (containerRef.current) {
      containerRef.current.innerHTML = processContent(content)
      
      // Render math after a short delay
      const timer = setTimeout(renderMath, 100)
      return () => clearTimeout(timer)
    }
  }, [content])

  return (
    <div 
      ref={containerRef}
      className={`enhanced-html-renderer prose prose-lg max-w-none ${className || ''}`}
    />
  )
}
