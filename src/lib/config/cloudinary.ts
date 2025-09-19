// Cloudinary Configuration
// These credentials are for development/testing purposes only
// Generate new credentials for production deployment

export const cloudinaryConfig = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'dxnzfzu3o',
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || '497356693436946',
  apiSecret: process.env.CLOUDINARY_API_SECRET || 'qekxcBYQgtFfFctjbOoyYriKslU',
  uploadPreset: 'ml_default', // You need to create this in Cloudinary Dashboard
}

// Server-side configuration for API routes
export const serverCloudinaryConfig = {
  cloudName: cloudinaryConfig.cloudName,
  apiKey: cloudinaryConfig.apiKey,
  apiSecret: cloudinaryConfig.apiSecret,
}

// Client-side configuration for upload widget
export const clientCloudinaryConfig = {
  cloudName: cloudinaryConfig.cloudName,
  uploadPreset: cloudinaryConfig.uploadPreset,
}
