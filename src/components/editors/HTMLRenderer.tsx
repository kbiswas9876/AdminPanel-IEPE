'use client'

import React from 'react'
import 'katex/dist/katex.min.css'

interface HTMLRendererProps {
  content: string
  className?: string
}

export function HTMLRenderer({ content, className }: HTMLRendererProps) {
  // Process content to handle line breaks and LaTeX
  const processContent = (htmlContent: string) => {
    console.log('=== HTMLRenderer Data Flow Debug ===')
    console.log('Raw input from Supabase:', htmlContent)
    console.log('Content type:', typeof htmlContent)
    console.log('Content length:', htmlContent.length)
    console.log('Contains \\\\:', htmlContent.includes('\\\\'))
    console.log('Contains \\:', htmlContent.includes('\\'))
    console.log('Contains whitespace:', htmlContent.includes(' '))
    console.log('Contains newlines:', htmlContent.includes('\n'))
    // Handle LaTeX math expressions
    let processedContent = htmlContent
    
    // Process display math $$...$$ first (to avoid conflicts with inline math)
    processedContent = processedContent.replace(/\$\$([^$]+)\$\$/g, (match, formula) => {
      try {
        if (typeof window !== 'undefined' && window.katex) {
          // Preserve line breaks within math for KaTeX to process
          const processedFormula = formula
          return window.katex.renderToString(processedFormula, {
            displayMode: true,
            throwOnError: false,
            errorColor: '#cc0000',
          })
        }
        return match // Fallback to original if katex not available
      } catch (error) {
        console.error('Math rendering error:', error)
        return `<span class="math-error">Error: ${formula}</span>`
      }
    })
    
    // Process inline math $...$
    processedContent = processedContent.replace(/\$([^$]+)\$/g, (match, formula) => {
      try {
        if (typeof window !== 'undefined' && window.katex) {
          // Preserve line breaks within math for KaTeX to process
          const processedFormula = formula
          return window.katex.renderToString(processedFormula, {
            displayMode: false,
            throwOnError: false,
            errorColor: '#cc0000',
          })
        }
        return match // Fallback to original if katex not available
      } catch (error) {
        console.error('Math rendering error:', error)
        return `<span class="math-error">Error: ${formula}</span>`
      }
    })
    
    // Handle LaTeX line breaks with custom vertical spacing
    // Match patterns like \\[4pt], \\[6pt], \\[8pt], etc.
    // But only outside of math environments
    processedContent = processedContent.replace(/\\\\\[([^\]]+)\]/g, (match, spacing) => {
      // Convert LaTeX spacing to CSS
      const spacingValue = spacing.trim()
      let cssSpacing = '0.5em' // default spacing
      
      if (spacingValue.includes('pt')) {
        const ptValue = parseFloat(spacingValue.replace('pt', ''))
        cssSpacing = `${ptValue * 0.75}px` // Convert pt to px (1pt ≈ 0.75px)
      } else if (spacingValue.includes('em')) {
        cssSpacing = spacingValue
      } else if (spacingValue.includes('ex')) {
        cssSpacing = spacingValue
      } else if (spacingValue.includes('cm')) {
        const cmValue = parseFloat(spacingValue.replace('cm', ''))
        cssSpacing = `${cmValue * 37.8}px` // Convert cm to px
      } else if (spacingValue.includes('mm')) {
        const mmValue = parseFloat(spacingValue.replace('mm', ''))
        cssSpacing = `${mmValue * 3.78}px` // Convert mm to px
      } else if (spacingValue.includes('in')) {
        const inValue = parseFloat(spacingValue.replace('in', ''))
        cssSpacing = `${inValue * 96}px` // Convert inches to px
      }
      
      return `<br class="latex-line-break" style="margin: ${cssSpacing} 0;">`
    })
    
    // Handle simple LaTeX line breaks \\ - clean line break without showing backslashes
    // But only outside of math environments (math environments are processed first)
    processedContent = processedContent.replace(/\\\\/g, '<br class="latex-line-break">')
    
    // Also handle HTML-encoded backslashes
    processedContent = processedContent.replace(/&#92;&#92;/g, '<br class="latex-line-break">')
    processedContent = processedContent.replace(/&amp;#92;&amp;#92;/g, '<br class="latex-line-break">')
    
    // Handle regular line breaks
    processedContent = processedContent.replace(/\n/g, '<br>')
    
    console.log('=== HTMLRenderer Final Output ===')
    console.log('Final processed content:', processedContent)
    console.log('Final content length:', processedContent.length)
    console.log('Final contains \\\\:', processedContent.includes('\\\\'))
    console.log('Final contains \\:', processedContent.includes('\\'))
    console.log('Final contains <br>:', processedContent.includes('<br>'))
    console.log('Final contains latex-line-break:', processedContent.includes('latex-line-break'))
    console.log('=== End HTMLRenderer Debug ===')
    
    return processedContent
  }

  const processedContent = processContent(content)

  return (
    <div 
      className={`html-renderer prose prose-lg max-w-none ${className || ''}`}
      dangerouslySetInnerHTML={{ __html: processedContent }}
    />
  )
}
