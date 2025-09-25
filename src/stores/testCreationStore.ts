import { create } from 'zustand'
import type { Question } from '@/lib/types'

interface TestCreationState {
  selectedQuestions: Question[]
  setSelectedQuestions: (questions: Question[]) => void
  clearSelectedQuestions: () => void
}

export const useTestCreationStore = create<TestCreationState>((set) => ({
  selectedQuestions: [],
  setSelectedQuestions: (questions) => set({ selectedQuestions: questions }),
  clearSelectedQuestions: () => set({ selectedQuestions: [] })
}))

