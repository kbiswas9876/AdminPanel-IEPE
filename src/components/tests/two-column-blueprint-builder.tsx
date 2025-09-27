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
  Circle,
  // Premium Apple-style icons
  Layers3,
  LayoutGrid,
  Compass,
  Library,
  GraduationCap,
  Shuffle,
  Filter,
  SlidersHorizontal,
  CloudDownload,
  Bookmark,
  PlusCircle,
  Grid3X3
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
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <Layers3 className="h-4 w-4 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-semibold text-gray-900">Create Mock Test</h1>
                <p className="text-sm text-gray-600">Design your test blueprint</p>
              </div>
            </div>
            
            {/* Compact Actions */}
            <div className="flex items-center space-x-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLoadPreset(!showLoadPreset)}
                className="h-8 px-4 bg-white border-gray-300 hover:border-blue-400 text-gray-700 font-medium rounded-lg transition-all duration-200"
              >
                <CloudDownload className="h-3 w-3 mr-2" />
                Load Preset
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSavePreset(!showSavePreset)}
                disabled={totalQuestions === 0}
                className="h-8 px-4 bg-white border-gray-300 hover:border-green-400 text-gray-700 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Bookmark className="h-3 w-3 mr-2" />
                Save Preset
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="flex-shrink-0 mx-8 mt-6 p-6 rounded-3xl bg-gradient-to-br from-red-50 to-red-100/50 border-2 border-red-200 shadow-lg backdrop-blur-sm">
          <p className="text-base font-bold text-red-800 tracking-tight">{error}</p>
        </div>
      )}

      {/* Main Content - Configuration & Live Summary Layout (50/50) */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Panel (50%) - Apple-style Configuration Panel */}
        <div className="w-1/2 border-r border-gray-200/60 bg-gradient-to-br from-gray-50/50 to-white flex flex-col">
          {/* Compact Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200/60">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                <LayoutGrid className="h-4 w-4 text-white" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Chapter Configuration</h2>
                <p className="text-sm text-gray-600">Tap a chapter to configure its rules</p>
              </div>
            </div>
          </div>

          {/* Compact Chapter Cards */}
          <div className="flex-1 overflow-y-auto p-4">
            <div className="space-y-2">
              {chapters.map((chapter) => {
                const { selectedCount, hasRules } = getChapterStatus(chapter)
                const isExpanded = selectedChapter === chapter.name
                const chState = blueprint[chapter.name] || {}
                const rules = chState.rules || []
                
                return (
                  <div 
                    key={chapter.name} 
                    className={`bg-white rounded-lg border transition-all duration-200 shadow-sm hover:shadow-md ${
                      isExpanded 
                        ? 'border-blue-200 shadow-md ring-1 ring-blue-100' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {/* Compact Chapter Header */}
                    <button
                      onClick={() => setSelectedChapter(isExpanded ? null : chapter.name)}
                      className="w-full p-3 text-left transition-all duration-200 hover:bg-gray-50/50 rounded-t-lg"
                    >
                        <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`w-2 h-2 rounded-full transition-colors duration-200 ${
                            hasRules ? 'bg-green-500' : 'bg-gray-300'
                          }`} />
                          <div>
                            <p className="font-medium text-gray-900 text-sm">{chapter.name}</p>
                            <p className="text-xs text-gray-500">{chapter.available} questions</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {selectedCount > 0 && (
                            <div className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                              {selectedCount}
                            </div>
                          )}
                          <div className={`transform transition-transform duration-200 ${
                            isExpanded ? 'rotate-180' : ''
                          }`}>
                            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                            </svg>
                          </div>
                        </div>
                      </div>
                    </button>

                    {/* Compact Expanded Configuration */}
                    {isExpanded && (
                      <div className="px-4 pb-4 border-t border-gray-200/40">
                        <div className="pt-4 space-y-4">
                          {/* Apple-style Random Questions */}
                          <div className="space-y-4">
                            <div className="flex items-center space-x-4">
                              <div className="relative w-10 h-10 rounded-[12px] flex items-center justify-center shadow-lg" style={{
                                background: 'linear-gradient(145deg, #22c55e 0%, #16a34a 100%)'
                              }}>
                                <div className="absolute inset-0 bg-white/10 rounded-[12px]"></div>
                                <Shuffle className="relative h-5 w-5 text-white" />
                              </div>
                              <Label className="text-base font-bold text-gray-900 tracking-tight">Random Questions</Label>
                            </div>
                            <div className="flex items-center space-x-5">
                              <Input
                                type="number"
                                min={0}
                                max={chapter.available}
                                value={(chState.random || 0).toString()}
                                onChange={(e) => setChapterRandom(chapter.name, parseInt(e.target.value) || 0)}
                                className="w-28 h-12 text-base font-semibold text-center border-gray-200 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
                              />
                              <span className="text-sm text-gray-600 font-bold bg-gray-100 px-3 py-2 rounded-xl">
                                Max: {chapter.available}
                              </span>
                            </div>
                          </div>

                          {/* Apple-style Custom Rules */}
                          <div className="space-y-5">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center space-x-4">
                              <div className="relative w-10 h-10 rounded-[12px] flex items-center justify-center shadow-lg" style={{
                                background: 'linear-gradient(145deg, #f97316 0%, #ea580c 100%)'
                              }}>
                                <div className="absolute inset-0 bg-white/10 rounded-[12px]"></div>
                                <SlidersHorizontal className="relative h-5 w-5 text-white" />
                              </div>
                                <Label className="text-base font-bold text-gray-900 tracking-tight">Custom Rules</Label>
                              </div>
                              <Button
                                onClick={() => addRule(chapter.name)}
                                className="h-11 px-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                              >
                                <PlusCircle className="h-4 w-4 mr-2" />
                                Add Rule
                              </Button>
                            </div>

                            {rules.length === 0 ? (
                              <div className="text-center py-10 bg-gradient-to-br from-gray-50/80 to-gray-100/30 rounded-3xl border-2 border-dashed border-gray-200 backdrop-blur-sm">
                                <div className="w-16 h-16 bg-gradient-to-br from-gray-200 to-gray-300 rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-sm">
                                  <Sparkles className="h-8 w-8 text-gray-500" />
                                </div>
                                <p className="text-base text-gray-700 font-bold mb-1">No custom rules added</p>
                                <p className="text-sm text-gray-500 font-medium">Add specific question selection criteria</p>
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
                                          <SelectTrigger className="h-12 text-sm font-semibold border-gray-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md">
                                            <SelectValue placeholder="Any tag" />
                                          </SelectTrigger>
                                          <SelectContent className="border-gray-300 rounded-2xl shadow-2xl backdrop-blur-sm">
                                            <SelectItem value="any" className="focus:bg-blue-50 rounded-xl m-1 font-medium">Any tag</SelectItem>
                                            {chapter.tags.filter(Boolean).map((t: string) => (
                                              <SelectItem key={t} value={t} className="focus:bg-blue-50 rounded-xl m-1 font-medium">{t}</SelectItem>
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
                                          <SelectTrigger className="h-12 text-sm font-semibold border-gray-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md">
                                            <SelectValue placeholder="Any difficulty" />
                                          </SelectTrigger>
                                          <SelectContent className="border-gray-300 rounded-2xl shadow-2xl backdrop-blur-sm">
                                            <SelectItem value="any" className="focus:bg-blue-50 rounded-xl m-1 font-medium">Any difficulty</SelectItem>
                                            {difficultyLevels.map((d) => (
                                              <SelectItem key={d} value={d} className="focus:bg-blue-50 rounded-xl m-1 font-medium">{d}</SelectItem>
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
                                          className="h-12 text-base font-semibold text-center border-gray-300 focus:border-blue-400 focus:ring-4 focus:ring-blue-100 rounded-2xl transition-all duration-300 shadow-sm hover:shadow-md"
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

        </div>

        {/* Right Panel (50%) - Apple-style Blueprint Summary */}
        <div className="w-1/2 flex flex-col bg-gradient-to-br from-white/95 to-blue-50/20">
          {/* Compact Header */}
          <div className="flex-shrink-0 p-4 border-b border-gray-200/60 bg-white/90 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-sm">
                  <Compass className="h-4 w-4 text-white" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Blueprint Summary</h2>
                  <p className="text-sm text-gray-600">Real-time overview of your test configuration</p>
                </div>
              </div>
              
              {/* Compact Stats */}
              <div className="flex items-center space-x-3">
                <div className="text-center px-3 py-2 rounded-lg border border-blue-200 bg-blue-50">
                  <div className="text-xs text-blue-600 font-medium">Questions</div>
                  <div className="text-lg font-bold text-blue-700">{totalQuestions}</div>
                </div>
                <div className="text-center px-3 py-2 rounded-lg border border-gray-200 bg-gray-50">
                  <div className="text-xs text-gray-600 font-medium">Chapters</div>
                  <div className="text-lg font-bold text-gray-700">
                    {Object.keys(blueprint).filter(ch => {
                      const chState = blueprint[ch]
                      return chState && ((chState.random || 0) > 0 || (chState.rules?.length || 0) > 0)
                    }).length}
                  </div>
                </div>
              </div>
            </div>

            {/* Compact Preset Dropdown */}
            {showLoadPreset && (
              <div className="mb-3 p-3 bg-gray-50 rounded-lg border">
                <h3 className="font-medium text-gray-900 mb-2 text-sm">Load from Preset</h3>
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

          {/* Compact Live Summary Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {totalQuestions === 0 ? (
              <div className="flex items-center justify-center h-full">
                <div className="text-center max-w-sm">
                  <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
                    <Compass className="h-12 w-12 text-gray-400" />
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-2">No Rules Configured</h3>
                  <p className="text-gray-500 text-sm">
                    Start by selecting a chapter and adding questions to see your blueprint summary here
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {Object.keys(blueprint)
                  .filter(chapterName => {
                    const chState = blueprint[chapterName]
                    return chState && ((chState.random || 0) > 0 || (chState.rules?.length || 0) > 0)
                  })
                  .map(chapterName => {
                    const chState = blueprint[chapterName]
                    const chapterInfo = chapters.find(ch => ch.name === chapterName)
                    
                    return (
                      <div 
                        key={chapterName} 
                        className="relative overflow-hidden transition-all duration-300 ease-out bg-white shadow-lg hover:shadow-xl rounded-2xl border border-gray-200/40 hover:border-blue-300/50 group"
                        style={{
                          background: 'linear-gradient(145deg, #ffffff 0%, #f8faff 100%)'
                        }}
                      >
                        {/* Premium Chapter Header */}
                        <div className="p-3 border-b border-gray-100/30">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="relative w-8 h-8 rounded-xl bg-gradient-to-br from-blue-500 via-blue-600 to-blue-700 flex items-center justify-center shadow-lg group-hover:shadow-xl transition-all duration-300">
                                <div className="absolute inset-0 bg-white/10 rounded-xl"></div>
                                <GraduationCap className="relative h-4 w-4 text-white" />
                              </div>
                              <div>
                                <h3 className="text-sm font-bold text-gray-900 tracking-tight group-hover:text-blue-900 transition-colors duration-300">{chapterName}</h3>
                                <p className="text-xs text-gray-500 font-medium">
                                  {chapterInfo?.available} questions available
                                </p>
                              </div>
                            </div>
                            <div 
                              className="relative text-center px-3 py-1 rounded-xl border border-blue-200/50 group-hover:border-blue-300/60 transition-all duration-300 shadow-sm"
                              style={{
                                background: 'linear-gradient(145deg, #eff6ff 0%, #dbeafe 100%)'
                              }}
                            >
                              <div className="text-xs text-blue-600 font-bold uppercase tracking-wider opacity-80">Selected</div>
                              <div className="text-lg font-black text-blue-700 tabular-nums">
                                {(chState.random || 0) + (chState.rules?.reduce((sum, r) => sum + (r.quantity || 0), 0) || 0)}
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        {/* Compact Content */}
                        <div className="p-3">
                          <div className="space-y-2">
                            {/* Premium Random Questions Summary */}
                            {(chState.random || 0) > 0 && (
                              <div 
                                className="relative flex items-center space-x-3 p-2 rounded-xl border border-green-200/40 shadow-sm transition-all duration-300 hover:shadow-md"
                                style={{
                                  background: 'linear-gradient(145deg, #f0fdf4 0%, #dcfce7 100%)'
                                }}
                              >
                                <div className="relative w-6 h-6 rounded-lg flex items-center justify-center shadow-sm" style={{
                                  background: 'linear-gradient(145deg, #22c55e 0%, #16a34a 100%)'
                                }}>
                                  <div className="absolute inset-0 bg-white/10 rounded-lg"></div>
                                  <Shuffle className="relative h-3 w-3 text-white" />
                                </div>
                                <div className="flex-1">
                                  <p className="font-bold text-green-900 tracking-tight text-sm">Random Questions</p>
                                  <p className="text-xs text-green-700 font-medium mt-0.5">Quantity: {chState.random}</p>
                                </div>
                                <div className="px-2 py-1 bg-green-200/60 text-green-800 rounded-full text-xs font-bold tabular-nums">
                                  {chState.random}
                                </div>
                              </div>
                            )}

                            {/* Premium Custom Rules Summary */}
                            {chState.rules && chState.rules.length > 0 && (
                              <div className="space-y-2">
                                <h4 className="font-bold text-gray-900 flex items-center space-x-2 tracking-tight text-sm">
                                  <div className="relative w-6 h-6 rounded-lg flex items-center justify-center shadow-sm" style={{
                                    background: 'linear-gradient(145deg, #f97316 0%, #ea580c 100%)'
                                  }}>
                                    <div className="absolute inset-0 bg-white/10 rounded-lg"></div>
                                    <Filter className="relative h-3 w-3 text-white" />
                                  </div>
                                  <span>Custom Rules ({chState.rules.length})</span>
                                </h4>
                                <div className="space-y-1">
                                  {chState.rules.map((rule, idx) => (
                                    <div 
                                      key={idx} 
                                      className="relative p-2 rounded-xl border border-orange-200/40 shadow-sm transition-all duration-300 hover:shadow-md"
                                      style={{
                                        background: 'linear-gradient(145deg, #fff7ed 0%, #fed7aa 100%)'
                                      }}
                                    >
                                      <div className="flex items-center justify-between mb-1">
                                        <span className="font-bold text-orange-900 tracking-tight text-sm">Rule #{idx + 1}</span>
                                        <div className="px-2 py-1 bg-orange-300/60 text-orange-900 rounded-full text-xs font-bold tabular-nums">
                                          {rule.quantity}
                                        </div>
                                      </div>
                                      <div className="grid grid-cols-2 gap-2 text-xs">
                                        <div className="flex items-center space-x-1">
                                          <Tag className="h-3 w-3 text-orange-600" />
                                          <span className="text-orange-700 font-medium">Tag:</span>
                                          <span className="text-orange-900 font-bold tracking-tight">
                                            {rule.tag || 'Any'}
                                          </span>
                                        </div>
                                        <div className="flex items-center space-x-1">
                                          <Award className="h-3 w-3 text-orange-600" />
                                          <span className="text-orange-700 font-medium">Difficulty:</span>
                                          <span className="text-orange-900 font-bold tracking-tight">
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
          <div className="flex-shrink-0 border-t border-gray-200/60 bg-white/95 backdrop-blur-xl p-7">
            <div className="flex justify-end">
              <Button
                onClick={onNext}
                disabled={totalQuestions === 0 || isGenerating}
                className="h-14 px-10 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold rounded-3xl transition-all duration-300 shadow-2xl hover:shadow-3xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-4 transform hover:scale-105 disabled:transform-none disabled:hover:shadow-2xl"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-3 border-white border-t-transparent"></div>
                    <span className="text-lg">Generating...</span>
                  </>
                ) : (
                  <>
                    <span className="text-lg">Next: Review & Refine</span>
                    <ArrowLeft className="h-6 w-6 rotate-180" />
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