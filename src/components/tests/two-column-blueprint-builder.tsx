'use client'

import { useState, useEffect, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  ArrowLeft, 
  BookOpen, 
  Plus, 
  Settings, 
  Target, 
  Zap, 
  Hash, 
  Trash2, 
  Tag, 
  Award, 
  Sparkles,
  Save,
  Download,
  FileText,
  CheckCircle,
  Circle
} from 'lucide-react'
import type { ChapterInfo, BlueprintRule, ChapterBlueprint, TestBlueprint } from '@/lib/types'

type BlueprintState = Record<string, ChapterBlueprint>

interface TwoColumnBlueprintBuilderProps {
  chapters: ChapterInfo[]
  blueprint: BlueprintState
  onBlueprintChange: (blueprint: BlueprintState) => void
  onNext: () => void
  isGenerating: boolean
  error: string | null
}

interface Preset {
  id: string
  name: string
  blueprint: BlueprintState
  createdAt: string
}

export function TwoColumnBlueprintBuilder({
  chapters,
  blueprint,
  onBlueprintChange,
  onNext,
  isGenerating,
  error
}: TwoColumnBlueprintBuilderProps) {
  const [selectedChapter, setSelectedChapter] = useState<string | null>(null)
  const [presets, setPresets] = useState<Preset[]>([])
  const [showSavePreset, setShowSavePreset] = useState(false)
  const [presetName, setPresetName] = useState('')
  const [showLoadPreset, setShowLoadPreset] = useState(false)

  const difficultyLevels: string[] = ['Easy', 'Easy-Moderate', 'Moderate', 'Moderate-Hard', 'Hard']

  // Load presets from localStorage on mount
  useEffect(() => {
    const savedPresets = localStorage.getItem('test-blueprint-presets')
    if (savedPresets) {
      setPresets(JSON.parse(savedPresets))
    }
  }, [])

  // Save presets to localStorage whenever presets change
  useEffect(() => {
    localStorage.setItem('test-blueprint-presets', JSON.stringify(presets))
  }, [presets])

  const totalQuestions = useMemo(() => {
    let total = 0
    for (const chapterName of Object.keys(blueprint)) {
      const ch = blueprint[chapterName]
      if (!ch) continue
      total += ch.random || 0
      if (Array.isArray(ch.rules)) {
        total += ch.rules.reduce((sum, r) => sum + (r.quantity || 0), 0)
      }
    }
    return total
  }, [blueprint])

  const selectedChapterInfo = chapters.find(ch => ch.name === selectedChapter)

  const setChapterRandom = (chapterName: string, value: number) => {
    const current = blueprint[chapterName] || {}
    const newBlueprint = {
      ...blueprint,
      [chapterName]: {
        ...current,
        random: Math.max(0, value || 0)
      }
    }
    onBlueprintChange(newBlueprint)
  }

  const addRule = (chapterName: string) => {
    const current = blueprint[chapterName] || {}
    const currentRules = current.rules || []
    const newBlueprint = {
      ...blueprint,
      [chapterName]: {
        ...current,
        rules: [...currentRules, { tag: null, difficulty: null, quantity: 0 } as BlueprintRule]
      }
    }
    onBlueprintChange(newBlueprint)
  }

  const updateRule = (chapterName: string, index: number, patch: Partial<BlueprintRule>) => {
    const current = blueprint[chapterName] || {}
    const currentRules = current.rules || []
    const next = [...currentRules]
    next[index] = { ...next[index], ...patch }
    const newBlueprint = {
      ...blueprint,
      [chapterName]: {
        ...current,
        rules: next
      }
    }
    onBlueprintChange(newBlueprint)
  }

  const removeRule = (chapterName: string, index: number) => {
    const current = blueprint[chapterName] || {}
    const currentRules = current.rules || []
    const next = currentRules.filter((_, i) => i !== index)
    const newBlueprint = {
      ...blueprint,
      [chapterName]: {
        ...current,
        rules: next
      }
    }
    onBlueprintChange(newBlueprint)
  }

  const savePreset = () => {
    if (!presetName.trim()) return

    const newPreset: Preset = {
      id: Date.now().toString(),
      name: presetName.trim(),
      blueprint: { ...blueprint },
      createdAt: new Date().toISOString()
    }

    setPresets(prev => [...prev, newPreset])
    setPresetName('')
    setShowSavePreset(false)
  }

  const loadPreset = (preset: Preset) => {
    onBlueprintChange({ ...preset.blueprint })
    setSelectedChapter(null)
    setShowLoadPreset(false)
  }

  const deletePreset = (presetId: string) => {
    setPresets(prev => prev.filter(p => p.id !== presetId))
  }

  const getChapterStatus = (chapter: ChapterInfo) => {
    const chState = blueprint[chapter.name] || {}
    const rules = chState.rules || []
    const selectedCount = (chState.random || 0) + rules.reduce((sum, r) => sum + (r.quantity || 0), 0)
    return { selectedCount, hasRules: rules.length > 0 || (chState.random || 0) > 0 }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 border-b border-gray-200 bg-white">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Create Mock Test</h1>
              <p className="text-gray-600 mt-1">Design your test blueprint</p>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex-shrink-0 mx-6 mt-4 p-4 rounded-lg bg-red-50 border border-red-200">
          <p className="text-sm font-medium text-red-800">{error}</p>
        </div>
      )}

      {/* Main Content - Configuration & Live Summary Layout (50/50) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel (50%) - Accordion Configuration Panel */}
        <div className="w-1/2 border-r border-gray-200 bg-gray-50 flex flex-col">
          {/* Chapter Library Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200">
            <h2 className="font-semibold text-gray-900">Chapter Configuration</h2>
            <p className="text-sm text-gray-600 mt-1">Click a chapter to configure its rules</p>
          </div>

          {/* Accordion Chapter List */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-3">
              {chapters.map((chapter) => {
                const { selectedCount, hasRules } = getChapterStatus(chapter)
                const isExpanded = selectedChapter === chapter.name
                const chState = blueprint[chapter.name] || {}
                const rules = chState.rules || []
                
                return (
                  <div key={chapter.name} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    {/* Chapter Header - Clickable */}
                    <button
                      onClick={() => setSelectedChapter(isExpanded ? null : chapter.name)}
                      className="w-full p-4 text-left transition-all duration-200 hover:bg-gray-50"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full ${
                            hasRules ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900">{chapter.name}</p>
                            <p className="text-sm text-gray-500">{chapter.available} questions available</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {selectedCount > 0 && (
                            <Badge variant="secondary" className="bg-blue-100 text-blue-700">
                              {selectedCount}
                            </Badge>
                          )}
                          <div className={`transform transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}>
                            <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Expanded Configuration Content */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-100">
                        <div className="pt-4 space-y-4">
                          {/* Random Questions Section */}
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <div className="w-5 h-5 bg-green-100 rounded-lg flex items-center justify-center">
                                <Zap className="h-3 w-3 text-green-600" />
                              </div>
                              <Label className="text-sm font-medium text-gray-700">Random Questions</Label>
                            </div>
                            <div className="flex items-center space-x-3">
                              <Input
                                type="number"
                                min={0}
                                max={chapter.available}
                                value={(chState.random || 0).toString()}
                                onChange={(e) => setChapterRandom(chapter.name, parseInt(e.target.value) || 0)}
                                className="w-20 h-8 text-sm"
                              />
                              <span className="text-xs text-gray-500">
                                (Max: {chapter.available})
                              </span>
                            </div>
                          </div>

                          {/* Custom Rules Section */}
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-2">
                                <div className="w-5 h-5 bg-orange-100 rounded-lg flex items-center justify-center">
                                  <Settings className="h-3 w-3 text-orange-600" />
                                </div>
                                <Label className="text-sm font-medium text-gray-700">Custom Rules</Label>
                              </div>
                              <Button
                                onClick={() => addRule(chapter.name)}
                                size="sm"
                                className="h-7 px-3 text-xs"
                              >
                                <Plus className="h-3 w-3 mr-1" />
                                Add Rule
                              </Button>
                            </div>

                            {rules.length === 0 ? (
                              <div className="text-center py-4 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                                <div className="w-6 h-6 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-2">
                                  <Sparkles className="h-3 w-3 text-gray-400" />
                                </div>
                                <p className="text-xs text-gray-600">No custom rules added</p>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                {rules.map((rule, idx) => (
                                  <div key={idx} className="p-3 bg-gray-50 rounded-lg border border-gray-200">
                                    {/* Rule Header */}
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="text-xs font-medium text-gray-700">Rule #{idx + 1}</span>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeRule(chapter.name, idx)}
                                        className="h-5 w-5 p-0 text-red-600 hover:text-red-700"
                                      >
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                    
                                    {/* Horizontal Rule Inputs */}
                                    <div className="grid grid-cols-12 gap-2 items-end">
                                      {/* Tag Selection */}
                                      <div className="col-span-4">
                                        <Label className="text-xs text-gray-600">Tag</Label>
                                        <Select 
                                          value={rule.tag ?? 'any'} 
                                          onValueChange={(v) => updateRule(chapter.name, idx, { tag: v === 'any' ? null : v })}
                                        >
                                          <SelectTrigger className="h-7 text-xs">
                                            <SelectValue placeholder="Any" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="any">Any</SelectItem>
                                            {chapter.tags.filter(Boolean).map((t: string) => (
                                              <SelectItem key={t} value={t}>{t}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {/* Difficulty Selection */}
                                      <div className="col-span-4">
                                        <Label className="text-xs text-gray-600">Difficulty</Label>
                                        <Select 
                                          value={rule.difficulty ?? 'any'} 
                                          onValueChange={(v) => updateRule(chapter.name, idx, { difficulty: v === 'any' ? null : v })}
                                        >
                                          <SelectTrigger className="h-7 text-xs">
                                            <SelectValue placeholder="Any" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            <SelectItem value="any">Any</SelectItem>
                                            {difficultyLevels.map((d) => (
                                              <SelectItem key={d} value={d}>{d}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {/* Quantity Input */}
                                      <div className="col-span-3">
                                        <Label className="text-xs text-gray-600">Qty</Label>
                                        <Input
                                          type="number"
                                          min={0}
                                          value={rule.quantity}
                                          onChange={(e) => updateRule(chapter.name, idx, { quantity: Number(e.target.value) })}
                                          placeholder="0"
                                          className="h-7 text-xs"
                                        />
                                      </div>

                                      {/* Delete Button */}
                                      <div className="col-span-1 flex items-end">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => removeRule(chapter.name, idx)}
                                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                                        >
                                          <Trash2 className="h-3 w-3" />
                                        </Button>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer Summary */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Total Questions:</span>
                <span className="font-semibold text-gray-900">{totalQuestions}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">Chapters:</span>
                <span className="font-semibold text-gray-900">
                  {Object.keys(blueprint).filter(ch => {
                    const chState = blueprint[ch]
                    return chState && ((chState.random || 0) > 0 || (chState.rules?.length || 0) > 0)
                  }).length}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel (50%) - Live Blueprint Summary */}
        <div className="w-1/2 flex flex-col bg-white">
          {/* Header with Preset Management */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Blueprint Summary</h2>
                <p className="text-gray-600 mt-1">Real-time overview of your test configuration</p>
              </div>
              
              {/* Preset Management */}
              <div className="flex items-center space-x-3">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowLoadPreset(!showLoadPreset)}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Load Preset</span>
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSavePreset(!showSavePreset)}
                  className="flex items-center space-x-2"
                  disabled={totalQuestions === 0}
                >
                  <Save className="h-4 w-4" />
                  <span>Save Preset</span>
                </Button>
              </div>
            </div>

            {/* Preset Dropdown */}
            {showLoadPreset && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-3">Load from Preset</h3>
                {presets.length === 0 ? (
                  <p className="text-gray-500 text-sm">No presets saved yet</p>
                ) : (
                  <div className="space-y-2">
                    {presets.map(preset => (
                      <div key={preset.id} className="flex items-center justify-between p-3 bg-white rounded-lg border">
                        <div className="flex items-center space-x-3">
                          <FileText className="h-4 w-4 text-gray-400" />
                          <div>
                            <p className="font-medium text-gray-900">{preset.name}</p>
                            <p className="text-sm text-gray-500">
                              {new Date(preset.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => loadPreset(preset)}
                          >
                            Load
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => deletePreset(preset.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Save Preset Form */}
            {showSavePreset && (
              <div className="mb-4 p-4 bg-gray-50 rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-3">Save Current Blueprint</h3>
                <div className="flex items-center space-x-3">
                  <Input
                    placeholder="Enter preset name..."
                    value={presetName}
                    onChange={(e) => setPresetName(e.target.value)}
                    className="flex-1"
                  />
                  <Button onClick={savePreset} disabled={!presetName.trim()}>
                    Save
                  </Button>
                  <Button variant="outline" onClick={() => setShowSavePreset(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            )}
          </div>

          {/* Live Summary Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {totalQuestions === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Target className="h-10 w-10 text-gray-400" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 mb-2">No Rules Configured</h3>
                  <p className="text-gray-600 max-w-sm">
                    Start by selecting a chapter and adding questions to see your blueprint summary here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {Object.keys(blueprint)
                  .filter(chapterName => {
                    const chState = blueprint[chapterName]
                    return chState && ((chState.random || 0) > 0 || (chState.rules?.length || 0) > 0)
                  })
                  .map(chapterName => {
                    const chState = blueprint[chapterName]
                    const chapterInfo = chapters.find(ch => ch.name === chapterName)
                    
                    return (
                      <Card key={chapterName}>
                        <CardHeader>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-blue-100 rounded-lg flex items-center justify-center">
                                <BookOpen className="h-4 w-4 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold text-gray-900">{chapterName}</h3>
                                <p className="text-sm text-gray-600">
                                  {chapterInfo?.available} questions available
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500">Total Selected</div>
                              <div className="text-xl font-bold text-blue-600">
                                {(chState.random || 0) + (chState.rules?.reduce((sum, r) => sum + (r.quantity || 0), 0) || 0)}
                              </div>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent>
                          <div className="space-y-4">
                            {/* Random Questions Summary */}
                            {(chState.random || 0) > 0 && (
                              <div className="flex items-center space-x-3 p-3 bg-green-50 rounded-lg border border-green-200">
                                <div className="w-6 h-6 bg-green-100 rounded-lg flex items-center justify-center">
                                  <Zap className="h-3 w-3 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-medium text-green-900">Random Questions</p>
                                  <p className="text-sm text-green-700">Quantity: {chState.random}</p>
                                </div>
                              </div>
                            )}

                            {/* Custom Rules Summary */}
                            {chState.rules && chState.rules.length > 0 && (
                              <div className="space-y-3">
                                <h4 className="font-medium text-gray-900 flex items-center space-x-2">
                                  <Settings className="h-4 w-4 text-orange-600" />
                                  <span>Custom Rules</span>
                                </h4>
                                {chState.rules.map((rule, idx) => (
                                  <div key={idx} className="p-3 bg-orange-50 rounded-lg border border-orange-200">
                                    <div className="flex items-center justify-between mb-2">
                                      <span className="font-medium text-orange-900">Rule #{idx + 1}</span>
                                      <span className="text-sm font-semibold text-orange-700">
                                        Qty: {rule.quantity}
                                      </span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-sm">
                                      <div>
                                        <span className="text-orange-600">Tag:</span>
                                        <span className="ml-1 text-orange-900">
                                          {rule.tag || 'Any'}
                                        </span>
                                      </div>
                                      <div>
                                        <span className="text-orange-600">Difficulty:</span>
                                        <span className="ml-1 text-orange-900">
                                          {rule.difficulty || 'Any'}
                                        </span>
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Next Button */}
          <div className="flex-shrink-0 border-t border-gray-200 bg-white p-6">
            <div className="flex justify-end">
              <Button
                onClick={onNext}
                disabled={totalQuestions === 0 || isGenerating}
                className="flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Next: Review & Refine</span>
                    <ArrowLeft className="h-4 w-4 rotate-180" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
