'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import { ToggleSwitch } from '@/components/ui/toggle-switch'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Download, FileText, Loader2, Palette, Type, Layout, Settings, Eye, X } from 'lucide-react'
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
  const [activeTab, setActiveTab] = useState<'design' | 'layout' | 'content'>('design')

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

  const tabs = [
    { id: 'design', label: 'Design', icon: Palette },
    { id: 'layout', label: 'Layout', icon: Layout },
    { id: 'content', label: 'Content', icon: Settings }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[98vw] max-w-[2400px] h-[96vh] p-0 overflow-hidden bg-gradient-to-br from-slate-50 to-slate-100 border-0 shadow-2xl">
        {/* Premium Header */}
        <DialogHeader className="relative bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white p-8 border-b-0">
          <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-purple-600/20"></div>
          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20">
                <FileText className="h-8 w-8 text-white" />
              </div>
              <div>
                <DialogTitle className="text-2xl font-bold text-white mb-1">
                  Interactive PDF Exporter
                </DialogTitle>
                <p className="text-slate-300 text-sm">
                  Create professional test papers with live preview
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-white hover:bg-white/10 p-2 rounded-lg"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </DialogHeader>

        <div className="flex flex-1 min-h-0">
          {/* Premium Control Panel */}
          <div className="w-[420px] bg-white/80 backdrop-blur-sm border-r border-slate-200/50 flex flex-col flex-shrink-0 shadow-xl">
            {/* Tab Navigation */}
            <div className="p-6 border-b border-slate-200/50">
              <div className="flex space-x-1 bg-slate-100 rounded-lg p-1">
                {tabs.map((tab) => {
                  const Icon = tab.icon
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id as any)}
                      className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200 ${
                        activeTab === tab.id
                          ? 'bg-white text-slate-900 shadow-sm'
                          : 'text-slate-600 hover:text-slate-900 hover:bg-white/50'
                      }`}
                    >
                      <Icon className="h-4 w-4" />
                      {tab.label}
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-6 space-y-8">
                
                {/* Design Tab */}
                {activeTab === 'design' && (
                  <>
                    {/* Theme Selection */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Palette className="h-5 w-5 text-slate-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Design Theme</h3>
                      </div>
                      <Select value={settings.theme.id} onValueChange={handleThemeChange}>
                        <SelectTrigger className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500 h-12">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {THEMES.map(theme => (
                            <SelectItem key={theme.id} value={theme.id}>
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-5 h-5 rounded-full border-2 border-slate-300 shadow-sm"
                                  style={{ backgroundColor: theme.primaryColor }}
                                />
                                <div>
                                  <div className="font-medium">{theme.name}</div>
                                  <div className="text-xs text-slate-500">{theme.description}</div>
                                </div>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Color Palette */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-slate-900">Color Palette</h3>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Primary</Label>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl border-2 border-slate-300 shadow-sm"
                              style={{ backgroundColor: settings.theme.primaryColor }}
                            />
                            <input
                              type="color"
                              value={settings.theme.primaryColor}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                theme: { ...prev.theme, primaryColor: e.target.value }
                              }))}
                              className="w-12 h-10 rounded-lg border border-slate-300 cursor-pointer"
                            />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium text-slate-700">Secondary</Label>
                          <div className="flex items-center gap-3">
                            <div 
                              className="w-10 h-10 rounded-xl border-2 border-slate-300 shadow-sm"
                              style={{ backgroundColor: settings.theme.secondaryColor }}
                            />
                            <input
                              type="color"
                              value={settings.theme.secondaryColor}
                              onChange={(e) => setSettings(prev => ({
                                ...prev,
                                theme: { ...prev.theme, secondaryColor: e.target.value }
                              }))}
                              className="w-12 h-10 rounded-lg border border-slate-300 cursor-pointer"
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Typography */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Type className="h-5 w-5 text-slate-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Typography</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">Font Family</Label>
                          <Select 
                            value={settings.theme.fontFamily} 
                            onValueChange={(value) => setSettings(prev => ({
                              ...prev,
                              theme: { ...prev.theme, fontFamily: value }
                            }))}
                          >
                            <SelectTrigger className="bg-white border-slate-300 focus:border-blue-500 focus:ring-blue-500">
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
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">
                            Font Size: {settings.fontSize}px
                          </Label>
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
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">
                            Line Spacing: {settings.lineSpacing}
                          </Label>
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
                  </>
                )}

                {/* Layout Tab */}
                {activeTab === 'layout' && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Layout className="h-5 w-5 text-slate-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Layout & Spacing</h3>
                      </div>
                      <div className="space-y-6">
                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">
                            Questions per Page: {settings.questionsPerPage}
                          </Label>
                          <Slider
                            value={[settings.questionsPerPage]}
                            onValueChange={([value]) => setSettings(prev => ({ ...prev, questionsPerPage: value }))}
                            min={1}
                            max={15}
                            step={1}
                            className="mt-2"
                          />
                          <p className="text-xs text-slate-500 mt-2">
                            More questions = more pages, fewer questions = larger text
                          </p>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">
                            Margins: {settings.margins}px
                          </Label>
                          <Slider
                            value={[settings.margins]}
                            onValueChange={([value]) => setSettings(prev => ({ ...prev, margins: value }))}
                            min={10}
                            max={60}
                            step={5}
                            className="mt-2"
                          />
                          <p className="text-xs text-slate-500 mt-2">
                            Larger margins = more white space around content
                          </p>
                        </div>
                      </div>
                    </div>
                  </>
                )}

                {/* Content Tab */}
                {activeTab === 'content' && (
                  <>
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <Settings className="h-5 w-5 text-slate-600" />
                        <h3 className="text-lg font-semibold text-slate-900">Content Options</h3>
                      </div>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <Label htmlFor="showHeader" className="text-sm font-medium text-slate-700">Show Header</Label>
                            <p className="text-xs text-slate-500">Include test information header</p>
                          </div>
                          <ToggleSwitch
                            id="showHeader"
                            checked={settings.showHeader}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showHeader: checked }))}
                          />
                        </div>
                        
                        {settings.showHeader && (
                          <div className="ml-4 space-y-3 border-l-2 border-blue-200 pl-4">
                            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                              <Label htmlFor="showDuration" className="text-xs text-slate-600">Show Duration</Label>
                              <ToggleSwitch
                                id="showDuration"
                                checked={settings.showDuration}
                                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showDuration: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                              <Label htmlFor="showTotalQuestions" className="text-xs text-slate-600">Show Total Questions</Label>
                              <ToggleSwitch
                                id="showTotalQuestions"
                                checked={settings.showTotalQuestions}
                                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showTotalQuestions: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                              <Label htmlFor="showFullMarks" className="text-xs text-slate-600">Show Full Marks</Label>
                              <ToggleSwitch
                                id="showFullMarks"
                                checked={settings.showFullMarks}
                                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showFullMarks: checked }))}
                              />
                            </div>
                            <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                              <Label htmlFor="showMarking" className="text-xs text-slate-600">Show Marking</Label>
                              <ToggleSwitch
                                id="showMarking"
                                checked={settings.showMarking}
                                onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showMarking: checked }))}
                              />
                            </div>
                          </div>
                        )}

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <Label htmlFor="includeOptions" className="text-sm font-medium text-slate-700">Include Options</Label>
                            <p className="text-xs text-slate-500">Show multiple choice options (A, B, C, D)</p>
                          </div>
                          <ToggleSwitch
                            id="includeOptions"
                            checked={settings.includeOptions}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, includeOptions: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <Label htmlFor="showInstructions" className="text-sm font-medium text-slate-700">Show Instructions</Label>
                            <p className="text-xs text-slate-500">Include test instructions</p>
                          </div>
                          <ToggleSwitch
                            id="showInstructions"
                            checked={settings.showInstructions}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showInstructions: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <Label htmlFor="showFooter" className="text-sm font-medium text-slate-700">Show Footer</Label>
                            <p className="text-xs text-slate-500">Include footer information</p>
                          </div>
                          <ToggleSwitch
                            id="showFooter"
                            checked={settings.showFooter}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showFooter: checked }))}
                          />
                        </div>

                        <div className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                          <div>
                            <Label htmlFor="showPageNumbers" className="text-sm font-medium text-slate-700">Show Page Numbers</Label>
                            <p className="text-xs text-slate-500">Include page numbering</p>
                          </div>
                          <ToggleSwitch
                            id="showPageNumbers"
                            checked={settings.showPageNumbers}
                            onCheckedChange={(checked) => setSettings(prev => ({ ...prev, showPageNumbers: checked }))}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Custom Text */}
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 mb-4">
                        <div className="w-2 h-2 bg-gradient-to-r from-green-500 to-blue-500 rounded-full"></div>
                        <h3 className="text-lg font-semibold text-slate-900">Custom Text</h3>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">Custom Header Text</Label>
                          <Textarea
                            value={settings.customHeaderText}
                            onChange={(e) => setSettings(prev => ({ ...prev, customHeaderText: e.target.value }))}
                            className="text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            rows={2}
                            placeholder="Enter custom header text (e.g., paper code)..."
                          />
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-slate-700 mb-2 block">Custom Footer Text</Label>
                          <Textarea
                            value={settings.customFooterText}
                            onChange={(e) => setSettings(prev => ({ ...prev, customFooterText: e.target.value }))}
                            className="text-sm border-slate-300 focus:border-blue-500 focus:ring-blue-500"
                            rows={2}
                            placeholder="Enter custom footer text..."
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>

            {/* Premium Actions */}
            <div className="p-6 border-t border-slate-200/50 bg-gradient-to-r from-slate-50 to-white">
              <div className="space-y-3">
                <Button
                  onClick={handleGeneratePDF}
                  disabled={isGenerating}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold py-3 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                      Generating PDF...
                    </>
                  ) : (
                    <>
                      <Download className="h-5 w-5 mr-2" />
                      Generate & Download PDF
                    </>
                  )}
                </Button>
                
                <Button
                  onClick={handleGenerateAnswerKey}
                  disabled={isGenerating}
                  variant="outline"
                  className="w-full border-slate-300 hover:border-slate-400 hover:bg-slate-50 font-semibold py-3 transition-all duration-200"
                >
                  <FileText className="h-5 w-5 mr-2" />
                  Generate Answer Key
                </Button>
              </div>
            </div>
          </div>

          {/* Premium Preview Area */}
          <div className="flex-1 flex flex-col min-w-0 flex-grow bg-gradient-to-br from-slate-50 to-white">
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