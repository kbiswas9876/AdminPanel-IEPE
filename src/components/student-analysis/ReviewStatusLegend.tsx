'use client'

import { motion } from 'framer-motion'

interface ReviewStatusLegendProps {
  correctCount: number
  incorrectCount: number
  skippedCount: number
  className?: string
}

export default function ReviewStatusLegend({
  correctCount,
  incorrectCount,
  skippedCount,
  className = ""
}: ReviewStatusLegendProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className={className}
    >
      <div className="grid grid-cols-3 gap-2">
        {/* Correct */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">{correctCount}</span>
          </div>
          <span className="text-xs text-slate-700 dark:text-slate-300">Correct</span>
        </div>

        {/* Incorrect */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-red-500 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">{incorrectCount}</span>
          </div>
          <span className="text-xs text-slate-700 dark:text-slate-300">Incorrect</span>
        </div>

        {/* Skipped */}
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 bg-slate-400 rounded-lg flex items-center justify-center">
            <span className="text-sm font-bold text-white">{skippedCount}</span>
          </div>
          <span className="text-xs text-slate-700 dark:text-slate-300">Skipped</span>
        </div>
      </div>
    </motion.div>
  )
}

