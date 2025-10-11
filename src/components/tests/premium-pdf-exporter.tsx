'use client'

import { useState, useEffect, useRef } from 'react'
import { useReactToPrint } from 'react-to-print'
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
  ToggleRight,
  Type,
  AlignLeft,
  AlignCenter,
  AlignRight
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
  margins: number
  
  // Header Customization
  headerText: string
  headerFontFamily: string
  headerFontSize: number
  headerColor: string
  headerAlignment: 'left' | 'center' | 'right'
  
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
  margins: 15,
  headerText: '',
  headerFontFamily: 'Georgia',
  headerFontSize: 24,
  headerColor: '#1f2937',
  headerAlignment: 'center',
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

const headerFontOptions = [
  { value: 'Georgia', label: 'Georgia (Elegant)' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Lato', label: 'Lato' },
  { value: 'Roboto', label: 'Roboto' },
  { value: 'Verdana', label: 'Verdana' },
  { value: 'Arial', label: 'Arial' },
]

export function PremiumPDFExporter({ test, questions, isOpen, onClose }: PremiumPDFExporterProps) {
  const [config, setConfig] = useState<PDFConfig>({
    ...defaultConfig,
    headerText: test?.name || ''
  })
  const [isGenerating, setIsGenerating] = useState(false)
  const [previewContent, setPreviewContent] = useState('')
  
  // Create a ref to attach to the component we want to print
  const previewComponentRef = useRef<HTMLDivElement>(null)

  // Define print-specific styles to maintain layout and margins
  const getPageStyle = (marginValue: number) => `
    @page {
      size: A4;
      margin: ${marginValue}mm;
    }

    @media print {
      body {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
        font-family: ${config.fontFamily}, sans-serif;
        font-size: ${config.fontSize}px;
        line-height: ${config.lineHeight};
      }
      
      /* HIGH-FIDELITY PRINT QUALITY */
      @page {
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      /* Ensure sharp, high-quality text rendering */
      * {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }
      
      /* Professional KaTeX/LaTeX styling - transparent backgrounds */
      .katex,
      .katex-display,
      .katex-html,
      span.katex,
      span.katex-html {
        background: transparent !important;
        background-color: transparent !important;
      }
      
      /* Remove any default KaTeX backgrounds */
      .katex .mord,
      .katex .mop,
      .katex .mbin,
      .katex .mrel,
      .katex .minner,
      .katex .mopen,
      .katex .mclose,
      .katex .mpunct {
        background: transparent !important;
      }
      
      /* Ensure mathematical symbols are crisp */
      .katex {
        font-size: 1em;
        text-rendering: geometricPrecision;
      }
      
      /* Maintain the professional spacing from live preview */
      .print-container {
        max-width: 100%;
        margin: 0 auto;
        padding: 0;
      }
      
      /* COMPACT PRINT LAYOUT - Optimized for space efficiency */
      .question-container {
        page-break-inside: avoid; /* Prevent splitting questions across pages */
        break-inside: avoid;
        margin-bottom: 8mm !important; /* Drastically reduced from 35px */
        margin-top: 0 !important;
        padding: 8px 12px !important; /* Reduced padding */
        border: none !important; /* Remove heavy borders */
        border-bottom: 1px solid #e5e7eb !important; /* Simple separator */
        border-radius: 0 !important; /* Remove rounded corners */
        background: transparent !important; /* Remove background gradient */
        box-shadow: none !important; /* Remove shadows */
      }
      
      /* First question doesn't need top border */
      .question-container:first-of-type {
        border-top: none !important;
      }
      
      /* Last question styling */
      .question-container:last-of-type {
        border-bottom: 2px solid #e5e7eb !important;
      }
      
      /* Compact font sizes for print */
      .question-container {
        font-size: ${Math.max(config.fontSize - 1, 10)}px !important;
      }
      
      /* Reduce spacing in options grid */
      .options-grid {
        margin-top: 8px !important;
        margin-bottom: 4px !important;
        padding: 6px !important;
      }
      
      /* Compact header section */
      .header-section {
        margin-bottom: 20px !important;
        padding-bottom: 15px !important;
      }
      
      /* Compact instructions and marking scheme */
      .instruction-box, .marking-scheme-box {
        margin-bottom: 15px !important;
        padding: 12px !important;
      }
      
      /* Allow natural page breaks between questions */
      .question-container + .question-container {
        page-break-before: auto;
      }
      
      /* Ensure proper spacing at page breaks */
      .question-container {
        orphans: 2; /* Minimum lines at bottom of page */
        widows: 2;  /* Minimum lines at top of page */
      }
    }
  `

  // Configure the print handler with print-specific styles
  const handlePrint = useReactToPrint({
    contentRef: previewComponentRef,
    documentTitle: `${test?.name || 'test'}-question-paper`,
    pageStyle: getPageStyle(config.margins),
    onAfterPrint: () => console.log('Print job completed.'),
  })

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
        <div className="flex h-screen w-screen bg-gradient-to-br from-slate-50 via-white to-slate-100/50">
          {/* Configuration Panel - Left Side */}
          <div className="w-[400px] min-w-[400px] max-w-[400px] border-r border-slate-200/60 bg-white/95 backdrop-blur-xl flex flex-col h-full shadow-2xl flex-shrink-0">
            {/* Premium Header */}
            <div className="relative px-6 py-5 border-b border-slate-200/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 overflow-hidden">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/5 to-transparent"></div>
              
              {/* Header Content */}
              <div className="relative flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                    <Settings className="h-5 w-5 text-white" strokeWidth={2} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white tracking-tight">PDF Export</h2>
                    <p className="text-xs text-slate-300 mt-0.5">Configure your document</p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={onClose} 
                  className="h-9 w-9 p-0 hover:bg-white/10 rounded-xl text-white hover:text-white transition-all duration-200 border border-transparent hover:border-white/20"
                >
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>
            
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 min-h-0">
              <div className="p-5 space-y-4">

              {/* Design & Typography */}
              <Card className="border border-slate-200/60 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-br from-purple-50/50 to-transparent">
                  <CardTitle className="text-sm font-bold flex items-center gap-2.5 text-slate-900">
                    <div className="p-1.5 rounded-lg bg-purple-100 border border-purple-200">
                      <Palette className="h-4 w-4 text-purple-600" strokeWidth={2.5} />
                    </div>
                    <span>Design & Typography</span>
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
              <Card className="border border-slate-200/60 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-br from-blue-50/50 to-transparent">
                  <CardTitle className="text-sm font-bold flex items-center gap-2.5 text-slate-900">
                    <div className="p-1.5 rounded-lg bg-blue-100 border border-blue-200">
                      <Layout className="h-4 w-4 text-blue-600" strokeWidth={2.5} />
                    </div>
                    <span>Layout & Spacing</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">

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

              {/* Header Customization */}
              <Card className="border border-slate-200/60 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-br from-amber-50/50 to-transparent">
                  <CardTitle className="text-sm font-bold flex items-center gap-2.5 text-slate-900">
                    <div className="p-1.5 rounded-lg bg-amber-100 border border-amber-200">
                      <Type className="h-4 w-4 text-amber-600" strokeWidth={2.5} />
                    </div>
                    <span>Header Customization</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Header Text */}
                  <div className="space-y-2">
                    <Label htmlFor="header-text" className="text-sm font-medium text-slate-700">Header Text</Label>
                    <Input
                      id="header-text"
                      value={config.headerText}
                      onChange={(e) => updateConfig('headerText', e.target.value)}
                      placeholder="Enter custom header text"
                      className="bg-white border-slate-300 hover:border-amber-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                    />
                  </div>

                  {/* Header Font Family */}
                  <div className="space-y-2">
                    <Label htmlFor="header-font-family" className="text-sm font-medium text-slate-700">Header Font</Label>
                    <Select value={config.headerFontFamily} onValueChange={(value) => updateConfig('headerFontFamily', value)}>
                      <SelectTrigger className="bg-white border border-slate-300 hover:border-amber-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500">
                        <SelectValue placeholder="Select font" />
                      </SelectTrigger>
                      <SelectContent className="z-[10000] max-h-60 overflow-y-auto bg-white border border-gray-200 shadow-lg">
                        {headerFontOptions.map((font) => (
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

                  {/* Header Font Size */}
                  <div className="space-y-2">
                    <Label htmlFor="header-font-size" className="text-sm font-medium text-slate-700">Header Size: {config.headerFontSize}pt</Label>
                    <Slider
                      value={[config.headerFontSize]}
                      onValueChange={([value]) => updateConfig('headerFontSize', value)}
                      min={14}
                      max={36}
                      step={2}
                      className="w-full"
                    />
                  </div>

                  {/* Header Color */}
                  <div className="space-y-2">
                    <Label htmlFor="header-color" className="text-sm font-medium text-slate-700">Header Color</Label>
                    <div className="flex gap-2 items-center">
                      <Input
                        id="header-color"
                        type="color"
                        value={config.headerColor}
                        onChange={(e) => updateConfig('headerColor', e.target.value)}
                        className="w-16 h-10 p-1 cursor-pointer"
                      />
                      <Input
                        type="text"
                        value={config.headerColor}
                        onChange={(e) => updateConfig('headerColor', e.target.value)}
                        placeholder="#1f2937"
                        className="flex-1 bg-white border-slate-300 hover:border-amber-500 focus:border-amber-500 focus:ring-1 focus:ring-amber-500"
                      />
                    </div>
                  </div>

                  {/* Text Alignment */}
                  <div className="space-y-2">
                    <Label className="text-sm font-medium text-slate-700">Text Alignment</Label>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant={config.headerAlignment === 'left' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateConfig('headerAlignment', 'left')}
                        className={`flex-1 ${config.headerAlignment === 'left' ? 'bg-amber-600 hover:bg-amber-700' : 'hover:bg-amber-50'}`}
                      >
                        <AlignLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={config.headerAlignment === 'center' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateConfig('headerAlignment', 'center')}
                        className={`flex-1 ${config.headerAlignment === 'center' ? 'bg-amber-600 hover:bg-amber-700' : 'hover:bg-amber-50'}`}
                      >
                        <AlignCenter className="h-4 w-4" />
                      </Button>
                      <Button
                        type="button"
                        variant={config.headerAlignment === 'right' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => updateConfig('headerAlignment', 'right')}
                        className={`flex-1 ${config.headerAlignment === 'right' ? 'bg-amber-600 hover:bg-amber-700' : 'hover:bg-amber-50'}`}
                      >
                        <AlignRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Content Options */}
              <Card className="border border-slate-200/60 shadow-lg shadow-slate-200/50 bg-white/80 backdrop-blur-sm hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 overflow-hidden">
                <CardHeader className="pb-3 bg-gradient-to-br from-emerald-50/50 to-transparent">
                  <CardTitle className="text-sm font-bold flex items-center gap-2.5 text-slate-900">
                    <div className="p-1.5 rounded-lg bg-emerald-100 border border-emerald-200">
                      <ToggleLeft className="h-4 w-4 text-emerald-600" strokeWidth={2.5} />
                    </div>
                    <span>Content Options</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-1 gap-2.5">
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
                      <div key={key} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 hover:bg-slate-100/80 border border-slate-200/50 hover:border-slate-300/50 transition-all duration-200 group">
                        <div className="flex items-center gap-2.5">
                          <Icon className="h-3.5 w-3.5 text-slate-500 group-hover:text-slate-700 transition-colors" strokeWidth={2} />
                          <Label htmlFor={key} className="text-xs font-medium text-slate-700 cursor-pointer group-hover:text-slate-900 transition-colors">{label}</Label>
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
            <div className="relative px-5 py-4 border-t border-slate-200/60 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex-shrink-0 overflow-hidden">
              {/* Decorative gradient overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 via-blue-600/5 to-transparent"></div>
              
              <div className="relative">
                <Button 
                  onClick={handlePrint}
                  disabled={isGenerating}
                  className="w-full h-12 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-600 hover:via-emerald-700 hover:to-teal-700 text-white font-bold text-sm shadow-2xl hover:shadow-emerald-500/50 transition-all duration-300 border-0 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed group relative overflow-hidden"
                >
                  {/* Shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-700"></div>
                  
                  {isGenerating ? (
                    <span className="relative flex items-center justify-center">
                      <Loader2 className="h-5 w-5 mr-2.5 animate-spin" strokeWidth={2.5} />
                      <span>Generating PDF...</span>
                    </span>
                  ) : (
                    <span className="relative flex items-center justify-center">
                      <Download className="h-5 w-5 mr-2.5 group-hover:scale-110 transition-transform duration-200" strokeWidth={2.5} />
                      <span>Generate & Download PDF</span>
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Live Preview Panel - Right Side */}
          <div className="flex-1 bg-gradient-to-br from-slate-100 via-white to-slate-50 flex flex-col h-full overflow-hidden min-w-0">
            <div className="h-full flex flex-col">
              {/* Premium Preview Header */}
              <div className="relative px-6 py-5 border-b border-slate-200/60 bg-gradient-to-br from-emerald-600 via-teal-600 to-teal-700 flex-shrink-0 overflow-hidden">
                {/* Decorative gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-transparent"></div>
                
                <div className="relative flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-lg">
                      <Eye className="h-5 w-5 text-white" strokeWidth={2} />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white tracking-tight">Live Preview</h3>
                      <p className="text-xs text-white/80 mt-0.5">Updates automatically as you configure</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="bg-white/10 backdrop-blur-sm text-white border-white/20 px-3 py-1 text-xs font-medium">
                    <span className="relative flex h-2 w-2 mr-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                    </span>
                    Real-time
                  </Badge>
                </div>
              </div>

              {/* Preview Content */}
              <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-br from-slate-100/50 via-white/50 to-slate-100/50 scrollbar-thin scrollbar-thumb-slate-300 scrollbar-track-transparent hover:scrollbar-thumb-slate-400 min-h-0">
                <div className="max-w-4xl mx-auto">
                  <div 
                    className="bg-white shadow-2xl shadow-slate-300/50 border border-slate-200/60 rounded-2xl min-h-[80vh] transition-all duration-300"
                    style={{
                      fontFamily: config.fontFamily,
                      fontSize: `${config.fontSize}px`,
                      lineHeight: config.lineHeight,
                      padding: `${config.margins}mm`,
                    }}
                  >
                    <div 
                      ref={previewComponentRef}
                      className="print-container"
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
  
  // Add CSS for transparent KaTeX backgrounds and high-quality rendering
  content += `
    <style>
      /* Professional KaTeX/LaTeX styling - transparent backgrounds */
      .katex,
      .katex-display,
      .katex-html,
      span.katex,
      span.katex-html {
        background: transparent !important;
        background-color: transparent !important;
      }
      
      /* Remove any default KaTeX backgrounds */
      .katex .mord,
      .katex .mop,
      .katex .mbin,
      .katex .mrel,
      .katex .minner,
      .katex .mopen,
      .katex .mclose,
      .katex .mpunct {
        background: transparent !important;
      }
      
      /* High-quality text rendering */
      * {
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        text-rendering: optimizeLegibility;
      }
      
      /* Ensure mathematical symbols are crisp */
      .katex {
        font-size: 1em;
        text-rendering: geometricPrecision;
      }
    </style>
  `
  
  // Error handling for malformed data
  if (!test) {
    return '<div style="color: red; padding: 20px;">Error: Test data is missing</div>'
  }
  
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    return '<div style="color: red; padding: 20px;">Error: No questions available</div>'
  }
  
  // Header with customization
  if (config.showHeader) {
    const headerTextAlign = config.headerAlignment;
    const displayHeaderText = config.headerText || test.name;
    
    content += `
      <div class="header-section" style="text-align: center; margin-bottom: 40px; padding-bottom: 25px; border-bottom: 3px solid #e5e7eb;">
        <h1 style="font-family: ${config.headerFontFamily}, serif; font-size: ${config.headerFontSize}px; font-weight: bold; color: ${config.headerColor}; margin-bottom: 15px; letter-spacing: -0.5px; text-align: ${headerTextAlign};">${displayHeaderText}</h1>
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
      <div class="instruction-box" style="background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%); padding: 20px; border-radius: 12px; margin-bottom: 35px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
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
      <div class="marking-scheme-box" style="background: linear-gradient(135deg, #fef3c7 0%, #fde68a 100%); padding: 20px; border-radius: 12px; margin-bottom: 35px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
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
    
    
    content += `
      <div class="question-container" style="padding: 25px; border: 2px solid #e5e7eb; border-radius: 12px; background: linear-gradient(135deg, #ffffff 0%, #fafafa 100%); box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
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
      <div class="options-grid" style="margin: 15px 0; padding: 8px 0; background: transparent; border-radius: 0; ">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: start;">
          <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: transparent; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(a)</span>
            <span style="flex: 1; line-height: 1.4; font-size: 14px;">Sample option A</span>
          </div>
          <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: transparent; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(b)</span>
            <span style="flex: 1; line-height: 1.4; font-size: 14px;">Sample option B</span>
          </div>
          <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: transparent; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(c)</span>
            <span style="flex: 1; line-height: 1.4; font-size: 14px;">Sample option C</span>
          </div>
          <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
            <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: transparent; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(d)</span>
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
      <div class="options-grid" style="margin: 15px 0; padding: 8px 0; background: transparent; border-radius: 0; ">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: start;">
          ${optionA ? `
            <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
              <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: transparent; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(a)</span>
              <span style="flex: 1; line-height: 1.4; font-size: 14px;">${renderLatex(optionA)}</span>
            </div>
          ` : '<div></div>'}
          ${optionB ? `
            <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
              <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: transparent; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(b)</span>
              <span style="flex: 1; line-height: 1.4; font-size: 14px;">${renderLatex(optionB)}</span>
            </div>
          ` : '<div></div>'}
          ${optionC ? `
            <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
              <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: transparent; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(c)</span>
              <span style="flex: 1; line-height: 1.4; font-size: 14px;">${renderLatex(optionC)}</span>
            </div>
          ` : '<div></div>'}
          ${optionD ? `
            <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
              <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: transparent; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(d)</span>
              <span style="flex: 1; line-height: 1.4; font-size: 14px;">${renderLatex(optionD)}</span>
            </div>
          ` : '<div></div>'}
        </div>
      </div>
    `;
  } else if (Array.isArray(opts) && opts.length > 0) {
    // Handle array structure
    optionsHtml = `
      <div class="options-grid" style="margin: 15px 0; padding: 8px 0; background: transparent; border-radius: 0; ">
        <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; align-items: start;">
          ${opts.map((option, optIndex) => `
            <div style="display: flex; align-items: flex-start; padding: 6px; background: white; border-radius: 4px; border: 1px solid #e2e8f0;">
              <span style="font-weight: bold; margin-right: 8px; color: #1f2937; background: transparent; padding: 2px 6px; border-radius: 3px; min-width: 24px; text-align: center; flex-shrink: 0;">(${String.fromCharCode(97 + optIndex)})</span>
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
          strict: false,
          output: 'html'
        })
        // Transparent background, clean professional styling
        return `<div style="text-align: center; margin: 15px 0; padding: 8px 0; background: transparent;">${html}</div>`
      } catch (error) {
        console.warn('KaTeX display math error:', error)
        return `<div style="text-align: center; margin: 15px 0; padding: 8px 0; background: transparent; color: #dc3545;">Math Error: ${latex}</div>`
      }
    })
    
    // Handle inline math (single dollar signs) with KaTeX
    rendered = rendered.replace(/\$(.*?)\$/g, (match, latex) => {
      try {
        const html = katex.renderToString(latex.trim(), {
          displayMode: false,
          throwOnError: false,
          strict: false,
          output: 'html'
        })
        // Transparent background for seamless inline integration
        return `<span style="background: transparent; padding: 0; margin: 0;">${html}</span>`
      } catch (error) {
        console.warn('KaTeX inline math error:', error)
        return `<span style="background: transparent; padding: 0; margin: 0; color: #dc3545;">Math Error: ${latex}</span>`
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
