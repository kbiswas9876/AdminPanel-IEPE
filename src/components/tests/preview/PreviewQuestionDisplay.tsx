'use client'

import { motion } from 'framer-motion'
import { UniversalContentRenderer } from '@/components/editors/UniversalContentRenderer'

interface Question {
  id?: number
  question_text: string
  options: Record<string, string>
  correct_option?: string
  difficulty?: string
}

interface PreviewQuestionDisplayProps {
  question: Question
  questionNumber: number
  totalQuestions: number
  userAnswer: string | null
  onAnswerChange?: (answer: string) => void
  isPreviewMode?: boolean
}

export default function PreviewQuestionDisplay({
  question,
  questionNumber,
  totalQuestions,
  userAnswer,
  onAnswerChange,
  isPreviewMode = true
}: PreviewQuestionDisplayProps) {
  const options = question.options || {}

  return (
    <div className="max-w-3xl mx-auto p-4 lg:p-6">
      {/* Premium Question Header */}
      <motion.div 
        className="flex items-center justify-between mb-4"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="flex items-center space-x-4">
          <motion.div 
            className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-4 py-2 rounded-xl font-bold text-sm shadow-lg"
            whileHover={{ scale: 1.05 }}
            transition={{ duration: 0.2 }}
          >
            Question {questionNumber} of {totalQuestions}
          </motion.div>
          
          {question.difficulty && (
            <motion.div 
              className={`px-4 py-2 rounded-xl text-sm font-bold shadow-md ${
                question.difficulty === 'Easy' ? 'bg-gradient-to-r from-green-500 to-green-600 text-white' :
                question.difficulty === 'Easy-Moderate' ? 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white' :
                question.difficulty === 'Moderate' ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white' :
                question.difficulty === 'Moderate-Hard' ? 'bg-gradient-to-r from-red-500 to-red-600 text-white' :
                'bg-gradient-to-r from-red-500 to-red-600 text-white'
              }`}
              whileHover={{ scale: 1.05 }}
              transition={{ duration: 0.2 }}
            >
              {question.difficulty}
            </motion.div>
          )}
        </div>

        {isPreviewMode && (
          <div className="px-3 py-1.5 bg-blue-100 text-blue-700 text-xs font-semibold rounded-lg border border-blue-200">
            Preview Mode
          </div>
        )}
      </motion.div>

      {/* Premium Question Text Card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white dark:bg-slate-800 rounded-xl border border-slate-200/60 dark:border-slate-700/60 p-6 mb-6 shadow-xl backdrop-blur-sm relative"
        style={{
          boxShadow: '0 15px 35px -10px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05), inset 0 1px 0 rgba(255, 255, 255, 0.1)'
        }}
      >
        <div className="prose prose-lg max-w-none dark:prose-invert">
          <UniversalContentRenderer 
            text={question.question_text}
          />
        </div>
        
        {/* Premium gradient overlay */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-blue-500/5 to-purple-500/5 pointer-events-none"></div>
      </motion.div>

      {/* Premium Options */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="space-y-3"
      >
        {Object.entries(options).map(([key, value], index) => (
          <motion.label
            key={key}
            className={`
              block p-4 rounded-xl border-2 transition-all duration-200 hover:shadow-md relative overflow-hidden
              ${userAnswer === key
                ? 'bg-gradient-to-r from-green-50 to-green-100 dark:from-green-900/50 dark:to-green-800/50 border-green-400 dark:border-green-500 shadow-md'
                : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 hover:border-green-300 dark:hover:border-green-600 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              }
              ${isPreviewMode ? 'cursor-default' : 'cursor-pointer'}
            `}
            whileHover={!isPreviewMode ? { 
              scale: 1.01,
              y: -1
            } : {}}
            whileTap={!isPreviewMode ? { scale: 0.99 } : {}}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ 
              duration: 0.4, 
              delay: 0.1 + index * 0.1,
              ease: "easeOut"
            }}
            style={{
              boxShadow: userAnswer === key 
                ? '0 10px 25px -8px rgba(34, 197, 94, 0.3), 0 0 0 1px rgba(34, 197, 94, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)' 
                : '0 4px 15px -6px rgba(0, 0, 0, 0.08), 0 0 0 1px rgba(0, 0, 0, 0.03)'
            }}
          >
            <div className="flex items-start space-x-3">
              <div className={`
                w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-all duration-300
                ${userAnswer === key
                  ? 'bg-gradient-to-r from-green-500 to-green-600 border-green-500 text-white shadow-md'
                  : 'border-slate-300 dark:border-slate-600 text-slate-600 dark:text-slate-400 hover:border-green-400 dark:hover:border-green-500'
                }
              `}>
                {userAnswer === key && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    className="w-2 h-2 bg-white rounded-full"
                  />
                )}
              </div>
              
              {!isPreviewMode && (
                <input
                  type="radio"
                  name="answer"
                  value={key}
                  checked={userAnswer === key}
                  onChange={(e) => onAnswerChange?.(e.target.value)}
                  className="sr-only"
                />
              )}
              
              <div className="flex-1 min-h-0">
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed text-lg">
                  <UniversalContentRenderer text={value} />
                </div>
              </div>
            </div>
            
            {/* Premium selection indicator */}
            {userAnswer === key && (
              <motion.div
                className="absolute top-0 right-0 w-0 h-0 border-l-[20px] border-l-transparent border-t-[20px] border-t-green-500"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: 'spring', stiffness: 400 }}
              />
            )}
            
            {/* Subtle gradient overlay */}
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent pointer-events-none"></div>
          </motion.label>
        ))}
      </motion.div>
    </div>
  )
}

