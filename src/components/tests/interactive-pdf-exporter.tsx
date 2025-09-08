'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { X, Download, Eye, Palette, Type, Layout, Settings, FileText, CheckCircle, Loader2 } from 'lucide-react'
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
  { value: 'Times-Roman', label: 'Times Roman' },
  { value: 'Courier', label: 'Courier' }
]

export function InteractivePDFExporter({ test, questions, isOpen, onClose }: InteractivePDFExporterProps) {
  const [settings, setSettings] = useState<PDFSettings>({
    theme: THEMES[0],
    showHeader: true,
    showFooter: true,
    showPageNumbers: true,
    showInstructions: true,
    questionsPerPage: 2,
    fontSize: 12,
    lineSpacing: 1.6,
    margins: 30
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
        setPreviewMode('success')
        
        // Close modal after 2 seconds
        setTimeout(() => {
          onClose()
          setPreviewMode('preview')
        }, 2000)
      } else {
        console.error('PDF generation failed:', result.message)
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
      } else {
        console.error('Answer key generation failed:', result.message)
      }
    } catch (error) {
      console.error('Answer key generation error:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-7xl h-[90vh] p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Interactive PDF Exporter
          </DialogTitle>
        </DialogHeader>

        <div className="flex h-full">
          {/* Control Panel */}
          <div className="w-80 border-r bg-gray-50 p-6 overflow-y-auto">
            <div className="space-y-6">
              {/* Theme Selection */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Design Theme</Label>
                <Select value={settings.theme.id} onValueChange={handleThemeChange}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {THEMES.map(theme => (
                      <SelectItem key={theme.id} value={theme.id}>
                        <div>
                          <div className="font-medium">{theme.name}</div>
                          <div className="text-xs text-gray-500">{theme.description}</div>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Color Customization */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Color Palette</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Primary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: settings.theme.primaryColor }}
                      />
                      <input
                        type="color"
                        value={settings.theme.primaryColor}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          theme: { ...prev.theme, primaryColor: e.target.value }
                        }))}
                        className="w-8 h-6 rounded border"
                      />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs text-gray-600">Secondary Color</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <div 
                        className="w-6 h-6 rounded border"
                        style={{ backgroundColor: settings.theme.secondaryColor }}
                      />
                      <input
                        type="color"
                        value={settings.theme.secondaryColor}
                        onChange={(e) => setSettings(prev => ({
                          ...prev,
                          theme: { ...prev.theme, secondaryColor: e.target.value }
                        }))}
                        className="w-8 h-6 rounded border"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Typography */}
              <div>
                <Label className="text-sm font-semibold mb-3 block">Typography</Label>
                <div className="space-y-3">
                  <div>
                    <Label className="text-xs text-gray-600">Font Family</Label>
                    <Select 
                      value={settings.theme.fontFamily} 
                      onValueChange={(value) => setSettings(prev => ({
                        ...prev,
                        theme: { ...prev.theme, fontFamily: value }
                      }))}
                    >
                      <SelectTrigger className="mt-1">
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
                    <Label className="text-xs text-gray-600">Font Size: {settings.fontSize}px</Label>
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
                    <Label className="text-xs text-gray-600">Line Spacing: {settings.lineSpacing}</Label>
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
              <div>
                <Label className="text-sm font-semibold mb-3 block">Content Options</Label>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showHeader"
                      checked={settings.showHeader}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showHeader: !!checked }))}
                    />
                    <Label htmlFor="showHeader" className="text-sm">Show Header</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showFooter"
                      checked={settings.showFooter}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showFooter: !!checked }))}
                    />
                    <Label htmlFor="showFooter" className="text-sm">Show Footer</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showPageNumbers"
                      checked={settings.showPageNumbers}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showPageNumbers: !!checked }))}
                    />
                    <Label htmlFor="showPageNumbers" className="text-sm">Show Page Numbers</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="showInstructions"
                      checked={settings.showInstructions}
                      onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showInstructions: !!checked }))}
                    />
                    <Label htmlFor="showInstructions" className="text-sm">Show Instructions</Label>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-4 border-t">
                <Button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700"
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
                  className="w-full"
                >
                  <FileText className="h-4 w-4 mr-2" />
                  Export Answer Key
                </Button>
              </div>
            </div>
          </div>

          {/* Preview Area */}
          <div className="flex-1 p-6">
            <div className="h-full bg-white border rounded-lg overflow-hidden">
              {previewMode === 'preview' && (
                <PDFLivePreview
                  test={test}
                  questions={questions}
                  settings={settings}
                />
              )}

              {previewMode === 'generating' && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <Loader2 className="h-16 w-16 text-blue-600 mx-auto mb-4 animate-spin" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Generating PDF...</h3>
                    <p className="text-gray-600">Please wait while we create your document</p>
                  </div>
                </div>
              )}

              {previewMode === 'success' && (
                <div className="h-full flex items-center justify-center">
                  <div className="text-center">
                    <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">PDF Generated Successfully!</h3>
                    <p className="text-gray-600">Your document has been downloaded</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
