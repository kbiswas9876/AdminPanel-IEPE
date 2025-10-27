'use client'

import React from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Flag, Bookmark } from 'lucide-react'
import { getNuancedPerformanceState, ADVANCED_TIME_THRESHOLDS, type AdvancedDifficulty } from '@/lib/utils/speed-calculator'

interface SolutionUnifiedHeaderProps {
  currentQuestion: number
  totalQuestions: number
  timeTakenSeconds: number
  status: 'correct' | 'incorrect' | 'skipped'
  difficulty: string | null
  isBookmarked: boolean
  onBack?: () => void
  onReport?: () => void
  onToggleBookmark?: () => void
  showBookmark?: boolean
}

const SolutionUnifiedHeader: React.FC<SolutionUnifiedHeaderProps> = ({
  currentQuestion,
  totalQuestions,
  timeTakenSeconds,
  status,
  difficulty,
  isBookmarked,
  onBack,
  onReport,
  onToggleBookmark,
  showBookmark = false  // Disabled by default for admin panel
}) => {
  const getStatusPillClasses = (s: 'correct' | 'incorrect' | 'skipped') => {
    switch (s) {
      case 'correct':
        return 'bg-green-500 text-white font-bold'
      case 'incorrect':
        return 'bg-red-600 text-white font-bold'
      case 'skipped':
        return 'bg-gray-500 text-white font-bold'
      default:
        return 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200'
    }
  }

  const getStatusLabel = (s: 'correct' | 'incorrect' | 'skipped') => {
    switch (s) {
      case 'correct':
        return 'Correct'
      case 'incorrect':
        return 'Incorrect'
      default:
        return 'Skipped'
    }
  }

  // Format time for display
  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const remainingSeconds = seconds % 60

    if (hours > 0) {
      return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
    }
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`
  }

  // Get target time based on difficulty
  const getTargetTime = (difficulty: string | null): number => {
    return ADVANCED_TIME_THRESHOLDS[difficulty as keyof typeof ADVANCED_TIME_THRESHOLDS] || ADVANCED_TIME_THRESHOLDS.default
  }

  // Get premium performance chip styling
  const getPremiumPerformanceChipStyle = (timeTakenSeconds: number, difficulty: string | null, status: string) => {
    const performanceState = getNuancedPerformanceState(
      timeTakenSeconds, 
      difficulty as AdvancedDifficulty, 
      status as 'correct' | 'incorrect' | 'skipped'
    )
    
    // Premium styling system with dynamic backgrounds and effects
    switch (performanceState) {
      case 'Slow':
        return {
          containerClass: 'bg-red-500 text-white shadow-lg shadow-red-200/50 dark:shadow-red-900/30',
          icon: '😞',
          label: 'SLOW',
          labelClass: 'font-bold text-sm uppercase tracking-wide'
        }
      case 'Superfast':
        return {
          containerClass: 'bg-green-500 text-white shadow-lg shadow-green-200/50 dark:shadow-green-900/30',
          icon: '😄',
          label: 'SUPERFAST',
          labelClass: 'font-bold text-sm uppercase tracking-wide'
        }
      case 'OnTime':
        return {
          containerClass: 'bg-green-500 text-white shadow-lg shadow-green-200/50 dark:shadow-green-900/30',
          icon: '🙂',
          label: 'ON TIME',
          labelClass: 'font-bold text-sm uppercase tracking-wide'
        }
      case 'OnTimeButNotCorrect':
        return {
          containerClass: 'bg-gray-500 text-white shadow-lg shadow-gray-200/50 dark:shadow-gray-900/30',
          icon: '😐',
          label: 'ON TIME BUT NOT CORRECT',
          labelClass: 'font-bold text-xs uppercase tracking-wide'
        }
      default:
        return {
          containerClass: 'bg-gray-500 text-white shadow-lg shadow-gray-200/50 dark:shadow-gray-900/30',
          icon: '⏱️',
          label: 'TIME',
          labelClass: 'font-bold text-sm uppercase tracking-wide'
        }
    }
  }

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-3 shadow-sm">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-4">
          {/* Left Zone */}
          <div className="flex items-center gap-3">
            {onBack && (
              <button 
                className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors" 
                aria-label="Back to analysis"
                onClick={onBack}
              >
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="text-sm font-medium text-slate-700 dark:text-slate-300">
              Question {currentQuestion} of {totalQuestions}
            </div>
            <div className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusPillClasses(status)}`}>
              {getStatusLabel(status)}
            </div>
          </div>

          {/* Center Zone - Performance Chip */}
          <div className={`flex items-center space-x-3 px-4 py-2 rounded-full transition-all duration-300 ${getPremiumPerformanceChipStyle(timeTakenSeconds, difficulty, status).containerClass}`}>
            {/* Icon */}
            <span className="text-lg flex-shrink-0">{getPremiumPerformanceChipStyle(timeTakenSeconds, difficulty, status).icon}</span>
            
            {/* Performance Label */}
            <span className={`${getPremiumPerformanceChipStyle(timeTakenSeconds, difficulty, status).labelClass} flex-shrink-0`}>
              {getPremiumPerformanceChipStyle(timeTakenSeconds, difficulty, status).label}
            </span>
            
            {/* Time Information */}
            <>
              {/* Separator */}
              <span className="text-white font-bold">|</span>
              
              <div className="flex items-center space-x-4 text-sm">
                {/* User's Time */}
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-white">Student:</span>
                  <span className="font-mono font-bold text-white text-base">
                    {formatTime(timeTakenSeconds)}
                  </span>
                </div>
                
                {/* Target Time */}
                <div className="flex items-center space-x-1">
                  <span className="font-medium text-white">Target:</span>
                  <span className="font-mono font-bold text-white text-base">
                    {formatTime(getTargetTime(difficulty))}
                  </span>
                </div>
              </div>
            </>
          </div>

          {/* Right Zone - Disabled for admin panel */}
          <div className="flex items-center gap-2">
            {showBookmark && onToggleBookmark && (
              <motion.button
                onClick={onToggleBookmark}
                className="relative px-3 py-2 rounded-xl border-2 transition-all duration-300 bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-500 dark:text-slate-400"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                title="Read-only"
                disabled
              >
                <div className="flex items-center gap-2">
                  <Bookmark size={16} fill="none" stroke="currentColor" strokeWidth={2} />
                  <span className="text-xs font-semibold">View Only</span>
                </div>
              </motion.button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

export default SolutionUnifiedHeader

