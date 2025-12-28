'use client'

import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { 
  generateUniqueBookCode, 
  generateUniqueQuestionId,
  parseBookCode,
  parseQuestionId,
  getQuestionIdDescription,
  isValidBookCodeFormat,
  isValidQuestionIdFormat
} from '@/lib/utils/enhanced-id-generator'

export function IdGeneratorDemo() {
  const [bookName, setBookName] = useState('Advanced Mathematics for Engineers')
  const [chapterName, setChapterName] = useState('Linear Algebra and Vector Spaces')
  const [questionNumber, setQuestionNumber] = useState(1)
  const [generatedBookCode, setGeneratedBookCode] = useState('')
  const [generatedQuestionId, setGeneratedQuestionId] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateBookCode = async () => {
    if (!bookName.trim()) return
    
    setIsGenerating(true)
    try {
      const bookCode = await generateUniqueBookCode(bookName.trim())
      setGeneratedBookCode(bookCode)
    } catch (error) {
      console.error('Error generating book code:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateQuestionId = async () => {
    if (!generatedBookCode || !chapterName.trim() || !questionNumber) return
    
    setIsGenerating(true)
    try {
      const questionId = await generateUniqueQuestionId(
        generatedBookCode,
        chapterName.trim(),
        questionNumber
      )
      setGeneratedQuestionId(questionId)
    } catch (error) {
      console.error('Error generating question ID:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const parsedBookCode = generatedBookCode ? parseBookCode(generatedBookCode) : null
  const parsedQuestionId = generatedQuestionId ? parseQuestionId(generatedQuestionId) : null
  const questionDescription = generatedQuestionId ? getQuestionIdDescription(generatedQuestionId) : ''

  return (
    <div className="space-y-6 p-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-2">Enhanced ID Generator Demo</h1>
        <p className="text-muted-foreground">
          Demonstrates the new algorithm for generating unique, readable book codes and question IDs
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Book Code Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Book Code Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Book Name</label>
              <Input
                value={bookName}
                onChange={(e) => setBookName(e.target.value)}
                placeholder="Enter book name"
              />
            </div>
            
            <Button 
              onClick={handleGenerateBookCode}
              disabled={isGenerating || !bookName.trim()}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Book Code'}
            </Button>

            {generatedBookCode && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div>
                  <label className="text-sm font-medium">Generated Book Code:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-background px-2 py-1 rounded text-sm font-mono">
                      {generatedBookCode}
                    </code>
                    <Badge variant={isValidBookCodeFormat(generatedBookCode) ? "default" : "destructive"}>
                      {isValidBookCodeFormat(generatedBookCode) ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                </div>

                {parsedBookCode && (
                  <div className="text-sm space-y-1">
                    <div><strong>Readable Code:</strong> {parsedBookCode.readableCode}</div>
                    {parsedBookCode.suffix && <div><strong>Suffix:</strong> {parsedBookCode.suffix}</div>}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Question ID Generation */}
        <Card>
          <CardHeader>
            <CardTitle>Question ID Generation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Chapter Name</label>
              <Input
                value={chapterName}
                onChange={(e) => setChapterName(e.target.value)}
                placeholder="Enter chapter name"
              />
            </div>
            
            <div>
              <label className="text-sm font-medium">Question Number</label>
              <Input
                type="number"
                value={questionNumber}
                onChange={(e) => setQuestionNumber(parseInt(e.target.value) || 1)}
                placeholder="Enter question number"
                min="1"
              />
            </div>
            
            <Button 
              onClick={handleGenerateQuestionId}
              disabled={isGenerating || !generatedBookCode || !chapterName.trim()}
              className="w-full"
            >
              {isGenerating ? 'Generating...' : 'Generate Question ID'}
            </Button>

            {generatedQuestionId && (
              <div className="space-y-3 p-4 bg-muted rounded-lg">
                <div>
                  <label className="text-sm font-medium">Generated Question ID:</label>
                  <div className="flex items-center gap-2 mt-1">
                    <code className="bg-background px-2 py-1 rounded text-sm font-mono">
                      {generatedQuestionId}
                    </code>
                    <Badge variant={isValidQuestionIdFormat(generatedQuestionId) ? "default" : "destructive"}>
                      {isValidQuestionIdFormat(generatedQuestionId) ? "Valid" : "Invalid"}
                    </Badge>
                  </div>
                </div>

                {parsedQuestionId && (
                  <div className="text-sm space-y-1">
                    <div><strong>Book Code:</strong> {parsedQuestionId.bookCode}</div>
                    <div><strong>Chapter Code:</strong> {parsedQuestionId.chapterCode}</div>
                    <div><strong>Question Number:</strong> {parsedQuestionId.questionNumber}</div>
                    {parsedQuestionId.suffix && <div><strong>Suffix:</strong> {parsedQuestionId.suffix}</div>}
                  </div>
                )}

                {questionDescription && (
                  <div className="text-sm p-2 bg-blue-50 rounded border-l-4 border-blue-400">
                    <strong>Description:</strong> {questionDescription}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Algorithm Explanation */}
      <Card>
        <CardHeader>
          <CardTitle>Algorithm Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Book Code Format</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <strong>READABLE_CODE</strong> (e.g., PIN6800, MATHEMATICS)</li>
                <li>• Combines meaningful words from book name</li>
                <li>• Includes numbers from book name (e.g., 6800)</li>
                <li>• Adds numeric suffix for uniqueness if needed</li>
                <li>• Maximum 8 characters, highly readable</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-semibold mb-2">Question ID Format</h4>
              <ul className="text-sm space-y-1 text-muted-foreground">
                <li>• <strong>BOOKCODE-CHAPTER-001</strong></li>
                <li>• BOOKCODE: Readable book code (e.g., PIN6800)</li>
                <li>• CHAPTER: Readable chapter abbreviation (e.g., ALG)</li>
                <li>• QUESTION: Zero-padded question number (001)</li>
                <li>• Optional suffix for uniqueness (-01)</li>
              </ul>
            </div>
          </div>
          
          <div className="p-4 bg-green-50 rounded-lg border border-green-200">
            <h4 className="font-semibold text-green-800 mb-2">Uniqueness Guarantees</h4>
            <ul className="text-sm text-green-700 space-y-1">
              <li>• Database collision detection for both book codes and question IDs</li>
              <li>• Automatic retry with different suffixes/checksums</li>
              <li>• Fallback to timestamp-based generation if needed</li>
              <li>• Maximum 100 attempts per generation</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
