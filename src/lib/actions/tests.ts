'use server'

import { createAdminClient, type Test, type TestCreationData } from '@/lib/supabase/admin'
import { cache } from 'react'
import { revalidatePath } from 'next/cache'
import type { Question as UIQuestion } from '@/lib/types'
import { redirect } from 'next/navigation'
import type { TestQuestionSlot, TestBlueprint } from '@/lib/types'
import { sanitizeQuestionForRendering } from '@/lib/utils/latex-sanitization'
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
export const getChaptersWithTags = cache(async (): Promise<Array<{ chapter_name: string; tags: string[]; difficultyCounts: Record<string, number> }>> => {
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
})

// Dynamic filter options for the Master Question Bank modal
export async function getFilterOptions(args?: { bookSource?: string; bookSources?: string[]; chapters?: string[] }): Promise<{
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

    const selectedBooks = args?.bookSources && args.bookSources.length > 0
      ? args.bookSources
      : (args?.bookSource ? [args.bookSource] : [])

    // B) Chapters (optionally filtered by selected books)
    let chapterQuery = supabase.from('questions').select('chapter_name')
    if (selectedBooks.length > 0) {
      chapterQuery = chapterQuery.in('book_source', selectedBooks)
    }
    const { data: chRows, error: chErr } = await chapterQuery
    if (chErr) {
      console.error('Error fetching chapters:', chErr)
    }
    const chapters = Array.from(
      new Set((chRows || []).map((r: { chapter_name: string | null }) => r.chapter_name).filter(Boolean) as string[])
    ).sort((a, b) => a.localeCompare(b))

    // C) Tags (optionally filtered by selected books and chapters)
    let tagQuery = supabase.from('questions').select('admin_tags, chapter_name, book_source')
    if (selectedBooks.length > 0) {
      tagQuery = tagQuery.in('book_source', selectedBooks)
    }
    if (args?.chapters && args.chapters.length > 0) {
      tagQuery = tagQuery.in('chapter_name', args.chapters)
    }
    const { data: tagRows, error: tagErr } = await tagQuery
    if (tagErr) {
      console.error('Error fetching tags:', tagErr)
    }
    const tagSet = new Set<string>()
    for (const row of (tagRows || []) as Array<{ admin_tags: string[] | null; chapter_name?: string | null }>) {
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
  question: UIQuestion
}

async function fetchCandidateQuestions(
  supabase: ReturnType<typeof createAdminClient>,
  criteria: { chapter_name: string; tag?: string | null; difficulty?: string | null },
  excludeIds: number[]
): Promise<UIQuestion[]> {
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
  const filtered = (data as unknown as UIQuestion[]).filter((q) => !excludeIds.includes(q.id as number))

  // Sanitize questions for rendering (convert \\ to \)
  const sanitizedQuestions = filtered.map(q => sanitizeQuestionForRendering(q) as UIQuestion)

  return sanitizedQuestions
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
            slots.push({ 
              chapter_name: chapter, 
              source_type: 'rule', 
              rule_tag: rule.tag ?? null, 
              rule_difficulty: rule.difficulty ?? null, 
              question: q 
            })
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
}): Promise<UIQuestion | null> {
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
    // Sanitize the picked question for rendering (convert \\ to \)
    return pick ? sanitizeQuestionForRendering(pick) as UIQuestion : null
  } catch (error) {
    console.error('Unexpected error regenerating question:', error)
    return null
  }
}

// Search questions for the Master Question Bank modal
export async function searchQuestions(args: {
  search?: string
  book_source?: string
  book_sources?: string[]
  chapter_name?: string
  chapters?: string[]
  tags?: string[]
  difficulty?: 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard'
  page?: number
  pageSize?: number
}): Promise<{ questions: UIQuestion[]; total: number }> {
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
    if (args.book_sources && args.book_sources.length > 0) {
      query = query.in('book_source', args.book_sources)
    } else if (args.book_source) {
      query = query.eq('book_source', args.book_source)
    }

    if (args.chapters && args.chapters.length > 0) {
      query = query.in('chapter_name', args.chapters)
    } else if (args.chapter_name) {
      query = query.eq('chapter_name', args.chapter_name)
    }
    if (args.tags && args.tags.length > 0) query = query.contains('admin_tags', args.tags as string[])
    if (args.difficulty) query = query.eq('difficulty', args.difficulty)

    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    const { data, error, count } = await query.range(from, to)

    if (error || !data) {
      console.error('Error searching questions:', error)
      return { questions: [], total: 0 }
    }

    // Sanitize questions for rendering (convert \\ to \)
    const sanitizedQuestions = (data as unknown as UIQuestion[]).map(q => sanitizeQuestionForRendering(q) as UIQuestion)
    
    return { questions: sanitizedQuestions, total: count || 0 }
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

    // Determine status based on publish payload
    const status = args.publish ? 'scheduled' : 'draft'

    // Base payload for tests table
    const baseData = {
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
    }

    let testId: number | undefined = args.testId

    if (typeof testId === 'number' && Number.isFinite(testId)) {
      // UPDATE existing test
      const { error: updateErr } = await supabase
        .from('tests')
        .update(baseData)
        .eq('id', testId)

      if (updateErr) {
        console.error('Error updating test:', updateErr)
        return { success: false, message: `Failed to update test: ${updateErr.message}` }
      }
    } else {
      // CREATE new test - let DB generate the id
      const { data: created, error: insertErr } = await supabase
        .from('tests')
        .insert([baseData])
        .select('id')
        .single()

      if (insertErr || !created) {
        console.error('Error creating test:', insertErr)
        return { success: false, message: `Failed to create test: ${insertErr?.message}` }
      }
      testId = created.id as number
    }

    // Reset mappings then insert fresh
    const { error: delErr } = await supabase.from('test_questions').delete().eq('test_id', testId!)
    if (delErr) {
      console.error('Error clearing mappings:', delErr)
      return { success: false, message: `Failed to reset test questions: ${delErr.message}` }
    }

    const mappings = (args.question_ids || []).map((qid) => ({ test_id: testId!, question_id: qid }))
    if (mappings.length > 0) {
      const { error: insErr } = await supabase.from('test_questions').insert(mappings)
      if (insErr) {
        console.error('Error inserting mappings:', insErr)
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

// FormData-compatible server action for robust client submissions
export async function saveTestFromForm(formData: FormData): Promise<{ success: boolean; message: string; testId?: number }> {
  try {
    const payload = {
      testId: formData.get('testId') ? Number(formData.get('testId')) : undefined,
      name: String(formData.get('name') || ''),
      description: formData.get('description') ? String(formData.get('description')) : undefined,
      total_time_minutes: Number(formData.get('total_time_minutes') || 0),
      marks_per_correct: Number(formData.get('marks_per_correct') || 0),
      negative_marks_per_incorrect: Number(formData.get('negative_marks_per_incorrect') || 0),
      result_policy: (String(formData.get('result_policy') || 'instant') as 'instant' | 'scheduled'),
      result_release_at: formData.get('result_release_at') ? String(formData.get('result_release_at')) : null,
      question_ids: (() => { try { return JSON.parse(String(formData.get('question_ids') || '[]')) as number[] } catch { return [] } })(),
      publish: ((): { start_time: string; end_time: string } | null => {
        const status = String(formData.get('status') || 'draft')
        if (status === 'scheduled') {
          return {
            start_time: String(formData.get('start_time') || ''),
            end_time: String(formData.get('end_time') || '')
          }
        }
        return null
      })()
    }
    // Run the same logic as saveTest but without redirect so client can control navigation
    const supabase = createAdminClient()
    const status = payload.publish ? 'scheduled' : 'draft'
    const baseData = {
      name: payload.name,
      description: payload.description,
      total_time_minutes: payload.total_time_minutes,
      marks_per_correct: payload.marks_per_correct,
      negative_marks_per_incorrect: payload.negative_marks_per_incorrect,
      result_policy: payload.result_policy,
      result_release_at: payload.result_policy === 'scheduled' ? (payload.result_release_at || null) : null,
      status,
      start_time: payload.publish?.start_time || null,
      end_time: payload.publish?.end_time || null,
      updated_at: new Date().toISOString()
    }

    let testId: number | undefined = payload.testId
    if (typeof testId === 'number' && Number.isFinite(testId)) {
      const { error: updateErr } = await supabase.from('tests').update(baseData).eq('id', testId)
      if (updateErr) {
        console.error('Error updating test:', updateErr)
        return { success: false, message: `Failed to update test: ${updateErr.message}` }
      }
    } else {
      const { data: created, error: insertErr } = await supabase
        .from('tests')
        .insert([baseData])
        .select('id')
        .single()
      if (insertErr || !created) {
        console.error('Error creating test:', insertErr)
        return { success: false, message: `Failed to create test: ${insertErr?.message}` }
      }
      testId = created.id as number
    }

    // New: accept questions_payload with mixed existing/new questions
    const questionsPayloadRaw = formData.get('questions_payload') as string | null
    let finalQuestionIds: number[] = []
    if (questionsPayloadRaw) {
      type NewPayload = {
        question_text: string
        options: Record<string, string>
        correct_option: string
        solution_text?: string | null
        book_source: string
        chapter_name: string
        difficulty?: string | null
        admin_tags?: string[]
      }
      type OverridePayload = {
        question_text?: string
        options?: Record<string, string>
        correct_option?: string
        solution_text?: string | null
      }
      type Item = { id?: number; new?: NewPayload; override?: OverridePayload }
      let list: Item[] = []
      try {
        list = JSON.parse(questionsPayloadRaw) as Item[]
      } catch {
        return { success: false, message: 'Invalid questions payload' }
      }

      console.log('saveTestFromForm: received items length =', list.length)

      const newOnes = list.map((i) => i.new || null).filter(Boolean) as NewPayload[]

      let createdIds: number[] = []
      if (newOnes.length > 0) {
        try {
          const rows = newOnes.map((n, idx) => {
            const idStr = `MANUAL-${Date.now()}-${Math.random().toString(36).slice(2,8)}`
            const optionsUpper = Object.fromEntries(Object.entries(n.options || {}).map(([k, v]) => [String(k).toUpperCase(), v]))
            // Basic validation
            const optKeys = Object.keys(optionsUpper)
            if (!n.book_source || !n.chapter_name || !n.question_text || optKeys.length < 2) {
              throw new Error(`Missing required fields for new question at index ${idx}`)
            }
            const correct = (n.correct_option || '').toString().toUpperCase()
            if (!optKeys.includes(correct)) {
              throw new Error(`Correct option '${correct}' not among provided options for new question at index ${idx}`)
            }
            const row = {
              question_id: idStr,
              book_source: n.book_source,
              chapter_name: n.chapter_name,
              question_number_in_book: 0,
              question_text: n.question_text,
              options: optionsUpper,
              correct_option: correct,
              solution_text: n.solution_text || null,
              admin_tags: n.admin_tags || [],
              difficulty: n.difficulty || null
            }
            console.log('saveTestFromForm: inserting new question row', row)
            return row
          })
          const { data: inserted, error: insNewErr } = await supabase
            .from('questions')
            .insert(rows)
            .select('id')
          if (insNewErr || !inserted) {
            console.error('Insert new inline questions failed:', insNewErr)
            return { success: false, message: 'Failed to insert new questions. Please ensure Book Source and Chapter are provided.' }
          }
          createdIds = inserted.map((r: { id: number }) => r.id)
        } catch (e: unknown) {
          console.error('New question validation/insert error:', e)
          return { success: false, message: `Failed to save manually added question: ${e instanceof Error ? e.message : 'Unknown error'}` }
        }
      }

      // Merge in order: for each item, pick id or shift from createdIds
      let createdIdx = 0
      for (const item of list) {
        if (typeof item.id === 'number') {
          finalQuestionIds.push(item.id)
        } else {
          finalQuestionIds.push(createdIds[createdIdx++])
        }
      }

      // Try to write overrides into mapping rows
      try {
        const { error: del2 } = await supabase.from('test_questions').delete().eq('test_id', testId!)
        if (del2) throw del2
        for (let i = 0; i < list.length; i++) {
          const qid = finalQuestionIds[i]
          const override = list[i].override || null
          const row: Record<string, unknown> = { test_id: testId!, question_id: qid }
          if (override && Object.keys(override).length > 0) {
            row.question_override_data = override
          }
          const { error: insRowErr } = await supabase.from('test_questions').insert([row])
          if (insRowErr) throw insRowErr
        }
        } catch {
        // Fallback if column doesn't exist
        const { error: del3 } = await supabase.from('test_questions').delete().eq('test_id', testId!)
        if (del3) {
          console.error('Cleanup failed after override attempt:', del3)
        }
        if (finalQuestionIds.length > 0) {
          const mappings = finalQuestionIds.map((qid) => ({ test_id: testId!, question_id: qid }))
          const { error: insErr } = await supabase.from('test_questions').insert(mappings)
          if (insErr) {
            console.error('Error inserting mappings (fallback):', insErr)
            return { success: false, message: `Failed to add questions: ${insErr.message}` }
          }
        }
      }
    } else {
      finalQuestionIds = (payload.question_ids || [])
      // Old path: just write mappings
    const { error: delErr } = await supabase.from('test_questions').delete().eq('test_id', testId!)
    if (delErr) {
      console.error('Error clearing mappings:', delErr)
      return { success: false, message: `Failed to reset test questions: ${delErr.message}` }
    }
      if (finalQuestionIds.length > 0) {
        const mappings = finalQuestionIds.map((qid) => ({ test_id: testId!, question_id: qid }))
      const { error: insErr } = await supabase.from('test_questions').insert(mappings)
      if (insErr) {
        console.error('Error inserting mappings:', insErr)
        return { success: false, message: `Failed to add questions: ${insErr.message}` }
        }
      }
    }
    revalidatePath('/tests')
    return { success: true, message: 'Saved', testId }
  } catch (error) {
    console.error('saveTestFromForm error:', error)
    return { success: false, message: 'Failed to parse form data' }
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
export async function publishTest(
  testId: number,
  startTime: string | null,
  endTime: string | null,
  resultPolicy?: 'instant' | 'scheduled',
  resultReleaseAt?: string | null
): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('tests')
      .update({
        status: 'scheduled',
        start_time: startTime || null,
        end_time: endTime || null,
        result_policy: resultPolicy || null,
        result_release_at: resultPolicy === 'scheduled' ? (resultReleaseAt || null) : null,
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

    // Get test questions with full question data and overrides if present
    const { data: testQuestions, error: questionsError } = await supabase
      .from('test_questions')
      .select('id, question_id, question_override_data, questions(*)')
      .eq('test_id', testId)
      .order('id', { ascending: true })

    if (questionsError || !testQuestions) {
      console.error('Error fetching test questions:', questionsError)
      return null
    }

    // Transform to TestQuestionSlot format with overrides applied
    const questions: TestQuestionSlot[] = (testQuestions as unknown as Array<{ question_id: number; question_override_data?: unknown; questions: UIQuestion }>).
      map((tq) => {
        const override = (tq as { question_override_data?: Record<string, unknown> }).question_override_data
        const base = tq.questions
        const patched: UIQuestion = { ...base }
        if (override && typeof override === 'object') {
          if (typeof override.question_text === 'string') patched.question_text = override.question_text
          if (override.options && typeof override.options === 'object') patched.options = override.options as Record<string, string>
          if (typeof override.correct_option === 'string') patched.correct_option = override.correct_option
          if (typeof override.solution_text === 'string' || override.solution_text === null) patched.solution_text = override.solution_text as string
        }
        return {
          question: patched,
          source_type: 'random' as const,
      rule_tag: null,
      rule_difficulty: null,
          chapter_name: patched.chapter_name
        }
      })

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
  // Backward-compatible alias: export the professional Question Paper
  return exportQuestionPaperPdf(testId)
}

// Shared helper to fetch test metadata and ordered questions
async function fetchTestAndQuestionsOrdered(testId: number): Promise<{ test: Test; questions: UIQuestion[] } | { error: string }> {
  try {
    const supabase = createAdminClient()
    const { data: test, error: testErr } = await supabase
      .from('tests')
      .select('*')
      .eq('id', testId)
      .single()
    if (testErr || !test) {
      return { error: 'Test not found' }
    }
    const { data: mappings, error: mapErr } = await supabase
      .from('test_questions')
      .select('question_id')
      .eq('test_id', testId)
    if (mapErr) {
      return { error: 'Failed to read test questions' }
    }
    const ids = (mappings || []).map((m) => m.question_id as number)
    let questions: UIQuestion[] = []
    if (ids.length > 0) {
      const { data: qs, error: qErr } = await supabase
        .from('questions')
        .select('*')
        .in('id', ids)
      if (qErr) {
        return { error: 'Failed to load question data' }
      }
      const byId = new Map<number, UIQuestion>()
      for (const q of (qs || []) as unknown as UIQuestion[]) {
        if (q.id != null) byId.set(q.id as number, q)
      }
      const rawQuestions = ids.map((id) => byId.get(id)).filter(Boolean) as UIQuestion[]
      // Sanitize questions for rendering (convert \\ to \)
      questions = rawQuestions.map(q => sanitizeQuestionForRendering(q) as UIQuestion)
    }
    return { test: test as Test, questions }
  } catch {
    return { error: 'Unexpected error fetching test data' }
  }
}

// Fetch with overrides applied helper
async function fetchTestAndQuestionsApplied(testId: number): Promise<{ test: Test; questions: UIQuestion[] } | { error: string }> {
  const supabase = createAdminClient()
  const { data: test, error: testErr } = await supabase
    .from('tests')
    .select('*')
    .eq('id', testId)
    .single()
  if (testErr || !test) {
    return { error: 'Test not found' }
  }
  const { data: rows, error: rowsErr } = await supabase
    .from('test_questions')
    .select('id, question_id, question_override_data, questions(*)')
    .eq('test_id', testId)
    .order('id', { ascending: true })
  if (rowsErr) return { error: 'Failed to read test questions' }
  const rawQuestions: UIQuestion[] = (rows || []).map((r: { id: number; question_id: number; question_override_data?: Record<string, unknown>; questions: UIQuestion[] }) => {
    const base = (r.questions?.[0] || {}) as UIQuestion
    const override = r.question_override_data
    if (!override || typeof override !== 'object') return base
    const patched: UIQuestion = { ...base }
    if (typeof override.question_text === 'string') patched.question_text = override.question_text
    if (override.options && typeof override.options === 'object') patched.options = override.options as Record<string, string>
    if (typeof override.correct_option === 'string') patched.correct_option = override.correct_option
    if (typeof override.solution_text === 'string' || override.solution_text === null) patched.solution_text = override.solution_text
    return patched
  })
  
  // Sanitize questions for rendering (convert \\ to \)
  const questions: UIQuestion[] = rawQuestions.map(q => sanitizeQuestionForRendering(q) as UIQuestion)
  return { test: test as Test, questions }
}

// Premium Professional Test Paper Generator
export async function exportQuestionPaperPdf(testId: number): Promise<{ success: boolean; fileName?: string; base64?: string; message?: string }> {
  try {
    const fetched = await (async () => {
      // Try with overrides; fall back to base
      const withOverrides = await (async () => {
        try {
          return await fetchTestAndQuestionsApplied(testId)
        } catch {
          return { error: 'fallback' } as const
        }
      })()
      if (!('error' in withOverrides)) return withOverrides
      return await fetchTestAndQuestionsOrdered(testId)
    })()
    if ('error' in fetched) {
      return { success: false, message: fetched.error }
    }
    const { test, questions } = fetched

    // Get PDF customization settings
    const { getPDFCustomizationSettings } = await import('./settings')
    const pdfSettings = await getPDFCustomizationSettings()

    // Enhanced KaTeX rendering with better error handling
    const katex = await import('katex')
    const renderWithKaTeX = (input: string | null | undefined): string => {
      const text = String(input || '')
      const pattern = /(\$\$[\s\S]+?\$\$|\$[^$]+?\$|\\\[[\s\S]+?\\\]|\\\([\s\S]+?\\\))/g
      const parts: string[] = []
      let lastIndex = 0
      let match: RegExpExecArray | null
      while ((match = pattern.exec(text)) !== null) {
        const matchStart = match.index
        const matchEnd = match.index + match[0].length
        if (matchStart > lastIndex) {
          parts.push(`<span class="text">${text.slice(lastIndex, matchStart)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
          }</span>`) 
        }
        const token = match[0]
        try {
          if (token.startsWith('$$')) {
            parts.push(`<div class="k-block">${katex.renderToString(token.slice(2, -2), { displayMode: true, throwOnError: false })}</div>`)
          } else if (token.startsWith('$')) {
            parts.push(`<span class="k-inline">${katex.renderToString(token.slice(1, -1), { displayMode: false, throwOnError: false })}</span>`)
          } else if (token.startsWith('\\[')) {
            parts.push(`<div class="k-block">${katex.renderToString(token.slice(2, -2), { displayMode: true, throwOnError: false })}</div>`)
          } else if (token.startsWith('\\(')) {
            parts.push(`<span class="k-inline">${katex.renderToString(token.slice(2, -2), { displayMode: false, throwOnError: false })}</span>`)
          }
        } catch {
          parts.push(`<span class="text">${token.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`)
        }
        lastIndex = matchEnd
      }
      if (lastIndex < text.length) {
        parts.push(`<span class="text">${text.slice(lastIndex).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</span>`)
      }
      return parts.join('')
    }

    const questionCount = questions.length
    const fullMarks = (Number(test.marks_per_correct) || 0) * questionCount
    const negativeMarks = test.negative_marks_per_incorrect || 0
    const positiveMarks = test.marks_per_correct || 0

    // Premium HTML Template with Professional Design and Customization
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${(test.name || 'Test').replace(/</g, '&lt;')} - Question Paper</title>
  
  <!-- KaTeX for Mathematical Rendering -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.22/dist/katex.min.css" />
  
  <!-- Google Fonts for Professional Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=${encodeURIComponent(pdfSettings.bodyFont || 'Inter')}:wght@300;400;500;600;700&family=${encodeURIComponent(pdfSettings.titleFont || 'Source Serif Pro')}:wght@400;600;700&display=swap" rel="stylesheet">
  
  <style>
    /* Print-optimized CSS with professional design */
    @page { 
      size: A4; 
      margin: 20mm 15mm 25mm 15mm;
      @top-center { content: "Question Paper"; }
      @bottom-center { content: "Page " counter(page) " of " counter(pages); }
    }
    
    * {
      box-sizing: border-box;
    }
    
    body { 
      font-family: '${pdfSettings.bodyFont || 'Inter'}', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    /* Professional Header Design */
    .document-header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 2px solid ${pdfSettings.primaryColor || '#2563eb'};
      position: relative;
    }
    
    .test-title {
      font-family: '${pdfSettings.titleFont || 'Source Serif Pro'}', Georgia, serif;
      font-size: 24pt;
      font-weight: 700;
      color: #1e293b;
      margin: 0 0 16px 0;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    
    .test-meta {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-top: 16px;
      font-size: 10pt;
      color: #475569;
    }
    
    .meta-item {
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 6px;
      border-left: 3px solid ${pdfSettings.primaryColor || '#2563eb'};
    }
    
    .meta-label {
      font-weight: 600;
      color: #334155;
      display: block;
      margin-bottom: 2px;
    }
    
    .meta-value {
      font-weight: 500;
      color: #1e293b;
    }
    
    /* Instructions Section */
    .instructions {
      background: #f1f5f9;
      border: 1px solid #cbd5e1;
      border-radius: 8px;
      padding: 16px;
      margin-bottom: 24px;
      font-size: 10pt;
    }
    
    .instructions-title {
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 8px;
      font-size: 11pt;
    }
    
    .instructions-list {
      margin: 0;
      padding-left: 16px;
      color: #475569;
    }
    
    .instructions-list li {
      margin-bottom: 4px;
    }
    
    /* Question Styling */
    .question-container {
      margin-bottom: 24px;
      page-break-inside: avoid;
      padding: 16px;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      background: #ffffff;
    }
    
    .question-header {
      margin-bottom: 12px;
      display: flex;
      align-items: flex-start;
      gap: 8px;
    }
    
    .question-number {
      font-family: 'Source Serif Pro', Georgia, serif;
      font-size: 12pt;
      font-weight: 600;
      color: #2563eb;
      min-width: 24px;
      flex-shrink: 0;
    }
    
    .question-text {
      flex: 1;
      font-size: 11pt;
      line-height: 1.6;
      color: #1e293b;
    }
    
    /* Professional Options Grid */
    .options-grid {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 12px 24px;
      margin-top: 12px;
    }
    
    .option-item {
      display: flex;
      align-items: flex-start;
      gap: 8px;
      padding: 8px 12px;
      background: #f8fafc;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
      transition: all 0.2s ease;
    }
    
    .option-label {
      font-weight: 600;
      color: #2563eb;
      min-width: 20px;
      flex-shrink: 0;
      font-size: 10pt;
    }
    
    .option-content {
      flex: 1;
      font-size: 10pt;
      line-height: 1.5;
      color: #374151;
    }
    
    /* Mathematical Content Styling */
    .k-block {
      margin: 8px 0;
      text-align: center;
    }
    
    .k-inline {
      display: inline;
    }
    
    .text {
      white-space: pre-wrap;
    }
    
    /* Footer and Page Numbers */
    .page-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 20mm;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9pt;
      color: #64748b;
    }
    
    /* Print-specific optimizations */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .question-container {
        page-break-inside: avoid;
        break-inside: avoid;
      }
      
      .options-grid {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
    
    /* Responsive adjustments for different screen sizes */
    @media (max-width: 768px) {
      .options-grid {
        grid-template-columns: 1fr;
      }
      
      .test-meta {
        grid-template-columns: 1fr;
        gap: 8px;
      }
    }
  </style>
</head>
<body>
  <!-- Professional Document Header -->
  <div class="document-header">
    <h1 class="test-title">${(test.name || 'Test').replace(/</g, '&lt;')}</h1>
    
    <div class="test-meta">
      <div class="meta-item">
        <span class="meta-label">Duration</span>
        <span class="meta-value">${test.total_time_minutes} minutes</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Marking Scheme</span>
        <span class="meta-value">+${positiveMarks} correct, -${negativeMarks} incorrect</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Total Marks</span>
        <span class="meta-value">${fullMarks}</span>
      </div>
    </div>
  </div>
  
  ${pdfSettings.showInstructions !== false ? `<!-- Instructions Section -->
  <div class="instructions">
    <div class="instructions-title">General Instructions:</div>
    <ol class="instructions-list">
      <li>This question paper contains ${questionCount} questions.</li>
      <li>Each question carries ${positiveMarks} mark${positiveMarks !== 1 ? 's' : ''} for correct answer${positiveMarks !== 1 ? 's' : ''}.</li>
      ${negativeMarks > 0 ? `<li>${negativeMarks} mark${negativeMarks !== 1 ? 's' : ''} will be deducted for each incorrect answer.</li>` : ''}
      <li>Total time allotted for this test is ${test.total_time_minutes} minutes.</li>
      <li>Read each question carefully before answering.</li>
      <li>Choose the most appropriate answer from the given options.</li>
      ${pdfSettings.customInstructions ? `<li>${pdfSettings.customInstructions}</li>` : ''}
    </ol>
  </div>` : ''}
  
  <!-- Questions Section -->
  <div class="questions-section">
    ${questions.map((q, idx) => {
      const opts = (q.options || {}) as Record<string, string>
      const optionKeys = Object.keys(opts).sort()
      
      return `
      <div class="question-container">
        <div class="question-header">
          <span class="question-number">${idx + 1}.</span>
          <div class="question-text">${renderWithKaTeX(q.question_text)}</div>
        </div>
        
        <div class="options-grid">
          ${optionKeys.map((key) => {
            const lower = key.toLowerCase()
            return `
            <div class="option-item">
              <span class="option-label">(${lower})</span>
              <div class="option-content">${renderWithKaTeX(opts[key] || '')}</div>
            </div>`
          }).join('')}
        </div>
      </div>`
    }).join('')}
  </div>
  
  <!-- Professional Footer -->
  <div class="page-footer">
    <span>${pdfSettings.footerText || `© ${new Date().getFullYear()} Professional Test Platform - Question Paper`}</span>
  </div>
</body>
</html>`

    // Enhanced Puppeteer Configuration for Premium PDF Generation
    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })
    
    const page = await browser.newPage()
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 })
    
    // Wait for fonts and resources to load
    await page.setContent(html, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    })
    
    // Wait for KaTeX rendering to complete
    await page.waitForFunction(() => {
      const katexElements = document.querySelectorAll('.katex')
      return katexElements.length > 0 ? Array.from(katexElements).every(el => el.textContent && el.textContent.trim() !== '') : true
    }, { timeout: 10000 })
    
    // Generate high-quality PDF with professional settings
    const pdfBuffer = await page.pdf({ 
      format: 'A4',
      printBackground: true,
      margin: { 
        top: '20mm', 
        bottom: '25mm', 
        left: '15mm', 
        right: '15mm' 
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 10px; color: #666; text-align: center; width: 100%; margin: 0 auto;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      preferCSSPageSize: true,
      timeout: 30000
    })
    
    await browser.close()

    const base64 = Buffer.from(pdfBuffer).toString('base64')
    const safeName = `${test.name || 'Test'}-Question-Paper-${testId}.pdf`.replace(/[^a-z0-9\-_.]/gi, '_')
    return { success: true, fileName: safeName, base64 }
  } catch (error) {
    console.error('Premium Question Paper export failed:', error)
    return { success: false, message: 'Failed to export Question Paper' }
  }
}

// 2) Premium Professional Answer Key PDF
export async function exportAnswerKeyPdf(testId: number): Promise<{ success: boolean; fileName?: string; base64?: string; message?: string }> {
  try {
    const fetched = await (async () => {
      const withOverrides = await (async () => {
        try {
          return await fetchTestAndQuestionsApplied(testId)
        } catch {
          return { error: 'fallback' } as const
        }
      })()
      if (!('error' in withOverrides)) return withOverrides
      return await fetchTestAndQuestionsOrdered(testId)
    })()
    if ('error' in fetched) {
      return { success: false, message: fetched.error }
    }
    const { test, questions } = fetched

    const questionCount = questions.length
    const fullMarks = (Number(test.marks_per_correct) || 0) * questionCount

    // Premium Answer Key HTML Template
    const html = `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Answer Key - ${(test.name || 'Test').replace(/</g, '&lt;')}</title>
  
  <!-- Google Fonts for Professional Typography -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Source+Serif+Pro:wght@400;600;700&display=swap" rel="stylesheet">
  
  <style>
    /* Print-optimized CSS with professional design */
    @page { 
      size: A4; 
      margin: 20mm 15mm 25mm 15mm;
      @top-center { content: "Answer Key"; }
      @bottom-center { content: "Page " counter(page) " of " counter(pages); }
    }
    
    * {
      box-sizing: border-box;
    }
    
    body { 
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 11pt;
      line-height: 1.6;
      color: #1a1a1a;
      background: #ffffff;
      margin: 0;
      padding: 0;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    /* Professional Header Design */
    .document-header {
      text-align: center;
      margin-bottom: 32px;
      padding-bottom: 20px;
      border-bottom: 2px solid #dc2626;
      position: relative;
    }
    
    .answer-key-title {
      font-family: 'Source Serif Pro', Georgia, serif;
      font-size: 24pt;
      font-weight: 700;
      color: #dc2626;
      margin: 0 0 8px 0;
      letter-spacing: -0.02em;
      line-height: 1.2;
    }
    
    .test-name {
      font-size: 14pt;
      color: #374151;
      margin: 0 0 16px 0;
      font-weight: 500;
    }
    
    .test-meta {
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      gap: 20px;
      margin-top: 16px;
      font-size: 10pt;
      color: #475569;
    }
    
    .meta-item {
      padding: 8px 12px;
      background: #fef2f2;
      border-radius: 6px;
      border-left: 3px solid #dc2626;
    }
    
    .meta-label {
      font-weight: 600;
      color: #374151;
      display: block;
      margin-bottom: 2px;
    }
    
    .meta-value {
      font-weight: 500;
      color: #1e293b;
    }
    
    /* Answer Grid Layout */
    .answers-section {
      margin-top: 24px;
    }
    
    .answers-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 12px;
      margin-top: 20px;
    }
    
    .answer-item {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
      transition: all 0.2s ease;
    }
    
    .answer-item:hover {
      background: #f1f5f9;
      border-color: #cbd5e1;
    }
    
    .answer-number {
      font-family: 'Source Serif Pro', Georgia, serif;
      font-size: 12pt;
      font-weight: 600;
      color: #374151;
      min-width: 30px;
    }
    
    .answer-letter {
      font-size: 14pt;
      font-weight: 700;
      color: #dc2626;
      background: #fef2f2;
      padding: 6px 12px;
      border-radius: 6px;
      border: 2px solid #fecaca;
      min-width: 40px;
      text-align: center;
    }
    
    /* Summary Section */
    .summary-section {
      margin-top: 32px;
      padding: 20px;
      background: #f8fafc;
      border: 1px solid #e2e8f0;
      border-radius: 8px;
    }
    
    .summary-title {
      font-size: 14pt;
      font-weight: 600;
      color: #1e293b;
      margin-bottom: 12px;
    }
    
    .summary-stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }
    
    .stat-item {
      text-align: center;
      padding: 12px;
      background: #ffffff;
      border-radius: 6px;
      border: 1px solid #e2e8f0;
    }
    
    .stat-value {
      font-size: 18pt;
      font-weight: 700;
      color: #dc2626;
      display: block;
    }
    
    .stat-label {
      font-size: 10pt;
      color: #64748b;
      margin-top: 4px;
    }
    
    /* Footer */
    .page-footer {
      position: fixed;
      bottom: 0;
      left: 0;
      right: 0;
      height: 20mm;
      background: #f8fafc;
      border-top: 1px solid #e2e8f0;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 9pt;
      color: #64748b;
    }
    
    /* Print-specific optimizations */
    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .answer-item {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    }
  </style>
</head>
<body>
  <!-- Professional Document Header -->
  <div class="document-header">
    <h1 class="answer-key-title">Answer Key</h1>
    <div class="test-name">${(test.name || 'Test').replace(/</g, '&lt;')}</div>
    
    <div class="test-meta">
      <div class="meta-item">
        <span class="meta-label">Total Questions</span>
        <span class="meta-value">${questionCount}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Total Marks</span>
        <span class="meta-value">${fullMarks}</span>
      </div>
      <div class="meta-item">
        <span class="meta-label">Duration</span>
        <span class="meta-value">${test.total_time_minutes} minutes</span>
      </div>
    </div>
  </div>
  
  <!-- Answers Section -->
  <div class="answers-section">
    <div class="answers-grid">
      ${questions.map((q, idx) => {
        const letter = ((q as unknown as { correct_option?: string }).correct_option || '-').toString().trim().toLowerCase() || '-'
        return `
        <div class="answer-item">
          <span class="answer-number">${idx + 1}.</span>
          <span class="answer-letter">${letter.toUpperCase()}</span>
        </div>`
      }).join('')}
    </div>
  </div>
  
  <!-- Summary Section -->
  <div class="summary-section">
    <div class="summary-title">Test Summary</div>
    <div class="summary-stats">
      <div class="stat-item">
        <span class="stat-value">${questionCount}</span>
        <span class="stat-label">Total Questions</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${fullMarks}</span>
        <span class="stat-label">Total Marks</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${test.total_time_minutes}</span>
        <span class="stat-label">Duration (min)</span>
      </div>
      <div class="stat-item">
        <span class="stat-value">${test.marks_per_correct || 0}</span>
        <span class="stat-label">Marks per Question</span>
      </div>
    </div>
  </div>
  
  <!-- Professional Footer -->
  <div class="page-footer">
    <span>© ${new Date().getFullYear()} Professional Test Platform - Answer Key</span>
  </div>
</body>
</html>`

    // Enhanced Puppeteer Configuration for Premium PDF Generation
    const puppeteer = await import('puppeteer')
    const browser = await puppeteer.launch({ 
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-accelerated-2d-canvas',
        '--no-first-run',
        '--no-zygote',
        '--disable-gpu'
      ]
    })
    
    const page = await browser.newPage()
    
    // Set viewport for consistent rendering
    await page.setViewport({ width: 1200, height: 800, deviceScaleFactor: 2 })
    
    // Wait for fonts and resources to load
    await page.setContent(html, { 
      waitUntil: ['networkidle0', 'domcontentloaded'],
      timeout: 30000
    })
    
    // Generate high-quality PDF with professional settings
    const pdfBuffer = await page.pdf({ 
      format: 'A4',
      printBackground: true,
      margin: { 
        top: '20mm', 
        bottom: '25mm', 
        left: '15mm', 
        right: '15mm' 
      },
      displayHeaderFooter: true,
      headerTemplate: '<div></div>',
      footerTemplate: `
        <div style="font-size: 10px; color: #666; text-align: center; width: 100%; margin: 0 auto;">
          <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
        </div>
      `,
      preferCSSPageSize: true,
      timeout: 30000
    })
    
    await browser.close()

    const base64 = Buffer.from(pdfBuffer).toString('base64')
    const safeName = `${test.name || 'Test'}-Answer-Key-${testId}.pdf`.replace(/[^a-z0-9\-_.]/gi, '_')
    return { success: true, fileName: safeName, base64 }
  } catch (error) {
    console.error('Premium Answer Key export failed:', error)
    return { success: false, message: 'Failed to export Answer Key' }
  }
}

