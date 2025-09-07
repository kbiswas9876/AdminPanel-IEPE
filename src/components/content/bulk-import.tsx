'use client'

import { useState } from 'react'
import { parseCSVForStaging } from '@/lib/actions/bulk-import'
import { generateCSVTemplate } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Download, Upload, FileText, CheckCircle, AlertCircle, Clipboard, Eye } from 'lucide-react'
import { useRouter } from 'next/navigation'
import type { Question } from '@/lib/types'

export function BulkImport() {
  const router = useRouter()
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [pastedData, setPastedData] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [isProcessingPaste, setIsProcessingPaste] = useState(false)
  const [result, setResult] = useState<{
    success: boolean
    message: string
    questions?: Question[]
    errors?: string[]
  } | null>(null)

  const handleDownloadTemplate = () => {
    const csvContent = generateCSVTemplate()
    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'questions_template.csv'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      setResult(null) // Clear previous results
    }
  }

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
    const file = e.dataTransfer.files[0]
    if (file && (file.type === 'text/csv' || file.name.endsWith('.csv'))) {
      setSelectedFile(file)
      setResult(null) // Clear previous results
    }
  }

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault()
  }

  const handleUpload = async () => {
    if (!selectedFile) return

    setIsUploading(true)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('csvFile', selectedFile)
      
      const result = await parseCSVForStaging(formData)
      setResult(result)
      
      if (result.success && result.questions) {
        // Store questions in localStorage for the review page
        localStorage.setItem('stagedImportQuestions', JSON.stringify(result.questions))
        setSelectedFile(null)
        // Reset file input
        const fileInput = document.getElementById('csvFile') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      }
    } catch {
      setResult({
        success: false,
        message: 'Upload failed. Please try again.'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const handlePasteProcess = async () => {
    if (!pastedData.trim()) {
      setResult({
        success: false,
        message: 'Please paste CSV data before processing.'
      })
      return
    }

    setIsProcessingPaste(true)
    setResult(null)

    try {
      // Create a File object from the pasted text
      const file = new File([pastedData], 'pasted_data.csv', { type: 'text/csv' })
      
      const formData = new FormData()
      formData.append('csvFile', file)
      
      const result = await parseCSVForStaging(formData)
      setResult(result)
      
      if (result.success && result.questions) {
        // Store questions in localStorage for the review page
        localStorage.setItem('stagedImportQuestions', JSON.stringify(result.questions))
        setPastedData('')
      }
    } catch {
      setResult({
        success: false,
        message: 'Processing failed. Please check your CSV data and try again.'
      })
    } finally {
      setIsProcessingPaste(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Step 1: Download Template */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Download className="mr-2 h-5 w-5" />
            Step 1: Download CSV Template
          </CardTitle>
          <CardDescription>
            Download the template file to see the required format and structure.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button onClick={handleDownloadTemplate} className="w-full sm:w-auto">
              <Download className="mr-2 h-4 w-4" />
              Download CSV Template
            </Button>
            
            <div className="bg-blue-50 p-4 rounded-md">
              <h4 className="font-semibold text-blue-900 mb-2">Template Format:</h4>
              <div className="text-sm text-blue-800 space-y-1">
                <p><strong>Required columns:</strong> question_id, book_source, chapter_name, question_text</p>
                <p><strong>Options format:</strong> JSON string like {`{"a": "Option A", "b": "Option B", "c": "Option C", "d": "Option D"}`}</p>
                <p><strong>Admin tags format:</strong> Comma-separated string like {`"tag1, tag2, tag3"`}</p>
                <p><strong>Correct option:</strong> Must be {`"a", "b", "c", or "d"`}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Step 2: Upload File */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Step 2: Upload Your CSV File
          </CardTitle>
          <CardDescription>
            Select or drag and drop your filled CSV file.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* File Input */}
            <div
              className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
              onDrop={handleDrop}
              onDragOver={handleDragOver}
            >
              <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <div className="space-y-2">
                <p className="text-lg font-medium text-gray-900">
                  {selectedFile ? selectedFile.name : 'Drop your CSV file here'}
                </p>
                <p className="text-sm text-gray-500">
                  or click to browse files
                </p>
                <input
                  id="csvFile"
                  type="file"
                  accept=".csv"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  variant="outline"
                  onClick={() => document.getElementById('csvFile')?.click()}
                >
                  Choose File
                </Button>
              </div>
            </div>

            {/* Selected File Info */}
            {selectedFile && (
              <div className="bg-green-50 p-3 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm text-green-800">
                    Selected: {selectedFile.name} ({(selectedFile.size / 1024).toFixed(1)} KB)
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Alternative: Paste CSV Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Clipboard className="mr-2 h-5 w-5" />
            Alternative: Paste CSV Data Directly
          </CardTitle>
          <CardDescription>
            If you already have your CSV data ready, you can paste it directly here for faster processing.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="csvData">CSV Data</Label>
              <Textarea
                id="csvData"
                placeholder="Paste your CSV data here. The first row must be the headers: question_id, book_source, chapter_name, question_text, options, correct_option, solution_text, exam_metadata, admin_tags"
                value={pastedData}
                onChange={(e) => setPastedData(e.target.value)}
                className="min-h-[200px] font-mono text-sm"
              />
              <p className="text-sm text-gray-500">
                Make sure the first row contains the column headers and each row is properly formatted.
              </p>
            </div>

            <Button
              onClick={handlePasteProcess}
              disabled={!pastedData.trim() || isProcessingPaste || isUploading}
              className="w-full sm:w-auto"
            >
              {isProcessingPaste ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing Pasted Data...
                </>
              ) : (
                <>
                  <Clipboard className="mr-2 h-4 w-4" />
                  Process Pasted Data
                </>
              )}
            </Button>

            {pastedData && (
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 text-blue-600 mr-2" />
                  <span className="text-sm text-blue-800">
                    Ready to process {pastedData.split('\n').length - 1} rows of data
                  </span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Step 3: Process Upload */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Upload className="mr-2 h-5 w-5" />
            Step 3: Process Upload
          </CardTitle>
          <CardDescription>
            Upload and parse your CSV file. You&apos;ll then be able to review and edit each question before finalizing the import.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <Button
              onClick={handleUpload}
              disabled={!selectedFile || isUploading || isProcessingPaste}
              className="w-full sm:w-auto"
            >
              {isUploading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing File...
                </>
              ) : (
                <>
                  <Upload className="mr-2 h-4 w-4" />
                  Parse File for Review
                </>
              )}
            </Button>

            {/* Results */}
            {result && (
              <div className={`p-4 rounded-md ${
                result.success 
                  ? 'bg-green-50 border border-green-200' 
                  : 'bg-red-50 border border-red-200'
              }`}>
                <div className="flex items-start">
                  {result.success ? (
                    <CheckCircle className="h-5 w-5 text-green-600 mr-2 mt-0.5" />
                  ) : (
                    <AlertCircle className="h-5 w-5 text-red-600 mr-2 mt-0.5" />
                  )}
                  <div className="flex-1">
                    <p className={`font-medium ${
                      result.success ? 'text-green-900' : 'text-red-900'
                    }`}>
                      {result.message}
                    </p>
                    
                    {result.questions && result.questions.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm text-green-700 mb-3">
                          {result.questions.length} questions parsed successfully and ready for review!
                        </p>
                        <Button
                          onClick={() => router.push('/content/import-review')}
                          className="bg-blue-600 hover:bg-blue-700"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Review & Finalize Import
                        </Button>
                      </div>
                    )}
                    
                    {result.errors && result.errors.length > 0 && (
                      <div className="mt-3">
                        <p className="text-sm font-medium text-red-900 mb-2">
                          Validation Errors:
                        </p>
                        <ul className="text-sm text-red-800 space-y-1 max-h-40 overflow-y-auto">
                          {result.errors.map((error, index) => (
                            <li key={index} className="font-mono text-xs">
                              {error}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
