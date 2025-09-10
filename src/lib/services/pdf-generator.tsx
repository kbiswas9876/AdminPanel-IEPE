import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'
import { Test, Question } from '@/lib/supabase/admin'
import { renderMathContent } from '@/lib/utils/latex-pdf-renderer'

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

// Professional PDF Styles - Optimized for space and readability
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 20,
    fontFamily: 'Helvetica',
    fontSize: 11,
    lineHeight: 1.4,
  },
  header: {
    marginBottom: 15,
    paddingBottom: 10,
    borderBottomWidth: 2,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1f2937',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Helvetica-Bold',
  },
  testInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    fontSize: 10,
    color: '#374151',
  },
  infoItem: {
    backgroundColor: '#f7fafc',
    padding: '4 8',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    textAlign: 'center',
  },
  instructions: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 6,
    padding: 12,
    marginBottom: 15,
    fontSize: 10,
  },
  instructionsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginBottom: 6,
  },
  instructionItem: {
    marginBottom: 3,
    color: '#374151',
    paddingLeft: 6,
  },
  questionContainer: {
    marginBottom: 15,
    padding: 12,
    backgroundColor: '#ffffff',
    border: '1px solid #e2e8f0',
    borderRadius: 4,
  },
  questionHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  questionNumber: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1f2937',
    marginRight: 8,
    minWidth: 20,
  },
  questionText: {
    fontSize: 11,
    color: '#374151',
    lineHeight: 1.4,
    flex: 1,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  option: {
    width: '48%',
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 4,
  },
  optionLabel: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#2563eb',
    marginRight: 4,
    minWidth: 16,
  },
  optionText: {
    fontSize: 10,
    color: '#374151',
    flex: 1,
    lineHeight: 1.3,
  },
  footer: {
    position: 'absolute',
    bottom: 15,
    left: 20,
    right: 20,
    textAlign: 'center',
    fontSize: 9,
    color: '#6b7280',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
  },
})

// Smart LaTeX Renderer Component
const SmartLatexRenderer = ({ text }: { text: string }) => {
  const renderedText = renderMathContent(text)
  return <Text>{renderedText}</Text>
}

// Premium Question Paper PDF Component
export const QuestionPaperPDF = ({ test, questions, settings }: { test: Test; questions: Question[]; settings?: PDFSettings }) => {
  const totalMarks = questions.length * (test.marks_per_correct || 1)
  
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Professional Header */}
        {settings?.showHeader !== false && (
          <View style={styles.header}>
            <Text style={styles.title}>{settings?.customHeaderText || test.name || 'Test Paper'}</Text>
            
            <View style={styles.testInfo}>
              {settings?.showDuration !== false && (
                <View style={styles.infoItem}>
                  <Text style={{ fontWeight: 'bold' }}>Duration</Text>
                  <Text>{test.total_time_minutes || 60} minutes</Text>
                </View>
              )}
              {settings?.showTotalQuestions !== false && (
                <View style={styles.infoItem}>
                  <Text style={{ fontWeight: 'bold' }}>Total Questions</Text>
                  <Text>{questions.length}</Text>
                </View>
              )}
              {settings?.showFullMarks !== false && (
                <View style={styles.infoItem}>
                  <Text style={{ fontWeight: 'bold' }}>Full Marks</Text>
                  <Text>{totalMarks}</Text>
                </View>
              )}
              {settings?.showMarking !== false && (
                <View style={styles.infoItem}>
                  <Text style={{ fontWeight: 'bold' }}>Marking</Text>
                  <Text>+{test.marks_per_correct || 1} for correct, -{test.negative_marks_per_incorrect || 0} for incorrect</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Instructions */}
        {settings?.showInstructions !== false && (
          <View style={styles.instructions}>
            <Text style={styles.instructionsTitle}>Instructions</Text>
            <Text style={styles.instructionItem}>• Read all questions carefully before answering.</Text>
            <Text style={styles.instructionItem}>• Each question carries {test.marks_per_correct || 1} mark(s) for correct answer.</Text>
            {test.negative_marks_per_incorrect && test.negative_marks_per_incorrect > 0 && (
              <Text style={styles.instructionItem}>• There is negative marking of {test.negative_marks_per_incorrect} mark(s) for each incorrect answer.</Text>
            )}
            <Text style={styles.instructionItem}>• Choose the most appropriate answer from the given options.</Text>
            <Text style={styles.instructionItem}>• Use only black or blue ink pen for marking answers.</Text>
          </View>
        )}

        {/* Questions */}
        {questions.map((question, index) => (
          <View key={question.id} style={styles.questionContainer}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>{index + 1}.</Text>
              <Text style={styles.questionText}>
                <SmartLatexRenderer text={question.question_text || ''} />
              </Text>
            </View>
            
            {settings?.includeOptions && (
              <View style={styles.optionsGrid}>
                <View style={styles.option}>
                  <Text style={styles.optionLabel}>(A)</Text>
                  <Text style={styles.optionText}>
                    <SmartLatexRenderer text={question.options?.a || 'Option A'} />
                  </Text>
                </View>
                <View style={styles.option}>
                  <Text style={styles.optionLabel}>(B)</Text>
                  <Text style={styles.optionText}>
                    <SmartLatexRenderer text={question.options?.b || 'Option B'} />
                  </Text>
                </View>
                <View style={styles.option}>
                  <Text style={styles.optionLabel}>(C)</Text>
                  <Text style={styles.optionText}>
                    <SmartLatexRenderer text={question.options?.c || 'Option C'} />
                  </Text>
                </View>
                <View style={styles.option}>
                  <Text style={styles.optionLabel}>(D)</Text>
                  <Text style={styles.optionText}>
                    <SmartLatexRenderer text={question.options?.d || 'Option D'} />
                  </Text>
                </View>
              </View>
            )}
          </View>
        ))}

        {/* Professional Footer */}
        <Text style={styles.footer}>
          © 2025 Professional Test Platform - Question Paper
        </Text>
      </Page>
    </Document>
  )
}

// Answer Key PDF Component
export const AnswerKeyPDF = ({ test, questions }: { test: Test; questions: Question[]; settings?: PDFSettings }) => {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.title}>{test.name || 'Test Paper'} - Answer Key</Text>
        </View>

        {questions.map((question, index) => (
          <View key={question.id} style={styles.questionContainer}>
            <View style={styles.questionHeader}>
              <Text style={styles.questionNumber}>{index + 1}.</Text>
              <Text style={styles.questionText}>
                <SmartLatexRenderer text={question.question_text || ''} />
              </Text>
            </View>
            
            <View style={{ marginTop: 8 }}>
              <Text style={{ fontSize: 11, fontWeight: 'bold', color: '#059669' }}>
                Correct Answer: {question.correct_option || 'A'}
              </Text>
              {question.solution_text && (
                <Text style={{ fontSize: 10, color: '#374151', marginTop: 4 }}>
                  <SmartLatexRenderer text={question.solution_text} />
                </Text>
              )}
            </View>
          </View>
        ))}

        <Text style={styles.footer}>
          © 2025 Professional Test Platform - Answer Key
        </Text>
      </Page>
    </Document>
  )
}

// Minimalist PDF Component
export const MinimalistPDF = ({ test, questions }: { test: Test; questions: Question[] }) => {
  const minimalistStyles = StyleSheet.create({
    page: {
      flexDirection: 'column',
      backgroundColor: '#FFFFFF',
      padding: 30,
      fontFamily: 'Helvetica',
      fontSize: 12,
      lineHeight: 1.5,
    },
    title: {
      fontSize: 20,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: 20,
    },
    question: {
      marginBottom: 20,
    },
    questionText: {
      marginBottom: 10,
    },
    options: {
      flexDirection: 'row',
      flexWrap: 'wrap',
    },
    option: {
      width: '50%',
      marginBottom: 5,
    },
  })

  return (
    <Document>
      <Page size="A4" style={minimalistStyles.page}>
        <Text style={minimalistStyles.title}>{test.name || 'Test Paper'}</Text>
        
        {questions.map((question, index) => (
          <View key={question.id} style={minimalistStyles.question}>
            <Text style={minimalistStyles.questionText}>
              {index + 1}. <SmartLatexRenderer text={question.question_text || ''} />
            </Text>
            
            <View style={minimalistStyles.options}>
              {question.options?.a && (
                <Text style={minimalistStyles.option}>(A) <SmartLatexRenderer text={question.options.a} /></Text>
              )}
              {question.options?.b && (
                <Text style={minimalistStyles.option}>(B) <SmartLatexRenderer text={question.options.b} /></Text>
              )}
              {question.options?.c && (
                <Text style={minimalistStyles.option}>(C) <SmartLatexRenderer text={question.options.c} /></Text>
              )}
              {question.options?.d && (
                <Text style={minimalistStyles.option}>(D) <SmartLatexRenderer text={question.options.d} /></Text>
              )}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  )
}
