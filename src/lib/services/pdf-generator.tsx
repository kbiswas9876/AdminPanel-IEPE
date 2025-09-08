import React from 'react'
import { Document, Page, Text, View, StyleSheet, Font } from '@react-pdf/renderer'
import { Test, Question } from '@/lib/supabase/admin'

// Register fonts for better typography
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
})

Font.register({
  family: 'Source Serif Pro',
  src: 'https://fonts.gstatic.com/s/sourceserifpro/v15/neIQzD-0qpwxpaWvjeD0X88SAOeaiXM0oSOL2Uw.woff2'
})

// PDF Styles
const styles = StyleSheet.create({
  page: {
    flexDirection: 'column',
    backgroundColor: '#FFFFFF',
    padding: 30,
    fontFamily: 'Inter',
    fontSize: 12,
    lineHeight: 1.6,
  },
  header: {
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 3,
    borderBottomColor: '#2563eb',
    borderBottomStyle: 'solid',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2563eb',
    textAlign: 'center',
    marginBottom: 15,
    fontFamily: 'Source Serif Pro',
  },
  testInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
    fontSize: 11,
    color: '#4a5568',
  },
  infoItem: {
    backgroundColor: '#f7fafc',
    padding: '6 12',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  instructions: {
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#cbd5e0',
    borderRadius: 8,
    padding: 20,
    marginBottom: 25,
    fontSize: 11,
  },
  instructionsTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 10,
  },
  instructionsList: {
    marginLeft: 15,
  },
  instructionItem: {
    marginBottom: 5,
    color: '#4a5568',
  },
  question: {
    marginBottom: 25,
    pageBreakInside: 'avoid',
  },
  questionNumber: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 8,
  },
  questionText: {
    marginBottom: 15,
    color: '#2d3748',
    lineHeight: 1.7,
  },
  optionsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 15,
  },
  option: {
    width: '48%',
    marginRight: '2%',
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 6,
    flexDirection: 'row',
  },
  optionLabel: {
    fontWeight: 'bold',
    color: '#2563eb',
    marginRight: 8,
    minWidth: 20,
  },
  optionText: {
    flex: 1,
    color: '#4a5568',
    fontSize: 11,
  },
  footer: {
    marginTop: 40,
    paddingTop: 20,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    textAlign: 'center',
    fontSize: 10,
    color: '#718096',
  },
  answerKeyHeader: {
    backgroundColor: '#f0f9ff',
    borderWidth: 2,
    borderColor: '#0ea5e9',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
  },
  answerKeyTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#0c4a6e',
    textAlign: 'center',
    marginBottom: 10,
  },
  answerKeyInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    fontSize: 11,
    color: '#0c4a6e',
  },
  answerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  answerNumber: {
    fontWeight: 'bold',
    color: '#2563eb',
    width: 60,
  },
  answerText: {
    flex: 1,
    color: '#374151',
    marginLeft: 20,
  },
  answerValue: {
    fontWeight: 'bold',
    color: '#059669',
    width: 40,
    textAlign: 'center',
  },
})

// Helper function to render LaTeX-like content (simplified for PDF)
const renderMathContent = (content: string): string => {
  // Simple LaTeX to text conversion for PDF
  return content
    .replace(/\$\$([^$]+)\$\$/g, '$1') // Remove display math delimiters
    .replace(/\$([^$]+)\$/g, '$1') // Remove inline math delimiters
    .replace(/\\\[([^\]]+)\\\]/g, '$1') // Remove \[ \] delimiters
    .replace(/\\\(([^)]+)\\\)/g, '$1') // Remove \( \) delimiters
    .replace(/\\frac\{([^}]+)\}\{([^}]+)\}/g, '($1)/($2)') // Convert fractions
    .replace(/\\sqrt\{([^}]+)\}/g, '√($1)') // Convert square roots
    .replace(/\\pi/g, 'π') // Convert pi
    .replace(/\\alpha/g, 'α') // Convert alpha
    .replace(/\\beta/g, 'β') // Convert beta
    .replace(/\\gamma/g, 'γ') // Convert gamma
    .replace(/\\theta/g, 'θ') // Convert theta
    .replace(/\\sum/g, 'Σ') // Convert sum
    .replace(/\\int/g, '∫') // Convert integral
    .replace(/\\infty/g, '∞') // Convert infinity
    .replace(/\\leq/g, '≤') // Convert less than or equal
    .replace(/\\geq/g, '≥') // Convert greater than or equal
    .replace(/\\neq/g, '≠') // Convert not equal
    .replace(/\\times/g, '×') // Convert times
    .replace(/\\div/g, '÷') // Convert divide
}

// Question Paper PDF Component
export const QuestionPaperPDF = ({ test, questions }: { test: Test; questions: Question[] }) => {
  const questionCount = questions.length
  const fullMarks = (Number(test.marks_per_correct) || 0) * questionCount
  const negativeMarks = test.negative_marks_per_incorrect || 0
  const positiveMarks = test.marks_per_correct || 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>{test.name || 'Test'}</Text>
          <View style={styles.testInfo}>
            <Text style={styles.infoItem}>
              <Text style={{ fontWeight: 'bold' }}>Duration: </Text>
              {test.total_time_minutes} minutes
            </Text>
            <Text style={styles.infoItem}>
              <Text style={{ fontWeight: 'bold' }}>Total Questions: </Text>
              {questionCount}
            </Text>
            <Text style={styles.infoItem}>
              <Text style={{ fontWeight: 'bold' }}>Full Marks: </Text>
              {fullMarks}
            </Text>
          </View>
          <View style={styles.testInfo}>
            <Text style={styles.infoItem}>
              <Text style={{ fontWeight: 'bold' }}>Marking: </Text>
              +{positiveMarks} for correct, -{negativeMarks} for incorrect
            </Text>
          </View>
        </View>

        {/* Instructions */}
        <View style={styles.instructions}>
          <Text style={styles.instructionsTitle}>Instructions</Text>
          <View style={styles.instructionsList}>
            <Text style={styles.instructionItem}>
              • Read all questions carefully before answering.
            </Text>
            <Text style={styles.instructionItem}>
              • Each question carries {positiveMarks} mark(s) for correct answer.
            </Text>
            <Text style={styles.instructionItem}>
              • There is negative marking of {negativeMarks} mark(s) for each incorrect answer.
            </Text>
            <Text style={styles.instructionItem}>
              • Choose the most appropriate answer from the given options.
            </Text>
            <Text style={styles.instructionItem}>
              • Use only black or blue ink pen for marking answers.
            </Text>
          </View>
        </View>

        {/* Questions */}
        {questions.map((question, index) => (
          <View key={question.id} style={styles.question}>
            <Text style={styles.questionNumber}>{index + 1}.</Text>
            <Text style={styles.questionText}>
              {renderMathContent(question.question_text || '')}
            </Text>
            <View style={styles.optionsGrid}>
              {question.options?.a && (
                <View style={styles.option}>
                  <Text style={styles.optionLabel}>A)</Text>
                  <Text style={styles.optionText}>
                    {renderMathContent(question.options.a)}
                  </Text>
                </View>
              )}
              {question.options?.b && (
                <View style={styles.option}>
                  <Text style={styles.optionLabel}>B)</Text>
                  <Text style={styles.optionText}>
                    {renderMathContent(question.options.b)}
                  </Text>
                </View>
              )}
              {question.options?.c && (
                <View style={styles.option}>
                  <Text style={styles.optionLabel}>C)</Text>
                  <Text style={styles.optionText}>
                    {renderMathContent(question.options.c)}
                  </Text>
                </View>
              )}
              {question.options?.d && (
                <View style={styles.option}>
                  <Text style={styles.optionLabel}>D)</Text>
                  <Text style={styles.optionText}>
                    {renderMathContent(question.options.d)}
                  </Text>
                </View>
              )}
            </View>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>© {new Date().getFullYear()} Professional Test Platform - Question Paper</Text>
        </View>
      </Page>
    </Document>
  )
}

// Answer Key PDF Component
export const AnswerKeyPDF = ({ test, questions }: { test: Test; questions: Question[] }) => {
  const questionCount = questions.length
  const fullMarks = (Number(test.marks_per_correct) || 0) * questionCount
  const negativeMarks = test.negative_marks_per_incorrect || 0
  const positiveMarks = test.marks_per_correct || 0

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Answer Key Header */}
        <View style={styles.answerKeyHeader}>
          <Text style={styles.answerKeyTitle}>
            {test.name || 'Test'} - Answer Key
          </Text>
          <View style={styles.answerKeyInfo}>
            <Text>
              <Text style={{ fontWeight: 'bold' }}>Total Questions: </Text>
              {questionCount}
            </Text>
            <Text>
              <Text style={{ fontWeight: 'bold' }}>Full Marks: </Text>
              {fullMarks}
            </Text>
            <Text>
              <Text style={{ fontWeight: 'bold' }}>Marking: </Text>
              +{positiveMarks} for correct, -{negativeMarks} for incorrect
            </Text>
          </View>
        </View>

        {/* Answer Key Table */}
        {questions.map((question, index) => (
          <View key={question.id} style={styles.answerRow}>
            <Text style={styles.answerNumber}>Q{index + 1}</Text>
            <Text style={styles.answerText}>
              {renderMathContent(question.question_text || '')}
            </Text>
            <Text style={styles.answerValue}>
              {question.correct_option || 'N/A'}
            </Text>
          </View>
        ))}

        {/* Footer */}
        <View style={styles.footer}>
          <Text>© {new Date().getFullYear()} Professional Test Platform - Answer Key</Text>
        </View>
      </Page>
    </Document>
  )
}

// Minimalist PDF Component (simplified version)
export const MinimalistPDF = ({ test, questions }: { test: Test; questions: Question[] }) => {
  const questionCount = questions.length
  const fullMarks = (Number(test.marks_per_correct) || 0) * questionCount
  const negativeMarks = test.negative_marks_per_incorrect || 0
  const positiveMarks = test.marks_per_correct || 0

  return (
    <Document>
      <Page size="A4" style={[styles.page, { padding: 20 }]}>
        {/* Simple Header */}
        <View style={{ marginBottom: 20, textAlign: 'center' }}>
          <Text style={{ fontSize: 20, fontWeight: 'bold', marginBottom: 10 }}>
            {test.name || 'Test'}
          </Text>
          <Text style={{ fontSize: 10, color: '#666' }}>
            Duration: {test.total_time_minutes} minutes | 
            Questions: {questionCount} | 
            Marks: {fullMarks} | 
            Marking: +{positiveMarks}/-{negativeMarks}
          </Text>
        </View>

        {/* Questions */}
        {questions.map((question, index) => (
          <View key={question.id} style={{ marginBottom: 15 }}>
            <Text style={{ fontWeight: 'bold', marginBottom: 5 }}>
              {index + 1}. {renderMathContent(question.question_text || '')}
            </Text>
            <View style={{ marginLeft: 10 }}>
              {question.options?.a && (
                <Text style={{ fontSize: 10, marginBottom: 2 }}>
                  A) {renderMathContent(question.options.a)}
                </Text>
              )}
              {question.options?.b && (
                <Text style={{ fontSize: 10, marginBottom: 2 }}>
                  B) {renderMathContent(question.options.b)}
                </Text>
              )}
              {question.options?.c && (
                <Text style={{ fontSize: 10, marginBottom: 2 }}>
                  C) {renderMathContent(question.options.c)}
                </Text>
              )}
              {question.options?.d && (
                <Text style={{ fontSize: 10, marginBottom: 2 }}>
                  D) {renderMathContent(question.options.d)}
                </Text>
              )}
            </View>
          </View>
        ))}
      </Page>
    </Document>
  )
}
