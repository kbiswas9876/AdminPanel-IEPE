'use client'

import React, { useEffect, useRef } from 'react'
import { clientCloudinaryConfig } from '@/lib/config/cloudinary'

interface CloudinaryUploadWidgetProps {
  onUpload: (url: string) => void
  onError?: (error: string) => void
}

declare global {
  interface Window {
    cloudinary: {
      createUploadWidget: (config: CloudinaryConfig, callback: CloudinaryCallback) => CloudinaryWidget
    }
  }
}

interface CloudinaryConfig {
  cloudName: string
  uploadPreset: string
  sources: string[]
  multiple: boolean
  cropping: boolean
  croppingAspectRatio: number | null
  croppingShowDimensions: boolean
  showAdvancedOptions: boolean
  folder: string
  resourceType: string
  maxFileSize: number
  clientAllowedFormats: string[]
}

interface CloudinaryResult {
  event: string
  info: {
    secure_url: string
  }
}

type CloudinaryCallback = (error: Error | null, result: CloudinaryResult | null) => void

interface CloudinaryWidget {
  open: () => void
  destroy: () => void
}

export function CloudinaryUploadWidget({ onUpload, onError }: CloudinaryUploadWidgetProps) {
  const widgetRef = useRef<CloudinaryWidget | null>(null)

  const initializeWidget = React.useCallback(() => {
    if (window.cloudinary) {
      widgetRef.current = window.cloudinary.createUploadWidget(
        {
          cloudName: clientCloudinaryConfig.cloudName,
          uploadPreset: 'ml_default', // This preset needs to be created in Cloudinary
          sources: ['local', 'url', 'camera'],
          multiple: false,
          cropping: true,
          croppingAspectRatio: null,
          croppingShowDimensions: true,
          showAdvancedOptions: false,
          folder: 'admin-panel',
          resourceType: 'image',
          maxFileSize: 5000000, // 5MB
          clientAllowedFormats: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        },
        (error: Error | null, result: CloudinaryResult | null) => {
          if (error) {
            console.error('Cloudinary upload error:', error)
            onError?.(error.message || 'Upload failed')
            return
          }

          if (result && result.event === 'success') {
            const url = result.info.secure_url
            onUpload(url)
          }
        }
      )
    }
  }, [onUpload, onError])

  useEffect(() => {
    // Load Cloudinary script if not already loaded
    if (!window.cloudinary) {
      const script = document.createElement('script')
      script.src = 'https://widget.cloudinary.com/v2.0/global/all.js'
      script.async = true
      script.onload = initializeWidget
      document.head.appendChild(script)
    } else {
      initializeWidget()
    }

    return () => {
      if (widgetRef.current) {
        widgetRef.current.destroy()
      }
    }
  }, [initializeWidget])


  const openWidget = () => {
    if (widgetRef.current) {
      widgetRef.current.open()
    }
  }

  return (
    <button
      onClick={openWidget}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
    >
      Upload Image
    </button>
  )
}
