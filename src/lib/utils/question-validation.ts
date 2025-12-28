import { ParsedQuestion } from './bulk-upload-parsers'

/**
 * Validates questions before upload
 */
export function validateQuestions(questions: ParsedQuestion[]): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check for duplicate question IDs
  const questionIds = new Set<string>()
  const duplicates = new Set<string>()

  for (const question of questions) {
    if (question.question_id) {
      if (questionIds.has(question.question_id)) {
        duplicates.add(question.question_id)
      } else {
        questionIds.add(question.question_id)
      }
    }
  }

  if (duplicates.size > 0) {
    errors.push(`Duplicate question IDs found: ${Array.from(duplicates).join(', ')}`)
  }

  // Check for required fields
  for (let i = 0; i < questions.length; i++) {
    const question = questions[i]
    const rowNum = i + 1

    if (!question.book_source) {
      errors.push(`Row ${rowNum}: Missing book_source`)
    }
    if (!question.chapter_name) {
      errors.push(`Row ${rowNum}: Missing chapter_name`)
    }
    if (!question.question_text) {
      errors.push(`Row ${rowNum}: Missing question_text`)
    }
    if (!question.options || Object.keys(question.options).length === 0) {
      errors.push(`Row ${rowNum}: Missing or empty options`)
    }
    if (!question.correct_option) {
      errors.push(`Row ${rowNum}: Missing correct_option`)
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  }
}
