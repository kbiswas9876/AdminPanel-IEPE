import { NextRequest, NextResponse } from 'next/server'
import { serverCloudinaryConfig } from '@/lib/config/cloudinary'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file || !file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'Invalid file type' }, { status: 400 })
    }

    // Create form data for Cloudinary upload
    const cloudinaryFormData = new FormData()
    cloudinaryFormData.append('file', file)
    cloudinaryFormData.append('upload_preset', 'ml_default')
    cloudinaryFormData.append('folder', 'admin-panel')

    // Upload to Cloudinary using server-side API
    const cloudinaryResponse = await fetch(
      `https://api.cloudinary.com/v1_1/${serverCloudinaryConfig.cloudName}/image/upload`,
      {
        method: 'POST',
        body: cloudinaryFormData,
      }
    )

    if (!cloudinaryResponse.ok) {
      const errorText = await cloudinaryResponse.text()
      console.error('Cloudinary upload failed:', {
        status: cloudinaryResponse.status,
        statusText: cloudinaryResponse.statusText,
        error: errorText
      })
      throw new Error(`Cloudinary upload failed: ${cloudinaryResponse.status} ${cloudinaryResponse.statusText}`)
    }

    const result = await cloudinaryResponse.json()

    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
    })
  } catch (error) {
    console.error('Cloudinary upload error:', error)
    return NextResponse.json(
      { error: 'Upload failed' },
      { status: 500 }
    )
  }
}
