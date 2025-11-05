'use client'

import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { CheckCircle2, XCircle, Clock, Target, TrendingUp, Award, Zap, Activity } from 'lucide-react'
import type { QuestionInsight } from '@/lib/types/question-insights'
import KatexRenderer from '@/components/ui/KatexRenderer'
import { getQuestionStudentDetails } from '@/lib/actions/question-student-details'
import type { QuestionStudentDetail } from '@/lib/actions/question-student-details'
import QuestionDetailsModal from './QuestionDetailsModal'

function formatMmSs(seconds: number | null): string {
  if (seconds == null) return '—'
  const m = Math.floor(seconds / 60)
  const s = seconds % 60
  return `${m}m ${s}s`
}

interface QuestionInsightCardProps {
  insight: QuestionInsight
  testId: number
  index?: number
}

export default function QuestionInsightCard({ insight, testId, index = 0 }: QuestionInsightCardProps) {
  const { counts, times } = insight
  const totalAttempted = counts.correct + counts.incorrect

  // Modal state
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [modalData, setModalData] = useState<QuestionStudentDetail[]>([])
  const [modalCategory, setModalCategory] = useState<'Correct' | 'Incorrect' | 'Skipped'>('Correct')
  const [isLoading, setIsLoading] = useState(false)

  const handleStatClick = async (category: 'Correct' | 'Incorrect' | 'Skipped') => {
    setIsLoading(true)
    try {
      const allStudentDetails = await getQuestionStudentDetails(testId, insight.questionId)
      const filteredData = allStudentDetails.filter(student => {
        if (category === 'Correct') return student.status === 'correct'
        if (category === 'Incorrect') return student.status === 'incorrect'
        if (category === 'Skipped') return student.status === 'skipped'
        return false
      })
      setModalData(filteredData)
      setModalCategory(category)
      setIsModalOpen(true)
    } catch (error) {
      console.error('Error fetching student details:', error)
      setModalData([])
      setModalCategory(category)
      setIsModalOpen(true)
    } finally {
      setIsLoading(false)
    }
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'Easy': 'bg-green-50 text-green-700 border-green-200',
      'Easy-Moderate': 'bg-lime-50 text-lime-700 border-lime-200',
      'Moderate': 'bg-yellow-50 text-yellow-700 border-yellow-200',
      'Moderate-Hard': 'bg-orange-50 text-orange-700 border-orange-200',
      'Hard': 'bg-red-50 text-red-700 border-red-200',
    }
    return colors[difficulty] || 'bg-slate-50 text-slate-700 border-slate-200'
  }

  const getRealizedDifficultyColor = (difficulty: string) => {
    const colors: Record<string, string> = {
      'Easy': 'bg-green-500 text-white border-green-600',
      'Easy-Moderate': 'bg-lime-500 text-white border-lime-600',
      'Moderate': 'bg-yellow-500 text-white border-yellow-600',
      'Moderate-Hard': 'bg-orange-500 text-white border-orange-600',
      'Hard': 'bg-red-500 text-white border-red-600',
    }
    return colors[difficulty] || 'bg-slate-500 text-white border-slate-600'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="bg-white rounded-2xl shadow-md overflow-hidden"
    >
      {/* Card Header */}
      <div className="px-6 py-4 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-3">
              <span className="text-sm font-semibold text-indigo-600">Question {insight.questionNumber ?? '—'}</span>
              {insight.topic && (
                <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 text-xs font-medium rounded-full">
                  {insight.topic}
                </span>
              )}
              {insight.difficultyOriginal && (
                <span className={`px-2.5 py-0.5 text-xs font-medium rounded-full ${getDifficultyColor(insight.difficultyOriginal)}`}>
                  {insight.difficultyOriginal}
                </span>
              )}
            </div>
            <div className="prose prose-slate max-w-none text-slate-900 text-base leading-relaxed min-h-[80px]">
              <KatexRenderer content={insight.questionText} />
            </div>
          </div>
        </div>
      </div>

      {/* Answer Options */}
      <div className="p-6">
        {insight.options && (
          <div className="grid grid-cols-2 gap-3 mb-6">
            {Object.entries(insight.options).map(([key, val]) => {
              const isCorrect = insight.correctOption?.toLowerCase() === key.toLowerCase()
              return (
                <div key={key} className="relative group">
                  <div className={`flex items-center gap-3 rounded-xl p-4 transition-all ${
                    isCorrect
                      ? 'bg-emerald-50 shadow-sm'
                      : 'bg-white shadow-sm hover:shadow-md cursor-pointer hover:scale-[1.01]'
                  }`}>
                    <div className="flex items-center gap-3 flex-1">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm flex-shrink-0 shadow-sm ${
                        isCorrect ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-800 border border-slate-300'
                      }`}>
                        {key.toUpperCase()}
                      </div>
                      <span className={`font-medium ${isCorrect ? 'text-slate-900' : 'text-slate-700'}`}>
                        <KatexRenderer content={val} />
                      </span>
                    </div>
                    {isCorrect && (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}

        {/* Stats Row */}
        <div className="flex items-center gap-4 mb-6 p-4 bg-slate-50 rounded-xl shadow-sm">
          <motion.button
            onClick={() => handleStatClick('Correct')}
            disabled={isLoading || counts.correct === 0}
            whileHover={counts.correct > 0 ? { scale: 1.02 } : {}}
            whileTap={counts.correct > 0 ? { scale: 0.98 } : {}}
            className={`flex items-center gap-2 flex-1 px-4 py-3 rounded-lg transition-all duration-200 ${
              counts.correct === 0
                ? 'opacity-50 cursor-not-allowed bg-white border border-slate-200'
                : 'cursor-pointer bg-white border-2 border-emerald-200 hover:border-emerald-300 hover:bg-emerald-50 hover:shadow-md active:bg-emerald-100'
            }`}
          >
            <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Correct</p>
              <p className="text-sm font-semibold text-slate-900">{counts.correct}</p>
            </div>
          </motion.button>

          <div className="w-px h-8 bg-slate-200"></div>

          <motion.button
            onClick={() => handleStatClick('Incorrect')}
            disabled={isLoading || counts.incorrect === 0}
            whileHover={counts.incorrect > 0 ? { scale: 1.02 } : {}}
            whileTap={counts.incorrect > 0 ? { scale: 0.98 } : {}}
            className={`flex items-center gap-2 flex-1 px-4 py-3 rounded-lg transition-all duration-200 ${
              counts.incorrect === 0
                ? 'opacity-50 cursor-not-allowed bg-white border border-slate-200'
                : 'cursor-pointer bg-white border-2 border-red-200 hover:border-red-300 hover:bg-red-50 hover:shadow-md active:bg-red-100'
            }`}
          >
            <div className="w-8 h-8 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Incorrect</p>
              <p className="text-sm font-semibold text-slate-900">{counts.incorrect}</p>
            </div>
          </motion.button>

          <div className="w-px h-8 bg-slate-200"></div>

          <motion.button
            onClick={() => handleStatClick('Skipped')}
            disabled={isLoading || counts.skipped === 0}
            whileHover={counts.skipped > 0 ? { scale: 1.02 } : {}}
            whileTap={counts.skipped > 0 ? { scale: 0.98 } : {}}
            className={`flex items-center gap-2 flex-1 px-4 py-3 rounded-lg transition-all duration-200 ${
              counts.skipped === 0
                ? 'opacity-50 cursor-not-allowed bg-white border border-slate-200'
                : 'cursor-pointer bg-white border-2 border-amber-200 hover:border-amber-300 hover:bg-amber-50 hover:shadow-md active:bg-amber-100'
            }`}
          >
            <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center">
              <Activity className="w-4 h-4 text-amber-600" />
            </div>
            <div>
              <p className="text-xs text-slate-500">Skipped</p>
              <p className="text-sm font-semibold text-slate-900">{counts.skipped}</p>
            </div>
          </motion.button>

          <div className="ml-auto flex items-center gap-2 px-3 py-2 bg-white rounded-lg shadow-sm">
            <Award className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-medium text-slate-700">{insight.correctnessPct}% Accuracy</span>
          </div>
        </div>

        {/* Performance Metrics */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-gradient-to-br from-violet-50 to-violet-100 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-3.5 h-3.5 text-violet-600" />
              <span className="text-xs font-medium text-violet-700">Avg (all)</span>
            </div>
            <p className="text-xl font-bold text-violet-900">{formatMmSs(times.avgTimeAllSec)}</p>
          </div>
          <div className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Target className="w-3.5 h-3.5 text-emerald-600" />
              <span className="text-xs font-medium text-emerald-700">Avg (correct)</span>
            </div>
            <p className="text-xl font-bold text-emerald-900">{formatMmSs(times.avgTimeCorrectSec)}</p>
          </div>
          <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-xl p-3.5 shadow-sm">
            <div className="flex items-center gap-2 mb-1">
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span className="text-xs font-medium text-amber-700">Best time</span>
            </div>
            <p className="text-xl font-bold text-amber-900">{formatMmSs(times.bestTimeCorrectSec)}</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-medium text-slate-700">Progress</span>
            <span className="text-xs text-slate-500">{totalAttempted} attempted</span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${insight.correctnessPct}%` }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className={`h-full bg-gradient-to-r rounded-full ${
                insight.correctnessPct >= 70
                  ? 'from-emerald-500 to-emerald-600'
                  : insight.correctnessPct >= 40
                  ? 'from-yellow-500 to-yellow-600'
                  : 'from-red-500 to-red-600'
              }`}
            />
          </div>
        </div>

        {/* Performance Analysis */}
        <div className="flex items-start gap-3 p-3 bg-blue-50 rounded-xl shadow-sm">
          <TrendingUp className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
          <p className="text-xs text-blue-900">
            <span className="font-semibold">Performance Analysis:</span> {insight.feedback}
          </p>
        </div>
      </div>

      {/* Modal */}
      <QuestionDetailsModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        questionText={insight.questionText}
        questionNumber={insight.questionNumber}
        category={modalCategory}
        studentData={modalData}
      />
    </motion.div>
  )
}


