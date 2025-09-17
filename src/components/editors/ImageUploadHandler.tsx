'use client'

import { toast } from 'sonner'
import { uploadQuestionImage } from '@/lib/actions/image-upload'

/**
 * Default image upload handler using Supabase storage
 * This uploads images to Supabase storage and returns the public URL
 */
export async function defaultImageUpload(file: File, questionId?: number, fieldType?: 'question' | 'option_a' | 'option_b' | 'option_c' | 'option_d' | 'solution'): Promise<string> {
  try {
    console.log('defaultImageUpload called with:', {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      questionId,
      fieldType
    })

    // First test file handling
    const testResult = await testFileHandling(file)
    if (!testResult.success) {
      throw new Error(`File validation failed: ${testResult.error}`)
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      throw new Error('File must be an image')
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      throw new Error('Image size must be less than 10MB')
    }

    // If we have questionId and fieldType, use proper Supabase upload
    if (questionId && fieldType) {
      console.log('Using Supabase upload for question:', questionId, 'field:', fieldType)
      toast.loading('Uploading image to cloud storage...', { id: 'image-upload' })
      
      const result = await uploadQuestionImage(file, questionId, fieldType)
      
      if (result.success && result.imageUrl) {
        toast.success('Image uploaded successfully!', { id: 'image-upload' })
        return result.imageUrl
      } else {
        throw new Error(result.error || 'Upload failed')
      }
    } else {
      console.log('Using base64 fallback')
      // Fallback to base64 for cases where we don't have question context
      toast.loading('Processing image...', { id: 'image-upload' })
      
      const result = await convertToBase64(file)
      
      toast.success('Image processed successfully!', { id: 'image-upload' })
      return result
    }
  } catch (error) {
    console.error('defaultImageUpload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Failed to upload image'
    toast.error(errorMessage, { id: 'image-upload' })
    throw error
  }
}

/**
 * Convert file to base64 data URL (fallback method)
 */
async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    
    reader.onload = () => {
      const result = reader.result as string
      resolve(result)
    }
    
    reader.onerror = () => {
      reject(new Error('Failed to read image file'))
    }
    
    reader.readAsDataURL(file)
  })
}

/**
 * Enhanced image upload handler with better error handling and user feedback
 */
export async function enhancedImageUpload(file: File, questionId?: number, fieldType?: 'question' | 'option_a' | 'option_b' | 'option_c' | 'option_d' | 'solution'): Promise<string> {
  return defaultImageUpload(file, questionId, fieldType)
}

/**
 * Legacy function for backward compatibility
 */
export async function cloudImageUpload(file: File): Promise<string> {
  return defaultImageUpload(file)
}

/**
 * Test function to debug file handling issues
 */
export async function testFileHandling(file: File): Promise<{ success: boolean; error?: string; details?: any }> {
  try {
    console.log('Testing file handling for:', file.name)
    
    const details = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      lastModified: file.lastModified,
      isFile: file instanceof File,
      constructor: file.constructor.name,
      // Additional checks
      hasName: !!file.name,
      hasSize: file.size !== undefined,
      hasType: !!file.type,
      hasLastModified: file.lastModified !== undefined
    }
    
    console.log('File details:', details)
    
    // Test basic file properties
    if (!file) {
      return { success: false, error: 'File is null or undefined', details }
    }
    
    // Check if file has required properties
    if (!file.name || file.name.trim() === '') {
      return { success: false, error: 'File has no name', details }
    }
    
    if (file.size === undefined || file.size === null) {
      return { success: false, error: 'File size is undefined', details }
    }
    
    if (file.size === 0) {
      return { success: false, error: 'File is empty (0 bytes)', details }
    }
    
    if (!file.type || file.type.trim() === '') {
      return { success: false, error: 'File has no MIME type', details }
    }
    
    if (!file.type.startsWith('image/')) {
      return { success: false, error: `File is not an image (type: ${file.type})`, details }
    }
    
    // Test FileReader availability
    if (typeof FileReader === 'undefined') {
      return { success: false, error: 'FileReader is not available', details }
    }
    
    // Test if we can access file properties without errors
    try {
      const testProps = {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }
      console.log('File properties accessible:', testProps)
    } catch (propError) {
      return { success: false, error: `Cannot access file properties: ${propError}`, details }
    }
    
    return { success: true, details }
  } catch (error) {
    console.error('File handling test failed:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error',
      details: { error }
    }
  }
}
