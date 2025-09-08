import { pdf } from '@react-pdf/renderer'
import React from 'react'
import { QuestionPaperPDF, AnswerKeyPDF, MinimalistPDF } from './pdf-generator'
import { Test, Question } from '@/lib/supabase/admin'

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
  static async generateQuestionPaperPDF(test: Test, questions: Question[]): Promise<PDFResult> {
    try {
      const doc = <QuestionPaperPDF test={test} questions={questions} />
      const blob = await pdf(doc).toBlob()
      
      const fileName = `${(test.name || 'Test').replace(/[^a-zA-Z0-9]/g, '_')}_Question_Paper.pdf`
      
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
  static async generateAnswerKeyPDF(test: Test, questions: Question[]): Promise<PDFResult> {
    try {
      const doc = <AnswerKeyPDF test={test} questions={questions} />
      const blob = await pdf(doc).toBlob()
      
      const fileName = `${(test.name || 'Test').replace(/[^a-zA-Z0-9]/g, '_')}_Answer_Key.pdf`
      
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
      const doc = <MinimalistPDF test={test} questions={questions} />
      const blob = await pdf(doc).toBlob()
      
      const fileName = `${(test.name || 'Test').replace(/[^a-zA-Z0-9]/g, '_')}_Minimalist.pdf`
      
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
