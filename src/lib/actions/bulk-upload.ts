'use server'

import { createClient } from '@/lib/supabase/server'
import { ParsedQuestion } from '@/lib/utils/bulk-upload-parsers'
import { generateUniqueQuestionId, generateBookCode } from '@/lib/utils/uniform-id-generator'
import { getBookCodeByName } from '@/lib/actions/id-generation'

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

  const supabase = await createClient()
  const startTime = Date.now()
  const errors: Array<{ row: number; data: unknown; error: string }> = []
  let totalInserted = 0
  let processed = 0

  try {
    // Generate question IDs if needed
    let processedQuestions = questions
    if (generateIds) {
      processedQuestions = await generateQuestionIds(questions)
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
          question_id: question.question_id,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }))

        // Insert batch
        const { error } = await supabase
          .from('questions')
          .upsert(dbQuestions, { 
            onConflict: 'question_id',
            ignoreDuplicates: false 
          })

        if (error) {
          console.error('Batch insert error:', error)
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
              question_id: question.question_id,
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString()
            }

            const { error: rowError } = await supabase
              .from('questions')
              .upsert([dbQuestion], { 
                onConflict: 'question_id',
                ignoreDuplicates: false 
              })

            if (rowError) {
              console.error(`Row ${i + j + 1} error:`, rowError)
              errors.push({
                row: i + j + 1,
                data: question,
                error: rowError.message
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
      }

      // Generate unique question ID
      const questionId = await generateUniqueQuestionId(
        bookCode,
        question.chapter_name,
        question.question_number_in_book
      )

      processedQuestions.push({
        ...question,
        question_id: questionId
      })
    } catch {
      // If ID generation fails, keep the question without ID
      // The database will handle this or we can generate a fallback
      processedQuestions.push(question)
    }
  }

  return processedQuestions
}

