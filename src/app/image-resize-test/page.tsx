'use client'

import { useState } from 'react'
import { UnifiedEditor } from '@/components/editors/UnifiedEditor'
import { AdvancedTipTapEditor } from '@/components/editors/AdvancedTipTapEditor'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default function ImageResizeTestPage() {
  const [unifiedContent, setUnifiedContent] = useState(`
    <p>Unified Editor with Image Resize:</p>
    <p>Upload an image using the toolbar button, drag & drop, or paste from clipboard.</p>
    <p>Click on the image to see resize handles and use alignment buttons.</p>
  `)
  
  const [advancedContent, setAdvancedContent] = useState(`
    <p>Advanced TipTap Editor with Image Resize:</p>
    <p>This editor also supports image resizing.</p>
  `)

  const [selectedEditor, setSelectedEditor] = useState<'unified' | 'advanced'>('unified')

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold mb-2">Advanced TipTap Editor with Image Resize</h1>
        <p className="text-gray-600">
          Test the new professional image resize functionality with alignment controls.
        </p>
      </div>

      {/* Editor Selection */}
      <div className="mb-4 flex gap-2">
        <Button
          variant={selectedEditor === 'unified' ? 'default' : 'outline'}
          onClick={() => setSelectedEditor('unified')}
        >
          Unified Editor
        </Button>
        <Button
          variant={selectedEditor === 'advanced' ? 'default' : 'outline'}
          onClick={() => setSelectedEditor('advanced')}
        >
          Advanced Editor
        </Button>
      </div>

      {/* Editor */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>
            {selectedEditor === 'unified' ? 'Unified Editor' : 'Advanced TipTap Editor'} with Image Resize
          </CardTitle>
          <CardDescription>
            Upload images using the toolbar button, drag & drop, or paste from clipboard.
            Click on images to see resize handles and use alignment buttons.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {selectedEditor === 'unified' ? (
            <UnifiedEditor
              value={unifiedContent}
              onChange={setUnifiedContent}
              placeholder="Start typing or upload an image..."
            />
          ) : (
            <AdvancedTipTapEditor
              value={advancedContent}
              onChange={setAdvancedContent}
              placeholder="Start typing or upload an image..."
            />
          )}
        </CardContent>
      </Card>

      {/* Features */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="bg-green-50 border-green-200">
          <CardHeader>
            <CardTitle className="text-green-800">Features</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Visual resize handles - Blue circular handles on hover</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Corner resizing - Drag any corner to resize</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Aspect ratio preservation - Maintains image proportions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Hover effects - Blue border and handles on hover</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Smooth transitions - Animated handle appearance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Minimum size limits - Prevents images from becoming too small</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Image alignment - Left, center, right alignment buttons</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-green-600">✓</span>
              <span>Professional styling - Community-tested solution</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-yellow-50 border-yellow-200">
          <CardHeader>
            <CardTitle className="text-yellow-800">Technical Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">📦</span>
              <span>Package: tiptap-extension-resizable-image</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">🎯</span>
              <span>Handles: 4 corner handles (NW, NE, SW, SE)</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">🖱️</span>
              <span>Cursor: Appropriate resize cursors for each handle</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">🎨</span>
              <span>Styling: Blue handles with white borders and shadows</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">📱</span>
              <span>Responsive: Works with different image sizes</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">⚡</span>
              <span>Performance: Optimized for smooth resizing</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-yellow-600">🔧</span>
              <span>Maintenance: Community maintained and updated</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Usage Instructions */}
      <Card className="mt-6 bg-blue-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-blue-800">How to Use</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">1. Upload Images:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>Click the image button in the toolbar</li>
              <li>Drag and drop an image file</li>
              <li>Paste an image from clipboard (Ctrl+V)</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">2. Resize Images:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>Click on an image to select it</li>
              <li>Blue circular handles will appear at corners</li>
              <li>Drag any corner handle to resize</li>
              <li>Aspect ratio is maintained automatically</li>
            </ul>
          </div>
          <div>
            <h4 className="font-semibold text-blue-700 mb-2">3. Align Images:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-600">
              <li>Select an image</li>
              <li>Use the alignment buttons (Left, Center, Right)</li>
              <li>Images will align within the editor</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}