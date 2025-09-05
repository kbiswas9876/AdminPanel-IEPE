'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

interface BulkTagUpdateResult {
  success: boolean
  message: string
  updatedCount?: number
}

export async function bulkUpdateQuestionTags(
  questionIds: number[],
  addTagsString: string,
  removeTagsString: string
): Promise<BulkTagUpdateResult> {
  try {
    if (questionIds.length === 0) {
      return {
        success: false,
        message: 'No questions selected for tag update'
      }
    }

    if (!addTagsString.trim() && !removeTagsString.trim()) {
      return {
        success: false,
        message: 'Please specify tags to add or remove'
      }
    }

    const supabase = createAdminClient()
    let updatedCount = 0

    // Process each question individually to handle tag merging
    for (const questionId of questionIds) {
      try {
        // First, fetch the current question to get existing tags
        const { data: currentQuestion, error: fetchError } = await supabase
          .from('questions')
          .select('admin_tags')
          .eq('id', questionId)
          .single()

        if (fetchError) {
          console.error(`Error fetching question ${questionId}:`, fetchError)
          continue
        }

        // Get current tags (handle null/undefined)
        let currentTags: string[] = currentQuestion?.admin_tags || []

        // Process tags to add
        if (addTagsString.trim()) {
          const tagsToAdd = addTagsString
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)

          // Add new tags (avoid duplicates)
          const tagSet = new Set([...currentTags, ...tagsToAdd])
          currentTags = Array.from(tagSet)
        }

        // Process tags to remove
        if (removeTagsString.trim()) {
          const tagsToRemove = removeTagsString
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag.length > 0)

          // Remove specified tags
          currentTags = currentTags.filter(tag => !tagsToRemove.includes(tag))
        }

        // Update the question with the new tags
        const { error: updateError } = await supabase
          .from('questions')
          .update({ admin_tags: currentTags })
          .eq('id', questionId)

        if (updateError) {
          console.error(`Error updating question ${questionId}:`, updateError)
          continue
        }

        updatedCount++
      } catch (error) {
        console.error(`Unexpected error processing question ${questionId}:`, error)
        continue
      }
    }

    if (updatedCount === 0) {
      return {
        success: false,
        message: 'Failed to update any questions. Please check the question IDs and try again.'
      }
    }

    // Revalidate the content page to show updated data
    revalidatePath('/content')

    const addCount = addTagsString.trim() ? addTagsString.split(',').filter(tag => tag.trim()).length : 0
    const removeCount = removeTagsString.trim() ? removeTagsString.split(',').filter(tag => tag.trim()).length : 0

    let message = `Successfully updated tags for ${updatedCount} question${updatedCount !== 1 ? 's' : ''}.`
    if (addCount > 0) message += ` Added ${addCount} tag${addCount !== 1 ? 's' : ''}.`
    if (removeCount > 0) message += ` Removed ${removeCount} tag${removeCount !== 1 ? 's' : ''}.`

    return {
      success: true,
      message,
      updatedCount
    }
  } catch (error) {
    console.error('Unexpected error in bulk tag update:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while updating tags. Please try again.'
    }
  }
}

// Helper function to get all unique tags from questions (for future use)
export async function getAllUniqueTags(): Promise<{ success: boolean; tags: string[]; error?: string }> {
  try {
    const supabase = createAdminClient()

    const { data, error } = await supabase
      .from('questions')
      .select('admin_tags')
      .not('admin_tags', 'is', null)

    if (error) {
      console.error('Error fetching tags:', error)
      return {
        success: false,
        tags: [],
        error: 'Failed to fetch tags from database'
      }
    }

    // Flatten all tags and get unique values
    const allTags = data
      .map(question => question.admin_tags || [])
      .flat()
      .filter((tag, index, array) => array.indexOf(tag) === index) // Remove duplicates
      .sort()

    return {
      success: true,
      tags: allTags
    }
  } catch (error) {
    console.error('Unexpected error fetching tags:', error)
    return {
      success: false,
      tags: [],
      error: 'An unexpected error occurred while fetching tags'
    }
  }
}
