'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download, FileText, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { PDFService } from '@/lib/services/pdf-service'
import { PDFLivePreview } from './pdf-live-preview'
import type { Test, Question } from '@/lib/supabase/admin'

interface InteractivePDFExporterProps {
  test: Test
  questions: Question[]
  isOpen: boolean
  onClose: () => void
}

interface PDFTheme {
  id: string
  name: string
  description: string
  primaryColor: string
  secondaryColor: string
  fontFamily: string
  fontSize: number
  layout: 'minimalist' | 'premium' | 'academic'
}

interface PDFSettings {
  theme: PDFTheme
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

const THEMES: PDFTheme[] = [
  {
    id: 'minimalist',
    name: 'Minimalist',
    description: 'Clean, black-and-white, print-friendly design',
    primaryColor: '#000000',
    secondaryColor: '#666666',
    fontFamily: 'Helvetica',
    fontSize: 12,
    layout: 'minimalist'
  },
  {
    id: 'premium',
    name: 'Premium',
    description: 'Professional design with modern styling',
    primaryColor: '#2563eb',
    secondaryColor: '#64748b',
    fontFamily: 'Arial',
    fontSize: 12,
    layout: 'premium'
  },
  {
    id: 'corporate-blue',
    name: 'Corporate Blue',
    description: 'Professional blue theme for corporate environments',
    primaryColor: '#1e40af',
    secondaryColor: '#475569',
    fontFamily: 'Calibri',
    fontSize: 12,
    layout: 'premium'
  },
  {
    id: 'academic-light',
    name: 'Academic Light',
    description: 'Clean academic theme with subtle colors',
    primaryColor: '#059669',
    secondaryColor: '#6b7280',
    fontFamily: 'Times New Roman',
    fontSize: 12,
    layout: 'academic'
  },
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    description: 'Contemporary dark theme with high contrast',
    primaryColor: '#1f2937',
    secondaryColor: '#9ca3af',
    fontFamily: 'Inter',
    fontSize: 12,
    layout: 'premium'
  }
]

const FONT_FAMILIES = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Inter', label: 'Inter (Modern)' },
  { value: 'Poppins', label: 'Poppins (Google Fonts)' },
  { value: 'Calibri', label: 'Calibri (Professional)' },
  { value: 'Cambria', label: 'Cambria (Professional)' },
  { value: 'TeX-Gyre-Termes-Math', label: 'TeX Gyre Termes Math (LaTeX)' },
  { value: 'Noto-Sans-Bengali', label: 'Noto Sans Bengali' },
  { value: 'Kalpurush', label: 'Kalpurush (Bengali)' }
]

export function InteractivePDFExporter({ test, questions, isOpen, onClose }: InteractivePDFExporterProps) {
  const [settings, setSettings] = useState<PDFSettings>({
    theme: THEMES[0],
    showHeader: true,
    showDuration: true,
    showTotalQuestions: true,
    showFullMarks: true,
    showMarking: true,
    includeOptions: true,
    showInstructions: true,
    showFooter: true,
    showPageNumbers: true,
    customHeaderText: '',
    customFooterText: '© 2025 Professional Test Platform',
    questionsPerPage: 8,
    fontSize: 12,
    lineSpacing: 1.4,
    margins: 30
  })

  const [isGenerating, setIsGenerating] = useState(false)

  const handleThemeChange = (themeId: string) => {
    const selectedTheme = THEMES.find(theme => theme.id === themeId)
    if (selectedTheme) {
      setSettings(prev => ({
        ...prev,
        theme: selectedTheme,
        fontSize: selectedTheme.fontSize,
        primaryColor: selectedTheme.primaryColor,
        secondaryColor: selectedTheme.secondaryColor
      }))
    }
  }

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    
    try {
      const result = await PDFService.generateQuestionPaperPDF(test, questions, settings)
      
      if (result.success && result.blob && result.fileName) {
        PDFService.downloadPDF(result.blob, result.fileName)
        toast.success('PDF Generated Successfully!', {
          description: 'Your document has been downloaded.',
          duration: 3000,
        })
      } else {
        toast.error('PDF Generation Failed', {
          description: result.message || 'Please try again.',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      toast.error('PDF Generation Failed', {
        description: 'An unexpected error occurred.',
        duration: 4000,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleGenerateAnswerKey = async () => {
    setIsGenerating(true)
    
    try {
      const result = await PDFService.generateAnswerKeyPDF(test, questions, settings)
      
      if (result.success && result.blob && result.fileName) {
        PDFService.downloadPDF(result.blob, result.fileName)
        toast.success('Answer Key Generated!', {
          description: 'Your answer key has been downloaded.',
          duration: 3000,
        })
      } else {
        toast.error('Answer Key Generation Failed', {
          description: result.message || 'Please try again.',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Answer key generation error:', error)
      toast.error('Answer Key Generation Failed', {
        description: 'An unexpected error occurred.',
        duration: 4000,
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] max-w-[1800px] h-[95vh] p-0 overflow-hidden flex flex-col">
        <DialogHeader className="p-6 pb-4 flex-shrink-0">
          <DialogTitle className="flex items-center gap-2 text-xl font-semibold">
            <FileText className="h-6 w-6" />
            Interactive PDF Exporter
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Control Panel - Fixed width for stability and full functionality */}
          <div className="w-[360px] bg-gray-50 border-r border-gray-200 flex flex-col flex-shrink-0">
            <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-gray-100">
              <div className="p-6 space-y-8">
              
              {/* Design Theme Section */}
              <div>
                <Label className="text-sm font-semibold mb-3 block text-gray-800">Design Theme</Label>
                <Select value={settings.theme.id} onValueChange={handleThemeChange}>
                  <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map(theme => (
                      <SelectItem key={theme.id} value={theme.id}>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-4 h-4 rounded border border-gray-300"
                            style={{ backgroundColor: theme.primaryColor }}
                          />
                          <div>
                            <div className="font-medium">{theme.name}</div>
                            <div className="text-xs text-gray-500">{theme.description}</div>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Palette Section */}
              <div>
                <Label className="text-sm font-semibold mb-3 block text-gray-800">Color Palette</Label>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Primary Color</Label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm"
                        style={{ backgroundColor: settings.theme.primaryColor }}
                      />
                      <input
                        type="color"
                        value={settings.theme.primaryColor}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          theme: { ...prev.theme, primaryColor: e.target.value }
                        }))}
                        className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Secondary Color</Label>
                    <div className="flex items-center gap-3">
                      <div 
                        className="w-8 h-8 rounded-lg border-2 border-gray-300 shadow-sm"
                        style={{ backgroundColor: settings.theme.secondaryColor }}
                      />
                      <input
                        type="color"
                        value={settings.theme.secondaryColor}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          theme: { ...prev.theme, secondaryColor: e.target.value }
                        }))}
                        className="w-10 h-8 rounded border border-gray-300 cursor-pointer"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography Section */}
              <div>
                <Label className="text-sm font-semibold mb-3 block text-gray-800">Typography</Label>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Font Family</Label>
                    <Select 
                      value={settings.theme.fontFamily} 
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        theme: { ...prev.theme, fontFamily: value }
                      }))}
                    >
                      <SelectTrigger className="bg-white border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {FONT_FAMILIES.map(font => (
                          <SelectItem key={font.value} value={font.value}>
                            {font.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Font Size: {settings.fontSize}px</Label>
                    <Slider
                      value={[settings.fontSize]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, fontSize: value }))}
                      min={8}
                      max={24}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Line Spacing: {settings.lineSpacing}</Label>
                    <Slider
                      value={[settings.lineSpacing]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, lineSpacing: value }))}
                      min={1.0}
                      max={2.0}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Layout & Spacing Section */}
              <div>
                <Label className="text-sm font-semibold mb-3 block text-gray-800">Layout & Spacing</Label>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Questions per Page: {settings.questionsPerPage}</Label>
                    <Slider
                      value={[settings.questionsPerPage]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, questionsPerPage: value }))}
                      min={1}
                      max={15}
                      step={1}
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      More questions = more pages, fewer questions = larger text
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Margins: {settings.margins}px</Label>
                    <Slider
                      value={[settings.margins]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, margins: value }))}
                      min={10}
                      max={60}
                      step={5}
                      className="mt-2"
                    />
                    <div className="text-xs text-gray-500 mt-1">
                      Larger margins = more white space around content
                    </div>
                  </div>
                </div>
              </div>

              {/* Content Options Section */}
              <div>
                <Label className="text-sm font-semibold mb-3 block text-gray-800">Content Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showHeader" className="text-sm font-medium">Show Header</Label>
                    <ToggleSwitch
                      id="showHeader"
                      checked={settings.showHeader}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showHeader: checked }))}
                    />
                  </div>
                  
                  {settings.showHeader && (
                    <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showDuration" className="text-xs text-gray-600">Show Duration</Label>
                        <ToggleSwitch
                          id="showDuration"
                          checked={settings.showDuration}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showDuration: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showTotalQuestions" className="text-xs text-gray-600">Show Total Questions</Label>
                        <ToggleSwitch
                          id="showTotalQuestions"
                          checked={settings.showTotalQuestions}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showTotalQuestions: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showFullMarks" className="text-xs text-gray-600">Show Full Marks</Label>
                        <ToggleSwitch
                          id="showFullMarks"
                          checked={settings.showFullMarks}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showFullMarks: checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showMarking" className="text-xs text-gray-600">Show Marking</Label>
                        <ToggleSwitch
                          id="showMarking"
                          checked={settings.showMarking}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showMarking: checked }))}
                        />
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <div>
                      <Label htmlFor="includeOptions" className="text-sm font-medium">Include Options</Label>
                      <div className="text-xs text-gray-500">Show multiple choice options (A, B, C, D)</div>
                    </div>
                    <ToggleSwitch
                      id="includeOptions"
                      checked={settings.includeOptions}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeOptions: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showInstructions" className="text-sm font-medium">Show Instructions</Label>
                    <ToggleSwitch
                      id="showInstructions"
                      checked={settings.showInstructions}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showInstructions: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showFooter" className="text-sm font-medium">Show Footer</Label>
                    <ToggleSwitch
                      id="showFooter"
                      checked={settings.showFooter}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showFooter: checked }))}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="showPageNumbers" className="text-sm font-medium">Show Page Numbers</Label>
                    <ToggleSwitch
                      id="showPageNumbers"
                      checked={settings.showPageNumbers}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showPageNumbers: checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Custom Text Section */}
              <div>
                <Label className="text-sm font-semibold mb-3 block text-gray-800">Custom Text</Label>
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Custom Header Text (optional)</Label>
                    <Textarea
                      value={settings.customHeaderText}
                      onChange={(e) => setSettings(prev => ({ ...prev, customHeaderText: e.target.value }))}
                      className="text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter custom header text (e.g., paper code)..."
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Custom Footer Text</Label>
                    <Textarea
                      value={settings.customFooterText}
                      onChange={(e) => setSettings(prev => ({ ...prev, customFooterText: e.target.value }))}
                      className="text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      rows={2}
                      placeholder="Enter custom footer text..."
                    />
                  </div>
                </div>
              </div>

              {/* Preview Mode Section */}
              <div>
                <Label className="text-sm font-semibold mb-3 block text-gray-800">Preview Mode</Label>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <div className="text-xs text-blue-800 font-medium mb-1">Live Preview Active</div>
                  <div className="text-xs text-blue-600">
                    Changes update instantly in the preview. Use zoom controls to inspect details.
                  </div>
                </div>
              </div>

              {/* Actions Section */}
              <div className="pt-4 border-t border-gray-200">
                <div className="space-y-3">
                  <Button
                    onClick={handleGeneratePDF}
                    disabled={isGenerating}
                    className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium py-2.5 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Generating PDF...
                      </>
                    ) : (
                      <>
                        <Download className="h-4 w-4 mr-2" />
                        Generate & Download PDF
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={handleGenerateAnswerKey}
                    disabled={isGenerating}
                    variant="outline"
                    className="w-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-medium py-2.5 transition-all duration-200"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Answer Key
                  </Button>
                </div>
              </div>
              </div>
            </div>
            {/* Scroll indicator */}
            <div className="h-1 bg-gradient-to-t from-gray-200 to-transparent flex-shrink-0"></div>
          </div>

          {/* Preview Area - Flexible Column occupying all remaining space */}
          <div className="flex-1 flex flex-col min-w-0 flex-grow">
            <PDFLivePreview
              test={test}
              questions={questions}
              settings={settings}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}