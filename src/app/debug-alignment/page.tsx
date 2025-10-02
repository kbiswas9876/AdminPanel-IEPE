'use client'

import React, { useState, useEffect } from 'react'
import { UnifiedEditor } from '@/components/editors/UnifiedEditor'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export default function DebugAlignmentPage() {
  const [editorContent, setEditorContent] = useState(`
    <h2>Alignment Debug Test</h2>
    <p>Test different image alignments:</p>
    
    <div data-image-wrapper="true" data-alignment="left" style="display: block; margin: 1rem 0; text-align: left;">
      <img src="https://picsum.photos/300/200?random=1" data-alignment="left" data-width="300" data-height="200" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin-left: 0; margin-right: auto;" class="editor-image rounded-lg shadow-sm max-w-full h-auto" />
    </div>
    
    <div data-image-wrapper="true" data-alignment="center" style="display: block; margin: 1rem 0; text-align: center;">
      <img src="https://picsum.photos/300/200?random=2" data-alignment="center" data-width="300" data-height="200" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin-left: auto; margin-right: auto;" class="editor-image rounded-lg shadow-sm max-w-full h-auto" />
    </div>
    
    <div data-image-wrapper="true" data-alignment="right" style="display: block; margin: 1rem 0; text-align: right;">
      <img src="https://picsum.photos/300/200?random=3" data-alignment="right" data-width="300" data-height="200" style="max-width: 100%; height: auto; border-radius: 8px; display: block; margin-left: auto; margin-right: 0;" class="editor-image rounded-lg shadow-sm max-w-full h-auto" />
    </div>
  `)

  const [rawHtml, setRawHtml] = useState('')
  const [consoleOutput, setConsoleOutput] = useState<string[]>([])

  // Capture console logs
  useEffect(() => {
    const originalLog = console.log
    const logs: string[] = []
    
    console.log = (...args) => {
      const message = args.map(arg => 
        typeof arg === 'object' ? JSON.stringify(arg, null, 2) : String(arg)
      ).join(' ')
      
      if (message.includes('🎯 AdvancedImage')) {
        logs.push(message)
        setConsoleOutput([...logs])
      }
      
      originalLog(...args)
    }

    return () => {
      console.log = originalLog
    }
  }, [])

  const handleEditorChange = (content: string) => {
    setEditorContent(content)
    setRawHtml(content)
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    alert('Copied to clipboard!')
  }

  const clearLogs = () => {
    setConsoleOutput([])
  }

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">🔍 Debug Image Alignment</h1>
        <p className="text-lg text-muted-foreground mb-4">
          This page helps debug image alignment issues in the editor and preview.
        </p>
        
        <div className="flex gap-4 mb-6">
          <Button onClick={() => copyToClipboard(rawHtml)} variant="outline">
            Copy Raw HTML
          </Button>
          <Button onClick={clearLogs} variant="outline">
            Clear Console Logs
          </Button>
        </div>
      </div>

      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Editor View</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="border rounded-lg">
              <UnifiedEditor
                value={editorContent}
                onChange={handleEditorChange}
                placeholder="Test image alignments here..."
                showToolbar={true}
                className="min-h-[500px]"
              />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview View (Raw HTML Render)</CardTitle>
          </CardHeader>
          <CardContent>
            <div 
              className="border rounded-lg p-4 min-h-[500px] prose max-w-none"
              dangerouslySetInnerHTML={{ __html: rawHtml }}
            />
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Raw HTML Output</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="bg-gray-100 p-4 rounded text-xs overflow-x-auto whitespace-pre-wrap max-h-96">
              {rawHtml}
            </pre>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Console Debug Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="bg-gray-100 p-4 rounded max-h-96 overflow-y-auto">
              {consoleOutput.length === 0 ? (
                <p className="text-gray-500 italic">No debug logs yet. Try selecting/editing images in the editor.</p>
              ) : (
                consoleOutput.map((log, index) => (
                  <div key={index} className="mb-2 p-2 bg-white rounded text-xs font-mono">
                    {log}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Badge variant="secondary" className="mb-2">Step 1</Badge>
            <p>Click on images in the editor to see alignment controls</p>
          </div>
          
          <div>
            <Badge variant="secondary" className="mb-2">Step 2</Badge>
            <p>Try changing alignment (left, center, right) and observe:</p>
            <ul className="list-disc list-inside ml-4 mt-2">
              <li>Does the image position change in the editor?</li>
              <li>Does the preview update correctly?</li>
              <li>Check console logs for renderHTML calls</li>
            </ul>
          </div>
          
          <div>
            <Badge variant="secondary" className="mb-2">Step 3</Badge>
            <p>Compare the Raw HTML Output to see what attributes are being saved</p>
          </div>
          
          <div>
            <Badge variant="secondary" className="mb-2">Step 4</Badge>
            <p>Look for patterns in console logs to identify where the issue occurs</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
