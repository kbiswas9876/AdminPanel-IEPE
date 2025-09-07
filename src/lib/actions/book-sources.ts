'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface BookSource {
  id: number
  name: string
  code: string
  created_at: string
}

export async function getBookSources(): Promise<{
  data: BookSource[]
  error?: string
}> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('book_sources')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching book sources:', error)
      return {
        data: [],
        error: error.message
      }
    }
    
    return {
      data: data || [],
      error: undefined
    }
  } catch (error) {
    console.error('Unexpected error:', error)
    return {
      data: [],
      error: 'An unexpected error occurred'
    }
  }
}

export async function createBookSource(name: string, code: string): Promise<{
  success: boolean
  message: string
  data?: BookSource
}> {
  try {
    if (!name || !code) {
      return {
        success: false,
        message: 'Book name and code are required'
      }
    }

    const supabase = createAdminClient()
    
    // Check if book source already exists
    const { data: existing } = await supabase
      .from('book_sources')
      .select('id')
      .or(`name.eq.${name},code.eq.${code}`)
      .single()
    
    if (existing) {
      return {
        success: false,
        message: 'A book source with this name or code already exists'
      }
    }
    
    const { data, error } = await supabase
      .from('book_sources')
      .insert({
        name,
        code
      })
      .select()
      .single()
    
    if (error) {
      console.error('Error creating book source:', error)
      return {
        success: false,
        message: `Failed to create book source: ${error.message}`
      }
    }
    
    // Revalidate the content page to refresh the UI
    revalidatePath('/content')
    
    return {
      success: true,
      message: 'Book source created successfully!',
      data
    }
    
  } catch (error) {
    console.error('Unexpected error creating book source:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while creating the book source'
    }
  }
}

// Get book source names only (for backward compatibility)
export async function getBookSourceNames(): Promise<string[]> {
  try {
    const result = await getBookSources()
    return result.data.map(book => book.name)
  } catch (error) {
    console.error('Error getting book source names:', error)
    return []
  }
}

// Delete book source
export async function deleteBookSource(id: number): Promise<{
  success: boolean
  message: string
}> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('book_sources')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting book source:', error)
      return {
        success: false,
        message: `Failed to delete book source: ${error.message}`
      }
    }
    
    // Revalidate the content page to refresh the UI
    revalidatePath('/content')
    
    return {
      success: true,
      message: 'Book source deleted successfully!'
    }
    
  } catch (error) {
    console.error('Unexpected error deleting book source:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while deleting the book source'
    }
  }
}