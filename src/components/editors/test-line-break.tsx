'use client'

import React from 'react'
import { HTMLRenderer } from './HTMLRenderer'

export function TestLineBreak() {
  const testContent = "this is first line \\\\this is second line"
  
  return (
    <div className="p-4 border">
      <h3>Test Line Break</h3>
      <div className="mb-4">
        <strong>Raw content:</strong> {testContent}
      </div>
      <div className="mb-4">
        <strong>Rendered with HTMLRenderer:</strong>
        <HTMLRenderer content={testContent} />
      </div>
    </div>
  )
}

