'use client'

import React, { useState, useCallback } from 'react'
import { useDropzone } from 'react-dropzone'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  XCircle, 
  AlertTriangle,
  Download,
  Eye,
  Trash2,
  Play,
  Pause,
  RotateCcw
} from 'lucide-react'
import { toast } from 'sonner'
import { 
  parseBulkUploadFile, 
  ParsedQuestion, 
  ParseResult 
} from '@/lib/utils/bulk-upload-parsers'
import { bulkUploadQuestions } from '@/lib/actions/bulk-upload'
import { validateQuestions } from '@/lib/utils/question-validation'
import { UploadResult, BatchUploadOptions } from '@/lib/actions/bulk-upload'
import BulkUploadReview from './bulk-upload-review'

interface BulkUploadProps {
  onUploadComplete?: (result: UploadResult) => void
  onCancel?: () => void
}

export default function NewBulkUpload({ onUploadComplete, onCancel }: BulkUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [parseResult, setParseResult] = useState<ParseResult | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [previewQuestions, setPreviewQuestions] = useState<ParsedQuestion[]>([])
  const [, setIsCancelled] = useState(false)
  const [showReview, setShowReview] = useState(false)
  const [editableQuestions, setEditableQuestions] = useState<ParsedQuestion[]>([])
  

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const uploadedFile = acceptedFiles[0]
    if (!uploadedFile) return

    setFile(uploadedFile)
    setParseResult(null)
    setUploadResult(null)
    setPreviewQuestions([])
    setIsCancelled(false)

    try {
      const result = await parseBulkUploadFile(uploadedFile)
      setParseResult(result)
      
      if (result.questions.length > 0) {
        // Show first 20 questions for preview
        setPreviewQuestions(result.questions.slice(0, 20))
        setEditableQuestions(result.questions)
        setShowReview(true)
      }

      if (result.errors.length > 0) {
        toast.warning(`${result.errors.length} rows had errors. Check the preview.`)
      } else {
        toast.success(`Successfully parsed ${result.validRows} questions`)
      }
    } catch (error) {
      toast.error(`Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/json': ['.jsonl', '.json'],
      'text/csv': ['.csv'],
      'application/octet-stream': ['.parquet']
    },
    multiple: false,
    disabled: isUploading
  })

  const handleUpload = async () => {
    if (editableQuestions.length === 0) return

    // Validate questions before upload
    const validation = validateQuestions(editableQuestions)
    if (!validation.isValid) {
      toast.error(`Validation failed: ${validation.errors.join(', ')}`)
      return
    }

    setIsUploading(true)
    setIsCancelled(false)
    setUploadResult(null)

    const options: BatchUploadOptions = {
      batchSize: 500,
      generateIds: true
    }

    try {
      const result = await bulkUploadQuestions(editableQuestions, options)
      setUploadResult(result)
      setIsUploading(false)

      if (result.success) {
        toast.success(`Successfully uploaded ${result.totalInserted} questions`)
        onUploadComplete?.(result)
      } else {
        toast.error(`Upload completed with ${result.totalErrors} errors`)
      }
    } catch (error) {
      setIsUploading(false)
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const handleCancel = () => {
    setIsUploading(false)
    setIsCancelled(true)
    toast.info('Upload cancelled')
  }

  const handleReset = () => {
    setFile(null)
    setParseResult(null)
    setUploadResult(null)
    setPreviewQuestions([])
    setIsUploading(false)
    setIsCancelled(false)
    setShowReview(false)
    setEditableQuestions([])
  }

  const handleEditQuestion = (question: ParsedQuestion, index: number) => {
    // Update the question in the editable questions array
    const newQuestions = [...editableQuestions]
    newQuestions[index] = question
    setEditableQuestions(newQuestions)
    
    // Update preview questions if needed
    if (index < 20) {
      const newPreview = [...previewQuestions]
      newPreview[index] = question
      setPreviewQuestions(newPreview)
    }
  }

  const handleDeleteQuestion = (index: number) => {
    const newQuestions = editableQuestions.filter((_, i) => i !== index)
    setEditableQuestions(newQuestions)
    setPreviewQuestions(newQuestions.slice(0, 20))
    toast.success(`Question ${index + 1} removed from upload`)
  }

  const handleBulkDelete = (indices: number[]) => {
    const newQuestions = editableQuestions.filter((_, i) => !indices.includes(i))
    setEditableQuestions(newQuestions)
    setPreviewQuestions(newQuestions.slice(0, 20))
    toast.success(`${indices.length} questions removed from upload`)
  }

  const handleRetryUpload = async () => {
    if (editableQuestions.length === 0) {
      toast.error('No questions to upload')
      return
    }

    setIsUploading(true)
    setUploadResult(null)

    const options: BatchUploadOptions = {
      batchSize: 500,
      generateIds: true
    }

    try {
      const result = await bulkUploadQuestions(editableQuestions, options)
      setUploadResult(result)
      setIsUploading(false)

      if (result.success) {
        toast.success(`Successfully uploaded ${result.totalInserted} questions`)
        onUploadComplete?.(result)
      } else {
        toast.error(`Upload completed with ${result.totalErrors} errors`)
      }
    } catch (error) {
      setIsUploading(false)
      toast.error(`Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const createSampleJSONL = (): string => {
    const sampleQuestions = [
      {
        book_source: "Pinnacle 6800 6th Ed",
        chapter_name: "Percentage",
        question_number_in_book: 1,
        question_text: "What is 20% of 100?",
        options: {
          "a": "10",
          "b": "20", 
          "c": "30",
          "d": "40"
        },
        correct_option: "b",
        solution_text: "$20\\%$ of $100 = \\dfrac{20}{100}\\times 100 = 20$",
        exam_metadata: "CAT 2023 Slot 1",
        admin_tags: ["Percentage", "Basic Math"]
      },
      {
        book_source: "Pinnacle 6800 6th Ed",
        chapter_name: "Profit & Loss",
        question_number_in_book: 2,
        question_text: "A man buys a pen for ₹50 and sells it at a profit of 20%. Find the selling price.",
        options: {
          "a": "55",
          "b": "58",
          "c": "60", 
          "d": "62"
        },
        correct_option: "c",
        solution_text: "Selling Price $= 50 + \\dfrac{20}{100}\\times 50 = 60$",
        exam_metadata: "CAT 2022 Slot 2",
        admin_tags: ["Profit & Loss", "Profit Calculation"]
      }
    ]

    return sampleQuestions.map(q => JSON.stringify(q)).join('\n')
  }

  const createSampleCSV = (): string => {
    const headers = [
      'book_source',
      'chapter_name', 
      'question_number_in_book',
      'question_text',
      'options',
      'correct_option',
      'solution_text',
      'exam_metadata',
      'admin_tags'
    ]

    const sampleRows = [
      [
        'Pinnacle 6800 6th Ed',
        'Percentage',
        '1',
        'What is 20% of 100?',
        '{"a": "10", "b": "20", "c": "30", "d": "40"}',
        'b',
        '$20\\%$ of $100 = \\dfrac{20}{100}\\times 100 = 20$',
        'CAT 2023 Slot 1',
        'Percentage, Basic Math'
      ],
      [
        'Pinnacle 6800 6th Ed',
        'Profit & Loss',
        '2',
        'A man buys a pen for ₹50 and sells it at a profit of 20%. Find the selling price.',
        '{"a": "55", "b": "58", "c": "60", "d": "62"}',
        'c',
        'Selling Price $= 50 + \\dfrac{20}{100}\\times 50 = 60$',
        'CAT 2022 Slot 2',
        'Profit & Loss, Profit Calculation'
      ]
    ]

    const csvContent = [
      headers.join(','),
      ...sampleRows.map(row => row.map(field => `"${field}"`).join(','))
    ].join('\n')

    return csvContent
  }

  const downloadSample = (format: 'jsonl' | 'csv') => {
    const content = format === 'jsonl' ? createSampleJSONL() : createSampleCSV()
    const blob = new Blob([content], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `sample_questions.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const getFileTypeIcon = (fileName: string) => {
    if (fileName.endsWith('.jsonl') || fileName.endsWith('.json')) {
      return <FileText className="h-8 w-8 text-blue-500" />
    } else if (fileName.endsWith('.csv')) {
      return <FileText className="h-8 w-8 text-green-500" />
    } else if (fileName.endsWith('.parquet')) {
      return <FileText className="h-8 w-8 text-purple-500" />
    }
    return <FileText className="h-8 w-8 text-gray-500" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Bulk Upload Questions</h2>
          <p className="text-muted-foreground">
            Upload questions in JSONL, Parquet, or CSV format
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => downloadSample('jsonl')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Sample JSONL
          </Button>
          <Button
            variant="outline"
            onClick={() => downloadSample('csv')}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            Sample CSV
          </Button>
        </div>
      </div>

      {/* File Upload Area */}
      {!file && (
        <Card>
          <CardContent className="p-8">
            <div
              {...getRootProps()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragActive ? 'border-primary bg-primary/5' : 'border-muted-foreground/25'}
                ${isUploading ? 'opacity-50 cursor-not-allowed' : 'hover:border-primary hover:bg-primary/5'}
              `}
            >
              <input {...getInputProps()} />
              <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">
                {isDragActive ? 'Drop your file here' : 'Drag & drop your file here'}
              </h3>
              <p className="text-muted-foreground mb-4">
                or click to browse files
              </p>
              <div className="flex flex-wrap justify-center gap-2">
                <Badge variant="secondary">JSONL</Badge>
                <Badge variant="secondary">CSV</Badge>
                <Badge variant="secondary">Parquet</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* File Info */}
      {file && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                {getFileTypeIcon(file.name)}
                <div>
                  <CardTitle className="text-lg">{file.name}</CardTitle>
                  <CardDescription>
                    {(file.size / 1024 / 1024).toFixed(2)} MB
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      )}

      {/* Parse Results */}
      {parseResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              Parse Results
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {parseResult.totalRows}
                </div>
                <div className="text-sm text-muted-foreground">Total Rows</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {parseResult.validRows}
                </div>
                <div className="text-sm text-muted-foreground">Valid Questions</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {parseResult.errors.length}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {((parseResult.validRows / parseResult.totalRows) * 100).toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">Success Rate</div>
              </div>
            </div>

            {parseResult.errors.length > 0 && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {parseResult.errors.length} rows had errors. Check the preview below.
                </AlertDescription>
              </Alert>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <Button
                onClick={handleUpload}
                disabled={isUploading || editableQuestions.length === 0}
                className="flex items-center gap-2"
              >
                <Play className="h-4 w-4" />
                Upload {editableQuestions.length} Questions
              </Button>
              {isUploading && (
                <Button
                  variant="outline"
                  onClick={handleCancel}
                  className="flex items-center gap-2"
                >
                  <Pause className="h-4 w-4" />
                  Cancel
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Progress */}
      {isUploading && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Uploading Questions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="ml-3 text-muted-foreground">Processing your questions...</span>
              </div>
              <div className="text-center text-sm text-muted-foreground">
                This may take a few moments depending on the number of questions.
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Result */}
      {uploadResult && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              {uploadResult.success ? (
                <CheckCircle className="h-5 w-5 text-green-600" />
              ) : (
                <XCircle className="h-5 w-5 text-red-600" />
              )}
              Upload Result
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {uploadResult.totalProcessed}
                </div>
                <div className="text-sm text-muted-foreground">Total Processed</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {uploadResult.totalInserted}
                </div>
                <div className="text-sm text-muted-foreground">Successfully Inserted</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">
                  {uploadResult.totalErrors}
                </div>
                <div className="text-sm text-muted-foreground">Errors</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {(uploadResult.duration / 1000).toFixed(1)}s
                </div>
                <div className="text-sm text-muted-foreground">Duration</div>
              </div>
            </div>

            {uploadResult.errors.length > 0 && (
              <Alert className="mb-4">
                <AlertTriangle className="h-4 w-4" />
                <AlertDescription>
                  {uploadResult.errors.length} rows failed to upload. Check the error log.
                </AlertDescription>
              </Alert>
            )}

            <div className="flex gap-2">
              <Button onClick={handleReset} variant="outline">
                <RotateCcw className="h-4 w-4 mr-2" />
                Upload Another File
              </Button>
              {onCancel && (
                <Button onClick={onCancel} variant="outline">
                  Close
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Enhanced Review Section */}
      {showReview && editableQuestions.length > 0 && (
        <BulkUploadReview
          questions={editableQuestions}
          errors={parseResult?.errors || []}
          onEditQuestion={handleEditQuestion}
          onDeleteQuestion={handleDeleteQuestion}
          onBulkDelete={handleBulkDelete}
          onRetryUpload={handleRetryUpload}
          onCancel={onCancel}
        />
      )}
    </div>
  )
}
