'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { renderMathContent } from '@/lib/utils/latex-pdf-renderer'
import type { Test, Question } from '@/lib/supabase/admin'

interface PDFLivePreviewProps {
  test: Test
  questions: Question[]
  settings: {
    theme: {
      id: string
      name: string
      primaryColor: string
      secondaryColor: string
      fontFamily: string
      fontSize: number
    }
    showHeader: boolean
    showFooter: boolean
    showPageNumbers: boolean
    showInstructions: boolean
    questionsPerPage: number
    fontSize: number
    lineSpacing: number
    margins: number
  }
}

export function PDFLivePreview({ test, questions, settings }: PDFLivePreviewProps) {
  const [zoom, setZoom] = useState(0.8)
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalMarks = questions.length * (test.marks_per_correct || 1)
  const totalPages = Math.ceil(questions.length / settings.questionsPerPage)
  
  const getCurrentPageQuestions = () => {
    const startIndex = (currentPage - 1) * settings.questionsPerPage
    const endIndex = startIndex + settings.questionsPerPage
    return questions.slice(startIndex, endIndex)
  }

  const getQuestionNumber = (index: number) => {
    return (currentPage - 1) * settings.questionsPerPage + index + 1
  }

  const pageStyle = {
    width: `${595 * zoom}px`, // A4 width in pixels
    minHeight: `${842 * zoom}px`, // A4 height in pixels
    backgroundColor: '#ffffff',
    padding: `${settings.margins * zoom}px`,
    fontFamily: settings.theme.fontFamily,
    fontSize: `${settings.fontSize * zoom}px`,
    lineHeight: settings.lineSpacing,
    border: '1px solid #e5e7eb',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    margin: '0 auto',
    position: 'relative' as const,
  }

  const headerStyle = {
    marginBottom: `${15 * zoom}px`,
    paddingBottom: `${10 * zoom}px`,
    borderBottom: `2px solid ${settings.theme.primaryColor}`,
  }

  const titleStyle = {
    fontSize: `${24 * zoom}px`,
    fontWeight: 'bold',
    color: settings.theme.primaryColor,
    textAlign: 'center' as const,
    marginBottom: `${8 * zoom}px`,
  }

  const testInfoStyle = {
    display: 'flex',
    justifyContent: 'space-between',
    marginBottom: `${5 * zoom}px`,
    fontSize: `${10 * zoom}px`,
    color: '#374151',
  }

  const infoItemStyle = {
    backgroundColor: '#f7fafc',
    padding: `${4 * zoom}px ${8 * zoom}px`,
    borderRadius: `${4 * zoom}px`,
    border: '1px solid #e2e8f0',
    textAlign: 'center' as const,
  }

  const instructionsStyle = {
    backgroundColor: '#f8fafc',
    border: '1px solid #cbd5e0',
    borderRadius: `${6 * zoom}px`,
    padding: `${12 * zoom}px`,
    marginBottom: `${15 * zoom}px`,
    fontSize: `${10 * zoom}px`,
  }

  const questionContainerStyle = {
    marginBottom: `${15 * zoom}px`,
    padding: `${12 * zoom}px`,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: `${4 * zoom}px`,
  }

  const questionHeaderStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: `${8 * zoom}px`,
  }

  const questionNumberStyle = {
    fontSize: `${12 * zoom}px`,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: `${8 * zoom}px`,
    minWidth: `${20 * zoom}px`,
  }

  const questionTextStyle = {
    fontSize: `${11 * zoom}px`,
    color: '#374151',
    lineHeight: 1.4,
    flex: 1,
  }

  const optionsGridStyle = {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: `${6 * zoom}px`,
    marginTop: `${8 * zoom}px`,
  }

  const optionStyle = {
    width: '48%',
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: `${4 * zoom}px`,
  }

  const optionLabelStyle = {
    fontSize: `${10 * zoom}px`,
    fontWeight: 'bold',
    color: settings.theme.primaryColor,
    marginRight: `${4 * zoom}px`,
    minWidth: `${16 * zoom}px`,
  }

  const optionTextStyle = {
    fontSize: `${10 * zoom}px`,
    color: '#374151',
    flex: 1,
    lineHeight: 1.3,
  }

  const footerStyle = {
    position: 'absolute' as const,
    bottom: `${15 * zoom}px`,
    left: `${settings.margins * zoom}px`,
    right: `${settings.margins * zoom}px`,
    textAlign: 'center' as const,
    fontSize: `${9 * zoom}px`,
    color: '#6b7280',
    borderTop: '1px solid #e2e8f0',
    paddingTop: `${8 * zoom}px`,
  }

  return (
    <div className="flex flex-col h-full">
      {/* Preview Controls */}
      <div className="flex items-center justify-between p-4 border-b bg-gray-50">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.max(0.5, zoom - 0.1))}
            disabled={zoom <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium">{Math.round(zoom * 100)}%</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(Math.min(1.5, zoom + 0.1))}
            disabled={zoom >= 1.5}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setZoom(0.8)}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage <= 1}
          >
            Previous
          </Button>
          <span className="text-sm font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage >= totalPages}
          >
            Next
          </Button>
        </div>
      </div>

      {/* PDF Preview */}
      <div className="flex-1 overflow-auto p-4 bg-gray-100">
        <div style={pageStyle}>
          {/* Header */}
          {settings.showHeader && (
            <div style={headerStyle}>
              <div style={titleStyle}>{test.name || 'Test Paper'}</div>
              
              <div style={testInfoStyle}>
                <div style={infoItemStyle}>
                  <div style={{ fontWeight: 'bold' }}>Duration</div>
                  <div>{test.total_time_minutes || 60} minutes</div>
                </div>
                <div style={infoItemStyle}>
                  <div style={{ fontWeight: 'bold' }}>Total Questions</div>
                  <div>{questions.length}</div>
                </div>
                <div style={infoItemStyle}>
                  <div style={{ fontWeight: 'bold' }}>Full Marks</div>
                  <div>{totalMarks}</div>
                </div>
                <div style={infoItemStyle}>
                  <div style={{ fontWeight: 'bold' }}>Marking</div>
                  <div>+{test.marks_per_correct || 1} for correct, -{test.negative_marks_per_incorrect || 0} for incorrect</div>
                </div>
              </div>
            </div>
          )}

          {/* Instructions */}
          {settings.showInstructions && (
            <div style={instructionsStyle}>
              <div style={{ fontSize: `${12 * zoom}px`, fontWeight: 'bold', color: '#1f2937', marginBottom: `${6 * zoom}px` }}>
                Instructions
              </div>
              <div style={{ marginBottom: `${3 * zoom}px`, color: '#374151', paddingLeft: `${6 * zoom}px` }}>
                • Read all questions carefully before answering.
              </div>
              <div style={{ marginBottom: `${3 * zoom}px`, color: '#374151', paddingLeft: `${6 * zoom}px` }}>
                • Each question carries {test.marks_per_correct || 1} mark(s) for correct answer.
              </div>
              {test.negative_marks_per_incorrect && test.negative_marks_per_incorrect > 0 && (
                <div style={{ marginBottom: `${3 * zoom}px`, color: '#374151', paddingLeft: `${6 * zoom}px` }}>
                  • There is negative marking of {test.negative_marks_per_incorrect} mark(s) for each incorrect answer.
                </div>
              )}
              <div style={{ marginBottom: `${3 * zoom}px`, color: '#374151', paddingLeft: `${6 * zoom}px` }}>
                • Choose the most appropriate answer from the given options.
              </div>
              <div style={{ marginBottom: `${3 * zoom}px`, color: '#374151', paddingLeft: `${6 * zoom}px` }}>
                • Use only black or blue ink pen for marking answers.
              </div>
            </div>
          )}

          {/* Questions */}
          {getCurrentPageQuestions().map((question, index) => (
            <div key={question.id} style={questionContainerStyle}>
              <div style={questionHeaderStyle}>
                <div style={questionNumberStyle}>{getQuestionNumber(index)}.</div>
                <div style={questionTextStyle}>
                  {renderMathContent(question.question_text || '')}
                </div>
              </div>
              
              <div style={optionsGridStyle}>
                {question.options?.a && (
                  <div style={optionStyle}>
                    <div style={optionLabelStyle}>(A)</div>
                    <div style={optionTextStyle}>
                      {renderMathContent(question.options.a)}
                    </div>
                  </div>
                )}
                {question.options?.b && (
                  <div style={optionStyle}>
                    <div style={optionLabelStyle}>(B)</div>
                    <div style={optionTextStyle}>
                      {renderMathContent(question.options.b)}
                    </div>
                  </div>
                )}
                {question.options?.c && (
                  <div style={optionStyle}>
                    <div style={optionLabelStyle}>(C)</div>
                    <div style={optionTextStyle}>
                      {renderMathContent(question.options.c)}
                    </div>
                  </div>
                )}
                {question.options?.d && (
                  <div style={optionStyle}>
                    <div style={optionLabelStyle}>(D)</div>
                    <div style={optionTextStyle}>
                      {renderMathContent(question.options.d)}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {/* Footer */}
          {settings.showFooter && (
            <div style={footerStyle}>
              © 2025 Professional Test Platform - Question Paper
              {settings.showPageNumbers && ` | Page ${currentPage} of ${totalPages}`}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
