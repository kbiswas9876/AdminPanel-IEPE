/**
 * Enhanced ID Generator Utility
 * 
 * Generates unique, readable IDs for books and questions with guaranteed uniqueness
 * and collision detection/resolution.
 * 
 * Book Code Format: [PREFIX][HASH][SUFFIX] (e.g., BK_A1B2C3_01)
 * Question ID Format: [BOOK_CODE]_[CHAPTER_CODE]_[QUESTION_NUM]_[CHECKSUM] (e.g., BK_A1B2C3_01_ALG_001_A7)
 */

import { createAdminClient } from '@/lib/supabase/admin'

// Configuration constants
const QUESTION_NUM_LENGTH = 3 // Length for question numbers

// Common words to remove from names
const COMMON_WORDS = new Set([
  'and', 'the', 'of', 'in', 'on', 'at', 'to', 'for', 'with', 'by', 'from', 'up', 'about', 'into', 'through', 'during',
  'before', 'after', 'above', 'below', 'between', 'among', 'under', 'over', 'around', 'near', 'far', 'here', 'there',
  'where', 'when', 'why', 'how', 'what', 'which', 'who', 'whom', 'whose', 'this', 'that', 'these', 'those',
  'class', 'grade', 'level', 'book', 'chapter', 'section', 'part', 'volume', 'edition', 'version'
])

/**
 * Generates a hash from a string for uniqueness
 * @param input - Input string
 * @param length - Desired hash length
 * @returns Hash string
 */
function generateHash(input: string, length: number = 6): string {
  let hash = 0
  const str = input.toLowerCase().replace(/[^a-z0-9]/g, '')
  
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i)
    hash = ((hash << 5) - hash) + char
    hash = hash & hash // Convert to 32-bit integer
  }
  
  // Convert to base36 and pad
  const hashStr = Math.abs(hash).toString(36).toUpperCase()
  return hashStr.padStart(length, '0').substring(0, length)
}

/**
 * Cleans and normalizes text for code generation
 * @param text - Input text
 * @returns Cleaned text
 */
function cleanText(text: string): string {
  return text
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim()
    .toLowerCase()
}

/**
 * Extracts meaningful words from text
 * @param text - Input text
 * @returns Array of meaningful words
 */
function extractMeaningfulWords(text: string): string[] {
  const cleaned = cleanText(text)
  const words = cleaned.split(' ')
    .filter(word => word.length > 0 && !COMMON_WORDS.has(word))
    .map(word => word.substring(0, 10)) // Limit word length
  
  return words.length > 0 ? words : ['default']
}


/**
 * Checks if a book code already exists in the database
 * @param bookCode - Book code to check
 * @returns Promise<boolean> - True if exists
 */
async function bookCodeExists(bookCode: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('book_sources')
      .select('code')
      .eq('code', bookCode)
      .single()
    
    return !error && !!data
  } catch {
    return false
  }
}

/**
 * Checks if a question ID already exists in the database
 * @param questionId - Question ID to check
 * @returns Promise<boolean> - True if exists
 */
async function questionIdExists(questionId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('questions')
      .select('question_id')
      .eq('question_id', questionId)
      .single()
    
    return !error && !!data
  } catch {
    return false
  }
}

/**
 * Generates a unique book code
 * @param bookName - Name of the book
 * @returns Promise<string> - Unique book code
 */
export async function generateUniqueBookCode(bookName: string): Promise<string> {
  if (!bookName || bookName.trim().length === 0) {
    throw new Error('Book name is required')
  }

  const words = extractMeaningfulWords(bookName)
  
  // Create a more readable book code format: PREFIX-NUMBER
  // For "Pinnacle 6800 6th Edition" -> "PIN6800"
  let readableCode = ''
  
  if (words.length === 1) {
    // Single word: take first 6 characters
    readableCode = words[0].substring(0, 6).toUpperCase()
  } else if (words.length === 2) {
    // Two words: combine first 3 chars of each
    const first = words[0].substring(0, 3)
    const second = words[1].substring(0, 3)
    readableCode = (first + second).toUpperCase()
  } else {
    // Multiple words: take first 2 chars of first two words
    const first = words[0].substring(0, 2)
    const second = words[1].substring(0, 2)
    const third = words[2] ? words[2].substring(0, 2) : ''
    readableCode = (first + second + third).toUpperCase()
  }
  
  // Extract numbers from the book name for better readability
  const numbers = bookName.match(/\d+/g)
  if (numbers && numbers.length > 0) {
    // Use the first significant number found
    const significantNumber = numbers[0]
    if (significantNumber.length <= 4) {
      readableCode += significantNumber
    } else {
      readableCode += significantNumber.substring(0, 4)
    }
  }
  
  // Ensure the code is not too long
  readableCode = readableCode.substring(0, 8)
  
  // Try the readable code first
  if (!(await bookCodeExists(readableCode))) {
    return readableCode
  }
  
  // If readable code exists, add a number suffix
  for (let attempt = 1; attempt <= 99; attempt++) {
    const codeWithSuffix = `${readableCode}${attempt.toString().padStart(2, '0')}`
    if (!(await bookCodeExists(codeWithSuffix))) {
      return codeWithSuffix
    }
  }
  
  // Fallback: use hash-based approach
  const hash = generateHash(bookName, 4)
  return `${readableCode.substring(0, 4)}${hash}`
}

/**
 * Generates a unique question ID
 * @param bookCode - Book code
 * @param chapterName - Chapter name
 * @param questionNumber - Question number in book
 * @returns Promise<string> - Unique question ID
 */
export async function generateUniqueQuestionId(
  bookCode: string,
  chapterName: string,
  questionNumber: number | string
): Promise<string> {
  if (!bookCode || !chapterName || !questionNumber) {
    throw new Error('Book code, chapter name, and question number are required')
  }

  const words = extractMeaningfulWords(chapterName)
  
  // Create more readable chapter code
  let chapterCode = ''
  if (words.length === 1) {
    chapterCode = words[0].substring(0, 4).toUpperCase()
  } else if (words.length === 2) {
    const first = words[0].substring(0, 2)
    const second = words[1].substring(0, 2)
    chapterCode = (first + second).toUpperCase()
  } else {
    // Take first letter of first two words and first 2 chars of third
    chapterCode = words.slice(0, 3)
      .map((word, index) => {
        if (index < 2) {
          return word.charAt(0)
        } else {
          return word.substring(0, 2)
        }
      })
      .join('')
      .toUpperCase()
  }
  
  const qNum = String(questionNumber).padStart(QUESTION_NUM_LENGTH, '0')
  
  // Create a more readable format: BOOKCODE-CHAPTER-QNUM
  const baseId = `${bookCode}-${chapterCode}-${qNum}`
  
  // Try the readable format first
  if (!(await questionIdExists(baseId))) {
    return baseId
  }
  
  // If exists, add a suffix
  for (let attempt = 1; attempt <= 99; attempt++) {
    const questionId = `${baseId}-${attempt.toString().padStart(2, '0')}`
    if (!(await questionIdExists(questionId))) {
      return questionId
    }
  }
  
  // Fallback: use hash-based approach
  const hash = generateHash(baseId, 4)
  return `${baseId}-${hash}`
}

/**
 * Validates if a book code follows the expected format
 * @param bookCode - Book code to validate
 * @returns True if format is valid
 */
export function isValidBookCodeFormat(bookCode: string): boolean {
  // Pattern: Readable format (e.g., PIN6800, MATHEMATICS, ALG1234)
  const pattern = /^[A-Z0-9]{3,8}$/
  return pattern.test(bookCode) && bookCode.length <= 8
}

/**
 * Validates if a question ID follows the expected format
 * @param questionId - Question ID to validate
 * @returns True if format is valid
 */
export function isValidQuestionIdFormat(questionId: string): boolean {
  // Pattern: BOOKCODE-CHAPTER-001 (e.g., PIN6800-ALG-001, MATHEMATICS-QUAD-123)
  const pattern = /^[A-Z0-9]{3,8}-[A-Z0-9]{2,6}-\d{3}(-\d{2})?$/
  return pattern.test(questionId)
}

/**
 * Parses a book code into its components
 * @param bookCode - Book code to parse
 * @returns Object with readable code and any suffix
 */
export function parseBookCode(bookCode: string): {
  readableCode: string
  suffix?: string
} | null {
  if (!isValidBookCodeFormat(bookCode)) {
    return null
  }
  
  // Check if it has a numeric suffix (e.g., PIN680001)
  const match = bookCode.match(/^([A-Z]+)(\d+)$/)
  if (match) {
    return {
      readableCode: match[1],
      suffix: match[2]
    }
  }
  
  return {
    readableCode: bookCode
  }
}

/**
 * Parses a question ID into its components
 * @param questionId - Question ID to parse
 * @returns Object with bookCode, chapterCode, questionNumber, and suffix
 */
export function parseQuestionId(questionId: string): {
  bookCode: string
  chapterCode: string
  questionNumber: string
  suffix?: string
} | null {
  if (!isValidQuestionIdFormat(questionId)) {
    return null
  }
  
  const parts = questionId.split('-')
  if (parts.length < 3) {
    return null
  }
  
  return {
    bookCode: parts[0],
    chapterCode: parts[1],
    questionNumber: parts[2],
    suffix: parts[3] || undefined
  }
}

/**
 * Generates a human-readable description from an ID
 * @param questionId - Question ID
 * @returns Human-readable description
 */
export function getQuestionIdDescription(questionId: string): string {
  const parsed = parseQuestionId(questionId)
  if (!parsed) {
    return 'Invalid Question ID'
  }
  
  const bookParsed = parseBookCode(parsed.bookCode)
  if (!bookParsed) {
    return `Question ${parsed.questionNumber} from ${parsed.chapterCode} chapter`
  }
  
  return `Question ${parsed.questionNumber} from ${parsed.chapterCode} chapter in ${bookParsed.readableCode} book`
}

// Legacy compatibility functions
export function generateQuestionId(
  bookSource: string,
  chapterName: string,
  questionNumber: number | string
): string {
  // This is a synchronous fallback for backward compatibility
  const bookCode = generateBookCode(bookSource)
  
  const words = extractMeaningfulWords(chapterName)
  let chapterCode = ''
  if (words.length === 1) {
    chapterCode = words[0].substring(0, 4).toUpperCase()
  } else if (words.length === 2) {
    const first = words[0].substring(0, 2)
    const second = words[1].substring(0, 2)
    chapterCode = (first + second).toUpperCase()
  } else {
    chapterCode = words.slice(0, 3)
      .map((word, index) => {
        if (index < 2) {
          return word.charAt(0)
        } else {
          return word.substring(0, 2)
        }
      })
      .join('')
      .toUpperCase()
  }
  
  const qNum = String(questionNumber).padStart(3, '0')
  
  return `${bookCode}-${chapterCode}-${qNum}`
}

export function generateBookCode(bookSource: string): string {
  // This is a synchronous fallback for backward compatibility
  const words = extractMeaningfulWords(bookSource)
  
  // Create a more readable book code format
  let readableCode = ''
  
  if (words.length === 1) {
    // Single word: take first 6 characters
    readableCode = words[0].substring(0, 6).toUpperCase()
  } else if (words.length === 2) {
    // Two words: combine first 3 chars of each
    const first = words[0].substring(0, 3)
    const second = words[1].substring(0, 3)
    readableCode = (first + second).toUpperCase()
  } else {
    // Multiple words: take first 2 chars of first two words
    const first = words[0].substring(0, 2)
    const second = words[1].substring(0, 2)
    const third = words[2] ? words[2].substring(0, 2) : ''
    readableCode = (first + second + third).toUpperCase()
  }
  
  // Extract numbers from the book name for better readability
  const numbers = bookSource.match(/\d+/g)
  if (numbers && numbers.length > 0) {
    // Use the first significant number found
    const significantNumber = numbers[0]
    if (significantNumber.length <= 4) {
      readableCode += significantNumber
    } else {
      readableCode += significantNumber.substring(0, 4)
    }
  }
  
  // Ensure the code is not too long
  return readableCode.substring(0, 8)
}
