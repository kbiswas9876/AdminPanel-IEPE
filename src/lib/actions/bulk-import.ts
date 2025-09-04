'use server'

import { createAdminClient, type Question } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import Papa from 'papaparse'

export interface ImportResult {
  success: boolean
  message: string
  importedCount?: number
  errors?: string[]
}

export interface CSVRow {
  question_id: string
  book_source: string
  chapter_name: string
  question_number_in_book?: string
  question_text: string
  options?: string
  correct_option?: string
  solution_text?: string
  exam_metadata?: string
  admin_tags?: string
}

// Parse and validate CSV data
function parseCSVData(csvContent: string): { data: Question[], errors: string[] } {
  const errors: string[] = []
  const questions: Question[] = []
  
  try {
    const result = Papa.parse<CSVRow>(csvContent, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      transform: (value) => value.trim()
    })
    
    if (result.errors.length > 0) {
      errors.push(`CSV parsing errors: ${result.errors.map(e => e.message).join(', ')}`)
      return { data: [], errors }
    }
    
    result.data.forEach((row, index) => {
      const rowNumber = index + 2 // +2 because index is 0-based and we skip header
      
      try {
        // Validate required fields
        if (!row.question_id) {
          errors.push(`Row ${rowNumber}: question_id is required`)
          return
        }
        if (!row.book_source) {
          errors.push(`Row ${rowNumber}: book_source is required`)
          return
        }
        if (!row.chapter_name) {
          errors.push(`Row ${rowNumber}: chapter_name is required`)
          return
        }
        if (!row.question_text) {
          errors.push(`Row ${rowNumber}: question_text is required`)
          return
        }
        
        // Parse options JSON
        let options: { a: string; b: string; c: string; d: string } | undefined = undefined
        if (row.options) {
          try {
            options = JSON.parse(row.options)
            // Validate options structure
            if (typeof options !== 'object' || !options.a || !options.b || !options.c || !options.d) {
              errors.push(`Row ${rowNumber}: options must be valid JSON with keys a, b, c, d`)
              return
            }
          } catch {
            errors.push(`Row ${rowNumber}: Invalid JSON format in options column`)
            return
          }
        }
        
        // Parse admin_tags
        let adminTags: string[] = []
        if (row.admin_tags) {
          adminTags = row.admin_tags.split(',').map(tag => tag.trim()).filter(Boolean)
        }
        
        // Parse question_number_in_book
        let questionNumber: number | undefined = undefined
        if (row.question_number_in_book) {
          const parsed = parseInt(row.question_number_in_book)
          if (!isNaN(parsed)) {
            questionNumber = parsed
          }
        }
        
        // Validate correct_option
        if (row.correct_option && !['a', 'b', 'c', 'd'].includes(row.correct_option.toLowerCase())) {
          errors.push(`Row ${rowNumber}: correct_option must be a, b, c, or d`)
          return
        }
        
        const question: Question = {
          question_id: row.question_id,
          book_source: row.book_source,
          chapter_name: row.chapter_name,
          question_number_in_book: questionNumber,
          question_text: row.question_text,
          options: options,
          correct_option: row.correct_option?.toLowerCase() || undefined,
          solution_text: row.solution_text || undefined,
          exam_metadata: row.exam_metadata || undefined,
          admin_tags: adminTags.length > 0 ? adminTags : undefined,
          created_at: new Date().toISOString()
        }
        
        questions.push(question)
        
      } catch (error) {
        errors.push(`Row ${rowNumber}: ${error instanceof Error ? error.message : 'Unknown error'}`)
      }
    })
    
  } catch (error) {
    errors.push(`Failed to parse CSV: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
  
  return { data: questions, errors }
}

// Main bulk import Server Action
export async function bulkImportQuestions(formData: FormData): Promise<ImportResult> {
  try {
    const file = formData.get('csvFile') as File
    
    if (!file) {
      return {
        success: false,
        message: 'No file provided'
      }
    }
    
    if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
      return {
        success: false,
        message: 'Please upload a CSV file'
      }
    }
    
    // Read file content
    const csvContent = await file.text()
    
    // Parse and validate CSV data
    const { data: questions, errors } = parseCSVData(csvContent)
    
    if (errors.length > 0) {
      return {
        success: false,
        message: 'Validation errors found',
        errors: errors
      }
    }
    
    if (questions.length === 0) {
      return {
        success: false,
        message: 'No valid questions found in the CSV file'
      }
    }
    
    // Batch insert into database
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('questions')
      .insert(questions)
    
    if (error) {
      console.error('Database insertion error:', error)
      return {
        success: false,
        message: `Database error: ${error.message}`
      }
    }
    
    // Revalidate and redirect
    revalidatePath('/content')
    
    return {
      success: true,
      message: `Successfully imported ${questions.length} questions!`,
      importedCount: questions.length
    }
    
  } catch (error) {
    console.error('Bulk import error:', error)
    return {
      success: false,
      message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}`
    }
  }
}