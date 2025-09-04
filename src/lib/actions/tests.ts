'use server'

import { createAdminClient, type Test, type TestCreationData } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Get all tests
export async function getAllTests(): Promise<Test[]> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('tests')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (error) {
      console.error('Error fetching tests:', error)
      return []
    }
    
    return data as Test[]
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

// Get unique chapter names from questions table
export async function getChapterNames(): Promise<string[]> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('questions')
      .select('chapter_name')
      .not('chapter_name', 'is', null)
    
    if (error) {
      console.error('Error fetching chapter names:', error)
      return []
    }
    
    // Extract unique chapter names
    const uniqueChapters = [...new Set(data.map(item => item.chapter_name))].filter(Boolean)
    return uniqueChapters.sort()
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

// Get question count for a specific chapter
export async function getChapterQuestionCount(chapterName: string): Promise<number> {
  try {
    const supabase = createAdminClient()
    
    const { count, error } = await supabase
      .from('questions')
      .select('*', { count: 'exact', head: true })
      .eq('chapter_name', chapterName)
    
    if (error) {
      console.error('Error fetching question count:', error)
      return 0
    }
    
    return count || 0
  } catch (error) {
    console.error('Unexpected error:', error)
    return 0
  }
}

// Create a new test with questions
export async function createTest(testData: TestCreationData): Promise<{ success: boolean; message: string; testId?: number }> {
  try {
    const supabase = createAdminClient()
    
    // First, create the test record
    const { data: testResult, error: testError } = await supabase
      .from('tests')
      .insert([{
        name: testData.name,
        description: testData.description,
        total_time_minutes: testData.total_time_minutes,
        marks_per_correct: testData.marks_per_correct,
        negative_marks_per_incorrect: testData.negative_marks_per_incorrect,
        status: 'draft'
      }])
      .select()
      .single()
    
    if (testError) {
      console.error('Error creating test:', testError)
      return {
        success: false,
        message: `Failed to create test: ${testError.message}`
      }
    }
    
    const testId = testResult.id
    
    // Now, collect questions based on the blueprint
    const allQuestionIds: string[] = []
    
    for (const blueprintItem of testData.blueprint) {
      if (blueprintItem.question_count > 0) {
        // Get random questions from this chapter
        const { data: questions, error: questionsError } = await supabase
          .from('questions')
          .select('question_id')
          .eq('chapter_name', blueprintItem.chapter_name)
          .limit(blueprintItem.question_count)
        
        if (questionsError) {
          console.error(`Error fetching questions for chapter ${blueprintItem.chapter_name}:`, questionsError)
          continue
        }
        
        // Add the question IDs to our collection
        allQuestionIds.push(...questions.map(q => q.question_id))
      }
    }
    
    if (allQuestionIds.length === 0) {
      // If no questions were selected, delete the test and return error
      await supabase.from('tests').delete().eq('id', testId)
      return {
        success: false,
        message: 'No questions were selected for the test. Please ensure at least one chapter has questions selected.'
      }
    }
    
    // Create test_questions records
    const testQuestionsData = allQuestionIds.map(questionId => ({
      test_id: testId,
      question_id: questionId
    }))
    
    const { error: testQuestionsError } = await supabase
      .from('test_questions')
      .insert(testQuestionsData)
    
    if (testQuestionsError) {
      console.error('Error creating test questions:', testQuestionsError)
      // Clean up the test record
      await supabase.from('tests').delete().eq('id', testId)
      return {
        success: false,
        message: `Failed to add questions to test: ${testQuestionsError.message}`
      }
    }
    
    revalidatePath('/tests')
    
    return {
      success: true,
      message: `Test "${testData.name}" created successfully with ${allQuestionIds.length} questions!`,
      testId
    }
  } catch (error) {
    console.error('Unexpected error creating test:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while creating the test'
    }
  }
}

// Update test (for editing draft tests)
export async function updateTest(testId: number, testData: Partial<TestCreationData>): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const updateData: Record<string, unknown> = {}
    if (testData.name) updateData.name = testData.name
    if (testData.description !== undefined) updateData.description = testData.description
    if (testData.total_time_minutes) updateData.total_time_minutes = testData.total_time_minutes
    if (testData.marks_per_correct) updateData.marks_per_correct = testData.marks_per_correct
    if (testData.negative_marks_per_incorrect) updateData.negative_marks_per_incorrect = testData.negative_marks_per_incorrect
    updateData.updated_at = new Date().toISOString()
    
    const { error } = await supabase
      .from('tests')
      .update(updateData)
      .eq('id', testId)
    
    if (error) {
      console.error('Error updating test:', error)
      return {
        success: false,
        message: `Failed to update test: ${error.message}`
      }
    }
    
    revalidatePath('/tests')
    
    return {
      success: true,
      message: 'Test updated successfully!'
    }
  } catch (error) {
    console.error('Unexpected error updating test:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while updating the test'
    }
  }
}

// Publish test (schedule it)
export async function publishTest(testId: number, startTime: string, endTime: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('tests')
      .update({
        status: 'scheduled',
        start_time: startTime,
        end_time: endTime,
        updated_at: new Date().toISOString()
      })
      .eq('id', testId)
    
    if (error) {
      console.error('Error publishing test:', error)
      return {
        success: false,
        message: `Failed to publish test: ${error.message}`
      }
    }
    
    revalidatePath('/tests')
    
    return {
      success: true,
      message: 'Test published and scheduled successfully!'
    }
  } catch (error) {
    console.error('Unexpected error publishing test:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while publishing the test'
    }
  }
}

// Delete test and all associated test_questions
export async function deleteTest(testId: number): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    // First, delete all test_questions
    const { error: testQuestionsError } = await supabase
      .from('test_questions')
      .delete()
      .eq('test_id', testId)
    
    if (testQuestionsError) {
      console.error('Error deleting test questions:', testQuestionsError)
      return {
        success: false,
        message: `Failed to delete test questions: ${testQuestionsError.message}`
      }
    }
    
    // Then, delete the test
    const { error: testError } = await supabase
      .from('tests')
      .delete()
      .eq('id', testId)
    
    if (testError) {
      console.error('Error deleting test:', testError)
      return {
        success: false,
        message: `Failed to delete test: ${testError.message}`
      }
    }
    
    revalidatePath('/tests')
    
    return {
      success: true,
      message: 'Test deleted successfully!'
    }
  } catch (error) {
    console.error('Unexpected error deleting test:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while deleting the test'
    }
  }
}

// Get test details with question count
export async function getTestDetails(testId: number): Promise<{ test: Test | null; questionCount: number }> {
  try {
    const supabase = createAdminClient()
    
    // Get test details
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single()
    
    if (testError) {
      console.error('Error fetching test:', testError)
      return { test: null, questionCount: 0 }
    }
    
    // Get question count
    const { count, error: countError } = await supabase
      .from('test_questions')
      .select('*', { count: 'exact', head: true })
      .eq('test_id', testId)
    
    if (countError) {
      console.error('Error fetching question count:', countError)
      return { test: test as Test, questionCount: 0 }
    }
    
    return { test: test as Test, questionCount: count || 0 }
  } catch (error) {
    console.error('Unexpected error:', error)
    return { test: null, questionCount: 0 }
  }
}
