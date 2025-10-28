'use client'

import { useEffect, useState } from 'react'
import { Card } from '@/components/ui/card'
import { TrendingUp, ArrowUpDown, Clock, Search, Filter } from 'lucide-react'
import { Input } from '@/components/ui/input'
import type { EnhancedQuestionAnalytics } from '@/lib/actions/test-reports'
import { getEnhancedQuestionAnalytics } from '@/lib/actions/test-reports'

interface QuestionInsightsTabProps {
  testId: number
}

export function QuestionInsightsTab({ testId }: QuestionInsightsTabProps) {
  const [analytics, setAnalytics] = useState<EnhancedQuestionAnalytics[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [topicFilter, setTopicFilter] = useState<string>('all')
  const [difficultyFilter, setDifficultyFilter] = useState<string>('all')
  const [sortField, setSortField] = useState<keyof EnhancedQuestionAnalytics>('questionNumber')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc')

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const data = await getEnhancedQuestionAnalytics(testId)
      setAnalytics(data)
      setLoading(false)
    }
    fetchData()
  }, [testId])

  const handleSort = (field: keyof EnhancedQuestionAnalytics) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('asc')
    }
  }

  // Get unique topics and difficulties for filters
  const uniqueTopics = Array.from(new Set(analytics.map(q => q.topic)))
  const uniqueDifficulties = Array.from(new Set(analytics.map(q => q.difficulty).filter(Boolean)))

  // Filter and sort questions
  const filteredAndSortedQuestions = analytics
    .filter(q => {
      const matchesSearch = q.questionText.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesTopic = topicFilter === 'all' || q.topic === topicFilter
      const matchesDifficulty = difficultyFilter === 'all' || q.difficulty === difficultyFilter
      return matchesSearch && matchesTopic && matchesDifficulty
    })
    .sort((a, b) => {
      const aValue = a[sortField]
      const bValue = b[sortField]
      const direction = sortDirection === 'asc' ? 1 : -1
      
      if (typeof aValue === 'number' && typeof bValue === 'number') {
        return (aValue - bValue) * direction
      }
      return String(aValue).localeCompare(String(bValue)) * direction
    })

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-2 border-slate-200 border-t-slate-900 rounded-full animate-spin" />
      </div>
    )
  }

  const getDifficultyColor = (difficulty: string | null) => {
    if (!difficulty) return 'bg-slate-100 text-slate-600'
    if (difficulty === 'Easy') return 'bg-green-100 text-green-700'
    if (difficulty === 'Easy-Moderate') return 'bg-lime-100 text-lime-700'
    if (difficulty === 'Moderate') return 'bg-yellow-100 text-yellow-700'
    if (difficulty === 'Moderate-Hard') return 'bg-orange-100 text-orange-700'
    if (difficulty === 'Hard') return 'bg-red-100 text-red-700'
    return 'bg-slate-100 text-slate-600'
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${minutes}m ${secs}s`
  }

  return (
    <div className="space-y-6">
      {/* Filters and Search */}
      <Card className="p-4 border-slate-200 bg-white/60 backdrop-blur-sm">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search questions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
            >
              <option value="all">All Topics</option>
              {uniqueTopics.map(topic => (
                <option key={topic} value={topic}>{topic}</option>
              ))}
            </select>
            <select
              value={difficultyFilter}
              onChange={(e) => setDifficultyFilter(e.target.value)}
              className="px-3 py-2 border border-slate-200 rounded-md text-sm bg-white"
            >
              <option value="all">All Difficulties</option>
              {uniqueDifficulties.map(diff => (
                <option key={diff} value={diff}>{diff}</option>
              ))}
            </select>
          </div>
        </div>
      </Card>

      {/* Question Analytics Table */}
      <Card className="border-slate-200 bg-white/60 backdrop-blur-sm overflow-hidden">
        <div className="p-6 border-b border-slate-200">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-purple-50 border border-purple-200">
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">Question Performance Analysis</h3>
              <p className="text-sm text-slate-500">
                Showing {filteredAndSortedQuestions.length} of {analytics.length} questions
              </p>
            </div>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th 
                  onClick={() => handleSort('questionNumber')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Q#
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Question
                </th>
                <th 
                  onClick={() => handleSort('topic')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Topic
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('difficulty')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Difficulty
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th 
                  onClick={() => handleSort('correctnessPercentage')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    % Correct
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Incorrect
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Skipped
                </th>
                <th 
                  onClick={() => handleSort('averageTimeSeconds')}
                  className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider cursor-pointer hover:bg-slate-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    Avg Time (All)
                    <ArrowUpDown className="h-3 w-3" />
                  </div>
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Time (Correct)
                </th>
                <th className="px-4 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                  Time (Incorrect)
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredAndSortedQuestions.map((q) => (
                <tr key={q.questionId} className="hover:bg-slate-50/50 transition-colors">
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700">
                      {q.questionNumber}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div 
                      className="text-sm text-slate-900 max-w-xs truncate" 
                      title={q.questionText}
                    >
                      {q.questionText}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-xs text-slate-600">{q.topic}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(q.difficulty)}`}>
                      {q.difficulty || 'N/A'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div 
                          className={`h-full transition-all duration-300 ${
                            q.correctnessPercentage >= 70 ? 'bg-green-500' :
                            q.correctnessPercentage >= 40 ? 'bg-yellow-500' :
                            'bg-red-500'
                          }`}
                          style={{ width: `${q.correctnessPercentage}%` }}
                        />
                      </div>
                      <span className={`text-sm font-medium ${
                        q.correctnessPercentage >= 70 ? 'text-green-600' :
                        q.correctnessPercentage >= 40 ? 'text-yellow-600' :
                        'text-red-600'
                      }`}>
                        {q.correctnessPercentage.toFixed(1)}%
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{q.incorrectCount}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-slate-600">{q.unattemptedCount}</span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <div className="flex items-center gap-1.5 text-sm text-slate-600">
                      <Clock className="h-4 w-4" />
                      {formatTime(q.averageTimeSeconds)}
                    </div>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-green-600 font-medium">
                      {q.averageTimeCorrect > 0 ? formatTime(q.averageTimeCorrect) : '-'}
                    </span>
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap">
                    <span className="text-sm text-red-600 font-medium">
                      {q.averageTimeIncorrect > 0 ? formatTime(q.averageTimeIncorrect) : '-'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
        <p className="text-xs text-slate-600">
          <strong>Tip:</strong> Questions with low correctness % and high average time may need review. 
          Compare "Time (Correct)" vs "Time (Incorrect)" to identify if students are rushing or struggling.
          {/* Phase 2: Discrimination Index will be added here */}
        </p>
      </div>
    </div>
  )
}

