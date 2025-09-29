import type { Question, TestQuestionSlot } from '@/lib/types'

/**
 * Convert an array of Questions to TestQuestionSlot format
 * @param questions Array of Question objects
 * @returns Array of TestQuestionSlot objects
 */
export function convertQuestionsToSlots(questions: Question[]): TestQuestionSlot[] {
  return questions.map(question => {
    // Extract custom marking data if it exists on the question object
    const customMarking = (question as any).customMarking
    console.log('🔄 Converting question to slot:', { 
      questionId: question.id, 
      hasCustomMarking: !!customMarking,
      customMarking 
    })
    
    return {
      question,
      source_type: 'custom' as const,
      chapter_name: question.chapter_name || '',
      source_value: null,
      tempId: `custom-${question.id}-${Date.now()}`,
      // Preserve any existing customMarking data
      customMarking: customMarking || undefined
    }
  })
}
