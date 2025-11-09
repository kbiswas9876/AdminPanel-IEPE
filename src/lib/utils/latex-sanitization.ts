/**
 * Simple LaTeX Sanitization Utilities
 * 
 * This module handles the conflict between JSON escaping rules (\)
 * and KaTeX rendering rules (\) for LaTeX content.
 */

/**
 * Intelligently processes LaTeX text from CSV imports
 * Handles the conflict between CSV parsing (needs \\ for proper parsing) 
 * and LaTeX rendering (needs \ for correct rendering)
 * 
 * @param text - The LaTeX text from CSV import
 * @returns The processed text ready for LaTeX rendering and storage
 */
export function processLatexFromCSV(text: string | null | undefined): string | null | undefined {
  if (!text) return text
  
  let processed = text
  
  // Simple approach: Replace double backslashes with single backslashes
  // This handles the CSV escaping issue where \\ is used for proper CSV parsing
  // but we need \ for LaTeX rendering
  
  // Pattern 1: Handle common LaTeX commands with double backslashes
  const latexCommands = [
    'frac', 'sqrt', 'sum', 'int', 'lim', 'sin', 'cos', 'tan', 'log', 'ln',
    'begin', 'end', 'left', 'right', 'text', 'textbf', 'textit', 'emph',
    'alpha', 'beta', 'gamma', 'delta', 'epsilon', 'zeta', 'eta', 'theta',
    'iota', 'kappa', 'lambda', 'mu', 'nu', 'xi', 'omicron', 'pi', 'rho',
    'sigma', 'tau', 'upsilon', 'phi', 'chi', 'psi', 'omega',
    'Gamma', 'Delta', 'Theta', 'Lambda', 'Xi', 'Pi', 'Sigma', 'Upsilon',
    'Phi', 'Psi', 'Omega',
    'infty', 'partial', 'nabla', 'pm', 'mp', 'times', 'div', 'cdot',
    'leq', 'geq', 'neq', 'approx', 'equiv', 'propto', 'subset', 'supset',
    'in', 'notin', 'cap', 'cup', 'emptyset', 'forall', 'exists',
    'quad', 'qquad', 'hspace', 'vspace'
  ]
  
  // Replace \\command with \command for each LaTeX command
  for (const command of latexCommands) {
    const regex = new RegExp(`\\\\${command}\\b`, 'g')
    processed = processed.replace(regex, `\\${command}`)
  }
  
  // Pattern 2: Handle LaTeX commands with braces
  processed = processed.replace(/\\\\([a-zA-Z]+)\\{/g, '\\$1{')
  
  // Pattern 3: Handle LaTeX commands with brackets - properly escape brackets
  // Match \\command[ where we need to escape [ in regex
  processed = processed.replace(/\\\\([a-zA-Z]+)\[/g, '\\$1[')
  
  // Pattern 4: Handle LaTeX commands with parentheses - properly escape parentheses
  // Match \\command( where we need to escape ( in regex
  processed = processed.replace(/\\\\([a-zA-Z]+)\(/g, '\\$1(')
  
  // Pattern 5: Handle remaining double backslashes before letters
  processed = processed.replace(/\\\\([a-zA-Z])/g, '\\$1')
  
  // Pattern 6: Handle line breaks carefully
  processed = processed.replace(/\\\\\\/g, '\\\\')
  
  // Pattern 7: Handle spacing commands
  processed = processed.replace(/\\quad\\/g, '\\quad')
  processed = processed.replace(/\\qquad\\/g, '\\qquad')
  
  return processed
}

/**
 * Sanitizes LaTeX text for JSON storage by escaping backslashes
 * This is used before storing data in JSON/JSONB database columns
 * 
 * @param text - The LaTeX text to sanitize
 * @returns The sanitized text safe for JSON storage
 */
export function sanitizeLatexForStorage(text: string | null | undefined): string | null | undefined {
  if (!text) return text
  return text.replace(/\\/g, '\\\\')
}

/**
 * Sanitizes LaTeX text for rendering by unescaping backslashes
 * This is used before rendering LaTeX with KaTeX
 * 
 * @param text - The LaTeX text from database storage
 * @returns The sanitized text ready for KaTeX rendering
 */
export function sanitizeLatexForRendering(text: string | null | undefined): string | null | undefined {
  if (!text) return text
  return text.replace(/\\\\/g, '\\')
}

/**
 * Processes options object from CSV import with intelligent LaTeX handling
 * 
 * @param options - The options object from CSV import
 * @returns The processed options object ready for storage
 */
export function processOptionsFromCSV(options: Record<string, string> | null | undefined): Record<string, string> | null | undefined {
  if (!options) return options
  
  const processed: Record<string, string> = {}
  for (const [key, value] of Object.entries(options)) {
    processed[key] = processLatexFromCSV(value) || ''
  }
  return processed
}

/**
 * Sanitizes an options object for JSON storage
 * 
 * @param options - The options object to sanitize
 * @returns The sanitized options object
 */
export function sanitizeOptionsForStorage(options: Record<string, string> | null | undefined): Record<string, string> | null | undefined {
  if (!options) return options
  
  const sanitized: Record<string, string> = {}
  for (const [key, value] of Object.entries(options)) {
    sanitized[key] = sanitizeLatexForStorage(value) || ''
  }
  return sanitized
}

/**
 * Sanitizes an options object for rendering
 * 
 * @param options - The options object from storage
 * @returns The sanitized options object ready for rendering
 */
export function sanitizeOptionsForRendering(options: Record<string, string> | null | undefined): Record<string, string> | null | undefined {
  if (!options) return options
  
  const sanitized: Record<string, string> = {}
  for (const [key, value] of Object.entries(options)) {
    sanitized[key] = sanitizeLatexForRendering(value) || ''
  }
  return sanitized
}

/**
 * Processes a complete question object from CSV import with intelligent LaTeX handling
 * 
 * @param question - The question object from CSV import
 * @returns The processed question object ready for storage
 */
export function processQuestionFromCSV(question: Record<string, unknown>): Record<string, unknown> {
  return {
    ...question,
    question_text: processLatexFromCSV(question.question_text as string),
    solution_text: processLatexFromCSV(question.solution_text as string),
    exam_metadata: processLatexFromCSV(question.exam_metadata as string),
    options: processOptionsFromCSV(question.options as Record<string, string>)
  }
}

/**
 * Sanitizes a complete question object for storage
 * 
 * @param question - The question object to sanitize
 * @returns The sanitized question object
 */
export function sanitizeQuestionForStorage(question: Record<string, unknown>): Record<string, unknown> {
  return {
    ...question,
    question_text: sanitizeLatexForStorage(question.question_text as string),
    solution_text: sanitizeLatexForStorage(question.solution_text as string),
    exam_metadata: sanitizeLatexForStorage(question.exam_metadata as string),
    options: sanitizeOptionsForStorage(question.options as Record<string, string>)
  }
}

/**
 * Sanitizes a complete question object for rendering
 * 
 * @param question - The question object from storage
 * @returns The sanitized question object ready for rendering
 */
export function sanitizeQuestionForRendering(question: Record<string, unknown>): Record<string, unknown> {
  return {
    ...question,
    question_text: sanitizeLatexForRendering(question.question_text as string),
    solution_text: sanitizeLatexForRendering(question.solution_text as string),
    exam_metadata: sanitizeLatexForRendering(question.exam_metadata as string),
    options: sanitizeOptionsForRendering(question.options as Record<string, string>)
  }
}