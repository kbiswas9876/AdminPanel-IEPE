/**
 * LaTeX Sanitization Utilities
 * 
 * This module handles the conflict between JSON escaping rules (\\)
 * and KaTeX rendering rules (\) for LaTeX content.
 * 
 * Strategy:
 * - Sanitize on Write: Convert single backslashes to double backslashes for JSON storage
 * - Sanitize on Read: Convert double backslashes back to single backslashes for rendering
 */

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
