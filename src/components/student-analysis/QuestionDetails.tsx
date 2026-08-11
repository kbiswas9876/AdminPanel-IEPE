'use client'

import React from 'react'

interface QuestionDetailsProps {
  source?: string
  tags?: string[]
  hideMetadata?: boolean
}

const QuestionDetails: React.FC<QuestionDetailsProps> = ({ source, tags, hideMetadata = false }) => {
  // If hideMetadata is true, don't render anything
  if (hideMetadata) {
    return null
  }
  
  if (!source && (!tags || tags.length === 0)) {
    return null
  }

  return (
    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-lg p-4 mt-4 border border-slate-200 dark:border-slate-700">
      {source && (
        <div className="flex items-center gap-2 mb-2">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Source:</span>
          <span className="text-sm text-slate-900 dark:text-slate-100">{source}</span>
        </div>
      )}
      {tags && tags.length > 0 && (
        <div className="flex items-start gap-2">
          <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">Tags:</span>
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-md font-medium">
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default QuestionDetails

