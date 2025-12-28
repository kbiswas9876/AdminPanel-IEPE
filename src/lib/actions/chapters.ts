'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface Chapter {
  id?: number
  name: string
  book_source: string
  created_at?: string
}

// Get all chapters for a specific book source
export async function getChaptersByBookSource(bookSource: string): Promise<{
  data: Chapter[]
  error?: string
}> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('chapters')
      .select('*')
      .eq('book_source', bookSource)
      .order('name')
    
    if (error) {
      console.error('Error fetching chapters:', error)
      return {
        data: [],
        error: error.message
      }
    }
    
    return {
      data: data || []
    }
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      data: [],
      error: 'An unexpected error occurred'
    }
  }
}

// Create a new chapter
export async function createChapter(name: string, bookSource: string): Promise<{
  success: boolean
  message: string
  data?: Chapter
}> {
  try {
    if (!name || !bookSource) {
      return {
        success: false,
        message: 'Chapter name and book source are required'
      }
    }

    const supabase = createAdminClient()
    
    // Check if chapter already exists for this book source
    const { data: existing } = await supabase
      .from('chapters')
      .select('id')
      .eq('name', name)
      .eq('book_source', bookSource)
      .single()
    
    if (existing) {
      return {
        success: false,
        message: 'A chapter with this name already exists for this book source'
      }
    }
    
    const { data, error } = await supabase
      .from('chapters')
      .insert({
        name,
        book_source: bookSource
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating chapter:', error)
      return {
        success: false,
        message: `Failed to create chapter: ${error.message}`
      }
    }
    
    // Revalidate the content page to refresh the UI
    revalidatePath('/content')
    
    return {
      success: true,
      message: 'Chapter created successfully!',
      data
    }
    
  } catch (error) {
    console.error('Unexpected error creating chapter:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while creating the chapter'
    }
  }
}

// Get all unique chapter names (for backward compatibility)
export async function getAllChapterNames(): Promise<string[]> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('chapters')
      .select('name')
      .order('name')
    
    if (error) {
      console.error('Error fetching chapter names:', error)
      return []
    }
    
    return data?.map(item => item.name) || []
    
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}
