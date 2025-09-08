'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X, Download, Eye, Palette, Type, Layout, Settings, FileText, CheckCircle, Loader2 } from 'lucide-react'
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
  showFooter: boolean
  showPageNumbers: boolean
  showInstructions: boolean
  includeOptions: boolean
  showMarking: boolean
  questionsPerPage: number
  fontSize: number
  lineSpacing: number
  margins: number
  customHeaderText: string
  customFooterText: string
  customInstructions: string
  showDuration: boolean
  showTotalQuestions: boolean
  showFullMarks: boolean
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
    id: 'premium-blue',
    name: 'Corporate Blue',
    description: 'Professional blue theme for corporate environments',
    primaryColor: '#2563eb',
    secondaryColor: '#1e40af',
    fontFamily: 'Helvetica',
    fontSize: 12,
    layout: 'premium'
  },
  {
    id: 'academic-light',
    name: 'Academic Light',
    description: 'Clean academic design with subtle colors',
    primaryColor: '#374151',
    secondaryColor: '#6b7280',
    fontFamily: 'Helvetica',
    fontSize: 12,
    layout: 'academic'
  },
  {
    id: 'modern-dark',
    name: 'Modern Dark',
    description: 'Contemporary dark theme with high contrast',
    primaryColor: '#1f2937',
    secondaryColor: '#374151',
    fontFamily: 'Helvetica',
    fontSize: 12,
    layout: 'premium'
  }
]

const FONT_FAMILIES = [
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Arial', label: 'Arial' },
  { value: 'Times-Roman', label: 'Times New Roman' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Cambria', label: 'Cambria (Professional)' },
  { value: 'Calibri', label: 'Calibri (Modern)' },
  { value: 'Courier', label: 'Courier' },
  { value: 'Poppins', label: 'Poppins (Modern)' },
  { value: 'Lato', label: 'Lato (Clean)' },
  { value: 'TeX-Gyre-Termes', label: 'TeX Gyre Termes (Math)' },
  { value: 'Computer-Modern', label: 'Computer Modern (LaTeX)' },
  { value: 'Noto-Sans-Bengali', label: 'Noto Sans Bengali' },
  { value: 'Kalpurush', label: 'Kalpurush (Bengali)' }
]

export function InteractivePDFExporter({ test, questions, isOpen, onClose }: InteractivePDFExporterProps) {
  const [settings, setSettings] = useState<PDFSettings>({
    theme: THEMES[0],
    showHeader: true,
    showFooter: true,
    showPageNumbers: true,
    showInstructions: true,
    includeOptions: true,
    showMarking: true,
    questionsPerPage: 2,
    fontSize: 12,
    lineSpacing: 1.6,
    margins: 30,
    customHeaderText: '',
    customFooterText: '© 2025 Professional Test Platform',
    customInstructions: '',
    showDuration: true,
    showTotalQuestions: true,
    showFullMarks: true
  })

  const [isGenerating, setIsGenerating] = useState(false)
  const [previewMode, setPreviewMode] = useState<'preview' | 'generating' | 'success'>('preview')

  const handleThemeChange = (themeId: string) => {
    const theme = THEMES.find(t => t.id === themeId)
    if (theme) {
      setSettings(prev => ({
        ...prev,
        theme,
        fontSize: theme.fontSize
      }))
    }
  }

  const handleGeneratePDF = async () => {
    setIsGenerating(true)
    setPreviewMode('generating')
    
    try {
      // Generate PDF with current settings
      const result = await PDFService.generateQuestionPaperPDF(test, questions)
      
      if (result.success && result.blob && result.fileName) {
        PDFService.downloadPDF(result.blob, result.fileName)
        toast.success('PDF Generated Successfully!', {
          description: 'Your document has been downloaded.',
          duration: 3000,
        })
        setPreviewMode('preview')
      } else {
        console.error('PDF generation failed:', result.message)
        toast.error('PDF Generation Failed', {
          description: result.message || 'Please try again.',
          duration: 4000,
        })
        setPreviewMode('preview')
      }
    } catch (error) {
      console.error('PDF generation error:', error)
      setPreviewMode('preview')
    } finally {
      setIsGenerating(false)
    }
  }

  const handleExportAnswerKey = async () => {
    setIsGenerating(true)
    
    try {
      const result = await PDFService.generateAnswerKeyPDF(test, questions)
      
      if (result.success && result.blob && result.fileName) {
        PDFService.downloadPDF(result.blob, result.fileName)
        toast.success('Answer Key Generated!', {
          description: 'Your answer key has been downloaded.',
          duration: 3000,
        })
      } else {
        console.error('Answer key generation failed:', result.message)
        toast.error('Answer Key Generation Failed', {
          description: result.message || 'Please try again.',
          duration: 4000,
        })
      }
    } catch (error) {
      console.error('Answer key generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-[90vw] w-[90vw] h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Interactive PDF Exporter
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full">
          {/* Control Panel */}
          <div className="w-96 bg-gradient-to-b from-gray-50 to-gray-100 border-r border-gray-200 overflow-y-auto">
            <div className="p-6 space-y-8">
              {/* Theme Selection */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
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

              {/* Color Customization */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
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

              {/* Typography */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
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
                      min={10}
                      max={16}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Line Spacing: {settings.lineSpacing}</Label>
                    <Slider
                      value={[settings.lineSpacing]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, lineSpacing: value }))}
                      min={1.2}
                      max={2.0}
                      step={0.1}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Layout Options */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Layout & Spacing</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Questions per Page: {settings.questionsPerPage}</Label>
                    <Slider
                      value={[settings.questionsPerPage]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, questionsPerPage: value }))}
                      min={1}
                      max={5}
                      step={1}
                      className="mt-2"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Margins: {settings.margins}px</Label>
                    <Slider
                      value={[settings.margins]}
                      onValueChange={([value]) => setSettings(prev => ({ ...prev, margins: value }))}
                      min={20}
                      max={50}
                      step={5}
                      className="mt-2"
                    />
                  </div>
                </div>
              </div>

              {/* Content Options */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
                <Label className="text-sm font-semibold mb-3 block text-gray-800">Content Options</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="includeOptions" className="text-sm font-medium">Include Options</Label>
                    <Checkbox
                      id="includeOptions"
                      checked={settings.includeOptions}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeOptions: !!checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showHeader" className="text-sm font-medium">Show Header</Label>
                    <Checkbox
                      id="showHeader"
                      checked={settings.showHeader}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showHeader: !!checked }))}
                    />
                  </div>
                  {settings.showHeader && (
                    <div className="ml-4 space-y-2 border-l-2 border-gray-200 pl-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showDuration" className="text-xs text-gray-600">Show Duration</Label>
                        <Checkbox
                          id="showDuration"
                          checked={settings.showDuration}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showDuration: !!checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showTotalQuestions" className="text-xs text-gray-600">Show Total Questions</Label>
                        <Checkbox
                          id="showTotalQuestions"
                          checked={settings.showTotalQuestions}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showTotalQuestions: !!checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showFullMarks" className="text-xs text-gray-600">Show Full Marks</Label>
                        <Checkbox
                          id="showFullMarks"
                          checked={settings.showFullMarks}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showFullMarks: !!checked }))}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="showMarking" className="text-xs text-gray-600">Show Marking</Label>
                        <Checkbox
                          id="showMarking"
                          checked={settings.showMarking}
                          onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showMarking: !!checked }))}
                        />
                      </div>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showFooter" className="text-sm font-medium">Show Footer</Label>
                    <Checkbox
                      id="showFooter"
                      checked={settings.showFooter}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showFooter: !!checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showPageNumbers" className="text-sm font-medium">Show Page Numbers</Label>
                    <Checkbox
                      id="showPageNumbers"
                      checked={settings.showPageNumbers}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showPageNumbers: !!checked }))}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label htmlFor="showInstructions" className="text-sm font-medium">Show Instructions</Label>
                    <Checkbox
                      id="showInstructions"
                      checked={settings.showInstructions}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showInstructions: !!checked }))}
                    />
                  </div>
                </div>
              </div>

              {/* Custom Text Options */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
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
                  <div>
                    <Label className="text-xs text-gray-600 mb-2 block">Custom Instructions (optional)</Label>
                    <Textarea
                      value={settings.customInstructions}
                      onChange={(e) => setSettings(prev => ({ ...prev, customInstructions: e.target.value }))}
                      className="text-xs border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                      rows={3}
                      placeholder="Leave empty to use default instructions..."
                    />
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
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
                    onClick={handleExportAnswerKey}
                    disabled={isGenerating}
                    variant="outline"
                    className="w-full border-gray-300 hover:border-gray-400 hover:bg-gray-50 font-medium py-2.5 transition-all duration-200"
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Export Answer Key
                  </Button>
                </div>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-6">
            <div className="h-full bg-white border rounded-lg overflow-hidden">
              {previewMode === 'generating' ? (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating PDF...</h3>
                    <p className="text-gray-600">Please wait while we create your document</p>
                  </div>
                </div>
              ) : (
                <PDFLivePreview
                  test={test}
                  questions={questions}
                  settings={settings}
                />
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
