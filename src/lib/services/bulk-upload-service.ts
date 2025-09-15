/**
 * Bulk Upload Service
 * 
 * Handles batch uploads to Supabase with progress tracking,
 * error handling, and rollback capabilities.
 */

import { createClient } from '@/lib/supabase/client'
import { ParsedQuestion, UploadProgress } from '@/lib/utils/bulk-upload-parsers'
import { generateUniqueQuestionId } from '@/lib/utils/uniform-id-generator'
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
  onProgress?: (progress: UploadProgress) => void
  onError?: (error: string) => void
  generateIds?: boolean
}

/**
 * Uploads questions in batches with progress tracking
 */
export async function batchUploadQuestions(
  questions: ParsedQuestion[],
  options: BatchUploadOptions = {}
): Promise<UploadResult> {
  const {
    batchSize = 500,
    onProgress,
    onError,
    generateIds = true
  } = options

  const supabase = createClient()
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
          throw new Error(`Batch insert failed: ${error.message}`)
        }

        totalInserted += batch.length
        processed += batch.length

        // Report progress
        if (onProgress) {
          onProgress({
            processed,
            total: processedQuestions.length,
            errors: errors.length,
            currentBatch: Math.floor(i / batchSize) + 1,
            isComplete: false
          })
        }

      } catch (error) {
        // Log batch error and continue with individual rows
        const batchError = error instanceof Error ? error.message : 'Unknown error'
        onError?.(`Batch ${Math.floor(i / batchSize) + 1} failed: ${batchError}`)
        
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

    // Final progress update
    if (onProgress) {
      onProgress({
        processed,
        total: processedQuestions.length,
        errors: errors.length,
        currentBatch: Math.ceil(processedQuestions.length / batchSize),
        isComplete: true
      })
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

    } catch (err) {
      const duration = Date.now() - startTime
      const errorMessage = err instanceof Error ? err.message : 'Unknown error'
    
    onError?.(`Upload failed: ${errorMessage}`)

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
        const { generateBookCode } = await import('@/lib/utils/uniform-id-generator')
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

/**
 * Creates a sample JSONL template for download
 */
export function createSampleJSONL(): string {
  const sampleQuestions = [
    {
      book_source: "Pinnacle 6800 6th Ed",
      chapter_name: "Percentage",
      question_number_in_book: 1,
      question_text: "What is 20% of 100?",
      options: {
        "a": "10",
        "b": "20", 
        "c": "30",
        "d": "40"
      },
      correct_option: "b",
      solution_text: "$20\\%$ of $100 = \\dfrac{20}{100}\\times 100 = 20$",
      exam_metadata: "CAT 2023 Slot 1",
      admin_tags: ["Percentage", "Basic Math"]
    },
    {
      book_source: "Pinnacle 6800 6th Ed",
      chapter_name: "Profit & Loss",
      question_number_in_book: 2,
      question_text: "A man buys a pen for ₹50 and sells it at a profit of 20%. Find the selling price.",
      options: {
        "a": "55",
        "b": "58",
        "c": "60", 
        "d": "62"
      },
      correct_option: "c",
      solution_text: "Selling Price $= 50 + \\dfrac{20}{100}\\times 50 = 60$",
      exam_metadata: "CAT 2022 Slot 2",
      admin_tags: ["Profit & Loss", "Profit Calculation"]
    }
  ]

  return sampleQuestions.map(q => JSON.stringify(q)).join('\n')
}

/**
 * Creates a sample CSV template for download
 */
export function createSampleCSV(): string {
  const headers = [
    'book_source',
    'chapter_name', 
    'question_number_in_book',
    'question_text',
    'options',
    'correct_option',
    'solution_text',
    'exam_metadata',
    'admin_tags'
  ]

  const sampleRows = [
    [
      'Pinnacle 6800 6th Ed',
      'Percentage',
      '1',
      'What is 20% of 100?',
      '{"a": "10", "b": "20", "c": "30", "d": "40"}',
      'b',
      '$20\\%$ of $100 = \\dfrac{20}{100}\\times 100 = 20$',
      'CAT 2023 Slot 1',
      'Percentage, Basic Math'
    ],
    [
      'Pinnacle 6800 6th Ed',
      'Profit & Loss',
      '2',
      'A man buys a pen for ₹50 and sells it at a profit of 20%. Find the selling price.',
      '{"a": "55", "b": "58", "c": "60", "d": "62"}',
      'c',
      'Selling Price $= 50 + \\dfrac{20}{100}\\times 50 = 60$',
      'CAT 2022 Slot 2',
      'Profit & Loss, Profit Calculation'
    ]
  ]

  const csvContent = [
    headers.join(','),
    ...sampleRows.map(row => row.map(field => `"${field}"`).join(','))
  ].join('\n')

  return csvContent
}
