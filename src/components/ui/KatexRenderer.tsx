'use client'

import React from 'react'
import 'katex/dist/katex.min.css'
import { InlineMath, BlockMath } from 'react-katex'

interface KatexRendererProps {
  content: string
  className?: string
  errorClassName?: string
}

export default function KatexRenderer({ 
  content, 
  className = '', 
  errorClassName = 'text-red-500 text-sm' 
}: KatexRendererProps) {
  if (!content || typeof content !== 'string') {
    return <span className={className}>[No content]</span>
  }

  try {
    // Check if content contains HTML tags (images, formatting, etc.)
    const hasHTML = /<[^>]+>/.test(content)
    
    if (hasHTML) {
      // Content contains HTML - render it safely while also processing LaTeX
      // First, split by HTML tags to separate HTML from text/LaTeX
      const htmlAndTextParts = content.split(/(<[^>]+>)/g)
      
      return (
        <span className={className}>
          {htmlAndTextParts.map((part, index) => {
            // Skip empty parts
            if (!part.trim()) return null
            
            // If it's an HTML tag, render it using dangerouslySetInnerHTML
            if (part.startsWith('<') && part.endsWith('>')) {
              return (
                <span 
                  key={index} 
                  dangerouslySetInnerHTML={{ __html: part }}
                />
              )
            }
            
            // Otherwise, process for LaTeX
            const latexParts = part.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/g)
            return latexParts.map((latexPart, latexIndex) => {
              if (!latexPart.trim()) return null
              
              // Handle block math ($$...$$)
              if (latexPart.startsWith('$$') && latexPart.endsWith('$$')) {
                const mathContent = latexPart.slice(2, -2).trim()
                if (!mathContent) return null
                
                return (
                  <BlockMath
                    key={`${index}-${latexIndex}`}
                    math={mathContent}
                    errorColor="#ef4444"
                    renderError={(error) => (
                      <span className={errorClassName}>
                        [Invalid Formula: {error.name}]
                      </span>
                    )}
                  />
                )
              }
              
              // Handle inline math ($...$)
              if (latexPart.startsWith('$') && latexPart.endsWith('$') && !latexPart.startsWith('$$')) {
                const mathContent = latexPart.slice(1, -1).trim()
                if (!mathContent) return null
                
                return (
                  <InlineMath
                    key={`${index}-${latexIndex}`}
                    math={mathContent}
                    errorColor="#ef4444"
                    renderError={(error) => (
                      <span className={errorClassName}>
                        [Invalid Formula: {error.name}]
                      </span>
                    )}
                  />
                )
              }
              
              // Regular text
              return <span key={`${index}-${latexIndex}`}>{latexPart}</span>
            })
          })}
        </span>
      )
    }
    
    // No HTML detected - process LaTeX only (original logic)
    const parts = content.split(/(\$\$[\s\S]*?\$\$|\$[^$]*?\$)/g)
    
    return (
      <span className={className}>
        {parts.map((part, index) => {
          // Skip empty parts
          if (!part.trim()) return null
          
          // Handle block math ($$...$$)
          if (part.startsWith('$$') && part.endsWith('$$')) {
            const mathContent = part.slice(2, -2).trim()
            if (!mathContent) return null
            
            return (
              <BlockMath
                key={index}
                math={mathContent}
                errorColor="#ef4444"
                renderError={(error) => (
                  <span className={errorClassName}>
                    [Invalid Formula: {error.name}]
                  </span>
                )}
              />
            )
          }
          
          // Handle inline math ($...$)
          if (part.startsWith('$') && part.endsWith('$') && !part.startsWith('$$')) {
            const mathContent = part.slice(1, -1).trim()
            if (!mathContent) return null
            
            return (
              <InlineMath
                key={index}
                math={mathContent}
                errorColor="#ef4444"
                renderError={(error) => (
                  <span className={errorClassName}>
                    [Invalid Formula: {error.name}]
                  </span>
                )}
              />
            )
          }
          
          // Regular text (no LaTeX)
          return <span key={index}>{part}</span>
        })}
      </span>
    )
  } catch (error) {
    // Fallback for any unexpected errors
    return (
      <span className={className}>
        <span className={errorClassName}>[Rendering Error]</span>
        <span className="ml-2" dangerouslySetInnerHTML={{ __html: content }} />
      </span>
    )
  }
}

// Utility function to check if content contains LaTeX
export function hasLatex(content: string): boolean {
  if (!content || typeof content !== 'string') return false
  return /\$[\s\S]*?\$/.test(content)
}

// Utility function to extract LaTeX from content
export function extractLatex(content: string): string[] {
  if (!content || typeof content !== 'string') return []
  
  const matches = content.match(/\$[\s\S]*?\$/g) || []
  return matches.map(match => match.slice(1, -1).trim()).filter(Boolean)
}
