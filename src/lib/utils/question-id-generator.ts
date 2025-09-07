/**
 * Question ID Generator Utility
 * 
 * Generates unique question IDs based on the formula:
 * [Book_Code]_[Chapter_Abbreviation]_[Question_Number_in_Book]
 * 
 * Example: PIN6800_PER_101
 */

/**
 * Generates a chapter abbreviation from a full chapter name
 * @param chapterName - The full chapter name
 * @returns A shortened abbreviation (max 6 characters)
 */
function generateChapterAbbreviation(chapterName: string): string {
  if (!chapterName) return 'CH'
  
  // Remove common words and special characters
  const cleaned = chapterName
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\b(and|the|of|in|on|at|to|for|with|by)\b/gi, '') // Remove common words
    .trim()
  
  // Split into words and take first letters
  const words = cleaned.split(/\s+/).filter(word => word.length > 0)
  
  if (words.length === 0) return 'CH'
  
  if (words.length === 1) {
    // Single word: take first 6 characters
    return words[0].substring(0, 6).toUpperCase()
  }
  
  if (words.length === 2) {
    // Two words: take first 3 characters of each
    return (words[0].substring(0, 3) + words[1].substring(0, 3)).toUpperCase()
  }
  
  // Multiple words: take first 2 characters of first 3 words
  return words.slice(0, 3).map(word => word.substring(0, 2)).join('').toUpperCase()
}

/**
 * Generates a book code from a book source name
 * @param bookSource - The book source name
 * @returns A book code (max 8 characters)
 */
function generateBookCode(bookSource: string): string {
  if (!bookSource) return 'BOOK'
  
  // Remove common words and special characters
  const cleaned = bookSource
    .replace(/[^\w\s]/g, '') // Remove special characters
    .replace(/\b(and|the|of|in|on|at|to|for|with|by|class|grade)\b/gi, '') // Remove common words
    .trim()
  
  // Split into words
  const words = cleaned.split(/\s+/).filter(word => word.length > 0)
  
  if (words.length === 0) return 'BOOK'
  
  if (words.length === 1) {
    // Single word: take first 8 characters
    return words[0].substring(0, 8).toUpperCase()
  }
  
  // Multiple words: take first 4 characters of first 2 words
  const code = words.slice(0, 2).map(word => word.substring(0, 4)).join('')
  return code.substring(0, 8).toUpperCase()
}

/**
 * Generates a unique question ID
 * @param bookSource - The book source name
 * @param chapterName - The chapter name
 * @param questionNumber - The question number in the book
 * @returns A formatted question ID
 */
export function generateQuestionId(
  bookSource: string,
  chapterName: string,
  questionNumber: number | string
): string {
  const bookCode = generateBookCode(bookSource)
  const chapterAbbr = generateChapterAbbreviation(chapterName)
  const qNumber = String(questionNumber).padStart(3, '0') // Pad with zeros to 3 digits
  
  return `${bookCode}_${chapterAbbr}_${qNumber}`
}

/**
 * Validates if a question ID follows the expected format
 * @param questionId - The question ID to validate
 * @returns True if the format is valid
 */
export function isValidQuestionIdFormat(questionId: string): boolean {
  // Pattern: BOOKCODE_CHAPTER_001
  const pattern = /^[A-Z0-9]{1,8}_[A-Z0-9]{1,6}_\d{3}$/
  return pattern.test(questionId)
}

/**
 * Parses a question ID into its components
 * @param questionId - The question ID to parse
 * @returns Object with bookCode, chapterAbbr, and questionNumber
 */
export function parseQuestionId(questionId: string): {
  bookCode: string
  chapterAbbr: string
  questionNumber: string
} | null {
  if (!isValidQuestionIdFormat(questionId)) {
    return null
  }
  
  const parts = questionId.split('_')
  if (parts.length !== 3) {
    return null
  }
  
  return {
    bookCode: parts[0],
    chapterAbbr: parts[1],
    questionNumber: parts[2]
  }
}
