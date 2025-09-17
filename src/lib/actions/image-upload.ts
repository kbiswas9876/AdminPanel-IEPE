'use client'

import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

/**
 * Convert file to base64 data URL (fallback method)
 */
async function convertToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    // Validate file before reading
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    if (!file.type.startsWith('image/')) {
      reject(new Error('Invalid file type. Please select an image file.'))
      return
    }

    // Check if file is empty
    if (file.size === 0) {
      reject(new Error('File is empty'))
      return
    }

    // Check if file is too large (100MB limit for base64)
    const maxSize = 100 * 1024 * 1024 // 100MB
    if (file.size > maxSize) {
      reject(new Error('File is too large for base64 encoding'))
      return
    }

    console.log('Starting FileReader for file:', {
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified
    })

    const reader = new FileReader()
    
    // Set timeout to prevent hanging
    const timeout = setTimeout(() => {
      reader.abort()
      reject(new Error('File reading timed out'))
    }, 30000) // 30 second timeout
    
    reader.onload = () => {
      clearTimeout(timeout)
      try {
        const result = reader.result as string
        if (!result) {
          reject(new Error('FileReader returned empty result'))
          return
        }
        console.log('FileReader success, result length:', result.length)
        resolve(result)
      } catch (error) {
        console.error('Error processing FileReader result:', error)
        reject(new Error(`Error processing file: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }
    
    reader.onerror = (event) => {
      clearTimeout(timeout)
      console.error('FileReader error event:', event)
      console.error('FileReader error details:', {
        error: reader.error,
        readyState: reader.readyState,
        result: reader.result
      })
      reject(new Error(`Failed to read image file. Error: ${reader.error?.message || 'Unknown FileReader error'}`))
    }
    
    reader.onabort = () => {
      clearTimeout(timeout)
      console.error('FileReader aborted')
      reject(new Error('File reading was aborted'))
    }
    
    try {
      console.log('Starting FileReader.readAsDataURL')
      reader.readAsDataURL(file)
    } catch (error) {
      clearTimeout(timeout)
      console.error('Error starting FileReader:', error)
      reject(new Error(`Failed to start reading file: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

/**
 * Alternative method to convert file to base64 using ArrayBuffer
 */
async function convertToBase64Alternative(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    console.log('Trying alternative conversion method for file:', file.name)
    
    const reader = new FileReader()
    
    reader.onload = () => {
      try {
        const arrayBuffer = reader.result as ArrayBuffer
        if (!arrayBuffer) {
          reject(new Error('ArrayBuffer is empty'))
          return
        }
        
        // Convert ArrayBuffer to base64
        const bytes = new Uint8Array(arrayBuffer)
        let binary = ''
        for (let i = 0; i < bytes.byteLength; i++) {
          binary += String.fromCharCode(bytes[i])
        }
        
        const base64 = btoa(binary)
        const dataUrl = `data:${file.type};base64,${base64}`
        
        console.log('Alternative conversion successful, result length:', dataUrl.length)
        resolve(dataUrl)
      } catch (error) {
        console.error('Error in alternative conversion:', error)
        reject(new Error(`Alternative conversion failed: ${error instanceof Error ? error.message : 'Unknown error'}`))
      }
    }
    
    reader.onerror = (event) => {
      console.error('Alternative FileReader error:', event)
      reject(new Error(`Alternative conversion failed: ${reader.error?.message || 'Unknown error'}`))
    }
    
    try {
      reader.readAsArrayBuffer(file)
    } catch (error) {
      reject(new Error(`Failed to start alternative conversion: ${error instanceof Error ? error.message : 'Unknown error'}`))
    }
  })
}

export interface ImageUploadResult {
  success: boolean
  imageUrl?: string
  imagePath?: string
  error?: string
}

export interface QuestionImageData {
  question_id: number
  image_url: string
  image_path: string
  field_type: 'question' | 'option_a' | 'option_b' | 'option_c' | 'option_d' | 'solution'
  field_position?: number
  original_filename?: string
  file_size?: number
  mime_type?: string
}

/**
 * Upload image to Supabase storage and save metadata to question_images table
 */
export async function uploadQuestionImage(
  file: File,
  questionId: number,
  fieldType: QuestionImageData['field_type'],
  fieldPosition?: number
): Promise<ImageUploadResult> {
  try {
    const supabase = createClient()
    
    // Validate file
    if (!file.type.startsWith('image/')) {
      return { success: false, error: 'File must be an image' }
    }

    // Check file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return { success: false, error: 'Image size must be less than 10MB' }
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 15)
    const fileExtension = file.name.split('.').pop() || 'jpg'
    const fileName = `question_${questionId}_${fieldType}_${timestamp}_${randomString}.${fileExtension}`
    const filePath = `question-images/${fileName}`

    // Try Supabase storage upload first
    try {
      console.log('Attempting Supabase storage upload...')
      
      // Check if storage bucket exists and is accessible
      const { data: buckets, error: bucketsError } = await supabase.storage.listBuckets()
      if (bucketsError) {
        console.error('Cannot access storage buckets:', bucketsError)
        console.log('Storage access failed, falling back to base64')
        throw new Error('STORAGE_ACCESS_FAILED')
      }
      
      const questionImagesBucket = buckets?.find(bucket => bucket.name === 'question-images')
      if (!questionImagesBucket) {
        console.log('question-images bucket not found, attempting to create it...')
        
        // Try to create the bucket
        const { data: createData, error: createError } = await supabase.storage.createBucket('question-images', {
          public: true,
          allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
          fileSizeLimit: 10485760 // 10MB
        })
        
        if (createError) {
          console.log('Bucket creation failed:', createError.message)
          console.log('This is likely due to insufficient permissions or RLS policies')
          console.log('Falling back to base64 storage')
          throw new Error('BUCKET_CREATION_FAILED')
        }
        
        console.log('Successfully created question-images bucket')
      }
      
      // Upload to Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('question-images')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false
        })

      if (uploadError) {
        console.log('Supabase storage upload failed:', uploadError.message)
        // Check if it's an RLS policy error
        if (uploadError.message.includes('row-level security policy')) {
          console.log('RLS policy error detected - falling back to base64')
          throw new Error('RLS_POLICY_ERROR')
        }
        console.log('Storage upload failed, falling back to base64')
        throw new Error(`Storage upload failed: ${uploadError.message}`)
      }

      console.log('Supabase storage upload successful:', uploadData)

      // Get public URL
      const { data: urlData } = supabase.storage
        .from('question-images')
        .getPublicUrl(filePath)

      const publicUrl = urlData.publicUrl
      console.log('Public URL generated:', publicUrl)

      // Save metadata to database
      const { error: dbError } = await supabase
        .from('question_images')
        .insert({
          question_id: questionId,
          image_url: publicUrl,
          image_path: filePath,
          field_type: fieldType,
          field_position: fieldPosition,
          original_filename: file.name,
          file_size: file.size,
          mime_type: file.type
        })

      if (dbError) {
        console.error('Database insert failed:', dbError)
        // Don't throw error here, the file is already uploaded
      }

      return {
        success: true,
        imageUrl: publicUrl,
        imagePath: filePath
      }

    } catch (supabaseError) {
      console.log('Supabase upload failed, falling back to base64:', supabaseError instanceof Error ? supabaseError.message : 'Unknown error')
      
      // Check if it's specifically an RLS policy error
      if (supabaseError instanceof Error && supabaseError.message.includes('RLS_POLICY_ERROR')) {
        console.log('RLS policy error detected - using base64 fallback')
        toast.info('Using base64 storage due to RLS policy restrictions. Consider configuring Supabase storage policies for better performance.')
      }
      
      // Check if it's a bucket creation error
      if (supabaseError instanceof Error && supabaseError.message.includes('BUCKET_CREATION_FAILED')) {
        console.log('Bucket creation failed - using base64 fallback')
        toast.warning('Storage bucket not configured. Images will be stored as base64. Please create the "question-images" bucket in your Supabase dashboard for better performance.')
      }
      
      // Check if it's a storage access error
      if (supabaseError instanceof Error && supabaseError.message.includes('STORAGE_ACCESS_FAILED')) {
        console.log('Storage access failed - using base64 fallback')
        toast.info('Using base64 storage due to storage access restrictions.')
      }
      
      // Fallback to base64 if Supabase fails
      try {
        console.log('Converting image to base64...')
        const base64Result = await convertToBase64(file)
        console.log('Base64 conversion successful')
        
        return {
          success: true,
          imageUrl: base64Result,
          imagePath: 'base64-fallback'
        }
      } catch (base64Error) {
        console.error('Base64 conversion failed, trying alternative method:', base64Error)
        
        // Try alternative method using ArrayBuffer
        try {
          console.log('Trying alternative base64 conversion...')
          const arrayBufferResult = await convertToBase64Alternative(file)
          console.log('Alternative base64 conversion successful')
          return {
            success: true,
            imageUrl: arrayBufferResult,
            imagePath: 'base64-fallback'
          }
        } catch (altError) {
          console.error('Alternative conversion also failed:', altError)
          throw new Error(`Image processing failed: ${supabaseError instanceof Error ? supabaseError.message : 'Unknown error'}`)
        }
      }
    }

  } catch (error) {
    console.error('Image upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
    console.error('Detailed error:', {
      error,
      file: {
        name: file.name,
        size: file.size,
        type: file.type,
        lastModified: file.lastModified
      }
    })
    return { 
      success: false, 
      error: errorMessage
    }
  }
}

/**
 * Get images for a specific question
 */
export async function getQuestionImages(questionId: number): Promise<QuestionImageData[]> {
  try {
    const supabase = createClient()
    
    const { data, error } = await supabase
      .from('question_images')
      .select('*')
      .eq('question_id', questionId)
      .order('field_type', { ascending: true })
      .order('field_position', { ascending: true })

    if (error) {
      console.error('Error fetching question images:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Error fetching question images:', error)
    return []
  }
}

/**
 * Delete an image from storage and database
 */
export async function deleteQuestionImage(imageId: number): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    
    // First get the image data
    const { data: imageData, error: fetchError } = await supabase
      .from('question_images')
      .select('image_path')
      .eq('id', imageId)
      .single()

    if (fetchError || !imageData) {
      return { success: false, error: 'Image not found' }
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('question-images')
      .remove([imageData.image_path])

    if (storageError) {
      console.error('Storage deletion error:', storageError)
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('question_images')
      .delete()
      .eq('id', imageId)

    if (dbError) {
      return { success: false, error: `Database error: ${dbError.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error('Error deleting image:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}

/**
 * Update image metadata
 */
export async function updateQuestionImage(
  imageId: number, 
  updates: Partial<Omit<QuestionImageData, 'id' | 'question_id' | 'created_at' | 'created_by'>>
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = createClient()
    
    const { error } = await supabase
      .from('question_images')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', imageId)

    if (error) {
      return { success: false, error: `Update error: ${error.message}` }
    }

    return { success: true }
  } catch (error) {
    console.error('Error updating image:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error occurred' 
    }
  }
}
