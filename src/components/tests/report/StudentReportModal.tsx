'use client'

import { useEffect, useState } from 'react'
import { Dialog, DialogContent } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { X, Trophy, Clock, Target, CheckCircle2, XCircle, Circle } from 'lucide-react'
import { getStudentAttemptDetails } from '@/lib/actions/test-reports'
import type { StudentAttemptDetails } from '@/lib/actions/test-reports'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface StudentReportModalProps {
  attemptId: number | null
  open: boolean
  onClose: () => void
}

export function StudentReportModal({ attemptId, open, onClose }: StudentReportModalProps) {
  const [details, setDetails] = useState<StudentAttemptDetails | null>(null)
  const [loading, setLoading] = useState(false)
  const [filter, setFilter] = useState<'all' | 'correct' | 'incorrect' | 'unattempted'>('all')

  useEffect(() => {
    if (attemptId && open) {
      const fetchDetails = async () => {
        setLoading(true)
        const data = await getStudentAttemptDetails(attemptId)
        setDetails(data)
        setLoading(false)
      }
      fetchDetails()
    }
  }, [attemptId, open])

  if (!open) return null

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  const filteredAnswers = details?.answers.filter(answer => {
    if (filter === 'all') return true
    if (filter === 'correct') return answer.isCorrect
    if (filter === 'incorrect') return !answer.isCorrect && answer.userAnswer !== null
    if (filter === 'unattempted') return answer.userAnswer === null
    return true
  }) || []

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[90vh] p-0 gap-0 overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
          </div>
        ) : details ? (
          <div className="flex flex-col h-full">
            {/* Header */}
            <div className="flex-shrink-0 px-6 py-4 border-b border-slate-200 bg-white">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{details.studentName}</h2>
                  <p className="text-sm text-slate-500">{details.studentEmail}</p>
                </div>
                <Button variant="ghost" size="icon" onClick={onClose}>
                  <X className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="flex-shrink-0 px-6 py-4 bg-slate-50 border-b border-slate-200">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                <div>
                  <div className="text-xs text-slate-500 mb-1">Rank</div>
                  <div className="flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-yellow-500" />
                    <span className="text-lg font-semibold text-slate-900">#{details.rank}</span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Score</div>
                  <div className="text-lg font-semibold text-slate-900">
                    {details.percentage.toFixed(1)}%
                  </div>
                  <div className="text-xs text-slate-500">{details.score} marks</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Percentile</div>
                  <div className="text-lg font-semibold text-blue-600">
                    {details.percentile.toFixed(1)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Accuracy</div>
                  <div className="flex items-center gap-2">
                    <Target className="h-4 w-4 text-green-500" />
                    <span className="text-lg font-semibold text-slate-900">
                      {details.accuracy.toFixed(1)}%
                    </span>
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 mb-1">Time Taken</div>
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-purple-500" />
                    <span className="text-lg font-semibold text-slate-900">
                      {formatTime(details.totalTime)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Answer Sheet - Tabbed View */}
            <div className="flex-1 overflow-y-auto p-6">
              <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)} className="space-y-4">
                <TabsList className="grid w-full max-w-2xl grid-cols-4 h-12 bg-slate-100/80 p-1">
                  <TabsTrigger value="all" className="h-10">
                    All ({details.answers.length})
                  </TabsTrigger>
                  <TabsTrigger value="correct" className="h-10 data-[state=active]:bg-green-50 data-[state=active]:text-green-700">
                    Correct ({details.totalCorrect})
                  </TabsTrigger>
                  <TabsTrigger value="incorrect" className="h-10 data-[state=active]:bg-red-50 data-[state=active]:text-red-700">
                    Incorrect ({details.totalIncorrect})
                  </TabsTrigger>
                  <TabsTrigger value="unattempted" className="h-10 data-[state=active]:bg-gray-50 data-[state=active]:text-gray-700">
                    Skipped ({details.totalSkipped})
                  </TabsTrigger>
                </TabsList>

                <div className="space-y-4">
                  {filteredAnswers.map((answer) => (
                    <Card key={answer.questionId} className="p-6 border-slate-200">
                      {/* Question Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-slate-100 text-slate-700 text-sm font-semibold">
                            {answer.questionNumber}
                          </span>
                          {answer.isCorrect ? (
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                          ) : answer.userAnswer === null ? (
                            <Circle className="h-5 w-5 text-slate-400" />
                          ) : (
                            <XCircle className="h-5 w-5 text-red-500" />
                          )}
                        </div>
                        <div className="flex items-center gap-4 text-xs text-slate-500">
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatTime(answer.timeSpent)}
                          </div>
                          <div className={`font-semibold ${
                            answer.marks > 0 ? 'text-green-600' :
                            answer.marks < 0 ? 'text-red-600' :
                            'text-slate-500'
                          }`}>
                            {answer.marks > 0 ? '+' : ''}{answer.marks}
                          </div>
                        </div>
                      </div>

                      {/* Question Text */}
                      <div className="mb-4 text-slate-900">
                        {answer.questionText}
                      </div>

                      {/* Options */}
                      <div className="space-y-2">
                        {Object.entries(answer.options).map(([key, value]) => {
                          const isUserAnswer = answer.userAnswer === key
                          const isCorrectAnswer = answer.correctAnswer === key
                          
                          return (
                            <div
                              key={key}
                              className={`p-3 rounded-lg border-2 transition-colors ${
                                isCorrectAnswer
                                  ? 'border-green-500 bg-green-50'
                                  : isUserAnswer
                                  ? 'border-red-500 bg-red-50'
                                  : 'border-slate-200 bg-white'
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                                  isCorrectAnswer
                                    ? 'bg-green-500 text-white'
                                    : isUserAnswer
                                    ? 'bg-red-500 text-white'
                                    : 'bg-slate-200 text-slate-600'
                                }`}>
                                  {key.toUpperCase()}
                                </div>
                                <div className="flex-1 text-sm text-slate-900">{value}</div>
                                {isCorrectAnswer && (
                                  <span className="text-xs font-medium text-green-600">✓ Correct</span>
                                )}
                                {isUserAnswer && !isCorrectAnswer && (
                                  <span className="text-xs font-medium text-red-600">✗ Your Answer</span>
                                )}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </Card>
                  ))}
                </div>
              </Tabs>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            <p className="text-slate-500">Unable to load student details</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

