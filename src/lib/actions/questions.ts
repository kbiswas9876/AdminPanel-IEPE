'use server'

import { createAdminClient, type Question as DBQuestion } from '@/lib/supabase/admin'
import type { Question } from '@/lib/types'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { sanitizeQuestionForStorage, sanitizeQuestionForRendering } from '@/lib/utils/latex-sanitization'
import { generateQuestionId } from '@/lib/utils/question-id-generator'

export async function getQuestions(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<{ data: Question[]; count: number; error?: string }> {
  try {
    const supabase = createAdminClient()
    
    // Calculate offset for pagination
    const offset = (page - 1) * limit
    
    // Build the query
    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)
    
    // Add search filter if provided
    if (search && search.trim()) {
      query = query.or(`question_text.ilike.%${search}%,question_id.ilike.%${search}%`)
    }
    
    const { data, error, count } = await query
    
    if (error) {
      console.error('Error fetching questions:', error)
      return {
        data: [],
        count: 0,
        error: error.message
      }
    }
    
    // Sanitize questions for rendering (convert \\ to \)
    const sanitizedQuestions = (data as Question[]).map(q => sanitizeQuestionForRendering(q) as Question)
    
    return {
      data: sanitizedQuestions,
      count: count || 0
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      data: [],
      count: 0,
      error: 'An unexpected error occurred'
    }
  }
}


// Get a single question by ID
export async function getQuestionById(id: number): Promise<Question | null> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('questions')
      .select('*')
      .eq('id', id)
      .single()
    
    if (error) {
      console.error('Error fetching question:', error)
      return null
    }
    
    // Sanitize question for rendering (convert \\ to \)
    return sanitizeQuestionForRendering(data as Question) as Question
  } catch (error) {
    console.error('Unexpected error:', error)
    return null
  }
}

// Create a new question
export async function createQuestion(formData: FormData) {
  try {
    const supabase = createAdminClient()
    
    // Extract form data
    const questionData = {
      question_id: formData.get('question_id') as string,
      book_source: formData.get('book_source') as string,
      chapter_name: formData.get('chapter_name') as string,
      question_number_in_book: formData.get('question_number_in_book') ? 
        parseInt(formData.get('question_number_in_book') as string) : null,
      question_text: formData.get('question_text') as string,
      options: {
        a: formData.get('option_a') as string,
        b: formData.get('option_b') as string,
        c: formData.get('option_c') as string,
        d: formData.get('option_d') as string,
      },
      correct_option: formData.get('correct_option') as string,
      solution_text: formData.get('solution_text') as string,
      exam_metadata: formData.get('exam_metadata') as string,
      admin_tags: formData.get('admin_tags') ? 
        (formData.get('admin_tags') as string).split(',').map(tag => tag.trim()).filter(Boolean) : 
        [],
    }
    
    // Validate required fields
    if (!questionData.question_id || !questionData.book_source || !questionData.chapter_name || !questionData.question_text) {
      throw new Error('Required fields are missing')
    }
    
    const { error } = await supabase
      .from('questions')
      .insert([questionData])
    
    if (error) {
      console.error('Error creating question:', error)
      throw new Error(error.message)
    }
    
    revalidatePath('/content')
    redirect('/content')
  } catch (error) {
    console.error('Error creating question:', error)
    throw error
  }
}

// Update an existing question
export async function updateQuestion(id: number, formData: FormData) {
  try {
    const supabase = createAdminClient()
    
    // Extract form data
    const questionData = {
      question_id: formData.get('question_id') as string,
      book_source: formData.get('book_source') as string,
      chapter_name: formData.get('chapter_name') as string,
      question_number_in_book: formData.get('question_number_in_book') ? 
        parseInt(formData.get('question_number_in_book') as string) : null,
      question_text: formData.get('question_text') as string,
      options: {
        a: formData.get('option_a') as string,
        b: formData.get('option_b') as string,
        c: formData.get('option_c') as string,
        d: formData.get('option_d') as string,
      },
      correct_option: formData.get('correct_option') as string,
      solution_text: formData.get('solution_text') as string,
      exam_metadata: formData.get('exam_metadata') as string,
      admin_tags: formData.get('admin_tags') ? 
        (formData.get('admin_tags') as string).split(',').map(tag => tag.trim()).filter(Boolean) : 
        [],
    }
    
    // Validate required fields
    if (!questionData.question_id || !questionData.book_source || !questionData.chapter_name || !questionData.question_text) {
      throw new Error('Required fields are missing')
    }
    
    const { error } = await supabase
      .from('questions')
      .update(questionData)
      .eq('id', id)
    
    if (error) {
      console.error('Error updating question:', error)
      throw new Error(error.message)
    }
    
    revalidatePath('/content')
    redirect('/content')
  } catch (error) {
    console.error('Error updating question:', error)
    throw error
  }
}

// Check if a question is being used in any tests
export async function checkQuestionUsage(questionId: number): Promise<{ 
  isUsed: boolean; 
  testCount: number; 
  testNames: string[] 
}> {
  try {
    const supabase = createAdminClient()
    
    // Get all tests that use this question
    const { data: testQuestions, error: testQuestionsError } = await supabase
      .from('test_questions')
      .select(`
        test_id,
        tests!inner(name)
      `)
      .eq('question_id', questionId)
    
    if (testQuestionsError) {
      console.error('Error checking question usage:', testQuestionsError)
      return { isUsed: false, testCount: 0, testNames: [] }
    }
    
    const testCount = testQuestions?.length || 0
    const testNames = testQuestions?.map((tq: { test_id: number; tests: { name: string }[] }) => tq.tests?.[0]?.name || 'Unknown Test') || []
    
    return {
      isUsed: testCount > 0,
      testCount,
      testNames
    }
  } catch (error) {
    console.error('Unexpected error checking question usage:', error)
    return { isUsed: false, testCount: 0, testNames: [] }
  }
}

// Delete a question with integrity protection
export async function deleteQuestion(id: number): Promise<{ 
  success: boolean; 
  message: string; 
  testCount?: number; 
  testNames?: string[] 
}> {
  try {
    const supabase = createAdminClient()
    
    // First, check if the question is being used in any tests
    const usageCheck = await checkQuestionUsage(id)
    
    if (usageCheck.isUsed) {
      return {
        success: false,
        message: `Cannot delete this question because it is currently used in ${usageCheck.testCount} test(s): ${usageCheck.testNames.join(', ')}. Please remove it from those tests first.`,
        testCount: usageCheck.testCount,
        testNames: usageCheck.testNames
      }
    }
    
    // If not used in any tests, proceed with deletion
    const { error } = await supabase
      .from('questions')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting question:', error)
      return {
        success: false,
        message: `Failed to delete question: ${error.message}`
      }
    }
    
    revalidatePath('/content')
    
    return {
      success: true,
      message: 'Question deleted successfully!'
    }
  } catch (error) {
    console.error('Unexpected error deleting question:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while deleting the question'
    }
  }
}

// Bulk delete multiple questions with data integrity checks
export async function deleteMultipleQuestions(questionIds: number[]): Promise<{ 
  success: boolean; 
  message: string; 
  deletedCount?: number;
  usedInTests?: { questionId: number; testNames: string[] }[]
}> {
  try {
    if (!questionIds || questionIds.length === 0) {
      return {
        success: false,
        message: 'No questions selected for deletion'
      }
    }

    const supabase = createAdminClient()
    
    // Step 1: Check if any of the questions are being used in tests
    const { data: testQuestions, error: testQuestionsError } = await supabase
      .from('test_questions')
      .select(`
        question_id,
        tests!inner(name)
      `)
      .in('question_id', questionIds)
    
    if (testQuestionsError) {
      console.error('Error checking question usage:', testQuestionsError)
      return { 
        success: false, 
        message: 'Failed to check question usage. Please try again.' 
      }
    }
    
    // Step 2: If any questions are in use, return error with details
    if (testQuestions && testQuestions.length > 0) {
      // Group by question_id to get test names for each question
      const usedQuestions = new Map<number, string[]>()
      
      testQuestions.forEach((tq: { question_id: number; tests: { name: string }[] }) => {
        const questionId = tq.question_id
        const testName = tq.tests?.[0]?.name || 'Unknown Test'
        
        if (!usedQuestions.has(questionId)) {
          usedQuestions.set(questionId, [])
        }
        usedQuestions.get(questionId)!.push(testName)
      })
      
      const usedInTests = Array.from(usedQuestions.entries()).map(([questionId, testNames]) => ({
        questionId,
        testNames
      }))
      
      return {
        success: false,
        message: `Cannot delete questions. ${usedInTests.length} of the selected questions are currently used in existing mock tests. Please remove them from those tests first.`,
        usedInTests
      }
    }
    
    // Step 3: If no questions are in use, proceed with bulk deletion
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .in('id', questionIds)
    
    if (deleteError) {
      console.error('Error deleting questions:', deleteError)
      return {
        success: false,
        message: 'Failed to delete questions. Please try again.'
      }
    }
    
    // Step 4: Revalidate the content page to refresh the UI
    revalidatePath('/content')
    
    return {
      success: true,
      message: `Successfully deleted ${questionIds.length} question${questionIds.length !== 1 ? 's' : ''}`,
      deletedCount: questionIds.length
    }
    
  } catch (error) {
    console.error('Unexpected error in bulk delete:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while deleting questions'
    }
  }
}

// Update a single question (new in-place editor version)
export async function updateQuestionInPlace(question: Question): Promise<{ 
  success: boolean; 
  message: string; 
}> {
  try {
    if (!question.id) {
      return {
        success: false,
        message: 'Question ID is required for update'
      }
    }

    const supabase = createAdminClient()
    
    // Sanitize question for storage (convert \ to \\ for JSON compatibility)
    const sanitizedQuestion = sanitizeQuestionForStorage(question)
    
    // Generate automatic question_id if not provided or if it's a new question
    const autoGeneratedQuestionId = generateQuestionId(
      sanitizedQuestion.book_source as string,
      sanitizedQuestion.chapter_name as string,
      sanitizedQuestion.question_number_in_book as number
    )
    
    // Convert Question type to DBQuestion type for database update
    const updateData: Partial<DBQuestion> = {
      question_id: autoGeneratedQuestionId,
      book_source: sanitizedQuestion.book_source as string,
      chapter_name: sanitizedQuestion.chapter_name as string,
      question_number_in_book: sanitizedQuestion.question_number_in_book as number | undefined,
      question_text: sanitizedQuestion.question_text as string,
      options: sanitizedQuestion.options as { a: string; b: string; c: string; d: string; } | undefined,
      correct_option: sanitizedQuestion.correct_option as string | undefined,
      solution_text: sanitizedQuestion.solution_text as string | undefined,
      exam_metadata: sanitizedQuestion.exam_metadata as string | undefined,
      admin_tags: sanitizedQuestion.admin_tags as string[] | undefined
    }
    
    const { error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', question.id)
    
    if (error) {
      console.error('Error updating question:', error)
      return {
        success: false,
        message: `Failed to update question: ${error.message}`
      }
    }
    
    // Note: We don't call revalidatePath here to avoid page refresh
    // The UI will be updated optimistically via the questions context
    
    return {
      success: true,
      message: 'Question updated successfully!'
    }
    
  } catch (error) {
    console.error('Unexpected error updating question:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while updating the question'
    }
  }
}
