'use server'

import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Server actions for ID generation and database operations
 */

/**
 * Check if a book code already exists in the database
 * @param bookCode - The book code to check
 * @returns Promise<boolean> - True if the book code exists
 */
export async function bookCodeExists(bookCode: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('book_sources')
      .select('code')
      .eq('code', bookCode)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking book code existence:', error)
      return false
    }
    
    return !!data
  } catch (error) {
    console.error('Unexpected error checking book code:', error)
    return false
  }
}

/**
 * Check if a question ID already exists in the database
 * @param questionId - The question ID to check
 * @returns Promise<boolean> - True if the question ID exists
 */
export async function questionIdExists(questionId: string): Promise<boolean> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('questions')
      .select('question_id')
      .eq('question_id', questionId)
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking question ID existence:', error)
      return false
    }
    
    return !!data
  } catch (error) {
    console.error('Unexpected error checking question ID:', error)
    return false
  }
}

/**
 * Get the book code for a given book name from the database
 * @param bookName - The book name
 * @returns Promise<string | null> - The book code if found, null otherwise
 */
export async function getBookCodeByName(bookName: string): Promise<string | null> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('book_sources')
      .select('code')
      .eq('name', bookName)
      .single()
    
    if (error) {
      console.error('Error fetching book code by name:', error)
      return null
    }
    
    return data?.code || null
  } catch (error) {
    console.error('Unexpected error in getBookCodeByName:', error)
    return null
  }
}

/**
 * Get all book sources with their codes
 * @returns Promise<{ name: string; code: string }[]> - Array of book sources with codes
 */
export async function getAllBookSourcesWithCodes(): Promise<{ name: string; code: string }[]> {
  try {
    const supabase = createAdminClient()
    const { data, error } = await supabase
      .from('book_sources')
      .select('name, code')
      .order('name', { ascending: true })

    if (error) {
      console.error('Error fetching all book sources with codes:', error)
      return []
    }
    return data || []
  } catch (error) {
    console.error('Unexpected error in getAllBookSourcesWithCodes:', error)
    return []
  }
}
