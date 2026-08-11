'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { updateQuestionInPlace } from '@/lib/actions/questions'
import { toast } from 'sonner'
import type { Question } from '@/lib/types'

interface UpdateQuestionDifficultyParams {
  id: number
  difficulty: string
}

interface UpdateQuestionParams {
  id: number
  updates: Partial<Question>
}

export const useUpdateQuestionDifficulty = () => {
  const queryClient = useQueryClient()

  return useMutation({
    // The actual function that performs the API call
    mutationFn: async ({ id, difficulty }: UpdateQuestionDifficultyParams) => {
      const result = await updateQuestionInPlace({ 
        id, 
        difficulty: difficulty as 'Easy' | 'Easy-Moderate' | 'Moderate' | 'Moderate-Hard' | 'Hard' 
      })
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update difficulty.')
      }
      
      return result.data
    },
    
    // This block runs ONLY AFTER the mutationFn is successful
    onSuccess: (data, variables) => {
      // 1. Invalidate the query cache. This is the guaranteed correct place to do it.
      //    It will trigger a re-fetch for any component using this query key.
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      
      // 2. Show the success toast with proper formatting
      toast.success(`Difficulty updated to ${variables.difficulty}`, { 
        duration: 1500,
        description: `Question #${variables.id} difficulty changed successfully`
      })
    },

    // This block runs if the mutationFn throws an error
    onError: (error: Error) => {
      toast.error('Failed to update difficulty', {
        description: error.message,
        duration: 3000
      })
    },
  })
}

export const useUpdateQuestion = () => {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, updates }: UpdateQuestionParams) => {
      const result = await updateQuestionInPlace({ 
        id, 
        ...updates
      })
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to update question.')
      }
      
      return result.data
    },
    
    onSuccess: (data, variables) => {
      // Invalidate queries to trigger re-fetch
      queryClient.invalidateQueries({ queryKey: ['questions'] })
      
      toast.success('Question updated successfully', { 
        duration: 1500 
      })
    },

    onError: (error: Error) => {
      toast.error('Failed to update question', {
        description: error.message,
        duration: 3000
      })
    },
  })
}
