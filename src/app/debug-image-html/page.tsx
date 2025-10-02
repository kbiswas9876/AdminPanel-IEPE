'use client'

import React, { useState } from 'react'
import { UnifiedEditor } from '@/components/editors/UnifiedEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function DebugImageHtmlPage() {
  const [content, setContent] = useState(`
    <h2>Debug Image HTML Output</h2>
    <p>This page helps debug the HTML output of images with different alignments.</p>
    
    <div data-image-wrapper="true" data-alignment="center" style="display: block; margin: 1rem 0; text-align: center;">
      <img src="https://picsum.photos/400/300?random=1" data-alignment="center" data-caption="Center aligned image" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin-left: auto; margin-right: auto;" class="editor-image rounded-lg shadow-sm max-w-full h-auto" />
      <div class="image-caption" style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic; text-align: inherit; clear: both;">Center aligned image</div>
    </div>
    
    <div data-image-wrapper="true" data-alignment="left" style="display: block; margin: 1rem 0; text-align: left;">
      <img src="https://picsum.photos/400/300?random=2" data-alignment="left" data-caption="Left aligned image" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin-left: 0; margin-right: auto;" class="editor-image rounded-lg shadow-sm max-w-full h-auto" />
      <div class="image-caption" style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic; text-align: inherit; clear: both;">Left aligned image</div>
    </div>
    
    <div data-image-wrapper="true" data-alignment="right" style="display: block; margin: 1rem 0; text-align: right;">
      <img src="https://picsum.photos/400/300?random=3" data-alignment="right" data-caption="Right aligned image" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin-left: auto; margin-right: 0;" class="editor-image rounded-lg shadow-sm max-w-full h-auto" />
      <div class="image-caption" style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic; text-align: inherit; clear: both;">Right aligned image</div>
    </div>
  `)

  const copyHtml = () => {
    navigator.clipboard.writeText(content)
    alert('HTML copied to clipboard!')
  }

  const showRawHtml = () => {
    console.log('Current HTML content:', content)
    alert('Check browser console for raw HTML')
  }

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🔍 Debug Image HTML Output</h1>
        <p className="text-lg text-muted-foreground mb-4">
          This page helps debug the HTML structure and alignment of images.
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button onClick={copyHtml} variant="outline">
            Copy HTML
          </Button>
          <Button onClick={showRawHtml} variant="outline">
            Log HTML to Console
          </Button>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Editor View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <UnifiedEditor
                value={content}
                onChange={setContent}
                placeholder="Test image alignments here..."
                showToolbar={true}
                className="min-h-[600px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview View (Raw HTML)</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="border rounded-lg p-4 min-h-[600px] prose max-w-none"
              dangerouslySetInnerHTML={{ __html: content }}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>HTML Source</CardTitle>
        </CardHeader>
        <CardContent>
          <pre className="bg-gray-100 p-4 rounded text-sm overflow-x-auto whitespace-pre-wrap">
            {content}
          </pre>
        </CardContent>
      </Card>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Expected HTML Structure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">Center Aligned</Badge>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`<div data-image-wrapper="true" data-alignment="center" style="display: block; margin: 1rem 0; text-align: center;">
  <img src="..." data-alignment="center" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin-left: auto; margin-right: auto;" />
  <div class="image-caption" style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic; text-align: inherit;">Caption</div>
</div>`}
            </pre>
          </div>
          
          <div>
            <Badge variant="secondary" className="mb-2">Left Aligned</Badge>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`<div data-image-wrapper="true" data-alignment="left" style="display: block; margin: 1rem 0; text-align: left;">
  <img src="..." data-alignment="left" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin-left: 0; margin-right: auto;" />
  <div class="image-caption" style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic; text-align: inherit;">Caption</div>
</div>`}
            </pre>
          </div>
          
          <div>
            <Badge variant="secondary" className="mb-2">Right Aligned</Badge>
            <pre className="bg-gray-100 p-3 rounded text-xs overflow-x-auto">
{`<div data-image-wrapper="true" data-alignment="right" style="display: block; margin: 1rem 0; text-align: right;">
  <img src="..." data-alignment="right" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin-left: auto; margin-right: 0;" />
  <div class="image-caption" style="margin-top: 8px; font-size: 14px; color: #666; font-style: italic; text-align: inherit;">Caption</div>
</div>`}
            </pre>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
