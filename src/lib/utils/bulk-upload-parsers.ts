/**
 * Universal Bulk Upload Parsers
 * 
 * Supports JSONL (preferred), Parquet (large datasets), and CSV (fallback)
 * with LaTeX-safe processing and streaming support.
 */

export interface ParsedQuestion {
  book_source: string
  chapter_name: string
  question_number_in_book: number
  question_text: string
  options: Record<string, string>
  correct_option: string
  solution_text: string
  exam_metadata: string
  admin_tags: string[]
  question_id?: string
}

export interface ParseResult {
  questions: ParsedQuestion[]
  errors: Array<{
    row: number
    data: unknown
    error: string
  }>
  totalRows: number
  validRows: number
}

export interface UploadProgress {
  processed: number
  total: number
  errors: number
  currentBatch: number
  isComplete: boolean
}

/**
 * LaTeX-safe sanitization for CSV data
 * Handles the conflict between CSV escaping and LaTeX rendering
 */
export function sanitizeLatexContent(text: string): string {
  if (!text) return text
  
  let processed = text
  
  // Handle common LaTeX commands with double backslashes
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
  
  // Handle LaTeX commands with braces
  processed = processed.replace(/\\\\([a-zA-Z]+)\\{/g, '\\$1{')
  
  // Handle LaTeX commands with brackets
  const bracketRegex = new RegExp('\\\\\\\\([a-zA-Z]+)\\\\[', 'g')
  processed = processed.replace(bracketRegex, '\\$1[')
  
  // Handle LaTeX commands with parentheses
  const parenRegex = new RegExp('\\\\\\\\([a-zA-Z]+)\\\\(', 'g')
  processed = processed.replace(parenRegex, '\\$1(')
  
  // Handle remaining double backslashes before letters
  processed = processed.replace(/\\\\([a-zA-Z])/g, '\\$1')
  
  // Handle line breaks carefully
  processed = processed.replace(/\\\\\\/g, '\\\\')
  
  // Handle spacing commands
  processed = processed.replace(/\\quad\\/g, '\\quad')
  processed = processed.replace(/\\qquad\\/g, '\\qquad')
  
  return processed
}

/**
 * Validates a parsed question row
 */
export function validateQuestionRow(row: unknown, _rowIndex: number): { isValid: boolean; error?: string } {
  if (!row || typeof row !== 'object') {
    return { isValid: false, error: 'Row must be an object' }
  }

  const questionRow = row as Record<string, unknown>
  
  // Required fields
  const requiredFields = ['book_source', 'chapter_name', 'question_number_in_book', 'question_text', 'options', 'correct_option']
  
  for (const field of requiredFields) {
    if (!questionRow[field]) {
      return { isValid: false, error: `Missing required field: ${field}` }
    }
  }
  
  // Validate question number
  if (typeof questionRow.question_number_in_book !== 'number' || questionRow.question_number_in_book < 1) {
    return { isValid: false, error: 'question_number_in_book must be a positive number' }
  }
  
  // Validate options
  if (typeof questionRow.options !== 'object' || Array.isArray(questionRow.options)) {
    return { isValid: false, error: 'options must be an object' }
  }
  
  // Validate correct option exists in options
  const options = questionRow.options as Record<string, unknown>
  if (!options[questionRow.correct_option as string]) {
    return { isValid: false, error: `correct_option '${questionRow.correct_option}' not found in options` }
  }
  
  // Validate admin_tags is array
  if (questionRow.admin_tags && !Array.isArray(questionRow.admin_tags)) {
    return { isValid: false, error: 'admin_tags must be an array' }
  }
  
  return { isValid: true }
}

/**
 * JSONL Parser (Preferred format)
 * Each line is a JSON object - LaTeX safe and efficient
 */
export async function parseJSONL(file: File): Promise<ParseResult> {
  const text = await file.text()
  const lines = text.split('\n').filter(line => line.trim())
  
  const questions: ParsedQuestion[] = []
  const errors: Array<{ row: number; data: unknown; error: string }> = []
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    try {
      const row = JSON.parse(line)
      
      // Validate the row
      const validation = validateQuestionRow(row, i + 1)
      if (!validation.isValid) {
        errors.push({
          row: i + 1,
          data: row,
          error: validation.error!
        })
        continue
      }
      
      // Process the row
      const question: ParsedQuestion = {
        book_source: row.book_source as string,
        chapter_name: row.chapter_name as string,
        question_number_in_book: row.question_number_in_book as number,
        question_text: row.question_text as string,
        options: row.options as Record<string, string>,
        correct_option: row.correct_option as string,
        solution_text: (row.solution_text as string) || '',
        exam_metadata: (row.exam_metadata as string) || '',
        admin_tags: (row.admin_tags as string[]) || [],
        question_id: row.question_id as string
      }
      
      questions.push(question)
    } catch (error) {
      errors.push({
        row: i + 1,
        data: line,
        error: `Invalid JSON: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }
  
  return {
    questions,
    errors,
    totalRows: lines.length,
    validRows: questions.length
  }
}

/**
 * CSV Parser (Fallback format)
 * Handles CSV with LaTeX-safe processing
 */
export async function parseCSV(file: File): Promise<ParseResult> {
  const text = await file.text()
  const lines = text.split('\n').filter(line => line.trim())
  
  if (lines.length < 2) {
    return {
      questions: [],
      errors: [{ row: 0, data: null, error: 'CSV file must have at least a header and one data row' }],
      totalRows: 0,
      validRows: 0
    }
  }
  
  // Parse header
  const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''))
  
  const questions: ParsedQuestion[] = []
  const errors: Array<{ row: number; data: unknown; error: string }> = []
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim()
    if (!line) continue
    
    try {
      // Simple CSV parsing (can be enhanced with a proper CSV library)
      const values = parseCSVLine(line)
      
      if (values.length !== headers.length) {
        errors.push({
          row: i + 1,
          data: line,
          error: `Column count mismatch: expected ${headers.length}, got ${values.length}`
        })
        continue
      }
      
      // Create row object
      const row: Record<string, unknown> = {}
      for (let j = 0; j < headers.length; j++) {
        row[headers[j]] = values[j]
      }
      
      // Parse options field (should be JSON string)
      if (row.options && typeof row.options === 'string') {
        try {
          row.options = JSON.parse(row.options)
        } catch {
          errors.push({
            row: i + 1,
            data: row,
            error: 'Invalid JSON in options field'
          })
          continue
        }
      }
      
      // Parse admin_tags field (comma-separated string)
      if (row.admin_tags && typeof row.admin_tags === 'string') {
        row.admin_tags = row.admin_tags.split(',').map((tag: string) => tag.trim()).filter((tag: string) => tag)
      }
      
      // Parse question_number_in_book
      if (row.question_number_in_book && typeof row.question_number_in_book === 'string') {
        row.question_number_in_book = parseInt(row.question_number_in_book)
      }
      
      // Sanitize LaTeX content
      if (row.question_text && typeof row.question_text === 'string') {
        row.question_text = sanitizeLatexContent(row.question_text)
      }
      if (row.solution_text && typeof row.solution_text === 'string') {
        row.solution_text = sanitizeLatexContent(row.solution_text)
      }
      
      // Validate the row
      const validation = validateQuestionRow(row, i + 1)
      if (!validation.isValid) {
        errors.push({
          row: i + 1,
          data: row,
          error: validation.error!
        })
        continue
      }
      
      // Process the row
      const question: ParsedQuestion = {
        book_source: row.book_source as string,
        chapter_name: row.chapter_name as string,
        question_number_in_book: row.question_number_in_book as number,
        question_text: row.question_text as string,
        options: row.options as Record<string, string>,
        correct_option: row.correct_option as string,
        solution_text: (row.solution_text as string) || '',
        exam_metadata: (row.exam_metadata as string) || '',
        admin_tags: (row.admin_tags as string[]) || [],
        question_id: row.question_id as string
      }
      
      questions.push(question)
    } catch (error) {
      errors.push({
        row: i + 1,
        data: line,
        error: `Parse error: ${error instanceof Error ? error.message : 'Unknown error'}`
      })
    }
  }
  
  return {
    questions,
    errors,
    totalRows: lines.length - 1,
    validRows: questions.length
  }
}

/**
 * Simple CSV line parser
 * Handles quoted fields and escaped characters
 */
function parseCSVLine(line: string): string[] {
  const result: string[] = []
  let current = ''
  let inQuotes = false
  let i = 0
  
  while (i < line.length) {
    const char = line[i]
    
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        // Escaped quote
        current += '"'
        i += 2
      } else {
        // Toggle quote state
        inQuotes = !inQuotes
        i++
      }
    } else if (char === ',' && !inQuotes) {
      // Field separator
      result.push(current.trim())
      current = ''
      i++
    } else {
      current += char
      i++
    }
  }
  
  // Add the last field
  result.push(current.trim())
  
  return result
}

/**
 * Parquet Parser (For large datasets)
 * Note: This would require a Parquet library like 'parquetjs'
 * For now, we'll provide a placeholder that can be implemented later
 */
export async function parseParquet(_file: File): Promise<ParseResult> {
  // TODO: Implement Parquet parsing when needed
  // This would require adding 'parquetjs' or similar library
  return {
    questions: [],
    errors: [{ row: 0, data: null, error: 'Parquet parsing not yet implemented. Please use JSONL or CSV format.' }],
    totalRows: 0,
    validRows: 0
  }
}

/**
 * Auto-detect file format and parse accordingly
 */
export async function parseBulkUploadFile(file: File): Promise<ParseResult> {
  const fileName = file.name.toLowerCase()
  
  if (fileName.endsWith('.jsonl') || fileName.endsWith('.json')) {
    return parseJSONL(file)
  } else if (fileName.endsWith('.parquet')) {
    return parseParquet(file)
  } else if (fileName.endsWith('.csv')) {
    return parseCSV(file)
  } else {
    return {
      questions: [],
      errors: [{ row: 0, data: null, error: 'Unsupported file format. Please use .jsonl, .parquet, or .csv' }],
      totalRows: 0,
      validRows: 0
    }
  }
}
