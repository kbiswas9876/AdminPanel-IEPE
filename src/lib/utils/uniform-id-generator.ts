import { bookCodeExists, questionIdExists } from '@/lib/actions/id-generation'

/**
 * Uniform ID Generation System
 * 
 * This file provides a consistent, simple, and highly readable ID generation algorithm
 * that is used throughout the entire system for both book codes and question IDs.
 * 
 * Algorithm:
 * - Book Code: Replace spaces with underscores in book name (e.g., "Pinnacle 6800 6th Ed" -> "Pinnacle_6800_6th_Ed")
 * - Question ID: BOOK_CODE_CHAPTER_NAME_QUESTION_NUMBER (e.g., "Pinnacle_6800_6th_Ed_Percentage_001")
 */

/**
 * Generate a simple, readable book code by replacing spaces with underscores
 * @param bookName - The full book name
 * @returns A readable book code with underscores instead of spaces
 */
export function generateBookCode(bookName: string): string {
  if (!bookName || bookName.trim() === '') {
    return 'Unknown_Book'
  }
  
  // Replace spaces with underscores and clean up any special characters
  return bookName
    .trim()
    .replace(/\s+/g, '_')  // Replace one or more spaces with single underscore
    .replace(/[^\w_]/g, '') // Remove any non-word characters except underscores
    .replace(/_+/g, '_')   // Replace multiple underscores with single underscore
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
}

/**
 * Generate a uniform question ID using the standard format
 * @param bookCode - The book code (generated from book name)
 * @param chapterName - The chapter name
 * @param questionNumber - The question number in the book
 * @returns A uniform question ID in the format: BOOK_CODE_CHAPTER_NAME_QUESTION_NUMBER
 */
export function generateQuestionId(bookCode: string, chapterName: string, questionNumber: number | string): string {
  if (!bookCode || !chapterName) {
    throw new Error('Book code and chapter name are required')
  }
  
  // Clean and format the chapter name
  const cleanChapterName = chapterName
    .trim()
    .replace(/\s+/g, '_')  // Replace spaces with underscores
    .replace(/[^\w_]/g, '') // Remove special characters
    .replace(/_+/g, '_')   // Replace multiple underscores with single
    .replace(/^_|_$/g, '') // Remove leading/trailing underscores
  
  // Format question number with zero padding
  const formattedQuestionNumber = String(questionNumber).padStart(3, '0')
  
  // Generate the question ID
  return `${bookCode}_${cleanChapterName}_${formattedQuestionNumber}`
}


/**
 * Generate a unique book code by checking for collisions and adding suffix if needed
 * @param bookName - The book name
 * @returns Promise<string> - A unique book code
 */
export async function generateUniqueBookCode(bookName: string): Promise<string> {
  const baseBookCode = generateBookCode(bookName)
  let bookCode = baseBookCode
  let counter = 1
  
  // Check for collisions and add suffix if needed
  while (await bookCodeExists(bookCode)) {
    bookCode = `${baseBookCode}_${counter.toString().padStart(2, '0')}`
    counter++
    
    // Prevent infinite loop
    if (counter > 99) {
      throw new Error('Unable to generate unique book code after 99 attempts')
    }
  }
  
  return bookCode
}

/**
 * Generate a unique question ID by checking for collisions and adding suffix if needed
 * @param bookCode - The book code
 * @param chapterName - The chapter name
 * @param questionNumber - The question number
 * @returns Promise<string> - A unique question ID
 */
export async function generateUniqueQuestionId(bookCode: string, chapterName: string, questionNumber: number | string): Promise<string> {
  const baseQuestionId = generateQuestionId(bookCode, chapterName, questionNumber)
  let questionId = baseQuestionId
  let counter = 1
  
  // Check for collisions and add suffix if needed
  while (await questionIdExists(questionId)) {
    questionId = `${baseQuestionId}_${counter.toString().padStart(2, '0')}`
    counter++
    
    // Prevent infinite loop
    if (counter > 99) {
      throw new Error('Unable to generate unique question ID after 99 attempts')
    }
  }
  
  return questionId
}


/**
 * Parse a question ID to extract its components
 * @param questionId - The question ID to parse
 * @returns Object with parsed components or null if invalid format
 */
export function parseQuestionId(questionId: string): { 
  bookCode: string; 
  chapterName: string; 
  questionNumber: string; 
  suffix?: string 
} | null {
  try {
    // Expected format: BOOK_CODE_CHAPTER_NAME_QUESTION_NUMBER[_SUFFIX]
    const parts = questionId.split('_')
    
    if (parts.length < 3) {
      return null
    }
    
    // Find the question number (last 3-digit number)
    let questionNumberIndex = -1
    for (let i = parts.length - 1; i >= 0; i--) {
      if (/^\d{3}$/.test(parts[i])) {
        questionNumberIndex = i
        break
      }
    }
    
    if (questionNumberIndex === -1) {
      return null
    }
    
    const questionNumber = parts[questionNumberIndex]
    const suffix = parts.length > questionNumberIndex + 1 ? parts.slice(questionNumberIndex + 1).join('_') : undefined
    
    // Everything before the question number is book code and chapter name
    const beforeQuestionNumber = parts.slice(0, questionNumberIndex)
    
    // We need to separate book code from chapter name
    // This is tricky because both can contain underscores
    // For now, we'll assume the last part before question number is chapter name
    // and everything before that is book code
    if (beforeQuestionNumber.length < 2) {
      return null
    }
    
    const chapterName = beforeQuestionNumber[beforeQuestionNumber.length - 1]
    const bookCode = beforeQuestionNumber.slice(0, -1).join('_')
    
    return {
      bookCode,
      chapterName,
      questionNumber,
      suffix
    }
  } catch (error) {
    console.error('Error parsing question ID:', error)
    return null
  }
}

/**
 * Validate if a question ID follows the correct format
 * @param questionId - The question ID to validate
 * @returns boolean - True if the format is valid
 */
export function isValidQuestionIdFormat(questionId: string): boolean {
  return parseQuestionId(questionId) !== null
}

/**
 * Get a human-readable description of a question ID
 * @param questionId - The question ID
 * @returns string - Human-readable description
 */
export function getQuestionIdDescription(questionId: string): string {
  const parsed = parseQuestionId(questionId)
  if (!parsed) {
    return 'Invalid question ID format'
  }
  
  const bookName = parsed.bookCode.replace(/_/g, ' ')
  const chapterName = parsed.chapterName.replace(/_/g, ' ')
  const questionNumber = parseInt(parsed.questionNumber, 10)
  
  let description = `Book: ${bookName}, Chapter: ${chapterName}, Question: ${questionNumber}`
  
  if (parsed.suffix) {
    description += ` (Variant: ${parsed.suffix})`
  }
  
  return description
}

