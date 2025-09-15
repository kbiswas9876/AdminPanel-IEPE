'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { ParsedQuestion } from '@/lib/utils/bulk-upload-parsers'
import { generateUniqueQuestionId } from '@/lib/utils/uniform-id-generator'
import { getBookCodeByName } from '@/lib/actions/id-generation'

/**
 * Generate a simple, readable book code by replacing spaces with underscores
 * Server-side version of the client utility
 */
function generateBookCode(bookName: string): string {
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

export interface UploadResult {
  success: boolean
  totalProcessed: number
  totalInserted: number
  totalErrors: number
  errors: Array<{
    row: number
    data: unknown
    error: string
  }>
  duration: number
}

export interface BatchUploadOptions {
  batchSize?: number
  generateIds?: boolean
}

/**
 * Server action for bulk uploading questions
 */
export async function bulkUploadQuestions(
  questions: ParsedQuestion[],
  options: BatchUploadOptions = {}
): Promise<UploadResult> {
  const {
    batchSize = 500,
    generateIds = true
  } = options

  const supabase = createAdminClient()
  const startTime = Date.now()
  const errors: Array<{ row: number; data: unknown; error: string }> = []
  let totalInserted = 0
  let processed = 0

  try {
    // Generate question IDs if needed
    let processedQuestions = questions
    if (generateIds) {
      console.log('Generating question IDs for', questions.length, 'questions')
      processedQuestions = await generateQuestionIds(questions)
      console.log('Generated IDs for', processedQuestions.length, 'questions')
    }

    // Process in batches
    for (let i = 0; i < processedQuestions.length; i += batchSize) {
      const batch = processedQuestions.slice(i, i + batchSize)
      
      try {
        // Convert to database format
        const dbQuestions = batch.map(question => ({
          book_source: question.book_source,
          chapter_name: question.chapter_name,
          question_number_in_book: question.question_number_in_book,
          question_text: question.question_text,
          options: question.options,
          correct_option: question.correct_option,
          solution_text: question.solution_text,
          exam_metadata: question.exam_metadata,
          admin_tags: question.admin_tags,
          question_id: question.question_id
        }))

        // Insert batch
        const { error } = await supabase
          .from('questions')
          .insert(dbQuestions)

        if (error) {
          console.error('Batch insert error:', error)
          console.error('Batch data:', dbQuestions)
          throw new Error(`Batch insert failed: ${error.message}`)
        }

        totalInserted += batch.length
        processed += batch.length

      } catch {
        // Log batch error and continue with individual rows
        
        // Try to insert rows individually
        for (let j = 0; j < batch.length; j++) {
          try {
            const question = batch[j]
            const dbQuestion = {
              book_source: question.book_source,
              chapter_name: question.chapter_name,
              question_number_in_book: question.question_number_in_book,
              question_text: question.question_text,
              options: question.options,
              correct_option: question.correct_option,
              solution_text: question.solution_text,
              exam_metadata: question.exam_metadata,
              admin_tags: question.admin_tags,
              question_id: question.question_id
            }

            const { error: rowError } = await supabase
              .from('questions')
              .insert([dbQuestion])

            if (rowError) {
              console.error(`Row ${i + j + 1} error:`, rowError)
              console.error(`Row ${i + j + 1} data:`, dbQuestion)
              errors.push({
                row: i + j + 1,
                data: question,
                error: `${rowError.message} (Code: ${rowError.code || 'unknown'})`
              })
            } else {
              totalInserted++
            }
          } catch (rowError) {
            errors.push({
              row: i + j + 1,
              data: batch[j],
              error: rowError instanceof Error ? rowError.message : 'Unknown error'
            })
          }
        }
        
        processed += batch.length
      }
    }

    const duration = Date.now() - startTime

    return {
      success: errors.length === 0,
      totalProcessed: processed,
      totalInserted,
      totalErrors: errors.length,
      errors,
      duration
    }

  } catch (error) {
    const duration = Date.now() - startTime
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return {
      success: false,
      totalProcessed: processed,
      totalInserted,
      totalErrors: errors.length + 1,
      errors: [
        ...errors,
        {
          row: 0,
          data: null,
          error: errorMessage
        }
      ],
      duration
    }
  }
}

/**
 * Generates unique question IDs for questions that don't have them
 */
async function generateQuestionIds(questions: ParsedQuestion[]): Promise<ParsedQuestion[]> {
  const processedQuestions: ParsedQuestion[] = []

  for (const question of questions) {
    if (question.question_id) {
      processedQuestions.push(question)
      continue
    }

    try {
      // Get book code
      let bookCode = await getBookCodeByName(question.book_source)
      if (!bookCode) {
        // Generate book code if it doesn't exist
        bookCode = generateBookCode(question.book_source)
        console.log('Generated new book code:', bookCode, 'for book:', question.book_source)
      } else {
        console.log('Found existing book code:', bookCode, 'for book:', question.book_source)
      }

      // Generate unique question ID
      const questionId = await generateUniqueQuestionId(
        bookCode,
        question.chapter_name,
        question.question_number_in_book
      )
      console.log('Generated question ID:', questionId, 'for question:', question.question_text?.substring(0, 50))

      processedQuestions.push({
        ...question,
        question_id: questionId
      })
    } catch (idError) {
      console.error(`ID generation failed for question:`, question)
      console.error(`ID generation error:`, idError)
      // If ID generation fails, keep the question without ID
      // The database will handle this or we can generate a fallback
      processedQuestions.push(question)
    }
  }

  return processedQuestions
}

