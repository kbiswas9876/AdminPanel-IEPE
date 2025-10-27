'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SolutionNavigationFooterProps {
  onPrev: () => void
  onNext: () => void
  canPrev: boolean
  canNext: boolean
  currentIndex: number
  totalQuestions: number
  filteredPosition?: number
  filteredTotal?: number
}

const SolutionNavigationFooter: React.FC<SolutionNavigationFooterProps> = ({
  onPrev,
  onNext,
  canPrev,
  canNext,
  currentIndex,
  totalQuestions,
  filteredPosition,
  filteredTotal
}) => {
  const displayPosition = filteredPosition ?? (currentIndex + 1)
  const displayTotal = filteredTotal ?? totalQuestions
  const progressPercentage = (displayPosition / displayTotal) * 100

  return (
    <div className="sticky bottom-0 bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 px-6 py-4 shadow-lg">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-between gap-2">
          {/* Left: Previous Button */}
          <div className="flex-shrink-0">
            <motion.button 
              className={`
                inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200
                ${!canPrev 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60' 
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-600 hover:bg-blue-50 dark:hover:bg-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400 shadow-sm hover:shadow-md'
                }
              `}
              onClick={onPrev}
              disabled={!canPrev}
              whileHover={canPrev ? { scale: 1.02, y: -1 } : {}}
              whileTap={canPrev ? { scale: 0.98 } : {}}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="hidden sm:inline">Previous</span>
              <span className="sm:hidden">Prev</span>
            </motion.button>
          </div>
          
          {/* Center: Progress Info */}
          <div className="flex items-center gap-2 flex-1 justify-center">
            <span className="text-sm font-semibold text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-lg border border-slate-300 dark:border-slate-600">
              {displayPosition} of {displayTotal}
            </span>
            <div className="flex items-center gap-2">
              <div className="w-16 h-2 rounded-full bg-slate-200 dark:bg-slate-700 overflow-hidden shadow-inner">
                <motion.div
                  className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                  initial={{ width: 0 }}
                  animate={{ width: `${progressPercentage}%` }}
                  transition={{ duration: 0.5, ease: "easeOut" }}
                />
              </div>
              <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400 min-w-[2.5rem] text-right">
                {Math.round(progressPercentage)}%
              </span>
            </div>
          </div>
          
          {/* Right: Next Button */}
          <div className="flex-shrink-0">
            <motion.button 
              className={`
                inline-flex items-center gap-1.5 px-3 py-2 rounded-lg font-semibold text-sm transition-all duration-200
                ${!canNext 
                  ? 'bg-slate-100 dark:bg-slate-800 text-slate-400 dark:text-slate-500 border border-slate-200 dark:border-slate-700 cursor-not-allowed opacity-60' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg border border-blue-500'
                }
              `}
              onClick={onNext}
              disabled={!canNext}
              whileHover={canNext ? { scale: 1.02, y: -1 } : {}}
              whileTap={canNext ? { scale: 0.98 } : {}}
            >
              <span className="hidden sm:inline">Next</span>
              <span className="sm:hidden">Next</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </motion.button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SolutionNavigationFooter

