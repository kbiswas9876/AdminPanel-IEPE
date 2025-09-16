import { toast } from 'sonner'

interface ImageUploadHandlerProps {
  onUpload: (file: File) => Promise<string>
}

export function createImageUploadHandler({ onUpload }: ImageUploadHandlerProps) {
  return async (file: File): Promise<string> => {
    try {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        throw new Error('Please select an image file')
      }
      
      // Validate file size (5MB limit)
      const maxSize = 5 * 1024 * 1024 // 5MB
      if (file.size > maxSize) {
        throw new Error('Image size must be less than 5MB')
      }
      
      // Show upload progress
      toast.loading('Uploading image...', { id: 'image-upload' })
      
      const url = await onUpload(file)
      
      toast.success('Image uploaded successfully!', { id: 'image-upload' })
      return url
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed'
      toast.error(errorMessage, { id: 'image-upload' })
      throw error
    }
  }
}

// Default implementation using a placeholder service
export const defaultImageUpload = createImageUploadHandler({
  onUpload: async (file: File): Promise<string> => {
    // This is a placeholder implementation
    // In a real app, you would upload to your server or cloud storage
    
    // For now, create a data URL (not recommended for production)
    return new Promise((resolve) => {
      const reader = new FileReader()
      reader.onload = () => {
        resolve(reader.result as string)
      }
      reader.readAsDataURL(file)
    })
  }
})

// Example implementation for server upload
export const createServerImageUpload = (uploadEndpoint: string) => {
  return createImageUploadHandler({
    onUpload: async (file: File): Promise<string> => {
      const formData = new FormData()
      formData.append('image', file)
      
      const response = await fetch(uploadEndpoint, {
        method: 'POST',
        body: formData,
      })
      
      if (!response.ok) {
        throw new Error('Upload failed')
      }
      
      const result = await response.json()
      return result.url
    }
  })
}
