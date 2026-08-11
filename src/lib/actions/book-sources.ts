'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import { revalidatePath } from 'next/cache'

export interface BookSource {
  id: number
  name: string
  code: string
  icon_url?: string | null
  exam_type?: string | null
  author?: string | null
  publisher?: string | null
  publication_year?: string | null
  description?: string | null
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

export async function createBookSource(
  name: string,
  code: string,
  extraData?: {
    icon_url?: string
    exam_type?: string
    author?: string
    publisher?: string
    publication_year?: string
    description?: string
  }
): Promise<{
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
        code,
        icon_url: extraData?.icon_url || null,
        exam_type: extraData?.exam_type || null,
        author: extraData?.author || null,
        publisher: extraData?.publisher || null,
        publication_year: extraData?.publication_year || null,
        description: extraData?.description || null
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

export async function updateBookSource(
  id: number,
  updateData: {
    name?: string
    icon_url?: string | null
    exam_type?: string | null
    author?: string | null
    publisher?: string | null
    publication_year?: string | null
    description?: string | null
  }
): Promise<{
  success: boolean
  message: string
  data?: BookSource
}> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('book_sources')
      .update(updateData)
      .eq('id', id)
      .select()
      .single()
    
    if (error) {
      console.error('Error updating book source:', error)
      return {
        success: false,
        message: `Failed to update book source: ${error.message}`
      }
    }
    
    revalidatePath('/content')
    
    return {
      success: true,
      message: 'Book source updated successfully!',
      data
    }
  } catch (error) {
    console.error('Unexpected error updating book source:', error)
    return {
      success: false,
      message: 'An unexpected error occurred while updating the book source'
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

// Upload Book Cover Image File to Supabase Storage
export async function uploadBookCoverIcon(formData: FormData): Promise<{
  success: boolean
  url?: string
  message: string
}> {
  try {
    const file = formData.get('file') as File
    if (!file) {
      return { success: false, message: 'No file provided for upload' }
    }

    const supabase = createAdminClient()
    const fileExt = file.name.split('.').pop() || 'png'
    const fileName = `book-cover-${Date.now()}-${Math.random().toString(36).substring(2, 7)}.${fileExt}`
    const buffer = Buffer.from(await file.arrayBuffer())

    const { error: uploadError } = await supabase.storage
      .from('book-icons')
      .upload(fileName, buffer, {
        contentType: file.type || 'image/png',
        upsert: true
      })

    if (uploadError) {
      console.error('Storage upload error:', uploadError)
      return { success: false, message: uploadError.message }
    }

    const { data: publicUrlData } = supabase.storage
      .from('book-icons')
      .getPublicUrl(fileName)

    return {
      success: true,
      url: publicUrlData.publicUrl,
      message: 'Cover image uploaded successfully!'
    }
  } catch (err: any) {
    console.error('Upload error:', err)
    return { success: false, message: err.message || 'File upload failed' }
  }
}