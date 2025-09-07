'use server'

import { createAdminClient, type Test, type TestCreationData } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'
import type { Question } from '@/lib/supabase/admin'
import { redirect } from 'next/navigation'
import type { TestQuestionSlot, TestBlueprint } from '@/lib/types'
// Types are imported from the central types file when needed

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

// Get all tests with aggregated question counts
export async function getAllTestsWithCounts(): Promise<Array<Test & { question_count: number }>> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('tests')
      .select('*, test_questions(count)')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching tests with counts:', error)
      return []
    }

    const result: Array<Test & { question_count: number }> = (data as Array<Test & { test_questions: Array<{ count: number }> }>).map((row) => {
      const { test_questions, ...testFields } = row
      const count = Array.isArray(test_questions) && test_questions.length > 0 && typeof test_questions[0].count === 'number'
        ? test_questions[0].count
        : (Array.isArray(test_questions) ? test_questions.length : 0)
      return {
        ...(testFields as Test),
        question_count: count
      }
    })

    return result
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

// Get chapters with their unique admin tags
export async function getChaptersWithTags(): Promise<Array<{ chapter_name: string; tags: string[]; difficultyCounts: Record<string, number> }>> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('questions')
      .select('chapter_name, admin_tags, difficulty')
      .not('chapter_name', 'is', null)

    if (error) {
      console.error('Error fetching chapters with tags:', error)
      return []
    }

    const chapterToTags = new Map<string, Set<string>>()
    for (const row of (data as Array<{ chapter_name: string | null; admin_tags: string[] | null; difficulty?: string | null }>)) {
      const chapter = row.chapter_name
      if (!chapter) continue
      if (!chapterToTags.has(chapter)) {
        chapterToTags.set(chapter, new Set<string>())
      }
      const set = chapterToTags.get(chapter)!
      if (Array.isArray(row.admin_tags)) {
        for (const tag of row.admin_tags) {
          if (tag && typeof tag === 'string') set.add(tag)
        }
      }
      // Difficulty counts
      const diffKey = (row.difficulty || 'Unknown') as string
      // Use a symbol on the map to store counts map
      const countsMapKey = `${chapter}::__diff_counts__`
      let counts = (chapterToTags as unknown as Map<string, unknown>).get(countsMapKey) as Record<string, number> | undefined
      if (!counts) {
        counts = {}
        ;(chapterToTags as unknown as Map<string, unknown>).set(countsMapKey, counts)
      }
      counts[diffKey] = (counts[diffKey] || 0) + 1
    }

    const result: Array<{ chapter_name: string; tags: string[]; difficultyCounts: Record<string, number> }> = []
    for (const [chapter, tagsSet] of chapterToTags.entries()) {
      if (chapter.endsWith('::__diff_counts__')) continue
      const counts = (chapterToTags as unknown as Map<string, unknown>).get(`${chapter}::__diff_counts__`) as Record<string, number> | undefined
      result.push({ chapter_name: chapter, tags: Array.from(tagsSet).sort(), difficultyCounts: counts || {} })
    }

    // Sort by chapter name for stable UI
    result.sort((a, b) => a.chapter_name.localeCompare(b.chapter_name))
    return result
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

// Dynamic filter options for the Master Question Bank modal
export async function getFilterOptions(args?: { bookSource?: string }): Promise<{
  bookSources: string[]
  chapters: string[]
  tags: string[]
  difficulties: string[]
}> {
  try {
    const supabase = createAdminClient()

    // A) All unique book sources
    const { data: bookRows, error: bookErr } = await supabase
      .from('questions')
      .select('book_source')
    if (bookErr) {
      console.error('Error fetching book sources:', bookErr)
    }
    const bookSources = Array.from(
      new Set((bookRows || []).map((r: { book_source: string | null }) => r.book_source).filter(Boolean) as string[])
    ).sort((a, b) => a.localeCompare(b))

    // B) Chapters (optionally filtered by bookSource)
    let chapterQuery = supabase.from('questions').select('chapter_name')
    if (args?.bookSource) {
      chapterQuery = chapterQuery.eq('book_source', args.bookSource)
    }
    const { data: chRows, error: chErr } = await chapterQuery
    if (chErr) {
      console.error('Error fetching chapters:', chErr)
    }
    const chapters = Array.from(
      new Set((chRows || []).map((r: { chapter_name: string | null }) => r.chapter_name).filter(Boolean) as string[])
    ).sort((a, b) => a.localeCompare(b))

    // C) Tags (optionally filtered by bookSource)
    let tagQuery = supabase.from('questions').select('admin_tags')
    if (args?.bookSource) {
      tagQuery = tagQuery.eq('book_source', args.bookSource)
    }
    const { data: tagRows, error: tagErr } = await tagQuery
    if (tagErr) {
      console.error('Error fetching tags:', tagErr)
    }
    const tagSet = new Set<string>()
    for (const row of (tagRows || []) as Array<{ admin_tags: string[] | null }>) {
      if (Array.isArray(row.admin_tags)) {
        for (const t of row.admin_tags) {
          if (t && typeof t === 'string') tagSet.add(t)
        }
      }
    }
    const tags = Array.from(tagSet).sort((a, b) => a.localeCompare(b))

    const difficulties = ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard']

    return { bookSources, chapters, tags, difficulties }
  } catch (error) {
    console.error('Unexpected error in getFilterOptions:', error)
    return { bookSources: [], chapters: [], tags: [], difficulties: ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard'] }
  }
}

// Types for blueprint-driven generation (rules-based)
export type RuleRow = { tag: string | null; difficulty: string | null; quantity: number }
export type BlueprintInput = Record<string, {
  random?: number
  rules?: RuleRow[]
}>

export interface GeneratedTestSlot {
  chapter_name: string
  source_type: 'random' | 'rule'
  rule_tag?: string | null
  rule_difficulty?: string | null
  question: Question
}

async function fetchCandidateQuestions(
  supabase: ReturnType<typeof createAdminClient>,
  criteria: { chapter_name: string; tag?: string | null; difficulty?: string | null },
  excludeIds: number[]
): Promise<Question[]> {
  // Build base query
  let query = supabase
    .from('questions')
    .select('*')
    .eq('chapter_name', criteria.chapter_name)

  if (criteria.tag) {
    // admin_tags contains tag -> use Postgres array contains operator '@>' emulated via cs in Postgrest
    // However, Postgrest 'cs' checks json contains; for array use 'contains' filter
    query = query.contains('admin_tags', [criteria.tag] as string[])
  }

  if (criteria.difficulty) {
    query = query.eq('difficulty', criteria.difficulty)
  }
  if (excludeIds.length > 0) {
    query = query.not('id', 'in', `(${excludeIds.join(',')})`)
  }

  const { data, error } = await query

  if (error || !data) {
    console.error('Error fetching candidate questions:', error)
    return []
  }

  // Exclude already picked ids (extra guard)
  const filtered = (data as Question[]).filter((q) => !excludeIds.includes(q.id as number))

  return filtered
}

function takeRandom<T>(items: T[], count: number): T[] {
  const arr = [...items]
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[arr[i], arr[j]] = [arr[j], arr[i]]
  }
  return arr.slice(0, Math.max(0, count))
}

// Generate test paper from blueprint
export async function generateTestPaperFromBlueprint(
  blueprint: BlueprintInput
): Promise<GeneratedTestSlot[]> {
  try {
    const supabase = createAdminClient()
    const selectedIds: number[] = []
    const slots: GeneratedTestSlot[] = []

    const chapterNames = Object.keys(blueprint)
    for (const chapter of chapterNames) {
      const config = blueprint[chapter]
      if (!config) continue

      // A) Random
      if ((config.random || 0) > 0) {
        const candidates = await fetchCandidateQuestions(supabase, { chapter_name: chapter }, selectedIds)
        const picks = takeRandom(candidates, config.random || 0)
        for (const q of picks) {
          if (q.id != null) selectedIds.push(q.id as number)
          slots.push({ chapter_name: chapter, source_type: 'random', question: q })
        }
      }

      // B) Rules (tag + difficulty combinations)
      if (Array.isArray(config.rules)) {
        for (const rule of config.rules) {
          const need = rule.quantity || 0
          if (need <= 0) continue
          const candidates = await fetchCandidateQuestions(
            supabase,
            { chapter_name: chapter, tag: rule.tag ?? null, difficulty: rule.difficulty ?? null },
            selectedIds
          )
          const picks = takeRandom(candidates, need)
          for (const q of picks) {
            if (q.id != null) selectedIds.push(q.id as number)
            slots.push({ chapter_name: chapter, source_type: 'rule', rule_tag: rule.tag ?? null, rule_difficulty: rule.difficulty ?? null, question: q })
          }
        }
      }
    }

    return slots
  } catch (error) {
    console.error('Unexpected error generating paper:', error)
    return []
  }
}

// Regenerate a single question based on slot criteria
export async function regenerateSingleQuestion(args: {
  chapter_name: string
  source_type: 'random' | 'rule'
  rule_tag?: string | null
  rule_difficulty?: string | null
  exclude_ids: number[]
}): Promise<Question | null> {
  try {
    const supabase = createAdminClient()
    const criteria: { chapter_name: string; tag?: string | null; difficulty?: string | null } = {
      chapter_name: args.chapter_name
    }
    if (args.source_type === 'rule') {
      if (args.rule_tag) criteria.tag = args.rule_tag
      if (args.rule_difficulty) criteria.difficulty = args.rule_difficulty
    }

    const candidates = await fetchCandidateQuestions(supabase, criteria, args.exclude_ids)
    const pick = takeRandom(candidates, 1)[0]
    return pick || null
  } catch (error) {
    console.error('Unexpected error regenerating question:', error)
    return null
  }
}

// Search questions for the Master Question Bank modal
export async function searchQuestions(args: {
  search?: string
  book_source?: string
  chapter_name?: string
  tags?: string[]
  difficulty?: 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard'
  page?: number
  pageSize?: number
}): Promise<{ questions: Question[]; total: number }> {
  try {
    const supabase = createAdminClient()
    const page = Math.max(1, args.page || 1)
    const pageSize = Math.max(1, Math.min(50, args.pageSize || 10))
    let query = supabase
      .from('questions')
      .select('*', { count: 'exact' })

    if (args.search) {
      query = query.or(`question_id.ilike.%${args.search}%,question_text.ilike.%${args.search}%`)
    }
    if (args.book_source) query = query.eq('book_source', args.book_source)
    if (args.chapter_name) query = query.eq('chapter_name', args.chapter_name)
    if (args.tags && args.tags.length > 0) query = query.contains('admin_tags', args.tags as string[])
    if (args.difficulty) query = query.eq('difficulty', args.difficulty)

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await query.range(from, to)

    if (error || !data) {
      console.error('Error searching questions:', error)
      return { questions: [], total: 0 }
    }

    return { questions: data as Question[], total: count || 0 }
  } catch (error) {
    console.error('Unexpected error searching questions:', error)
    return { questions: [], total: 0 }
  }
}

// Save test (draft or scheduled) with curated question IDs
export async function saveTest(args: {
  testId?: number
  name: string
  description?: string
  total_time_minutes: number
  marks_per_correct: number
  negative_marks_per_incorrect: number
  result_policy: 'instant' | 'scheduled'
  result_release_at?: string | null
  question_ids: number[]
  publish?: {
    start_time: string
    end_time: string
  } | null
}): Promise<{ success: boolean; message: string; testId?: number }> {
  try {
    const supabase = createAdminClient()

    // Insert or update tests row
    const status = args.publish ? 'scheduled' : 'draft'
    let testId = args.testId

    if (testId) {
      const { error } = await supabase
        .from('tests')
        .update({
          name: args.name,
          description: args.description,
          total_time_minutes: args.total_time_minutes,
          marks_per_correct: args.marks_per_correct,
          negative_marks_per_incorrect: args.negative_marks_per_incorrect,
          result_policy: args.result_policy,
          result_release_at: args.result_policy === 'scheduled' ? (args.result_release_at || null) : null,
          status,
          start_time: args.publish?.start_time || null,
          end_time: args.publish?.end_time || null,
          updated_at: new Date().toISOString()
        })
        .eq('id', testId)

      if (error) {
        console.error('Error updating test:', error)
        return { success: false, message: `Failed to update test: ${error.message}` }
      }
    } else {
      const { data, error } = await supabase
        .from('tests')
        .insert([{
          name: args.name,
          description: args.description,
          total_time_minutes: args.total_time_minutes,
          marks_per_correct: args.marks_per_correct,
          negative_marks_per_incorrect: args.negative_marks_per_incorrect,
          result_policy: args.result_policy,
          result_release_at: args.result_policy === 'scheduled' ? (args.result_release_at || null) : null,
          status,
          start_time: args.publish?.start_time || null,
          end_time: args.publish?.end_time || null,
        }])
        .select()
        .single()

      if (error || !data) {
        console.error('Error creating test:', error)
        return { success: false, message: `Failed to create test: ${error?.message}` }
      }
      testId = data.id
    }

    // Clean existing mappings
    const { error: delErr } = await supabase
      .from('test_questions')
      .delete()
      .eq('test_id', testId!)
    if (delErr) {
      console.error('Error clearing test_questions:', delErr)
      return { success: false, message: `Failed to reset test questions: ${delErr.message}` }
    }

    // Batch insert mappings
    const mappings = (args.question_ids || []).map((qid) => ({ test_id: testId!, question_id: qid }))
    if (mappings.length > 0) {
      const { error: insErr } = await supabase.from('test_questions').insert(mappings)
      if (insErr) {
        console.error('Error inserting test_questions:', insErr)
        return { success: false, message: `Failed to add questions: ${insErr.message}` }
      }
    }

    revalidatePath('/tests')
    redirect('/tests')
  } catch (error) {
    console.error('Unexpected error saving test:', error)
    return { success: false, message: 'Unexpected error while saving test' }
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
    const allQuestionIds: number[] = []
    
    for (const blueprintItem of testData.blueprint) {
      if (blueprintItem.question_count > 0) {
        // Get random questions from this chapter
        // First, get all questions from this chapter
        const { data: allQuestions, error: allQuestionsError } = await supabase
          .from('questions')
          .select('id')
          .eq('chapter_name', blueprintItem.chapter_name)
        
        if (allQuestionsError) {
          console.error(`Error fetching questions for chapter ${blueprintItem.chapter_name}:`, allQuestionsError)
          continue
        }
        
        if (!allQuestions || allQuestions.length === 0) {
          console.warn(`No questions found for chapter: ${blueprintItem.chapter_name}`)
          continue
        }
        
        // Shuffle the questions and take the requested count
        const shuffled = allQuestions.sort(() => 0.5 - Math.random())
        const questions = shuffled.slice(0, blueprintItem.question_count)
        
        // Add the question IDs to our collection
        allQuestionIds.push(...questions.map(q => q.id))
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

// Fetch full details for editing: test metadata + question IDs
export async function getTestDetailsForEdit(testId: number): Promise<{
  test: Test
  questions: TestQuestionSlot[]
  blueprint: TestBlueprint
} | null> {
  try {
    const supabase = createAdminClient()

    // Get test metadata
    const { data: test, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single()

    if (testError || !test) {
      console.error('Error fetching test:', testError)
      return null
    }

    // Get test questions with full question data
    const { data: testQuestions, error: questionsError } = await supabase
      .from('test_questions')
      .select(`
        question_id,
        questions (
          id,
          created_at,
          question_id,
          book_source,
          chapter_name,
          question_number_in_book,
          question_text,
          options,
          correct_option,
          solution_text,
          exam_metadata,
          admin_tags,
          difficulty
        )
      `)
      .eq('test_id', testId)

    if (questionsError || !testQuestions) {
      console.error('Error fetching test questions:', questionsError)
      return null
    }

    // Transform to TestQuestionSlot format
    const questions: TestQuestionSlot[] = (testQuestions as unknown as Array<{ question_id: number; questions: Question }>).map((tq) => ({
      question: tq.questions,
      source_type: 'random' as const, // Default for existing tests
      rule_tag: null,
      rule_difficulty: null,
      chapter_name: tq.questions.chapter_name
    }))

    // Generate blueprint from questions
    const blueprint: TestBlueprint = {}
    questions.forEach((slot) => {
      const chapter = slot.chapter_name
      if (!blueprint[chapter]) {
        blueprint[chapter] = { random: 0 }
      }
      blueprint[chapter].random = (blueprint[chapter].random || 0) + 1
    })

    return {
      test,
      questions,
      blueprint
    }
  } catch (error) {
    console.error('Error getting test details for edit:', error)
    return null
  }
}

// Clone a test: duplicate metadata and question mappings as a new draft
export async function cloneTest(testId: number): Promise<{ success: boolean; message: string; newTestId?: number }> {
  try {
    const supabase = createAdminClient()

    // Fetch original
    const { data: original, error: testError } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single()
    if (testError || !original) {
      console.error('Error fetching original test:', testError)
      return { success: false, message: 'Original test not found' }
    }

    const { data: mappings, error: mapErr } = await supabase
      .from('test_questions')
      .select('question_id')
      .eq('test_id', testId)
    if (mapErr) {
      console.error('Error fetching mappings for clone:', mapErr)
      return { success: false, message: 'Failed to read original questions' }
    }

    // Create new test
    const { data: created, error: createErr } = await supabase
      .from('tests')
      .insert([{
        name: `${original.name} (Copy)`,
        description: original.description,
        total_time_minutes: original.total_time_minutes,
        marks_per_correct: original.marks_per_correct,
        negative_marks_per_incorrect: original.negative_marks_per_incorrect,
        result_policy: 'instant',
        result_release_at: null,
        status: 'draft',
      }])
      .select()
      .single()
    if (createErr || !created) {
      console.error('Error creating cloned test:', createErr)
      return { success: false, message: 'Failed to create cloned test' }
    }

    const newTestId = created.id as number
    const questionIds = (mappings || []).map((m) => m.question_id as number)
    if (questionIds.length > 0) {
      const insertData = questionIds.map((qid) => ({ test_id: newTestId, question_id: qid }))
      const { error: insErr } = await supabase.from('test_questions').insert(insertData)
      if (insErr) {
        console.error('Error inserting cloned mappings:', insErr)
        return { success: false, message: 'Cloned, but failed to attach questions' }
      }
    }

    revalidatePath('/tests')
    return { success: true, message: 'Test cloned', newTestId }
  } catch (error) {
    console.error('Unexpected error cloning test:', error)
    return { success: false, message: 'Unexpected error' }
  }
}

// Export test to PDF: render simple HTML and convert via Puppeteer to base64
export async function exportTestToPdf(testId: number): Promise<{ success: boolean; fileName?: string; base64?: string; message?: string }> {
  try {
    const supabase = createAdminClient()

    // Fetch test
    const { data: test, error: testErr } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single()
    if (testErr || !test) {
      console.error('Error fetching test for export:', testErr)
      return { success: false, message: 'Test not found' }
    }

    // Fetch questions with join via two-step
    const { data: mappings, error: mapErr } = await supabase
      .from('test_questions')
      .select('question_id')
      .eq('test_id', testId)
    if (mapErr) {
      console.error('Error fetching mappings for export:', mapErr)
      return { success: false, message: 'Failed to read test questions' }
    }
    const ids = (mappings || []).map((m) => m.question_id)
    let questions: Question[] = []
    if (ids.length > 0) {
      const { data: qs, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .in('id', ids)
      if (qErr) {
        console.error('Error fetching questions for export:', qErr)
        return { success: false, message: 'Failed to load question data' }
      }
      questions = (qs || []) as Question[]
    }

    // Generate simple HTML for PDF
    const html = `<!doctype html>
<html><head><meta charset="utf-8" />
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; }
  h1 { font-size: 18px; margin-bottom: 8px; }
  .meta { color: #555; margin-bottom: 16px; }
  .q { margin-bottom: 14px; }
  .qid { color: #666; font-size: 11px; }
  .options { margin-left: 16px; }
  .options li { margin: 4px 0; }
  .answer { color: #0a0; font-weight: 600; }
</style>
</head><body>
  <h1>${test.name}</h1>
  <div class="meta">
    Duration: ${test.total_time_minutes} min | Marks/correct: ${test.marks_per_correct} | Negative: ${test.negative_marks_per_incorrect}
  </div>
  ${questions
    .map((q, idx) => `
      <div class="q">
        <div class="qid">Q${idx + 1}. ${q.question_id} — ${q.chapter_name} (${(q as Question & { difficulty?: string }).difficulty || '-'})</div>
        <div>${q.question_text}</div>
        ${q.options ? `<ul class="options">
          <li>A. ${q.options.a}</li>
          <li>B. ${q.options.b}</li>
          <li>C. ${q.options.c}</li>
          <li>D. ${q.options.d}</li>
        </ul>` : ''}
        <div class="answer">Answer: ${(q as Question & { correct_option?: string }).correct_option?.toUpperCase() || '-'}</div>
      </div>
    `)
    .join('')}
</body></html>`

    // Dynamic import puppeteer to avoid bundling if not used
    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.launch({ headless: true })
    const page = await browser.newPage()
    await page.setContent(html, { waitUntil: 'networkidle0' })
    const pdfBuffer = await page.pdf({ format: 'A4', printBackground: true, margin: { top: '14mm', bottom: '14mm', left: '12mm', right: '12mm' } })
    await browser.close()

    const base64 = Buffer.from(pdfBuffer).toString('base64')
    const safeName = `${test.name || 'Test'}-${testId}.pdf`.replace(/[^a-z0-9\-_.]/gi, '_')
    return { success: true, fileName: safeName, base64 }
  } catch (error) {
    console.error('Export to PDF failed:', error)
    return { success: false, message: 'Failed to export PDF. Ensure puppeteer is installed.' }
  }
}

