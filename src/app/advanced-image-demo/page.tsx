'use client'

import React, { useState, useRef } from 'react'
import { UnifiedEditor } from '@/components/editors/UnifiedEditor'
import { AdvancedTipTapEditor } from '@/components/editors/AdvancedTipTapEditor'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Copy, Check, Upload, ImageIcon, Sparkles, Zap, Star } from 'lucide-react'

export default function AdvancedImageDemoPage() {
  const [unifiedContent, setUnifiedContent] = useState(`
    <h1>🎨 Advanced Tiptap Image Handler Demo</h1>
    <p>Welcome to the most comprehensive image handling system for Tiptap editors! This demo showcases all the professional-grade features.</p>
    
    <h2>✨ Key Features</h2>
    <ul>
      <li><strong>8-Point Resizing</strong> - Corner and side handles with smooth dragging</li>
      <li><strong>Aspect Ratio Lock</strong> - Toggle to maintain proportions</li>
      <li><strong>Alignment Controls</strong> - Left, center, right with text wrapping</li>
      <li><strong>Floating Images</strong> - Text flows around left/right aligned images</li>
      <li><strong>Percentage Presets</strong> - Quick resize to 25%, 50%, 75%, 100%</li>
      <li><strong>Direct Dimension Input</strong> - Precise width/height control</li>
      <li><strong>Captions</strong> - Editable inline captions below images</li>
      <li><strong>Alt Text</strong> - Accessibility support with modal editor</li>
      <li><strong>Replace Images</strong> - Swap image without losing settings</li>
    </ul>

    <h2>🖼️ Sample Images</h2>
    <p>Click on any image below to see the advanced controls in action!</p>
    
    <div data-image-wrapper="true" style="text-align: center;">
      <img src="https://picsum.photos/600/400?random=1" alt="Sample landscape image" data-width="600" data-height="400" data-alignment="center" data-caption="Center-aligned landscape image with caption" class="editor-image rounded-lg shadow-sm max-w-full h-auto" />
      <div class="image-caption" style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">Center-aligned landscape image with caption</div>
    </div>

    <p>This image above is center-aligned. Try clicking on it to see the floating toolbar with all the controls!</p>

    <div data-image-wrapper="true" style="float: left; margin: 0 16px 16px 0;">
      <img src="https://picsum.photos/300/200?random=2" alt="Left floating image" data-width="300" data-height="200" data-alignment="left" data-float="left" data-caption="Left floating image" class="editor-image rounded-lg shadow-sm max-w-full h-auto" />
      <div class="image-caption" style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">Left floating image</div>
    </div>

    <p>This paragraph demonstrates text wrapping around a left-floating image. The image floats to the left while the text flows naturally around it. This is perfect for creating magazine-style layouts where images are integrated seamlessly with the content. You can resize the image and the text will continue to flow around it properly.</p>

    <p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>

    <div data-image-wrapper="true" style="float: right; margin: 0 0 16px 16px;">
      <img src="https://picsum.photos/250/300?random=3" alt="Right floating image" data-width="250" data-height="300" data-alignment="right" data-float="right" data-caption="Right floating portrait" class="editor-image rounded-lg shadow-sm max-w-full h-auto" />
      <div class="image-caption" style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">Right floating portrait</div>
    </div>

    <p>Here's another example with a right-floating image. This portrait-oriented image demonstrates how the system handles different aspect ratios while maintaining proper text flow. The floating behavior works seamlessly with the resize controls.</p>

    <p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>

    <h2>🎯 How to Use</h2>
    <ol>
      <li><strong>Click on any image</strong> to select it and see the floating toolbar</li>
      <li><strong>Drag resize handles</strong> - 8 handles (corners + sides) for precise control</li>
      <li><strong>Use alignment buttons</strong> - Left, Center, Right in the toolbar</li>
      <li><strong>Try percentage presets</strong> - 25%, 50%, 75%, 100% buttons</li>
      <li><strong>Toggle aspect ratio lock</strong> - Lock/unlock icon to maintain proportions</li>
      <li><strong>Edit dimensions directly</strong> - Click the maximize icon for precise input</li>
      <li><strong>Add captions</strong> - Click below the image to add/edit captions</li>
      <li><strong>Edit alt text</strong> - Click the text icon for accessibility</li>
      <li><strong>Replace images</strong> - Upload icon to swap without losing settings</li>
      <li><strong>Reset to original</strong> - Rotate icon to restore original dimensions</li>
    </ol>

    <h2>📱 Responsive Design</h2>
    <p>All features work perfectly on mobile devices with touch-optimized controls and responsive layouts.</p>
  `)

  const [advancedContent, setAdvancedContent] = useState(`
    <h1>🚀 Advanced Editor with Professional Image Handling</h1>
    <p>This advanced editor includes all the image features plus additional capabilities like math support and enhanced formatting.</p>
    
    <div data-image-wrapper="true" style="text-align: center;">
      <img src="https://picsum.photos/500/300?random=4" alt="Advanced editor demo" data-width="500" data-height="300" data-alignment="center" data-caption="Advanced editor with full image controls" class="editor-image rounded-lg shadow-sm max-w-full h-auto" />
      <div class="image-caption" style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">Advanced editor with full image controls</div>
    </div>

    <p>Try uploading your own images using the toolbar above, or drag and drop images directly into the editor!</p>

    <h2>🧮 Math + Images</h2>
    <p>You can combine mathematical expressions with images seamlessly:</p>
    
    <p>The quadratic formula: $x = \\frac{-b \\pm \\sqrt{b^2 - 4ac}}{2a}$</p>
    
    <div data-image-wrapper="true" style="text-align: center;">
      <img src="https://picsum.photos/400/250?random=5" alt="Math and images demo" data-width="400" data-height="250" data-alignment="center" data-caption="Perfect integration of math and images" class="editor-image rounded-lg shadow-sm max-w-full h-auto" />
      <div class="image-caption" style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic;">Perfect integration of math and images</div>
    </div>
  `)

  const [copiedUnified, setCopiedUnified] = useState(false)
  const [copiedAdvanced, setCopiedAdvanced] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const copyToClipboard = async (content: string, type: 'unified' | 'advanced') => {
    try {
      await navigator.clipboard.writeText(content)
      if (type === 'unified') {
        setCopiedUnified(true)
        setTimeout(() => setCopiedUnified(false), 2000)
      } else {
        setCopiedAdvanced(true)
        setTimeout(() => setCopiedAdvanced(false), 2000)
      }
    } catch (err) {
      console.error('Failed to copy content:', err)
    }
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (event) => {
        // This would typically upload to your server
        console.log('File uploaded:', event.target?.result)
        // For demo purposes, you could insert the image into the editor
      }
      reader.readAsDataURL(file)
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <div className="flex items-center gap-4 mb-4">
          <div className="p-3 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl">
            <ImageIcon className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Advanced Tiptap Image Handler
            </h1>
            <p className="text-xl text-muted-foreground mt-2">
              Professional image editing that rivals Notion, Medium, and Google Docs
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 mb-6">
          <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
            <Star className="w-3 h-3 mr-1" />
            8-Point Resizing
          </Badge>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800 border-blue-200">
            <Zap className="w-3 h-3 mr-1" />
            Aspect Ratio Lock
          </Badge>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800 border-purple-200">
            <Sparkles className="w-3 h-3 mr-1" />
            Floating Images
          </Badge>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800 border-orange-200">
            ✨ Captions & Alt Text
          </Badge>
          <Badge variant="secondary" className="bg-pink-100 text-pink-800 border-pink-200">
            🎯 Drag & Drop
          </Badge>
          <Badge variant="secondary" className="bg-indigo-100 text-indigo-800 border-indigo-200">
            📱 Mobile Ready
          </Badge>
        </div>

        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border border-blue-200 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-blue-900 mb-2 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Quick Upload Test
          </h3>
          <p className="text-blue-700 mb-4">
            Upload an image to test the advanced features, or use the sample images in the editors below.
          </p>
          <Button
            onClick={() => fileInputRef.current?.click()}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Upload className="w-4 h-4 mr-2" />
            Choose Image File
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileUpload}
          />
        </div>
      </div>

      <Tabs defaultValue="unified" className="w-full">
        <TabsList className="grid w-full grid-cols-2 mb-8">
          <TabsTrigger value="unified" className="text-lg py-3">
            <ImageIcon className="w-5 h-5 mr-2" />
            Unified Editor
          </TabsTrigger>
          <TabsTrigger value="advanced" className="text-lg py-3">
            <Sparkles className="w-5 h-5 mr-2" />
            Advanced Editor
          </TabsTrigger>
        </TabsList>

        <TabsContent value="unified" className="space-y-6">
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-2xl">
                <span className="flex items-center gap-3">
                  <ImageIcon className="w-6 h-6" />
                  Unified Editor Demo
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(unifiedContent, 'unified')}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  {copiedUnified ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copiedUnified ? 'Copied!' : 'Copy HTML'}
                </Button>
              </CardTitle>
              <CardDescription className="text-blue-100 text-lg">
                Click on images to see 8-point resizing, alignment controls, captions, and more!
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-0 rounded-b-lg overflow-hidden">
                <UnifiedEditor
                  value={unifiedContent}
                  onChange={setUnifiedContent}
                  placeholder="Click on images to see advanced controls, or drag new images here..."
                  showToolbar={true}
                  className="min-h-[800px] bg-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-6">
          <Card className="shadow-2xl border-0 bg-gradient-to-br from-white to-gray-50">
            <CardHeader className="bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-t-lg">
              <CardTitle className="flex items-center justify-between text-2xl">
                <span className="flex items-center gap-3">
                  <Sparkles className="w-6 h-6" />
                  Advanced Editor Demo
                </span>
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => copyToClipboard(advancedContent, 'advanced')}
                  className="bg-white/20 hover:bg-white/30 text-white border-white/30"
                >
                  {copiedAdvanced ? (
                    <Check className="w-4 h-4 mr-2" />
                  ) : (
                    <Copy className="w-4 h-4 mr-2" />
                  )}
                  {copiedAdvanced ? 'Copied!' : 'Copy HTML'}
                </Button>
              </CardTitle>
              <CardDescription className="text-purple-100 text-lg">
                Advanced editor with math support plus all the professional image features.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              <div className="border-0 rounded-b-lg overflow-hidden">
                <AdvancedTipTapEditor
                  value={advancedContent}
                  onChange={setAdvancedContent}
                  placeholder="Upload images, add math equations, and use all advanced features..."
                  showToolbar={true}
                  className="min-h-[800px] bg-white"
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card className="mt-12 bg-gradient-to-br from-gray-50 to-white border-2 border-gray-200">
        <CardHeader>
          <CardTitle className="text-2xl flex items-center gap-3">
            <div className="p-2 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            Feature Showcase
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-3 text-lg text-gray-900">🎯 Resize & Transform</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li><strong>8-point resizing:</strong> Corner and side handles for precise control</li>
                <li><strong>Aspect ratio lock:</strong> Toggle to maintain image proportions</li>
                <li><strong>Percentage presets:</strong> Quick resize to 25%, 50%, 75%, 100%</li>
                <li><strong>Direct input:</strong> Type exact width/height dimensions</li>
                <li><strong>Reset to original:</strong> Restore original image size instantly</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-lg text-gray-900">📐 Layout & Alignment</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li><strong>Three alignments:</strong> Left, center, right positioning</li>
                <li><strong>Floating images:</strong> Text wraps around left/right aligned images</li>
                <li><strong>Responsive design:</strong> Automatically constrains to editor width</li>
                <li><strong>Smart spacing:</strong> Proper margins and text flow</li>
                <li><strong>Mobile optimized:</strong> Touch-friendly controls on all devices</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-lg text-gray-900">✨ Content & Accessibility</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li><strong>Inline captions:</strong> Editable captions below images</li>
                <li><strong>Alt text editor:</strong> Full accessibility support with modal</li>
                <li><strong>Image replacement:</strong> Swap images without losing settings</li>
                <li><strong>Title attributes:</strong> Additional metadata support</li>
                <li><strong>Clean HTML output:</strong> Semantic, standards-compliant markup</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-3 text-lg text-gray-900">🚀 User Experience</h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-gray-700">
                <li><strong>Floating toolbar:</strong> Context menu appears on selection</li>
                <li><strong>Smooth animations:</strong> Professional transitions and feedback</li>
                <li><strong>Drag & drop:</strong> Upload images from desktop</li>
                <li><strong>Paste support:</strong> Insert images from clipboard</li>
                <li><strong>Keyboard shortcuts:</strong> Efficient workflow for power users</li>
              </ul>
            </div>
          </div>

          <div className="bg-blue-50 border border-blue-200 rounded-xl p-6 mt-8">
            <h4 className="font-semibold mb-3 text-lg text-blue-900 flex items-center gap-2">
              <ImageIcon className="w-5 h-5" />
              Implementation Details
            </h4>
            <div className="grid md:grid-cols-3 gap-4 text-sm">
              <div>
                <h5 className="font-medium text-blue-800 mb-2">Files Created:</h5>
                <ul className="space-y-1 text-blue-700 font-mono text-xs">
                  <li>• AdvancedImage.ts</li>
                  <li>• ImageNodeView.tsx</li>
                  <li>• advanced-image.css</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-800 mb-2">Integration:</h5>
                <ul className="space-y-1 text-blue-700 text-xs">
                  <li>• UnifiedEditor updated</li>
                  <li>• AdvancedTipTapEditor updated</li>
                  <li>• Backward compatible</li>
                </ul>
              </div>
              <div>
                <h5 className="font-medium text-blue-800 mb-2">Features:</h5>
                <ul className="space-y-1 text-blue-700 text-xs">
                  <li>• Production ready</li>
                  <li>• TypeScript support</li>
                  <li>• Mobile responsive</li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
