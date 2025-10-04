import React, { useEffect, useRef } from 'react'
import { BlockMath, InlineMath } from 'react-katex'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface UniversalContentRendererProps {
  text: string
  className?: string
  forceRerender?: boolean // Add a prop to force re-render when needed
}

/**
 * Universal Content Renderer for LaTeX, HTML, and plain text
 * Handles both inline math ($...$) and block math ($$...$$)
 * Also handles HTML content safely
 */
export function UniversalContentRenderer({ text, className, forceRerender }: UniversalContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!containerRef.current) return

    // Add a delay to ensure DOM is fully rendered and force re-render if needed
    const timer = setTimeout(() => {
      // Find all elements with data-math attribute and render them with KaTeX
      const mathElements = containerRef.current?.querySelectorAll('[data-math]')
      
      // If no math elements found, try again after a longer delay
      if (!mathElements || mathElements.length === 0) {
        const retryTimer = setTimeout(() => {
          const retryElements = containerRef.current?.querySelectorAll('[data-math]')
          retryElements?.forEach((element) => {
            const mathContent = element.getAttribute('data-math')
            if (mathContent) {
              try {
                const isBlock = element.classList.contains('katex-block')
                const rendered = katex.renderToString(mathContent, {
                  displayMode: isBlock,
                  throwOnError: false,
                })
                element.innerHTML = rendered
              } catch (error) {
                console.error('KaTeX rendering error (retry):', error)
                element.textContent = mathContent
              }
            }
          })
        }, 200)
        
        return () => clearTimeout(retryTimer)
      }
      
      mathElements?.forEach((element) => {
        const mathContent = element.getAttribute('data-math')
        if (mathContent) {
          try {
            const isBlock = element.classList.contains('katex-block')
            const rendered = katex.renderToString(mathContent, {
              displayMode: isBlock,
              throwOnError: false,
            })
            element.innerHTML = rendered
          } catch (error) {
            console.error('KaTeX rendering error:', error)
            element.textContent = mathContent
          }
        }
      })
    }, 150) // Increased delay to ensure DOM is ready

    return () => clearTimeout(timer)
  }, [text, forceRerender]) // Include forceRerender in dependencies to trigger re-render

  if (!text) return null

  // Check if content contains HTML tags and LaTeX math
  const hasHtmlTags = /<[^>]*>/g.test(text)
  const hasLatexMath = /\$[^$]+\$/g.test(text)
  
  // If content has both HTML and LaTeX, process them together
  if (hasHtmlTags && hasLatexMath) {
    let processedText = text
    
    // Replace LaTeX math with placeholders that will be rendered by KaTeX
    processedText = processedText.replace(/\$[^$]+\$/g, (match) => {
      const mathContent = match.slice(1, -1) // Remove $ delimiters
      return `<span class="katex-inline" data-math="${mathContent}"></span>`
    })
    
    processedText = processedText.replace(/\$\$[^$]+\$\$/g, (match) => {
      const mathContent = match.slice(2, -2) // Remove $$ delimiters
      return `<div class="katex-block" data-math="${mathContent}"></div>`
    })
    
    return (
      <div 
        ref={containerRef}
        className={className}
        dangerouslySetInnerHTML={{ __html: processedText }}
      />
    )
  }
  
  if (hasHtmlTags && !hasLatexMath) {
    // For HTML content without LaTeX, render it safely
    return (
      <div 
        className={className}
        dangerouslySetInnerHTML={{ __html: text }}
      />
    )
  }

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
