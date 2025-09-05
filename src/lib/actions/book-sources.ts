'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { BookSource } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

// Get all book sources
export async function getBookSources(): Promise<BookSource[]> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('book_sources')
      .select('*')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching book sources:', error)
      return []
    }
    
    return data as BookSource[]
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

// Get book source names for dropdown (used in question forms)
export async function getBookSourceNames(): Promise<string[]> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('book_sources')
      .select('name')
      .order('name', { ascending: true })
    
    if (error) {
      console.error('Error fetching book source names:', error)
      return []
    }
    
    return data.map(item => item.name)
  } catch (error) {
    console.error('Unexpected error:', error)
    return []
  }
}

// Create a new book source
export async function createBookSource(formData: FormData): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const bookData = {
      name: formData.get('name') as string,
      code: formData.get('code') as string,
    }
    
    // Validate required fields
    if (!bookData.name || !bookData.code) {
      return {
        success: false,
        message: 'Name and code are required'
      }
    }
    
    // Check if code already exists
    const { data: existingBook } = await supabase
      .from('book_sources')
      .select('id')
      .eq('code', bookData.code)
      .single()
    
    if (existingBook) {
      return {
        success: false,
        message: 'A book with this code already exists'
      }
    }
    
    const { error } = await supabase
      .from('book_sources')
      .insert([bookData])
    
    if (error) {
      console.error('Error creating book source:', error)
      return {
        success: false,
        message: error.message
      }
    }
    
    revalidatePath('/books')
    return {
      success: true,
      message: 'Book source added successfully!'
    }
  } catch (error) {
    console.error('Error creating book source:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while creating the book source'
    }
  }
}

// Delete a book source
export async function deleteBookSource(id: number) {
  try {
    const supabase = createAdminClient()
    
    // Check if any questions are using this book source
    const { data: questionsUsingBook } = await supabase
      .from('questions')
      .select('id')
      .eq('book_source', (await supabase.from('book_sources').select('name').eq('id', id).single()).data?.name)
      .limit(1)
    
    if (questionsUsingBook && questionsUsingBook.length > 0) {
      throw new Error('Cannot delete book source that is being used by questions')
    }
    
    const { error } = await supabase
      .from('book_sources')
      .delete()
      .eq('id', id)
    
    if (error) {
      console.error('Error deleting book source:', error)
      throw new Error(error.message)
    }
    
    revalidatePath('/books')
  } catch (error) {
    console.error('Error deleting book source:', error)
    throw error
  }
}
