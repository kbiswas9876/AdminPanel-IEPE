'use server'

import { createAdminClient, type Question, type QuestionsResponse } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function getQuestions(
  page: number = 1,
  limit: number = 20,
  search?: string
): Promise<QuestionsResponse> {
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
    
    return {
      data: data as Question[],
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
    
    return data as Question
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
