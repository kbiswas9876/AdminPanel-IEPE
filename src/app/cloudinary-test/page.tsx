'use client'

import React from 'react'
import { UnifiedEditor } from '@/components/editors/UnifiedEditor'
import { AdvancedTipTapEditor } from '@/components/editors/AdvancedTipTapEditor'

export default function CloudinaryTestPage() {
  const [unifiedContent, setUnifiedContent] = React.useState('')
  const [advancedContent, setAdvancedContent] = React.useState('')

  return (
    <div className="container mx-auto p-6 space-y-8">
      <h1 className="text-3xl font-bold mb-6">Cloudinary Integration Test</h1>
      
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-semibold mb-3">Unified Editor with Cloudinary</h2>
          <UnifiedEditor
            value={unifiedContent}
            onChange={setUnifiedContent}
            placeholder="Test image upload with drag & drop or paste..."
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Advanced TipTap Editor with Cloudinary</h2>
          <AdvancedTipTapEditor
            value={advancedContent}
            onChange={setAdvancedContent}
            placeholder="Test image upload with drag & drop or paste..."
          />
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">Environment Check</h2>
          <div className="bg-gray-100 p-4 rounded">
            <p><strong>Cloud Name:</strong> {process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'Not set'}</p>
            <p><strong>API Key:</strong> {process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY || 'Not set'}</p>
            <p><strong>Upload Method:</strong> Server-side Cloudinary API</p>
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-3">How to Test</h2>
          <div className="bg-blue-50 p-4 rounded">
            <ul className="list-disc list-inside space-y-2">
              <li><strong>Drag & Drop:</strong> Drag any image file into the editors above</li>
              <li><strong>Paste:</strong> Copy an image and paste (Ctrl+V) into the editors</li>
              <li><strong>Toolbar Button:</strong> Click the image icon in the editor toolbar</li>
              <li><strong>File Types:</strong> JPG, PNG, GIF, WebP (max 5MB)</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}