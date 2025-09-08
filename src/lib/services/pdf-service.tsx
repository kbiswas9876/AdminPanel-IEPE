import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { QuestionPaperPDF, AnswerKeyPDF, MinimalistPDF } from './pdf-generator'
import { Test, Question } from '@/lib/supabase/admin'

interface PDFSettings {
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

export interface PDFResult {
  success: boolean
  fileName?: string
  blob?: Blob
  message?: string
}

export class PDFService {
  /**
   * Generate Premium Question Paper PDF
   */
  static async generateQuestionPaperPDF(test: Test, questions: Question[], settings?: PDFSettings): Promise<PDFResult> {
    try {
      // Validate input data
      if (!test || !questions || questions.length === 0) {
        return {
          success: false,
          message: 'Invalid test data or no questions provided'
        }
      }

      // Ensure test has required properties
      const safeTest = {
        id: test.id || 0,
        name: test.name || 'Untitled Test',
        total_time_minutes: test.total_time_minutes || 60,
        marks_per_correct: test.marks_per_correct || 1,
        negative_marks_per_incorrect: test.negative_marks_per_incorrect || 0,
        status: test.status || 'draft',
        created_at: test.created_at || new Date().toISOString()
      }

      // Ensure questions have required properties
      const safeQuestions = questions.map(q => ({
        id: q.id || 0,
        question_id: String(q.question_id || 0),
        book_source: q.book_source || '',
        chapter_name: q.chapter_name || '',
        question_text: q.question_text || '',
        options: q.options || { a: '', b: '', c: '', d: '' },
        correct_option: q.correct_option || 'A',
        solution_text: q.solution_text || '',
        created_at: q.created_at || new Date().toISOString()
      }))

      const doc = <QuestionPaperPDF test={safeTest} questions={safeQuestions} settings={settings} />
      const blob = await pdf(doc).toBlob()
      
      const fileName = `${safeTest.name.replace(/[^a-zA-Z0-9]/g, '_')}_Question_Paper.pdf`
      
      return {
        success: true,
        fileName,
        blob
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      return {
        success: false,
        message: `PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Generate Answer Key PDF
   */
  static async generateAnswerKeyPDF(test: Test, questions: Question[], settings?: PDFSettings): Promise<PDFResult> {
    try {
      // Validate input data
      if (!test || !questions || questions.length === 0) {
        return {
          success: false,
          message: 'Invalid test data or no questions provided'
        }
      }

      // Ensure test has required properties
      const safeTest = {
        id: test.id || 0,
        name: test.name || 'Untitled Test',
        total_time_minutes: test.total_time_minutes || 60,
        marks_per_correct: test.marks_per_correct || 1,
        negative_marks_per_incorrect: test.negative_marks_per_incorrect || 0,
        status: test.status || 'draft',
        created_at: test.created_at || new Date().toISOString()
      }

      // Ensure questions have required properties
      const safeQuestions = questions.map(q => ({
        id: q.id || 0,
        question_id: String(q.question_id || 0),
        book_source: q.book_source || '',
        chapter_name: q.chapter_name || '',
        question_text: q.question_text || '',
        options: q.options || { a: '', b: '', c: '', d: '' },
        correct_option: q.correct_option || 'A',
        solution_text: q.solution_text || '',
        created_at: q.created_at || new Date().toISOString()
      }))

      const doc = <AnswerKeyPDF test={safeTest} questions={safeQuestions} settings={settings} />
      const blob = await pdf(doc).toBlob()
      
      const fileName = `${safeTest.name.replace(/[^a-zA-Z0-9]/g, '_')}_Answer_Key.pdf`
      
      return {
        success: true,
        fileName,
        blob
      }
    } catch (error) {
      console.error('Answer key PDF generation error:', error)
      return {
        success: false,
        message: `Answer key PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Generate Minimalist PDF
   */
  static async generateMinimalistPDF(test: Test, questions: Question[]): Promise<PDFResult> {
    try {
      // Validate input data
      if (!test || !questions || questions.length === 0) {
        return {
          success: false,
          message: 'Invalid test data or no questions provided'
        }
      }

      // Ensure test has required properties
      const safeTest = {
        id: test.id || 0,
        name: test.name || 'Untitled Test',
        total_time_minutes: test.total_time_minutes || 60,
        marks_per_correct: test.marks_per_correct || 1,
        negative_marks_per_incorrect: test.negative_marks_per_incorrect || 0,
        status: test.status || 'draft',
        created_at: test.created_at || new Date().toISOString()
      }

      // Ensure questions have required properties
      const safeQuestions = questions.map(q => ({
        id: q.id || 0,
        question_id: String(q.question_id || 0),
        book_source: q.book_source || '',
        chapter_name: q.chapter_name || '',
        question_text: q.question_text || '',
        options: q.options || { a: '', b: '', c: '', d: '' },
        correct_option: q.correct_option || 'A',
        solution_text: q.solution_text || '',
        created_at: q.created_at || new Date().toISOString()
      }))

      const doc = <MinimalistPDF test={safeTest} questions={safeQuestions} />
      const blob = await pdf(doc).toBlob()
      
      const fileName = `${safeTest.name.replace(/[^a-zA-Z0-9]/g, '_')}_Minimalist.pdf`
      
      return {
        success: true,
        fileName,
        blob
      }
    } catch (error) {
      console.error('Minimalist PDF generation error:', error)
      return {
        success: false,
        message: `Minimalist PDF generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  /**
   * Download PDF blob as file
   */
  static downloadPDF(blob: Blob, fileName: string): void {
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }
}
