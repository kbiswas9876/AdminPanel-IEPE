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
    
    // Data is already properly sanitized during bulk upload, no need to sanitize again
    const sanitizedQuestions = data as Question[]
    
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
    
    // Data is already properly sanitized during bulk upload, no need to sanitize again
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
// Analyze multiple questions for safe deletion without attempting deletion
export async function analyzeQuestionsForDeletion(questionIds: number[]): Promise<{ 
  safeToDelete: number[]; 
  usedInTests: { questionId: number; testNames: string[] }[]; 
  canProceed: boolean;
  totalSafeCount: number;
  totalUsedCount: number;
}> {
  try {
    console.log('🔍 Analyzing questions for deletion:', questionIds)
    
    if (!questionIds || questionIds.length === 0) {
      console.log('❌ No question IDs provided')
      return {
        safeToDelete: [],
        usedInTests: [],
        canProceed: false,
        totalSafeCount: 0,
        totalUsedCount: 0
      }
    }

    const supabase = createAdminClient()
    
    // First, let's verify what's actually in the test_questions table
    console.log('🔍 Verifying test_questions table structure...')
    const { data: allTestQuestions, error: verifyError } = await supabase
      .from('test_questions')
      .select('question_id')
      .limit(5)
    
    if (verifyError) {
      console.error('❌ Error verifying test_questions table:', verifyError)
    } else {
      console.log('📊 Sample test_questions data:', allTestQuestions)
    }
    
    // Check if any of the questions are being used in tests
    console.log('🔍 Querying test_questions table for question IDs:', questionIds)
    const { data: testQuestions, error: testQuestionsError } = await supabase
      .from('test_questions')
      .select(`
        question_id,
        test_name,
        test_status
      `)
      .in('question_id', questionIds)
    
    if (testQuestionsError) {
      console.error('❌ Error analyzing question usage:', testQuestionsError)
      console.error('❌ Error details:', testQuestionsError.message, testQuestionsError.details, testQuestionsError.hint)
      throw new Error('Failed to analyze question usage')
    }
    
    console.log('📊 Raw test questions found:', testQuestions)
    console.log('📊 Query result count:', testQuestions?.length || 0)
    
    // Group by question_id to get test names for each question
    const usedQuestions = new Map<number, string[]>()
    
    if (testQuestions && testQuestions.length > 0) {
      testQuestions.forEach((tq: { question_id: number; test_name: string; test_status: string }) => {
        const questionId = tq.question_id
        const testName = tq.test_name || 'Unknown Test'
        const testStatus = tq.test_status || 'Unknown'
        
        console.log(`📝 Question ${questionId} used in test: ${testName} (${testStatus})`)
        
        const displayName = testStatus !== 'Unknown' ? `${testName} (${testStatus})` : testName
        
        if (!usedQuestions.has(questionId)) {
          usedQuestions.set(questionId, [])
        }
        usedQuestions.get(questionId)!.push(displayName)
      })
    }
    
    console.log('🗺️ Used questions map:', usedQuestions)
    
    // Categorize questions
    const safeToDelete: number[] = []
    const usedInTests: { questionId: number; testNames: string[] }[] = []
    
    questionIds.forEach(questionId => {
      const testNames = usedQuestions.get(questionId)
      if (testNames && testNames.length > 0) {
        usedInTests.push({ questionId, testNames })
        console.log(`⚠️ Question ${questionId} is in use:`, testNames)
      } else {
        safeToDelete.push(questionId)
        console.log(`✅ Question ${questionId} is safe to delete`)
      }
    })
    
    const result = {
      safeToDelete,
      usedInTests,
      canProceed: safeToDelete.length > 0,
      totalSafeCount: safeToDelete.length,
      totalUsedCount: usedInTests.length
    }
    
    console.log('🎯 Analysis result:', result)
    return result
  } catch (error) {
    console.error('❌ Unexpected error analyzing questions:', error)
    throw new Error('Failed to analyze questions for deletion')
  }
}

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
        tests!inner(name, status)
      `)
      .eq('question_id', questionId)
    
    if (testQuestionsError) {
      console.error('Error checking question usage:', testQuestionsError)
      return { isUsed: false, testCount: 0, testNames: [] }
    }
    
    const testCount = testQuestions?.length || 0
    const testNames = testQuestions?.map((tq: { test_id: number; tests: { name: string; status: string }[] }) => {
      const test = tq.tests?.[0]
      if (test) {
        const testName = test.name || 'Unknown Test'
        const testStatus = test.status || 'Unknown'
        return testStatus !== 'Unknown' ? `${testName} (${testStatus})` : testName
      }
      return 'Unknown Test'
    }) || []
    
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

// Delete multiple questions without usage checks (for use after analysis)
export async function deleteQuestionsDirectly(questionIds: number[]): Promise<{ 
  success: boolean; 
  message: string; 
  deletedCount?: number;
}> {
  try {
    console.log('🗑️ Direct deletion called for questions:', questionIds)
    
    if (!questionIds || questionIds.length === 0) {
      console.log('❌ No question IDs provided for deletion')
      return {
        success: false,
        message: 'No questions selected for deletion'
      }
    }

    const supabase = createAdminClient()
    
    // Direct deletion without usage checks (trust that analysis was done)
    console.log('🚀 Attempting direct deletion...')
    const { error: deleteError } = await supabase
      .from('questions')
      .delete()
      .in('id', questionIds)
    
    if (deleteError) {
      console.error('❌ Error deleting questions:', deleteError)
      return {
        success: false,
        message: 'Failed to delete questions. Please try again.'
      }
    }
    
    console.log('✅ Questions deleted successfully')
    
    // Revalidate the content page to refresh the UI
    revalidatePath('/content')
    
    const result = {
      success: true,
      message: `Successfully deleted ${questionIds.length} question${questionIds.length !== 1 ? 's' : ''}`,
      deletedCount: questionIds.length
    }
    
    console.log('🎉 Deletion result:', result)
    return result
    
  } catch (error) {
    console.error('❌ Unexpected error in direct delete:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while deleting questions'
    }
  }
}

// Bulk update difficulty for multiple questions
export async function bulkUpdateDifficulty(
  questionIds: number[], 
  newDifficulty: 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard'
): Promise<{ success: boolean; message: string; updatedCount?: number }> {
  try {
    console.log('🔄 Bulk difficulty update called for questions:', questionIds)
    console.log('📊 New difficulty:', newDifficulty)
    
    if (!questionIds || questionIds.length === 0) {
      console.log('❌ No question IDs provided for difficulty update')
      return {
        success: false,
        message: 'No questions selected for difficulty update'
      }
    }

    const supabase = createAdminClient()
    
    // Validate difficulty value
    const validDifficulties = ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard']
    if (!validDifficulties.includes(newDifficulty)) {
      return {
        success: false,
        message: 'Invalid difficulty level provided'
      }
    }
    
    // Execute bulk update query
    console.log('🚀 Attempting bulk difficulty update...')
    const { data, error: updateError } = await supabase
      .from('questions')
      .update({ difficulty: newDifficulty })
      .in('id', questionIds)
      .select('id')
    
    if (updateError) {
      console.error('❌ Error updating question difficulties:', updateError)
      return {
        success: false,
        message: 'Failed to update question difficulties. Please try again.'
      }
    }
    
    const updatedCount = data?.length || 0
    console.log('✅ Difficulty update successful, updated count:', updatedCount)
    
    // Revalidate the content page to refresh the UI
    revalidatePath('/content')
    
    const result = {
      success: true,
      message: `Successfully updated ${updatedCount} question${updatedCount !== 1 ? 's' : ''} to ${newDifficulty}`,
      updatedCount
    }
    
    console.log('🎉 Difficulty update result:', result)
    return result
    
  } catch (error) {
    console.error('❌ Unexpected error in bulk difficulty update:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while updating question difficulties'
    }
  }
}

// Bulk delete multiple questions with data integrity checks (legacy function)
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
        tests!inner(name, status)
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
      
      testQuestions.forEach((tq: { question_id: number; tests: { name: string; status: string }[] }) => {
        const questionId = tq.question_id
        const test = tq.tests?.[0]
        
        if (test) {
          const testName = test.name || 'Unknown Test'
          const testStatus = test.status || 'Unknown'
          const displayName = testStatus !== 'Unknown' ? `${testName} (${testStatus})` : testName
          
          if (!usedQuestions.has(questionId)) {
            usedQuestions.set(questionId, [])
          }
          usedQuestions.get(questionId)!.push(displayName)
        }
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
export async function updateQuestionInPlace(
  data: Partial<Question> & { id: number }
): Promise<{ 
  success: boolean; 
  message: string; 
  data?: Question;
}> {
  try {
    if (!data.id) {
      return {
        success: false,
        message: 'Question ID is required for update'
      }
    }

    const supabase = createAdminClient()
    
    // Extract the ID and create a clean update payload
    const { id, ...updateFields } = data
    
    // CRITICAL FIX: Only include fields that are actually being changed
    // This prevents foreign key constraint violations for bookmarked questions
    const updateData: Partial<DBQuestion> = {}
    
    // Only add fields that are present in the updateFields object
    if ('book_source' in updateFields && updateFields.book_source !== undefined) {
      updateData.book_source = updateFields.book_source as string
    }
    if ('chapter_name' in updateFields && updateFields.chapter_name !== undefined) {
      updateData.chapter_name = updateFields.chapter_name as string
    }
    if ('question_number_in_book' in updateFields && updateFields.question_number_in_book !== undefined) {
      updateData.question_number_in_book = updateFields.question_number_in_book as number
    }
    if ('question_text' in updateFields && updateFields.question_text !== undefined) {
      updateData.question_text = updateFields.question_text as string
    }
    if ('options' in updateFields && updateFields.options !== undefined) {
      updateData.options = updateFields.options as { a: string; b: string; c: string; d: string; }
    }
    if ('correct_option' in updateFields && updateFields.correct_option !== undefined) {
      updateData.correct_option = updateFields.correct_option as string
    }
    if ('solution_text' in updateFields && updateFields.solution_text !== undefined) {
      updateData.solution_text = updateFields.solution_text as string
    }
    if ('exam_metadata' in updateFields && updateFields.exam_metadata !== undefined) {
      updateData.exam_metadata = updateFields.exam_metadata as string
    }
    if ('admin_tags' in updateFields && updateFields.admin_tags !== undefined) {
      updateData.admin_tags = updateFields.admin_tags as string[]
    }
    if ('difficulty' in updateFields && updateFields.difficulty !== undefined) {
      updateData.difficulty = updateFields.difficulty as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard'
    }
    
    // If no fields to update, return early
    if (Object.keys(updateData).length === 0) {
      return {
        success: false,
        message: 'No fields provided for update'
      }
    }
    
    // Execute the update with only the changed fields
    const { data: updatedQuestion, error } = await supabase
      .from('questions')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating question:', error)
      return {
        success: false,
        message: `Failed to update question: ${error.message}`
      }
    }
    
    return {
      success: true,
      message: 'Question updated successfully!',
      data: updatedQuestion
    }
    
  } catch (error) {
    console.error('Unexpected error updating question:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while updating the question'
    }
  }
}
