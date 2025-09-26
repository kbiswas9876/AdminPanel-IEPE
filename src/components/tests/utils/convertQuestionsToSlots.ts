import type { Question, TestQuestionSlot } from '@/lib/types'

/**
 * Convert an array of Questions to TestQuestionSlot format
 * @param questions Array of Question objects
 * @returns Array of TestQuestionSlot objects
 */
export function convertQuestionsToSlots(questions: Question[]): TestQuestionSlot[] {
  return questions.map(question => ({
    question,
    source_type: 'custom' as const,
    chapter_name: question.chapter_name || '',
    source_value: null,
    tempId: `custom-${question.id}-${Date.now()}`
  }))
}
