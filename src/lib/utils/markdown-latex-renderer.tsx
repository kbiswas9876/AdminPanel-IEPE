'use client'

import React from 'react'
import { InlineMath, BlockMath } from 'react-katex'
import { sanitizeLatexForRendering } from '@/lib/utils/latex-sanitization'

interface MarkdownLatexRendererProps {
  text: string
  className?: string
  showImageControls?: boolean
}

// Enhanced markdown parser that handles both Markdown and LaTeX
const parseMarkdownToHTML = (text: string, showImageControls: boolean = true): string => {
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
    
    // Images (must be processed before links to avoid conflicts)
    .replace(/!\[([^\]]*)\]\(([^)]+)\)/g, (match, alt, src) => {
      if (showImageControls) {
        // Handle base64 URLs differently
        if (src.startsWith('data:')) {
          return `<div class="image-container my-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600 font-medium">📷 Image (Base64)</span>
              <div class="flex gap-1">
                <button onclick="resizeImage(this, 'small')" class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Small</button>
                <button onclick="resizeImage(this, 'medium')" class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Medium</button>
                <button onclick="resizeImage(this, 'large')" class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Large</button>
              </div>
            </div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex gap-1">
                <button onclick="alignImage(this, 'left')" class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">← Left</button>
                <button onclick="alignImage(this, 'center')" class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">↔ Center</button>
                <button onclick="alignImage(this, 'right')" class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Right →</button>
              </div>
              <div class="flex gap-1">
                <button onclick="rotateImage(this, '90')" class="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200">+90°</button>
                <button onclick="rotateImage(this, '180')" class="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200">+180°</button>
                <button onclick="rotateImage(this, '-90')" class="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200">-90°</button>
                <button onclick="resetRotation(this)" class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Reset</button>
              </div>
            </div>
            <div class="text-center">
              <img src="${src}" alt="${alt}" class="max-w-full h-auto rounded shadow-sm mx-auto" style="max-height: 300px; object-fit: contain;" />
            </div>
          </div>`
        } else {
          return `<div class="image-container my-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
            <div class="flex items-center justify-between mb-2">
              <span class="text-sm text-gray-600 font-medium">📷 Image</span>
              <div class="flex gap-1">
                <button onclick="resizeImage(this, 'small')" class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Small</button>
                <button onclick="resizeImage(this, 'medium')" class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Medium</button>
                <button onclick="resizeImage(this, 'large')" class="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded hover:bg-blue-200">Large</button>
              </div>
            </div>
            <div class="flex items-center justify-between mb-2">
              <div class="flex gap-1">
                <button onclick="alignImage(this, 'left')" class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">← Left</button>
                <button onclick="alignImage(this, 'center')" class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">↔ Center</button>
                <button onclick="alignImage(this, 'right')" class="px-2 py-1 text-xs bg-green-100 text-green-700 rounded hover:bg-green-200">Right →</button>
              </div>
              <div class="flex gap-1">
                <button onclick="rotateImage(this, '90')" class="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200">+90°</button>
                <button onclick="rotateImage(this, '180')" class="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200">+180°</button>
                <button onclick="rotateImage(this, '-90')" class="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded hover:bg-purple-200">-90°</button>
                <button onclick="resetRotation(this)" class="px-2 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200">Reset</button>
              </div>
            </div>
            <div class="text-center">
              <img src="${src}" alt="${alt}" class="max-w-full h-auto rounded shadow-sm mx-auto" style="max-height: 300px; object-fit: contain;" />
            </div>
          </div>`
        }
      } else {
        // Simple image without controls
        return `<img src="${src}" alt="${alt}" class="max-w-full h-auto rounded-lg shadow-sm my-3" style="max-height: 400px; object-fit: contain;" />`
      }
    })
    
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

export function MarkdownLatexRenderer({ text, className, showImageControls = true }: MarkdownLatexRendererProps) {
  if (!text) return null

  // Add resize function to window if not already added
  if (typeof window !== 'undefined' && !(window as any).resizeImage) {
    (window as any).resizeImage = (button: HTMLElement, size: string) => {
      const container = button.closest('.image-container')
      if (!container) return
      
      const img = container.querySelector('img')
      if (!img) return
      
      // Remove existing size classes
      img.classList.remove('w-32', 'w-48', 'w-64', 'w-96', 'w-full')
      
      // Add new size class
      switch (size) {
        case 'small':
          img.classList.add('w-32')
          break
        case 'medium':
          img.classList.add('w-48')
          break
        case 'large':
          img.classList.add('w-64')
          break
        default:
          img.classList.add('w-full')
      }
      
      // Update button states
      container.querySelectorAll('button').forEach(btn => {
        btn.classList.remove('bg-blue-200', 'text-blue-800')
        btn.classList.add('bg-blue-100', 'text-blue-700')
      })
      button.classList.remove('bg-blue-100', 'text-blue-700')
      button.classList.add('bg-blue-200', 'text-blue-800')
    }

    // Add alignment function
    (window as any).alignImage = (button: HTMLElement, alignment: string) => {
      const container = button.closest('.image-container')
      if (!container) return
      
      const imgContainer = container.querySelector('.text-center')
      if (!imgContainer) return
      
      const img = container.querySelector('img')
      if (!img) return
      
      // Remove existing alignment classes
      imgContainer.classList.remove('text-left', 'text-center', 'text-right')
      img.classList.remove('ml-0', 'mx-auto', 'mr-0')
      
      // Add new alignment
      switch (alignment) {
        case 'left':
          imgContainer.classList.add('text-left')
          img.classList.add('ml-0')
          break
        case 'center':
          imgContainer.classList.add('text-center')
          img.classList.add('mx-auto')
          break
        case 'right':
          imgContainer.classList.add('text-right')
          img.classList.add('mr-0')
          break
      }
      
      // Update button states
      container.querySelectorAll('button').forEach(btn => {
        if (btn.textContent?.includes('Left') || btn.textContent?.includes('Center') || btn.textContent?.includes('Right')) {
          btn.classList.remove('bg-green-200', 'text-green-800')
          btn.classList.add('bg-green-100', 'text-green-700')
        }
      })
      button.classList.remove('bg-green-100', 'text-green-700')
      button.classList.add('bg-green-200', 'text-green-800')
    }

    // Add rotation function
    (window as any).rotateImage = (button: HTMLElement, degrees: string) => {
      const container = button.closest('.image-container')
      if (!container) return
      
      const img = container.querySelector('img')
      if (!img) return
      
      // Get current rotation from existing transform
      const currentTransform = img.style.transform || ''
      const currentRotation = currentTransform.match(/rotate\((-?\d+)deg\)/)
      const currentDegrees = currentRotation ? parseInt(currentRotation[1]) : 0
      
      // Add new rotation to current rotation
      const newDegrees = currentDegrees + parseInt(degrees)
      img.style.transform = `rotate(${newDegrees}deg)`
      
      // Update button states
      container.querySelectorAll('button').forEach(btn => {
        if (btn.textContent?.includes('°')) {
          btn.classList.remove('bg-purple-200', 'text-purple-800')
          btn.classList.add('bg-purple-100', 'text-purple-700')
        }
      })
      button.classList.remove('bg-purple-100', 'text-purple-700')
      button.classList.add('bg-purple-200', 'text-purple-800')
    }

    // Add reset rotation function
    (window as any).resetRotation = (button: HTMLElement) => {
      const container = button.closest('.image-container')
      if (!container) return
      
      const img = container.querySelector('img')
      if (!img) return
      
      // Reset rotation to 0 degrees
      img.style.transform = 'rotate(0deg)'
      
      // Update button states
      container.querySelectorAll('button').forEach(btn => {
        if (btn.textContent?.includes('°') || btn.textContent?.includes('Reset')) {
          btn.classList.remove('bg-purple-200', 'text-purple-800', 'bg-red-200', 'text-red-800')
          btn.classList.add('bg-purple-100', 'text-purple-700', 'bg-red-100', 'text-red-700')
        }
      })
      button.classList.remove('bg-red-100', 'text-red-700')
      button.classList.add('bg-red-200', 'text-red-800')
    }
  }

  // Check if the text already contains HTML tags
  const isHTML = /<[^>]+>/.test(text)
  
  if (isHTML) {
    // If it's already HTML, render it directly with LaTeX processing
    const parts = splitIntoParts(text)
    
    return (
      <div className={className} style={{ whiteSpace: 'pre-wrap' }}>
        {parts.map((part, index) => {
          if (part.type === 'block') {
            return <BlockMath key={index} math={part.content} />
          } else if (part.type === 'inline') {
            return <InlineMath key={index} math={part.content} />
          } else {
            // Render HTML directly
            return (
              <span 
                key={index} 
                dangerouslySetInnerHTML={{ __html: part.content }}
              />
            )
          }
        })}
      </div>
    )
  } else {
    // If it's Markdown, process it normally
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
            const htmlContent = parseMarkdownToHTML(part.content, showImageControls)
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
}

// Helper function to check if text contains LaTeX
export function containsLatex(text: string): boolean {
  return /\$[\s\S]*?\$/.test(text)
}

// Helper function to check if text contains Markdown
export function containsMarkdown(text: string): boolean {
  return /(\*\*.*?\*\*|\*.*?\*|`.*?`|^#{1,6}\s|^[-*+]\s|^\d+\.\s)/m.test(text)
}

