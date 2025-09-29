'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import type { BlueprintState } from '@/lib/types'

export interface BlueprintPreset {
  id: string
  name: string
  blueprint: BlueprintState
  created_at: string
  updated_at: string
}

/**
 * Get all blueprint presets for the current user
 */
export async function getPresets(): Promise<BlueprintPreset[]> {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      console.error('Error getting user:', userError)
      return []
    }

    // Fetch presets for the current user
    const { data: presets, error } = await supabase
      .from('test_blueprint_presets')
      .select('id, name, blueprint, created_at, updated_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Error fetching presets:', error)
      return []
    }

    return presets || []
  } catch (error) {
    console.error('Unexpected error fetching presets:', error)
    return []
  }
}

/**
 * Save a new blueprint preset
 */
export async function savePreset(name: string, blueprint: BlueprintState): Promise<{ success: boolean; message: string; presetId?: string }> {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, message: 'User not authenticated' }
    }

    // Validate input
    if (!name.trim()) {
      return { success: false, message: 'Preset name is required' }
    }

    if (!blueprint || Object.keys(blueprint).length === 0) {
      return { success: false, message: 'Blueprint configuration is required' }
    }

    // Check if a preset with this name already exists for the user
    const { data: existingPreset } = await supabase
      .from('test_blueprint_presets')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name.trim())
      .single()

    if (existingPreset) {
      return { success: false, message: 'A preset with this name already exists' }
    }

    // Insert the new preset
    const { data: newPreset, error } = await supabase
      .from('test_blueprint_presets')
      .insert({
        user_id: user.id,
        name: name.trim(),
        blueprint: blueprint
      })
      .select('id')
      .single()

    if (error) {
      console.error('Error saving preset:', error)
      return { success: false, message: `Failed to save preset: ${error.message}` }
    }

    // Revalidate the cache to ensure fresh data
    revalidatePath('/tests/new')
    
    return { 
      success: true, 
      message: 'Preset saved successfully',
      presetId: newPreset.id
    }
  } catch (error) {
    console.error('Unexpected error saving preset:', error)
    return { success: false, message: 'An unexpected error occurred while saving the preset' }
  }
}

/**
 * Update an existing blueprint preset
 */
export async function updatePreset(id: string, name: string, blueprint: BlueprintState): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, message: 'User not authenticated' }
    }

    // Validate input
    if (!name.trim()) {
      return { success: false, message: 'Preset name is required' }
    }

    if (!blueprint || Object.keys(blueprint).length === 0) {
      return { success: false, message: 'Blueprint configuration is required' }
    }

    // Check if another preset with this name already exists for the user
    const { data: existingPreset } = await supabase
      .from('test_blueprint_presets')
      .select('id')
      .eq('user_id', user.id)
      .eq('name', name.trim())
      .neq('id', id)
      .single()

    if (existingPreset) {
      return { success: false, message: 'A preset with this name already exists' }
    }

    // Update the preset
    const { error } = await supabase
      .from('test_blueprint_presets')
      .update({
        name: name.trim(),
        blueprint: blueprint
      })
      .eq('id', id)
      .eq('user_id', user.id) // Ensure user can only update their own presets

    if (error) {
      console.error('Error updating preset:', error)
      return { success: false, message: `Failed to update preset: ${error.message}` }
    }

    // Revalidate the cache
    revalidatePath('/tests/new')
    
    return { success: true, message: 'Preset updated successfully' }
  } catch (error) {
    console.error('Unexpected error updating preset:', error)
    return { success: false, message: 'An unexpected error occurred while updating the preset' }
  }
}

/**
 * Delete a blueprint preset
 */
export async function deletePreset(id: string): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = await createClient()
    
    // Get the current user
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      return { success: false, message: 'User not authenticated' }
    }

    // Delete the preset (RLS will ensure user can only delete their own presets)
    const { error } = await supabase
      .from('test_blueprint_presets')
      .delete()
      .eq('id', id)
      .eq('user_id', user.id)

    if (error) {
      console.error('Error deleting preset:', error)
      return { success: false, message: `Failed to delete preset: ${error.message}` }
    }

    // Revalidate the cache
    revalidatePath('/tests/new')
    
    return { success: true, message: 'Preset deleted successfully' }
  } catch (error) {
    console.error('Unexpected error deleting preset:', error)
    return { success: false, message: 'An unexpected error occurred while deleting the preset' }
  }
}

/**
 * Migrate presets from localStorage to database (one-time migration)
 */
export async function migrateLocalStoragePresets(): Promise<{ success: boolean; message: string; migratedCount: number }> {
  try {
    // This function will be called from the frontend to migrate existing localStorage presets
    // The actual migration logic will be handled in the frontend component
    return { success: true, message: 'Migration completed', migratedCount: 0 }
  } catch (error) {
    console.error('Unexpected error during migration:', error)
    return { success: false, message: 'Migration failed', migratedCount: 0 }
  }
}
