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
    <div className="h-full flex flex-col bg-gradient-to-br from-gray-50 to-white">
      {/* Apple-style Header */}
      <div className="flex-shrink-0 bg-white/80 backdrop-blur-xl border-b border-gray-200/60 shadow-sm">
        <div className="px-8 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">Create Mock Test</h1>
                <p className="text-sm text-gray-600 font-medium">Design your test blueprint</p>
              </div>
            </div>
            
            {/* Apple-style Actions */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoadPreset(!showLoadPreset)}
                className="h-9 px-4 bg-white/80 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
              >
                <Download className="h-4 w-4 mr-2" />
                Load Preset
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSavePreset(!showSavePreset)}
                disabled={totalQuestions === 0}
                className="h-9 px-4 bg-white/80 border-gray-200 hover:bg-gray-50 hover:border-gray-300 text-gray-700 font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save className="h-4 w-4 mr-2" />
                Save Preset
              </Button>
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
        {/* Left Panel (50%) - Apple-style Configuration Panel */}
        <div className="w-1/2 border-r border-gray-200/60 bg-gradient-to-br from-gray-50/50 to-white flex flex-col">
          {/* Apple-style Header */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200/60">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center">
                <Settings className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900 tracking-tight">Chapter Configuration</h2>
                <p className="text-sm text-gray-600 font-medium">Tap a chapter to configure its rules</p>
              </div>
            </div>
          </div>

          {/* Apple-style Chapter Cards */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-4">
              {chapters.map((chapter) => {
                const { selectedCount, hasRules } = getChapterStatus(chapter)
                const isExpanded = selectedChapter === chapter.name
                const chState = blueprint[chapter.name] || {}
                const rules = chState.rules || []
                
                return (
                  <div 
                    key={chapter.name} 
                    className={`bg-white rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-lg ${
                      isExpanded 
                        ? 'border-blue-200 shadow-lg ring-1 ring-blue-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Apple-style Chapter Header */}
                    <button
                      onClick={() => setSelectedChapter(isExpanded ? null : chapter.name)}
                      className="w-full p-5 text-left transition-all duration-200 hover:bg-gray-50/50 rounded-t-2xl"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                          <div className={`w-3 h-3 rounded-full transition-colors duration-200 ${
                            hasRules ? 'bg-green-500 shadow-green-200 shadow-sm' : 'bg-gray-300'
                          }`} />
                          <div>
                            <p className="font-semibold text-gray-900 text-base">{chapter.name}</p>
                            <p className="text-sm text-gray-600 font-medium">{chapter.available} questions available</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          {selectedCount > 0 && (
                            <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-semibold">
                              {selectedCount} selected
                            </div>
                          )}
                          <div className={`transform transition-transform duration-300 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}>
                            <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Apple-style Expanded Configuration */}
                    {isExpanded && (
                      <div className="px-6 pb-6 border-t border-gray-100/60">
                        <div className="pt-6 space-y-6">
                          {/* Apple-style Random Questions */}
                          <div className="space-y-3">
                            <div className="flex items-center space-x-3">
                              <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-green-100 to-green-50 flex items-center justify-center">
                                <Zap className="h-3.5 w-3.5 text-green-600" />
                              </div>
                              <Label className="text-sm font-semibold text-gray-900">Random Questions</Label>
                            </div>
                            <div className="flex items-center space-x-4">
                              <Input
                                type="number"
                                min={0}
                                max={chapter.available}
                                value={(chState.random || 0).toString()}
                                onChange={(e) => setChapterRandom(chapter.name, parseInt(e.target.value) || 0)}
                                className="w-24 h-10 text-sm border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200"
                              />
                              <span className="text-sm text-gray-500 font-medium">
                                Max: {chapter.available}
                              </span>
                            </div>
                          </div>

                          {/* Apple-style Custom Rules */}
                          <div className="space-y-4">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-3">
                                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-orange-100 to-orange-50 flex items-center justify-center">
                                  <Settings className="h-3.5 w-3.5 text-orange-600" />
                                </div>
                                <Label className="text-sm font-semibold text-gray-900">Custom Rules</Label>
                              </div>
                              <Button
                                onClick={() => addRule(chapter.name)}
                                className="h-9 px-4 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md"
                              >
                                <Plus className="h-4 w-4 mr-2" />
                                Add Rule
                              </Button>
                            </div>

                            {rules.length === 0 ? (
                              <div className="text-center py-8 bg-gradient-to-br from-gray-50 to-gray-100/50 rounded-2xl border-2 border-dashed border-gray-200">
                                <div className="w-12 h-12 bg-gray-200 rounded-2xl flex items-center justify-center mx-auto mb-3">
                                  <Sparkles className="h-6 w-6 text-gray-400" />
                                </div>
                                <p className="text-sm text-gray-600 font-medium">No custom rules added</p>
                                <p className="text-xs text-gray-500 mt-1">Add specific question selection criteria</p>
                              </div>
                            ) : (
                              <div className="space-y-3">
                                {rules.map((rule, idx) => (
                                  <div key={idx} className="p-4 bg-gradient-to-br from-white to-gray-50/50 rounded-2xl border border-gray-200 shadow-sm">
                                    {/* Apple-style Rule Header */}
                                    <div className="flex items-center justify-between mb-4">
                                      <div className="flex items-center space-x-2">
                                        <div className="w-6 h-6 bg-blue-100 rounded-lg flex items-center justify-center">
                                          <Hash className="h-3 w-3 text-blue-600" />
                                        </div>
                                        <span className="text-sm font-semibold text-gray-900">Rule #{idx + 1}</span>
                                      </div>
                                      <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => removeRule(chapter.name, idx)}
                                        className="h-8 w-8 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300 rounded-lg transition-all duration-200"
                                      >
                                        <Trash2 className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    
                                    {/* Apple-style Horizontal Rule Inputs */}
                                    <div className="grid grid-cols-12 gap-3 items-end">
                                      {/* Tag Selection */}
                                      <div className="col-span-4">
                                        <Label className="text-xs font-semibold text-gray-700 mb-2 block">Tag</Label>
                                        <Select 
                                          value={rule.tag ?? 'any'} 
                                          onValueChange={(v) => updateRule(chapter.name, idx, { tag: v === 'any' ? null : v })}
                                        >
                                          <SelectTrigger className="h-10 text-sm border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200">
                                            <SelectValue placeholder="Any tag" />
                                          </SelectTrigger>
                                          <SelectContent className="border-gray-200 rounded-xl shadow-lg">
                                            <SelectItem value="any" className="focus:bg-blue-50">Any tag</SelectItem>
                                            {chapter.tags.filter(Boolean).map((t: string) => (
                                              <SelectItem key={t} value={t} className="focus:bg-blue-50">{t}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {/* Difficulty Selection */}
                                      <div className="col-span-4">
                                        <Label className="text-xs font-semibold text-gray-700 mb-2 block">Difficulty</Label>
                                        <Select 
                                          value={rule.difficulty ?? 'any'} 
                                          onValueChange={(v) => updateRule(chapter.name, idx, { difficulty: v === 'any' ? null : v })}
                                        >
                                          <SelectTrigger className="h-10 text-sm border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200">
                                            <SelectValue placeholder="Any difficulty" />
                                          </SelectTrigger>
                                          <SelectContent className="border-gray-200 rounded-xl shadow-lg">
                                            <SelectItem value="any" className="focus:bg-blue-50">Any difficulty</SelectItem>
                                            {difficultyLevels.map((d) => (
                                              <SelectItem key={d} value={d} className="focus:bg-blue-50">{d}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>

                                      {/* Quantity Input */}
                                      <div className="col-span-3">
                                        <Label className="text-xs font-semibold text-gray-700 mb-2 block">Quantity</Label>
                                        <Input
                                          type="number"
                                          min={0}
                                          value={rule.quantity}
                                          onChange={(e) => updateRule(chapter.name, idx, { quantity: Number(e.target.value) })}
                                          placeholder="0"
                                          className="h-10 text-sm border-gray-200 focus:border-blue-300 focus:ring-2 focus:ring-blue-100 rounded-xl transition-all duration-200"
                                        />
                                      </div>

                                      {/* Delete Button */}
                                      <div className="col-span-1 flex items-end">
                                        <Button
                                          variant="outline"
                                          size="sm"
                                          onClick={() => removeRule(chapter.name, idx)}
                                          className="h-10 w-10 p-0 text-red-500 hover:text-red-600 hover:bg-red-50 border-red-200 hover:border-red-300 rounded-xl transition-all duration-200"
                                        >
                                          <Trash2 className="h-4 w-4" />
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

        {/* Right Panel (50%) - Apple-style Blueprint Summary */}
        <div className="w-1/2 flex flex-col bg-gradient-to-br from-white to-gray-50/30">
          {/* Apple-style Header */}
          <div className="flex-shrink-0 p-6 border-b border-gray-200/60 bg-white/80 backdrop-blur-sm">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-sm">
                  <Target className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 tracking-tight">Blueprint Summary</h2>
                  <p className="text-sm text-gray-600 font-medium">Real-time overview of your test configuration</p>
                </div>
              </div>
              
              {/* Apple-style Stats */}
              <div className="flex items-center space-x-4">
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-medium">Total Questions</div>
                  <div className="text-2xl font-bold text-blue-600">{totalQuestions}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 font-medium">Chapters</div>
                  <div className="text-2xl font-bold text-gray-900">
                    {Object.keys(blueprint).filter(ch => {
                      const chState = blueprint[ch]
                      return chState && ((chState.random || 0) > 0 || (chState.rules?.length || 0) > 0)
                    }).length}
                  </div>
                </div>
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

          {/* Apple-style Live Summary Content */}
          <div className="flex-1 overflow-y-auto p-6">
            {totalQuestions === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-24 h-24 bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-sm">
                    <Target className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">No Rules Configured</h3>
                  <p className="text-gray-600 max-w-sm font-medium">
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
                      <div key={chapterName} className="bg-white rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200">
                        {/* Apple-style Chapter Header */}
                        <div className="p-6 border-b border-gray-100/60">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center shadow-sm">
                                <BookOpen className="h-5 w-5 text-blue-600" />
                              </div>
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">{chapterName}</h3>
                                <p className="text-sm text-gray-600 font-medium">
                                  {chapterInfo?.available} questions available
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-gray-500 font-medium">Total Selected</div>
                              <div className="text-2xl font-bold text-blue-600">
                                {(chState.random || 0) + (chState.rules?.reduce((sum, r) => sum + (r.quantity || 0), 0) || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Apple-style Content */}
                        <div className="p-6">
                          <div className="space-y-4">
                            {/* Apple-style Random Questions Summary */}
                            {(chState.random || 0) > 0 && (
                              <div className="flex items-center space-x-4 p-4 bg-gradient-to-br from-green-50 to-green-100/50 rounded-2xl border border-green-200/60">
                                <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
                                  <Zap className="h-4 w-4 text-green-600" />
                                </div>
                                <div>
                                  <p className="font-semibold text-green-900">Random Questions</p>
                                  <p className="text-sm text-green-700 font-medium">Quantity: {chState.random}</p>
                                </div>
                              </div>
                            )}

                            {/* Apple-style Custom Rules Summary */}
                            {chState.rules && chState.rules.length > 0 && (
                              <div className="space-y-4">
                                <h4 className="font-semibold text-gray-900 flex items-center space-x-3">
                                  <div className="w-6 h-6 bg-orange-100 rounded-lg flex items-center justify-center">
                                    <Settings className="h-3.5 w-3.5 text-orange-600" />
                                  </div>
                                  <span>Custom Rules</span>
                                </h4>
                                <div className="space-y-3">
                                  {chState.rules.map((rule, idx) => (
                                    <div key={idx} className="p-4 bg-gradient-to-br from-orange-50 to-orange-100/50 rounded-2xl border border-orange-200/60">
                                      <div className="flex items-center justify-between mb-3">
                                        <span className="font-semibold text-orange-900">Rule #{idx + 1}</span>
                                        <span className="px-3 py-1 bg-orange-200 text-orange-800 rounded-full text-sm font-semibold">
                                          Qty: {rule.quantity}
                                        </span>
                                      </div>
                                      <div className="grid grid-cols-2 gap-4 text-sm">
                                        <div className="flex items-center space-x-2">
                                          <Tag className="h-4 w-4 text-orange-600" />
                                          <span className="text-orange-700 font-medium">Tag:</span>
                                          <span className="text-orange-900 font-semibold">
                                            {rule.tag || 'Any'}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                          <Award className="h-4 w-4 text-orange-600" />
                                          <span className="text-orange-700 font-medium">Difficulty:</span>
                                          <span className="text-orange-900 font-semibold">
                                            {rule.difficulty || 'Any'}
                                          </span>
                                        </div>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </div>

          {/* Apple-style Footer CTA */}
          <div className="flex-shrink-0 border-t border-gray-200/60 bg-white/80 backdrop-blur-sm p-6">
            <div className="flex justify-end">
              <Button
                onClick={onNext}
                disabled={totalQuestions === 0 || isGenerating}
                className="h-12 px-8 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-2xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-3"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <span>Next: Review & Refine</span>
                    <ArrowLeft className="h-5 w-5 rotate-180" />
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