'use server'

import { createAdminClient } from '@/lib/supabase/admin'
import type { PDFCustomizationSettings } from '@/lib/types'

// Default PDF customization settings
const DEFAULT_PDF_SETTINGS: PDFCustomizationSettings = {
  headerText: 'Professional Test Platform',
  footerText: `© ${new Date().getFullYear()} Professional Test Platform`,
  watermarkOpacity: 0.1,
  primaryColor: '#2563eb',
  secondaryColor: '#64748b',
  titleFont: 'Source Serif Pro',
  bodyFont: 'Inter',
  showInstructions: true,
  showPageNumbers: true,
  showTestMetadata: true,
}

// Get PDF customization settings
export async function getPDFCustomizationSettings(): Promise<PDFCustomizationSettings> {
  try {
    const supabase = createAdminClient()
    
    const { data, error } = await supabase
      .from('pdf_settings')
      .select('*')
      .single()
    
    if (error && error.code !== 'PGRST116') { // PGRST116 is "not found" error
      console.error('Error fetching PDF settings:', error)
      return DEFAULT_PDF_SETTINGS
    }
    
    if (!data) {
      // No settings found, return defaults
      return DEFAULT_PDF_SETTINGS
    }
    
    // Merge with defaults to ensure all properties exist
    return {
      ...DEFAULT_PDF_SETTINGS,
      ...data.settings,
    }
  } catch (error) {
    console.error('Error getting PDF settings:', error)
    return DEFAULT_PDF_SETTINGS
  }
}

// Update PDF customization settings
export async function updatePDFCustomizationSettings(settings: Partial<PDFCustomizationSettings>): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    // Get current settings
    const currentSettings = await getPDFCustomizationSettings()
    
    // Merge with new settings
    const updatedSettings = {
      ...currentSettings,
      ...settings,
    }
    
    // Upsert the settings
    const { error } = await supabase
      .from('pdf_settings')
      .upsert({
        id: 1, // Single settings record
        settings: updatedSettings,
        updated_at: new Date().toISOString(),
      })
    
    if (error) {
      console.error('Error updating PDF settings:', error)
      return { success: false, message: 'Failed to update PDF settings' }
    }
    
    return { success: true, message: 'PDF settings updated successfully' }
  } catch (error) {
    console.error('Error updating PDF settings:', error)
    return { success: false, message: 'Failed to update PDF settings' }
  }
}

// Reset PDF settings to defaults
export async function resetPDFCustomizationSettings(): Promise<{ success: boolean; message: string }> {
  try {
    const supabase = createAdminClient()
    
    const { error } = await supabase
      .from('pdf_settings')
      .upsert({
        id: 1,
        settings: DEFAULT_PDF_SETTINGS,
        updated_at: new Date().toISOString(),
      })
    
    if (error) {
      console.error('Error resetting PDF settings:', error)
      return { success: false, message: 'Failed to reset PDF settings' }
    }
    
    return { success: true, message: 'PDF settings reset to defaults' }
  } catch (error) {
    console.error('Error resetting PDF settings:', error)
    return { success: false, message: 'Failed to reset PDF settings' }
  }
}

