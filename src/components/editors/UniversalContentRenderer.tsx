import React, { useEffect, useRef, useState } from 'react'
import { BlockMath, InlineMath } from 'react-katex'
import katex from 'katex'
import 'katex/dist/katex.min.css'

interface UniversalContentRendererProps {
  text: string
  className?: string
  forceRerender?: boolean | number // Add a prop to force re-render when needed
}

/**
 * Universal Content Renderer for LaTeX, HTML, and plain text
 * Handles both inline math ($...$) and block math ($$...$$)
 * Also handles HTML content safely
 */
export function UniversalContentRenderer({ text, className, forceRerender }: UniversalContentRendererProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Fixes Issue #1: Use transitionend event to gate LaTeX processing during animations
  useEffect(() => {
    if (!containerRef.current) return

    const container = containerRef.current
    
    // Check if the container or any parent is transitioning
    const checkForTransition = () => {
      const computedStyle = window.getComputedStyle(container)
      const transitionDuration = computedStyle.transitionDuration
      const animationDuration = computedStyle.animationDuration
      
      // Check if there are any transitions or animations
      const hasTransition = transitionDuration !== '0s' && transitionDuration !== ''
      const hasAnimation = animationDuration !== '0s' && animationDuration !== ''
      
      if (hasTransition || hasAnimation) {
        setIsTransitioning(true)
        
        // Listen for transitionend events
        const handleTransitionEnd = (event: TransitionEvent) => {
          // Only listen to transitions on the container or its children
          if (event.target === container || container.contains(event.target as Node)) {
            setIsTransitioning(false)
            container.removeEventListener('transitionend', handleTransitionEnd)
          }
        }
        
        container.addEventListener('transitionend', handleTransitionEnd)
        
        // Fallback: clear transitioning state after max transition duration
        const maxDuration = Math.max(
          parseFloat(transitionDuration) * 1000 || 0,
          parseFloat(animationDuration) * 1000 || 0
        )
        
        if (maxDuration > 0) {
          const fallbackTimer = setTimeout(() => {
            setIsTransitioning(false)
          }, maxDuration + 100) // Add small buffer
          
          return () => clearTimeout(fallbackTimer)
        }
      }
      
      return undefined
    }

    const cleanup = checkForTransition()
    return cleanup
  }, [text, forceRerender])

  useEffect(() => {
    if (!containerRef.current || isTransitioning) return

    // Process LaTeX only when not transitioning
    const processLatex = () => {
      const mathElements = containerRef.current?.querySelectorAll('[data-math]')
      
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
    }

    // Small delay to ensure DOM is ready
    const timer = setTimeout(processLatex, 50)
    return () => clearTimeout(timer)
  }, [text, forceRerender, isTransitioning]) // Include isTransitioning in dependencies

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
