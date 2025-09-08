import katex from 'katex'

/**
 * Renders LaTeX expressions to HTML that can be used in PDF generation
 */
export function renderLatexToHTML(text: string): string {
  if (!text) return ''
  
  // Handle inline math expressions \( ... \) and $ ... $
  let processedText = text.replace(/\$([^$]+)\$/g, (match, expression) => {
    try {
      return katex.renderToString(expression, {
        displayMode: false,
        throwOnError: false,
        output: 'html'
      })
    } catch (error) {
      console.warn('LaTeX rendering error:', error)
      return expression // Fallback to original text
    }
  })
  
  // Handle display math expressions \[ ... \] and $$ ... $$
  processedText = processedText.replace(/\$\$([^$]+)\$\$/g, (match, expression) => {
    try {
      return katex.renderToString(expression, {
        displayMode: true,
        throwOnError: false,
        output: 'html'
      })
    } catch (error) {
      console.warn('LaTeX rendering error:', error)
      return expression // Fallback to original text
    }
  })
  
  // Handle \( ... \) expressions
  processedText = processedText.replace(/\\\(([^)]+)\\\)/g, (match, expression) => {
    try {
      return katex.renderToString(expression, {
        displayMode: false,
        throwOnError: false,
        output: 'html'
      })
    } catch (error) {
      console.warn('LaTeX rendering error:', error)
      return expression // Fallback to original text
    }
  })
  
  // Handle \[ ... \] expressions
  processedText = processedText.replace(/\\\[([^\]]+)\\\]/g, (match, expression) => {
    try {
      return katex.renderToString(expression, {
        displayMode: true,
        throwOnError: false,
        output: 'html'
      })
    } catch (error) {
      console.warn('LaTeX rendering error:', error)
      return expression // Fallback to original text
    }
  })
  
  return processedText
}

/**
 * Converts HTML with LaTeX to plain text for PDF rendering
 * This is a simplified version that extracts the mathematical content
 */
export function convertLatexToPlainText(text: string): string {
  if (!text) return ''
  
  // Handle common LaTeX patterns and convert to readable text
  let processedText = text
  
  // Handle fractions - more comprehensive patterns
  processedText = processedText.replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
  processedText = processedText.replace(/\{([^}]+)\}\/\{([^}]+)\}/g, '($1)/($2)')
  processedText = processedText.replace(/\\dfrac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
  processedText = processedText.replace(/\\tfrac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)')
  
  // Handle superscripts - more comprehensive
  processedText = processedText.replace(/\^(\d+)/g, '^$1')
  processedText = processedText.replace(/\^\{([^}]+)\}/g, '^$1')
  processedText = processedText.replace(/\^([a-zA-Z])/g, '^$1')
  
  // Handle subscripts - more comprehensive
  processedText = processedText.replace(/_(\d+)/g, '_$1')
  processedText = processedText.replace(/_\{([^}]+)\}/g, '_$1')
  processedText = processedText.replace(/_([a-zA-Z])/g, '_$1')
  
  // Handle square roots - more comprehensive
  processedText = processedText.replace(/\\sqrt\{([^}]+)\}/g, '√($1)')
  processedText = processedText.replace(/\\sqrt\[(\d+)\]\{([^}]+)\}/g, '^$1√($2)')
  processedText = processedText.replace(/\\sqrt\[([^]]+)\]\{([^}]+)\}/g, '^$1√($2)')
  
  // Handle common symbols
  processedText = processedText.replace(/\\alpha/g, 'α')
  processedText = processedText.replace(/\\beta/g, 'β')
  processedText = processedText.replace(/\\gamma/g, 'γ')
  processedText = processedText.replace(/\\delta/g, 'δ')
  processedText = processedText.replace(/\\epsilon/g, 'ε')
  processedText = processedText.replace(/\\pi/g, 'π')
  processedText = processedText.replace(/\\theta/g, 'θ')
  processedText = processedText.replace(/\\lambda/g, 'λ')
  processedText = processedText.replace(/\\mu/g, 'μ')
  processedText = processedText.replace(/\\sigma/g, 'σ')
  processedText = processedText.replace(/\\tau/g, 'τ')
  processedText = processedText.replace(/\\phi/g, 'φ')
  processedText = processedText.replace(/\\omega/g, 'ω')
  
  // Handle infinity
  processedText = processedText.replace(/\\infty/g, '∞')
  
  // Handle summation and integral symbols
  processedText = processedText.replace(/\\sum/g, '∑')
  processedText = processedText.replace(/\\int/g, '∫')
  processedText = processedText.replace(/\\prod/g, '∏')
  
  // Handle arrows
  processedText = processedText.replace(/\\rightarrow/g, '→')
  processedText = processedText.replace(/\\leftarrow/g, '←')
  processedText = processedText.replace(/\\leftrightarrow/g, '↔')
  
  // Handle set symbols
  processedText = processedText.replace(/\\in/g, '∈')
  processedText = processedText.replace(/\\notin/g, '∉')
  processedText = processedText.replace(/\\subset/g, '⊂')
  processedText = processedText.replace(/\\supset/g, '⊃')
  processedText = processedText.replace(/\\cup/g, '∪')
  processedText = processedText.replace(/\\cap/g, '∩')
  processedText = processedText.replace(/\\emptyset/g, '∅')
  
  // Handle logical symbols
  processedText = processedText.replace(/\\land/g, '∧')
  processedText = processedText.replace(/\\lor/g, '∨')
  processedText = processedText.replace(/\\neg/g, '¬')
  processedText = processedText.replace(/\\implies/g, '⇒')
  processedText = processedText.replace(/\\iff/g, '⇔')
  
  // Handle comparison symbols
  processedText = processedText.replace(/\\leq/g, '≤')
  processedText = processedText.replace(/\\geq/g, '≥')
  processedText = processedText.replace(/\\neq/g, '≠')
  processedText = processedText.replace(/\\approx/g, '≈')
  processedText = processedText.replace(/\\equiv/g, '≡')
  
  // Handle parentheses and brackets
  processedText = processedText.replace(/\\left\(/g, '(')
  processedText = processedText.replace(/\\right\)/g, ')')
  processedText = processedText.replace(/\\left\[/g, '[')
  processedText = processedText.replace(/\\right\]/g, ']')
  processedText = processedText.replace(/\\left\{/g, '{')
  processedText = processedText.replace(/\\right\}/g, '}')
  
  // Handle spaces
  processedText = processedText.replace(/\\,/g, ' ')
  processedText = processedText.replace(/\\;/g, ' ')
  processedText = processedText.replace(/\\!/g, '')
  processedText = processedText.replace(/\\quad/g, '    ')
  processedText = processedText.replace(/\\qquad/g, '        ')
  
  // Handle common mathematical functions
  processedText = processedText.replace(/\\sin/g, 'sin')
  processedText = processedText.replace(/\\cos/g, 'cos')
  processedText = processedText.replace(/\\tan/g, 'tan')
  processedText = processedText.replace(/\\log/g, 'log')
  processedText = processedText.replace(/\\ln/g, 'ln')
  processedText = processedText.replace(/\\exp/g, 'exp')
  
  // Handle limits
  processedText = processedText.replace(/\\lim/g, 'lim')
  processedText = processedText.replace(/\\lim_\{([^}]+)\}/g, 'lim_$1')
  
  // Handle common operators
  processedText = processedText.replace(/\\cdot/g, '·')
  processedText = processedText.replace(/\\times/g, '×')
  processedText = processedText.replace(/\\div/g, '÷')
  processedText = processedText.replace(/\\pm/g, '±')
  processedText = processedText.replace(/\\mp/g, '∓')
  
  // Handle text formatting
  processedText = processedText.replace(/\\text\{([^}]+)\}/g, '$1')
  processedText = processedText.replace(/\\textbf\{([^}]+)\}/g, '$1')
  processedText = processedText.replace(/\\textit\{([^}]+)\}/g, '$1')
  
  // Clean up any remaining LaTeX commands
  processedText = processedText.replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
  processedText = processedText.replace(/\\[a-zA-Z]+/g, '')
  
  // Clean up extra spaces
  processedText = processedText.replace(/\s+/g, ' ').trim()
  
  return processedText
}

/**
 * Renders LaTeX content for PDF with proper formatting
 */
export function renderMathContent(text: string): string {
  if (!text) return ''
  
  let processedText = convertLatexToPlainText(text)
  
  // Additional processing for better PDF readability
  // Handle inline math expressions $...$ and \(...\)
  processedText = processedText.replace(/\$([^$]+)\$/g, '$1')
  processedText = processedText.replace(/\\\(([^)]+)\\\)/g, '$1')
  
  // Handle display math expressions $$...$$ and \[...\]
  processedText = processedText.replace(/\$\$([^$]+)\$\$/g, '$1')
  processedText = processedText.replace(/\\\[([^\]]+)\\\]/g, '$1')
  
  // Clean up any remaining LaTeX commands
  processedText = processedText.replace(/\\[a-zA-Z]+\{[^}]*\}/g, '')
  processedText = processedText.replace(/\\[a-zA-Z]+/g, '')
  
  // Final cleanup
  processedText = processedText.replace(/\s+/g, ' ').trim()
  
  return processedText
}
