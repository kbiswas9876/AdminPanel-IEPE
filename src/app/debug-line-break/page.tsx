'use client'

import React from 'react'
import { HTMLRenderer } from '@/components/editors/HTMLRenderer'

export default function DebugLineBreakPage() {
  const testCases = [
    "this is first line \\\\this is second line",
    "this is first line &#92;&#92;this is second line",
    "this is first line &amp;#92;&amp;#92;this is second line",
    "this is first line \\\\[4pt]this is second line",
    "this is first line \\\\[6pt]this is second line"
  ]

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-6">Debug Line Break Rendering</h1>
      
      {testCases.map((testCase, index) => (
        <div key={index} className="mb-8 p-4 border rounded">
          <h3 className="font-semibold mb-2">Test Case {index + 1}:</h3>
          <div className="mb-2">
            <strong>Raw content:</strong> <code>{testCase}</code>
          </div>
          <div className="mb-2">
            <strong>Rendered:</strong>
            <div className="border p-2 bg-gray-50">
              <HTMLRenderer content={testCase} />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

