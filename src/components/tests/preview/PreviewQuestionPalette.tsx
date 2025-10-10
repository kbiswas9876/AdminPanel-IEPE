'use client'

import { motion } from 'framer-motion'

export type PreviewQuestionStatus = 'not_visited' | 'unanswered' | 'answered' | 'current'

interface PreviewQuestionPaletteProps {
  totalQuestions: number
  currentIndex: number
  questionStatuses: PreviewQuestionStatus[]
  onQuestionSelect: (index: number) => void
}

export default function PreviewQuestionPalette({
  totalQuestions,
  currentIndex,
  questionStatuses,
  onQuestionSelect
}: PreviewQuestionPaletteProps) {
  const getQuestionColor = (index: number) => {
    const status = questionStatuses[index]
    
    switch (status) {
      case 'not_visited':
        return 'bg-slate-400 text-white border-slate-400'
      case 'answered':
        return 'bg-green-500 text-white border-green-500'
      default:
        return 'bg-slate-400 text-white border-slate-400'
    }
  }

  const answeredCount = questionStatuses.filter(s => s === 'answered').length
  const notVisitedCount = questionStatuses.filter(s => s === 'not_visited').length

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      className="bg-white dark:bg-slate-800 rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl h-full flex flex-col backdrop-blur-sm"
      style={{
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
      }}
    >
      {/* Premium Header */}
      <motion.div 
        className="p-5 border-b border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/40 dark:via-slate-800/40 dark:to-slate-700/40 rounded-t-2xl"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1, duration: 0.4 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <motion.div 
              className="w-8 h-8 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg"
              whileHover={{ scale: 1.1, rotate: 5 }}
              transition={{ duration: 0.2 }}
            >
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </motion.div>
            <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Questions
            </h3>
          </div>
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            {answeredCount} / {totalQuestions}
          </motion.div>
        </div>
      </motion.div>

      {/* Premium Question Grid */}
      <motion.div 
        className="flex-1 p-5 overflow-y-auto min-h-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.4 }}
      >
        <div className="grid grid-cols-5 gap-3">
          {Array.from({ length: totalQuestions }).map((_, index) => {
            const isCurrent = index === currentIndex

            return (
              <motion.button
                key={index}
                onClick={() => onQuestionSelect(index)}
                className={`
                  relative w-14 h-14 rounded-xl border-2 transition-all duration-300 font-bold text-sm
                  ${getQuestionColor(index)}
                  ${isCurrent ? 'ring-3 ring-blue-500/50 dark:ring-blue-400/50 shadow-2xl scale-110' : 'hover:shadow-xl hover:scale-105'}
                  active:scale-95 backdrop-blur-sm
                `}
                whileHover={{ 
                  scale: isCurrent ? 1.15 : 1.08,
                  y: isCurrent ? -4 : -2,
                }}
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ 
                  opacity: 1, 
                  scale: isCurrent ? 1.1 : 1,
                }}
                transition={{ 
                  duration: 0.3, 
                  delay: index * 0.02,
                  ease: "easeOut"
                }}
                style={{
                  boxShadow: isCurrent 
                    ? '0 25px 50px -12px rgba(59, 130, 246, 0.5), 0 0 0 3px rgba(59, 130, 246, 0.4), inset 0 2px 0 rgba(255, 255, 255, 0.25)' 
                    : '0 10px 25px -8px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.12)',
                  zIndex: isCurrent ? 20 : 1
                }}
              >
                {index + 1}
              </motion.button>
            )
          })}
        </div>
      </motion.div>

      {/* Premium Status Legend */}
      <motion.div 
        className="p-5 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/30 dark:via-slate-800/30 dark:to-slate-700/30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        <div className="p-4 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-lg border border-slate-200/60 dark:border-slate-700/60 shadow-xl">
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-6 bg-green-500 rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{answeredCount}</span>
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-300">Answered</span>
              </div>
              
              <div className="flex items-center space-x-2">
                <div className="w-8 h-6 bg-blue-500 rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-white">1</span>
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-300">Current</span>
              </div>
            </div>
            
            <div className="space-y-1.5">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-6 bg-slate-400 rounded flex items-center justify-center">
                  <span className="text-sm font-bold text-white">{notVisitedCount}</span>
                </div>
                <span className="text-xs text-slate-700 dark:text-slate-300">Not Visited</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Preview Mode Notice */}
      <motion.div 
        className="p-5 border-t border-slate-200/60 dark:border-slate-700/60 bg-gradient-to-r from-slate-50 via-white to-slate-50 dark:from-slate-700/20 dark:via-slate-800/20 dark:to-slate-700/20 rounded-b-2xl"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4, duration: 0.4 }}
      >
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-xs text-blue-700 dark:text-blue-300 text-center font-semibold">
            📖 Preview Mode - Read Only
          </p>
        </div>
      </motion.div>
    </motion.div>
  )
}

