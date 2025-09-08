'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'
import { SmartLatexRenderer } from './smart-latex-renderer'
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
    showDuration: boolean
    showTotalQuestions: boolean
    showFullMarks: boolean
    showMarking: boolean
    includeOptions: boolean
    showInstructions: boolean
    showFooter: boolean
    showPageNumbers: boolean
    customHeaderText: string
    customFooterText: string
    questionsPerPage: number
    fontSize: number
    lineSpacing: number
    margins: number
  }
}

export function PDFLivePreview({ test, questions, settings }: PDFLivePreviewProps) {
  const [zoom, setZoom] = useState(0.7)

  const totalMarks = questions.length * (test.marks_per_correct || 1)

  // Intelligent header alignment logic
  const getHeaderAlignment = () => {
    const activeElements = []
    if (settings.showDuration) activeElements.push('duration')
    if (settings.showTotalQuestions) activeElements.push('totalQuestions')
    if (settings.showFullMarks) activeElements.push('fullMarks')
    if (settings.showMarking) activeElements.push('marking')

    const count = activeElements.length
    if (count === 1) return 'center'
    if (count === 2) return 'left-right'
    if (count === 3) return 'left-center-right'
    return 'left-center-right' // default for 4 elements
  }

  const headerAlignment = getHeaderAlignment()

  // Calculate how many questions fit per page based on settings
  const questionsPerPage = Math.max(1, Math.min(settings.questionsPerPage, 15))
  const totalPages = Math.ceil(questions.length / questionsPerPage)

  // Dynamic styles based on zoom and settings
  const pageStyle = {
    width: `${210 * zoom}mm`, // A4 width
    minHeight: `${297 * zoom}mm`, // A4 height
    maxWidth: '100%', // Ensure it doesn't exceed container
    backgroundColor: '#FFFFFF',
    margin: '0 auto 20px auto', // Add bottom margin between pages
    padding: `${settings.margins * zoom}px`,
    fontFamily: settings.theme.fontFamily,
    fontSize: `${settings.fontSize * zoom}px`,
    lineHeight: settings.lineSpacing,
    color: '#000000',
    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
    borderRadius: '8px',
    pageBreakAfter: 'always' as const
  }

  const headerStyle = {
    marginBottom: `${20 * zoom}px`,
    paddingBottom: `${15 * zoom}px`,
    borderBottomWidth: '2px',
    borderBottomColor: settings.theme.primaryColor,
    borderBottomStyle: 'solid' as const
  }

  const titleStyle = {
    fontSize: `${24 * zoom}px`,
    fontWeight: 'bold',
    color: settings.theme.primaryColor,
    textAlign: 'center' as const,
    marginBottom: `${15 * zoom}px`,
    fontFamily: settings.theme.fontFamily
  }

  const testInfoStyle = {
    display: 'flex',
    justifyContent: headerAlignment === 'center' ? 'center' : 
                   headerAlignment === 'left-right' ? 'space-between' : 'space-between',
    alignItems: 'center',
    gap: `${10 * zoom}px`,
    flexWrap: 'wrap' as const
  }

  const infoItemStyle = {
    backgroundColor: '#f8fafc',
    padding: `${8 * zoom}px ${12 * zoom}px`,
    borderRadius: `${6 * zoom}px`,
    borderWidth: '1px',
    borderColor: '#e2e8f0',
    textAlign: 'center' as const,
    minWidth: `${80 * zoom}px`
  }

  const instructionsStyle = {
    backgroundColor: '#f8fafc',
    borderWidth: '1px',
    borderColor: '#cbd5e0',
    borderRadius: `${8 * zoom}px`,
    padding: `${15 * zoom}px`,
    marginBottom: `${20 * zoom}px`,
    fontSize: `${11 * zoom}px`
  }

  const questionContainerStyle = {
    marginBottom: `${20 * zoom}px`,
    padding: `${12 * zoom}px`,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: `${6 * zoom}px`,
    pageBreakInside: 'avoid' as const
  }

  const questionHeaderStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: `${10 * zoom}px`
  }

  const questionNumberStyle = {
    fontSize: `${14 * zoom}px`,
    fontWeight: 'bold',
    color: settings.theme.primaryColor,
    marginRight: `${8 * zoom}px`,
    minWidth: `${25 * zoom}px`
  }

  const questionTextStyle = {
    fontSize: `${12 * zoom}px`,
    color: '#374151',
    lineHeight: settings.lineSpacing,
    flex: 1
  }

  const optionsGridStyle = {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: `${8 * zoom}px`,
    marginTop: `${10 * zoom}px`
  }

  const optionStyle = {
    display: 'flex',
    alignItems: 'flex-start',
    padding: `${6 * zoom}px`,
    backgroundColor: '#f9fafb',
    borderRadius: `${4 * zoom}px`,
    border: '1px solid #e5e7eb'
  }

  const optionLabelStyle = {
    fontSize: `${10 * zoom}px`,
    fontWeight: 'bold',
    color: settings.theme.primaryColor,
    marginRight: `${6 * zoom}px`,
    minWidth: `${20 * zoom}px`
  }

  const optionTextStyle = {
    fontSize: `${10 * zoom}px`,
    color: '#374151',
    flex: 1,
    lineHeight: settings.lineSpacing
  }

  const footerStyle = {
    marginTop: `${30 * zoom}px`,
    paddingTop: `${15 * zoom}px`,
    borderTopWidth: '1px',
    borderTopColor: '#e2e8f0',
    textAlign: 'center' as const,
    fontSize: `${9 * zoom}px`,
    color: '#6b7280'
  }

  // Split questions into pages
  const getQuestionsForPage = (pageNumber: number) => {
    const startIndex = (pageNumber - 1) * questionsPerPage
    const endIndex = startIndex + questionsPerPage
    return questions.slice(startIndex, endIndex)
  }

  const getQuestionNumber = (pageNumber: number, index: number) => {
    return (pageNumber - 1) * questionsPerPage + index + 1
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.1, 1.2))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.1, 0.4))
  }

  const handleResetZoom = () => {
    setZoom(0.7)
  }

  // Render a single page
  const renderPage = (pageNumber: number) => {
    const pageQuestions = getQuestionsForPage(pageNumber)
    
    return (
      <div key={pageNumber} style={pageStyle}>
        
        {/* Header */}
        {settings.showHeader && (
          <div style={headerStyle}>
            <div style={titleStyle}>
              {settings.customHeaderText || test.name || 'Test Paper'}
            </div>
            
            <div style={testInfoStyle}>
              {settings.showDuration && (
                <div style={infoItemStyle}>
                  <div style={{ fontWeight: 'bold', fontSize: `${10 * zoom}px` }}>Duration</div>
                  <div style={{ fontSize: `${9 * zoom}px` }}>{test.total_time_minutes || 60} minutes</div>
                </div>
              )}
              {settings.showTotalQuestions && (
                <div style={infoItemStyle}>
                  <div style={{ fontWeight: 'bold', fontSize: `${10 * zoom}px` }}>Total Questions</div>
                  <div style={{ fontSize: `${9 * zoom}px` }}>{questions.length}</div>
                </div>
              )}
              {settings.showFullMarks && (
                <div style={infoItemStyle}>
                  <div style={{ fontWeight: 'bold', fontSize: `${10 * zoom}px` }}>Full Marks</div>
                  <div style={{ fontSize: `${9 * zoom}px` }}>{totalMarks}</div>
                </div>
              )}
              {settings.showMarking && (
                <div style={infoItemStyle}>
                  <div style={{ fontWeight: 'bold', fontSize: `${10 * zoom}px` }}>Marking</div>
                  <div style={{ fontSize: `${9 * zoom}px` }}>
                    +{test.marks_per_correct || 1} for correct, -{test.negative_marks_per_incorrect || 0} for incorrect
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Instructions - only on first page */}
        {pageNumber === 1 && settings.showInstructions && (
          <div style={instructionsStyle}>
            <div style={{ fontSize: `${12 * zoom}px`, fontWeight: 'bold', color: '#1f2937', marginBottom: `${8 * zoom}px` }}>
              Instructions
            </div>
            <div style={{ marginBottom: `${4 * zoom}px`, color: '#374151', paddingLeft: `${8 * zoom}px` }}>
              • Read all questions carefully before answering.
            </div>
            <div style={{ marginBottom: `${4 * zoom}px`, color: '#374151', paddingLeft: `${8 * zoom}px` }}>
              • Each question carries {test.marks_per_correct || 1} mark(s) for correct answer.
            </div>
            {test.negative_marks_per_incorrect && test.negative_marks_per_incorrect > 0 && (
              <div style={{ marginBottom: `${4 * zoom}px`, color: '#374151', paddingLeft: `${8 * zoom}px` }}>
                • There is negative marking of {test.negative_marks_per_incorrect} mark(s) for each incorrect answer.
              </div>
            )}
            <div style={{ marginBottom: `${4 * zoom}px`, color: '#374151', paddingLeft: `${8 * zoom}px` }}>
              • Choose the most appropriate answer from the given options.
            </div>
            <div style={{ marginBottom: `${4 * zoom}px`, color: '#374151', paddingLeft: `${8 * zoom}px` }}>
              • Use only black or blue ink pen for marking answers.
            </div>
          </div>
        )}

        {/* Questions */}
        {pageQuestions.map((question, index) => (
          <div key={question.id} style={questionContainerStyle}>
            <div style={questionHeaderStyle}>
              <div style={questionNumberStyle}>{getQuestionNumber(pageNumber, index)}.</div>
              <div style={questionTextStyle}>
                <SmartLatexRenderer text={question.question_text || ''} />
              </div>
            </div>
            
            {settings.includeOptions && (
              <div style={optionsGridStyle}>
                {question.options?.a && (
                  <div style={optionStyle}>
                    <div style={optionLabelStyle}>(A)</div>
                    <div style={optionTextStyle}>
                      <SmartLatexRenderer text={question.options.a} />
                    </div>
                  </div>
                )}
                {question.options?.b && (
                  <div style={optionStyle}>
                    <div style={optionLabelStyle}>(B)</div>
                    <div style={optionTextStyle}>
                      <SmartLatexRenderer text={question.options.b} />
                    </div>
                  </div>
                )}
                {question.options?.c && (
                  <div style={optionStyle}>
                    <div style={optionLabelStyle}>(C)</div>
                    <div style={optionTextStyle}>
                      <SmartLatexRenderer text={question.options.c} />
                    </div>
                  </div>
                )}
                {question.options?.d && (
                  <div style={optionStyle}>
                    <div style={optionLabelStyle}>(D)</div>
                    <div style={optionTextStyle}>
                      <SmartLatexRenderer text={question.options.d} />
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        ))}

        {/* Footer */}
        {settings.showFooter && (
          <div style={footerStyle}>
            {settings.customFooterText || '© 2025 Professional Test Platform - Question Paper'}
            {settings.showPageNumbers && ` | Page ${pageNumber} of ${totalPages}`}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col h-full min-h-0">
      {/* Header Bar with Controls */}
      <div className="flex items-center justify-between p-4 bg-white border-b border-gray-200 flex-shrink-0">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomOut}
            disabled={zoom <= 0.4}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {Math.round(zoom * 100)}%
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={handleZoomIn}
            disabled={zoom >= 1.2}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleResetZoom}
          >
            <RotateCcw className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-600">
            {totalPages} page{totalPages !== 1 ? 's' : ''} • {questions.length} question{questions.length !== 1 ? 's' : ''}
          </span>
          <span className="text-sm text-gray-500">
            {settings.includeOptions ? 'With Options' : 'Questions Only'}
          </span>
        </div>
      </div>

      {/* Scrollable PDF Preview - Properly constrained */}
      <div className="flex-1 overflow-auto bg-gray-100 p-6 min-h-0">
        <div className="w-full max-w-none flex justify-center">
          <div className="w-full max-w-4xl">
            {Array.from({ length: totalPages }, (_, index) => renderPage(index + 1))}
          </div>
        </div>
      </div>
    </div>
  )
}