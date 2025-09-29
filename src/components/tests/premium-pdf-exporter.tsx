'use client'

import { useState, useEffect } from 'react'
import katex from 'katex'
import 'katex/dist/katex.min.css'

// Declare global KaTeX functions
declare global {
  interface Window {
    renderMathInElement: (element: HTMLElement, options?: any) => void
  }
}
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Slider } from '@/components/ui/slider'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogOverlay,
  DialogPortal,
} from '@/components/ui/dialog'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Separator } from '@/components/ui/separator'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  Download, 
  Settings, 
  Eye, 
  FileText, 
  Clock, 
  CheckCircle,
  X,
  Loader2,
  Palette,
  Layout,
  ToggleLeft,
  ToggleRight
} from 'lucide-react'
import type { Test } from '@/lib/supabase/admin'
import type { Question as AdminQuestion } from '@/lib/supabase/admin'

interface PremiumPDFExporterProps {
  test: Test
  questions: AdminQuestion[]
  isOpen: boolean
  onClose: () => void
}

interface PDFConfig {
  // Design & Typography
  fontFamily: string
  fontSize: number
  lineHeight: number
  
  // Layout & Spacing
  questionsPerPage: number
  margins: number
  
  // Content Options
  showHeader: boolean
  showTotalQuestions: boolean
  showFullMarks: boolean
  showMarkingScheme: boolean
  showInstructions: boolean
  showPageNumbers: boolean
  showFooter: boolean
  showAnswerKey: boolean
  showSolutions: boolean
}

const defaultConfig: PDFConfig = {
  fontFamily: 'Helvetica',
  fontSize: 12,
  lineHeight: 1.5,
  questionsPerPage: 2,
  margins: 20,
  showHeader: true,
  showTotalQuestions: true,
  showFullMarks: true,
  showMarkingScheme: true,
  showInstructions: true,
  showPageNumbers: true,
  showFooter: true,
  showAnswerKey: false,
  showSolutions: false,
}

const fontOptions = [
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Roboto', label: 'Roboto' },
]

export function PremiumPDFExporter({ test, questions, isOpen, onClose }: PremiumPDFExporterProps) {
  const [config, setConfig] = useState<PDFConfig>(defaultConfig)
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewContent, setPreviewContent] = useState('')

  // Update preview when config changes
  useEffect(() => {
    if (isOpen) {
      generatePreview()
    }
  }, [config, isOpen])


  const generatePreview = () => {
    // Debug: Comprehensive logging of data structures
    console.log('=== PDF EXPORT DEBUG ===');
    console.log('Total questions:', questions?.length || 0);
    console.log('Test structure:', test);
    
    if (questions && questions.length > 0) {
      console.log('First question full structure:', JSON.stringify(questions[0], null, 2));
      console.log('First question options:', questions[0]?.options);
      console.log('First question options type:', typeof questions[0]?.options);
      console.log('Options keys:', questions[0]?.options ? Object.keys(questions[0].options) : 'No options');
      
      // Log first few questions to see patterns
      questions.slice(0, 3).forEach((q, i) => {
        console.log(`Question ${i + 1}:`);
        console.log('  - question_text:', q.question_text?.substring(0, 100) + '...');
        console.log('  - options:', q.options);
        console.log('  - correct_option:', q.correct_option);
        console.log('  - solution_text:', q.solution_text?.substring(0, 100) + '...');
        
        // Check if options exist and what they contain
        if (q.options) {
          console.log(`  - options.a:`, q.options.a);
          console.log(`  - options.b:`, q.options.b);
          console.log(`  - options.c:`, q.options.c);
          console.log(`  - options.d:`, q.options.d);
        } else {
          console.log(`  - ❌ No options object for question ${i + 1}`);
        }
      });
    }
    console.log('=== END DEBUG ===');
    
    // Generate HTML preview with current config
    const previewHTML = generatePreviewHTML(test, questions, config)
    setPreviewContent(previewHTML)
    console.log('Preview content generated and set');
    console.log('Preview HTML length:', previewHTML.length);
  }

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    try {
      console.log('Starting PDF generation...')
      console.log('Test data:', test)
      console.log('Questions:', questions)
      console.log('Config:', config)

      const response = await fetch('/api/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          testData: { ...test, questions },
          config
        }),
      })

      console.log('Response status:', response.status)
      console.log('Response headers:', Object.fromEntries(response.headers.entries()))

      if (!response.ok) {
        const errorText = await response.text()
        console.error('API Error:', errorText)
        throw new Error(`Server error: ${response.status} - ${errorText}`)
      }

      const blob = await response.blob()
      console.log('PDF blob size:', blob.size, 'bytes')
      
      if (blob.size === 0) {
        throw new Error('Generated PDF is empty')
      }

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${test.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
      
      console.log('PDF downloaded successfully')
      onClose()
    } catch (error) {
      console.error('PDF generation failed:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      alert(`Failed to generate PDF: ${errorMessage}. Please check the console for details.`)
    } finally {
      setIsGenerating(false)
    }
  }

  const updateConfig = (key: keyof PDFConfig, value: any) => {
    setConfig(prev => ({ ...prev, [key]: value }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogPortal>
        <DialogOverlay className="fixed inset-0 z-[9998] bg-black/50" />
        <DialogPrimitive.Content
          className="fixed inset-0 z-[9999] bg-white overflow-hidden focus:outline-none"
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            width: '100vw',
            height: '100vh',
            maxWidth: 'none',
            maxHeight: 'none',
            transform: 'none',
            padding: 0,
            margin: 0,
            borderRadius: 0,
            border: 'none',
            boxShadow: 'none'
          }}
        >
        <DialogHeader className="sr-only">
          <DialogTitle>PDF Export Configuration</DialogTitle>
          <DialogDescription>
            Configure and preview your PDF export settings with live preview
          </DialogDescription>
        </DialogHeader>
        <div className="flex h-screen w-screen bg-gray-50">
          {/* Configuration Panel - Left Side */}
          <div className="w-[400px] min-w-[400px] max-w-[400px] border-r border-gray-200 bg-white flex flex-col h-full shadow-lg flex-shrink-0">
            <div className="p-4 border-b border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600">
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Settings className="h-6 w-6 text-white" />
                  <h2 className="text-xl font-bold text-white">PDF Export Configuration</h2>
                </div>
                <Button variant="ghost" size="sm" onClick={onClose} className="hover:bg-white/20 rounded-full text-white hover:text-white">
                  <X className="h-6 w-6" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 hover:scrollbar-thumb-gray-500 min-h-0">
              <div className="p-4 space-y-4">

              {/* Design & Typography */}
              <Card className="border border-gray-200 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
                    <Palette className="h-5 w-5 text-purple-600" />
                    Design & Typography
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Label htmlFor="font-family">Font Family</Label>
                    <Select value={config.fontFamily} onValueChange={(value) => updateConfig('fontFamily', value)}>
                      <SelectTrigger className="bg-white border border-gray-300 hover:border-blue-500 focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                        <SelectValue placeholder="Select font family" />
                      </SelectTrigger>
                      <SelectContent className="z-[10000] max-h-60 overflow-y-auto bg-white border border-gray-200 shadow-lg">
                        {fontOptions.map((font) => (
                          <SelectItem 
                            key={font.value} 
                            value={font.value}
                            className="cursor-pointer hover:bg-gray-100 focus:bg-gray-100 px-3 py-2"
                          >
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="font-size" className="text-sm font-medium text-gray-700">Font Size: {config.fontSize}px</Label>
                    <Slider
                      value={[config.fontSize]}
                      onValueChange={([value]) => updateConfig('fontSize', value)}
                      min={8}
                      max={18}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="line-height" className="text-sm font-medium text-gray-700">Line Height: {config.lineHeight}</Label>
                    <Slider
                      value={[config.lineHeight]}
                      onValueChange={([value]) => updateConfig('lineHeight', value)}
                      min={1.0}
                      max={2.5}
                      step={0.1}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Layout & Spacing */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
                    <Layout className="h-5 w-5 text-blue-600" />
                    Layout & Spacing
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-3">
                    <Label htmlFor="questions-per-page" className="text-sm font-medium text-gray-700">Questions per Page: {config.questionsPerPage}</Label>
                    <Slider
                      value={[config.questionsPerPage]}
                      onValueChange={([value]) => updateConfig('questionsPerPage', value)}
                      min={1}
                      max={5}
                      step={1}
                      className="w-full"
                    />
                  </div>

                  <div className="space-y-3">
                    <Label htmlFor="margins" className="text-sm font-medium text-gray-700">Margins: {config.margins}mm</Label>
                    <Slider
                      value={[config.margins]}
                      onValueChange={([value]) => updateConfig('margins', value)}
                      min={10}
                      max={40}
                      step={5}
                      className="w-full"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Content Options */}
              <Card className="border-0 shadow-sm bg-white">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-semibold flex items-center gap-2 text-gray-800">
                    <ToggleLeft className="h-5 w-5 text-green-600" />
                    Content Options
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 gap-4">
                    {[
                      { key: 'showHeader', label: 'Show Header', icon: FileText },
                      { key: 'showTotalQuestions', label: 'Show Total Questions', icon: CheckCircle },
                      { key: 'showFullMarks', label: 'Show Full Marks', icon: CheckCircle },
                      { key: 'showMarkingScheme', label: 'Show Marking Scheme', icon: CheckCircle },
                      { key: 'showInstructions', label: 'Show Instructions', icon: FileText },
                      { key: 'showPageNumbers', label: 'Show Page Numbers', icon: CheckCircle },
                      { key: 'showFooter', label: 'Show Footer', icon: FileText },
                      { key: 'showAnswerKey', label: 'Show Answer Key', icon: CheckCircle },
                      { key: 'showSolutions', label: 'Show Solutions', icon: CheckCircle },
                    ].map(({ key, label, icon: Icon }) => (
                      <div key={key} className="flex items-center justify-between p-3 rounded-lg bg-gray-50/50 hover:bg-gray-100/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <Icon className="h-4 w-4 text-gray-600" />
                          <Label htmlFor={key} className="text-sm font-medium text-gray-700 cursor-pointer">{label}</Label>
                        </div>
                        <Switch
                          id={key}
                          checked={config[key as keyof PDFConfig] as boolean}
                          onCheckedChange={(checked) => updateConfig(key as keyof PDFConfig, checked)}
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              </div>
            </div>
            
            {/* Generate Button - Fixed at bottom */}
            <div className="p-4 border-t border-gray-200 bg-gradient-to-r from-blue-600 to-indigo-600 flex-shrink-0">
              <Button 
                onClick={handleGeneratePDF}
                disabled={isGenerating}
                className="w-full bg-white text-blue-600 hover:bg-blue-50 hover:text-blue-700 font-bold py-3 text-base shadow-lg hover:shadow-xl transition-all duration-200 border border-blue-200"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-5 w-5 mr-3 animate-spin" />
                    Generating PDF...
                  </>
                ) : (
                  <>
                    <Download className="h-5 w-5 mr-3" />
                    Generate & Download PDF
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Live Preview Panel - Right Side */}
          <div className="flex-1 bg-gray-100 flex flex-col h-full overflow-hidden min-w-0">
            <div className="h-full flex flex-col">
              {/* Preview Header */}
              <div className="border-b border-gray-200 p-4 bg-gradient-to-r from-green-600 to-teal-600 flex-shrink-0">
                <div className="flex items-center gap-3">
                  <Eye className="h-6 w-6 text-white" />
                  <h3 className="text-xl font-bold text-white">Live Preview</h3>
                  <Badge variant="secondary" className="ml-auto bg-white/20 text-white border-white/30">
                    Real-time Preview
                  </Badge>
                </div>
                <p className="text-sm text-white/80 mt-1">Preview updates automatically as you change settings</p>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-y-auto p-4 bg-gray-100 scrollbar-thin scrollbar-thumb-gray-400 scrollbar-track-gray-100 min-h-0">
                <div className="max-w-4xl mx-auto">
                  <div 
                    className="bg-white shadow-2xl border border-gray-300 rounded-lg p-6 min-h-[80vh]"
                    style={{
                      fontFamily: config.fontFamily,
                      fontSize: `${config.fontSize}px`,
                      lineHeight: config.lineHeight,
                    }}
                  >
                    <div 
                      data-preview-content
                      dangerouslySetInnerHTML={{ __html: previewContent }} 
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        </DialogPrimitive.Content>
      </DialogPortal>
    </Dialog>
  )
}

function generatePreviewHTML(test: Test, questions: AdminQuestion[], config: PDFConfig) {
  let content = ''
  
  // Error handling for malformed data
  if (!test) {
    return '<div style="color: red; padding: 20px;">Error: Test data is missing</div>'
  }
  
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return '<div style="color: red; padding: 20px;">Error: No questions available</div>'
  }
  
  // Header
  if (config.showHeader) {
    content += `
      <div style="text-align: center; margin-bottom: 40px; padding-bottom: 25px; border-bottom: 3px solid #e5e7eb;">
        <h1 style="font-size: 28px; font-weight: bold; color: #1f2937; margin-bottom: 15px; letter-spacing: -0.5px;">${test.name}</h1>
        ${test.description ? `<p style="font-size: 18px; color: #6b7280; margin-bottom: 20px; font-weight: 500;">${test.description}</p>` : ''}
        <div style="display: flex; justify-content: space-between; margin-top: 20px; font-size: 16px; color: #6b7280; font-weight: 500;">
          ${config.showTotalQuestions ? `<div style="background: #f3f4f6; padding: 8px 16px; border-radius: 6px;">Total Questions: ${questions.length}</div>` : ''}
          ${config.showFullMarks ? `<div style="background: #f3f4f6; padding: 8px 16px; border-radius: 6px;">Total Marks: ${questions.length * (test.marks_per_correct || 1)}</div>` : ''}
          <div style="background: #f3f4f6; padding: 8px 16px; border-radius: 6px;">Duration: ${test.total_time_minutes || 0} minutes</div>
        </div>
      </div>
    `
  }

  // Instructions
  if (config.showInstructions) {
    content += `
      <div style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 20px; border-radius: 12px; margin-bottom: 35px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-bottom: 15px; font-size: 18px; font-weight: bold; color: #1f2937;">📋 Instructions:</h3>
        <ul style="margin-left: 25px; line-height: 1.8;">
          <li style="margin-bottom: 8px; font-weight: 500;">Read all questions carefully before answering</li>
          <li style="margin-bottom: 8px; font-weight: 500;">All questions are compulsory</li>
          <li style="margin-bottom: 8px; font-weight: 500;">Use black or blue ink only</li>
          <li style="margin-bottom: 8px; font-weight: 500;">Show all working for mathematical problems</li>
        </ul>
      </div>
    `
  }

  // Marking Scheme
  if (config.showMarkingScheme) {
    content += `
      <div style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin-bottom: 35px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
        <h3 style="margin-bottom: 15px; font-size: 18px; font-weight: bold; color: #1f2937;">📊 Marking Scheme:</h3>
        <ul style="margin-left: 25px; line-height: 1.8;">
          <li style="margin-bottom: 8px; font-weight: 500;">Each question carries equal marks</li>
          <li style="margin-bottom: 8px; font-weight: 500;">Partial credit may be awarded for correct methodology</li>
          <li style="margin-bottom: 8px; font-weight: 500;">Negative marking may apply for incorrect answers</li>
        </ul>
      </div>
    `
  }

  // Questions
  questions.forEach((question, index) => {
    // Handle malformed individual questions
    if (!question) {
      console.warn(`Question ${index + 1} is null or undefined`);
      return;
    }
    
    if (index > 0 && config.questionsPerPage && index % config.questionsPerPage === 0) {
      content += '<div style="page-break-before: always; margin-top: 40px;"></div>'
    }
    
    content += `
      <div style="margin-bottom: 35px; padding: 25px; border: 2px solid #e5e7eb; border-radius: 12px; background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%); box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
        <div style="display:flex; gap:4px; align-items:flex-start; margin-bottom:12px;">
          <span style="font-weight:bold; color:#1f2937; min-width:20px; flex-shrink:0;">${index + 1}.</span>
          <span style="flex:1; line-height:${config.lineHeight || 1.5}; font-size:${config.fontSize || 12}px; color:#374151;">${renderLatex(question.question_text || 'Question text not available')}</span>
        </div>
        ${renderOptionsGrid(question.options, index)}
      </div>
    `
  })

  // Answer Key
  if (config.showAnswerKey) {
    content += `
      <div style="page-break-before: always; margin-top: 40px;"></div>
      <div style="background: #d1fae5; padding: 20px; border-radius: 8px; margin-top: 30px;">
        <h2 style="margin-bottom: 15px;">Answer Key</h2>
        ${questions.map((question, index) => `
          <div style="margin-bottom: 10px;">
            <strong>Q${index + 1}:</strong> 
            ${question.correct_option ? question.correct_option.toUpperCase() : 'Not specified'}
          </div>
        `).join('')}
      </div>
    `
  }

  // Solutions
  if (config.showSolutions) {
    content += `
      <div style="page-break-before: always; margin-top: 40px;"></div>
      <div style="background: #e0f2fe; padding: 20px; border-radius: 8px; margin-top: 30px;">
        <h2 style="margin-bottom: 15px;">Solutions</h2>
        ${questions.map((question, index) => `
          <div style="margin-bottom: 20px;">
            <h4 style="margin-bottom: 10px;">Question ${index + 1}:</h4>
            <div>${renderLatex(question.solution_text || 'Solution not provided')}</div>
          </div>
        `).join('')}
      </div>
    `
  }

  return content
}

function renderOptionsGrid(options: any, questionIndex: number): string {
  // Debug options structure for each question
  console.log(`=== Question ${questionIndex + 1} DEBUG ===`);
  console.log('Options received:', options);
  console.log('Options type:', typeof options);
  console.log('Options keys:', options ? Object.keys(options) : 'N/A');
  console.log('Options values:', options ? Object.values(options) : 'N/A');
  console.log('Is options null/undefined:', options === null || options === undefined);
  console.log('Options.a exists:', options?.a);
  console.log('Options.b exists:', options?.b);
  console.log('Options.c exists:', options?.c);
  console.log('Options.d exists:', options?.d);
  
  if (!options) {
    console.log(`❌ No options for question ${questionIndex + 1}`);
    // Return sample options for testing
    return `
      <div style="margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 6px; ">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: start;">
          <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: #e5e7eb; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(a)</span>
            <span style="flex: 1; line-height: 1.4; font-size: 14px;">Sample option A</span>
          </div>
          <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: #e5e7eb; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(b)</span>
            <span style="flex: 1; line-height: 1.4; font-size: 14px;">Sample option B</span>
          </div>
          <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: #e5e7eb; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(c)</span>
            <span style="flex: 1; line-height: 1.4; font-size: 14px;">Sample option C</span>
          </div>
          <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: #e5e7eb; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(d)</span>
            <span style="flex: 1; line-height: 1.4; font-size: 14px;">Sample option D</span>
          </div>
        </div>
        <div style="margin-top: 8px; padding: 8px; background: #fee2e2; border: 1px solid #fca5a5; border-radius: 4px; color: #dc2626; font-size: 12px;">
          ⚠️ No options data available - showing sample options
        </div>
      </div>
    `;
  }
  
  const opts = options;
  let optionsHtml = '';
  
  // Try different possible option structures
  if (opts.a || opts.b || opts.c || opts.d || opts.A || opts.B || opts.C || opts.D) {
    console.log('✅ Found options object structure');
    
    // Handle both lowercase and uppercase keys
    const optionA = opts.a || opts.A;
    const optionB = opts.b || opts.B;
    const optionC = opts.c || opts.C;
    const optionD = opts.d || opts.D;
    
    optionsHtml = `
      <div style="margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 6px; ">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: start;">
          ${optionA ? `
            <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
              <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: #e5e7eb; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(a)</span>
              <span style="flex: 1; line-height: 1.4; font-size: 14px;">${renderLatex(optionA)}</span>
            </div>
          ` : '<div></div>'}
          ${optionB ? `
            <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
              <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: #e5e7eb; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(b)</span>
              <span style="flex: 1; line-height: 1.4; font-size: 14px;">${renderLatex(optionB)}</span>
            </div>
          ` : '<div></div>'}
          ${optionC ? `
            <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
              <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: #e5e7eb; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(c)</span>
              <span style="flex: 1; line-height: 1.4; font-size: 14px;">${renderLatex(optionC)}</span>
            </div>
          ` : '<div></div>'}
          ${optionD ? `
            <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
              <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: #e5e7eb; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(d)</span>
              <span style="flex: 1; line-height: 1.4; font-size: 14px;">${renderLatex(optionD)}</span>
            </div>
          ` : '<div></div>'}
        </div>
      </div>
    `;
  } else if (Array.isArray(opts) && opts.length > 0) {
    // Handle array structure
    optionsHtml = `
      <div style="margin: 15px 0; padding: 12px; background: #f8f9fa; border-radius: 6px; ">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: start;">
          ${opts.map((option, optIndex) => `
            <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
              <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: #e5e7eb; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(${String.fromCharCode(97 + optIndex)})</span>
              <span style="flex: 1; line-height: 1.4; font-size: 14px;">${renderLatex(option)}</span>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  } else {
    console.log(`Unrecognized options structure for question ${questionIndex + 1}:`, opts);
    return `<div style="color: orange; font-style: italic; padding: 10px; background: #fef3c7; border: 1px solid #f59e0b; border-radius: 4px;">Unrecognized options structure: ${JSON.stringify(opts)}</div>`;
  }
  
  return optionsHtml;
}

function renderLatex(text: string): string {
  if (!text) return ''
  
  try {
    // Handle display math (double dollar signs) with KaTeX
    let rendered = text.replace(/\$\$(.*?)\$\$/g, (match, latex) => {
      try {
        const html = katex.renderToString(latex.trim(), {
          displayMode: true,
          throwOnError: false,
          strict: false
        })
        return `<div style="text-align: center; margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 4px;">${html}</div>`
      } catch (error) {
        console.warn('KaTeX display math error:', error)
        return `<div style="text-align: center; margin: 15px 0; padding: 10px; background: #f8f9fa; border-radius: 4px; color: #dc3545;">Math Error: ${latex}</div>`
      }
    })
    
    // Handle inline math (single dollar signs) with KaTeX
    rendered = rendered.replace(/\$(.*?)\$/g, (match, latex) => {
      try {
        const html = katex.renderToString(latex.trim(), {
          displayMode: false,
          throwOnError: false,
          strict: false
        })
        return `<span style="background: #f8f9fa; padding: 2px 4px; border-radius: 2px;">${html}</span>`
      } catch (error) {
        console.warn('KaTeX inline math error:', error)
        return `<span style="background: #f8f9fa; padding: 2px 4px; border-radius: 2px; color: #dc3545;">Math Error: ${latex}</span>`
      }
    })
    
    // Handle other formatting
    rendered = rendered
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br>')
    
    return rendered
  } catch (error) {
    console.error('LaTeX rendering error:', error)
    return text
  }
}
